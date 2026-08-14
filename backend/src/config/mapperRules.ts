import { NewsItem } from '../types';

export const CATEGORY_KEYWORDS: Record<NewsItem['category'], string[]> = {
    Defence: [
        'defence', 'defense', 'military', 'army', 'navy', 'air force', 'iaf', 'soldier', 
        'warship', 'missile', 'submarine', 'border', 'cybersecurity', 'cyber security',
        'weapon', 'pentagon', 'drdo', 'nato', 'combat', 'security threat', 'disarmament'
    ],
    technology: [
        'technology', 'tech', 'software', 'ai', 'artificial intelligence', 'semiconductor',
        'microchip', 'crypto', 'bitcoin', 'quantum', 'metaverse', 'hacker', 'app', 'google', 
        'microsoft', 'apple', 'chatgpt', 'openai', 'cyber attack', 'smart home'
    ],
    business: [
        'business', 'finance', 'economy', 'gdp', 'inflation', 'stocks', 'nasdaq', 'market',
        'investment', 'merger', 'acquisition', 'startup', 'corporate', 'tax', 'commerce',
        'banking', 'trade deficit', 'recession', 'rbi', 'interest rate'
    ],
    national: [
        'national', 'delhi', 'mumbai', 'india', 'parliament', 'government', 'modi', 
        'election', 'court', 'ministry', 'pib', 'state', 'bjp', 'congress', 'constitution'
    ],
    international: [
        'international', 'global', 'united nations', 'un', 'treaty', 'bilateral', 'geopolitics',
        'foreign policy', 'embassy', 'diplomacy', 'diplomatic', 'summit', 'g20', 'china', 'us',
        'middle east', 'conflict'
    ],
    trending: []
};
