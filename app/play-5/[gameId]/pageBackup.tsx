"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/components/GameScreen4";
import { fetchScene, fetchStory, createScene } from "@/app/play-5/utils/gameUtils";
import { Scene } from "@/app/play-5/types";

// Function to fetch the current story
const fetchCurrentStory = async (gameId: string | undefined) => {
  if (!gameId) throw new Error("Game ID is required");
  const data = await fetchStory(gameId);
  console.log(`Story: ${JSON.stringify(data, null, 2)}`);
  return data;
};

// Function to fetch the current scene
const fetchCurrentScene = async (currentSceneId: string) => {
  const fetchedScene = await fetchScene(currentSceneId);
  console.log(`Scene: ${JSON.stringify(fetchedScene, null, 2)}`);
  return fetchedScene;
};

// Function to generate a new scene if necessary
const generateScene = async (scene: Scene, setScene: (scene: Scene) => void) => {
  console.log(`Generating scene for: ${scene.id}`);
  const newScene = await createScene(scene);
  console.log(`New Scene Data: ${JSON.stringify(newScene, null, 2)}`);

  const updatedScene: Scene = {
    ...scene,
    primary_text: newScene.story,
    scene_description: newScene.scene_description,
    actions_available: newScene.player_options.directions || [], // Ensure actions_available is always an array
  };

  console.log(`Updated Scene: ${JSON.stringify(updatedScene, null, 2)}`);
  setScene(updatedScene);

  // TODO: Implement data saving logic here
  console.log('NEED TO SAVE STATE TO DATA');
};

// Handler function for each turn
const handleTurn = async (gameId: string | undefined, setScene: (scene: Scene) => void, setLoading: (loading: boolean) => void, setError: (error: string | null) => void) => {
  setLoading(true);
  try {
    const story = await fetchCurrentStory(gameId);
    const currentScene = await fetchCurrentScene(story.current_scene);
    setScene(currentScene);
    if (!currentScene.primary_text) {
      console.log("Need to generate scene data!");
      await generateScene(currentScene, setScene);
    }
  } catch (error) {
    console.error("Failed to handle turn:", error);
    setError("Failed to handle turn.");
  } finally {
    setLoading(false);
  }
};

// Custom hook for game logic
const useGameLogic = (gameId: string | undefined) => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to handle fetching and generating scenes as needed
  const handleSceneGeneration = useCallback(async () => {
    await handleTurn(gameId, setScene, setLoading, setError);
  }, [gameId]);

  // Effect: Fetch and generate scene on mount
  useEffect(() => {
    handleSceneGeneration();
  }, [handleSceneGeneration]);

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
