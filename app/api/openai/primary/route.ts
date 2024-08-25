// @/app/api/openai/primary/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Handles the POST request to generate chat completions using OpenAI's API.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object containing the chat completion data or an error message.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const { prompt, model, messages } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
    });

    let textContent = response.choices[0].message.content || '{}';
    textContent = textContent.replace(/```json/g, '').replace(/```/g, '');

    let parsedContent;
    try {
      parsedContent = JSON.parse(textContent);
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      console.error('Raw response text:', textContent);
      return NextResponse.json({ error: 'Error parsing OpenAI response' }, { status: 500 });
    }

    return NextResponse.json({ message: textContent });
  } catch (error: any) {
    console.error('OpenAI API call error:', error);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.statusText);
      console.error('Error details:', await error.response.json());
    }
    return NextResponse.json(
      { error: 'OpenAI API call error', details: error.message },
      { status: 500 }
    );
  }
}
