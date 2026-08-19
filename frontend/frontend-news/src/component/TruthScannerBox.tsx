import React, { useState, useRef } from 'react';
import { VeracityGauge } from './VeracityGauge';
import { IncidentTimelineBadge } from './IncidentTimelineBadge';
// import { BiasSpectrumBar } from './BiasSpectrumBar';
import type { VeracityInfo, IncidentOriginInfo, BiasInfo } from '../types/newsCard';
import './TruthScannerBox.css';

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

export const TruthScannerBox: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'text' | 'link' | 'photo'>('text');
    const [textContent, setTextContent] = useState('');
    const [urlContent, setUrlContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        setError(null);
        let payload: any = { type: activeTab };

        if (activeTab === 'text') {
            if (!textContent.trim()) {
                setError('Please paste some text, an article snippet, or a statement to analyze.');
                return;
            }
            payload.text = textContent;
        } else if (activeTab === 'link') {
            if (!urlContent.trim()) {
                setError('Please enter a valid news, video, or social media link.');
                return;
            }
            payload.url = urlContent;
        } else if (activeTab === 'photo') {
            if (!imageFile && !textContent.trim()) {
                setError('Please upload an image/newspaper cutout or provide a caption/headline.');
                return;
            }
            payload.text = textContent || `Scanned cutout: ${imageFile?.name || 'Image submission'}`;
            payload.mediaName = imageFile?.name;
        }

        setIsScanning(true);
        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiBaseUrl}/api/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Verification request failed. Please check server connection.');
            }

            const data: VerificationResult = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Failed to scan claim.');
        } finally {
            setIsScanning(false);
        }
    };

    const setSampleText = (sample: string) => {
        setActiveTab('text');
        setTextContent(sample);
    };

    const clearAll = () => {
        setTextContent('');
        setUrlContent('');
        setImageFile(null);
        setImagePreview(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="truth-scanner-card">
            <div className="scanner-header-row">
                <div className="scanner-title-group">
                    <div className="scanner-insignia">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <polyline points="9 11 11 13 15 9"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h3 className="scanner-heading">VIGIL Truth Scanner &amp; Credibility Radar</h3>
                        <p className="scanner-subheading">
                            Paste any text, newspaper cutout, video, photo, or link to inspect authenticity, incident date, and bias.
                        </p>
                    </div>
                </div>

                <button
                    className="collapse-toggle-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label="Toggle scanner box"
                >
                    {isCollapsed ? 'Expand Scanner ▼' : 'Minimize ▲'}
                </button>
            </div>

            {!isCollapsed && (
                <div className="scanner-body">
                    {/* Mode Navigation Tabs */}
                    <div className="scanner-tab-bar">
                        <button
                            className={`scanner-tab ${activeTab === 'text' ? 'active' : ''}`}
                            onClick={() => setActiveTab('text')}
                        >
                            📝 Text &amp; Cutout
                        </button>
                        <button
                            className={`scanner-tab ${activeTab === 'link' ? 'active' : ''}`}
                            onClick={() => setActiveTab('link')}
                        >
                            🔗 Web / Video / X Link
                        </button>
                        <button
                            className={`scanner-tab ${activeTab === 'photo' ? 'active' : ''}`}
                            onClick={() => setActiveTab('photo')}
                        >
                            🖼️ Image &amp; Newspaper Cutout
                        </button>
                    </div>

                    {/* Tab Inputs */}
                    <div className="scanner-input-container">
                        {activeTab === 'text' && (
                            <div className="input-group">
                                <textarea
                                    className="scanner-textarea"
                                    placeholder="Paste news headline, article excerpt, WhatsApp forward, quote, or claim here..."
                                    rows={4}
                                    value={textContent}
                                    onChange={(e) => setTextContent(e.target.value)}
                                />
                                <div className="sample-chips">
                                    <span className="sample-label">Try sample:</span>
                                    <button
                                        className="sample-btn"
                                        onClick={() => setSampleText('Ministry of Defence signed landmark bilateral agreement yesterday for next-generation radar systems with Doordarshan reporting live.')}
                                    >
                                        Official Defence Release
                                    </button>
                                    <button
                                        className="sample-btn"
                                        onClick={() => setSampleText('SHOCKING VIRAL LEAK: Unbelievable miracle energy source hidden by authorities exposed on August 10!')}
                                    >
                                        Sensational Viral Claim
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'link' && (
                            <div className="input-group">
                                <div className="url-input-wrapper">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" className="url-icon">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                    </svg>
                                    <input
                                        type="url"
                                        className="scanner-url-input"
                                        placeholder="https://news-outlet.com/article... or https://youtube.com/watch?v=..."
                                        value={urlContent}
                                        onChange={(e) => setUrlContent(e.target.value)}
                                    />
                                </div>
                                <textarea
                                    className="scanner-textarea secondary"
                                    placeholder="Optional: Add context, notes, or specific statement from this link..."
                                    rows={2}
                                    value={textContent}
                                    onChange={(e) => setTextContent(e.target.value)}
                                />
                            </div>
                        )}

                        {activeTab === 'photo' && (
                            <div className="input-group">
                                <div
                                    className={`dropzone-box ${imagePreview ? 'has-preview' : ''}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    {imagePreview ? (
                                        <div className="preview-container">
                                            <img src={imagePreview} alt="Uploaded cutout preview" className="uploaded-preview" />
                                            <span className="change-img-text">Click or drag another image to replace</span>
                                        </div>
                                    ) : (
                                        <div className="dropzone-placeholder">
                                            <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.8" fill="none">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                            <strong>Upload or Drag Newspaper Cutout / Photo / Screenshot</strong>
                                            <span>Supports PNG, JPG, WEBP formats</span>
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    className="scanner-textarea secondary"
                                    placeholder="Add extracted text, headline, or claim visible in this image..."
                                    rows={2}
                                    value={textContent}
                                    onChange={(e) => setTextContent(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {error && <div className="scanner-error-msg">⚠️ {error}</div>}

                    {/* Action Buttons */}
                    <div className="scanner-action-row">
                        {(textContent || urlContent || imagePreview || result) && (
                            <button className="scanner-clear-btn" onClick={clearAll} disabled={isScanning}>
                                Clear Input
                            </button>
                        )}

                        <button
                            className={`scanner-submit-btn ${isScanning ? 'scanning' : ''}`}
                            onClick={runAnalysis}
                            disabled={isScanning}
                        >
                            {isScanning ? (
                                <>
                                    <span className="scanner-spinner"></span>
                                    <span>Scanning Intelligence &amp; Veracity Radar...</span>
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <span>Scan &amp; Verify Credibility</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Live Intelligence Report Result Card */}
                    {result && (
                        <div className="scanner-result-dashboard">
                            <div className="result-top-banner">
                                <div className="result-headline-info">
                                    <span className="result-tag">VERIFICATION REPORT</span>
                                    <h4>{result.analyzedHeadline}</h4>
                                    <span className="result-source-attribution">
                                        Source / Entity: <strong>{result.analyzedSource}</strong>
                                    </span>
                                </div>
                                <VeracityGauge veracity={result.veracity} />
                            </div>

                            <div className="result-grid-metrics">
                                {/* Incident Origin Date */}
                                <div className="metric-box">
                                    <span className="box-title">⏱️ Temporal Incident Origin</span>
                                    <IncidentTimelineBadge
                                        incidentOrigin={result.incidentOrigin}
                                        publishedAt={result.incidentOrigin.publishedDate}
                                    />
                                </div>

                                {/* Media Bias & Alignment - Commented out */}
                                {/* 
                                <div className="metric-box">
                                    <span className="box-title">⚖️ Political &amp; Media Stance</span>
                                    <BiasSpectrumBar
                                        bias={result.bias}
                                        sourceName={result.analyzedSource}
                                    />
                                </div>
                                */}
                            </div>

                            {/* Risk & Intelligence Flags */}
                            <div className="result-flags-section">
                                <span className="flags-heading">Radar Intelligence Insights:</span>
                                <ul className="flags-list">
                                    {result.riskFlags.map((flag, idx) => (
                                        <li key={idx} className="flag-item">{flag}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Corroborated Matches if Any */}
                            {result.matchedArticles.length > 0 && (
                                <div className="matched-articles-section">
                                    <span className="matched-heading">Corroborated Coverage in VIGIL Feed:</span>
                                    <div className="matched-links-row">
                                        {result.matchedArticles.map((m) => (
                                            <a
                                                key={m.id}
                                                href={m.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="matched-article-pill"
                                            >
                                                <strong>{m.source}:</strong> {m.title.slice(0, 55)}... ↗
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="result-summary-text">{result.verdictSummary}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
