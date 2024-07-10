// app/play2/components/GameScreen.tsx

import React, { useEffect, useState } from "react";
import { Scene, Action } from "@/app/play2/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { downloadData } from "aws-amplify/storage";
import AudioPlayer from "@/app/play2/components/AudioPlayer";

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
    <div className="text-sm p-4">
      <AnimatePresence>
        {displayState && (
          <motion.div
            key="scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {displayState.scene_description && (
              <div className="mb-4">
                <div className="font-bold">Scene Description</div>
                <p>{displayState.scene_description}</p>
              </div>
            )}

            {displayState.primary_text && (
              <div className="mb-4">
                <div className="font-bold">Primary Text</div>
                <AnimatePresence>
                  {!isTransitioning && (
                    <motion.p
                      key="primary_text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                    >
                      {displayState.primary_text}
                    </motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {transitionText && (
                    <motion.p
                      key="transition_text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    >
                      {transitionText}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            {imageUrl && (
              <motion.div
                key="image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="mb-4"
              >
                <Image src={imageUrl} alt="Scene image" width={250} height={250} />
              </motion.div>
            )}

            {audioFile && (
              <motion.div
                key="audio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="mb-4"
              >
                <AudioPlayer audioFile={audioFile} />
              </motion.div>
            )}

            {!isTransitioning && displayState.actions_available && displayState.actions_available.length > 0 && (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <div className="font-bold">Actions</div>
                <ul>
                  {displayState.actions_available.map((action, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <strong>Direction:</strong> {action.direction}
                      <br />
                      <strong>Command:</strong> {action.command_text}
                      <br />
                      <strong>Transition:</strong> {action.transition_text}
                      <button
                        onClick={() => handleAction(action)}
                        className="mt-2 p-1 bg-blue-500 text-white rounded"
                      >
                        Choose
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={signOut} className="p-2 bg-red-500 text-white rounded">
        Sign Out
      </button>
    </div>
  );
};

export default GameScreen;
