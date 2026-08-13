import React, { useState, useEffect } from 'react';
import './newsfeed.css';

export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    source: string;
    isTrusted: boolean;
    category: string;
    publishedAt: string;
    url: string;
    imageUrl: string;
}

interface NewsFeedProps {
    currentCategory: string;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ currentCategory }) => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch from backend server
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiBaseUrl}/api/news?category=${currentCategory}`);
            if (!response.ok) {
                throw new Error('Failed to fetch news from server.');
            }
            const data = await response.json();
            setArticles(data);
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
        <div className="newsfeed-grid">
            {articles.map((article) => (
                <article key={article.id} className="news-card">
                    <div className="news-card-image-wrapper">
                        <img 
                            src={article.imageUrl} 
                            alt={article.title} 
                            className="news-card-image"
                            onError={(e) => {
                                // Fallback image if unsplash fails or goes offline
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
                            }}
                        />
                        <span className="news-card-category">{article.category}</span>
                    </div>

                    <div className="news-card-content">
                        <div className="news-card-meta">
                            <span className="news-card-source">{article.source}</span>
                            <span className="news-card-dot">•</span>
                            <span className="news-card-date">{formatDate(article.publishedAt)}</span>
                        </div>

                        {article.isTrusted ? (
                            <div className="trust-badge trusted">
                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="trust-icon">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    <polyline points="9 11 11 13 15 9"></polyline>
                                </svg>
                                <span>Verified Trusted Source</span>
                            </div>
                        ) : (
                            <div className="trust-badge untrusted">
                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="trust-icon">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <span>Unverified / Independent Source</span>
                            </div>
                        )}

                        <h2 className="news-card-title">{article.title}</h2>
                        <p className="news-card-description">{article.description}</p>
                        
                        <div className="news-card-footer">
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
    );
};
