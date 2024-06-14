// @/app/play-4/[gameId]/page.tsx

"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/components/GameScreen4";
import {
  fetchStory,
  fetchScene,
  convertToActions,
} from "@/app/play-3/utils/gameUtils";
import { fetchCurrentSceneId } from "@/app/play-4/utils/gameUtils";
import gameSettings from "../gameSettings";
import { Scene } from "@/app/play-3/types";

export default function Game() {
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const gameId = pathname.split("/").pop();
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCurrentScene = async () => {
      try {
        if (!gameId) throw new Error("Game ID is required");

        // Fetch the story using the gameId
        const data = await fetchStory(gameId);
        console.log(`Story: ${JSON.stringify(data, null, 2)}`);

        // Use the current_scene from the story to fetch the scene
        const fetchedScene = await fetchScene(data.current_scene);
        console.log(`Scene: ${JSON.stringify(fetchedScene, null, 2)}`);

        if (fetchedScene.previous_scene !== "") {
          // Update the scene state with the fetched scene data
          console.log('Setting state with scene data')
          setScene({
            ...fetchedScene,
          });
        } else {
          // Generate the scene data using apiCalls.ts and gameUtils.ts
          console.log("Need to generate scene data!");
          // createScene() from gameUtils.ts. 
          // update the scene state with the generated returned scene data
        }
      } catch (err) {
        setError("Failed to fetch scene data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentScene();
  }, [gameId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <GameScreen signOut={signOut} user={user} gameId={gameId} scene={scene} /> // Pass the scene data as props
  );
}
