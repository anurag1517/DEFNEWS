export type BiasCategory = 'left' | 'center-left' | 'center' | 'center-right' | 'right';

export type SourceType =
    | 'wire'
    | 'public_broadcaster'
    | 'mainstream_media'
    | 'independent_journalist'
    | 'youtube_creator'
    | 'fact_checker';

export interface SourceProfile {
    name: string;
    bias: BiasCategory;
    score: number; // -100 (Far Left) to 0 (Center/Neutral) to +100 (Far Right)
    sourceType: SourceType;
    label: string;
    description: string;
    twitterHandle?: string;
    youtubeChannel?: string;
    aliases: string[];
}

export const BIAS_REGISTRY: Record<string, SourceProfile> = {
    // ----------------------------------------------------
    // LEFT / PROGRESSIVE / LIBERAL
    // ----------------------------------------------------
    'the wire': {
        name: 'The Wire',
        bias: 'left',
        score: -75,
        sourceType: 'independent_journalist',
        label: 'Left / Progressive',
        description: 'Investigative digital platform focusing on civil liberties, human rights, and institutional accountability.',
        twitterHandle: '@thewire_in',
        aliases: ['thewire.in', 'the wire', 'thewire']
    },
    'scroll.in': {
        name: 'Scroll.in',
        bias: 'left',
        score: -65,
        sourceType: 'independent_journalist',
        label: 'Left-Center',
        description: 'Independent news outlet emphasizing socio-political reporting, cultural critiques, and policy analysis.',
        twitterHandle: '@scroll_in',
        aliases: ['scroll', 'scroll.in']
    },
    'the caravan': {
        name: 'The Caravan',
        bias: 'left',
        score: -80,
        sourceType: 'independent_journalist',
        label: 'Left / Progressive',
        description: 'Journal of politics and culture specializing in long-form narrative investigative reports.',
        twitterHandle: '@thecaravanmagazine',
        aliases: ['thecaravan', 'the caravan']
    },
    'newslaundry': {
        name: 'Newslaundry',
        bias: 'center-left',
        score: -50,
        sourceType: 'independent_journalist',
        label: 'Center-Left / Media Critique',
        description: 'Subscriber-funded media critique and investigative reporting portal.',
        twitterHandle: '@newslaundry',
        aliases: ['newslaundry', 'newslaundry.com']
    },
    'alt news': {
        name: 'Alt News Fact Check',
        bias: 'center-left',
        score: -40,
        sourceType: 'fact_checker',
        label: 'Fact-Check / Center-Left',
        description: 'Non-profit fact-checking portal focused on debunking social media misinformation and viral propaganda.',
        twitterHandle: '@AltNews',
        aliases: ['alt news', 'altnews', 'alt news fact check']
    },
    'dhruv rathee': {
        name: 'Dhruv Rathee',
        bias: 'left',
        score: -70,
        sourceType: 'youtube_creator',
        label: 'Left / Social Critic',
        description: 'High-reach independent educator and commentator analyzing policy, governance, and democracy.',
        twitterHandle: '@dhruv_rathee',
        youtubeChannel: 'Dhruv Rathee',
        aliases: ['dhruv rathee']
    },
    'ravish kumar': {
        name: 'Ravish Kumar Official',
        bias: 'left',
        score: -75,
        sourceType: 'independent_journalist',
        label: 'Left / Progressive',
        description: 'Ramon Magsaysay awardee journalist covering grassroots issues, unemployment, and institutional critique.',
        twitterHandle: '@ravishndtv',
        youtubeChannel: 'Ravish Kumar Official',
        aliases: ['ravish kumar', 'ravish kumar official']
    },
    'the deshbhakt': {
        name: 'The DeshBhakt (Akash Banerjee)',
        bias: 'left',
        score: -65,
        sourceType: 'youtube_creator',
        label: 'Left / Satire',
        description: 'Political satire and commentary platform focusing on governance accountability.',
        twitterHandle: '@TheDeshBhakt',
        youtubeChannel: 'The DeshBhakt',
        aliases: ['the deshbhakt', 'akash banerjee', 'deshbhakt']
    },

    // ----------------------------------------------------
    // CENTER / NEUTRAL / WIRE / PUBLIC BROADCASTER
    // ----------------------------------------------------
    'pib': {
        name: 'Press Information Bureau (PIB)',
        bias: 'center',
        score: 0,
        sourceType: 'public_broadcaster',
        label: 'Official Government Wire',
        description: 'The nodal agency of the Government of India for disseminating official policy and ministry press releases.',
        twitterHandle: '@PIB_India',
        aliases: ['pib', 'press information bureau', 'pib india', 'pib fact check']
    },
    'dd news': {
        name: 'Doordarshan (DD News)',
        bias: 'center',
        score: 5,
        sourceType: 'public_broadcaster',
        label: 'Public Broadcaster',
        description: 'India\'s public service terrestrial television network broadcasting factual national bulletins.',
        twitterHandle: '@DDNewslive',
        aliases: ['dd news', 'doordarshan', 'dd india', 'dd national']
    },
    'pti': {
        name: 'Press Trust of India (PTI)',
        bias: 'center',
        score: 0,
        sourceType: 'wire',
        label: 'Neutral Wire Agency',
        description: 'Premier non-profit news cooperative providing real-time factual dispatches to domestic and global media.',
        twitterHandle: '@PTI_News',
        aliases: ['pti', 'press trust of india']
    },
    'ani': {
        name: 'Asian News International (ANI)',
        bias: 'center',
        score: 10,
        sourceType: 'wire',
        label: 'Major Wire Agency',
        description: 'South Asia\'s leading multimedia news agency providing syndicated video and textual feeds.',
        twitterHandle: '@ANI',
        aliases: ['ani', 'asian news international']
    },
    'the hindu': {
        name: 'The Hindu',
        bias: 'center-left',
        score: -20,
        sourceType: 'mainstream_media',
        label: 'Balanced / Center-Left',
        description: 'India\'s veteran daily known for authoritative editorial integrity and legal/institutional depth.',
        twitterHandle: '@the_hindu',
        aliases: ['the hindu', 'thehindu.com']
    },
    'the indian express': {
        name: 'The Indian Express',
        bias: 'center',
        score: -10,
        sourceType: 'mainstream_media',
        label: 'Center / Investigative',
        description: 'Prominent national daily renowned for bold investigative journalism and nuanced policy analysis.',
        twitterHandle: '@IndianExpress',
        aliases: ['indian express', 'the indian express', 'indianexpress.com']
    },
    'reuters': {
        name: 'Reuters',
        bias: 'center',
        score: 0,
        sourceType: 'wire',
        label: 'Global Wire / Neutral',
        description: 'Global news agency delivering objective, multi-regional factual reporting and financial data.',
        twitterHandle: '@Reuters',
        aliases: ['reuters']
    },
    'the print': {
        name: 'The Print',
        bias: 'center',
        score: 5,
        sourceType: 'mainstream_media',
        label: 'Center / Pragmatic',
        description: 'Digital news platform led by Shekhar Gupta offering analytical policy and strategic commentary.',
        twitterHandle: '@ThePrintIndia',
        aliases: ['the print', 'theprint', 'shekhar gupta', 'cut the clutter']
    },
    'ndtv': {
        name: 'NDTV',
        bias: 'center',
        score: 0,
        sourceType: 'mainstream_media',
        label: 'Mainstream Center',
        description: 'Pioneering Indian broadcast network delivering round-the-clock national and international coverage.',
        twitterHandle: '@ndtv',
        aliases: ['ndtv', 'ndtv news', 'ndtv india']
    },

    // ----------------------------------------------------
    // RIGHT / CONSERVATIVE / NATIONALIST
    // ----------------------------------------------------
    'wion': {
        name: 'WION (World Is One News)',
        bias: 'center-right',
        score: 45,
        sourceType: 'mainstream_media',
        label: 'Center-Right / Geopolitical',
        description: 'International news channel focusing on global affairs, strategic defense, and an India-centric global lens.',
        twitterHandle: '@WIONews',
        aliases: ['wion', 'wionews']
    },
    'firstpost': {
        name: 'Firstpost',
        bias: 'center-right',
        score: 50,
        sourceType: 'mainstream_media',
        label: 'Center-Right / Global Vantage',
        description: 'Digital current affairs platform known for Vantage with Palki Sharma and strategic commentary.',
        twitterHandle: '@firstpost',
        aliases: ['firstpost', 'firstpost.com', 'palki sharma', 'vantage']
    },
    'opindia': {
        name: 'OpIndia',
        bias: 'right',
        score: 85,
        sourceType: 'independent_journalist',
        label: 'Right / Nationalist',
        description: 'Conservative opinion and news portal presenting right-leaning perspectives on politics and media bias.',
        twitterHandle: '@OpIndia_com',
        aliases: ['opindia', 'opindia.com']
    },
    'swarajya': {
        name: 'Swarajya Magazine',
        bias: 'right',
        score: 70,
        sourceType: 'mainstream_media',
        label: 'Right / Cultural & Strategic',
        description: 'Print and digital magazine offering conservative economic, cultural, and foreign policy perspectives.',
        twitterHandle: '@SwarajyaMag',
        aliases: ['swarajya', 'swarajyamag', 'swarajya magazine']
    },
    'republic tv': {
        name: 'Republic TV / Republic Bharat',
        bias: 'right',
        score: 80,
        sourceType: 'mainstream_media',
        label: 'Right / Nationalist',
        description: 'High-energy broadcast network focusing on national security, domestic politics, and vocal debates.',
        twitterHandle: '@Republic_Bharat',
        aliases: ['republic', 'republic tv', 'republic bharat']
    },
    'times now': {
        name: 'Times Now',
        bias: 'center-right',
        score: 55,
        sourceType: 'mainstream_media',
        label: 'Center-Right',
        description: 'Major English news channel highlighting national security, governance, and current affairs debates.',
        twitterHandle: '@TimesNow',
        aliases: ['times now', 'timesnow']
    },
    'abhi and niyu': {
        name: 'Abhi and Niyu',
        bias: 'center-right',
        score: 45,
        sourceType: 'youtube_creator',
        label: 'Center-Right / Positive India',
        description: 'Content creator duo covering heritage, innovation, sustainability, and national achievements.',
        twitterHandle: '@AbhiAndNiyu',
        youtubeChannel: 'Abhi and Niyu',
        aliases: ['abhi and niyu', 'abhi & niyu']
    },
    'the chanakiya dialogues': {
        name: 'The Chanakya Dialogues (Major Gaurav Arya)',
        bias: 'right',
        score: 85,
        sourceType: 'youtube_creator',
        label: 'Right / Defence & Geopolitics',
        description: 'Strategic affairs and military analysis channel hosted by veteran Major Gaurav Arya.',
        twitterHandle: '@majorgauravarya',
        youtubeChannel: 'The Chanakya Dialogues',
        aliases: ['chanakya dialogues', 'major gaurav arya', 'chanakya forum']
    },
    'think school': {
        name: 'Think School',
        bias: 'center',
        score: 15,
        sourceType: 'youtube_creator',
        label: 'Center / Business & Geopolitics',
        description: 'Educational case-study platform breaking down international business models and geopolitics.',
        youtubeChannel: 'Think School',
        aliases: ['think school']
    }
};

