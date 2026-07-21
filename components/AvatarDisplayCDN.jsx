// components/AvatarDisplayCDN.jsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function AvatarDisplayCDN({ 
    text = '',
    voiceId = 'default',
    faceId = 'default',
    onSpeakStart,
    onSpeakEnd
}) {
    const containerRef = useRef(null);
    const avatarRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [sdkReady, setSdkReady] = useState(false);

    // Load SDK from CDN
    useEffect(() => {
        let isMounted = true;

        const loadSDK = () => {
            // Check if already loaded
            if (window.PrometheusAvatar) {
                setSdkReady(true);
                setIsLoading(false);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@prometheusavatar/core/dist/index.umd.js';
            script.onload = () => {
                if (isMounted) {
                    setSdkReady(true);
                    setIsLoading(false);
                    // Initialize avatar after SDK loads
                    if (containerRef.current) {
                        initAvatar();
                    }
                }
            };
            script.onerror = () => {
                console.error('Failed to load Prometheus Avatar SDK from CDN');
                setIsLoading(false);
            };
            document.head.appendChild(script);
        };

        loadSDK();

        return () => {
            isMounted = false;
            if (avatarRef.current && avatarRef.current.destroy) {
                avatarRef.current.destroy();
            }
        };
    }, []);

    // Initialize avatar
    const initAvatar = async () => {
        if (!containerRef.current || !window.PrometheusAvatar) return;

        try {
            const { createAvatar } = window.PrometheusAvatar;
            const avatar = await createAvatar({
                container: containerRef.current,
                // Use a default model or replace with your own
                modelUrl: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display@0.4.0/test/assets/haru/haru_greeter_t03.model3.json',
            });
            avatarRef.current = avatar;
            if (text) {
                speakText(text, avatar);
            }
        } catch (error) {
            console.error('Failed to initialize avatar:', error);
        }
    };

    // Speak text
    const speakText = async (speechText, avatarInstance = avatarRef.current) => {
        const avatar = avatarInstance || avatarRef.current;
        if (!avatar || !speechText) return;

        try {
            setIsSpeaking(true);
            onSpeakStart?.();

            await avatar.speak({
                text: speechText,
                voice: voiceId,
                expression: 'happy',
                speed: 1.0
            });

            setIsSpeaking(false);
            onSpeakEnd?.();
        } catch (error) {
            console.error('Failed to speak:', error);
            setIsSpeaking(false);
            onSpeakEnd?.();
        }
    };

    // React to text changes
    useEffect(() => {
        if (text && avatarRef.current && !isSpeaking && sdkReady) {
            speakText(text);
        }
    }, [text, sdkReady]);

    return (
        <div className="avatar-container" style={{ 
            width: '100%', 
            maxWidth: '400px',
            margin: '0 auto',
            position: 'relative'
        }}>
            <div 
                ref={containerRef} 
                style={{ 
                    width: '100%', 
                    height: '400px',
                    background: '#f0f4f8',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}
            />
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#94a3b8'
                }}>
                    Loading avatar...
                </div>
            )}
            {isSpeaking && (
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px'
                }}>
                    🔴 Speaking...
                </div>
            )}
        </div>
    );
}