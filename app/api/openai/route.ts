// app/api/openai/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Use a server-side environment variable
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    return NextResponse.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API call error:', error);
    return NextResponse.json({ error: 'OpenAI API call error' }, { status: 500 });
  }
}
