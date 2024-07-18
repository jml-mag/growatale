// @/app/play/utils/generateContent.ts

import { Scene } from "@/app/play/types";
import { fetchStoryById, weatherDescriptions } from "@/app/play/utils/gameUtils";

/**
 * Creates a new scene based on the previous scene's primary text and the player's choice.
 * 
 * @param scene - The current scene object.
 * @param previousPrimaryText - The primary text of the previous scene.
 * @param previousSceneChoice - The player's choice in the previous scene.
 * @param settings - The settings object containing game configuration.
 * @returns A promise that resolves to the generated scene.
 */
export async function createScene(scene: Scene, previousPrimaryText: string, previousSceneChoice: string, settings: any) {
    const prompt = await generatePrompt(scene, previousPrimaryText, previousSceneChoice, settings);
    const generatedScene = await makePrimaryCall(prompt, settings);
    return generatedScene;
}

/**
 * Makes a call to the primary AI service to generate a new scene based on the provided prompt.
 * 
 * @param prompt - The prompt to send to the AI service.
 * @param settings - The settings object containing game configuration.
 * @returns A promise that resolves to the parsed data from the AI service response.
 */
async function makePrimaryCall(prompt: any, settings: any) {
    const response = await fetch("/api/openai/primary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt[0].content, model: settings.primary_ai, messages: prompt }),
    });
    const data = await response.json();
    const parsedData = JSON.parse(data.message);
    return parsedData;
}

/**
 * Generates a prompt for the AI service based on the current scene and the previous scene's details.
 * 
 * @param scene - The current scene object.
 * @param previousPrimaryText - The primary text of the previous scene.
 * @param previousSceneChoice - The player's choice in the previous scene.
 * @param settings - The settings object containing game configuration.
 * @returns A promise that resolves to the generated prompt.
 */
async function generatePrompt(scene: Scene, previousPrimaryText: string, previousSceneChoice: string, settings: any) {
    let sceneDescription: string;
    let backOption: string;
    if (scene.previous_scene !== "") {
        sceneDescription = `${previousPrimaryText} and the player chose ${previousSceneChoice}`;
        backOption = "Additionally, include a 'back' option using the value 'back' in the response, allowing the player to return to the previous location.";
    } else {
        sceneDescription = settings.starting_scene_description;
        backOption = "This scene should not offer the player a 'go back' option, as it is the starting location of the game.";
    }

    let genre = settings.genre;
    let time = settings.time;
    let weather = weatherDescriptions[settings.weather as keyof typeof weatherDescriptions];
    let age = settings.age;
    let writer = settings.writer;

    // Override with Story values if available
    if (scene.story_id) {
        const story = await fetchStoryById(scene.story_id);
        time = story.time;
        weather = weatherDescriptions[story.weather as keyof typeof weatherDescriptions];
    }

    const foundationPrompt = `You are ${writer}, writing an interactive ${genre} text game in your literary style appropriate for a ${age} year old. The previous scene was ${sceneDescription}. It is ${time} and the weather is currently ${weather}. The new scene in the story must be told from the perspective of the player in the first person. Never use 'I' or 'you' in the description. The scene is only from the eyes of the player. Do not describe the player in the scene, describe the scene as seen by the player. The previous scene text was: "${previousPrimaryText}", and the player's choice was: "${previousSceneChoice}". Please return a detailed JSON object with keys for 'story', 'scene_description', and 'player_options'.`;

    const dataShapePrompt = `The Story should describe the surroundings and options to the player. The scene description will be used by an AI image generator to create a visualization of the story from the player's first-person, ground level perspective. It must be detailed and vivid and the weather is ${weather} at ${time} where sunrise is at 7AM and sunset at 7PM. This should ALWAYS be a single image in full color, always feature at least one path for the player to move in, and be under 750 characters. The player options should only include directions explicitly mentioned in the scene description.${backOption} 'Player_options' should be structured as an object with a 'directions' key which should be an array containing the direction and a 'command text' (limited to three words maximum) which will explain the option to the player, and a 'transition_text' key. There should always be at least one option and no more than three options returned including the 'back' option. The transition_text should describe the action of moving in that direction always prefaced with the player taking that action, ie. "You move...", keeping these texts to one or two sentences. The JSON object structure must include 'story', 'scene_description', and 'player_options', where 'player_options' contain 'directions' with all available directions the player can move, each including 'direction', 'command_text', and 'transition_text'.`;

    const prompt = `${foundationPrompt} ${dataShapePrompt}`;
    return [
        {
            role: "system",
            content: prompt,
        },
    ];
}
