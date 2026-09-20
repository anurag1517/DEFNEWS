import { env } from '../config/env';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatPayload {
    title: string;
    description: string;
    category?: string;
    source?: string;
    messages: ChatMessage[];
    relatedArticles?: Array<{ title: string; source: string; publishedAt: string; description: string }>;
}

/**
 * Interactive Conversational Chat with Hugging Face LLM
 */
export async function chatWithWayAheadAI(payload: ChatPayload): Promise<{ content: string; modelUsed: string } | null> {
    const { title, description, category = 'General', source = 'Verified Source', messages, relatedArticles = [] } = payload;

    const relatedText = relatedArticles.length > 0
        ? relatedArticles.map((a, i) => `${i + 1}. [${a.source}] ${a.title} (${new Date(a.publishedAt).toLocaleDateString()}) - ${a.description.slice(0, 120)}`).join('\n')
        : 'No direct historical prior stories detected in recent feed archive.';

    const systemPrompt = `You are SATARK AI, an elite Geopolitical, Economic, and National Security Strategic Intelligence Chatbot.
You are assisting the user in analyzing a specific news story.

Target News Context:
- Headline: "${title}"
- Source: ${source} | Category: ${category}
- Summary: ${description}

Cross-Referenced Historical Feed Archive:
${relatedText}

Guidelines:
1. Provide concise, clear, and structured answers formatted using Markdown (bolding, bullet points, headers).
2. When asked about "Way Ahead" or "Roadmap", structure your response into multi-phase timelines (Immediate: 0–30 Days, Mid-Term: 1–6 Months, Long-Term: 6–24 Months).
3. When asked about "Implications", break down short-term operational impacts, long-term structural shifts, and strategic national/global policy impact.
4. When asked about "Historical Context" or "Past Events", reference prior related stories from the feed archive or historical domain precedents.
5. Keep your tone objective, professional, and strategic. Avoid unnecessary conversational fluff.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000); // 14s timeout

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (env.hfToken) {
            headers['Authorization'] = `Bearer ${env.hfToken}`;
        }

        const model = env.hfModel;
        const url = 'https://router.huggingface.co/together/v1/chat/completions';

        const conversation = [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content }))
        ];

        const response = await fetch(url, {
            method: 'POST',
            headers,
            signal: controller.signal,
            body: JSON.stringify({
                model,
                messages: conversation,
                temperature: 0.2,
                max_tokens: 1200
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text();
            console.warn(`[HF API Chat Warning] Status ${response.status}: ${errText}`);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.warn('[HF API Chat Warning] Empty response content from LLM.');
            return null;
        }

        const modelLabel = env.hfToken
            ? `Hugging Face (${env.hfModel.split('/')[1] || env.hfModel})`
            : `Hugging Face Open Inference`;

        return { content, modelUsed: modelLabel };
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            console.warn('[HF API Chat Warning] Hugging Face Inference API timed out.');
        } else {
            console.warn('[HF API Chat Error]:', err.message || err);
        }
        return null;
    }
}