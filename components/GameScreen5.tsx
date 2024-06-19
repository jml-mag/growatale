// @/components/GameScreen5.tsx

"use client";
import Image from "next/image";
import { Scene } from "@/app/play-5/types";
import { useState, useEffect } from "react";
import { getUrl, downloadData } from "@aws-amplify/storage";

interface GameScreenProps {
  signOut: () => void;
  user: any; // Replace `any` with the actual type if you have it
  gameId: string | string[] | undefined;
  scene: Scene | null; // Accept scene data as a prop
}

const GameScreen: React.FC<GameScreenProps> = ({
  signOut,
  user,
  gameId,
  scene,
}) => {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  console.log("GameScreen Props(Scene):", scene);

  useEffect(() => {
    if (scene?.image) {
      fetchImage(scene.image);
    }
    if (scene?.audio) {
      fetchAudio(scene.audio);
    }
  }, [scene]);

  const fetchImage = async (imagePath: string) => {
    try {
      const result = await downloadData({ path: imagePath });
      const blob = await (await result.result).body.blob();
      const url = URL.createObjectURL(blob);
      setImageURL(url);
      console.log("Fetched image blob URL:", url);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const fetchAudio = async (audioPath: string) => {
    try {
      const result = await downloadData({ path: audioPath });
      const blob = await (await result.result).body.blob();
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      console.log("Fetched audio blob URL:", url);
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  if (!scene) {
    return <div>No scene data available.</div>;
  }

  return (
    <div className="text-white">
      <div>
        <button onClick={signOut}>Sign Out</button>
        <p>Welcome, {user.username}</p>
      </div>
      <div>
        <h1 className="text-3xl font-bold">Scene</h1>
        <p>{scene.primary_text}</p>
        {imageURL && (
          <Image src={imageURL} alt="Scene Image" width={400} height={400} />
        )}
        {audioURL && (
          <audio controls>
            <source src={audioURL} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
        <ul>
          {scene.actions_available.map((action) => (
            <li key={action.direction}>{action.command_text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GameScreen;

