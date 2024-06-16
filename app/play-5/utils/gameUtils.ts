// @/app/play-5/gameUtils.ts

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

export async function createScene(scene: Scene) {
    let getPrompt = generatePrompt(scene)
    const generatedScene = await makePrimaryCall(getPrompt)
    return generatedScene
}

async function makePrimaryCall(prompt: any) {
    // Primary API call
    const response = await fetch("/api/openai/primary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt[0].content, model: gameSettings.primary_ai, messages: prompt }),
    });
    const data = await response.json();
    const parsedData = JSON.parse(data.message);
    return parsedData
}

export function generatePrompt(scene: Scene) {
    let sceneDescription: string;
    let backOption: string;
    if (scene.previous_scene !== '') {
        sceneDescription = scene.previous_scene;
        backOption = "Additionally, include an option to 'go back', allowing the player to return to the previous location."
    } else {
        sceneDescription = gameSettings.starting_scene_description;
        backOption = "This scene should not offer the player a 'go back' option, as it is the starting location of the game."
    }

    let genre = gameSettings.genre
    let time = gameSettings.time
    let writer = gameSettings.writer
    let age = gameSettings.age

    const foundationPrompt = `You are ${writer}, writing a ${genre} text game in your literary style appropriate for a ${age} year old. The scene to write is based on ${sceneDescription} at ${time}. The story must be told from the perspective of the player in the first person. Never use 'I' or 'you' in the description. The scene is only from the eyes of the player. Do not describe the player in the scene, describe the scene as seen by the player. Please return a detailed JSON object with keys for 'story', 'scene_description', and 'player_options'.`;

    const dataShapePrompt = `The Story should describe the surroundings and options to the player. The scene description will be used by an AI image generator to create a visualization of the story from the player's first-person perspective. It must be detailed and vivid, always feature at least one path for the player to move in, and be under 500 characters. The player options should only include directions explicitly mentioned in the scene description (e.g., if a pathway is described as leading forward, 'forward' should be the only option).${backOption}  'Player_options' should be structured as an object with a 'direction' key which should be an array containing the direction and a 'command text' like ['forward', 'Continue down alley'], limited to three words maximum, and a 'transition_text' key. The transition_text should describe the action of moving in that direction, keeping these texts to one or two sentences. The JSON object structure must include 'story', 'scene_description', and 'player_options', where 'player_options' contain 'directions' with all available directions the player can move, each including 'direction', 'command_text', and 'transition_text'.`;

    const prompt = `${foundationPrompt} ${dataShapePrompt}`

    return [{
        role: "system",
        content: prompt
    }];
}

export async function fetchStory(storyId: string): Promise<Story> {
    try {
        const { data, errors } = await client.models.Story.get({ id: storyId });
        if (!errors && data) {
            return {
                ...data,
                player_inventory: [],
            };
        } else {
            console.error("Error fetching story:", errors);
            throw new Error("Error fetching story");
        }
    } catch (error) {
        console.error("Error fetching story:", error);
        throw error;
    }
}

export async function fetchScene(sceneId: string): Promise<Scene> {
    try {
        const { data, errors } = await client.models.Scene.get({ id: sceneId });
        if (!errors && data) {
            return {
                ...data,
                actions_available: data.actions_available as Action[],
                previous_scene: data.previous_scene as string,
            };
        } else {
            console.error("Error fetching scene:", errors);
            throw new Error("Error fetching scene");
        }
    } catch (error) {
        console.error("Error fetching scene:", error);
        throw error;
    }
}
/*

  const handleStartNewGame = async () => {
    const startTime = Date.now();
    setPrimaryTime(0);
    setAudioTime(0);
    setImageTime(0);
    setTotalTime(0);

    const totalInterval = setInterval(() => {
      setTotalTime(Date.now() - startTime);
    }, 1000);

    try {
      const prompt = generateInitialPrompt();

      // Primary API call
      const primaryStart = Date.now();
      const primaryInterval = setInterval(() => {
        setPrimaryTime(Date.now() - primaryStart);
      }, 1000);

      const response = await fetch("/api/openai/primary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt[0].content }),
      });

      clearInterval(primaryInterval);
      const data = await response.json();
      const primaryEnd = Date.now();
      setPrimaryTime(primaryEnd - primaryStart);

      const parsedData = JSON.parse(data.message);

      // Update state with the received data
      setThisScene((prevState) => ({
        ...prevState,
        primary_text: parsedData.story,
        actions_available: parsedData.player_options.directions,
        scene_description: parsedData.scene_description,
        image: "",
        audio: "",
        time: "12:00 PM",
        previous_scene: "",
        story_id: "",
      }));

      // Audio API call
      const audioStart = Date.now();
      const audioInterval = setInterval(() => {
        setAudioTime(Date.now() - audioStart);
      }, 1000);

      const audioResponse = fetch("/api/openai/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: parsedData.story,
          model: "tts-1-hd",
          voice: "fable",
          response_format: "mp3",
        }),
      }).then(async (response) => {
        const audioData = await response.json();
        clearInterval(audioInterval);
        const audioEnd = Date.now();
        setAudioTime(audioEnd - audioStart);

        const audioFileName = `${uuidv4()}.mp3`;

        // Update state with TTS response
        setThisScene((prevState) => ({
          ...prevState,
          audio: audioFileName,
        }));
      });

      // Image API call
      const imageStart = Date.now();
      const imageInterval = setInterval(() => {
        setImageTime(Date.now() - imageStart);
      }, 1000);

      const imageResponse = fetch("/api/openai/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: parsedData.scene_description,
          model: "dall-e-3",
          n: 1,
          quality: "standard",
          response_format: "url",
          size: "1024x1024",
          style: "vivid",
        }),
      }).then(async (response) => {
        const imageData = await response.json();
        clearInterval(imageInterval);
        const imageEnd = Date.now();
        setImageTime(imageEnd - imageStart);

        // Update state with image response
        setThisScene((prevState) => ({
          ...prevState,
          image: imageData,
        }));
      });

      // Wait for both audio and image responses
      await Promise.all([audioResponse, imageResponse]);

      setAiResponse(parsedData.message);

      const endTime = Date.now();
      setTotalTime(endTime - startTime);
      clearInterval(totalInterval);
    } catch (error) {
      clearInterval(totalInterval);
      console.error("Error starting new game:", error);
    }
  };
  */

