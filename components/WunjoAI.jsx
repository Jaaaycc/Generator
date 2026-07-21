// components/WunjoAI.jsx
// Wunjo CE Client Component - AI Voice and Video Generation

'use client';

import { useState, useRef, useEffect } from 'react';

export default function WunjoAI({ 
    text = '', 
    voiceId = 'default', 
    faceId = 'default',
    autoGenerate = false, // New: Auto-generate when text changes
    onGenerationStart,
    onGenerationComplete,
    onGenerationError
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | loading | ready | error
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const audioRef = useRef(null);
    const videoRef = useRef(null);
    const prevTextRef = useRef('');

    // Auto-generate speech when text changes (optional)
    useEffect(() => {
        if (autoGenerate && text && text !== prevTextRef.current && !isGenerating) {
            prevTextRef.current = text;
            generateSpeech(text);
        }
    }, [text, autoGenerate]);

    const generateSpeech = async (speechText = text) => {
        if (!speechText) {
            console.warn('No text provided for speech generation');
            return;
        }

        try {
            setIsGenerating(true);
            setStatus('loading');
            setProgress(20);
            setErrorMessage('');
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
            setErrorMessage(error.message || 'Failed to generate speech');
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

        // Check if Wunjo CE is running
        try {
            const statusCheck = await fetch('/api/wunjo');
            const statusData = await statusCheck.json();
            
            if (statusData.status === 'offline') {
                setStatus('error');
                setErrorMessage('Wunjo CE is not running. Please start Wunjo CE first.');
                return;
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage('Cannot connect to Wunjo CE. Please make sure it\'s running on port 8000.');
            return;
        }

        try {
            setIsGenerating(true);
            setStatus('loading');
            setProgress(10);
            setErrorMessage('');
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
            setErrorMessage(error.message || 'Failed to generate video');
            onGenerationError?.(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const reset = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setAudioUrl(null);
        setVideoUrl(null);
        setStatus('idle');
        setProgress(0);
        setIsGenerating(false);
        setErrorMessage('');
    };

    const checkWunjoStatus = async () => {
        try {
            const response = await fetch('/api/wunjo');
            const data = await response.json();
            return data.status === 'online';
        } catch {
            return false;
        }
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
                    style={{ marginBottom: '10px' }}
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
                    <p>❌ {errorMessage}</p>
                    <button 
                        onClick={() => setStatus('idle')}
                        style={{
                            marginTop: '8px',
                            padding: '4px 12px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div className="wunjo-controls">
                <button 
                    onClick={() => generateSpeech()}
                    disabled={isGenerating || !text}
                    className="wunjo-btn wunjo-btn-primary"
                    title={!text ? 'No text to speak' : ''}
                >
                    🔊 {isGenerating ? 'Generating...' : 'Speak (Audio)'}
                </button>

                <button 
                    onClick={() => generateVideo()}
                    disabled={isGenerating || !text}
                    className="wunjo-btn wunjo-btn-secondary"
                    title={!text ? 'No text for video' : ''}
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
                    disabled={status === 'loading'}
                >
                    🔄 Reset
                </button>
            </div>

            {/* Status indicator */}
            <div style={{ 
                marginTop: '8px', 
                fontSize: '12px', 
                color: status === 'error' ? '#dc2626' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: status === 'error' ? '#dc2626' : 
                               status === 'ready' ? '#22c55e' : 
                               status === 'loading' ? '#f59e0b' : '#94a3b8'
                }}></span>
                Status: {status === 'idle' ? 'Ready' :
                         status === 'loading' ? 'Generating...' :
                         status === 'ready' ? 'Done' :
                         status === 'error' ? 'Error' : 'Unknown'}
            </div>
        </div>
    );
}