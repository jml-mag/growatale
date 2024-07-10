// @/app/play2/utils/apiCalls.ts

import { uploadData } from '@aws-amplify/storage';
import gameSettings from '../gameSettings';

/**
 * Saves a Blob to S3 and returns the URL.
 * @param blob The Blob to save.
 * @param contentType The content type of the Blob.
 * @param path The path where the file will be stored in S3.
 * @returns The URL of the saved file.
 */
export async function saveBlobToS3(blob: Blob, contentType: string, path: string): Promise<string> {
  try {
    const result = uploadData({
      path: path,
      data: blob,
      options: { contentType }
    });
    const s3path = (await result.result).path;
    console.log(`Saved Blob to S3: ${s3path}`);
    return s3path
  } catch (error) {
    console.error("Error uploading Blob to S3:", error);
    throw error;
  }
}

/**
 * Fetches an image from the API, saves it to S3, and returns the URL.
 * @param prompt The prompt for the image generation.
 * @returns The URL of the saved image file.
 */
export async function getImage(prompt: string): Promise<string | null> {

  try {
    console.log(`prompt: ${prompt}`)
    const adjustedPrompt = `In the style of ${gameSettings.artist} create ${prompt}`
    console.log(`adjustedPrompt: ${adjustedPrompt}`)
    const response = await fetch("/api/openai/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: adjustedPrompt,
        model: gameSettings.image_ai,
        n: 1,
        size: gameSettings.image_size,
        quality: gameSettings.image_quality,
        style: gameSettings.image_style,
        response_format: gameSettings.image_response_format,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'image/png' });

    // Save to S3 and return the storage URL
    const imageUrl = await saveBlobToS3(blob, "image/png", `images/${Date.now()}.png`);
    console.log(`NEW imageUrl: ${imageUrl}`);
    return imageUrl;

  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

/**
 * Fetches audio from the API, saves it to S3, and returns the URL.
 * @param text The text to convert to audio.
 * @returns The URL of the saved audio file.
 */
export async function getAudio(text: string): Promise<string | null> {
  try {
    const response = await fetch("/api/openai/audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model: "tts-1-hd",
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

    // Convert base64 to Blob
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });

    // Save to S3 and return the storage URL
    const audioUrl = await saveBlobToS3(audioBlob, "audio/mpeg", `audio/${Date.now()}.mp3`);
    console.log(`audioUrl: ${audioUrl}`);
    return audioUrl;
  } catch (error) {
    console.error("Error fetching audio:", error);
    return null;
  }
}
