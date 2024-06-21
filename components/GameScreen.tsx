// @/components/GameScreen

import Image from "next/image";
import { Action, Scene } from "@/app/play/types";
import { useState, useEffect, use } from "react";
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
  const [transitionText, setTransitionText] = useState<string | null>(null);

  useEffect(() => {
    if (scene?.image) {
      fetchImage(scene.image);
    }
  }, [scene?.image]);

  useEffect(() => {
    if (scene?.audio) {
      fetchAudio(scene.audio);
    }
  }, [scene?.audio]);

  const fetchImage = async (imagePath: string) => {
    try {
      const result = downloadData({ path: imagePath });
      const blob = await (await result.result).body.blob();
      const url = URL.createObjectURL(blob);
      setImageURL(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const fetchAudio = async (audioPath: string) => {
    try {
      const result = await downloadData({ path: audioPath });
      const blob = await (await result.result).body.blob();
      setAudioFile(new File([blob], "audio-file.mp3", { type: "audio/mpeg" }));
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  const playerChoice = (action: Action) => {
    setTransitionText(action.transition_text);
  };

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
          className={`${josefin_slab.className} text-lg gamescreen-component fixed left-2 top-2 max-h-72 overflow-y-auto`}
        >
          {scene?.primary_text || "Loading text..."}
        </div>
        <div className="fixed bottom-0 w-full text-center content-center sm:flex sm:justify-center sm:items-center sm:space-x-4">
          <div className="w-full sm:w-1/2 sm:order-last mb-4 sm:mb-0">
            <div className="w-full flex justify-center">
              <div className="flex w-full max-w-sm justify-around">
                {scene?.actions_available.map((action) => (
                  <button
                    onClick={() => playerChoice(action)}
                    className="gamescreen-button m-2"
                    key={action.direction}
                  >
                    {action.command_text}
                  </button>
                )) || <div>Loading actions...</div>}
              </div>
              <div className="gamescreen-component">{transitionText}</div>
            </div>
          </div>
          <div className="w-full sm:w-1/2 sm:order-first">
            <div className="w-full flex justify-center">
              {audioFile && <AudioPlayer audioFile={audioFile} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
