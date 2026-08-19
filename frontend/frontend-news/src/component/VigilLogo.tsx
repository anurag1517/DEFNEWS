import React from 'react';
import './VigilLogo.css';

interface VigilLogoProps {
    size?: number;
    showText?: boolean;
    animated?: boolean;
}

export const VigilLogo: React.FC<VigilLogoProps> = ({
    size = 36,
    showText = true,
    animated = true
}) => {
    return (
        <div className="vigil-logo-wrapper">
            <div className={`vigil-logo-icon ${animated ? 'animated' : ''}`} style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="vigil-svg"
                >
                    <defs>
                        <linearGradient id="vigilBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="50%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                        <linearGradient id="vigilIrisGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                        <filter id="vigilGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Shield Backdrop */}
                    <path
                        d="M32 5L53 14.5V29.5C53 43.5 43.8 54.8 32 58C20.2 54.8 11 43.5 11 29.5V14.5L32 5Z"
                        fill="rgba(15, 23, 42, 0.92)"
                        stroke="url(#vigilBrandGrad)"
                        strokeWidth="2.5"
                    />

                    {/* Radar Eye Outer Contour */}
                    <path
                        d="M18 30C22 21 27 17 32 17C37 17 42 21 46 30C42 39 37 43 32 43C27 43 22 39 18 30Z"
                        stroke="url(#vigilBrandGrad)"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        filter="url(#vigilGlowFilter)"
                    />

                    {/* Radar Pulse Ring */}
                    <circle
                        cx="32"
                        cy="30"
                        r="8.5"
                        stroke="rgba(6, 182, 212, 0.6)"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        className="radar-pulse-ring"
                    />

                    {/* Core Veracity Iris */}
                    <circle cx="32" cy="30" r="6" fill="url(#vigilIrisGrad)" />
                    <circle cx="32" cy="30" r="2.8" fill="#ffffff" />

                    {/* Reticle / Crosshair Nodes */}
                    <line x1="32" y1="11" x2="32" y2="15" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
                    <line x1="32" y1="45" x2="32" y2="49" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
                    <line x1="13" y1="30" x2="17" y2="30" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
                    <line x1="47" y1="30" x2="51" y2="30" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>

            {showText && (
                <div className="vigil-brand-text">
                    <span className="vigil-title">
                        VIGIL<span className="vigil-dot">.</span>
                    </span>
                    <span className="vigil-tagline">INTELLIGENCE</span>
                </div>
            )}
        </div>
    );
};
