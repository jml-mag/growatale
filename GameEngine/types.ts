// /GameEngine/types.ts

export interface Attributes {
    strength: number;
    intelligence: number;
    [key: string]: number; // Additional attributes
}

export interface PlayerState {
    health: number;
    inventory: string[];
    attributes: Attributes;
}

export type InteractionType = 'conflict' | 'opportunity';

export type EffectFunction = (player: PlayerState) => PlayerState;

export interface Interaction {
    type: InteractionType;
    description: string;
    effect: EffectFunction;
}

export interface PlayerOption {
    direction: string;
    commandText: string;
    transitionText: string;
}

export interface Scene {
    id: string;
    writer: string;
    artist: string;
    scene_description: string;
    time: string;
    voice: string;
    previous_scene: string;
    player_move: string;
    image: string;
    audio: string;
    interactions: Interaction[];
    story: string;
    playerOptions: PlayerOption[];
}

export interface Turn {
    currentScene: Scene;
    playerState: PlayerState;
    turnNumber: number;
}

export interface ModelOptions {
    options: string[];
    selected: number;
}

export interface GameState {
    id: string;
    name: string;
    models: {
        chat: ModelOptions;
        image: ModelOptions;
        audio: ModelOptions;
    };
    scene: Scene;
}

export interface Prompt {
    role: string;
    content: string;
}
