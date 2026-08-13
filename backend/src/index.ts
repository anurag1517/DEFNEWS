import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());

export interface NewsItem {
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

const articles: NewsItem[] = [
    // Defence
    {
        id: 'def-1',
        title: 'Global Alliance Announces Joint Naval Drills in the Pacific',
        description: 'Over 30 warships and 10,000 personnel from allied nations are participating in the largest maritime exercises in a decade, focusing on regional stability.',
        source: 'Reuters',
        isTrusted: true,
        category: 'Defence',
        publishedAt: '2026-08-09T18:30:00Z',
        url: 'https://example.com/naval-drills',
        imageUrl: 'https://images.unsplash.com/photo-1507682531662-421b17ac4f83?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'def-2',
        title: 'Secret Defense Tech Leaked on Online Forum',
        description: 'Unverified schematics allegedly detailing a next-generation stealth drone system were posted anonymously on a popular gaming discussion board last night.',
        source: 'NetSnoop Intel',
        isTrusted: false,
        category: 'Defence',
        publishedAt: '2026-08-09T21:15:00Z',
        url: 'https://example.com/stealth-leak',
        imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'def-3',
        title: 'Ministry of Defence Approves Cyber Command Expansion',
        description: 'In response to growing cybersecurity challenges, a new state-of-the-art facility will house expanded teams focusing on critical infrastructure defense.',
        source: 'BBC News',
        isTrusted: true,
        category: 'Defence',
        publishedAt: '2026-08-09T14:45:00Z',
        url: 'https://example.com/cyber-expansion',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
    },

    // Technology
    {
        id: 'tech-1',
        title: 'Quantum Computing Reaches Crucial 1000-Qubit Milestone',
        description: 'Researchers have demonstrated a stable quantum processor surpassing 1,000 logical qubits, paving the way for practical molecular simulations.',
        source: 'MIT Technology Review',
        isTrusted: true,
        category: 'technology',
        publishedAt: '2026-08-09T16:20:00Z',
        url: 'https://example.com/quantum-milestone',
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'tech-2',
        title: 'Revolutionary Crypto Protocol Promises 10,000% Yields Overnight',
        description: 'A new decentralized finance protocol claims to have solved the trilemma, offering astronomical yields. Independent security audits are currently unavailable.',
        source: 'CryptoMoonWatch',
        isTrusted: false,
        category: 'technology',
        publishedAt: '2026-08-09T20:05:00Z',
        url: 'https://example.com/crypto-yields',
        imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'tech-3',
        title: 'Tech Giants Agree on Unified Open-Source Smart Home Standard',
        description: 'Major manufacturers have finalized a new communication standard designed to increase local privacy and cross-device compatibility without cloud dependencies.',
        source: 'Associated Press',
        isTrusted: true,
        category: 'technology',
        publishedAt: '2026-08-09T10:00:00Z',
        url: 'https://example.com/smarthome-standard',
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800'
    },

    // Business
    {
        id: 'biz-1',
        title: 'Global Inflation Rates Stabilize as Supply Chains Normalize',
        description: 'Central banks express cautious optimism as consumer price index reports show steady decline in core inflation metrics across key trading zones.',
        source: 'Bloomberg',
        isTrusted: true,
        category: 'business',
        publishedAt: '2026-08-09T12:00:00Z',
        url: 'https://example.com/inflation-cools',
        imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'biz-2',
        title: 'Rumors of Impending Mega-Merger Shake Retail Sector',
        description: 'Anonymous sources report talks between two retail giants, but company representatives refuse to comment. Stock prices saw volatile swings in afternoon trading.',
        source: 'MarketWhisperer',
        isTrusted: false,
        category: 'business',
        publishedAt: '2026-08-09T15:30:00Z',
        url: 'https://example.com/retail-merger',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800'
    },

    // Trending
    {
        id: 'trend-1',
        title: 'AI Smart Assistants are Rapidly Reshaping Everyday Workspaces',
        description: 'From meeting summaries to automated scheduling, virtual agents have become standard office colleagues for over 70% of Fortune 500 teams.',
        source: 'BBC News',
        isTrusted: true,
        category: 'trending',
        publishedAt: '2026-08-09T08:15:00Z',
        url: 'https://example.com/ai-workspace',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'trend-2',
        title: 'Viral Video of Floating Car Proven to Be CGI Marketing Stunt',
        description: 'A video with 50 million views depicting a flying sedan has been revealed as a VFX promotion for an upcoming sci-fi streaming series.',
        source: 'FactChecker Daily',
        isTrusted: true,
        category: 'trending',
        publishedAt: '2026-08-09T09:40:00Z',
        url: 'https://example.com/floating-car-debunked',
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'
    },

    // National
    {
        id: 'nat-1',
        title: 'New National Parks Legislation Enacted to Safeguard Ecosystems',
        description: 'The bipartisan bill allocates historic funding levels for wetland restoration and expands protected park boundaries by over 2 million acres.',
        source: 'Associated Press',
        isTrusted: true,
        category: 'national',
        publishedAt: '2026-08-09T11:20:00Z',
        url: 'https://example.com/parks-bill',
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'nat-2',
        title: 'Tax Code Hack Allegedly Reveals Loopholes for Large Corporations',
        description: 'An activist group claims to have found a hidden loophole in the newly proposed tax code. Treasury officials dismiss the claims as a misunderstanding of standard deductions.',
        source: 'PatriotPatrol',
        isTrusted: false,
        category: 'national',
        publishedAt: '2026-08-09T14:10:00Z',
        url: 'https://example.com/tax-hack',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800'
    },

    // International
    {
        id: 'int-1',
        title: 'Global Climate Agreement Signed by 120 Nations at Summit',
        description: 'Countries commit to binding emissions reductions and a joint fund to support climate mitigation efforts in developing economies.',
        source: 'The New York Times',
        isTrusted: true,
        category: 'international',
        publishedAt: '2026-08-09T07:30:00Z',
        url: 'https://example.com/climate-summit',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'int-2',
        title: 'Unconfirmed Border Movements Spark Concerns of Diplomatic Friction',
        description: 'Social media reports show troop convoys near the eastern border. Official defense representatives urge caution and refuse to confirm active status changes.',
        source: 'WorldObserver News',
        isTrusted: false,
        category: 'international',
        publishedAt: '2026-08-09T19:50:00Z',
        url: 'https://example.com/border-rumors',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800'
    }
];

// Endpoint to fetch news, optional filter by category
app.get('/api/news', (req, res) => {
    const { category } = req.query;

    if (category) {
        // Handle case-insensitive category matching (e.g. 'Defence' vs 'defence')
        const filteredArticles = articles.filter(
            a => a.category.toLowerCase() === (category as string).toLowerCase()
        );
        res.json(filteredArticles);
    } else {
        res.json(articles);
    }
});

// Start Express server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
