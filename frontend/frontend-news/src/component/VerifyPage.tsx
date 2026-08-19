import React, { useState, useRef } from 'react';
import { VeracityGauge } from './VeracityGauge';
import { IncidentTimelineBadge } from './IncidentTimelineBadge';
// import { BiasSpectrumBar } from './BiasSpectrumBar';
import type { VeracityInfo, IncidentOriginInfo, BiasInfo } from '../types/newsCard';
import './VerifyPage.css';

type InputMode = 'link' | 'image';

interface VerificationResult {
    success: boolean;
    inputType: string;
    analyzedHeadline: string;
    analyzedSource: string;
    veracity: VeracityInfo;
    incidentOrigin: IncidentOriginInfo;
    bias: BiasInfo;
    riskFlags: string[];
    matchedArticles: Array<{
        id: string;
        title: string;
        source: string;
        url: string;
        veracity?: VeracityInfo;
    }>;
    verdictSummary: string;
}

const detectPlatform = (url: string): { label: string; icon: string } => {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be'))
            return { label: 'YouTube', icon: '🎬' };
        if (hostname.includes('twitter.com') || hostname.includes('x.com'))
            return { label: 'X / Twitter', icon: '𝕏' };
        if (hostname.includes('instagram.com'))
            return { label: 'Instagram', icon: '📸' };
        if (hostname.includes('facebook.com') || hostname.includes('fb.com'))
            return { label: 'Facebook', icon: '👥' };
        if (hostname.includes('reddit.com'))
            return { label: 'Reddit', icon: '🔶' };
        if (hostname.includes('ndtv.com')) return { label: 'NDTV', icon: '📡' };
        if (hostname.includes('thehindu.com')) return { label: 'The Hindu', icon: '📰' };
        if (hostname.includes('bbc.com') || hostname.includes('bbc.co.uk'))
            return { label: 'BBC News', icon: '🌐' };
        if (hostname.includes('reuters.com')) return { label: 'Reuters', icon: '📡' };
        if (hostname.includes('firstpost.com')) return { label: 'Firstpost', icon: '📰' };
        if (hostname.includes('wion.com')) return { label: 'WION', icon: '📡' };
        return { label: hostname, icon: '🔗' };
    } catch {
        return { label: 'Link', icon: '🔗' };
    }
};

