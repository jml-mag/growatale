// app/play2/utils/gameUtils.ts

import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Scene, Story } from "@/app/play2/types";
import gameSettings from "@/app/play2/gameSettings";

const client = generateClient<Schema>();

const saveSceneIdToStory = async (sceneId: string, storyId: string) => {
  try {
    const { data, errors } = await client.models.Story.update({
      id: storyId,
      current_scene: sceneId,
    });

    if (!errors && data) {
      console.log(`saveSceneIdToStory data: ${JSON.stringify(data, null, 2)}`);

      return data;
    } else {
      console.error("Error updating story:", errors);
      throw new Error("Error updating story");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating story:", error.message);
    } else {
      console.error("Unknown error updating story");
    }
    throw error;
  }
};

const saveScene = async (sceneData: Scene) => {
  try {
    const { id, createdAt, updatedAt, owner, ...validSceneData } = sceneData as any;
    console.log(`saveScene, saving: ${JSON.stringify(validSceneData, null, 2)}`);

    const { data: newScene, errors } = await client.models.Scene.create(validSceneData);
    if (errors || !newScene) {
      console.error("Error creating new scene:", errors);
      throw new Error("Error creating new scene");
    }

    return newScene;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error saving scene:", error.message);
    } else {
      console.error("Unknown error saving scene");
    }
    throw error;
  }
};

const fetchStoryById = async (storyId: string): Promise<Story> => {
  try {
    const { data: stories, errors } = await client.models.Story.list({
      filter: { id: { eq: storyId } },
    });

    if (errors || !stories || stories.length === 0) {
      throw new Error("Story not found");
    }

    return stories[0] as Story;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching story:", error.message);
    } else {
      console.error("Unknown error fetching story");
    }
    throw error;
  }
};

const fetchSceneById = async (sceneId: string): Promise<Scene> => {
  try {
    const { data: scene, errors } = await client.models.Scene.get({
      id: sceneId,
    });

    if (errors || !scene) {
      throw new Error("Scene not found");
    }

    // Ensure actions_available is correctly typed
    /*
    if (scene.actions_available) {
      scene.actions_available = scene.actions_available.map(action => {
        if (!action) {
          throw new Error("Invalid action found in scene");
        }
        return {
          direction: action.direction,
          command_text: action.command_text,
          transition_text: action.transition_text,
        };
      });
    }
*/
    console.log(`fetchSceneById data: ${JSON.stringify(scene, null, 2)}`);
    return scene as Scene;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching scene:", error.message);
    } else {
      console.error("Unknown error fetching scene");
    }
    throw error;
  }
};

const initializeGame = async (username: string): Promise<{ gameId: string, sceneData: Scene }> => {
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
    const { data: storyData, errors: storyErrors } = await client.models.Story.create(newStory);
    if (!storyErrors && storyData) {
      const gameId = storyData.id;
      console.log(`initializeGame data: ${JSON.stringify(storyData, null, 2)}`);

      const initialScene: Scene = {
        image: "",
        audio: "",
        actions_available: [], // Ensure actions_available is of type Action[]
        primary_text: "",
        scene_description: gameSettings.starting_scene_description,
        time: gameSettings.time,
        previous_scene: "",
        story_id: gameId,
      };

      const { data: sceneData, errors: sceneErrors } = await client.models.Scene.create(initialScene);
      if (!sceneErrors && sceneData) {
        await saveSceneIdToStory(sceneData.id, gameId);

        return { gameId, sceneData: sceneData as Scene };
      } else {
        console.error("Error creating new scene:", sceneErrors);
        throw new Error("Error creating new scene");
      }
    } else {
      console.error("Error creating new story:", storyErrors);
      throw new Error("Error creating new story");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error initializing game:", error.message);
    } else {
      console.error("Unknown error initializing game");
    }
    throw error;
  }
};

export { initializeGame, saveScene, fetchStoryById, fetchSceneById };
