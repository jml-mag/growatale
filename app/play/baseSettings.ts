// @/app/play/baseSettings.ts

interface BaseSettings {
    primary_ai: string;
    audio_ai: string;
    image_ai: string;
    image_size: string;
    image_quality: string;
    image_style: string;
    image_response_format: string;
    player_inventory: string[];
    age: number;
  }
  
  const baseSettings: BaseSettings = {
    primary_ai: "gpt-4o",
    audio_ai: "tts-1", // or "tts-1-hd"
    image_ai: "dall-e-3", // or "dall-e-2"
    image_size: "1024x1024", // "1024x1024", "1024x1792", "1792x1024"
    image_quality: "hd",
    image_style: "vivid", // "natural", "vivid"
    image_response_format: "b64_json",
    player_inventory: [],
    age: 15,
  };
  
  export default baseSettings;
  