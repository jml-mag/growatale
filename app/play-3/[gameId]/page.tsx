// File Path: app/play-3/[gameId]/page.tsx

"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/components/GameScreen3";
import { fetchStory, fetchScene, convertToActions } from "@/app/play-3/utils/gameUtils";
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
        const story = await fetchStory(gameId.toString());

        // Use the current_scene from the story to fetch the scene
        const fetchedScene = await fetchScene(story.current_scene);

        // Convert actions_available from string[] | null | undefined to Action[]
        const actions = convertToActions(fetchedScene.actions_available);

        // Update the scene state with the fetched scene data
        setScene({
          ...fetchedScene,
          actions_available: actions,
        });
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
