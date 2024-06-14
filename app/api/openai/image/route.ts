// @/app/api/openai/image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    const { prompt, model, n, quality, response_format = 'b64_json', size, style } = await req.json();

    try {
        const response = await openai.images.generate({
            prompt: prompt,
            model,
            n,
            quality,
            response_format: response_format, // Request base64 format
            size,
            style
        });

        if (!response || !response.data || response.data.length === 0) {
            throw new Error("Failed to generate image");
        }

        const base64Image = response.data[0].b64_json;

        if (!base64Image) {
            throw new Error("Base64 image data is undefined");
        }

        // Decode base64 image
        const byteCharacters = atob(base64Image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const buffer = Buffer.from(byteArray.buffer);

        // Set appropriate headers for image response
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error: any) {
        console.error('OpenAI API call error:', error);
        return NextResponse.json({ error: 'OpenAI API call error' }, { status: 500 });
    }
}
