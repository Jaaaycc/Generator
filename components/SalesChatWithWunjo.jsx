// components/SalesChatWithWunjo.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import AvatarSimple from './AvatarSimple';  // ← Use the new component
import WunjoAI from './WunjoAI';

export default function SalesChatWithWunjo({ 
    initialMessage = "Hello! I'm your AI sales assistant. How can I help you today?",
    voiceId = 'default',
    faceId = 'default'
}) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: initialMessage }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentResponse, setCurrentResponse] = useState('');
    const [showAvatar, setShowAvatar] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const generateAIResponse = async (userMessage) => {
        // Replace with your real AI later
        const responses = [
            "That's a great question! Based on your needs, I'd recommend our Business Pro package at $1,750. It includes 8-10 pages, payment integration, and SEO submission.",
            "I understand. Let me explain how our custom PHP websites outrank WordPress. We build from scratch with zero bloat.",
            "Thanks for asking! Our Ecommerce package starts at $5,600 and includes up to 100 products, shopping cart, and full inventory management.",
            "That's exactly what we specialize in. Let me share how we've helped similar businesses grow their online presence.",
            "Great question! Unlike WordPress, you own the code and there are no monthly fees. It's a one-time investment.",
            "I appreciate your interest. Here's how we can build a website that brings you more leads.",
            "Let me break down the costs: Business Pro is $1,750, Ecommerce is $5,600, and custom SaaS starts at $10,000. All one-time fees."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const aiResponse = await generateAIResponse(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
            setCurrentResponse(aiResponse);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="sales-chat" style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div className="chat-header" style={{
                textAlign: 'center',
                padding: '20px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                borderRadius: '12px 12px 0 0'
            }}>
                <h2>🤖 AI Sales Assistant</h2>
                <p style={{ opacity: 0.9, margin: '5px 0 0' }}>Your AI-powered sales representative</p>
            </div>

            {showAvatar && (
                <div style={{
                    padding: '20px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <AvatarSimple   // ← Changed to AvatarSimple
                        text={currentResponse}
                        voiceId={voiceId}
                        onSpeakStart={() => console.log('Speaking started')}
                        onSpeakEnd={() => console.log('Speaking ended')}
                    />
                </div>
            )}

            <div className="messages" style={{
                height: '300px',
                overflowY: 'auto',
                padding: '20px',
                background: '#f8fafc',
                borderLeft: '1px solid #e2e8f0',
                borderRight: '1px solid #e2e8f0'
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: msg.role === 'user' ? '#2563eb' : '#e2e8f0',
                            color: msg.role === 'user' ? 'white' : 'black'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#94a3b8' }}>
                        <span>Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area" style={{
                display: 'flex',
                gap: '10px',
                padding: '15px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '0 0 12px 12px'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about our services..."
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none'
                    }}
                    disabled={isLoading}
                />
                <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    style={{
                        padding: '12px 24px',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                        opacity: isLoading || !input.trim() ? 0.6 : 1
                    }}
                >
                    Send
                </button>
                <button
                    onClick={() => setShowAvatar(!showAvatar)}
                    style={{
                        padding: '12px 16px',
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '20px'
                    }}
                    title="Toggle Avatar"
                >
                    {showAvatar ? '👤' : '👤❌'}
                </button>
            </div>
        </div>
    );
}