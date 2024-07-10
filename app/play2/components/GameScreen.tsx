// @/app/play2/components/GameScreen

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

const GameScreen: React.FC<GameScreenProps> = ({ signOut, user, scene, onAction }) => {
  const [displayState, setDisplayState] = useState<Partial<Scene>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    if (scene) {
      setIsTransitioning(true);
      setTransitionText(scene.primary_text);

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

  useEffect(() => {
    console.log('displayState changed:', displayState);
  }, [displayState]);

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
      <div className="fixed top-0 left-0 w-full h-full -z-50">
        {imageUrl && (
          <motion.div
            className="fixed w-full h-screen object-fill"
            initial={{ opacity: 0 }}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            transition={{ duration: 8.0 }}
            onAnimationComplete={() => setIsTransitioning(false)}
          >
            <Image src={imageUrl} alt="Scene Image" fill style={{"objectFit": "cover"}} />
          </motion.div>
        )}
      </div>
      <div className="hidden bg-blue-950 bg-opacity-70 p-4 rounded-2xl">
        <button onClick={signOut}>Sign Out</button>
      </div>
      <motion.div
        className="absolute w-full h-full"
      >
        <motion.div
          className={`${josefin_slab.className} text-lg gamescreen-component fixed left-2 top-2 max-h-72 overflow-y-auto`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          transition={{ duration: 2.5 }}
          onAnimationComplete={() => setIsTransitioning(false)}
        >
          {displayState.primary_text || "Loading text..."}
        </motion.div>
      </motion.div>
      <div className="fixed bottom-0 w-full text-center content-center sm:flex sm:justify-center sm:items-center sm:space-x-4">
        <motion.div
          className="w-full sm:w-1/2 sm:order-last mb-4 sm:mb-0"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            exit: { opacity: 0, transition: { duration: 0.3 } },
          }}
          initial="hidden"
          animate={audioFile ? (isTransitioning ? "hidden" : "visible") : "hidden"}
          exit="hidden"
          transition={{ duration: 0.3 }}
        >
          <div className="w-full flex justify-center">
            <div className="flex w-full max-w-sm justify-around">
              <AnimatePresence>
                {displayState.actions_available?.map((action, index) => (
                  <motion.button
                    key={action.direction}
                    onClick={() => handleAction(action)}
                    className="gamescreen-button m-2"
                    custom={index}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 },
                      exit: { opacity: 0, transition: { duration: 0.3 } },
                    }}
                  >
                    {action.command_text}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
            <div className="gamescreen-component">{transitionText}</div>
          </div>
        </motion.div>
        <div className="w-full sm:w-1/2 sm:order-first">
          <div className="w-full flex justify-center">
            <AnimatePresence>
              {audioFile && (
                <motion.div
                  className="audio-player-wrapper"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 100 : 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ duration: 0.5 }}
                  onAnimationComplete={() => {
                    setIsTransitioning(false);
                  }}
                >
                  <AudioPlayer audioFile={audioFile} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 w-full text-center">
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              className={`${josefin_slab.className} text-lg gamescreen-component fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5 }}
              onAnimationComplete={() => {
                setTransitionText('');
                setIsTransitioning(false);
              }}
            >
              {transitionText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GameScreen;
