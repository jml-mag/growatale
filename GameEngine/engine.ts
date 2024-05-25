// /GameEngine/engine.ts

import { PlayerState, Scene, Turn } from './types';

const initialPlayerState: PlayerState = {
    health: 100,
    inventory: [],
    attributes: {
        strength: 10,
        intelligence: 10,
    },
};

const initialScene: Scene = {
    id: '1',
    writer: 'Default Writer',
    artist: 'Default Artist',
    scene_description: 'You find yourself in a dense forest. The sounds of wildlife echo around you.', // Correct property name
    time: 'daytime',
    voice: 'narrator',
    previous_scene: '',
    player_move: '',
    image: '/@/public/home-bg.webp',
    audio: '',
    interactions: [
        {
            type: 'opportunity',
            description: 'You find a healing herb.',
            effect: (player) => {
                player.health += 10;
                return player;
            },
        },
        {
            type: 'conflict',
            description: 'A wild animal appears and attacks you.',
            effect: (player) => {
                player.health -= 20;
                return player;
            },
        },
    ],
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
        id: '2',
        writer: 'Default Writer',
        artist: 'Default Artist',
        scene_description: 'You come across a small village.', // Correct property name
        time: 'daytime',
        voice: 'narrator',
        previous_scene: currentTurn.currentScene.scene_description,
        player_move: 'move forward',
        image: '/@/public/home-bg.webp',
        audio: '',
        interactions: [
            {
                type: 'opportunity',
                description: 'You find some food.',
                effect: (player) => {
                    player.health += 15;
                    player.inventory.push('food');
                    return player;
                },
            },
            {
                type: 'conflict',
                description: 'A thief tries to rob you.',
                effect: (player) => {
                    player.health -= 10;
                    return player;
                },
            },
        ],
        story: '',
        playerOptions: [],
    };

    let updatedPlayerState = { ...currentTurn.playerState };
    newScene.interactions.forEach((interaction) => {
        updatedPlayerState = interaction.effect(updatedPlayerState);
    });

    updatedPlayerState.health -= 5;

    return {
        currentScene: newScene,
        playerState: updatedPlayerState,
        turnNumber: currentTurn.turnNumber + 1,
    };
};

export { initialTurn, processTurn };
