import React, { useState } from 'react';
import type { BiasInfo } from '../types/newsCard';
import './BiasSpectrumBar.css';

interface BiasSpectrumBarProps {
    bias?: BiasInfo;
    sourceName: string;
}

export const BiasSpectrumBar: React.FC<BiasSpectrumBarProps> = ({ bias, sourceName }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const leaning = bias?.leaning ?? 'center';
    const score = bias?.score ?? 0; // -100 to +100
    const label = bias?.label ?? 'Center / Balanced';
    const sourceType = bias?.sourceType ?? 'mainstream_media';

    // Map -100..+100 score to 0%..100% position on the spectrum bar
    const indicatorPercent = Math.max(5, Math.min(95, ((score + 100) / 200) * 100));

    const getBadgeStyle = () => {
        if (leaning === 'left' || leaning === 'center-left') return 'left-badge';
        if (leaning === 'right' || leaning === 'center-right') return 'right-badge';
        return 'center-badge';
    };

    return (
        <div
            className="bias-spectrum-container"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(prev => !prev)}
            role="region"
            aria-label={`Media Bias: ${label}`}
        >
            <div className="bias-top-row">
                <div className={`bias-status-pill ${getBadgeStyle()}`}>
                    <span className="bias-dot"></span>
                    <span className="bias-label-text">{label}</span>
                </div>
                <span className="source-type-tag">{sourceType.replace('_', ' ')}</span>
            </div>

            {/* Visual 3-Zone Gradient Spectrum Track */}
            <div className="spectrum-track-wrapper">
                <div className="spectrum-track">
                    <span className="spectrum-zone left" title="Left / Progressive"></span>
                    <span className="spectrum-zone center" title="Center / Balanced Wire"></span>
                    <span className="spectrum-zone right" title="Right / Nationalist"></span>
                </div>

                {/* Movable Active Leaning Pointer */}
                <div
                    className="spectrum-indicator"
                    style={{ left: `${indicatorPercent}%` }}
                    title={`Bias Position: ${score > 0 ? `+${score}` : score}`}
                >
                    <div className={`indicator-marker ${getBadgeStyle()}`}></div>
                </div>
            </div>

            <div className="spectrum-axis-labels">
                <span className="axis-label left">Left</span>
                <span className="axis-label center">Center</span>
                <span className="axis-label right">Right</span>
            </div>

            {/* Detailed Ideological Profile Popover */}
            {showTooltip && (
                <div className="bias-popover" onClick={(e) => e.stopPropagation()}>
                    <div className="bias-popover-header">
                        <strong className="popover-source-title">{sourceName}</strong>
                        <span className={`popover-bias-badge ${getBadgeStyle()}`}>{label}</span>
                    </div>

                    <p className="popover-bias-desc">
                        {bias?.description || 'Independent editorial outlet cataloged by VIGIL Source Intelligence Radar.'}
                    </p>

                    <div className="popover-details">
                        <div className="detail-item">
                            <span className="detail-key">Classification:</span>
                            <span className="detail-val">{sourceType.toUpperCase().replace('_', ' ')}</span>
                        </div>
                        {bias?.twitterHandle && (
                            <div className="detail-item">
                                <span className="detail-key">X (Twitter):</span>
                                <a
                                    href={`https://x.com/${bias.twitterHandle.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="detail-link"
                                >
                                    {bias.twitterHandle}
                                </a>
                            </div>
                        )}
                        {bias?.youtubeChannel && (
                            <div className="detail-item">
                                <span className="detail-key">YouTube:</span>
                                <span className="detail-val">{bias.youtubeChannel}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
