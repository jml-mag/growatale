// @/app/api/openai/audio/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    const { text, model, voice, response_format, speed } = await req.json();

    try {
        const response = await openai.audio.speech.create({
            model: model,
            input: text,
            voice: voice,
            response_format: response_format,
            speed: speed,
        });

        if (!response) {
            throw new Error("Failed to generate TTS audio");
        }

        const audioBuffer = await response.arrayBuffer();
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');

        return NextResponse.json({ audio_base64: audioBase64 });
    } catch (error: any) {
        console.error('OpenAI API call error:', error.message);
        return NextResponse.json({ error: 'OpenAI API call error', details: error.message }, { status: 500 });
    }
}
