import React, { useState, useEffect, useRef } from 'react';
import type { NewsArticle } from '../types/newsCard';
import './WayAheadModal.css';

interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
    modelUsed?: string;
    webSearchCount?: number;
}

interface WayAheadModalProps {
    article: NewsArticle;
    onClose: () => void;
}

const QUICK_PROMPTS = [
    { label: '🚀 What is the way ahead?', prompt: 'What is the way ahead and expected strategic roadmap for this story?' },
    { label: '⚡ Key implications & impact', prompt: 'What are the short-term and long-term implications of this news?' },
    { label: '📜 Background & past context', prompt: 'Has this occurred in the past? Summarize related background and context.' },
    { label: '📊 Scenarios & risk outlook', prompt: 'What are the baseline, upside, and risk scenarios for this development?' }
];

export const WayAheadModal: React.FC<WayAheadModalProps> = ({ article, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputQuery, setInputQuery] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [activeModel, setActiveModel] = useState<string>('Meta Llama-3.3-70B');
    const [error, setError] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Initialize Welcome Greeting
        const welcomeMsg: ChatMessage = {
            id: 'welcome-1',
            sender: 'assistant',
            text: `Hello! I'm your **Way Ahead** intelligence assistant. I analyze news stories using strategic step-by-step reasoning and live multi-wire search.

Ask me about what lies ahead, policy implications, background history, or upcoming milestones for this story.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: 'Meta Llama-3.3-70B'
        };
        setMessages([welcomeMsg]);
    }, [article]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isGenerating]);

    const handleSendMessage = async (userPrompt: string) => {
        if (!userPrompt.trim() || isGenerating) return;

        const newMsgId = `user-${Date.now()}`;
        const userMsg: ChatMessage = {
            id: newMsgId,
            sender: 'user',
            text: userPrompt.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInputQuery('');
        setIsGenerating(true);
        setError(null);

        // Format history for backend payload
        const conversationHistory = updatedMessages
            .filter(m => m.id !== 'welcome-1')
            .map(m => ({
                role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
                content: m.text
            }));

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
                    messages: conversationHistory
                })
            });

            if (!response.ok) {
                throw new Error('Failed to reach backend service.');
            }

            const data = await response.json();
            if (data.success && data.reply) {
                const returnedModel = data.modelUsed || activeModel;
                setActiveModel(returnedModel);
                const assistantMsg: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    sender: 'assistant',
                    text: data.reply,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    modelUsed: returnedModel,
                    webSearchCount: data.webSearchCount
                };
                setMessages(prev => [...prev, assistantMsg]);
            } else {
                throw new Error('Invalid response received from assistant.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while answering your question.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputQuery);
    };

    const parseBold = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const renderMarkdown = (content: string) => {
        const lines = content.split('\n');
        return lines.map((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={index} className="chat-spacer" />;

            if (trimmed.startsWith('### ')) {
                return <h4 key={index} className="chat-h4">{trimmed.replace(/^###\s+/, '')}</h4>;
            }
            if (trimmed.startsWith('## ')) {
                return <h3 key={index} className="chat-h3">{trimmed.replace(/^##\s+/, '')}</h3>;
            }
            if (trimmed.startsWith('# ')) {
                return <h2 key={index} className="chat-h2">{trimmed.replace(/^#\s+/, '')}</h2>;
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const text = trimmed.slice(2);
                return (
                    <div key={index} className="chat-bullet-item">
                        <span className="bullet-dot">•</span>
                        <span>{parseBold(text)}</span>
                    </div>
                );
            }
            if (trimmed.startsWith('> ')) {
                return <blockquote key={index} className="chat-quote">{parseBold(trimmed.slice(2))}</blockquote>;
            }

            return <p key={index} className="chat-paragraph">{parseBold(trimmed)}</p>;
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="wayahead-modal-content" onClick={(e) => e.stopPropagation()}>

                {/* Modal Header */}
                <div className="wayahead-modal-header">
                    <div className="header-left-group">
                        <div className="header-icon-wrap">
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                            </svg>
                        </div>
                        <div className="header-title-wrapper">
                            <div className="header-main-title">
                                <h2>Way Ahead</h2>
                                <span className="header-model-chip" title="Active AI Inference Engine">
                                    <span className="model-chip-pulse"></span>
                                    {activeModel}
                                </span>
                            </div>
                            <span className="header-badge">Reasoning &amp; Live Web Search</span>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                {/* Concise Article Context Strip */}
                <div className="article-context-bar">
                    <span className="context-tag">STORY</span>
                    <span className="context-title" title={article.title}>{article.title}</span>
                    <span className="context-source">{article.source}</span>
                </div>

                {/* Chat Scroll Container */}
                <div className="chat-scroll-container">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                            <div className="chat-avatar">
                                {msg.sender === 'assistant' ? (
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                                        <circle cx="12" cy="5" r="2"></circle>
                                        <path d="M12 7v4"></path>
                                        <line x1="8" y1="16" x2="8" y2="16"></line>
                                        <line x1="16" y1="16" x2="16" y2="16"></line>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                )}
                            </div>
                            <div className="chat-bubble">
                                <div className="bubble-header">
                                    <div className="bubble-header-left">
                                        <span className="sender-name">
                                            {msg.sender === 'assistant' ? 'Way Ahead AI' : 'You'}
                                        </span>
                                        {msg.sender === 'assistant' && msg.modelUsed && (
                                            <span className="bubble-model-tag" title={`Inference Model: ${msg.modelUsed}`}>
                                                <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                                </svg>
                                                {msg.modelUsed}
                                            </span>
                                        )}
                                        {msg.sender === 'assistant' && typeof msg.webSearchCount === 'number' && msg.webSearchCount > 0 && (
                                            <span className="bubble-search-count" title={`${msg.webSearchCount} live web search results analyzed`}>
                                                🔍 {msg.webSearchCount} web sources
                                            </span>
                                        )}
                                    </div>
                                    <span className="bubble-time">{msg.timestamp}</span>
                                </div>
                                <div className="bubble-body">
                                    {renderMarkdown(msg.text)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isGenerating && (
                        <div className="chat-bubble-wrapper assistant generating">
                            <div className="chat-avatar">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                                    <circle cx="12" cy="5" r="2"></circle>
                                    <path d="M12 7v4"></path>
                                </svg>
                            </div>
                            <div className="chat-bubble">
                                <div className="bubble-header">
                                    <div className="bubble-header-left">
                                        <span className="sender-name">Way Ahead AI</span>
                                        <span className="generating-model-pill" title="Active model synthesizing output">
                                            <span className="generating-spinner"></span>
                                            Inference: {activeModel}
                                        </span>
                                    </div>
                                </div>
                                <div className="bubble-body thinking-state">
                                    <span className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </span>
                                    <span>Searching web &amp; generating trajectory with <strong>{activeModel}</strong>...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="chat-error-banner">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Quick Action Suggestion Chips */}
                <div className="quick-prompts-bar">
                    <span className="prompts-label">Quick Prompts:</span>
                    <div className="chips-wrapper">
                        {QUICK_PROMPTS.map((qp, idx) => (
                            <button
                                key={idx}
                                className="quick-prompt-chip"
                                onClick={() => handleSendMessage(qp.prompt)}
                                disabled={isGenerating}
                            >
                                {qp.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Input Bar */}
                <div className="chat-input-bar">
                    <form onSubmit={handleSubmit} className="chat-form">
                        <input
                            type="text"
                            placeholder="Ask a question about this story, roadmap, or implications..."
                            value={inputQuery}
                            onChange={(e) => setInputQuery(e.target.value)}
                            className="chat-input"
                            disabled={isGenerating}
                        />
                        <button
                            type="submit"
                            className="chat-send-btn"
                            disabled={isGenerating || !inputQuery.trim()}
                            title="Send message"
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};
