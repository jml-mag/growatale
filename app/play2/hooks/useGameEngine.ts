import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Scene, Action } from "@/app/play2/types";
import { fetchStoryById, fetchSceneById, saveScene } from "@/app/play2/utils/gameUtils";
import { createScene } from "@/app/play2/utils/generateContent";
import { getImage, getAudio } from "@/app/play2/utils/apiCalls";

const useGameEngine = () => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const gameId = pathname.split("/").pop();

  const fetchAndSetScene = async (sceneId: string) => {
    try {
      let fetchedScene = await fetchSceneById(sceneId);

      if (!fetchedScene.primary_text && fetchedScene.actions_available.length === 0) {
        const generatedContent = await createScene(fetchedScene, '', '');
        fetchedScene = {
          ...fetchedScene,
          primary_text: generatedContent.story,
          actions_available: generatedContent.player_options.directions.filter((action: Action): action is Action => action !== null),
        };
        await saveScene(fetchedScene);
      }

      // Directly use the S3 path as the image URL
      if (fetchedScene.image) {
        const imageUrl = fetchedScene.image;
        fetchedScene.image = imageUrl || "";
      } else {
        const imageUrl = await getImage(fetchedScene.scene_description);
        if (imageUrl) {
          fetchedScene.image = imageUrl;
          await saveScene(fetchedScene);
        }
      }

      // Fetch and set the audio for the scene
      if (!fetchedScene.audio) {
        const audioUrl = await getAudio(fetchedScene.primary_text);
        if (audioUrl) {
          fetchedScene.audio = audioUrl;
          await saveScene(fetchedScene);
        }
      }

      setScene(fetchedScene);
      console.log('Fetched and set scene:', fetchedScene);
    } catch (error) {
      console.error('Error fetching and setting scene:', error);
      setError(error instanceof Error ? error.message : "Unknown error fetching the scene.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('scene state changed:', scene);
  }, [scene]);

  useEffect(() => {
    if (!gameId) return;
    const fetchCurrentScene = async () => {
      setLoading(true);
      try {
        const story = await fetchStoryById(gameId);
        await fetchAndSetScene(story.current_scene);
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
      if (action.leads_to) {
        await fetchAndSetScene(action.leads_to);
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

      const generatedContent = await createScene(createdScene as Scene, '', '');
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

      // Generate and save the image for the new scene
      const imageUrl = await getImage(createdScene.scene_description);
      if (imageUrl) {
        createdScene.image = imageUrl;
        await saveScene(createdScene as Scene);
      }

      // Generate and save the audio for the new scene
      const audioUrl = await getAudio(createdScene.primary_text);
      if (audioUrl) {
        createdScene.audio = audioUrl;
        await saveScene(createdScene as Scene);
      }

      await fetchAndSetScene(createdScene.id);
      console.log('New scene created and set:', scene);
    } catch (error) {
      console.error('Error handling player action:', error);
      setError(error instanceof Error ? error.message : "Unknown error handling player action.");
    } finally {
      setLoading(false);
    }
  }, [scene]);

  return { scene, loading, error, handlePlayerAction };
};

export default useGameEngine;
