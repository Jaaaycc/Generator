// components/WunjoAI.jsx
// Wunjo CE Client Component - AI Voice and Video Generation

'use client';

import { useState, useRef } from 'react';

const styles = 
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .wunjo-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2563eb;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }
  .wunjo-video {
    width: 100%;
    max-width: 600px;
    border-radius: 12px;
    margin-bottom: 10px;
  }
  .wunjo-progress-bar {
    width: 100%;
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    margin-top: 10px;
    overflow: hidden;
  }
  .wunjo-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2563eb, #7c3aed);
    transition: width 0.3s ease;
    border-radius: 4px;
  }
  .wunjo-error {
    padding: 15px;
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    color: #dc2626;
  }
  .wunjo-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: white;
    font-size: 14px;
  }
  .wunjo-btn:disabled {
    background: #ccc !important;
    cursor: not-allowed;
  }
  .wunjo-btn-primary { background: #2563eb; }
  .wunjo-btn-secondary { background: #7c3aed; }
  .wunjo-btn-success { background: #22c55e; }
  .wunjo-btn-outline {
    background: transparent;
    color: #666;
    border: 1px solid #ccc;
  }
  .wunjo-controls {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;
  }
  .wunjo-loading {
    padding: 20px;
    text-align: center;
  }
;

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
            <style dangerouslySetInnerHTML={{ __html: styles }} />
            
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
