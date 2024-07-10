// app/play2/components/GameScreen.tsx

import React, { useEffect, useState } from "react";
import { Scene, Action } from "@/app/play2/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { downloadData } from "aws-amplify/storage";

interface GameScreenProps {
  signOut: () => void;
  user: any; // Replace with your user type if available
  scene: Scene | null;
  onAction: (action: Action) => void; // New prop for handling actions
}

const GameScreen: React.FC<GameScreenProps> = ({ signOut, user, scene, onAction }) => {
  const [displayScene, setDisplayScene] = useState<Scene | null>(scene);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (scene && scene !== displayScene) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setTransitionText("");
        setDisplayScene(scene);
        setIsTransitioning(false);
      }, 2000); // Total transition time

      return () => clearTimeout(timer);
    }
  }, [scene, displayScene]);

  useEffect(() => {
    const fetchImage = async (path: string) => {
      try {
        const downloadResult = await downloadData({
          path,
          options: {
            onProgress: (event) => {
              setProgress((event.transferredBytes / (event.totalBytes || 1)) * 100);
            },
          },
        }).result;
        const blob = await downloadResult.body.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageUrl(blobUrl);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    if (displayScene?.image) {
      fetchImage(displayScene.image);
    }
  }, [displayScene]);

  const handleAction = (action: Action) => {
    setIsTransitioning(true);
    setTransitionText(action.transition_text);

    setTimeout(() => {
      onAction(action);
    }, 1000); // Start action after 1 second
  };

  return (
    <div className="text-sm p-4">
      <div className="mb-4">
        <div className="font-bold">Scene Description</div>
        <p>{displayScene?.scene_description}</p>
        {imageUrl ? (
          <Image src={imageUrl} alt="Scene image" width={250} height={250} />
        ) : (
          <div>
            <p>Loading image...</p>
            <progress value={progress} max="100">{progress}%</progress>
          </div>
        )}
      </div>

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
              {displayScene?.primary_text}
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

      <div className="mb-4">
        <div className="font-bold">Actions</div>
        <ul>
          {displayScene?.actions_available.map((action, index) => (
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
      </div>

      <button onClick={signOut} className="p-2 bg-red-500 text-white rounded">
        Sign Out
      </button>
    </div>
  );
};

export default GameScreen;
