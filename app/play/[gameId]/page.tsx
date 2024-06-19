// @/app/play-5/[gameId]/page

"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/components/GameScreen5";
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
  const data = await fetchStory(gameId);
  console.log(`const fetchCurrentStory: ${JSON.stringify(data, null, 2)}`);
  return data;
};

// Function to fetch the current scene
const fetchCurrentScene = async (currentSceneId: string) => {
  const fetchedScene = await fetchScene(currentSceneId);
  console.log(
    `const fetchCurrentScene: ${JSON.stringify(fetchedScene, null, 2)}`
  );
  return fetchedScene;
};

// Function to generate a new scene if necessary
const generateScene = async (scene: Scene) => {
  console.log(`const generateScene: ${scene.id}`);
  const newScene = await createScene(scene);
  console.log(
    `const newScene = await createScene(scene): ${JSON.stringify(
      newScene,
      null,
      2
    )}`
  );
  const updatedScene: Scene = {
    ...scene,
    primary_text: newScene.story,
    scene_description: newScene.scene_description,
    actions_available: newScene.player_options.directions || [], // Ensure actions_available is always an array
  };

  console.log(
    `const updatedScene(Primary): ${JSON.stringify(updatedScene, null, 2)}`
  );
  //await saveScene(updatedScene); // Save the updated scene to the database
  await savePrimaryCallToScene(updatedScene);

  return updatedScene;
};
const generateAssets = async (scene: Scene) => {
  const generatedAudio = await getAudio(scene.primary_text);
  const generatedImage = await getImage(scene.scene_description);
  const updatedScene: Scene = {
    ...scene,
    image: generatedImage || scene.image,
    audio: generatedAudio || scene.audio,
  };
  console.log(
    `const updatedScene(Assets): ${JSON.stringify(updatedScene, null, 2)}`
  );
  await saveAssetsCallToScene(updatedScene);
  return updatedScene;
};

// Function to handle fetching and generating scenes as needed
const handleSceneGeneration = async (
  gameId: string | undefined,
  setScene: (scene: Scene) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  if (!gameId) {
    setError("Game ID is required");
    return;
  }

  setLoading(true);

  try {
    console.log("Fetching current story...");
    const story = await fetchCurrentStory(gameId);
    console.log("Current story:", story);

    console.log("Fetching current scene...");
    let currentScene = await fetchCurrentScene(story.current_scene);
    console.log("Current scene:", currentScene);

    if (!currentScene.primary_text) {
      console.log("Generating new scene...");
      currentScene = await generateScene(currentScene);
      console.log("Newly generated scene:", currentScene);
    }

    if (!currentScene.image && !currentScene.audio) {
      console.log("Generating assets for scene...");
      currentScene = await generateAssets(currentScene);
      console.log("Scene with generated assets:", currentScene);
    }

    setScene(currentScene);
    console.log("Scene state updated:", currentScene);
  } catch (error) {
    console.error("Failed to handle scene generation:", error);
    setError("Failed to handle scene generation.");
  } finally {
    setLoading(false);
  }
};

// Custom hook for game logic
const useGameLogic = (gameId: string | undefined) => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef<boolean>(false); // Track if initialization has occurred

  useEffect(() => {
    console.log("useEffect triggered with gameId:", gameId);
    if (!initializedRef.current && gameId) {
      initializedRef.current = true;
      handleSceneGeneration(gameId, setScene, setLoading, setError);
    }
  }, [gameId]);

  useEffect(() => {
    console.log("Scene updated:", scene);
  }, [scene]);

  return { scene, loading, error };
};

const Game = () => {
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const gameId = pathname.split("/").pop();
  const { scene, loading, error } = useGameLogic(gameId);

  console.log("Game Component Rendered - Scene:", scene);

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
