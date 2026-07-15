// app/wunjo-test/page.js
// Test page for Wunjo CE integration

'use client';

import SalesChatWithWunjo from '../../components/SalesChatWithWunjo';

export default function WunjoTestPage() {
    return (
        <div style={{ 
            padding: '40px 20px',
            maxWidth: '900px',
            margin: '0 auto',
            minHeight: '100vh',
            background: '#ffffff'
        }}>
            <h1 style={{ 
                textAlign: 'center',
                marginBottom: '30px',
                fontSize: '2.5rem',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                🎬 AI Sales Assistant
            </h1>
            
            <p style={{ 
                textAlign: 'center',
                color: '#64748b',
                marginBottom: '30px'
            }}>
                Powered by Wunjo CE — Your voice, your face, your AI sales representative
            </p>

            <SalesChatWithWunjo 
                initialMessage="Hello! I'm your AI sales assistant. I can speak with my cloned voice and show my face. How can I help you today?"
                voiceId="your_cloned_voice"  // Change this after cloning your voice
                faceId="your_face_model"     // Change this after creating your face model
            />

            <div style={{
                marginTop: '40px',
                padding: '20px',
                background: '#f1f5f9',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
            }}>
                <h4 style={{ margin: '0 0 10px', color: '#334155' }}>📋 How to Use</h4>
                <ol style={{ color: '#475569', lineHeight: '1.8' }}>
                    <li><strong>Step 1:</strong> Start Wunjo CE on your computer (make sure it's running)</li>
                    <li><strong>Step 2:</strong> Clone your voice using Wunjo CE</li>
                    <li><strong>Step 3:</strong> Create your face model in Wunjo CE</li>
                    <li><strong>Step 4:</strong> Update the voiceId and faceId above</li>
                    <li><strong>Step 5:</strong> Ask questions and see your AI avatar respond!</li>
                </ol>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>
                    🔗 Wunjo CE should be running on: <code>http://localhost:8000</code>
                </p>
            </div>
        </div>
    );
}
