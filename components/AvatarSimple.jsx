// components/AvatarSimple.jsx
'use client';

import { useState, useEffect, useRef } from 'react';

export default function AvatarSimple({ 
    text, 
    voiceId, 
    onSpeakStart, 
    onSpeakEnd 
}) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const audioRef = useRef(null);

    // When text changes, generate speech
    useEffect(() => {
        if (text && !isSpeaking) {
            generateSpeech(text);
        }
    }, [text]);

    const generateSpeech = async (speechText) => {
        if (!speechText) return;

        try {
            setIsSpeaking(true);
            onSpeakStart?.();

            const response = await fetch('/api/wunjo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'speak',
                    text: speechText,
                    voiceId: voiceId,
                }),
            });

            if (!response.ok) throw new Error('Failed to generate speech');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.load();
                audioRef.current.play();
            }
        } catch (error) {
            console.error('Speech generation failed:', error);
        } finally {
            setIsSpeaking(false);
            onSpeakEnd?.();
        }
    };

    // Cleanup audio URL when unmounting
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '12px',
            minHeight: '180px',
            transition: 'all 0.3s ease',
            border: isSpeaking ? '3px solid #2563eb' : '3px solid transparent',
            boxShadow: isSpeaking ? '0 0 20px rgba(37, 99, 235, 0.3)' : 'none'
        }}>
            <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: isSpeaking 
                    ? 'linear-gradient(135deg, #2563eb, #7c3aed)' 
                    : 'linear-gradient(135deg, #94a3b8, #64748b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '50px',
                color: 'white',
                transition: 'all 0.3s ease',
                transform: isSpeaking ? 'scale(1.05)' : 'scale(1)'
            }}>
                {isSpeaking ? '🔊' : '👤'}
            </div>
            <p style={{
                marginTop: '12px',
                fontSize: '16px',
                fontWeight: '500',
                color: isSpeaking ? '#2563eb' : '#64748b'
            }}>
                {isSpeaking ? '🔴 Speaking...' : 'Ready'}
            </p>
            {text && !isSpeaking && (
                <p style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    maxWidth: '300px',
                    textAlign: 'center',
                    marginTop: '4px'
                }}>
                    "{text.slice(0, 80)}{text.length > 80 ? '...' : ''}"
                </p>
            )}
            <audio ref={audioRef} style={{ display: 'none' }} />
        </div>
    );
}