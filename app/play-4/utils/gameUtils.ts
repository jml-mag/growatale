import { generateClient, Client } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";
import { Action, Scene, Story } from "../types";
import gameSettings from "../gameSettings"

const client: Client<Schema> = generateClient<Schema>();

async function saveScene(sceneData: Scene) {
    try {
        console.log(
            `attempting to save this: ${JSON.stringify(sceneData, null, 2)}`
        );
        const { data, errors } = await client.models.Scene.create(sceneData);
        if (!errors && data) {
            return data;
        } else {
            console.error("Error creating new scene:", errors);
            throw new Error("Error creating new scene");
        }
    } catch (error) {
        console.error("Error saving scene:", error);
        throw error;
    }
}

const saveSceneIdToStory = async (sceneId: string, storyId: string) => {
    try {
        const { data, errors } = await client.models.Story.update({
            id: storyId,
            current_scene: sceneId
        });

        if (!errors && data) {
            console.log(data);
            return data;
        } else {
            console.error("Error updating story:", errors);
            throw new Error("Error updating story");
        }
    } catch (error) {
        console.error("Error updating story:", error);
        throw error;
    }
};

export const saveStateToScene = async (initialScene: Scene) => {
    const sceneResponse = await saveScene(initialScene);
    console.log(sceneResponse);
    const sceneId = sceneResponse.id;
    const storyId = sceneResponse.story_id;
    saveSceneIdToStory(sceneId, storyId);
};

export async function initializeGame(username: string): Promise<string> {
    // Initialize a new story, get story_id
    const newStory: Story = {
        owner: username,
        author: gameSettings.author,
        artist: gameSettings.artist,
        current_scene: "",
        player_health: 100,
        player_inventory: [],
        primary_ai: gameSettings.primary_ai,
        audio_ai: gameSettings.audio_ai,
        image_ai: gameSettings.image_ai,
    };

    try {
        const { data, errors } = await client.models.Story.create(newStory);
        if (!errors && data) {
            //initialize a new scene, get scene_id, save to storyId
            const gameId = data.id;
            try {
                const { data, errors } = await client.models.Scene.create({
                    image: "",
                    audio: "",
                    actions_available: [],
                    primary_text: "",
                    scene_description: "",
                    time: "12:00 PM",
                    previous_scene: "",
                    story_id: gameId,
                })
                if (!errors && data) {
                    saveSceneIdToStory(data.id, gameId);
                    return gameId;
                } else {
                    console.error("Error creating new scene:", errors);
                    throw new Error("Error creating new scene");
                }
            } catch (error) {
                console.error("Error initializing scene:", error);
                throw error;
            }
        } else {
            console.error("Error creating new story:", errors);
            throw new Error("Error creating new story");
        }
    } catch (error) {
        console.error("Error initializing game:", error);
        throw error;
    }
}

async function initializeScene(gameId: string) {
    try {
        const { data, errors } = await client.models.Scene.create({
            image: "",
            audio: "",
            actions_available: [],
            primary_text: "",
            scene_description: "",
            time: "12:00 PM",
            previous_scene: "",
            story_id: gameId,
        })
        if (!errors && data) {
            return data.id;
        } else {
            console.error("Error creating new scene:", errors);
            throw new Error("Error creating new scene");
        }
    } catch (error) {
        console.error("Error initializing scene:", error);
        throw error;
    }
}

export async function fetchCurrentSceneId(gameId: string): Promise<any> {
    try {
        const { data, errors } = await client.models.Story.get({ id: gameId });
        if (!errors && data) {
            console.log(`fetchCurrentSceneId: ${data.current_scene}`)
            return data;
        } else {
            console.error("Error fetching scene:", errors);
            throw new Error("Error fetching scene");
        }
    } catch (error) {
        console.error("Error fetching scene:", error);
        throw error;
    }
}

export function processTurn() { }
export function createScene() {
    //
}


export function generatePrompt() {
    let sceneDescription = gameSettings.starting_scene_description
    let genre = gameSettings.genre
    let time = gameSettings.time
    let writer = gameSettings.writer
    let age = gameSettings.age

    const foundationPrompt = `You are ${writer}, writing a ${genre} text game in your literary style appropriate for a ${age} year old. The scene to write is based on ${sceneDescription} at ${time}. The story must be told from the perspective of the player in the first person. Never use 'I' or 'you' in the description. The scene is only from the eyes of the player. Do not describe the player in the scene, describe the scene as seen by the player. Please return a detailed JSON object with keys for 'story', 'scene_description', and 'player_options'.`;

    const dataShapePrompt = `The Story should describe the surroundings and options to the player. The scene description will be used by an AI image generator to create a visualization of the story from the player's first-person perspective. It must be detailed and vivid, always feature at least one path for the player to move in, and be under 500 characters. The player options should only include directions explicitly mentioned in the scene description (e.g., if a pathway is described as leading forward, 'forward' should be the only option). 'Player_options' should be structured as an object with a 'direction' key which should be an array containing the direction and a 'command text' like ['forward', 'Continue down alley'], limited to three words maximum, and a 'transition_text' key. The transition_text should describe the action of moving in that direction, keeping these texts to one or two sentences. The JSON object structure must include 'story', 'scene_description', and 'player_options', where 'player_options' contain 'directions' with all available directions the player can move, each including 'direction', 'command_text', and 'transition_text'.`;

    const prompt = `${foundationPrompt} ${dataShapePrompt}`

    return [{
        role: "system",
        content: prompt
    }];
}