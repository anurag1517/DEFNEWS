export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    source: string;
    isTrusted: boolean;
    category: string;
    publishedAt: string;
    url: string;
    imageUrl: string;
}

export interface NewsFeedProps {
    currentCategory: string;
}