import React from 'react';
import type { IncidentOriginInfo } from '../types/newsCard';
import './IncidentTimelineBadge.css';

interface IncidentTimelineBadgeProps {
    incidentOrigin?: IncidentOriginInfo;
    publishedAt: string;
}

export const IncidentTimelineBadge: React.FC<IncidentTimelineBadgeProps> = ({ incidentOrigin, publishedAt }) => {
    const formatFriendlyDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const originDateStr = incidentOrigin?.formattedOriginDate || formatFriendlyDate(incidentOrigin?.originDate || publishedAt);
    const pubDateStr = formatFriendlyDate(publishedAt);
    const latencyDays = incidentOrigin?.latencyDays ?? 0;
    const latencyLabel = incidentOrigin?.latencyLabel || (latencyDays === 0 ? 'Live / Same-day reporting' : `Incident occurred ${latencyDays}d prior`);
    const isHistorical = latencyDays >= 30;
    const isDelayed = latencyDays >= 3 && latencyDays < 30;

    return (
        <div className="incident-timeline-wrapper" title={`Incident Date: ${originDateStr} | Published: ${pubDateStr}`}>
            <div className="incident-timeline-track">
                {/* Origin Milestone */}
                <div className="timeline-node origin">
                    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="timeline-icon">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <div className="node-text">
                        <span className="node-tag">Incident Origin</span>
                        <strong className="node-date">{originDateStr}</strong>
                    </div>
                </div>

                {/* Timeline connector arrow */}
                <div className="timeline-connector">
                    <span className="connector-line"></span>
                    <span className="connector-arrow">→</span>
                </div>

                {/* Reporting Milestone */}
                <div className="timeline-node report">
                    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="timeline-icon">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <div className="node-text">
                        <span className="node-tag">Reported</span>
                        <strong className="node-date">{pubDateStr}</strong>
                    </div>
                </div>
            </div>

            {/* Latency / Lag Indicator Pill */}
            <div className={`incident-latency-pill ${isHistorical ? 'historical' : isDelayed ? 'delayed' : 'fresh'}`}>
                {latencyDays === 0 ? (
                    <span>⚡ {latencyLabel}</span>
                ) : isHistorical ? (
                    <span>⚠️ {latencyLabel}</span>
                ) : (
                    <span>⏱️ {latencyLabel}</span>
                )}
            </div>
        </div>
    );
};
