import Parser from 'rss-parser';
import { getCachedNews } from './news.service';
import { chatWithWayAheadAI, ChatMessage } from './hfInference.service';
import { NewsItem } from '../types/newsItem';

export interface PredictiveChatParams {
    title: string;
    description: string;
    category?: string;
    source?: string;
    messages: ChatMessage[];
}

export interface WebSearchResult {
    title: string;
    source: string;
    publishedAt: string;
    snippet: string;
    link?: string;
}

const webSearchParser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
});

/**
 * Perform live web search using Google News RSS search feed
 */
async function performWebSearch(query: string): Promise<WebSearchResult[]> {
    try {
        const cleanQuery = query
            .replace(/[^\w\s]/gi, ' ')
            .trim()
            .split(/\s+/)
            .filter(w => w.length > 2)
            .slice(0, 7)
            .join(' ');

        if (!cleanQuery) return [];

        const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery)}&hl=en-IN&gl=IN&ceid=IN:en`;
        const feed = await webSearchParser.parseURL(searchUrl);

        if (!feed.items || feed.items.length === 0) return [];

        return feed.items.slice(0, 5).map(item => {
            const parts = (item.title || '').split(' - ');
            const title = parts.length > 1 ? parts.slice(0, -1).join(' - ') : item.title || '';
            const source = parts.length > 1 ? parts[parts.length - 1] : 'News Report';
            const snippet = item.contentSnippet || item.content || item.summary || '';

            return {
                title: title.trim(),
                source: source.trim(),
                publishedAt: item.pubDate || new Date().toISOString(),
                snippet: snippet.replace(/<[^>]*>/g, '').slice(0, 200).trim(),
                link: item.link
            };
        });
    } catch (err: any) {
        console.warn('[Web Search Warning] Live search skipped or unavailable:', err?.message || err);
        return [];
    }
}

/**
 * Search cached articles for prior related news in feed history
 */
async function findRelatedHistoricalArticles(title: string, category?: string): Promise<NewsItem[]> {
    try {
        const cached = await getCachedNews();
        if (!cached || cached.length === 0) return [];

        const keywords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const matches = cached.filter(article => {
            if (article.title === title) return false;
            const articleText = `${article.title} ${article.description}`.toLowerCase();
            const keywordMatches = keywords.filter(kw => articleText.includes(kw)).length;
            return keywordMatches >= 2 || (category && article.category === category);
        });

        return matches.slice(0, 4);
    } catch {
        return [];
    }
}

/**
 * Check if a query is off-topic (coding, programming, prompt extraction, etc.)
 */
function isQueryOffTopic(query: string): boolean {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return false;

    // Explicitly allow legitimate news exploration, pre-prompts, and analysis intents
    const allowedNewsIntents = [
        'way ahead', 'strategic roadmap', 'roadmap', 'implications', 'implication',
        'background and context', 'background', 'context', 'risk outlook', 'scenarios',
        'scenario', 'news story', 'this story', 'this news', 'this development',
        'this article', 'historical context', 'precedent', 'precedents', 'future'
    ];
    if (allowedNewsIntents.some(phrase => trimmed.includes(phrase))) {
        return false;
    }

    // Precise patterns for coding/software generation, prompt injections, and entertainment requests
    const strictOffTopicRegexes = [
        // Code writing / software generation / debugging requests
        /\b(write|create|debug|fix|compile|run|generate)\s+([a-z\s]+)?(code|script|software|app|function|algorithm|class|regex)\b/i,
        /\b(write|generate)\s+(a\s+)?(python|javascript|typescript|java|c\+\+|html|css|sql|bash)\b/i,
        /\b(python|javascript|typescript|java|c\+\+|golang|rust|html|css)\s+(code|script|syntax|implementation)\b/i,

        // System prompt and instruction extraction / jailbreaks
        /\b(system prompt|your instructions|ignore previous instructions?|ignore above|forget your rules?)\b/i,
        /\b(pretend you are|pretend to be|act as a|roleplay as|jailbreak)\b/i,
        /\b(api key|source code of this (app|backend)|sql injection|payload)\b/i,

        // Creative writing / homework / entertainment requests
        /\b(write (me )?(a )?(poem|poetry|fiction|novel|short story|creative writing))\b/i,
        /\b(tell (me )?(a )?(joke|riddle|funny story))\b/i,
        /\b(write (me )?(a )?song|sing a song)\b/i,
        /\b(recipe for|how to cook|bake a cake|ingredients for)\b/i,
        /\b(dating advice|relationship advice|pick ?up lines?)\b/i,
        /\b(do my homework|solve this math|solve (the )?equation|calculate \d+)\b/i,
        /\b(movie recommendation|video game recommendation)\b/i,
        /\b(who (made|created|programmed) you|what is your system prompt|what model are you)\b/i
    ];

    return strictOffTopicRegexes.some(regex => regex.test(trimmed));
}

/**
 * Handle Way Ahead AI Chatbot Request
 */
export async function handleWayAheadChat(params: PredictiveChatParams) {
    const { title, description, category = 'General', source = 'Verified Source', messages } = params;

    const lastUserMsg = messages[messages.length - 1]?.content || '';

    // Guardrail: check for off-topic queries immediately
    if (isQueryOffTopic(lastUserMsg)) {
        return {
            success: true,
            reply: `I am a news intelligence chatbot. I can only assist with news analysis, current affairs, and forward-looking developments related to this story. Please ask something related to the news.`,
            modelUsed: 'News Topic Guard',
            webSearchCount: 0
        };
    }

    // 1. Live Web Search & Feed History in Parallel
    const searchQuery = `${title} ${lastUserMsg}`;
    const [webSearchResults, relatedArticles] = await Promise.all([
        performWebSearch(searchQuery),
        findRelatedHistoricalArticles(title, category)
    ]);

    // 2. Query LLM Chatbot with Web Search & News Context
    const hfResponse = await chatWithWayAheadAI({
        title,
        description,
        category,
        source,
        messages,
        webSearchResults,
        relatedArticles: relatedArticles.map(a => ({
            title: a.title,
            source: a.source,
            publishedAt: a.publishedAt,
            description: a.description
        }))
    });

    if (hfResponse && hfResponse.content) {
        return {
            success: true,
            reply: hfResponse.content,
            modelUsed: hfResponse.modelUsed,
            webSearchCount: webSearchResults.length,
            relatedArticlesCount: relatedArticles.length
        };
    }

    // 3. Fallback Reasoning Engine if LLM is temporarily unreachable
    console.warn('[AUDIT] Hugging Face chat model was unavailable or failed. Activating deterministic fallback reasoning engine.');
    const lowerUserMsg = lastUserMsg.toLowerCase();
    let fallbackReply = '';

    const webCitations = webSearchResults.length > 0
        ? `\n\n**Latest Web Search Context:**\n` + webSearchResults.slice(0, 3).map((r, i) => `- **[${r.source}]** ${r.title}`).join('\n')
        : '';

    if (lowerUserMsg.includes('implication') || lowerUserMsg.includes('impact')) {
        fallbackReply = `### ⚡ Strategic Implications & Policy Impact

