// @/app/play/utils/gameUtils.ts

import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Scene, Story, Action } from "@/app/play/types";
import baseSettings from "@/app/play/baseSettings";
import genreSettings from "@/app/play/genreSettings";
import { downloadData, remove } from "@aws-amplify/storage";

const client = generateClient<Schema>();

const initializeGame = async (username: string, genre: string): Promise<{ gameId: string, sceneData: Scene, settings: any }> => {
  const settings = {
    ...baseSettings,
    ...genreSettings[genre]
  };

  const newStory: Story = {
    owner: username,
    author: settings.author,
    artist: settings.artist,
    time: settings.time,
    weather: settings.weather,
    genre: settings.genre,
    current_scene: "",
    player_health: 100,
    player_inventory: []
  };

  try {
    const { data: storyData, errors: storyErrors } = await client.models.Story.create(newStory);

    if (storyErrors) {
      console.error('Story creation errors:', storyErrors);
    }

    if (!storyErrors && storyData) {
      const gameId = storyData.id;

      const initialScene: Scene = {
        image: "",
        audio: "",
        actions_available: [],
        primary_text: "",
        scene_description: settings.starting_scene_description,
        previous_scene: "",
        story_id: gameId,
      };

      const { data: sceneData, errors: sceneErrors } = await client.models.Scene.create(initialScene);
      if (sceneErrors || !sceneData) {
        console.error("Error creating new scene:", sceneErrors);
        throw new Error("Error creating new scene");
      }

      await saveSceneIdToStory(sceneData.id, gameId);

      return { gameId, sceneData: sceneData as Scene, settings };
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

async function saveScene(sceneData: Scene) {
  try {
    const { id, createdAt, updatedAt, owner, ...validSceneData } = sceneData as any;

    // Ensure leads_to is always a string
    validSceneData.actions_available = validSceneData.actions_available.map((action: Action) => ({
      ...action,
      leads_to: action.leads_to || "", // Default to an empty string if leads_to is not set
    }));

    const { data: savedScene, errors } = id
      ? await client.models.Scene.update({ id, ...validSceneData })
      : await client.models.Scene.create(validSceneData);

    if (errors || !savedScene) {
      console.error("Error saving scene:", errors);
      throw new Error("Error saving scene");
    }
    return savedScene;
  } catch (error) {
    console.error("Error saving scene:", error);
    throw error;
  }
}

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

export const weatherDescriptions = {
  1: "sunny",
  2: "mostly sunny",
  3: "partly cloudy",
  4: "partly sunny",
  5: "mostly cloudy",
  6: "cloudy",
  7: "light rain",
  8: "moderate rain",
  9: "heavy rain",
  10: "pouring rain",
};

export const adjustWeather = (currentWeather: number) => {
  const change = Math.random();
  let newWeather = currentWeather;

  if (change < 0.4) {
    newWeather += 1;  // 40% chance to increase by 1
  } else if (change < 0.6) {
    newWeather -= 1;  // 20% chance to decrease by 1
  } else if (change < 0.7) {
    newWeather += 2;  // 10% chance to increase by 2
  } else if (change < 0.8) {
    newWeather -= 2;  // 10% chance to decrease by 2
  }

  // Ensure weather stays within bounds
  if (newWeather < 1) newWeather = 1;
  if (newWeather > 10) newWeather = 10;

  return newWeather;
};

export const convertTimeToNumber = (time: string) => {
  const [timePart, meridiem] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (meridiem === 'PM' && hours !== 12) {
    hours += 12;
  } else if (hours === 12 && meridiem === 'AM') {
    hours = 0;
  }

  return { hours, minutes };
};

export const incrementTime = (time: string) => {
  let { hours, minutes } = convertTimeToNumber(time);
  minutes += 15;

  if (minutes >= 60) {
    minutes -= 60;
    hours += 1;
  }

  if (hours >= 24) {
    hours -= 24;
  }

  const newMeridiem = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${newMeridiem}`;
};

const saveSceneIdToStory = async (sceneId: string, storyId: string) => {
  try {
    const { data, errors } = await client.models.Story.update({
      id: storyId,
      current_scene: sceneId,
    });

    if (!errors && data) {
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

const saveStateToScene = async (initialScene: Scene) => {
  const sceneResponse = await saveScene(initialScene);
  const sceneId = sceneResponse.id;
  const storyId = sceneResponse.story_id;
  await saveSceneIdToStory(sceneId, storyId);
};

const deleteStoryWithAssets = async (storyId: string): Promise<void> => {
  try {
    const { data: scenes, errors: sceneErrors } = await client.models.Scene.list({
      filter: { story_id: { eq: storyId } },
    });

    if (sceneErrors) {
      console.error("Errors fetching scenes:", sceneErrors);
      return;
    }

    if (scenes) {
      for (const scene of scenes) {
        if (scene.image) {
          await remove({ path: scene.image });
        }
        if (scene.audio) {
          await remove({ path: scene.audio });
        }

        await client.models.Scene.delete({ id: scene.id });
      }
    }

    await client.models.Story.delete({ id: storyId });
  } catch (error) {
    console.error("Error deleting story and its assets:", error);
  }
};

export { initializeGame, saveStateToScene, saveSceneIdToStory, saveScene, fetchStoryById, fetchSceneById, deleteStoryWithAssets };
