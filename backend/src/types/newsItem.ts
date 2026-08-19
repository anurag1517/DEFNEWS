export interface VeracityBreakdown {
    sourceAuthority: number;      // 0-100 score based on publisher credibility
    crossVerification: number;    // 0-100 score based on multi-source confirmation
    contentAnalysis: number;      // 0-100 score based on language, fact-check tags, and lack of clickbait
}

export interface VeracityInfo {
    score: number;                // Overall veracity percentage (0-100)
    label: 'Verified Authentic' | 'Likely Real' | 'Unverified / Developing' | 'Suspicious / Disputed';
    breakdown: VeracityBreakdown;
    explanation: string;
}

export interface IncidentOriginInfo {
    originDate: string;           // ISO 8601 string of the detected event/incident date
    formattedOriginDate: string;  // Human-readable formatted date e.g. "Aug 14, 2026"
    publishedDate: string;        // ISO 8601 string of the article publication date
    latencyDays: number;          // Days between incident occurrence and article publication
    latencyLabel: string;         // e.g. "Occurred 2 days before reporting", "Same day incident", "Historical archive"
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
    veracity?: VeracityInfo;
    incidentOrigin?: IncidentOriginInfo;
    bias?: BiasInfo;
};
