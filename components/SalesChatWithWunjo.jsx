// components/SalesChatWithWunjo.jsx
// Sales Chat Component with Wunjo CE AI Integration

'use client';

import { useState, useRef, useEffect } from 'react';
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
    const [selectedText, setSelectedText] = useState('');
    const [showWunjo, setShowWunjo] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Generate AI response
    const generateAIResponse = async (userMessage) => {
        try {
            // This is where you'd call your OpenAI/Claude API
            // For now, we'll use a simple response
            const responses = [
                "That's a great question! Let me think about that for a moment.",
                "I can definitely help you with that. Here's what I recommend...",
                "Great question! Based on your needs, I'd suggest looking at our website packages.",
                "I understand. Let me explain how our process works.",
                "That's exactly what we specialize in. Let me tell you more.",
                "Thanks for asking! The best approach would be to start with a consultation.",
                "Excellent question. Our websites are built to convert visitors into customers.",
                "I appreciate your interest. Here's how we can help your business grow.",
                "Let me share some examples of how we've helped similar businesses.",
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        } catch (error) {
            console.error('AI response error:', error);
            return "I'm sorry, I'm having trouble processing that. Could you please try again?";
        }
    };

    // Send message
    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setSelectedText(userMessage);
        
        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Generate AI response
            const aiResponse = await generateAIResponse(userMessage);
            
            // Add AI response
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
            
            // Set selected text for Wunjo
            setSelectedText(aiResponse);
            
            // Auto-generate speech with Wunjo
            setShowWunjo(true);
            
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I'm sorry, I encountered an error. Please try again." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Wunjo generation complete
    const handleWunjoComplete = (result) => {
        console.log('Wunjo generation complete:', result);
    };

    // Handle Wunjo error
    const handleWunjoError = (error) => {
        console.error('Wunjo error:', error);
    };

    return (
        <div className="sales-chat" style={{ 
            maxWidth: '800px', 
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

            <div className="messages" style={{
                height: '400px',
                overflowY: 'auto',
                padding: '20px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderTop: 'none',
                borderRadius: '0 0 12px 12px'
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
                            color: msg.role === 'user' ? 'white' : 'black',
                            wordWrap: 'break-word'
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

            {/* Wunjo AI Component */}
            {showWunjo && selectedText && (
                <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                }}>
                    <h4 style={{ margin: '0 0 10px', color: '#334155' }}>🎯 AI Sales Representative</h4>
                    <WunjoAI 
                        text={selectedText}
                        voiceId={voiceId}
                        faceId={faceId}
                        onGenerationComplete={handleWunjoComplete}
                        onGenerationError={handleWunjoError}
                    />
                </div>
            )}

            <div className="input-area" style={{
                display: 'flex',
                gap: '10px',
                marginTop: '15px'
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
            </div>

            {/* Wunjo Controls Toggle */}
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <button
                    onClick={() => setShowWunjo(!showWunjo)}
                    style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#64748b'
                    }}
                >
                    {showWunjo ? 'Hide' : 'Show'} AI Video Assistant
                </button>
            </div>
        </div>
    );
}
