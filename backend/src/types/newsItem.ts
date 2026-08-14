export type NewsItem = {
    id: string;
    title: string;
    description: string;
    source: string;
    isTrusted: boolean;
    category: 'trending' | 'national' | 'international' | 'business' | 'technology' | 'Defence';
    publishedAt: string;
    url: string;
    imageUrl: string;
}