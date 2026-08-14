import { createClient } from 'redis';
import Parser from 'rss-parser';
import { NewsItem } from '../types';
import { env } from '../config/env';
import { CATEGORY_KEYWORDS } from '../config/mapperRules';

const parser = new Parser();
const REDIS_KEY = 'defnews:articles';

// Redis Client with fallback
let redisClient: ReturnType<typeof createClient> | null = null;
let memoryCache: NewsItem[] = [];

export async function initRedis() {
    try {
        redisClient = createClient({ url: env.redisUrl });
        redisClient.on('error', (err) => console.error('Redis Client Error', err));
        await redisClient.connect();
        console.log('Connected to Redis successfully');
    } catch (err) {
        console.warn('Could not connect to Redis. Using in-memory fallback.', err);
        redisClient = null;
    }
}

function determineCategory(title: string, snippet: string): NewsItem['category'] {
    const text = `${title} ${snippet}`.toLowerCase();

    let bestCategory: NewsItem['category'] = 'trending';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (category === 'trending') continue;

        let matches = 0;
        for (const kw of keywords) {
            if (text.includes(kw)) {
                matches++;
            }
        }

        if (matches > maxMatches) {
            maxMatches = matches;
            bestCategory = category as NewsItem['category'];
        }
    }

    return bestCategory;
}

function parseMalformedRSS(xml: string): any[] {
    const items: any[] = [];
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g);
    if (!itemMatches) return items;

    for (const itemXml of itemMatches) {
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
        const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';

        const cleanText = (str: string) => {
            return str
                .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
                .trim();
        };

        items.push({
            title: cleanText(title),
            contentSnippet: cleanText(description),
            link: cleanText(link),
            pubDate: cleanText(pubDate)
        });
    }
    return items;
}

async function fetchRSS(url: string, sourceName: string, defaultCategory: NewsItem['category']): Promise<NewsItem[]> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`Status code ${response.status}`);
        }
        const xmlText = await response.text();

        let items: any[] = [];
        try {
            const feed = await parser.parseString(xmlText);
            items = feed.items;
        } catch (parseError: any) {
            console.warn(`Strict XML parsing failed for ${sourceName}, falling back to regex parser:`, parseError.message);
            items = parseMalformedRSS(xmlText);
        }

        return items.map((item, index) => {
            const snippet = item.contentSnippet || item.content || '';
            const category = determineCategory(item.title || '', snippet);

            return {
                id: item.guid || item.link || `${sourceName}-${index}-${Date.now()}`,
                title: item.title || 'Untitled Article',
                description: snippet || 'No description available.',
                source: sourceName,
                isTrusted: sourceName === 'PIB',
                category: category === 'trending' ? defaultCategory : category,
                publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                url: item.link || '#',
                imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'
            };
        });
    } catch (err) {
        console.error(`Failed to fetch RSS from ${sourceName}:`, err);
        return [];
    }
}

export async function scrapeAndCacheNews(): Promise<NewsItem[]> {
    console.log('Ingesting latest news stories...');
    const pibNews = await fetchRSS(env.pibFeedUrl, 'PIB', 'national');
    const googleNews = await fetchRSS(env.googleNewsFeedUrl, 'Google News India', 'trending');
    const ndtvNews = await fetchRSS(env.ndtvFeedUrl, 'NDTV', 'trending');
    const altNews = await fetchRSS(env.altNewsFeedUrl, 'Alt News Fact Check', 'trending');
    const googleTrends = await fetchRSS(env.googleTrendsFeedUrl, 'Google Trends India', 'trending');

    // Combine and deduplicate
    const combined = [...pibNews, ...googleNews, ...ndtvNews, ...altNews, ...googleTrends];
    const uniqueMap = new Map<string, NewsItem>();
    combined.forEach(item => uniqueMap.set(item.url, item));
    const uniqueArticles = Array.from(uniqueMap.values());

    // Cache results
    memoryCache = uniqueArticles;
    if (redisClient && redisClient.isOpen) {
        await redisClient.set(REDIS_KEY, JSON.stringify(uniqueArticles));
        console.log('Cached news in Redis.');
    } else {
        console.log('Cached news in local memory.');
    }

    return uniqueArticles;
}

export async function getCachedNews(): Promise<NewsItem[]> {
    if (redisClient && redisClient.isOpen) {
        const cached = await redisClient.get(REDIS_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    }
    return memoryCache;
}
