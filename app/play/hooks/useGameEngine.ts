// @/app/play/hooks/useGameEngine.ts

import { useState, useEffect, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Scene, Action } from "@/app/play/types";
import { fetchStoryById, fetchSceneById, saveScene, saveSceneIdToStory, incrementTime, adjustWeather, weatherDescriptions } from "@/app/play/utils/gameUtils";
import { createScene } from "@/app/play/utils/generateContent";
import { getImage, getAudio } from "@/app/play/utils/apiCalls";
import { downloadData } from "aws-amplify/storage";

const client = generateClient<Schema>();

const useGameEngine = (gameId: any) => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showActions, setShowActions] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(null);

  const fetchAndSetScene = useCallback(async (sceneId: string, storyId: string, settings: any) => {
    try {
      setShowActions(false);
      setLoading(true);
  
      let fetchedScene = await fetchSceneById(sceneId);
  
      if (!fetchedScene.primary_text && fetchedScene.actions_available.length === 0) {
        const generatedContent = await createScene(fetchedScene, '', '', settings);
        fetchedScene = {
          ...fetchedScene,
          primary_text: generatedContent.story,
          actions_available: generatedContent.player_options.directions.filter((action: Action): action is Action => action !== null),
        };
        await saveScene(fetchedScene);
      }
  
      setScene(fetchedScene);
      await saveSceneIdToStory(fetchedScene.id || '', storyId);
  
      const story = await fetchStoryById(storyId);
  
      console.log("Starting image and audio API calls...");
  
      const fetchImagePromise = (async () => {
        console.log("Image API call started...");
        const imageStartTime = Date.now();
  
        if (!fetchedScene.image) {
          const imageUrl = await getImage(fetchedScene.scene_description, story.time, weatherDescriptions[story.weather as keyof typeof weatherDescriptions], settings);
          if (imageUrl) {
            fetchedScene.image = imageUrl;
            await saveScene(fetchedScene);
            setScene((prevScene: Scene | null) => prevScene ? { ...prevScene, image: imageUrl } : prevScene);
          }
        }
  
        const imageEndTime = Date.now();
        console.log(`Image API call finished. Duration: ${(imageEndTime - imageStartTime) / 1000} seconds`);
  
      })();
  
      const fetchAudioPromise = (async () => {
        console.log("Audio API call started...");
        const audioStartTime = Date.now();
  
        if (!fetchedScene.audio) {
          const audioUrl = await getAudio(fetchedScene.primary_text, settings);
          if (audioUrl) {
            fetchedScene.audio = audioUrl;
            await saveScene(fetchedScene);
            setScene((prevScene: Scene | null) => prevScene ? { ...prevScene, audio: audioUrl } : prevScene);
            setShowActions(true);
          }
        } else {
          setShowActions(true);
        }
  
        const audioEndTime = Date.now();
        console.log(`Audio API call finished. Duration: ${(audioEndTime - audioStartTime) / 1000} seconds`);
  
      })();
  
      // Run both fetch operations concurrently
      await Promise.all([fetchImagePromise, fetchAudioPromise]);
  
      if (fetchedScene.image) {
        const downloadResult = await downloadData({ path: fetchedScene.image });
        const blob = await (await downloadResult.result).body.blob();
        setImageFile(new File([blob], "image-file.png", { type: blob.type }));
      }
  
      if (fetchedScene.audio) {
        const downloadResult = await downloadData({ path: fetchedScene.audio });
        const blob = await (await downloadResult.result).body.blob();
        setAudioFile(new File([blob], "audio-file.mp3", { type: blob.type }));
      }
  
      console.log("Both image and audio API calls completed.");
  
    } catch (error) {
      console.error('Error fetching and setting scene:', error);
      setError(error instanceof Error ? error.message : "Unknown error fetching the scene.");
    } finally {
      setLoading(false);
    }
  }, []);
  

  useEffect(() => {
    if (!gameId) return;

    const fetchCurrentScene = async () => {
      setLoading(true);
      try {
        const story = await fetchStoryById(gameId);
        const genreSettings = await import(`@/app/play/genreSettings`).then(mod => mod.default);
        const baseSettings = await import(`@/app/play/baseSettings`).then(mod => mod.default);
        const settings = {
          ...baseSettings,
          ...genreSettings[story.genre]
        };
        setSettings(settings);
        await fetchAndSetScene(story.current_scene, gameId, settings);
      } catch (error) {
        console.error('Error fetching current scene:', error);
        setError(error instanceof Error ? error.message : "Unknown error fetching the story.");
        setLoading(false);
      }
    };

    fetchCurrentScene();
  }, [gameId, fetchAndSetScene]);

  const handlePlayerAction = useCallback(async (action: Action) => {
    if (!scene || !scene.id) return;
    setLoading(true);
    setShowActions(false);

    try {
      if (action.leads_to) {
        if (gameId) {
          await fetchAndSetScene(action.leads_to, gameId, settings);
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
        previous_scene: scene.id,
        story_id: scene.story_id,
      };
      let createdScene = await saveScene(newScene);

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

      const generatedContent = await createScene(createdScene as Scene, scene.primary_text, action.direction, settings);
      createdScene = {
        ...createdScene,
        primary_text: generatedContent.story,
        scene_description: generatedContent.scene_description,
        actions_available: generatedContent.player_options.directions.filter((action: Action | null): action is Action => action !== null),
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

      const story = await fetchStoryById(scene.story_id);
      const newTime = incrementTime(story.time);
      const newWeather = adjustWeather(story.weather);

      if (story.id) {
        await client.models.Story.update({
          id: story.id,
          time: newTime,
          weather: newWeather,
        });
      }

      setScene(createdScene as Scene);

      const fetchImagePromise = (async () => {
        const imageUrl = await getImage(createdScene.scene_description, newTime, weatherDescriptions[newWeather as keyof typeof weatherDescriptions], settings);
        if (imageUrl) {
          createdScene.image = imageUrl;
          await saveScene(createdScene as Scene);
          setScene((prevScene: Scene | null) => prevScene ? { ...prevScene, image: imageUrl } : prevScene);
        }
      })();

      const fetchAudioPromise = (async () => {
        const audioUrl = await getAudio(createdScene.primary_text, settings);
        if (audioUrl) {
          createdScene.audio = audioUrl;
          await saveScene(createdScene as Scene);
          setScene((prevScene: Scene | null) => prevScene ? { ...prevScene, audio: audioUrl } : prevScene);
          setShowActions(true);
        }
      })();

      await Promise.all([fetchImagePromise, fetchAudioPromise]);

      if (createdScene.image) {
        const downloadResult = await downloadData({ path: createdScene.image });
        const blob = await (await downloadResult.result).body.blob();
        setImageFile(new File([blob], "image-file.png", { type: blob.type }));
      }

      if (createdScene.audio) {
        const downloadResult = await downloadData({ path: createdScene.audio });
        const blob = await (await downloadResult.result).body.blob();
        setAudioFile(new File([blob], "audio-file.mp3", { type: blob.type }));
      }

      await fetchAndSetScene(createdScene.id, createdScene.story_id, settings);
    } catch (error) {
      console.error('Error handling player action:', error);
      setError(error instanceof Error ? error.message : "Unknown error handling player action.");
    } finally {
      setLoading(false);
    }
  }, [scene, gameId, fetchAndSetScene, settings]);

  return { scene, loading, error, audioFile, imageFile, showActions, handlePlayerAction };
};

export default useGameEngine;
