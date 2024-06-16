// @/app/play-5/[gameId]/page

"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/components/GameScreen4";
import { fetchScene, fetchStory, createScene } from "@/app/play-5/utils/gameUtils";
import { Scene } from "@/app/play-5/types";

// Custom hook for game logic
const useGameLogic = (gameId: string | undefined) => {
  // State Initialization
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function: Fetch Current Scene
  const fetchCurrentScene = useCallback(async () => {
    try {
      if (!gameId) throw new Error("Game ID is required");

      const data = await fetchStory(gameId);
      console.log(`Story: ${JSON.stringify(data, null, 2)}`);

      const fetchedScene = await fetchScene(data.current_scene);
      console.log(`Scene: ${JSON.stringify(fetchedScene, null, 2)}`);

      setScene(fetchedScene);
      if (!fetchedScene.primary_text) {
        console.log("Need to generate scene data!");
      }
    } catch (err) {
      console.error("Failed to fetch scene data:", err);
      setError("Failed to fetch scene data.");
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Function: Generate Scene
  const generateScene = useCallback(async (scene: Scene) => {
    try {
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
      setScene((prevScene) => {
        if (prevScene && prevScene.id === updatedScene.id && !prevScene.primary_text) {
          return updatedScene;
        }
        return prevScene;
      });

      // TODO: Implement data saving logic here
      console.log('NEED TO SAVE STATE TO DATA');
    } catch (error) {
      console.error("Error generating scene:", error);
    }
  }, []);

  // Effect: Fetch Current Scene on Mount
  useEffect(() => {
    fetchCurrentScene();
  }, [fetchCurrentScene]);

  // Effect: Generate Scene if Needed
  useEffect(() => {
    if (scene && scene.id && !scene.primary_text) {
      generateScene(scene);
    }
  }, [scene, generateScene]);

  // Return State and Functions
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
