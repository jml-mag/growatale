// @/components/GameScreen.tsx

"use client";
import Image from "next/image";
import { Scene } from "@/app/play/types";
import { useState, useEffect } from "react";
import { downloadData } from "@aws-amplify/storage";
import AudioPlayer from "./AudioPlayer";
import { josefin_slab } from "@/app/fonts";
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
  const [audioFile, setAudioFile] = useState<File | null>(null);

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
      setAudioFile(new File([blob], "audio-file.mp3", { type: "audio/mpeg" }));
      console.log("Fetched audio blob URL");
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  if (!scene) {
    return <div>No scene data available.</div>;
  }

  return (
    <div className="text-white w-full">
      <div className="fixed top-0 left-0 w-full h-full -z-50">
        {imageURL && (
          <Image
            className="object-cover"
            src={imageURL}
            alt="Scene Image"
            fill
          />
        )}
      </div>
      <div className="hidden bg-blue-950 bg-opacity-70 p-4 rounded-2xl">
        <button onClick={signOut}>Sign Out</button>
      </div>
      <div>
        <div
          className={`${josefin_slab.className} text-lg gamescreen-component fixed left-2 top-16 w-1/2 max-h-96 overflow-y-auto`}
        >
          {scene.primary_text}
        </div>
        <div className="">
          <div className="fixed bottom-0 w-full">
            <div className="">
              {audioFile && <AudioPlayer audioFile={audioFile} />}
            </div>
          </div>
        </div>
        <div className="w-full fixed bottom-24 sm:bottom-0 right-0">
          <div className="w-full flex justify-around">
            {scene.actions_available.map((action) => (
              <button className="gamescreen-button" key={action.direction}>
                {action.command_text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
