// app/generate-video/page.js
'use client';

import { useState } from 'react';

export default function GenerateVideoPage() {
    const [script, setScript] = useState('');
    const [voiceId, setVoiceId] = useState('your_cloned_voice');
    const [avatarId, setAvatarId] = useState('your_avatar_id');
    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [progress, setProgress] = useState('');

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
        const urls = files.map(file => URL.createObjectURL(file));
        setImages(urls);
    };

    const generateVideo = async () => {
        setIsGenerating(true);
        setVideoUrl(null);
        setProgress('Starting video generation...');

        try {
            // Convert images to base64 or URLs
            const imageDataUrls = await Promise.all(imageFiles.map((file) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            }));

            setProgress('Generating voice and avatar...');

            const response = await fetch('/api/generate-real-estate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script,
                    voiceId,
                    avatarId,
                    propertyImages: imageDataUrls,
                    propertyAddress: '123 Main St, Miami, FL',
                    propertyPrice: ',000'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Video generation failed');
            }

            setProgress('Video generated! Downloading...');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            setProgress('Done!');

        } catch (error) {
            console.error('Error:', error);
            setProgress('Error: ' + error.message);
            alert('Failed to generate video: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ 
            padding: '40px 20px', 
            maxWidth: '800px', 
            margin: '0 auto',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <h1 style={{ 
                fontSize: '2rem', 
                marginBottom: '10px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                🏠 Real Estate Video Generator
            </h1>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>
                Create professional property walkthrough videos with your AI avatar
            </p>
            
            <div style={{ 
                background: '#f8fafc', 
                padding: '24px', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px'
            }}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>
                        Voice ID
                    </label>
                    <input 
                        value={voiceId}
                        onChange={(e) => setVoiceId(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '10px', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                        placeholder="Enter your cloned voice ID"
                    />
                    <small style={{ color: '#94a3b8' }}>Get this from Wunjo CE after cloning your voice</small>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>
                        Avatar ID
                    </label>
                    <input 
                        value={avatarId}
                        onChange={(e) => setAvatarId(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '10px', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                        placeholder="Enter your avatar ID"
                    />
                    <small style={{ color: '#94a3b8' }}>Get this from Wunjo CE after creating your avatar</small>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>
                        Property Script
                    </label>
                    <textarea 
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        rows={6}
                        style={{ 
                            width: '100%', 
                            padding: '10px', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            resize: 'vertical'
                        }}
                        placeholder="Welcome to this beautiful 3-bedroom home in the heart of Miami..."
                    />
                    <small style={{ color: '#94a3b8' }}>Write a detailed description of the property</small>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>
                        Property Images
                    </label>
                    <input 
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'block', marginTop: '4px' }}
                    />
                    <small style={{ color: '#94a3b8' }}>{images.length} images uploaded (max 10)</small>
                    {images.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {images.map((url, i) => (
                                <img 
                                    key={i}
                                    src={url}
                                    alt={'Property ' + (i+1)}
                                    style={{ 
                                        width: '80px', 
                                        height: '60px', 
                                        objectFit: 'cover', 
                                        borderRadius: '4px',
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    onClick={generateVideo}
                    disabled={isGenerating || !script || images.length === 0}
                    style={{
                        padding: '12px 32px',
                        background: isGenerating || !script || images.length === 0 ? '#94a3b8' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isGenerating || !script || images.length === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}
                >
                    {isGenerating ? '⏳ Generating...' : '🚀 Generate Video'}
                </button>

                {progress && (
                    <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>
                        {progress}
                    </p>
                )}
            </div>

            {videoUrl && (
                <div style={{ 
                    background: '#f8fafc', 
                    padding: '24px', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ margin: '0 0 16px 0' }}>🎬 Your Property Video</h3>
                    <video 
                        src={videoUrl}
                        controls
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <a 
                            href={videoUrl}
                            download="property_video.mp4"
                            style={{
                                display: 'inline-block',
                                padding: '10px 24px',
                                background: '#22c55e',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: '500'
                            }}
                        >
                            📥 Download Video
                        </a>
                        <button
                            onClick={() => {
                                setVideoUrl(null);
                                setImages([]);
                                setImageFiles([]);
                            }}
                            style={{
                                padding: '10px 24px',
                                background: 'transparent',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            🔄 Start Over
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
