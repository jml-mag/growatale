// Define the structure of the game settings
interface GameSettings {
    author: string;
    artist: string;
    primary_ai: string;
    audio_ai: string;
    image_ai: string;
    image_size: string;
    image_quality: string;
    image_style: string;
    image_response_format: string,
    player_inventory: string[];
    starting_scene_description: string;
    genre: string;
    time: string;
    age: number;
    writer: string;
  }
  
  // Default game settings
  const gameSettings: GameSettings = {
    author: "Default Author",
    artist: "A world class 1930's American animator",
    primary_ai: "gpt-4o",
    audio_ai: "tts-1",// or "tts-1-hd",
    image_ai: "dall-e-3", // or "dall-e-2"
    image_size: "1024x1024",
    image_quality: "hd",
    image_style: "vivid", // or "natural"
    image_response_format: "b64_json",
    player_inventory: [],
    starting_scene_description: "a forest with mountains in the very far distance",
    genre: "fantasy",
    time: "12:00 PM",
    age: 12,
    writer: `A great author of exciting, interactive text games`,
  };
  
  export default gameSettings;
  