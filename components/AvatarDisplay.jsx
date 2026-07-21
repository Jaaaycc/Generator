// components/AvatarDisplay.jsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function AvatarDisplay({ 
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
    const [sdkLoaded, setSdkLoaded] = useState(false);

    // Load SDK dynamically on client side only
    useEffect(() => {
        let isMounted = true;

        const loadSDK = async () => {
            try {
                // Dynamically import the SDK (client-side only)
                const { createAvatar } = await import('@prometheusavatar/core');
                
                if (!isMounted) return;
                
                setSdkLoaded(true);

                // Initialize avatar after SDK loads
                if (containerRef.current) {
                    await initAvatar(createAvatar);
                }
            } catch (error) {
                console.error('Failed to load avatar SDK:', error);
                setIsLoading(false);
            }
        };

        loadSDK();

        return () => {
            isMounted = false;
            if (avatarRef.current && avatarRef.current.destroy) {
                avatarRef.current.destroy();
            }
        };
    }, []);

    // Initialize avatar function
    const initAvatar = async (createAvatarFn) => {
        if (!containerRef.current) return;

        try {
            const avatar = await createAvatarFn({
                container: containerRef.current,
                // You can use a default model or upload your own
                modelUrl: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display@0.4.0/test/assets/haru/haru_greeter_t03.model3.json',
            });
            
            avatarRef.current = avatar;
            setIsLoading(false);

            if (text) {
                speakText(text, avatar);
            }
        } catch (error) {
            console.error('Failed to initialize avatar:', error);
            setIsLoading(false);
        }
    };

    // Speak text function
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

    // React to text prop changes
    useEffect(() => {
        if (text && avatarRef.current && !isSpeaking && sdkLoaded) {
            speakText(text);
        }
    }, [text, sdkLoaded]);

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