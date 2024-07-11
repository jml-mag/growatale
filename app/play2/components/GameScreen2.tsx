// @/app/play2/components/GameScreen.tsx

import React, { useEffect, useState } from "react";
import { Scene, Action } from "@/app/play2/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { downloadData } from "aws-amplify/storage";
import AudioPlayer from "@/app/play2/components/AudioPlayer";
import { josefin_slab } from "@/app/fonts";

interface GameScreenProps {
  signOut: () => void;
  user: any; // Replace with your user type if available
  scene: Scene | null;
  onAction: (action: Action) => void; // New prop for handling actions
}

const GameScreen: React.FC<GameScreenProps> = ({
  signOut,
  user,
  scene,
  onAction,
}) => {
  const [displayState, setDisplayState] = useState<Partial<Scene>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    if (scene) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionText("");
        setDisplayState((prev) => ({
          ...prev,
          ...scene,
        }));
        if (scene.image) {
          fetchImage(scene.image);
        }
        if (scene.audio) {
          fetchAudio(scene.audio);
        }
      }, 1000); // Transition time

      return () => clearTimeout(timer);
    }
  }, [scene]);

  const fetchImage = async (path: string) => {
    try {
      const downloadResult = await downloadData({
        path,
        options: {
          onProgress: (event) => {
            // Update progress silently
          },
        },
      }).result;
      const blob = await downloadResult.body.blob();
      const blobUrl = URL.createObjectURL(blob);
      setImageUrl(blobUrl);
      setDisplayState((prev) => ({
        ...prev,
        image: blobUrl,
      }));
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const fetchAudio = async (path: string) => {
    try {
      const downloadResult = await downloadData({
        path,
        options: {
          onProgress: (event) => {
            // Update progress silently
          },
        },
      }).result;
      const blob = await downloadResult.body.blob();
      const file = new File([blob], "audio-file.mp3", { type: "audio/mpeg" });
      setAudioFile(file);
      setDisplayState((prev) => ({
        ...prev,
        audio: path,
      }));
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  const handleAction = (action: Action) => {
    setIsTransitioning(true);
    setTransitionText(action.transition_text);
    setAudioFile(null); // Stop the audio

    setTimeout(() => {
      onAction(action);
    }, 1000); // Start action after 1 second
  };

  return (
    <div className="text-white w-full h-screen overflow-hidden">
      {/*<div className="overflow-y-auto z-50 border border-white rounded-lg fixed right-6 top-10 max-w-md bg-gray-800 text-white p-2 text-xs">
        <div>
          <div className="text-base font-bold">Scene State</div>
          <div>id: {scene?.id}</div>
          <div>image: {scene?.image}</div>
          <div>audio: {scene?.audio}</div>
          <div>actions_available: {scene?.actions_available.length}</div>
          <div>primary_text: {scene?.primary_text}</div>
          <div>time: {scene?.time}</div>
        </div>
        <div>
          <div className="text-base font-bold">Display State</div>
          <div>id: {displayState?.id}</div>
          <div>image: {displayState?.image}</div>
          <div>audio: {displayState?.audio}</div>
          <div>actions_available: {displayState?.actions_available?.length}</div>
          <div>primary_text: {displayState?.primary_text}</div>
          <div>time: {displayState?.time}</div>
        </div>
      </div>*/}
      <div className="fixed top-0 left-0 w-full h-full -z-50">
        {imageUrl && (
          <div className="fixed w-full h-screen object-fill">
            <Image
              src={imageUrl}
              alt="Scene Image"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
      </div>
      <div className="hidden bg-blue-950 bg-opacity-70 p-4 rounded-2xl">
        <button onClick={signOut}>Sign Out</button>
      </div>
      <div className="absolute w-full h-full">
        <div
          className={`${josefin_slab.className} text-lg sm:font-bold gamescreen-component m-auto sm:w-3/5 overflow-y-auto`}
        >
          {displayState.primary_text}
        </div>
      </div>
      <div className="fixed bottom-0 w-full text-center content-center sm:flex sm:justify-center sm:items-center sm:space-x-4">
        <div className="w-full sm:w-1/2 sm:order-last mb-4 sm:mb-0">
          <div className="w-full flex justify-center">
            <div className="flex w-full max-w-sm justify-around">
              {displayState.actions_available?.map((action, index) => (
                <button
                  key={action.direction}
                  onClick={() => handleAction(action)}
                  className="gamescreen-button m-2"
                >
                  {action.command_text}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full sm:w-1/2 sm:order-first">
          <div className="w-full flex justify-center">
            {audioFile && (
              <div className="audio-player-wrapper">
                <AudioPlayer audioFile={audioFile} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 w-full text-center">
        {isTransitioning && (
          <div
            className={`${josefin_slab.className} text-lg gamescreen-component fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2`}
          >
            {transitionText}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;
