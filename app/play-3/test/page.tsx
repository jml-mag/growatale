"use client";
import { Scene, Story } from "@/app/play-3/types";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { generateClient, Client } from "aws-amplify/data";
import { getAudio, getImage } from "@/app/play-3/utils/apiCalls";
import { Schema } from "@/amplify/data/resource";
import {
  initializeGame,
  fetchScene,
} from "@/app/play-3/utils/gameUtils";

const client = generateClient<Schema>();

const simulatedInitialResponse = {
  message:
    '\n{\n  "story": "In the heart of a vast forest, at the stroke of noon, brilliant sunlight filters through a canopy of ancient trees. Shadows dance upon the forest floor, disrupted only by the occasional scurrying of woodland creatures. The air is filled with the fragrance of pine and the gentle hum of life hidden amongst the underbrush. Far in the distance, the jagged peaks of a mountain range pierce the sky, their tops crowned with snow that gleams in the midday sun. Amidst the trees, a narrow, winding path leads deeper into the forest, while to the left, a small clearing offers a view of the mountains.",\n  "scene_description": "The forest is dense, filled with towering trees and the sound of rustling leaves. Sunlight streams through gaps in the foliage. A narrow path winds deeper into the forest. To the left, a small clearing provides a clear view of the distant, snow-capped mountains.",\n  "player_options": {\n    "directions": [\n      {\n        "direction": "deeper",\n        "command_text": "Venture deeper",\n        "transition_text": "Step onto the narrow path, heading further into the ancient forest."\n      },\n      {\n        "direction": "left",\n        "command_text": "Move left",\n        "transition_text": "Walk towards the clearing to admire the distant mountains."\n      }\n    ]\n  }\n}\n',
};

const Test = () => {
  const [initialScene, setInitialScene] = useState({
    image: "",
    audio: "",
    actions_available: [],
    primary_text: " ",
    scene_description: "",
    time: "12:00 PM",
    previous_scene: "",
    story_id: "61de8810-2701-408d-9c0c-51f8ed878219",
  });

  useEffect(() => {
    const primaryResponse = JSON.parse(simulatedInitialResponse.message);
    setInitialScene((prevState) => ({
      ...prevState,
      primary_text: primaryResponse.story,
      scene_description: primaryResponse.scene_description,
      actions_available: primaryResponse.player_options.directions,
      image: "images/1718292083767.png",
      audio: "audio/1718292069014.mp3",
    }));
  }, []); // Empty dependency array ensures this effect runs only once

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

  async function updateStoryCurrentScene(storyId: string, sceneId: string) {
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

  const logState = () => {
    console.log(initialScene);
  };

  const saveSceneIdToStory = async (sceneId: string, storyId: string) => {
    // save sceneId to associated story
    const storyResponse = await updateStoryCurrentScene(storyId, sceneId);
    console.log(storyResponse);
  };

  const saveStateToScene = async () => {
    const sceneResponse = await saveScene(initialScene);
    console.log(sceneResponse);
    const sceneId = sceneResponse.id;
    const storyId = sceneResponse.story_id;
    saveSceneIdToStory(sceneId, storyId);
  };

  return (
    <div className="text-white">
      <button
        onClick={() => {
          logState();
        }}
        className="py-3 px-2 m-3 bg-blue-600 text-blue-50"
      >
        Log State
      </button>
      <button
        onClick={() => {
          saveStateToScene();
        }}
        className="py-3 px-2 m-3 bg-green-600 text-green-50"
      >
        Save State
      </button>
    </div>
  );
};

export default Test;
