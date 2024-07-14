import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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
  const { text, model, voice, response_format, speed } = await req.json();

  try {
    const response = await openai.audio.speech.create({
      model,
      input: text,
      voice,
      response_format,
      speed,
    });

    if (!response) {
      throw new Error("Failed to generate TTS audio");
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({ audioBase64 });
  } catch (error: any) {
    console.error('OpenAI API call error:', error.message);
    return NextResponse.json(
      { error: 'OpenAI API call error', details: error.message },
      { status: 500 }
    );
  }
}
