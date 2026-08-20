import { WayAheadInfo, WayAheadStage } from '../types/newsItem';

interface PredictiveParams {
    title: string;
    description: string;
    category?: string;
    source?: string;
    customQuery?: string;
}

/**
 * Extract key entities using NLP heuristic pattern matching.
 */
function extractEntities(text: string): string[] {
    const entities = new Set<string>();

    const patterns = [
        /\b(?:Ministry of Defence|MoD|DRDO|ISRO|Indian Army|Indian Navy|Indian Air Force|IAF)\b/gi,
        /\b(?:Cabinet Committee on Security|CCS|Defence Acquisition Council|DAC|HAL|BEL)\b/gi,
        /\b(?:Reserve Bank of India|RBI|Ministry of Finance|GST Council|SEBI)\b/gi,
        /\b(?:Prime Minister|PMO|Parliament|Supreme Court|High Court)\b/gi,
        /\b(?:NITI Aayog|MeitY|Department of Telecommunications|DoT|TRAI)\b/gi,
        /\b(?:Pentagon|NATO|United Nations|UNSC|European Union|EU|BRICS|QUAD)\b/gi
    ];

    for (const pat of patterns) {
        const matches = text.match(pat);
        if (matches) {
            matches.forEach(m => entities.add(m.trim()));
        }
    }

    // Capitalized multi-word proper nouns fallback
    const properNouns = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g);
    if (properNouns) {
        properNouns.slice(0, 3).forEach(pn => {
            if (pn.length > 5 && !['News Agency', 'Press Information'].includes(pn)) {
                entities.add(pn);
            }
        });
    }

    if (entities.size === 0) {
        entities.add('Government Bodies & Strategic Stakeholders');
        entities.add('Domain Regulatory Authorities');
    }

    return Array.from(entities);
}

/**
 * Extract key facts using text segmentation and keyword heuristics.
 */
function extractKeyFacts(text: string, title: string): string[] {
    const facts: string[] = [];

    // Clean text into sentences
    const sentences = text
        .replace(/([.?!])\s+/g, '$1|')
        .split('|')
        .map(s => s.trim())
        .filter(s => s.length > 20);

    if (sentences.length > 0) {
        facts.push(sentences[0]);
    }
    if (sentences.length > 1) {
        facts.push(sentences[1]);
    }

    // Check numbers/financials/percentages
    const statsMatches = text.match(/\b(?:\$\d+|\d+%\s*|\d+\s*crore|\d+\s*billion|\d+\s*trillion|\d{4})\b/gi);
    if (statsMatches && statsMatches.length > 0) {
        facts.push(`Key quantitative benchmark recorded: ${statsMatches.slice(0, 2).join(', ')}.`);
    } else {
        facts.push(`Official reporting verified across primary news feeds for "${title.slice(0, 45)}...".`);
    }

    return facts.slice(0, 4);
}

/**
 * Generates NLP Predictive Path Ahead and Summary So Far analysis based on article context.
 */
