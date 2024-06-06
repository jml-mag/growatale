// /GameEngine/engine.ts

import { PlayerState, Scene, Turn } from './types';

const initialPlayerState: PlayerState = {
    health: 100,
    inventory: [],
};

const initialScene: Scene = {
    writer: 'Default Writer',
    artist: 'Default Artist',
    scene_description: 'You find yourself in a dense forest. The sounds of wildlife echo around you.', // Correct property name
    time: 'daytime',
    voice: 'narrator',
    previous_scene: '',
    player_move: '',
    image: '/@/public/home-bg.webp',
    audio: '',
    story: '',
    playerOptions: [],
};

const initialTurn: Turn = {
    currentScene: initialScene,
    playerState: initialPlayerState,
    turnNumber: 1,
};

// Function to process a turn
const processTurn = (currentTurn: Turn): Turn => {
    const newScene: Scene = {
        writer: 'Default Writer',
        artist: 'Default Artist',
        scene_description: 'You come across a small village.', // Correct property name
        time: 'daytime',
        voice: 'narrator',
        previous_scene: currentTurn.currentScene.scene_description,
        player_move: 'move forward',
        image: '/@/public/home-bg.webp',
        audio: '',
        story: '',
        playerOptions: [],
    };

    let updatedPlayerState = { ...currentTurn.playerState };
    
    updatedPlayerState.health -= 5;

    return {
        currentScene: newScene,
        playerState: updatedPlayerState,
        turnNumber: currentTurn.turnNumber + 1,
    };
};

export { initialTurn, processTurn };
