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

export interface WayAheadStage {
    phase: string;               // e.g. "Immediate Phase (0–30 Days)", "Mid-Term Trajectory (1–6 Months)", "Long-Term Impact (6–24 Months)"
    timeline: string;            // e.g. "0-30 Days", "1-6 Months", "6-24 Months"
    title: string;               // Brief phase title
    description: string;         // Detailed NLP prediction for this phase
    actionablePoints: string[];  // Key concrete outcomes expected
}

export interface WayAheadInfo {
    summarySoFar: {
        headline: string;
        overview: string;
        keyFacts: string[];
        keyEntities: string[];
    };
    wayAhead: {
        domain: string;
        forecastSummary: string;
        stages: WayAheadStage[];
        keyMilestones: string[];
        potentialScenarios: {
            baseline: string;
            opportunity: string;
            risk: string;
        };
        nlpConfidence: number;      // 0-100
    };
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
    wayAhead?: WayAheadInfo;
};

