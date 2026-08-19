import React from 'react';
import type { NewsArticle } from '../types/newsCard';
import { VeracityGauge } from './VeracityGauge';
import './PerspectiveViewModal.css';

interface PerspectiveViewModalProps {
    article: NewsArticle;
    allArticles: NewsArticle[];
    onClose: () => void;
}

export const PerspectiveViewModal: React.FC<PerspectiveViewModalProps> = ({
    article,
    allArticles,
    onClose
}) => {
    // Find articles from Left, Center, and Right perspectives that share category or keywords
    const leftArticles = allArticles.filter(
        a => (a.bias?.leaning === 'left' || a.bias?.leaning === 'center-left') && a.id !== article.id
    ).slice(0, 2);

    const centerArticles = allArticles.filter(
        a => a.bias?.leaning === 'center' && a.id !== article.id
    ).slice(0, 2);

    const rightArticles = allArticles.filter(
        a => (a.bias?.leaning === 'right' || a.bias?.leaning === 'center-right') && a.id !== article.id
    ).slice(0, 2);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="perspective-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <span className="modal-badge">MULTI-PERSPECTIVE RADAR</span>
                        <h2>Compare Media Alignments</h2>
                        <p className="modal-subtitle">
                            Viewing coverage across the ideological spectrum for contextual balance.
                        </p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                {/* Primary Focused Article */}
                <div className="modal-focused-card">
                    <span className="focused-label">FOCUSED STORY</span>
                    <h3>{article.title}</h3>
                    <div className="focused-meta">
                        <span className="source-name">{article.source}</span>
                        <span>•</span>
                        <span className={`bias-tag ${article.bias?.leaning || 'center'}`}>
                            {article.bias?.label || 'Center / Balanced'}
                        </span>
                        <span>•</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* 3-Column Comparative Perspective Grid */}
                <div className="perspectives-3col-grid">
                    {/* Left Column */}
                    <div className="perspective-column left-col">
                        <div className="column-header left">
                            <span className="col-dot"></span>
                            <h4>Left / Progressive</h4>
                        </div>
                        <div className="column-cards">
                            {leftArticles.length === 0 ? (
                                <div className="no-perspective-msg">No stories currently in this category.</div>
                            ) : (
                                leftArticles.map(item => (
                                    <div key={item.id} className="perspective-card">
                                        <div className="pcard-source">{item.source}</div>
                                        <h5>{item.title}</h5>
                                        <div className="pcard-footer">
                                            <VeracityGauge veracity={item.veracity} compact={true} />
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="pcard-link">
                                                Read →
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Center Column */}
                    <div className="perspective-column center-col">
                        <div className="column-header center">
                            <span className="col-dot"></span>
                            <h4>Center & Wire</h4>
                        </div>
                        <div className="column-cards">
                            {centerArticles.length === 0 ? (
                                <div className="no-perspective-msg">No stories currently in this category.</div>
                            ) : (
                                centerArticles.map(item => (
                                    <div key={item.id} className="perspective-card">
                                        <div className="pcard-source">{item.source}</div>
                                        <h5>{item.title}</h5>
                                        <div className="pcard-footer">
                                            <VeracityGauge veracity={item.veracity} compact={true} />
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="pcard-link">
                                                Read →
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="perspective-column right-col">
                        <div className="column-header right">
                            <span className="col-dot"></span>
                            <h4>Right / Nationalist</h4>
                        </div>
                        <div className="column-cards">
                            {rightArticles.length === 0 ? (
                                <div className="no-perspective-msg">No stories currently in this category.</div>
                            ) : (
                                rightArticles.map(item => (
                                    <div key={item.id} className="perspective-card">
                                        <div className="pcard-source">{item.source}</div>
                                        <h5>{item.title}</h5>
                                        <div className="pcard-footer">
                                            <VeracityGauge veracity={item.veracity} compact={true} />
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="pcard-link">
                                                Read →
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
