import { generateClient, Client } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";
import { Action, Scene, Story } from "../types";
import gameSettings from "../gameSettings";
import sharp from "sharp";

export async function createScene(scene: Scene, previousPrimaryText: string, previousSceneChoice: string) {
    let getPrompt = generatePrompt(scene, previousPrimaryText, previousSceneChoice);
    const generatedScene = await makePrimaryCall(getPrompt);
    console.log(`Generated Scene: ${JSON.stringify(generatedScene, null, 2)}`)
    return generatedScene;
}

async function makePrimaryCall(prompt: any) {
    console.log('makePrimaryCall prompt:', prompt[0].content)
    const response = await fetch("/api/openai/primary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt[0].content, model: gameSettings.primary_ai, messages: prompt }),
    });
    const data = await response.json();
    const parsedData = JSON.parse(data.message);
    return parsedData;
}

function generatePrompt(scene: Scene, previousPrimaryText: string, previousSceneChoice: string) {
    let sceneDescription: string;
    let backOption: string;
    if (scene.previous_scene !== "") {
        sceneDescription = previousSceneChoice;
        backOption = "Additionally, include an option to 'go back', allowing the player to return to the previous location.";
    } else {
        sceneDescription = gameSettings.starting_scene_description;
        backOption = "This scene should not offer the player a 'go back' option, as it is the starting location of the game.";
    }

    let genre = gameSettings.genre;
    let time = gameSettings.time;
    let writer = gameSettings.writer;
    let age = gameSettings.age;

    const foundationPrompt = `You are ${writer}, writing a ${genre} text game in your literary style appropriate for a ${age} year old. The scene to write is based on ${sceneDescription} at ${time}. The story must be told from the perspective of the player in the first person. Never use 'I' or 'you' in the description. The scene is only from the eyes of the player. Do not describe the player in the scene, describe the scene as seen by the player. The previous scene text was: "${previousPrimaryText}", and the player's choice was: "${previousSceneChoice}". Please return a detailed JSON object with keys for 'story', 'scene_description', and 'player_options'.`;

    const dataShapePrompt = `The Story should describe the surroundings and options to the player. The scene description will be used by an AI image generator to create a visualization of the story from the player's first-person perspective. It must be detailed and vivid and ALWAYS be a single image, always feature at least one path for the player to move in, and be under 500 characters. The player options should only include directions explicitly mentioned in the scene description (e.g., if a pathway is described as leading forward, 'forward' should be the only option).${backOption} 'Player_options' should be structured as an object with a 'direction' key which should be an array containing the direction and a 'command text' like ['forward', 'Continue down alley'], limited to three words maximum, and a 'transition_text' key. The transition_text should describe the action of moving in that direction always prefaced with the player taking that action, ie. "You move...", keeping these texts to one or two sentences. The JSON object structure must include 'story', 'scene_description', and 'player_options', where 'player_options' contain 'directions' with all available directions the player can move, each including 'direction', 'command_text', and 'transition_text'.`;

    const prompt = `${foundationPrompt} ${dataShapePrompt}`;
    console.log(`New prompt: ${prompt}`);

    return [
        {
            role: "system",
            content: prompt,
        },
    ];
}