import React, { useState, useRef } from 'react';
// import { BiasSpectrumBar } from './BiasSpectrumBar';
import type { VeracityInfo, IncidentOriginInfo, BiasInfo } from '../types/newsCard';
import './VerifyPage.css';

type InputMode = 'link' | 'image';

interface AIAnalysis {
    credibilityScore: number;
    verdict: string;
    reasoning: string;
    redFlags: string[];
    recommendation: string;
    modelUsed: string;
}

// ── Markdown renderer (mirrors WayAheadModal) ──────────────────────────────
const parseBold = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const renderMarkdown = (content: string): React.ReactNode[] => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="chat-spacer" />;
        if (trimmed.startsWith('### ')) return <h4 key={index} className="chat-h4">{trimmed.replace(/^###\s+/, '')}</h4>;
        if (trimmed.startsWith('## ')) return <h3 key={index} className="chat-h3">{trimmed.replace(/^##\s+/, '')}</h3>;
        if (trimmed.startsWith('# ')) return <h2 key={index} className="chat-h2">{trimmed.replace(/^#\s+/, '')}</h2>;
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
                <div key={index} className="chat-bullet-item">
                    <span className="bullet-dot">•</span>
                    <span>{parseBold(trimmed.slice(2))}</span>
                </div>
            );
        }
        if (trimmed.startsWith('> ')) return <blockquote key={index} className="chat-quote">{parseBold(trimmed.slice(2))}</blockquote>;
        return <p key={index} className="chat-paragraph">{parseBold(trimmed)}</p>;
    });
};

const formatReadableDate = (iso: string): string => {
    try {
        return new Date(iso).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    } catch {
        return iso;
    }
};

interface VerificationResult {
    success: boolean;
    inputType: string;
    analyzedHeadline: string;
    analyzedSource: string;
    veracity: VeracityInfo;
    incidentOrigin: IncidentOriginInfo;
    bias: BiasInfo;
    riskFlags: string[];
    aiAnalysis: AIAnalysis | null;
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
                        SATARK <span className="hero-accent">Credibility Scanner</span>
                    </h1>
                    <p className="verify-hero-desc">
                        Submit any link, video, image, or newspaper cutout — SATARK analyses credibility,
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
                                <span>Running Scan...</span>
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <span>Run Scan</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Results ─────────────────────────────────────────── */}
            {result && (() => {
                const verdict = getVerdictConfig(result.veracity.score);
                const hasReasoning = !!result.aiAnalysis?.reasoning;
                return (
                    <div className="satark-response-block">

                        {/* Header: avatar + verdict pill */}
                        <div className="satark-response-header">
                            <div className="satark-avatar">🤖</div>
                            <div>
                                <span className="satark-sender-name">SATARK AI</span>
                                <span className="satark-timestamp">{formatReadableDate(result.incidentOrigin.publishedDate)}</span>
                            </div>
                            <span className="satark-verdict-pill" style={{ background: verdict.bg, color: verdict.color, borderColor: verdict.border }}>
                                {verdict.label}
                            </span>
                        </div>

                        {/* Body: pure prose */}
                        <div className="satark-response-body">

                            {/* AI reasoning — main content */}
                            {hasReasoning ? (
                                <div className="satark-md-body">
                                    {renderMarkdown(result.aiAnalysis!.reasoning)}
                                </div>
                            ) : (
                                <p className="satark-prose">{result.verdictSummary}</p>
                            )}

                            {/* Footer: source + date */}
                            <div className="satark-meta-footer">
                                <span className="satark-meta-source">
                                    📰 {result.analyzedSource}
                                </span>
                                <span className="satark-meta-sep">·</span>
                                <span className="satark-meta-date">
                                    Published {formatReadableDate(result.incidentOrigin.publishedDate)}
                                </span>
                                {result.aiAnalysis?.modelUsed && (
                                    <>
                                        <span className="satark-meta-sep">·</span>
                                        <span className="satark-model-tag">{result.aiAnalysis.modelUsed}</span>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
