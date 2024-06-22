// @/app/play/[gameId]/page

"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/components/GameScreen";
import {
  fetchScene,
  fetchStory,
  createScene,
  savePrimaryCallToScene,
  saveAssetsCallToScene,
} from "@/app/play/utils/gameUtils";
import { Scene } from "@/app/play/types";
import { getAudio, getImage } from "@/app/play/utils/apiCalls";

// Function to fetch the current story
const fetchCurrentStory = async (gameId: string | undefined) => {
  if (!gameId) throw new Error("Game ID is required");
  const start = performance.now();
  const data = await fetchStory(gameId);
  console.log(`fetchStory took ${performance.now() - start}ms`);
  return data;
};

// Function to fetch the current scene
const fetchCurrentScene = async (currentSceneId: string) => {
  const start = performance.now();
  const fetchedScene = await fetchScene(currentSceneId);
  console.log(`fetchScene took ${performance.now() - start}ms`);
  return fetchedScene;
};

// Function to generate the primary text for the scene
const generatePrimaryText = async (
  currentScene: Scene,
  setScene: (scene: Scene) => void
) => {
  const start = performance.now();
  const newScene = await createScene(currentScene);
  console.log(`createScene took ${performance.now() - start}ms`);
  
  const updatedScene: Scene = {
    ...currentScene,
    primary_text: newScene.story,
    scene_description: newScene.scene_description,
    actions_available: newScene.player_options.directions || [],
  };

  const saveStart = performance.now();
  await savePrimaryCallToScene(updatedScene);
  console.log(`savePrimaryCallToScene took ${performance.now() - saveStart}ms`);

  setScene(updatedScene); // Update the scene state with the new primary text
  return updatedScene;
};

// Function to generate the assets for the scene
const generateAssets = async (
  scene: Scene,
  setScene: (scene: Scene) => void,
  totalStart: number // Pass the start time to calculate total time
) => {
  // Initialize the updated scene with the existing scene values
  let updatedScene: Scene = { ...scene };

  // Function to update the scene state
  const updateSceneState = (key: keyof Scene, value: string) => {
    updatedScene = { ...updatedScene, [key]: value };
    setScene(updatedScene);
  };

  // Function to save the updated scene
  const saveScene = async (key: keyof Scene, value: string) => {
    updatedScene = { ...updatedScene, [key]: value };
    const saveStart = performance.now();
    await saveAssetsCallToScene(updatedScene);
    console.log(`saveAssetsCallToScene for ${key} took ${performance.now() - saveStart}ms`);
    
    // If the final image is updated, log the total time
    if (key === "image") {
      console.log(`Total time from page load to image render: ${performance.now() - totalStart}ms`);
    }
  };

  // Start fetching audio and image asynchronously
  const audioStart = performance.now();
  getAudio(scene.primary_text)
    .then((generatedAudio) => {
      console.log(`getAudio took ${performance.now() - audioStart}ms`);
      if (generatedAudio) {
        updateSceneState("audio", generatedAudio);
        saveScene("audio", generatedAudio); // Save in the background
      }
    })
    .catch((error) => {
      console.error("Error generating audio:", error);
      // Handle audio error appropriately
    });

  const imageStart = performance.now();
  getImage(scene.scene_description)
    .then((generatedImage) => {
      console.log(`getImage took ${performance.now() - imageStart}ms`);
      if (generatedImage) {
        updateSceneState("image", generatedImage);
        saveScene("image", generatedImage); // Save in the background
      }
    })
    .catch((error) => {
      console.error("Error generating image:", error);
      // Handle image error appropriately
    });
};

// Function to handle fetching and generating scenes as needed
const handleSceneGeneration = async (
  gameId: string | undefined,
  setScene: (scene: Scene) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  totalStart: number // Pass the start time to calculate total time
) => {
  if (!gameId) {
    setError("Game ID is required");
    return;
  }

  setLoading(true);

  try {
    const story = await fetchCurrentStory(gameId);
    let currentScene = await fetchCurrentScene(story.current_scene);

    if (!currentScene.primary_text) {
      currentScene = await generatePrimaryText(currentScene, setScene);
    } else {
      setScene(currentScene); // Ensure scene is set even if primary text is already present
    }

    if (!currentScene.image || !currentScene.audio) {
      await generateAssets(currentScene, setScene, totalStart);
    } else {
      console.log(`Total time from page load to image render: ${performance.now() - totalStart}ms`);
    }
  } catch (error) {
    setError("Failed to handle scene generation.");
  } finally {
    setLoading(false);
  }
};

// Custom hook for game logic
const useGameLogic = (gameId: string | undefined) => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef<boolean>(false); // Track if initialization has occurred
  const totalStartRef = useRef<number | null>(null); // Track the total start time

  useEffect(() => {
    if (!initializedRef.current && gameId) {
      initializedRef.current = true;
      totalStartRef.current = performance.now();
      handleSceneGeneration(gameId, setScene, setLoading, setError, totalStartRef.current);
    }
  }, [gameId]);

  return { scene, loading, error };
};

const Game = () => {
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const gameId = pathname.split("/").pop();
  const { scene, loading, error } = useGameLogic(gameId);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <GameScreen signOut={signOut} user={user} gameId={gameId} scene={scene} />
  );
};

export default Game;

