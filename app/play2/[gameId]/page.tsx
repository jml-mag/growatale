// app/play2/[gameId]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/components/GameScreen2";
import { Scene } from "@/app/play2/types";
import { fetchStoryById, fetchSceneById } from "@/app/play2/utils/gameUtils";
import {createScene} from "@/app/play2/utils/generateContent"

const Game = () => {
  const { signOut, user } = useAuth();
  const [scene, setScene] = useState<Scene | null>(null);
  const [previousPrimaryText, setPreviousPrimaryText] = useState<string>("");
  const [previousSceneChoice, setPreviousSceneChoice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const gameId = pathname.split("/").pop();

  useEffect(() => {
    const fetchCurrentScene = async () => {
      if (!gameId) return;

      try {
        // Fetch the story to get the current scene ID
        const story = await fetchStoryById(gameId);
        const currentSceneId = story.current_scene;

        // Fetch the specific current scene by ID
        const scene = await fetchSceneById(currentSceneId);
        setScene(scene);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message || "Failed to fetch the initial scene.");
        } else {
          setError("Unknown error fetching the initial scene.");
        }
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
    <GameScreen signOut={signOut} user={user} gameId={gameId} scene={scene} />
  );
};

export default Game;
