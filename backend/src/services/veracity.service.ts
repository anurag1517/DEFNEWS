import { NewsItem, VeracityInfo, VeracityBreakdown, IncidentOriginInfo } from '../types/newsItem';

// Authority score map for authentic and recognized sources (0 - 100)
const SOURCE_AUTHORITY_MAP: Record<string, number> = {
    'pib': 98,
    'press information bureau': 98,
    'doordarshan': 98,
    'dd news': 98,
    'dd india': 98,
    'pti': 96,
    'press trust of india': 96,
    'reuters': 96,
    'ani': 94,
    'asian news international': 94,
    'alt news': 95,
    'alt news fact check': 95,
    'the hindu': 94,
    'the indian express': 92,
    'indian express': 92,
    'bbc': 93,
    'bbc news': 93,
    'bbc news india': 93,
    'wion': 90,
    'firstpost': 88,
    'ndtv': 88,
    'ndtv news': 88,
    'hindustan times': 86,
    'livemint': 88,
    'mint': 88,
    'the print': 86,
    'scroll.in': 84,
    'the wire': 84,
    'times of india': 82,
    'economic times': 88,
    'business standard': 88,
    'google news india': 78,
    'google news': 76,
    'google trends india': 68,
    'google trends': 65
};

// Suffix or embedded source detections (e.g. "Headline - The Hindu")
const EMBEDDED_SOURCE_PATTERNS: Array<{ pattern: RegExp; name: string; score: number }> = [
    { pattern: /\b(?:doordarshan|dd news|dd india)\b/i, name: 'DD News', score: 98 },
    { pattern: /\bpib\b/i, name: 'PIB', score: 98 },
    { pattern: /\bpti\b/i, name: 'PTI', score: 96 },
    { pattern: /\breuters\b/i, name: 'Reuters', score: 96 },
    { pattern: /\bani\b/i, name: 'ANI', score: 94 },
    { pattern: /\bthe hindu\b/i, name: 'The Hindu', score: 94 },
    { pattern: /\b(?:indian express|the indian express)\b/i, name: 'Indian Express', score: 92 },
    { pattern: /\b(?:bbc|bbc news)\b/i, name: 'BBC News', score: 93 },
    { pattern: /\bwion\b/i, name: 'WION', score: 90 },
    { pattern: /\bfirstpost\b/i, name: 'Firstpost', score: 88 },
    { pattern: /\bndtv\b/i, name: 'NDTV', score: 88 },
    { pattern: /\bhindustan times\b/i, name: 'Hindustan Times', score: 86 },
    { pattern: /\b(?:livemint|mint)\b/i, name: 'Livemint', score: 88 },
    { pattern: /\balt news\b/i, name: 'Alt News', score: 95 }
];

const SENSATIONAL_WORDS = [
    'shocking', 'unbelievable', 'you won\'t believe', 'viral leak', 'mindblowing',
    'exposed', 'secret tape', 'conspiracy', 'miracle cure', 'bombshell secret',
    'destroy', 'blasts', 'slams', 'furious'
];

const OFFICIAL_MARKERS = [
    'ministry', 'department', 'government', 'spokesperson', 'official statement',
    'press release', 'signed mou', 'cabinet', 'defence', 'drdo', 'isro', 'army',
    'navy', 'air force', 'rbi', 'supreme court', 'high court', 'treaty', 'bilateral'
];

const STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will',
    'with', 'says', 'said', 'after', 'over', 'new', 'india', 'news'
]);

/**
 * Calculates the source authority score based on publisher name and embedded credits.
 */
export function calculateSourceAuthority(source: string, title: string, description: string): number {
    const cleanSource = (source || '').trim().toLowerCase();

    // Direct match
    if (SOURCE_AUTHORITY_MAP[cleanSource]) {
        return SOURCE_AUTHORITY_MAP[cleanSource];
    }

    // Partial match in source name
    for (const [key, score] of Object.entries(SOURCE_AUTHORITY_MAP)) {
        if (cleanSource.includes(key)) {
            return score;
        }
    }

    // Check embedded credit in title or description (e.g. "- Firstpost", "Source: WION")
    const combinedText = `${title} ${description}`;
    for (const item of EMBEDDED_SOURCE_PATTERNS) {
        if (item.pattern.test(combinedText)) {
            return Math.max(78, item.score - 4); // High authority with slight attribution discount
        }
    }

    return 65; // Default baseline for unclassified web feeds
}

/**
 * Analyzes text for sensationalism, official verifications, and linguistic reliability.
 */
