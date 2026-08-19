import { Request, Response, NextFunction } from "express";
import * as newsService from "../services/news.service";
import {
    calculateSourceAuthority,
    analyzeContentReliability,
    extractIncidentOrigin
} from "../services/veracity.service";
import { evaluateArticleBias } from "../services/bias.service";
import { VeracityInfo, VeracityBreakdown } from "../types/newsItem";

export async function verifyClaim(req: Request, res: Response, next: NextFunction) {
    try {
        const { text, url, type = 'text', mediaName } = req.body;

        let analyzedText = (text || '').trim();
        let detectedSource = 'Independent / Unverified Submission';
        let extractedTitle = '';

        // If URL provided, attempt metadata extraction or domain resolution
        if (url && url.startsWith('http')) {
            try {
                const parsedUrl = new URL(url);
                const hostname = parsedUrl.hostname.replace('www.', '');

                if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                    detectedSource = 'YouTube Video Submission';
                } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
                    detectedSource = 'X (Twitter) Post Submission';
                } else {
                    detectedSource = hostname;
                }

                // Attempt quick title / meta fetch if no text provided
                if (!analyzedText) {
                    const resp = await fetch(url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
                        }
                    });
                    if (resp.ok) {
                        const html = await resp.text();
                        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                        const descMatch = html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i);
                        extractedTitle = titleMatch ? titleMatch[1].trim() : '';
                        const extractedDesc = descMatch ? descMatch[1].trim() : '';
                        analyzedText = `${extractedTitle} ${extractedDesc}`.trim();
                    }
                }
            } catch (urlErr) {
                console.warn('URL metadata extraction warning:', urlErr);
            }
        }

        if (!analyzedText) {
            analyzedText = mediaName ? `Scanned document: ${mediaName}` : 'Submitted claim statement';
        }

        const title = extractedTitle || analyzedText.slice(0, 120);
        const description = analyzedText;
        const nowIso = new Date().toISOString();

        // 1. Cross-reference against current feed articles
        const cachedArticles = await newsService.getCachedNews();
        const keywords = analyzedText
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((w: string) => w.length > 3);

        const matchedArticles = cachedArticles.filter(item => {
            const itemText = `${item.title} ${item.description}`.toLowerCase();
            let matches = 0;
            for (const kw of keywords) {
                if (itemText.includes(kw)) matches++;
            }
            return matches >= 2;
        }).slice(0, 3);

        // 2. Compute Veracity Metrics
        const sourceAuthority = calculateSourceAuthority(detectedSource, title, description);
        const crossVerificationScore = matchedArticles.length >= 2 ? 90 : matchedArticles.length === 1 ? 78 : 55;
        const contentResult = analyzeContentReliability(title, description, detectedSource);

        const rawScore = (0.45 * sourceAuthority) + (0.30 * crossVerificationScore) + (0.25 * contentResult.score);
        const score = Math.round(Math.min(99, Math.max(12, rawScore)));

        let label: VeracityInfo['label'];
        if (score >= 80) {
            label = 'Verified Authentic';
        } else if (score >= 60) {
            label = 'Likely Real';
        } else if (score >= 45) {
            label = 'Unverified / Developing';
        } else {
            label = 'Suspicious / Disputed';
        }

        const breakdown: VeracityBreakdown = {
            sourceAuthority: Math.round(sourceAuthority),
            crossVerification: Math.round(crossVerificationScore),
            contentAnalysis: Math.round(contentResult.score)
        };

        const veracity: VeracityInfo = {
            score,
            label,
            breakdown,
            explanation: contentResult.explanation
        };

        // 3. Detect Incident Origin Date
        const incidentOrigin = extractIncidentOrigin(title, description, nowIso);

        // 4. Determine Ideological Bias
        const bias = evaluateArticleBias({ source: detectedSource, title, description });

        // 5. Generate Risk & Intelligence Flags
        const riskFlags: string[] = [];
        if (incidentOrigin.latencyDays >= 14) {
            riskFlags.push(`⚠️ Recycled Content Warning: Incident detected from ${incidentOrigin.formattedOriginDate} (${incidentOrigin.latencyDays} days ago).`);
        } else if (incidentOrigin.latencyDays >= 2) {
            riskFlags.push(`⏱️ Prior Event: Incident occurred ~${incidentOrigin.latencyDays} days before submission.`);
        } else {
            riskFlags.push('⚡ Fresh / Real-time event context detected.');
        }

        if (matchedArticles.length > 0) {
            riskFlags.push(`✅ Corroborated with ${matchedArticles.length} active coverage reports in VIGIL network.`);
        } else {
            riskFlags.push('⚠️ Uncorroborated Claim: No matching reports from primary news wires currently found.');
        }

        if (contentResult.score < 60) {
            riskFlags.push('🚩 Linguistic Alert: High density of sensationalized / clickbait emotional framing.');
        }

        res.json({
            success: true,
            inputType: type,
            analyzedHeadline: title,
            analyzedSource: detectedSource,
            veracity,
            incidentOrigin,
            bias,
            riskFlags,
            matchedArticles: matchedArticles.map(a => ({
                id: a.id,
                title: a.title,
                source: a.source,
                url: a.url,
                veracity: a.veracity
            })),
            verdictSummary: `VIGIL Veracity Scanner computed a ${score}% credibility score for this submission (${label}). Source classified as ${bias.label}.`
        });
    } catch (error) {
        console.error('[API ERROR] Failed in verifyClaim controller:', error);
        next(error);
    }
}
