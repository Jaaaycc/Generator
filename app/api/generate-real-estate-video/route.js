// app/api/generate-real-estate-video/route.js
import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile, unlink, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// Set FFmpeg path
ffmpeg.setFfmpegPath('C:\\ffmpeg\\ffmpeg-2026-07-16-git-ceabc9b306-essentials_build\\bin\\ffmpeg.exe');

export async function POST(request) {
    try {
        const { 
            script,
            voiceId,
            propertyImages,
            avatarId,
            propertyAddress,
            propertyPrice
        } = await request.json();

        const jobId = randomUUID();
        const tempDir = path.join('/tmp', jobId);
        await mkdir(tempDir, { recursive: true });

        const outputPath = path.join(tempDir, 'final_video.mp4');

        // --- STEP 1: Generate Voice from Script using Qwen TTS ---
        const voiceResponse = await fetch('http://localhost:48000/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: script,
                voiceId: voiceId,
                speed: 1.0
            })
        });

        if (!voiceResponse.ok) {
            throw new Error('Voice generation failed');
        }

        const voiceBuffer = await voiceResponse.arrayBuffer();
        const voicePath = path.join(tempDir, 'voice.mp3');
        await writeFile(voicePath, Buffer.from(voiceBuffer));

        // --- STEP 2: Generate Avatar Video using Wunjo CE ---
        const avatarResponse = await fetch('http://localhost:48000/generate-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: script,
                voiceId: voiceId,
                avatarId: avatarId,
                output_format: 'mp4'
            })
        });

        if (!avatarResponse.ok) {
            throw new Error('Avatar generation failed');
        }

        const avatarBuffer = await avatarResponse.arrayBuffer();
        const avatarPath = path.join(tempDir, 'avatar.mp4');
        await writeFile(avatarPath, Buffer.from(avatarBuffer));

        // --- STEP 3: Download property images ---
        const imagePaths = [];
        const maxImages = Math.min(propertyImages.length, 10);
        for (let i = 0; i < maxImages; i++) {
            const imgResponse = await fetch(propertyImages[i]);
            const imgBuffer = await imgResponse.arrayBuffer();
            const imgPath = path.join(tempDir, 'property_' + i + '.jpg');
            await writeFile(imgPath, Buffer.from(imgBuffer));
            imagePaths.push(imgPath);
        }

        // --- STEP 4: Create slideshow from property images ---
        const slideshowPath = path.join(tempDir, 'slideshow.mp4');
        
        await new Promise((resolve, reject) => {
            const command = ffmpeg();
            
            imagePaths.forEach((img) => {
                command.input(img).inputOptions(['-loop 1', '-t 4']);
            });

            const filterParts = [];
            for (let i = 0; i < imagePaths.length; i++) {
                filterParts.push('[' + i + ':v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30[v' + i + ']');
            }
            const filter = filterParts.join(';');
            const concat = imagePaths.map((_, i) => '[v' + i + ']').join('');
            const outputFilter = filter + ';' + concat + 'concat=n=' + imagePaths.length + ':v=1:a=0[vout]';

            command
                .complexFilter([outputFilter])
                .outputOptions(['-map [vout]', '-c:v libx264', '-pix_fmt yuv420p', '-crf 23'])
                .save(slideshowPath)
                .on('end', resolve)
                .on('error', reject);
        });

        // --- STEP 5: Combine everything: Avatar + Slideshow + Voice ---
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(avatarPath)
                .input(slideshowPath)
                .input(voicePath)
                .complexFilter([
                    {
                        filter: 'overlay',
                        options: { x: 'main_w-overlay_w-50', y: 'main_h-overlay_h-50' },
                        inputs: ['1:v', '0:v'],
                        outputs: 'combined'
                    }
                ])
                .outputOptions([
                    '-map [combined]',
                    '-map 2:a',
                    '-c:v libx264',
                    '-c:a aac',
                    '-shortest',
                    '-movflags +faststart'
                ])
                .save(outputPath)
                .on('end', resolve)
                .on('error', reject);
        });

        // --- STEP 6: Return the final video ---
        const videoBuffer = await readFile(outputPath);

        // Clean up temp files
        await unlink(voicePath).catch(() => {});
        await unlink(avatarPath).catch(() => {});
        await unlink(slideshowPath).catch(() => {});
        await unlink(outputPath).catch(() => {});
        for (const img of imagePaths) {
            await unlink(img).catch(() => {});
        }

        return new NextResponse(videoBuffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': 'attachment; filename="property_video.mp4"'
            }
        });

    } catch (error) {
        console.error('Video generation failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