export function analyzeContentReliability(title: string, description: string, source: string): { score: number; explanation: string } {
    let score = 80;
    const reasons: string[] = [];
    const lowerTitle = title.toLowerCase();
    const lowerText = `${title} ${description}`.toLowerCase();

    // 1. Check for Fact-Check journalism
    if (source.toLowerCase().includes('alt news') || lowerTitle.includes('fact check') || lowerTitle.includes('claim check')) {
        score += 15;
        reasons.push('Verified fact-checking investigative journalism');
    }

    // 2. Official / Institutional terminology
    let officialHits = 0;
    for (const marker of OFFICIAL_MARKERS) {
        if (lowerText.includes(marker)) {
            officialHits++;
        }
    }
    if (officialHits >= 2) {
        score += 8;
        reasons.push('Contains official governmental/institutional citations');
    }

    // 3. Sensationalism / Clickbait detection
    let sensationalHits = 0;
    for (const word of SENSATIONAL_WORDS) {
        if (lowerTitle.includes(word)) {
            sensationalHits++;
        }
    }
    if (sensationalHits > 0) {
        score -= sensationalHits * 12;
        reasons.push(`Contains sensationalized/clickbait keywords (-${sensationalHits * 12}%)`);
    }

    // 4. Excessive punctuation / ALL CAPS detection
    const exclamationCount = (title.match(/!/g) || []).length;
    if (exclamationCount >= 2) {
        score -= 10;
        reasons.push('Excessive exclamation emphasis');
    }

    const words = title.split(/\s+/).filter(w => w.length > 3);
    const upperWords = words.filter(w => w === w.toUpperCase() && /^[A-Z]+$/.test(w));
    if (words.length > 0 && upperWords.length / words.length > 0.4) {
        score -= 12;
        reasons.push('High proportion of ALL-CAPS text');
    }

    const boundedScore = Math.min(100, Math.max(20, score));
    const explanation = reasons.length > 0 ? reasons.join('; ') : 'Standard editorial reporting format';

    return { score: boundedScore, explanation };
}

/**
 * Calculates cross-source verification score by measuring article overlap with other sources.
 */
export function calculateCrossVerification(articles: Array<{ title: string; source: string }>): number[] {
    const tokenized = articles.map(a => {
        const tokens = a.title
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(t => t.length > 2 && !STOPWORDS.has(t));
        return { tokens: new Set(tokens), source: a.source };
    });

    return tokenized.map((itemA, i) => {
        let maxOverlapCount = 0;
        let corroboratingSources = new Set<string>();

        tokenized.forEach((itemB, j) => {
            if (i === j || itemA.source === itemB.source) return;

            let intersection = 0;
            for (const token of itemA.tokens) {
                if (itemB.tokens.has(token)) {
                    intersection++;
                }
            }

            // If at least 2 distinct topical keywords match across distinct sources
            if (intersection >= 2) {
                maxOverlapCount = Math.max(maxOverlapCount, intersection);
                corroboratingSources.add(itemB.source);
            }
        });

        if (corroboratingSources.size >= 2) {
            return 95; // Multi-outlet corroborated breaking story
        } else if (corroboratingSources.size === 1) {
            return 85; // Corroborated by another distinct outlet
        } else {
            return 65; // Single-source exclusive/report
        }
    });
}

const MONTH_NAMES = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
];

const MONTH_ABBR = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

const DAY_NAMES = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

/**
 * Extracts and infers the actual incident origin date from article content and publication timestamp.
 */
