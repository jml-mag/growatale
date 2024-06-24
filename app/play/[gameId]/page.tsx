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
  saveScene,
} from "@/app/play/utils/gameUtils";
import { Scene } from "@/app/play/types";
import { getAudio, getImage } from "@/app/play/utils/apiCalls";

const fetchCurrentStory = async (gameId: string | undefined) => {
  if (!gameId) throw new Error("Game ID is required");
  const start = performance.now();
  const data = await fetchStory(gameId);
  console.log(`fetchStory took ${performance.now() - start}ms`);
  return data;
};

const fetchCurrentScene = async (currentSceneId: string) => {
  const start = performance.now();
  const fetchedScene = await fetchScene(currentSceneId);
  console.log(`fetchScene took ${performance.now() - start}ms`);
  return fetchedScene;
};

const generatePrimaryText = async (
  currentScene: Scene,
  setScene: (scene: Scene) => void,
  previousPrimaryText: string,
  playerChoice: string
) => {
  const start = performance.now();
  const newScene = await createScene(currentScene, previousPrimaryText, playerChoice);
  console.log(`createScene: `, newScene);
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

  setScene(updatedScene);
  return updatedScene;
};

const generateAssets = async (
  scene: Scene,
  setScene: (scene: Scene) => void,
  totalStart: number
) => {
  let updatedScene: Scene = { ...scene };

  const updateSceneState = (key: keyof Scene, value: string) => {
    updatedScene = { ...updatedScene, [key]: value };
    setScene(updatedScene);
  };

  const saveScene = async (key: keyof Scene, value: string) => {
    updatedScene = { ...updatedScene, [key]: value };
    const saveStart = performance.now();
    await saveAssetsCallToScene(updatedScene);
    console.log(
      `saveAssetsCallToScene for ${key} took ${performance.now() - saveStart}ms`
    );
    if (key === "image") {
      console.log(
        `Total time from page load to image render: ${
          performance.now() - totalStart
        }ms`
      );
    }
  };

  const audioStart = performance.now();
  getAudio(scene.primary_text)
    .then((generatedAudio) => {
      console.log(`getAudio took ${performance.now() - audioStart}ms`);
      if (generatedAudio) {
        updateSceneState("audio", generatedAudio);
        saveScene("audio", generatedAudio);
      }
    })
    .catch((error) => {
      console.error("Error generating audio:", error);
    });

  const imageStart = performance.now();
  getImage(scene.scene_description)
    .then((generatedImage) => {
      console.log(`getImage took ${performance.now() - imageStart}ms`);
      if (generatedImage) {
        updateSceneState("image", generatedImage);
        saveScene("image", generatedImage);
      }
    })
    .catch((error) => {
      console.error("Error generating image:", error);
    });
};

const handleSceneGeneration = async (
  gameId: string | undefined,
  setScene: (scene: Scene) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  totalStart: number
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
      currentScene = await generatePrimaryText(currentScene, setScene, "", "");
    } else {
      setScene(currentScene);
    }

    if (!currentScene.image || !currentScene.audio) {
      await generateAssets(currentScene, setScene, totalStart);
    } else {
      console.log(
        `Total time from page load to image render: ${
          performance.now() - totalStart
        }ms`
      );
    }
  } catch (error) {
    setError("Failed to handle scene generation.");
  } finally {
    setLoading(false);
  }
};

const fetchNewScene = async (
  gameId: string | undefined,
  previousSceneId: string,
  storyId: string,
  previousPrimaryText: string,
  playerChoice: string,
  setScene: (scene: Scene) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  setLoading(true);

  try {
    const newScene: Scene = {
      previous_scene: previousSceneId,
      story_id: storyId,
      image: "",
      audio: "",
      actions_available: [],
      primary_text: "",
      scene_description: "",
      time: "",
    };

    // Save initial new scene to get the ID
    const initialNewScene = await saveScene(newScene);
    newScene.id = initialNewScene.id;
    console.log("New scene created with ID: ", newScene.id);

    let createdScene = await generatePrimaryText(newScene, setScene, previousPrimaryText, playerChoice);
    await generateAssets(createdScene, setScene, performance.now());
  } catch (error) {
    setError("Failed to create new scene.");
  } finally {
    setLoading(false);
  }
};

const fetchPreviousScene = async (
  previousSceneId: string,
  storyId: string,
  previousPrimaryText: string,
  setScene: (scene: Scene) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  setLoading(true);

  try {
    const fetchedScene = await fetchScene(previousSceneId);
    fetchedScene.previous_scene = previousPrimaryText;
    setScene(fetchedScene);
  } catch (error) {
    setError("Failed to fetch previous scene.");
  } finally {
    setLoading(false);
  }
};

const useGameLogic = (gameId: string | undefined) => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef<boolean>(false);
  const totalStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!initializedRef.current && gameId) {
      initializedRef.current = true;
      totalStartRef.current = performance.now();
      handleSceneGeneration(
        gameId,
        setScene,
        setLoading,
        setError,
        totalStartRef.current
      );
    }
  }, [gameId]);

  return {
    scene,
    loading,
    error,
    setScene,
    fetchNewScene: (previousSceneId: string, storyId: string, previousPrimaryText: string, playerChoice: string) =>
      fetchNewScene(
        gameId,
        previousSceneId,
        storyId,
        previousPrimaryText,
        playerChoice,
        setScene,
        setLoading,
        setError
      ),
    fetchPreviousScene: (previousSceneId: string, storyId: string, previousPrimaryText: string) =>
      fetchPreviousScene(
        previousSceneId,
        storyId,
        previousPrimaryText,
        setScene,
        setLoading,
        setError
      ),
  };
};

const Game = () => {
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const gameId = pathname.split("/").pop();
  const { scene, loading, error, setScene, fetchNewScene, fetchPreviousScene } =
    useGameLogic(gameId);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <GameScreen
      signOut={signOut}
      user={user}
      gameId={gameId}
      scene={scene}
      fetchNewScene={fetchNewScene}
      fetchPreviousScene={fetchPreviousScene}
    />
  );
};

export default Game;
