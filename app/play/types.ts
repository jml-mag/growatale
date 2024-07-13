// @/app/play/types.ts

export interface Action {
  direction: string;
  command_text: string;
  transition_text: string;
  leads_to: string;
}

export interface Inventory {
  item: string;
  amount: string;
}

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
