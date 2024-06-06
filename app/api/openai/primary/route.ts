// app/api/openai/primary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource'; // Ensure the correct relative path

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use a server-side environment variable
});

const client = generateClient<Schema>();

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    // Step 1: Call OpenAI for text generation
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', 
      messages: [{ role: 'user', content: prompt }],
    });

    let textContent = response.choices[0].message.content || '{}'; // Ensure it's a string
    textContent = textContent.replace(/```json/g, '').replace(/```/g, ''); // Remove the code block markers

    let parsedContent;
    try {
      parsedContent = JSON.parse(textContent);
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      console.error('Raw response text:', textContent);
      return NextResponse.json({ error: 'Error parsing OpenAI response' }, { status: 500 });
    }

    // Extract the relevant parts from the response, ensuring no null values
    const story = parsedContent.story || 'No story provided';
    const scene_description = parsedContent.scene_description || 'No description provided';
    const player_options = parsedContent.player_options || { directions: [] };

    console.log('Story:', story);
    console.log('Description:', scene_description);
    console.log('Options:', player_options);

    return NextResponse.json({ message: textContent });
  } catch (error: any) {
    console.error('OpenAI API call error:', error);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.statusText);
      console.error('Error details:', await error.response.json());
    }
    return NextResponse.json({ error: 'OpenAI API call error' }, { status: 500 });
  }
}
