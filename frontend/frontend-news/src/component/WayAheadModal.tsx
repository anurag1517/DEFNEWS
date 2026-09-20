import React, { useState, useEffect, useRef } from 'react';
import type { NewsArticle } from '../types/newsCard';
import './WayAheadModal.css';

interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
    modelUsed?: string;
}

interface WayAheadModalProps {
    article: NewsArticle;
    onClose: () => void;
}

const QUICK_PROMPTS = [
    { label: '🚀 Way Ahead & Roadmap', prompt: 'What is the Way Ahead and multi-stage strategic roadmap for this story?' },
    { label: '⚡ News Implications', prompt: 'What are the short-term and long-term implications of this news?' },
    { label: '📜 Past News Context', prompt: 'Has this type of news occurred in the past? Summarize related historical context.' },
    { label: '📊 Scenario Matrix', prompt: 'What are the baseline, upside, and risk scenarios for this development?' }
];

export const WayAheadModal: React.FC<WayAheadModalProps> = ({ article, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputQuery, setInputQuery] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeModel, setActiveModel] = useState<string>('SATARK AI Engine');

    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Initialize Welcome Greeting
        const welcomeMsg: ChatMessage = {
            id: 'welcome-1',
            sender: 'assistant',
            text: `Hello! I am **SATARK AI**, your Strategic & Geopolitical Intelligence Chatbot.

I've cross-referenced **"${article.title}"** against our news feeds and historical archive.

Click a quick prompt chip below or type your question:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: 'SATARK AI Assistant'
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
                throw new Error('Failed to reach SATARK AI backend server.');
            }

            const data = await response.json();
            if (data.success && data.reply) {
                const assistantMsg: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    sender: 'assistant',
                    text: data.reply,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    modelUsed: data.modelUsed
                };
                if (data.modelUsed) setActiveModel(data.modelUsed);
                setMessages(prev => [...prev, assistantMsg]);
            } else {
                throw new Error('Invalid response received from SATARK AI Chatbot.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating AI response.');
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
            <div className="wayahead-modal-content chatbot-mode" onClick={(e) => e.stopPropagation()}>

                {/* Modal Header */}
                <div className="wayahead-modal-header">
                    <div className="header-left-group">
                        <div className="glowing-wayahead-badge">
                            <span className="badge-sparkle">🔮</span> SATARK AI CHAT
                        </div>
                        <div className="header-title-wrapper">
                            <h2>Way Ahead &amp; Intelligence Assistant</h2>
                            <span className="ai-model-pill">{activeModel}</span>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                {/* Article Context Header Strip */}
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

                {/* Chat Scroll Container */}
                <div className="chat-scroll-container">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                            <div className="chat-avatar">
                                {msg.sender === 'assistant' ? '🤖' : '👤'}
                            </div>
                            <div className="chat-bubble">
                                <div className="bubble-header">
                                    <span className="sender-name">
                                        {msg.sender === 'assistant' ? 'SATARK AI Intelligence' : 'You'}
                                    </span>
                                    <span className="bubble-time">{msg.timestamp}</span>
                                </div>
                                <div className="bubble-body">
                                    {renderMarkdown(msg.text)}
                                </div>
                                {msg.modelUsed && msg.sender === 'assistant' && (
                                    <div className="bubble-footer">
                                        <span className="model-tag">Model: {msg.modelUsed}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isGenerating && (
                        <div className="chat-bubble-wrapper assistant generating">
                            <div className="chat-avatar">🤖</div>
                            <div className="chat-bubble">
                                <div className="bubble-body thinking-state">
                                    <span className="pulse-loader-sm"></span>
                                    <span>SATARK AI is analyzing feeds &amp; calculating intelligence response...</span>
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
                    <span className="prompts-label">Suggested Questions:</span>
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
                            placeholder="Ask SATARK AI about implications, past events, or way ahead..."
                            value={inputQuery}
                            onChange={(e) => setInputQuery(e.target.value)}
                            className="chat-input"
                            disabled={isGenerating}
                        />
                        <button
                            type="submit"
                            className="chat-send-btn"
                            disabled={isGenerating || !inputQuery.trim()}
                        >
                            {isGenerating ? 'Analyzing...' : 'Send ➔'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};