/**
 * Normalizes and looks up a source profile by name, domain, or alias.
 */
export function lookupSourceProfile(sourceName: string, textContext: string = ''): SourceProfile {
    const clean = (sourceName || '').trim().toLowerCase();

    // 1. Direct key match
    if (BIAS_REGISTRY[clean]) {
        return BIAS_REGISTRY[clean];
    }

    // 2. Check aliases
    for (const profile of Object.values(BIAS_REGISTRY)) {
        if (profile.aliases.some(alias => clean.includes(alias) || alias.includes(clean))) {
            return profile;
        }
    }

    // 3. Scan title & context for embedded publisher attributions (e.g. "- The Wire", "via OpIndia")
    const lowerContext = `${sourceName} ${textContext}`.toLowerCase();
    for (const profile of Object.values(BIAS_REGISTRY)) {
        for (const alias of profile.aliases) {
            const regex = new RegExp(`\\b${alias}\\b`, 'i');
            if (regex.test(lowerContext)) {
                return profile;
            }
        }
    }

    // Default neutral mainstream fallback
    return {
        name: sourceName || 'General Wire Source',
        bias: 'center',
        score: 0,
        sourceType: 'mainstream_media',
        label: 'Center / Neutral',
        description: 'Aggregated news wire reporting.',
        aliases: []
    };
}
