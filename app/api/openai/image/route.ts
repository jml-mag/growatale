import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Use a server-side environment variable
});

export async function POST(req: NextRequest) {
    const { prompt, model, n, quality, response_format, size, style } = await req.json();

    try {
        const response = await openai.images.generate({
            prompt,
            model,
            n,
            quality,
            response_format,
            size,
            style
        });

        if (!response || !response.data || response.data.length === 0) {
            throw new Error("Failed to generate image");
        }

        //const imageBase64 = response.data[0].b64_json;

        //return NextResponse.json({ image_base64: imageBase64 });
        return NextResponse.json(response.data[0].url);
    } catch (error: any) {
        console.error('OpenAI API call error:', error);
        return NextResponse.json({ error: 'OpenAI API call error' }, { status: 500 });
    }
}