**Short-Term Implications (0–90 Days):**
- Immediate administrative action, operational reviews, and stakeholder compliance.
- Sector-specific regulatory assessments and initial financial/market adjustments.

**Long-Term Trajectory (6–24 Months):**
- Structural modernization, institutional capacity building, and reduced foreign dependencies.
- Multi-quarter budget allocations and sustainable policy integration.${webCitations}`;

    } else if (lowerUserMsg.includes('past') || lowerUserMsg.includes('history') || lowerUserMsg.includes('context')) {
        const relatedList = relatedArticles.length > 0
            ? relatedArticles.map((a, i) => `- **[${a.source}]** ${a.title} *(${new Date(a.publishedAt).toLocaleDateString()})*`).join('\n')
            : '- *No identical prior stories detected in recent archive.*';

        fallbackReply = `### 📜 Historical Context & Related Developments

**Prior Related Reporting:**
${relatedList}

**Historical Precedents:**
- This development builds upon foundational policy steps initiated in **${category}** over recent quarters.
- Continuity across administrative initiatives shows deliberate alignment with long-term strategic goals.${webCitations}`;

    } else if (lowerUserMsg.includes('scenario') || lowerUserMsg.includes('risk') || lowerUserMsg.includes('future')) {
        fallbackReply = `### 📊 Scenario & Risk Matrix

- **Baseline Scenario (Expected):** Planned milestones proceed according to official timelines with phased execution.
- **Upside Potential:** Fast-tracked approvals and inter-agency coordination advance key deliverables ahead of target dates.
- **Key Risks to Monitor:** Bureaucratic friction or external macroeconomic/geopolitical disruptions could introduce scheduling adjustments.${webCitations}`;

    } else {
        fallbackReply = `### 🚀 Way Ahead & Strategic Roadmap

**Phase 1: Immediate Steps (0–30 Days)**
- Official announcements, inter-agency coordination, and preliminary technical/regulatory reviews.
- Stakeholder consultation and public notices.

**Phase 2: Operational Rollout (1–6 Months)**
- Programmatic rollout, resource allocation, and initial execution milestones.
- Periodic review by supervisory committees.

**Phase 3: Long-Term Outlook (6–24 Months)**
- Institutionalization of key reforms and sector-wide capacity enhancements.
- Measurable outcomes evaluating policy effectiveness.${webCitations}`;
    }

    return {
        success: true,
        reply: fallbackReply,
        modelUsed: 'News Reasoning Engine',
        webSearchCount: webSearchResults.length,
        relatedArticlesCount: relatedArticles.length
    };
}
