import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Handles the POST request to generate images using OpenAI's API.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object containing the generated image data or an error message.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const { prompt, model, n, quality, response_format = 'b64_json', size, style } = await req.json();

  try {
    const response = await openai.images.generate({
      prompt,
      model,
      n,
      quality,
      response_format,
      size,
      style,
    });

    if (!response || !response.data || response.data.length === 0) {
      throw new Error('Failed to generate image');
    }

    const base64Image = response.data[0].b64_json;

    if (!base64Image) {
      throw new Error('Base64 image data is undefined');
    }

    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const buffer = Buffer.from(byteArray.buffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('OpenAI API call error:', error);
    return NextResponse.json(
      { error: 'OpenAI API call error', details: error.message },
      { status: 500 }
    );
  }
}
