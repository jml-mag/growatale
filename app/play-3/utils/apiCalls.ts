export async function getImage(prompt: string) {
    try {
      const response = await fetch("/api/openai/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          response_format: "b64_json" // Ensure we get base64 response
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Image data:", data);
  
      if (data.image_base64) {
        // Handling base64 image
        const imageBuffer = Buffer.from(data.image_base64, 'base64');
        console.log("Decoded image buffer:", imageBuffer);
        return imageBuffer;
      } else {
        console.error("No valid image data received.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  }
  
  export async function getAudio(text: string) {
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
          response_format: "mp3"
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const audioBuffer = await response.arrayBuffer();
      console.log("Audio buffer:", audioBuffer);
  
      return audioBuffer;
    } catch (error) {
      console.error("Error fetching audio:", error);
      return null;
    }
  }