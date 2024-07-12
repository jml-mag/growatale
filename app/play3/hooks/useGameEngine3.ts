// @/app/play3/hooks/useGameEngine3.ts

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Scene, Action } from "@/app/play3/types";
import { fetchStoryById, fetchSceneById, saveScene, saveSceneIdToStory } from "@/app/play3/utils/gameUtils";
import { createScene } from "@/app/play3/utils/generateContent";
import { getImage, getAudio } from "@/app/play3/utils/apiCalls";

const useGameEngine = () => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previousPrimaryText, setPreviousPrimaryText] = useState<string>("");
  const [previousSceneChoice, setPreviousSceneChoice] = useState<string>("");
  const pathname = usePathname();
  const gameId = pathname.split("/").pop();

  useEffect(() => {
    console.log(`scene: ${JSON.stringify(scene, null, 2)}`);
  }, [scene]);

  const fetchAndSetScene = async (sceneId: string, storyId: string) => {
    try {
      let fetchedScene = await fetchSceneById(sceneId);

      if (!fetchedScene.primary_text && fetchedScene.actions_available.length === 0) {
        const generatedContent = await createScene(fetchedScene, previousPrimaryText, previousSceneChoice);
        fetchedScene = {
          ...fetchedScene,
          primary_text: generatedContent.story,
          actions_available: generatedContent.player_options.directions.filter((action: Action): action is Action => action !== null),
        };
        await saveScene(fetchedScene);
      }

      // Set the primary text and actions immediately
      setScene(fetchedScene);

      // Update the story's current_scene field
      await saveSceneIdToStory(fetchedScene.id || '', storyId);

      // Fetch and set image asynchronously
      if (!fetchedScene.image) {
        getImage(fetchedScene.scene_description).then(imageUrl => {
          if (imageUrl) {
            fetchedScene.image = imageUrl;
            saveScene(fetchedScene);
            setScene(prevScene => prevScene ? { ...prevScene, image: imageUrl } : prevScene);
          }
        }).catch(error => console.error('Error fetching image:', error));
      }

      // Fetch and set audio asynchronously
      if (!fetchedScene.audio) {
        getAudio(fetchedScene.primary_text).then(audioUrl => {
          if (audioUrl) {
            fetchedScene.audio = audioUrl;
            saveScene(fetchedScene);
            setScene(prevScene => prevScene ? { ...prevScene, audio: audioUrl } : prevScene);
          }
        }).catch(error => console.error('Error fetching audio:', error));
      }
    } catch (error) {
      console.error('Error fetching and setting scene:', error);
      setError(error instanceof Error ? error.message : "Unknown error fetching the scene.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gameId) return;
    const fetchCurrentScene = async () => {
      setLoading(true);
      try {
        const story = await fetchStoryById(gameId);
        await fetchAndSetScene(story.current_scene, gameId);
      } catch (error) {
        console.error('Error fetching current scene:', error);
        setError(error instanceof Error ? error.message : "Unknown error fetching the story.");
        setLoading(false);
      }
    };
    fetchCurrentScene();
  }, [gameId]);

  const handlePlayerAction = useCallback(async (action: Action) => {
    if (!scene || !scene.id) return;
    setLoading(true);
    try {
      // Update previous primary text and choice
      setPreviousPrimaryText(scene.primary_text);
      setPreviousSceneChoice(action.command_text);

      if (action.leads_to) {
        if (gameId) {
          await fetchAndSetScene(action.leads_to, gameId);
        } else {
          setError("Game ID is required");
          setLoading(false);
        }
        return;
      }

      const newScene: Scene = {
        image: "",
        audio: "",
        actions_available: [],
        primary_text: '',
        scene_description: '',
        time: '',
        previous_scene: scene.id,
        story_id: scene.story_id,
      };
      let createdScene = await saveScene(newScene);

      // Update the story's current_scene field
      await saveSceneIdToStory(createdScene.id, scene.story_id);

      const updatedAction: Action = {
        ...action,
        leads_to: createdScene.id,
      };

      const updatedActions = scene.actions_available.map((act: Action | null) => {
        if (act && act.direction === action.direction) {
          return updatedAction;
        }
        return act;
      }).filter((act): act is Action => act !== null);

      const updatedScene: Scene = {
        ...scene,
        actions_available: updatedActions,
      };
      await saveScene(updatedScene);

      const generatedContent = await createScene(createdScene as Scene, scene.primary_text, action.command_text);
      createdScene = {
        ...createdScene,
        primary_text: generatedContent.story,
        scene_description: generatedContent.scene_description,
        actions_available: generatedContent.player_options.directions.filter((action: Action): action is Action => action !== null),
      };

      const finalCreatedSceneActions = createdScene.actions_available.map((act: Action | null) => {
        if (act && act.direction === 'back') {
          const updatedBackAction = {
            ...act,
            leads_to: scene.id,
          };
          return updatedBackAction;
        }
        return act;
      }).filter((act): act is Action => act !== null);

      createdScene = { ...createdScene, actions_available: finalCreatedSceneActions };

      setScene(createdScene as Scene);

      const imageUrl = await getImage(createdScene.scene_description);
      if (imageUrl) {
        createdScene.image = imageUrl;
        await saveScene(createdScene as Scene);
        setScene(prevScene => prevScene ? { ...prevScene, image: imageUrl } : prevScene);
      }

      const audioUrl = await getAudio(createdScene.primary_text);
      if (audioUrl) {
        createdScene.audio = audioUrl;
        await saveScene(createdScene as Scene);
        setScene(prevScene => prevScene ? { ...prevScene, audio: audioUrl } : prevScene);
      }

      await fetchAndSetScene(createdScene.id, createdScene.story_id);
    } catch (error) {
      console.error('Error handling player action:', error);
      setError(error instanceof Error ? error.message : "Unknown error handling player action.");
    } finally {
      setLoading(false);
    }
  }, [scene, gameId]);

  return { scene, loading, error, handlePlayerAction };
};

export default useGameEngine;
