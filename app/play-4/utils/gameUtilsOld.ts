// @/play-3/utils/gameUtils

import { generateClient, Client } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";
import { Action, Scene, Story } from "../types";

const client: Client<Schema> = generateClient<Schema>();

export async function fetchStory(storyId: string): Promise<Story> {
  try {
    const { data, errors } = await client.models.Story.get({ id: storyId });
    if (!errors && data) {
      return {
        ...data,
        player_inventory: data.player_inventory || [],
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
        actions_available: convertToActions(data.actions_available),
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

export function convertToActions(actions: string[] | null | undefined): Action[] {
  if (!actions) return [];
  return actions.map(action => ({
    direction: action,
    command_text: "", // Provide appropriate command_text
    transition_text: "" // Provide appropriate transition_text
  }));
}

export function convertToStringArray(actions: Action[]): string[] {
  return actions.map(action => action.direction);
}

export async function initializeGame(username: string): Promise<string> {
  const newStory: Omit<Story, "id"> = {
    owner: username,
    author: "Default Author",
    artist: "Default Artist",
    current_scene: "",
    player_health: 100,
    player_inventory: [],
    primary_ai: "",
    audio_ai: "",
    image_ai: "",
  };

  try {
    const { data, errors } = await client.models.Story.create(newStory);
    if (!errors && data) {
      return data.id;
    } else {
      console.error("Error creating new story:", errors);
      throw new Error("Error creating new story");
    }
  } catch (error) {
    console.error("Error initializing game:", error);
    throw error;
  }
}

export async function saveScene(sceneData: Scene) {
  // Convert actions_available from Action[] to string[]
  const stringActionsAvailable = convertToStringArray(sceneData.actions_available);

  // Create a new sceneData object with string[] for actions_available
  const modifiedSceneData = {
    ...sceneData,
    actions_available: stringActionsAvailable,
  };

  try {
    console.log(`modifiedSceneData: ${JSON.stringify(modifiedSceneData, null, 2)}`);
    const { data, errors } = await client.models.Scene.create(modifiedSceneData);
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

export async function updateStoryCurrentScene(storyId: string, sceneId: string) {
  try {
    const { data, errors } = await client.models.Story.update({
      id: storyId,
      current_scene: sceneId
    });
    if (!errors && data) {
      return data;
    } else {
      console.error("Error updating story:", errors);
      throw new Error("Error updating story");
    }
  } catch (error) {
    console.error("Error updating story:", error);
    throw error;
  }
}
