// @/app/play/types.ts

/**
 * Represents an action available in a scene.
 */
export interface Action {
  direction: string;
  command_text: string;
  transition_text: string;
  leads_to: string;
}

/**
 * Represents an item in the player's inventory.
 */
export interface Inventory {
  item: string;
  amount: string;
}

/**
 * Represents a scene in the story.
 */
export interface Scene {
  id?: string;
  image: string;
  audio: string;
  actions_available: Action[];
  primary_text: string;
  scene_description: string;
  previous_scene: string;
  story_id: string;
}

/**
 * Represents a story in the game.
 */
export interface Story {
  id?: string;
  owner: string;
  time: string;
  weather: number;
  author: string;
  artist: string;
  current_scene: string;
  player_health: number;
  player_inventory: Inventory[];
}
