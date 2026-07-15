// app/api/wunjo/route.js
// Wunjo CE API Bridge for your Generator project

import { NextResponse } from 'next/server';

// Configuration - adjust these to match your Wunjo CE setup
const WUNJO_CONFIG = {
    // Base URL for Wunjo CE API (change port if needed)
    baseUrl: process.env.WUNJO_API_URL || 'http://localhost:8000',
    // Endpoints (adjust based on Wunjo CE API documentation)
    endpoints: {
        generate: '/api/generate',
        voiceClone: '/api/voice/clone',
        videoGenerate: '/api/video/generate',
        lipSync: '/api/lip-sync',
    }
};

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, text, voiceId, faceId, audioFile } = body;

        console.log(🎬 Wunjo API request: );

        let endpoint = '';
        let requestBody = {};

        // Route to the appropriate Wunjo endpoint
        switch (action) {
            case 'speak':
                endpoint = WUNJO_CONFIG.endpoints.generate;
                requestBody = {
                    text: text,
                    voice: voiceId || 'default',
                    output_format: 'mp3'
                };
                break;

            case 'video':
                endpoint = WUNJO_CONFIG.endpoints.videoGenerate;
                requestBody = {
                    text: text,
                    voice: voiceId || 'default',
                    face: faceId || 'default',
                    output_format: 'mp4'
                };
                break;

            case 'lip-sync':
                endpoint = WUNJO_CONFIG.endpoints.lipSync;
                requestBody = {
                    audio: audioFile,
                    face: faceId || 'default',
                    output_format: 'mp4'
                };
                break;

            case 'clone-voice':
                endpoint = WUNJO_CONFIG.endpoints.voiceClone;
                requestBody = {
                    audio: audioFile,
                    name: text || 'cloned_voice'
                };
                break;

            default:
                return NextResponse.json(
                    { error: Unknown action:  },
                    { status: 400 }
                );
        }

        // Call Wunjo CE API
        const response = await fetch(${WUNJO_CONFIG.baseUrl}, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Wunjo API error:', response.status, errorText);
            return NextResponse.json(
                { error: Wunjo API error:  },
                { status: response.status }
            );
        }

        // Check if response is binary (audio/video) or JSON
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.startsWith('audio/') || contentType.startsWith('video/')) {
            // Return binary data
            const buffer = await response.arrayBuffer();
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': ttachment; filename="output.",
                },
            });
        } else {
            // Return JSON response
            const data = await response.json();
            return NextResponse.json(data);
        }

    } catch (error) {
        console.error('❌ Wunjo bridge error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

// GET endpoint to check Wunjo CE status
export async function GET() {
    try {
        const response = await fetch(${WUNJO_CONFIG.baseUrl}/health, {
            method: 'GET',
        });
        
        if (response.ok) {
            return NextResponse.json({ status: 'online', message: 'Wunjo CE is running' });
        } else {
            return NextResponse.json({ status: 'offline', message: 'Wunjo CE is not responding' });
        }
    } catch (error) {
        return NextResponse.json({ status: 'offline', message: 'Cannot connect to Wunjo CE' });
    }
}
