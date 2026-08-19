import { NewsItem, BiasInfo } from '../types/newsItem';
import { lookupSourceProfile } from '../config/biasRegistry';

/**
  * Evaluates and attaches bias & ideological alignment metadata to a news item.
  */
export function evaluateArticleBias(article: { source: string; title: string; description: string }): BiasInfo {
    const profile = lookupSourceProfile(article.source, `${article.title} ${article.description}`);

    return {
        leaning: profile.bias,
        score: profile.score,
        label: profile.label,
        sourceType: profile.sourceType,
        description: profile.description,
        twitterHandle: profile.twitterHandle,
        youtubeChannel: profile.youtubeChannel
    };
}

/**
 * Enriches a collection of news items with ideological alignment data.
 */
export function enrichNewsWithBias(articles: NewsItem[]): NewsItem[] {
    return articles.map(article => {
        const bias = evaluateArticleBias(article);
        return {
            ...article,
            bias
        };
    });
}