export const VerifyPage: React.FC = () => {
    const [mode, setMode] = useState<InputMode>('link');
    const [urlInput, setUrlInput] = useState('');
    const [captionText, setCaptionText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const platform = urlInput ? detectPlatform(urlInput) : null;

    const handleImageUpload = (file: File) => {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0]);
    };

    const runScan = async () => {
        setError(null);

        let payload: Record<string, string> = { type: mode };

        if (mode === 'link') {
            if (!urlInput.trim()) {
                setError('Please enter a URL to scan.');
                return;
            }
            payload.url = urlInput;
            if (captionText) payload.text = captionText;
        } else {
            if (!imageFile && !captionText.trim()) {
                setError('Please upload an image or add the visible headline text.');
                return;
            }
            payload.text = captionText || `Uploaded image: ${imageFile?.name || 'cutout'}`;
            if (imageFile) payload.mediaName = imageFile.name;
        }

        setIsScanning(true);
        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiBaseUrl}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Scan failed — please check server connection.');
            const data: VerificationResult = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Scan failed.');
        } finally {
            setIsScanning(false);
        }
    };

    const clearAll = () => {
        setUrlInput('');
        setCaptionText('');
        setImageFile(null);
        setImagePreview(null);
        setResult(null);
        setError(null);
    };

    const getVerdictConfig = (score: number) => {
        if (score >= 80) return { label: 'VERIFIED AUTHENTIC', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' };
        if (score >= 60) return { label: 'LIKELY REAL', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
        if (score >= 45) return { label: 'UNVERIFIED / DEVELOPING', color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' };
        return { label: 'SUSPICIOUS / DISPUTED', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' };
    };

    return (
        <div className="verify-page">

            {/* ── Page Hero Header ───────────────────────────────────── */}
            <div className="verify-hero">
                <div className="verify-hero-icon">
                    <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <div>
                    <h1 className="verify-hero-title">
                        VIGIL <span className="hero-accent">Credibility Scanner</span>
                    </h1>
                    <p className="verify-hero-desc">
                        Submit any link, video, image, or newspaper cutout — VIGIL analyses credibility,
                        political alignment, and incident origin date using multi-source intelligence.
                    </p>
                </div>
            </div>

            {/* ── Input Card ────────────────────────────────────────── */}
            <div className="verify-input-card">

                {/* Mode Toggle */}
                <div className="verify-mode-toggle">
                    <button
                        className={`mode-btn ${mode === 'link' ? 'active' : ''}`}
                        onClick={() => { setMode('link'); setResult(null); setError(null); }}
                    >
                        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        Link / URL / Video
                    </button>
                    <button
                        className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
                        onClick={() => { setMode('image'); setResult(null); setError(null); }}
                    >
                        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        Image / Cutout
                    </button>
                </div>

                {/* ── LINK MODE ─────────────────────────────────── */}
                {mode === 'link' && (
                    <div className="link-input-section">
                        <div className={`url-command-bar ${urlInput ? 'has-input' : ''}`}>
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="#94a3b8" strokeWidth="2" fill="none" className="cmd-icon">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="url"
                                className="url-input"
                                placeholder="Paste any news article, YouTube link, X post, Instagram reel, or any web URL..."
                                value={urlInput}
                                onChange={e => setUrlInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && runScan()}
                                autoFocus
                            />
                            {platform && (
                                <span className="platform-chip">
                                    {platform.icon} {platform.label}
                                </span>
                            )}
                        </div>

                        <div className="link-meta-examples">
                            <span className="meta-label">Accepts:</span>
                            {['YouTube videos', 'X posts', 'News articles', 'Instagram', 'Any web link'].map(t => (
                                <span key={t} className="accepts-chip">{t}</span>
                            ))}
                        </div>

                        <textarea
                            className="caption-textarea"
                            placeholder="Optional: Add context, extracted quote, or statement from this link to improve accuracy..."
                            rows={2}
                            value={captionText}
                            onChange={e => setCaptionText(e.target.value)}
                        />
                    </div>
                )}

                {/* ── IMAGE MODE ─────────────────────────────────── */}
                {mode === 'image' && (
                    <div className="image-input-section">
                        <div
                            className={`verify-dropzone ${dragOver ? 'drag-active' : ''} ${imagePreview ? 'has-preview' : ''}`}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            {imagePreview ? (
                                <div className="preview-wrap">
                                    <img src={imagePreview} alt="Upload preview" className="verify-preview-img" />
                                    <div className="preview-overlay">
                                        <span>Click or drop to replace</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="dropzone-content">
                                    <div className="dropzone-icon-ring">
                                        <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                    </div>
                                    <strong>Drag &amp; Drop or Click to Upload</strong>
                                    <span>Newspaper cutouts, screenshots, WhatsApp images, photos — PNG, JPG, WEBP</span>
                                </div>
                            )}
                        </div>

                        <textarea
                            className="caption-textarea"
                            placeholder="Add the headline, caption, or text visible in the image to improve analysis accuracy..."
                            rows={3}
                            value={captionText}
                            onChange={e => setCaptionText(e.target.value)}
                        />
                    </div>
                )}

                {error && (
                    <div className="verify-error-banner">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {error}
                    </div>
                )}

                {/* ── Action Row ──────────────────────────────────── */}
                <div className="verify-actions">
                    {(urlInput || imagePreview || captionText || result) && (
                        <button className="clear-btn" onClick={clearAll} disabled={isScanning}>
                            Clear All
                        </button>
                    )}
                    <button
                        className={`scan-cta-btn ${isScanning ? 'scanning' : ''}`}
                        onClick={runScan}
                        disabled={isScanning}
                    >
                        {isScanning ? (
                            <>
                                <span className="scan-spinner" />
                                <span>Running VIGIL Radar Scan...</span>
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <span>Scan &amp; Analyse Credibility</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Results Dashboard ───────────────────────────────── */}
            {result && (() => {
                const score = result.veracity.score;
                const verdict = getVerdictConfig(score);
                return (
                    <div className="verify-results-dashboard">

                        {/* Hero Verdict Banner */}
                        <div className="verdict-hero-banner" style={{
                            background: verdict.bg,
                            borderColor: verdict.border
                        }}>
                            <div className="verdict-left">
                                <span className="verdict-label-small">VIGIL VERDICT</span>
                                <h2 className="verdict-label-main" style={{ color: verdict.color }}>
                                    {verdict.label}
                                </h2>
                                <p className="verdict-headline">{result.analyzedHeadline}</p>
                                <span className="verdict-source">
                                    Source: <strong>{result.analyzedSource}</strong>
                                </span>
                            </div>
                            <div className="verdict-gauge-wrap">
                                <VeracityGauge veracity={result.veracity} />
                            </div>
                        </div>

                        {/* Metrics Row: Breakdown bars */}
                        <div className="breakdown-row">
                            {[
                                { label: 'Source Authority', val: result.veracity.breakdown.sourceAuthority, color: '#06b6d4' },
                                { label: 'Cross-Verification', val: result.veracity.breakdown.crossVerification, color: '#6366f1' },
                                { label: 'Content Analysis', val: result.veracity.breakdown.contentAnalysis, color: '#10b981' },
                            ].map(({ label, val, color }) => (
                                <div className="breakdown-metric-card" key={label}>
                                    <div className="bmc-header">
                                        <span className="bmc-label">{label}</span>
                                        <span className="bmc-pct" style={{ color }}>{val}%</span>
                                    </div>
                                    <div className="bmc-track">
                                        <div className="bmc-fill" style={{ width: `${val}%`, background: color }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Two-column: Alignment + Timeline */}
                        <div className="two-col-metrics">
                            {/* Political & Media Alignment - Commented out */}
                            {/* 
                            <div className="metric-panel">
                                <span className="panel-title">⚖️ Political &amp; Media Alignment</span>
                                <BiasSpectrumBar
                                    bias={result.bias}
                                    sourceName={result.analyzedSource}
                                />
                                <div className="alignment-description">
                                    <span className="align-label-badge" style={{
                                        color: result.bias?.leaning?.startsWith('left') ? '#3b82f6'
                                            : result.bias?.leaning === 'center' ? '#94a3b8'
                                            : '#ef4444',
                                        background: result.bias?.leaning?.startsWith('left') ? 'rgba(59,130,246,0.12)'
                                            : result.bias?.leaning === 'center' ? 'rgba(148,163,184,0.12)'
                                            : 'rgba(239,68,68,0.12)',
                                    }}>
                                        {result.bias?.label || 'Center / Balanced'}
                                    </span>
                                    <p className="align-desc-text">{result.bias?.description}</p>
                                </div>
                            </div>
                            */}

                            <div className="metric-panel full-width-metric">
                                <span className="panel-title">⏱️ Incident Origin &amp; Timeline</span>
                                <IncidentTimelineBadge
                                    incidentOrigin={result.incidentOrigin}
                                    publishedAt={result.incidentOrigin.publishedDate}
                                />
                                <div className="timeline-note">
                                    {result.incidentOrigin.latencyDays > 5
                                        ? `⚠️ This incident originated ~${result.incidentOrigin.latencyDays} days before publication. May be recycled or re-shared content.`
                                        : result.incidentOrigin.latencyDays > 0
                                        ? `ℹ️ Event occurred ${result.incidentOrigin.latencyDays} day(s) before report — normal news lag.`
                                        : '⚡ Real-time or same-day coverage detected.'}
                                </div>
                            </div>
                        </div>

                        {/* Intelligence Flags */}
                        <div className="intel-flags-panel">
                            <h3 className="intel-panel-title">
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="#06b6d4" strokeWidth="2" fill="none">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                                    <line x1="4" y1="22" x2="4" y2="15"></line>
                                </svg>
                                VIGIL Intelligence Flags
                            </h3>
                            <ul className="intel-flags-list">
                                {result.riskFlags.map((flag, idx) => (
                                    <li key={idx} className="intel-flag-item">{flag}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Corroborated Matches */}
                        {result.matchedArticles.length > 0 && (
                            <div className="matched-coverage-panel">
                                <h3 className="matched-panel-title">
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="#10b981" strokeWidth="2" fill="none">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Corroborated by VIGIL Network ({result.matchedArticles.length} active reports)
                                </h3>
                                <div className="matched-grid">
                                    {result.matchedArticles.map(m => (
                                        <a
                                            key={m.id}
                                            href={m.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="matched-card"
                                        >
                                            <span className="matched-source">{m.source}</span>
                                            <span className="matched-title">{m.title.slice(0, 90)}...</span>
                                            <span className="matched-read">Read ↗</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Verdict Summary */}
                        <div className="verdict-summary-footer">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="#06b6d4" strokeWidth="2" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                            <p>{result.verdictSummary}</p>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
