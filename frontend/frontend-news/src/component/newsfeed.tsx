import { useState, useEffect } from 'react';
import './newsfeed.css';
import type { NewsArticle, NewsFeedProps } from '../types/newsCard';
import { VeracityGauge } from './VeracityGauge';
import { IncidentTimelineBadge } from './IncidentTimelineBadge';
import { WayAheadModal } from './WayAheadModal';

type VeracityFilter = 'all' | 'authentic' | 'likely' | 'caution';

export const NewsFeed = ({ currentCategory }: NewsFeedProps) => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [veracityFilter, setVeracityFilter] = useState<VeracityFilter>('all');
    const [wayAheadArticle, setWayAheadArticle] = useState<NewsArticle | null>(null);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiBaseUrl}/api/news?category=${currentCategory}`);
            if (!response.ok) {
                throw new Error('Failed to fetch news from server.');
            }
            const data = await response.json();
            const sortedData = (data as NewsArticle[]).sort((a, b) => {
                const scoreA = a.veracity?.score ?? (a.isTrusted ? 85 : 60);
                const scoreB = b.veracity?.score ?? (b.isTrusted ? 85 : 60);
                if (Math.abs(scoreB - scoreA) > 15) {
                    return scoreB - scoreA;
                }
                return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
            });
            setArticles(sortedData);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching news.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [currentCategory]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredArticles = articles.filter(article => {
        // Veracity filter check
        const vScore = article.veracity?.score ?? (article.isTrusted ? 85 : 60);
        if (veracityFilter === 'authentic') return vScore >= 80;
        if (veracityFilter === 'likely') return vScore >= 60 && vScore < 80;
        if (veracityFilter === 'caution') return vScore < 60;
        return true;
    });

    if (loading) {
        return (
            <div className="newsfeed-grid">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="news-card skeleton">
                        <div className="skeleton-image"></div>
                        <div className="news-card-content">
                            <div className="skeleton-line skeleton-meta"></div>
                            <div className="skeleton-line skeleton-title"></div>
                            <div className="skeleton-line skeleton-title short"></div>
                            <div className="skeleton-line skeleton-text"></div>
                            <div className="skeleton-line skeleton-text"></div>
                            <div className="skeleton-line skeleton-link"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="newsfeed-error-container">
                <div className="error-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h3>Unable to Load Feed</h3>
                <p>{error}</p>
                <button onClick={fetchNews} className="retry-button">
                    Retry Fetching
                </button>
            </div>
        );
    }

    if (articles.length === 0) {
        return (
            <div className="newsfeed-empty-container">
                <div className="empty-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <h3>No Articles Found</h3>
                <p>There are currently no news stories available for this category.</p>
            </div>
        );
    }

    return (
        <div className="newsfeed-wrapper">
            {/* Dual Radar Filters: Veracity & Media Alignment */}
            <div className="radar-filters-container">
                {/* Credibility Filter Row */}
                <div className="veracity-filter-bar">
                    <span className="filter-label">Credibility:</span>
                    <div className="filter-chips">
                        <button
                            className={`filter-chip ${veracityFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setVeracityFilter('all')}
                        >
                            All Stories ({articles.length})
                        </button>
                        <button
                            className={`filter-chip green ${veracityFilter === 'authentic' ? 'active' : ''}`}
                            onClick={() => setVeracityFilter('authentic')}
                        >
                            🟢 Verified Real (80%+) ({articles.filter(a => (a.veracity?.score ?? (a.isTrusted ? 85 : 60)) >= 80).length})
                        </button>
                        <button
                            className={`filter-chip amber ${veracityFilter === 'likely' ? 'active' : ''}`}
                            onClick={() => setVeracityFilter('likely')}
                        >
                            🟡 Probable (60-79%) ({articles.filter(a => {
                                const s = a.veracity?.score ?? (a.isTrusted ? 85 : 60);
                                return s >= 60 && s < 80;
                            }).length})
                        </button>
                        <button
                            className={`filter-chip red ${veracityFilter === 'caution' ? 'active' : ''}`}
                            onClick={() => setVeracityFilter('caution')}
                        >
                            🔴 Needs Check (&lt;60%) ({articles.filter(a => (a.veracity?.score ?? (a.isTrusted ? 85 : 60)) < 60).length})
                        </button>
                    </div>
                </div>

                {/* Media Alignment Spectrum Filter Row - Commented out */}
                {/* 
                <div className="bias-filter-bar">
                    <span className="filter-label">Perspective:</span>
                    <div className="filter-chips">
                        <button
                            className={`filter-chip ${biasFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setBiasFilter('all')}
                        >
                            All Perspectives
                        </button>
                        <button
                            className={`filter-chip blue ${biasFilter === 'left' ? 'active' : ''}`}
                            onClick={() => setBiasFilter('left')}
                        >
                            🔵 Left / Progressive ({articles.filter(a => a.bias?.leaning === 'left' || a.bias?.leaning === 'center-left').length})
                        </button>
                        <button
                            className={`filter-chip gray ${biasFilter === 'center' ? 'active' : ''}`}
                            onClick={() => setBiasFilter('center')}
                        >
                            ⚪ Center &amp; Wire ({articles.filter(a => a.bias?.leaning === 'center').length})
                        </button>
                        <button
                            className={`filter-chip crimson ${biasFilter === 'right' ? 'active' : ''}`}
                            onClick={() => setBiasFilter('right')}
                        >
                            🔴 Right / Nationalist ({articles.filter(a => a.bias?.leaning === 'right' || a.bias?.leaning === 'center-right').length})
                        </button>
                    </div>
                </div>
                */}
            </div>

            {filteredArticles.length === 0 ? (
                <div className="newsfeed-empty-container">
                    <h3>No Matching Stories</h3>
                    <p>No articles match the selected credibility and perspective filters.</p>
                    <button
                        onClick={() => {
                            setVeracityFilter('all');
                        }}
                        className="retry-button"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className="newsfeed-grid">
                    {filteredArticles.map((article) => (
                        <article key={article.id} className="news-card">
                            <div className="news-card-image-wrapper">
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="news-card-image"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
                                    }}
                                />
                                <span className="news-card-category">{article.category}</span>
                            </div>

                            <div className="news-card-content">
                                {/* Card Header with Veracity Gauge */}
                                <div className="card-header-row">
                                    <div className="news-card-meta">
                                        <span className="news-card-source">{article.source}</span>
                                        <span className="news-card-dot">•</span>
                                        <span className="news-card-date">{formatDate(article.publishedAt)}</span>
                                    </div>
                                    <VeracityGauge veracity={article.veracity} />
                                </div>

                                {/* Media Alignment & Bias Spectrum Bar - Commented out */}
                                {/* 
                                <div className="card-bias-row">
                                    <BiasSpectrumBar bias={article.bias} sourceName={article.source} />
                                </div>
                                */}

                                <h2 className="news-card-title">{article.title}</h2>

                                {/* Incident Origin Date Indicator */}
                                <IncidentTimelineBadge
                                    incidentOrigin={article.incidentOrigin}
                                    publishedAt={article.publishedAt}
                                />

                                <p className="news-card-description">{article.description}</p>

                                <div className="news-card-footer">
                                    <button
                                        className="wayahead-modal-btn"
                                        onClick={() => setWayAheadArticle(article)}
                                        title="Predict the path ahead & view summary so far using NLP"
                                    >
                                        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 8l4 4-4 4M8 12h8"></path>
                                        </svg>
                                        Way Ahead
                                    </button>

                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="news-card-link"
                                    >
                                        Read Full Story
                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="link-arrow">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Way Ahead NLP Predictive Modal */}
            {wayAheadArticle && (
                <WayAheadModal
                    article={wayAheadArticle}
                    onClose={() => setWayAheadArticle(null)}
                />
            )}
        </div>
    );
};


