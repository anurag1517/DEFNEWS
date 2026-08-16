import { createClient } from 'redis';
import Parser from 'rss-parser';
import { NewsItem } from '../types';
import { env } from '../config/env';
import { CATEGORY_KEYWORDS } from '../config/mapperRules';
import { TRUSTED_SOURCES } from '../config/trustedSource';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['content:encoded', 'contentEncoded']
        ]
    }
});
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

const CATEGORY_FALLBACK_IMAGES: Record<NewsItem['category'], string> = {
    Defence: 'https://images.unsplash.com/photo-1579912437766-7892db633c3f?auto=format&fit=crop&q=80&w=800',
    technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    national: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=800',
    international: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800',
    trending: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'
};

function isGenericGoogleImage(imgUrl: string): boolean {
    if (!imgUrl) return true;
    const lower = imgUrl.toLowerCase();
    return (
        lower.includes('googleusercontent.com') ||
        lower.includes('news.google.com') ||
        lower.includes('gstatic.com') ||
        lower.includes('google.com') ||
        lower.includes('google_news')
    );
}

function extractImage(item: any, category: NewsItem['category'] = 'trending'): string {
    // 1. Check enclosure tag
    if (item.enclosure?.url && !isGenericGoogleImage(item.enclosure.url)) {
        return item.enclosure.url;
    }

    // 2. Check regex parsed mediaUrl
    if (item.mediaUrl && !isGenericGoogleImage(item.mediaUrl)) {
        return item.mediaUrl;
    }

    // 3. Check custom mapped fields
    if (item.mediaContent?.$?.url && !isGenericGoogleImage(item.mediaContent.$.url)) {
        return item.mediaContent.$.url;
    }
    if (item.mediaThumbnail?.$?.url && !isGenericGoogleImage(item.mediaThumbnail.$.url)) {
        return item.mediaThumbnail.$.url;
    }

    // 4. Check raw namespaced properties
    const rawMedia = item['media:content'] || item['media:thumbnail'];
    if (rawMedia?.$?.url && !isGenericGoogleImage(rawMedia.$.url)) {
        return rawMedia.$.url;
    }
    if (rawMedia?.url && !isGenericGoogleImage(rawMedia.url)) {
        return rawMedia.url;
    }

    // 5. Scan HTML description/content (including contentEncoded) for <img> tags
    const html = `${item.content || ''} ${item.description || ''} ${item.contentSnippet || ''} ${item.contentEncoded || ''}`;
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
    const match = html.match(imgRegex);
    if (match && match[1] && !isGenericGoogleImage(match[1])) {
        return match[1];
    }

    // 6. Category specific fallback
    return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.trending;
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

        // Extract media url attribute using regex
        const mediaUrl = itemXml.match(/<(enclosure|media:content|media:thumbnail)[^>]+url=["']([^"']+)["']/i)?.[2] || '';

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
            pubDate: cleanText(pubDate),
            mediaUrl: cleanText(mediaUrl)
        });
    }
    return items;
}

async function fetchOgImage(url: string, depth = 0): Promise<string | null> {
    if (depth > 2 || !url || !url.startsWith('http')) return null;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            redirect: 'follow'
        });
        if (!response.ok) return null;

        const finalUrl = response.url || url;
        const html = await response.text();

        // If Google News redirect wrapper, try to locate original publisher link in canonical tag or anchor tag
        if (finalUrl.includes('news.google.com') || finalUrl.includes('google.com')) {
            const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                                  html.match(/<a[^>]+href=["'](https?:\/\/(?!news\.google\.com|www\.google\.com|play\.google\.com)[^"']+)["']/i);

            if (canonicalMatch && canonicalMatch[1] && canonicalMatch[1] !== url) {
                const publisherOg = await fetchOgImage(canonicalMatch[1], depth + 1);
                if (publisherOg && !isGenericGoogleImage(publisherOg)) {
                    return publisherOg;
                }
            }
        }

        const ogImageMatch =
            html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
            html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

        const extracted = ogImageMatch ? ogImageMatch[1] : null;

        if (extracted && !isGenericGoogleImage(extracted)) {
            return extracted;
        }

        return null;
    } catch {
        return null;
    }
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

        return await Promise.all(items.map(async (item, index) => {
            const snippet = item.contentSnippet || item.content || '';
            const category = determineCategory(item.title || 'trending', snippet);
            const finalCategory = category === 'trending' ? defaultCategory : category;
            let imageUrl = extractImage(item, finalCategory);

            if ((imageUrl.includes('unsplash.com') || isGenericGoogleImage(imageUrl)) && item.link && item.link.startsWith('http')) {
                const ogImg = await fetchOgImage(item.link);
                if (ogImg) {
                    imageUrl = ogImg;
                }
            }

            return {
                id: item.guid || item.link || `${sourceName}-${index}-${Date.now()}`,
                title: item.title || 'Untitled Article',
                description: snippet || 'No description available.',
                source: sourceName,
                isTrusted: TRUSTED_SOURCES.has(sourceName),
                category: finalCategory,
                publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                url: item.link || '#',
                imageUrl: imageUrl
            };
        }));
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
