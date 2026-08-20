import React, { useState, useEffect } from 'react';
import type { NewsArticle, WayAheadInfo } from '../types/newsCard';
import './WayAheadModal.css';

interface WayAheadModalProps {
    article: NewsArticle;
    onClose: () => void;
}

export const WayAheadModal: React.FC<WayAheadModalProps> = ({ article, onClose }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [analysis, setAnalysis] = useState<WayAheadInfo | null>(article.wayAhead || null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'wayAhead' | 'summary'>('wayAhead');
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [isRefining, setIsRefining] = useState<boolean>(false);

    const fetchAnalysis = async (query?: string) => {
        if (query) {
            setIsRefining(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiBaseUrl}/api/way-ahead`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: article.title,
                    description: article.description,
                    category: article.category,
                    source: article.source,
                    customQuery: query
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch Way Ahead predictive intelligence from backend.');
            }

            const data = await response.json();
            if (data.success && data.analysis) {
                setAnalysis(data.analysis);
            } else {
                throw new Error('Invalid analysis format received.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating NLP path prediction.');
        } finally {
            setLoading(false);
            setIsRefining(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, [article]);

    const handleRefineSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customPrompt.trim()) {
            fetchAnalysis(customPrompt.trim());
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="wayahead-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="wayahead-modal-header">
                    <div className="header-left-group">
                        <div className="glowing-wayahead-badge">
                            <span className="badge-sparkle">🔮</span> WAY AHEAD
                        </div>
                        <h2>Path Ahead &amp; Context Intelligence</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                {/* Article Context Strip */}
                <div className="article-context-strip">
                    <div className="context-meta">
                        <span className="context-source">{article.source}</span>
                        <span className="meta-sep">•</span>
                        <span className="context-cat">{article.category}</span>
                        <span className="meta-sep">•</span>
                        <span className="context-date">{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="context-title">{article.title}</h3>
                </div>

                {/* Tab Controls */}
                <div className="wayahead-tab-bar">
                    <button
                        className={`tab-btn ${activeTab === 'wayAhead' ? 'active' : ''}`}
                        onClick={() => setActiveTab('wayAhead')}
                    >
                        🚀 Way Ahead (Path Forecast)
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
                        onClick={() => setActiveTab('summary')}
                    >
                        📝 Summary So Far
                    </button>
                </div>

                {/* Body Content */}
                <div className="wayahead-modal-body">
                    {loading ? (
                        <div className="wayahead-loading-state">
                            <div className="pulse-loader"></div>
                            <h4>Extracting NLP Entity Maps &amp; Calculating Path Ahead...</h4>
                            <p>Analyzing story context, domain precedents, and policy trajectory.</p>
                        </div>
                    ) : error ? (
                        <div className="wayahead-error-state">
                            <span className="error-icon">⚠️</span>
                            <h4>Analysis Error</h4>
                            <p>{error}</p>
                            <button onClick={() => fetchAnalysis()} className="retry-btn">
                                Retry Prediction
                            </button>
                        </div>
                    ) : analysis ? (
                        <>
                            {activeTab === 'wayAhead' && (
                                <div className="tab-content wayahead-content">
                                    {/* Domain & Confidence Bar */}
                                    <div className="domain-confidence-bar">
                                        <div className="domain-pill">
                                            <span className="label">Target Domain:</span>
                                            <strong className="val">{analysis.wayAhead.domain}</strong>
                                        </div>
                                        <div className="confidence-meter">
                                            <span className="label">NLP Confidence:</span>
                                            <div className="conf-bar-track">
                                                <div
                                                    className="conf-bar-fill"
                                                    style={{ width: `${analysis.wayAhead.nlpConfidence}%` }}
                                                ></div>
                                            </div>
                                            <span className="pct">{analysis.wayAhead.nlpConfidence}%</span>
                                        </div>
                                    </div>

                                    {/* Executive Forecast Summary Callout */}
                                    <div className="forecast-summary-box">
                                        <div className="box-header">
                                            <span className="icon">📡</span>
                                            <h4>NLP Strategic Projection Summary</h4>
                                        </div>
                                        <p>{analysis.wayAhead.forecastSummary}</p>
                                    </div>

                                    {/* Multi-Horizon Timeline Cards */}
                                    <div className="stages-timeline">
                                        <h4 className="section-subtitle">⌛ Multi-Stage Roadmap Ahead</h4>
                                        <div className="stages-grid">
                                            {analysis.wayAhead.stages.map((stage, idx) => (
                                                <div key={idx} className={`stage-card stage-${idx + 1}`}>
                                                    <div className="stage-top">
                                                        <span className="stage-num">Phase 0{idx + 1}</span>
                                                        <span className="stage-timeline-pill">{stage.timeline}</span>
                                                    </div>
                                                    <h5>{stage.title}</h5>
                                                    <p className="stage-desc">{stage.description}</p>
                                                    <div className="stage-actionables">
                                                        <span className="act-title">Key Expected Outcomes:</span>
                                                        <ul>
                                                            {stage.actionablePoints.map((pt, pIdx) => (
                                                                <li key={pIdx}>{pt}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Milestones & Scenarios 2-Column Grid */}
                                    <div className="milestones-scenarios-grid">
                                        {/* Left Column: Key Milestones */}
                                        <div className="panel-box milestones-panel">
                                            <h4>🎯 Key Milestones to Watch</h4>
                                            <ul className="milestone-list">
                                                {analysis.wayAhead.keyMilestones.map((m, mIdx) => (
                                                    <li key={mIdx} className="milestone-item">
                                                        <span className="m-bullet">◈</span>
                                                        <span>{m}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Right Column: Scenario Matrix */}
                                        <div className="panel-box scenarios-panel">
                                            <h4>📊 Scenario Forecast Matrix</h4>
                                            <div className="scenario-item baseline">
                                                <span className="sc-tag">Baseline</span>
                                                <p>{analysis.wayAhead.potentialScenarios.baseline}</p>
                                            </div>
                                            <div className="scenario-item opportunity">
                                                <span className="sc-tag">Best Case / Upside</span>
                                                <p>{analysis.wayAhead.potentialScenarios.opportunity}</p>
                                            </div>
                                            <div className="scenario-item risk">
                                                <span className="sc-tag">Risk / Challenge</span>
                                                <p>{analysis.wayAhead.potentialScenarios.risk}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'summary' && (
                                <div className="tab-content summary-content">
                                    {/* Executive Overview */}
                                    <div className="summary-overview-card">
                                        <h4>📋 Executive Summary So Far</h4>
                                        <p className="overview-text">{analysis.summarySoFar.overview}</p>
                                    </div>

                                    {/* Key Established Facts */}
                                    <div className="panel-box facts-panel">
                                        <h4>✅ Key Facts Established So Far</h4>
                                        <ul className="facts-list">
                                            {analysis.summarySoFar.keyFacts.map((fact, fIdx) => (
                                                <li key={fIdx} className="fact-item">
                                                    <span className="fact-check">✓</span>
                                                    <span>{fact}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Key Stakeholders & Entities */}
                                    <div className="panel-box entities-panel">
                                        <h4>🏛️ Primary Stakeholders &amp; Entities Involved</h4>
                                        <div className="entities-chips">
                                            {analysis.summarySoFar.keyEntities.map((entity, eIdx) => (
                                                <span key={eIdx} className="entity-chip">
                                                    {entity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* Footer Bar with Custom Query Prompt */}
                <div className="wayahead-modal-footer">
                    <form onSubmit={handleRefineSubmit} className="refine-form">
                        <span className="prompt-label">🤖 Refine Scenario:</span>
                        <input
                            type="text"
                            placeholder="e.g. What if budget increases by 20%? or What is the defense impact?"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="refine-input"
                            disabled={isRefining || loading}
                        />
                        <button type="submit" className="refine-btn" disabled={isRefining || loading || !customPrompt.trim()}>
                            {isRefining ? 'Predicting...' : 'Predict Path →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