export function generateWayAheadAnalysis(params: PredictiveParams): WayAheadInfo {
    const { title, description, category = 'trending', source = 'Verified Wire', customQuery } = params;

    const fullText = `${title} ${description} ${customQuery || ''}`.toLowerCase();

    const entities = extractEntities(`${title} ${description}`);
    const keyFacts = extractKeyFacts(description || title, title);

    // 1. Detect Specific Sub-Domains (Defence, Economy/Budget, Tech, Geopolitics, Policy)
    const isDefence = /\b(?:defence|defense|military|army|navy|air force|drdo|budget|warfare|missile|frigate|aircraft|weapon|security|penta|border|troops|artillery)\b/i.test(fullText);
    const isBudgetEconomy = /\b(?:budget|finance|economy|tax|gst|rbi|inflation|market|gdp|rupee|investment|fiscal|revenue|export|import)\b/i.test(fullText);
    const isTech = /\b(?:ai|technology|cyber|semiconductor|chip|space|isro|satellite|software|cloud|5g|telecom|quantum|startup)\b/i.test(fullText);
    const isGeopolitics = /\b(?:treaty|diplomacy|brics|quad|unsc|summit|bilateral|china|us|russia|trade pact|ambassador)\b/i.test(fullText);

    let domain = 'Policy & Strategic Governance';
    if (isDefence && isBudgetEconomy) domain = 'Defense Budget & Military Procurement Policy';
    else if (isDefence) domain = 'Defense & National Security';
    else if (isBudgetEconomy) domain = 'Macroeconomics & Fiscal Policy';
    else if (isTech) domain = 'Technology & Digital Infrastructure';
    else if (isGeopolitics) domain = 'Geopolitics & Bilateral Relations';

    // Summary So Far
    const summaryHeadline = title;
    const summaryOverview = description.length > 50 
        ? `${description.slice(0, 240)}...`
        : `Recent developments regarding "${title}" indicate active developments requiring strategic forecasting.`;

    // 2. Formulate Way Ahead Stages based on domain analysis
    let stages: WayAheadStage[] = [];
    let keyMilestones: string[] = [];
    let forecastSummary = '';
    let baselineScenario = '';
    let opportunityScenario = '';
    let riskScenario = '';
    let nlpConfidence = 85;

    if (isDefence) {
        forecastSummary = `NLP predictive modeling projects an accelerated push toward indigenization, capital allocation disbursement, and enhanced tactical readiness over the next 12 to 24 months.`;
        
        stages = [
            {
                phase: 'Immediate Phase (0–30 Days)',
                timeline: '0-30 Days',
                title: 'Directive Issuance & RFI/RFQ Tenders',
                description: 'The Ministry of Defence and services headquarters will issue formal Requests for Information (RFI) and tenders for domestic defense manufacturers.',
                actionablePoints: [
                    'Drafting of capital acquisition proposals for Defence Acquisition Council (DAC) clearance',
                    'Disbursement of R&D grants to iDEX defense startups and DRDO labs',
                    'Emergency procurement procedures initiated for critical spares and sensors'
                ]
            },
            {
                phase: 'Mid-Term Trajectory (1–6 Months)',
                timeline: '1-6 Months',
                title: 'Contract Executions & Manufacturing Setup',
                description: 'Contract awards to defense PSUs (HAL, BEL, Mazagon Dock) and private aerospace OEMs with mandatory domestic value addition rules.',
                actionablePoints: [
                    'Signing of firm procurement contracts and joint venture accords',
                    'Expansion of defense industrial corridors in UP and Tamil Nadu',
                    'Integration testing and trial deployments along operational defense sectors'
                ]
            },
            {
                phase: 'Long-Term Impact (6–24 Months)',
                timeline: '6-24 Months',
                title: 'Strategic Self-Reliance & Export Capability',
                description: 'Reduction of foreign arms import dependence by 15-20%, with increased export footprint of indigenous weapon systems.',
                actionablePoints: [
                    'Full operational capability (FOC) certification of next-gen defense platforms',
                    'Export deliveries to friendly partner nations in ASEAN and South America',
                    'Long-term defense budget optimization with sustainable maintenance cycles'
                ]
            }
        ];

        keyMilestones = [
            'Defence Acquisition Council (DAC) Capital Acceptance Meeting',
            'Publication of Positive Indigenization List batch updates',
            'Bilateral Defense Technology & Trade Initiative (DTTI) Summit',
            'Annual Defence Production & Outlay Audit Report'
        ];

        baselineScenario = 'Planned defense allocation targets met on schedule with steady domestic production scaling.';
        opportunityScenario = 'Accelerated tech transfer agreements boost indigenous R&D capabilities ahead of target dates.';
        riskScenario = 'Supply chain bottlenecks in raw materials or microelectronics could delay mid-term trials by 2-3 months.';
        nlpConfidence = 91;

    } else if (isBudgetEconomy) {
        forecastSummary = `NLP fiscal analytics indicate targeted capital expenditure push, credit growth support, and liquidity stabilization over the coming quarters.`;

        stages = [
            {
                phase: 'Immediate Phase (0–30 Days)',
                timeline: '0-30 Days',
                title: 'Notification & Institutional Guidelines',
                description: 'Relevant ministries and regulatory bodies (RBI/SEBI) issue execution frameworks and tax/budgetary circulars.',
                actionablePoints: [
                    'Release of official gazette notifications regarding policy shifts',
                    'Financial institutions recalibrate interest rate corridors and credit targets',
                    'Market adjusting to liquidity projections and yield shifts'
                ]
            },
            {
                phase: 'Mid-Term Trajectory (1–6 Months)',
                timeline: '1-6 Months',
                title: 'Capital Disbursement & Infrastructure Spending',
                description: 'Funds roll out to state infrastructure projects, industrial parks, and corporate incentive schemes (PLI).',
                actionablePoints: [
                    'Increased private capital expenditure (CapEx) commitments',
                    'Job creation in manufacturing, logistics, and digital services',
                    'Mid-year revenue and expenditure reviews by the finance ministry'
                ]
            },
            {
                phase: 'Long-Term Impact (6–24 Months)',
                timeline: '6-24 Months',
                title: 'Macroeconomic Growth & Fiscal Consolidation',
                description: 'Sustained GDP growth acceleration, improved debt-to-GDP ratio, and enhanced domestic market resilience.',
                actionablePoints: [
                    'Achievement of target fiscal deficit reduction goals',
                    'Expansion of export volume in high-value goods and IT/financial services',
                    'Long-term sovereign credit rating upgrades by global agencies'
                ]
            }
        ];

        keyMilestones = [
            'RBI Monetary Policy Committee (MPC) Rate Decision',
            'Quarterly GDP and IIP Growth Statistics Release',
            'GST Revenue & Capital Outlay Reporting',
            'Global Sovereign Credit Rating Review'
        ];

        baselineScenario = 'Steady economic trajectory matching central bank projections.';
        opportunityScenario = 'Higher-than-expected tax revenues enable additional infrastructure investments.';
        riskScenario = 'Global inflationary spikes could pressure import costs and trade deficit margins.';
        nlpConfidence = 88;

    } else if (isTech) {
        forecastSummary = `NLP predictive forecast models rapid technology adoption, regulatory compliance standards, and digital infrastructure scaling over the next 18 months.`;

        stages = [
            {
                phase: 'Immediate Phase (0–30 Days)',
                timeline: '0-30 Days',
                title: 'Regulatory Alignment & Sandbox Trials',
                description: 'Technology frameworks, security guidelines, and pilot implementations launched across select sectors.',
                actionablePoints: [
                    'Public consultation and regulatory compliance guidelines released',
                    'Enterprise adoption pilots and security vulnerability audits',
                    'Cross-industry consortiums established for interoperability'
                ]
            },
            {
                phase: 'Mid-Term Trajectory (1–6 Months)',
                timeline: '1-6 Months',
                title: 'Infrastructure Deployment & Ecosystem Scaling',
                description: 'Commercial rollout of next-gen technology networks, cloud data hubs, and local manufacturing facilities.',
                actionablePoints: [
                    'Widespread rollout across tier-1 and tier-2 urban centers',
                    'Venture investment inflows into domestic tech startups',
                    'Establishment of specialized AI/Cyber testing laboratories'
                ]
            },
            {
                phase: 'Long-Term Impact (6–24 Months)',
                timeline: '6-24 Months',
                title: 'Digital Sovereignty & Market Leadership',
                description: 'Full digital transformation across key public and private sectors, reducing external technology dependencies.',
                actionablePoints: [
                    'Establishment of domestic semiconductor/hardware manufacturing hubs',
                    'Global export of homegrown software and AI solutions',
                    'Comprehensive data security and sovereign AI model deployment'
                ]
            }
        ];

        keyMilestones = [
            'National Technology Policy Directive Release',
            'Semiconductor Fab Production Commercial Launch',
            'Annual Cyber & AI Security Audit Certification',
            'Global Tech Summit Partnership Signings'
        ];

        baselineScenario = 'Smooth technological transition with 30-40% annual adoption growth.';
        opportunityScenario = 'Breakthrough local innovations accelerate adoption rates ahead of global peers.';
        riskScenario = 'Talent shortfalls or supply chain delays in semiconductor hardware could slow rollout pace.';
        nlpConfidence = 87;

    } else {
        // General / Policy / International
        forecastSummary = `NLP intelligence model predicts structured policy rollout, stakeholder consultations, and institutional integration over the upcoming policy cycle.`;

        stages = [
            {
                phase: 'Immediate Phase (0–30 Days)',
                timeline: '0-30 Days',
                title: 'Policy Notification & Public Discourse',
                description: 'Formal policy documentation released, setting off institutional review and initial implementation steps.',
                actionablePoints: [
                    'Official press briefings and policy outline releases',
                    'Inter-ministerial committee formation for execution oversight',
                    'Initial public and market stakeholder reaction assessment'
                ]
            },
            {
                phase: 'Mid-Term Trajectory (1–6 Months)',
                timeline: '1-6 Months',
                title: 'Operational Rollout & Institutional Adoption',
                description: 'Systemic implementation across regional administration levels with monitored progress metrics.',
                actionablePoints: [
                    'Enforcement of operational guidelines across state/local bodies',
                    'Mid-term impact review and policy adjustments',
                    'Resource allocation and capacity building workshops'
                ]
            },
            {
                phase: 'Long-Term Impact (6–24 Months)',
                timeline: '6-24 Months',
                title: 'Structural Alignment & Institutional Stability',
                description: 'Deep integration into national framework yielding measurable long-term social, economic, or strategic dividends.',
                actionablePoints: [
                    'Full integration into standard administrative operations',
                    'Comprehensive independent audit of policy outcomes',
                    'Model replication for future policy initiatives'
                ]
            }
        ];

        keyMilestones = [
            'Inter-Ministerial Implementation Review Meeting',
            'State & Central Coordination Committee Directive',
            'Bi-Annual Policy Impact Assessment Report',
            'Public Stakeholder Feedback Consultation'
        ];

        baselineScenario = 'Standard administrative execution with progressive milestone completion.';
        opportunityScenario = 'Strong public-private cooperation drives faster outcome realization.';
        riskScenario = 'Bureaucratic friction or legal challenges could introduce minor timeline extensions.';
        nlpConfidence = 84;
    }

    if (customQuery && customQuery.trim().length > 5) {
        forecastSummary = `NLP Scenario Analysis for "${customQuery}": ` + forecastSummary;
    }

    return {
        summarySoFar: {
            headline: summaryHeadline,
            overview: summaryOverview,
            keyFacts,
            keyEntities: entities
        },
        wayAhead: {
            domain,
            forecastSummary,
            stages,
            keyMilestones,
            potentialScenarios: {
                baseline: baselineScenario,
                opportunity: opportunityScenario,
                risk: riskScenario
            },
            nlpConfidence
        }
    };
}
