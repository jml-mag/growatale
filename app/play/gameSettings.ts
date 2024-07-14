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
  author: "Edgar Allan Poe",
  artist: "A master of Realism",
  primary_ai: "gpt-4o",
  audio_ai: "tts-1", // or "tts-1-hd"
  image_ai: "dall-e-3", // or "dall-e-2"
  image_size: "1024x1024", // "1024x1024", "1024x1792", "1792x1024"
  image_quality: "hd",
  image_style: "vivid", // "natural", "vivid"
  image_response_format: "b64_json",
  player_inventory: [],
  starting_scene_description: "Cobblestone streets, shrouded in a thick fog that muffles every sound. Gas lamps flicker weakly, their light barely piercing the mist. Tall, shadowy buildings loom on either side, their windows dark and unwelcoming. An old, weathered sign creaks above a nearby door, but its lettering is obscured by age and grime. The air is filled with the scent of damp earth and decaying wood, giving an eerie, unsettling feel.",
  genre: "interactive mystery text games",
  time: "12:00 PM",
  weather: 6, // Default to "cloudy"
  age: 12,
  writer: "Edgar Allan Poe",
};

export default gameSettings;
