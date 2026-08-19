export interface VeracityBreakdown {
    sourceAuthority: number;
    crossVerification: number;
    contentAnalysis: number;
}

export interface VeracityInfo {
    score: number;
    label: 'Verified Authentic' | 'Likely Real' | 'Unverified / Developing' | 'Suspicious / Disputed';
    breakdown: VeracityBreakdown;
    explanation: string;
}

export interface IncidentOriginInfo {
    originDate: string;
    formattedOriginDate: string;
    publishedDate: string;
    latencyDays: number;
    latencyLabel: string;
    confidence: 'extracted' | 'cluster_earliest' | 'published_date';
}

export interface BiasInfo {
    leaning: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
    score: number;                // -100 (Far Left) to 0 (Center/Neutral) to +100 (Far Right)
    label: string;                // e.g. "Left / Progressive", "Center / Balanced", "Right / Nationalist"
    sourceType: 'wire' | 'public_broadcaster' | 'mainstream_media' | 'independent_journalist' | 'youtube_creator' | 'fact_checker';
    description?: string;
    twitterHandle?: string;
    youtubeChannel?: string;
}

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
    veracity?: VeracityInfo;
    incidentOrigin?: IncidentOriginInfo;
    bias?: BiasInfo;
}

export interface NewsFeedProps {
    currentCategory: string;
}
