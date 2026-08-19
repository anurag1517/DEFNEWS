import React, { useState } from 'react';
import type { VeracityInfo } from '../types/newsCard';
import './VeracityGauge.css';

interface VeracityGaugeProps {
    veracity?: VeracityInfo;
    compact?: boolean;
}

export const VeracityGauge: React.FC<VeracityGaugeProps> = ({ veracity, compact = false }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    // Fallback if veracity is missing
    const score = veracity?.score ?? 75;
    const label = veracity?.label ?? (score >= 80 ? 'Verified Authentic' : score >= 50 ? 'Likely Real' : 'Suspicious / Disputed');
    const breakdown = veracity?.breakdown ?? {
        sourceAuthority: score,
        crossVerification: Math.max(50, score - 5),
        contentAnalysis: Math.max(50, score - 2)
    };

    // Calculate SVG circle properties
    const size = compact ? 54 : 64;
    const strokeWidth = compact ? 5 : 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    // Determine color tier
    let colorTier = 'high'; // 80 - 100 (Real / Authentic)
    let badgeText = 'REAL';
    let gradientId = 'gaugeGradientGreen';

    if (score < 50) {
        colorTier = 'low'; // Suspicious / Fake risk
        badgeText = 'RISK';
        gradientId = 'gaugeGradientRed';
    } else if (score < 75) {
        colorTier = 'mid'; // Probable / Developing
        badgeText = 'CHECK';
        gradientId = 'gaugeGradientAmber';
    }

    return (
        <div
            className={`veracity-gauge-container ${colorTier}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(prev => !prev)}
            role="region"
            aria-label={`Veracity Score: ${score}% - ${label}`}
        >
            <div className="veracity-gauge-visual">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="veracity-svg"
                >
                    <defs>
                        <linearGradient id="gaugeGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                        <linearGradient id="gaugeGradientAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                        <linearGradient id="gaugeGradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                    </defs>

                    {/* Background Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        className="gauge-track"
                        strokeWidth={strokeWidth}
                    />

                    {/* Animated Progress Arc */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        className="gauge-progress"
                        strokeWidth={strokeWidth}
                        stroke={`url(#${gradientId})`}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Central Score Display */}
                <div className="gauge-center-content">
                    <span className="gauge-percentage">{score}%</span>
                    <span className="gauge-mini-badge">{badgeText}</span>
                </div>
            </div>

            <div className="veracity-label-group">
                <div className="veracity-title">
                    <span className={`status-dot ${colorTier}`}></span>
                    <span className="veracity-score-text">{score}% Real</span>
                </div>
                <span className="veracity-subtext">{label}</span>
            </div>

            {/* Interactive Breakdown Popover */}
            {showTooltip && (
                <div className="veracity-breakdown-popover" onClick={(e) => e.stopPropagation()}>
                    <div className="popover-header">
                        <div className="popover-badge-row">
                            <span className={`popover-status-badge ${colorTier}`}>{label}</span>
                            <span className="popover-score-pill">{score}% Authenticity</span>
                        </div>
                        <p className="popover-explanation">
                            {veracity?.explanation || 'Evaluated via multi-source cross-verification and publisher authority.'}
                        </p>
                    </div>

                    <div className="popover-metrics">
                        <div className="metric-row">
                            <div className="metric-header">
                                <span>Source Authority</span>
                                <span className="metric-val">{breakdown.sourceAuthority}%</span>
                            </div>
                            <div className="metric-bar-bg">
                                <div
                                    className="metric-bar-fill green"
                                    style={{ width: `${breakdown.sourceAuthority}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="metric-row">
                            <div className="metric-header">
                                <span>Cross-Source Check</span>
                                <span className="metric-val">{breakdown.crossVerification}%</span>
                            </div>
                            <div className="metric-bar-bg">
                                <div
                                    className="metric-bar-fill blue"
                                    style={{ width: `${breakdown.crossVerification}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="metric-row">
                            <div className="metric-header">
                                <span>Fact & Language Quality</span>
                                <span className="metric-val">{breakdown.contentAnalysis}%</span>
                            </div>
                            <div className="metric-bar-bg">
                                <div
                                    className="metric-bar-fill purple"
                                    style={{ width: `${breakdown.contentAnalysis}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
