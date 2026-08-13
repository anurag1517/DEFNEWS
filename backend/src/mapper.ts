import { NewsItem } from './index';


export interface RawNewsApiArticle {
    uri: string;
    title: string;
    body?: string;
    source?: {
        uri: string;
        title: string;
        dataType?: string;
    };
    dateTime?: string;
    url?: string;
    image?: string;
    categories?: Array<{ label: string; uri: string }>;
}

export function mapNewsApiArticleToNewsItem(raw: RawNewsApiArticle): NewsItem {
    const resolveCategory = (rawCategories?: Array<{ label: string }>): NewsItem['category'] => {
        if (!rawCategories || rawCategories.length === 0) return 'trending';

        const label = rawCategories[0].label.toLowerCase();

        if (label.includes('business') || label.includes('finance') || label.includes('economy')) return 'business';
        if (label.includes('tech') || label.includes('software') || label.includes('ai')) return 'technology';
        if (label.includes('defence') || label.includes('military') || label.includes('army')) return 'Defence';
        if (label.includes('world') || label.includes('global') || label.includes('international')) return 'international';
        if (label.includes('national') || label.includes('domestic') || label.includes('government')) return 'national';

        return 'trending';
    };

    return {
        id: raw.uri || crypto.randomUUID(),
        title: raw.title || 'Untitled Article',
        // Truncate body or description safely if it's too long
        description: raw.body ? `${raw.body.substring(0, 160)}...` : 'No description available.',
        source: raw.source?.title || 'Unknown Source',
        // Example logic for trust status (e.g., verified or well-known database source)
        isTrusted: Boolean(raw.source?.title),
        category: resolveCategory(raw.categories),
        publishedAt: raw.dateTime || new Date().toISOString(),
        url: raw.url || '#',
        imageUrl: raw.image || 'https://via.placeholder.com/600x400?text=NewsFlash',
    };
}