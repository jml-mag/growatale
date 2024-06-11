// @/app/play-3/utils/gameUtils

import { generateClient, Client } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";
import { uploadData, getUrl } from '@aws-amplify/storage';
import { Action, Scene, Story } from '../types';

const client: Client<Schema> = generateClient<Schema>();

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
        console.error("Error creating new story: ", errors);
        throw new Error("Error creating new story");
      }
    } catch (error) {
      console.error("Error initializing game:", error);
      throw error;
    }
  }
  
  export async function saveBufferToStorage(buffer: Uint8Array, key: string, contentType: string) {
    try {
      const blob = new Blob([buffer], { type: contentType });
      const result = await uploadData({
        path: key,
        data: blob,
        options: { contentType }
      });
      return (await result.result).path; // Access the URL directly
    } catch (error) {
      console.error("Error saving to storage:", error);
      throw error;
    }
  }
  
  export async function saveScene(sceneData: Scene) {
    // Convert actions_available from Action[] to string[]
    const stringActionsAvailable = sceneData.actions_available.map(action => action.direction);
  
    // Create a new sceneData object with string[] for actions_available
    const modifiedSceneData = {
      ...sceneData,
      actions_available: stringActionsAvailable,
    };
  
    try {
      const { data, errors } = await client.models.Scene.create(modifiedSceneData);
      if (!errors && data) {
        return data.id;
      } else {
        console.error("Error creating new scene: ", errors);
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
  
  export async function fetchScene(sceneId: string) {
    try {
      const { data, errors } = await client.models.Scene.get({ id: sceneId });
      if (!errors && data) {
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
  
  // Convert string[] | null | undefined to Action[]
  export function convertToActions(actions: string[] | null | undefined): Action[] {
    if (!actions) return [];
    return actions.map(action => ({
      direction: action,
      command_text: "", // Provide appropriate command_text
      transition_text: "" // Provide appropriate transition_text
    }));
  }

  