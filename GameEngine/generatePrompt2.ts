// /GameEngine/generatePrompt.ts

import { GameState, Prompt } from './types';

export function generateInitialPrompt() {
    let sceneDescription = 'a forest with mountains in the very far distance';
    let genre = 'Mystery';
    let time = '12:00 PM';
    let writer = `A great author of exciting, interactive ${genre} text games`;
    
    let age = 12


    const foundationPrompt = `You are ${writer}, writing a ${genre} text game in your literary style appropriate for a ${age} year old. The scene to write is based on ${sceneDescription} at ${time}. The story must be told from the perspective of the player in the first person. Never use 'I' or 'you' in the description. The scene is only from the eyes of the player. Do not describe the player in the scene, describe the scene as seen by the player. Please return a detailed JSON object with keys for 'story', 'scene_description', and 'player_options'.`;

    const dataShapePrompt = `The Story should describe the surroundings and options to the player. The scene description will be used by an AI image generator to create a visualization of the story from the player's first-person perspective. It must be detailed and vivid, always feature at least one path for the player to move in, and be under 500 characters. The player options should only include directions explicitly mentioned in the scene description (e.g., if a pathway is described as leading forward, 'forward' should be the only option). 'Player_options' should be structured as an object with a 'direction' key which should be an array containing the direction and a 'command text' like ['forward', 'Continue down alley'], limited to three words maximum, and a 'transition_text' key. The transition_text should describe the action of moving in that direction, keeping these texts to one or two sentences. The JSON object structure must include 'story', 'scene_description', and 'player_options', where 'player_options' contain 'directions' with all available directions the player can move, each including 'direction', 'command_text', and 'transition_text'.`;

    const prompt = `${foundationPrompt} ${dataShapePrompt}`
    console.log(prompt)

    return [{
        role: "system",
        content: prompt
    }];
}

