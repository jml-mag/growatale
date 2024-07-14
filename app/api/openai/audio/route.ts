import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with the provided API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Handles the POST request to generate TTS (text-to-speech) audio using OpenAI's API.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object containing the TTS audio data or an error message.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    // Extract necessary parameters from the request body
    const { text, model, voice, response_format, speed } = await req.json();

    try {
        // Make a request to the OpenAI API to generate TTS audio
        const response = await openai.audio.speech.create({
            model: model,
            input: text,
            voice: voice,
            response_format: response_format,
            speed: speed,
        });

        // Check if the response is valid
        if (!response) {
            throw new Error("Failed to generate TTS audio");
        }

        // Convert the audio buffer to a base64 string
        const audioBuffer = await response.arrayBuffer();
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');

        // Return the base64 encoded audio in the response
        return NextResponse.json({ audio_base64: audioBase64 });
    } catch (error: any) {
        // Log any errors and return a JSON error response
        console.error('OpenAI API call error:', error.message);
        return NextResponse.json({ error: 'OpenAI API call error', details: error.message }, { status: 500 });
    }
}
