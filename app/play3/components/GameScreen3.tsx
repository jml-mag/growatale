// @/app/play3/components/GameScreen3.tsx

import React, { useEffect, useState, useRef } from "react";
import { Scene, Action } from "@/app/play3/types";
import Image from "next/image";
import { downloadData } from "aws-amplify/storage";
import AudioPlayer from "@/app/play3/components/AudioPlayer";
import { josefin_slab } from "@/app/fonts";
import { motion, AnimatePresence } from "framer-motion";
import useGameEngine from "@/app/play3/hooks/useGameEngine3";

interface GameScreenProps {
  signOut: () => void;
  user: any; // Replace with your user type if available
  scene: Scene|null; // Add this line
  onAction: (action: Action) => void; // Add this line
}

const GameScreen: React.FC<GameScreenProps> = ({ signOut, user }) => {
  const { scene, loading, error, audioLoaded, showActions, handlePlayerAction } = useGameEngine();
  const [displayState, setDisplayState] = useState<Partial<Scene>>({});
  const [transitionText, setTransitionText] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [showPrimary, setShowPrimary] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const constraintsRef = useRef(null);

  useEffect(() => {
    if (scene) {
      setShowPrimary(!!scene.primary_text);
      setShowAudio(!!scene.audio);
      setShowImage(!!scene.image);
      setShowTransition(false); // Reset showTransition to false

      const timer = setTimeout(() => {
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
    setTransitionText(action.transition_text);
    setShowPrimary(false);
    setShowTransition(true);
    setShowAudio(false);
    setShowImage(false);

    setTimeout(() => {
      handlePlayerAction(action);
    }, 1); // Start action after 1 ms
  };

  return (
    <div className="text-white w-full h-screen overflow-hidden" ref={constraintsRef}>
      <div className="fixed top-0 left-0 w-full h-full -z-50">
        <AnimatePresence>
          {showImage && imageUrl && (
            <motion.div
              className="fixed w-full h-screen object-fill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
            >
              <Image
                src={imageUrl}
                alt="Scene Image"
                fill
                style={{ objectFit: "cover" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute w-full h-full">
        <AnimatePresence>
          {showPrimary && (
            <motion.div
              className={`${josefin_slab.className} text-lg gamescreen-component fixed left-2 top-2 max-h-72 overflow-y-auto sm:w-2/3 sm:left-1/2 sm:top-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5 }}
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.2} // Optional: adjust drag elasticity
              dragMomentum={false} // Optional: disable momentum for more precise positioning
            >
              {displayState.primary_text || "Loading text..."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="fixed bottom-0 w-full text-center">
        <AnimatePresence>
          {showTransition && (
            <motion.div
              className={`${josefin_slab.className} text-lg gamescreen-component fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5 }}
              onAnimationComplete={() => {
                setTransitionText("");
                setShowTransition(false);
              }}
            >
              {transitionText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="fixed bottom-0 w-full text-center content-center sm:flex sm:justify-center sm:items-center sm:space-x-4">
        <div className="w-full sm:w-1/2 sm:order-last mb-4 sm:mb-0">
          <div className="w-full flex justify-center">
            <div className="flex w-full max-w-sm justify-around">
              <AnimatePresence>
                {showActions && displayState.actions_available?.map((action, index) => (
                  <motion.button
                    key={action.direction}
                    onClick={() => handleAction(action)}
                    className="gamescreen-button m-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {action.command_text}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-1/2 sm:order-first">
          <div className="w-full flex justify-center">
            <AnimatePresence>
              {showAudio && audioFile && (
                <motion.div
                  className="audio-player-wrapper"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ duration: 0.5 }}
                >
                  <AudioPlayer audioFile={audioFile} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