export function extractIncidentOrigin(
    title: string,
    description: string,
    publishedAt: string
): IncidentOriginInfo {
    const pubDate = new Date(publishedAt);
    const validPubDate = isNaN(pubDate.getTime()) ? new Date() : pubDate;
    const text = `${title} ${description}`;

    let detectedDate: Date | null = null;
    let confidence: IncidentOriginInfo['confidence'] = 'published_date';

    // 1. Check for specific full date e.g. "on August 14, 2026", "14th August", "14 Aug"
    const monthPattern = '(?:' + [...MONTH_NAMES, ...MONTH_ABBR].join('|') + ')';
    const explicitDateRegex = new RegExp(
        `(?:on\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthPattern})(?:\\s*,?\\s*(\\d{4}))?`,
        'i'
    );
    const altExplicitDateRegex = new RegExp(
        `(?:on\\s+)?(${monthPattern})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*,?\\s*(\\d{4}))?`,
        'i'
    );

    const match1 = text.match(explicitDateRegex);
    const match2 = text.match(altExplicitDateRegex);

    if (match1) {
        const day = parseInt(match1[1], 10);
        const monthStr = match1[2].toLowerCase();
        let monthIndex = MONTH_NAMES.indexOf(monthStr);
        if (monthIndex === -1) monthIndex = MONTH_ABBR.indexOf(monthStr);
        const year = match1[3] ? parseInt(match1[3], 10) : validPubDate.getFullYear();

        if (monthIndex !== -1 && day >= 1 && day <= 31) {
            detectedDate = new Date(year, monthIndex, day);
            confidence = 'extracted';
        }
    } else if (match2) {
        const monthStr = match2[1].toLowerCase();
        const day = parseInt(match2[2], 10);
        let monthIndex = MONTH_NAMES.indexOf(monthStr);
        if (monthIndex === -1) monthIndex = MONTH_ABBR.indexOf(monthStr);
        const year = match2[3] ? parseInt(match2[3], 10) : validPubDate.getFullYear();

        if (monthIndex !== -1 && day >= 1 && day <= 31) {
            detectedDate = new Date(year, monthIndex, day);
            confidence = 'extracted';
        }
    }

    // 2. Relative time expressions ("yesterday", "last night", "2 days ago", "on Friday")
    if (!detectedDate) {
        const lowerText = text.toLowerCase();
        if (/\b(?:yesterday|last night)\b/i.test(lowerText)) {
            detectedDate = new Date(validPubDate.getTime() - 24 * 60 * 60 * 1000);
            confidence = 'extracted';
        } else {
            const daysAgoMatch = lowerText.match(/(\d+)\s+days?\s+ago/i);
            if (daysAgoMatch) {
                const days = parseInt(daysAgoMatch[1], 10);
                if (days > 0 && days < 365) {
                    detectedDate = new Date(validPubDate.getTime() - days * 24 * 60 * 60 * 1000);
                    confidence = 'extracted';
                }
            } else {
                // Day of week e.g. "on Friday", "last Tuesday"
                for (let dayIndex = 0; dayIndex < DAY_NAMES.length; dayIndex++) {
                    const dayName = DAY_NAMES[dayIndex];
                    if (new RegExp(`\\b(?:on|last)\\s+${dayName}\\b`, 'i').test(lowerText)) {
                        const currentDay = validPubDate.getDay();
                        let diff = currentDay - dayIndex;
                        if (diff <= 0) diff += 7; // Previous occurrence
                        detectedDate = new Date(validPubDate.getTime() - diff * 24 * 60 * 60 * 1000);
                        confidence = 'extracted';
                        break;
                    }
                }
            }
        }
    }

    // Fallback if no specific prior incident date was found in the text
    if (!detectedDate || isNaN(detectedDate.getTime())) {
        detectedDate = new Date(validPubDate);
        confidence = 'published_date';
    }

    // Ensure detected incident date cannot be ahead of article published date
    if (detectedDate.getTime() > validPubDate.getTime()) {
        detectedDate = new Date(validPubDate);
        confidence = 'published_date';
    }

    const latencyMs = Math.max(0, validPubDate.getTime() - detectedDate.getTime());
    const latencyDays = Math.floor(latencyMs / (1000 * 60 * 60 * 24));

    let latencyLabel = 'Live / Same-day reporting';
    if (latencyDays === 1) {
        latencyLabel = 'Incident occurred 1 day prior';
    } else if (latencyDays > 1 && latencyDays < 7) {
        latencyLabel = `Incident occurred ${latencyDays} days prior`;
    } else if (latencyDays >= 7 && latencyDays < 30) {
        const weeks = Math.round(latencyDays / 7);
        latencyLabel = `Reported ~${weeks} week${weeks > 1 ? 's' : ''} after incident`;
    } else if (latencyDays >= 30) {
        latencyLabel = 'Historical reference / Archival report';
    }

    const formattedOriginDate = detectedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return {
        originDate: detectedDate.toISOString(),
        formattedOriginDate,
        publishedDate: validPubDate.toISOString(),
        latencyDays,
        latencyLabel,
        confidence
    };
}

/**
 * Processes a batch of news articles, computing comprehensive veracity scores and incident origins.
 */
export function enrichNewsWithVeracity(articles: NewsItem[]): NewsItem[] {
    if (articles.length === 0) return [];

    const crossVerificationScores = calculateCrossVerification(articles);

    return articles.map((article, idx) => {
        const sourceAuthority = calculateSourceAuthority(article.source, article.title, article.description);
        const crossVerification = crossVerificationScores[idx] || 70;
        const contentResult = analyzeContentReliability(article.title, article.description, article.source);

        // Weighted veracity score: 45% Source Authority, 30% Cross Verification, 25% Content Analysis
        const rawScore = (0.45 * sourceAuthority) + (0.30 * crossVerification) + (0.25 * contentResult.score);
        const score = Math.round(Math.min(99, Math.max(15, rawScore)));

        let label: VeracityInfo['label'];
        if (score >= 85) {
            label = 'Verified Authentic';
        } else if (score >= 70) {
            label = 'Likely Real';
        } else if (score >= 50) {
            label = 'Unverified / Developing';
        } else {
            label = 'Suspicious / Disputed';
        }

        const breakdown: VeracityBreakdown = {
            sourceAuthority: Math.round(sourceAuthority),
            crossVerification: Math.round(crossVerification),
            contentAnalysis: Math.round(contentResult.score)
        };

        const veracity: VeracityInfo = {
            score,
            label,
            breakdown,
            explanation: contentResult.explanation
        };

        const incidentOrigin = extractIncidentOrigin(article.title, article.description, article.publishedAt);

        return {
            ...article,
            veracity,
            incidentOrigin
        };
    });
}
