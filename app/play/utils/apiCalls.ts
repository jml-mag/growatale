// @/app/play/utils/apiCalls.ts

import { uploadData } from '@aws-amplify/storage';

export async function saveBlobToS3(blob: Blob, contentType: string, path: string): Promise<string> {
  try {
    const result = uploadData({
      path: path,
      data: blob,
      options: { contentType }
    });
    const s3path = (await result.result).path;
    return s3path;
  } catch (error) {
    console.error("Error uploading Blob to S3:", error);
    throw error;
  }
}

export async function getImage(prompt: string, time: string, weather: string, settings: any): Promise<string | null> {
  try {
    const adjustedPrompt = `In the style of ${settings.artist}, create an image that shows ${prompt}. The scene should reflect the time ${time} and the weather ${weather}.`;
    const response = await fetch("/api/openai/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: adjustedPrompt,
        model: settings.image_ai,
        n: 1,
        size: settings.image_size,
        quality: settings.image_quality,
        style: settings.image_style,
        response_format: settings.image_response_format,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'image/png' });

    const imageUrl = await saveBlobToS3(blob, "image/png", `images/${Date.now()}.png`);
    return imageUrl;

  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

export async function getAudio(text: string, settings: any): Promise<string | null> {
  try {
    const response = await fetch("/api/openai/audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model: settings.audio_ai,
        voice: "nova",
        response_format: "mp3",
        speed: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const base64Audio = responseData.audio_base64;

    if (!base64Audio || base64Audio.length % 4 !== 0) {
      throw new Error('Invalid base64 string');
    }

    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });

    const audioUrl = await saveBlobToS3(audioBlob, "audio/mpeg", `audio/${Date.now()}.mp3`);
    return audioUrl;
  } catch (error) {
    console.error("Error fetching audio:", error);
    return null;
  }
}
