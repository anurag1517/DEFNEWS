import { NewsItem } from '../types';

export const CATEGORY_KEYWORDS: Record<NewsItem['category'], string[]> = {
    Defence: [
        'defence', 'defense', 'military', 'army', 'navy', 'air force', 'iaf', 'soldier', 'soldiers',
        'warship', 'missile', 'submarine', 'border', 'cybersecurity', 'cyber security', 'weapon',
        'weapons', 'pentagon', 'drdo', 'nato', 'combat', 'security threat', 'disarmament', 'troops',
        'armed forces', 'defense ministry', 'defence ministry', 'artillery', 'fighter jet',
        'aircraft carrier', 'drone', 'drones', 'warfare', 'agni', 'brahmos', 'amca', 'tejas', 'rafale',
        's-400', 'nuclear', 'warhead', 'battalion', 'regiment', 'counter-terrorism', 'insurgency',
        'security forces', 'border security', 'loc', 'lac', 'doklam', 'ladakh', 'galwan', 'maritime',
        'naval', 'ammunition', 'radar', 'stealth', 'reconnaissance'
    ],
    technology: [
        'technology', 'tech', 'software', 'ai', 'artificial intelligence', 'semiconductor',
        'microchip', 'crypto', 'bitcoin', 'quantum', 'metaverse', 'hacker', 'hackers', 'app', 'apps',
        'google', 'microsoft', 'apple', 'chatgpt', 'openai', 'cyber attack', 'smart home',
        'machine learning', 'deep learning', 'llm', 'generative ai', 'algorithm', 'cloud', 'aws',
        'azure', 'nvidia', 'intel', 'amd', 'smartphone', 'android', 'ios', 'data breach', '5g', '6g',
        'robotics', 'space', 'isro', 'nasa', 'satellite', 'rocket', 'launch vehicle', 'semiconductor chip',
        'fab', 'tech giant', 'tesla', 'spacex', 'zuckerberg', 'musk', 'altman', 'cybercrime', 'malware',
        'ransomware'
    ],
    business: [
        'business', 'finance', 'economy', 'gdp', 'inflation', 'stocks', 'nasdaq', 'market', 'markets',
        'investment', 'investments', 'merger', 'acquisition', 'startup', 'startups', 'corporate',
        'tax', 'taxes', 'commerce', 'banking', 'trade deficit', 'recession', 'rbi', 'interest rate',
        'interest rates', 'sensex', 'nifty', 'stock market', 'share price', 'wall street', 'revenue',
        'profit', 'quarter', 'earnings', 'ipo', 'venture capital', 'angel investor', 'real estate',
        'ethereum', 'bank', 'banks', 'federal reserve', 'fed', 'repo rate', 'gst', 'fiscal', 'trade',
        'export', 'import', 'tariff', 'tariffs', 'supply chain', 'retail', 'e-commerce', 'consumer',
        'bankruptcy', 'debt', 'bond', 'bonds', 'currency', 'rupee', 'dollar', 'forex'
    ],
    national: [
        'national', 'delhi', 'mumbai', 'india', 'parliament', 'government', 'modi', 'election',
        'elections', 'court', 'ministry', 'pib', 'state', 'bjp', 'congress', 'constitution',
        'supreme court', 'high court', 'lok sabha', 'rajya sabha', 'chief minister', 'cm',
        'prime minister', 'pm', 'governor', 'cabinet', 'bill', 'law', 'laws', 'ordinance', 'policy',
        'scheme', 'aap', 'trinamool', 'tmc', 'dmk', 'aiadmk', 'bengaluru', 'kolkata', 'chennai',
        'hyderabad', 'ahmedabad', 'maharashtra', 'uttar pradesh', 'kerala', 'tamil nadu', 'karnataka',
        'punjab', 'bihar', 'bengal', 'police', 'cbi', 'enforcement directorate', 'ias', 'ips',
        'infrastructure', 'highway', 'railway', 'vande bharat'
    ],
    international: [
        'international', 'global', 'united nations', 'treaty', 'bilateral', 'geopolitics',
        'foreign policy', 'embassy', 'diplomacy', 'diplomatic', 'summit', 'g20', 'china', 'usa',
        'united states', 'middle east', 'conflict', 'america', 'washington', 'biden', 'trump', 'uk',
        'britain', 'london', 'europe', 'european union', 'eu', 'russia', 'moscow', 'putin', 'ukraine',
        'kyiv', 'zelenskyy', 'israel', 'tel aviv', 'gaza', 'palestine', 'hamas', 'iran', 'tehran',
        'hezbollah', 'beijing', 'xi jinping', 'taiwan', 'japan', 'tokyo', 'korea', 'indo-pacific',
        'brics', 'g7', 'quad', 'ambassador', 'envoy', 'sanction', 'sanctions', 'ceasefire', 'hostage',
        'refugees', 'immigration', 'passport', 'visa', 'foreign affairs', 'external affairs'
    ],
    trending: []
};
