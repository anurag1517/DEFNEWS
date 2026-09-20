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
 * Handle Way Ahead AI Chatbot Request
 */
export async function handleWayAheadChat(params: PredictiveChatParams) {
    const { title, description, category = 'General', source = 'Verified Source', messages } = params;

    // 1. Fetch related historical articles from cache to inject context
    const relatedArticles = await findRelatedHistoricalArticles(title, category);

    // 2. Query Hugging Face LLM Inference Chatbot
    const hfResponse = await chatWithWayAheadAI({
        title,
        description,
        category,
        source,
        messages,
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
            relatedArticlesCount: relatedArticles.length
        };
    }

    // 3. Robust Rule-Based NLP Heuristic Fallback Answer if LLM is offline/rate-limited
    const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
    let fallbackReply = '';

    if (lastUserMsg.includes('implication')) {
        fallbackReply = `### ⚡ Strategic & Policy Implications Analysis

**Short-Term Implications (0–90 Days):**
- Immediate operational notice issuance and administrative review across relevant service departments.
- Financial market and industry compliance checks adjusting to initial policy directives.

**Long-Term Trajectory (6–24 Months):**
- Structural shift toward domestic capacity scaling and diminished reliance on foreign dependencies.
- Multi-quarter budget optimization and administrative integration.

> **Strategic Policy Impact:** High-priority development in **${category}**. Direct multi-year impact on national planning, sector resilience, and key stakeholder milestones.`;

    } else if (lastUserMsg.includes('past') || lastUserMsg.includes('history') || lastUserMsg.includes('occurred') || lastUserMsg.includes('antecedent')) {
        const relatedList = relatedArticles.length > 0
            ? relatedArticles.map((a, i) => `**${i + 1}. [${a.source}]** ${a.title} *(${new Date(a.publishedAt).toLocaleDateString()})*`).join('\n')
            : '*No direct prior matching stories found in current 48-hour feed archive.*';

        fallbackReply = `### 📜 Historical Context & Feed Archive Analysis

**Cross-Referenced Feed Findings:**
${relatedList}

**Historical Precedents & Macro Trends:**
- Historical analysis indicates this development aligns with broader policy trajectories in **${category}**.
- Recent reporting patterns build upon previous administrative updates, reinforcing long-term strategic objectives.`;

    } else if (lastUserMsg.includes('scenario') || lastUserMsg.includes('baseline') || lastUserMsg.includes('risk') || lastUserMsg.includes('upside')) {
        fallbackReply = `### 📊 Scenario Forecast Matrix

- **Baseline Scenario (Expected):** Planned policy outlay targets met on schedule with steady administrative execution.
- **Upside / Best Case:** Accelerated inter-agency cooperation enables milestone completion 2–3 months ahead of schedule.
- **Risk / Challenge:** Global supply chain friction or bureaucratic delays could slow mid-term rollouts by 30–60 days.`;

    } else {
        fallbackReply = `### 🚀 Way Ahead & Multi-Stage Roadmap

**Phase 01: Immediate Phase (0–30 Days)**
- Directive issuance, RFI/RFQ tenders, and emergency procurement alignment.
- Inter-ministerial oversight committee formation.

**Phase 02: Mid-Term Trajectory (1–6 Months)**
- Contract awards, CapEx spending, and operational setup.
- Integration testing and regional trial deployments.

**Phase 03: Long-Term Impact (6–24 Months)**
- Strategic self-reliance, metric stabilization, and policy replication across regional administrative frameworks.`;
    }

    return {
        success: true,
        reply: fallbackReply,
        modelUsed: 'NLP Hybrid Heuristic Engine',
        relatedArticlesCount: relatedArticles.length
    };
}
