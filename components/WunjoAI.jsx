// components/WunjoAI.jsx
// Wunjo CE Client Component - AI Voice and Video Generation

'use client';

import { useState, useRef } from 'react';

export default function WunjoAI({ 
    text = '', 
    voiceId = 'default', 
    faceId = 'default',
    onGenerationStart,
    onGenerationComplete,
    onGenerationError
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [status, setStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);
    const videoRef = useRef(null);

    const generateSpeech = async (speechText = text) => {
        if (!speechText) {
            console.warn('No text provided for speech generation');
            return;
        }

        try {
            setIsGenerating(true);
            setStatus('loading');
            setProgress(20);
            onGenerationStart?.();

            const response = await fetch('/api/wunjo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'speak',
                    text: speechText,
                    voiceId: voiceId,
                }),
            });

            setProgress(60);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate speech');
            }

            setProgress(80);

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setStatus('ready');
            setProgress(100);

            onGenerationComplete?.({ type: 'audio', url });

            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.load();
                audioRef.current.play().catch(e => console.warn('Auto-play prevented:', e));
            }

        } catch (error) {
            console.error('Speech generation failed:', error);
            setStatus('error');
            onGenerationError?.(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateVideo = async (speechText = text) => {
        if (!speechText) {
            console.warn('No text provided for video generation');
            return;
        }

        try {
            setIsGenerating(true);
            setStatus('loading');
            setProgress(10);
            onGenerationStart?.();

            const response = await fetch('/api/wunjo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'video',
                    text: speechText,
                    voiceId: voiceId,
                    faceId: faceId,
                }),
            });

            setProgress(50);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate video');
            }

            setProgress(80);

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            setStatus('ready');
            setProgress(100);

            onGenerationComplete?.({ type: 'video', url });

            if (videoRef.current) {
                videoRef.current.src = url;
                videoRef.current.load();
                videoRef.current.play().catch(e => console.warn('Auto-play prevented:', e));
            }

        } catch (error) {
            console.error('Video generation failed:', error);
            setStatus('error');
            onGenerationError?.(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const reset = () => {
        setAudioUrl(null);
        setVideoUrl(null);
        setStatus('idle');
        setProgress(0);
        setIsGenerating(false);
    };

    return (
        <div style={{ padding: '10px 0' }}>
            <audio ref={audioRef} style={{ display: 'none' }} />
            
            {videoUrl && (
                <video 
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="wunjo-video"
                />
            )}

            {status === 'loading' && (
                <div className="wunjo-loading">
                    <div className="wunjo-spinner"></div>
                    <p>Generating... {progress}%</p>
                    <div className="wunjo-progress-bar">
                        <div className="wunjo-progress-fill" style={{ width: progress + '%' }}></div>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="wunjo-error">
                    <p>❌ Generation failed. Please try again.</p>
                </div>
            )}

            <div className="wunjo-controls">
                <button 
                    onClick={() => generateSpeech()}
                    disabled={isGenerating || !text}
                    className="wunjo-btn wunjo-btn-primary"
                >
                    🔊 {isGenerating ? 'Generating...' : 'Speak (Audio)'}
                </button>

                <button 
                    onClick={() => generateVideo()}
                    disabled={isGenerating || !text}
                    className="wunjo-btn wunjo-btn-secondary"
                >
                    🎬 {isGenerating ? 'Generating...' : 'Generate Video'}
                </button>

                {audioUrl && (
                    <button 
                        onClick={() => {
                            if (audioRef.current) {
                                audioRef.current.play();
                            }
                        }}
                        className="wunjo-btn wunjo-btn-success"
                    >
                        ▶️ Play Audio
                    </button>
                )}

                <button 
                    onClick={reset}
                    className="wunjo-btn wunjo-btn-outline"
                >
                    🔄 Reset
                </button>
            </div>
        </div>
    );
}
