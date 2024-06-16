// @/play-5/gameSettings

// Define the structure of the game settings
interface GameSettings {
    author: string;
    artist: string;
    primary_ai: string;
    audio_ai: string;
    image_ai: string;
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
    artist: "Default Artist",
    primary_ai: "gpt-4o",
    audio_ai: "tts-1-hd",
    image_ai: "dall-e-3",
    player_inventory: [],
    starting_scene_description: "a forest with mountains in the very far distance",
    genre: "fantasy",
    time: "12:00 PM",
    age: 12,
    writer: `A great author of exciting, interactive text games`,
  };
  
  export default gameSettings;
  