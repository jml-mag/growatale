// @/app/play/gameSettings.ts

/**
 * Interface for defining the game settings.
 */
interface GameSettings {
  author: string;
  artist: string;
  primary_ai: string;
  audio_ai: string;
  image_ai: string;
  image_size: string;
  image_quality: string;
  image_style: string;
  image_response_format: string;
  player_inventory: string[];
  starting_scene_description: string;
  genre: string;
  time: string;
  weather: number;
  age: number;
  writer: string;
}

/**
 * Default game settings.
 */
const gameSettings: GameSettings = {
  primary_ai: "gpt-4o",
  audio_ai: "tts-1", // or "tts-1-hd"
  image_ai: "dall-e-3", // or "dall-e-2"
  image_size: "1024x1024", // "1024x1024", "1024x1792", "1792x1024"
  image_quality: "hd",
  image_style: "vivid", // "natural", "vivid"
  image_response_format: "b64_json",
  player_inventory: [],
  genre: "gothic horror",
  time: "12:00 PM",
  weather: 6, // Default to "cloudy"
  age: 15,
  writer: "Edgar Allan Poe",
  author: "Edgar Allan Poe",
  artist: "A pulizer prize winning photographer using photographic equipment of the era",
  starting_scene_description: "The inner harbor of Baltimore, Maryland, in the year 1849. The site in Baltimore is the Inner Harbor.",
  
};

export default gameSettings;
