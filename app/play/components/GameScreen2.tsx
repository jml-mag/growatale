// @/app/play/components/GameScreen.tsx

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import AudioPlayer from "@/app/play/components/AudioPlayer";
import { Scene, Action } from "@/app/play/types";
import { josefin_slab } from "@/app/fonts";
import { motion, AnimatePresence } from "framer-motion";

interface GameScreenProps {
  signOut: () => void;
  user: any;
  scene: Scene | null;
  handlePlayerAction: (action: Action) => void;
  showActions: boolean;
  audioFile: File | null;
  imageFile: File | null;
}

const GameScreen: React.FC<GameScreenProps> = ({ scene, handlePlayerAction, showActions, audioFile, imageFile }) => {
  const [displayState, setDisplayState] = useState<Partial<Scene>>({});
  const [transitionText, setTransitionText] = useState<string>("");
  const [showPrimary, setShowPrimary] = useState<boolean>(false);
  const [showTransition, setShowTransition] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [actionsVisible, setActionsVisible] = useState<boolean>(false);
  const [audioReady, setAudioReady] = useState<boolean>(false);
  const [readyForNewScene, setReadyForNewScene] = useState<boolean>(true);
  const [newAudioReady, setNewAudioReady] = useState<boolean>(false);
  const [newImageReady, setNewImageReady] = useState<boolean>(false);
  const currentSceneRef = useRef<string | null>(null);

  useEffect(() => {
    if (scene && scene.id !== currentSceneRef.current) {
      if (readyForNewScene) {
        currentSceneRef.current = scene.id ?? null;
        resetState();
        setDisplayState(scene);

        console.log("Primary text is available");
        setShowPrimary(true);  // Show the new primary text immediately

        console.log("Audio is available");
        setAudioReady(true);   // Allow audio to render immediately

        console.log("Image is available");
        setImageLoaded(true);  // Image renders independently when ready
      }
    }
  }, [scene, readyForNewScene]);

  useEffect(() => {
    if (audioFile) {
      console.log("New audio file is ready");
      setNewAudioReady(true);
    }
  }, [audioFile]);

  useEffect(() => {
    if (imageFile) {
      console.log("New image file is ready");
      setNewImageReady(true);
    }
  }, [imageFile]);

  useEffect(() => {
    if (audioReady && newAudioReady) {
      console.log("Actions are available");
      setActionsVisible(true);  // Only show actions after audio is ready
    }
  }, [audioReady, newAudioReady]);

  const resetState = () => {
    setShowPrimary(false);
    setShowTransition(false);
    setImageLoaded(false);
    setActionsVisible(false);
    setAudioReady(false);
    setNewAudioReady(false);
    setNewImageReady(false);
  };

  const handleAction = (action: Action) => {
    setTransitionText(action.transition_text);
    setShowPrimary(false);
    setActionsVisible(false);

    setTimeout(() => {
      console.log("Audio is hidden");
      setAudioReady(false); // Hide audio after buttons are gone
    }, 500);

    setTimeout(() => {
      console.log("Image is hidden");
      setImageLoaded(false); // Hide image after audio is gone
    }, 1000);

    setTimeout(() => {
      console.log("Transition text is available");
      setShowTransition(true); // Display the transition text
    }, 1500);

    setTimeout(() => {
      console.log("Transition text is hidden");
      setShowTransition(false); // Fade out the transition text after 3 seconds
      setTransitionText("");
      setReadyForNewScene(true); // Indicate that it’s safe to render new content
      handlePlayerAction(action);
    }, 4500);
  };

  return (
    <div className="text-white w-full h-screen overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full -z-50">
        <AnimatePresence>
          {imageFile && imageLoaded && newImageReady && (
            <motion.div
              className="fixed w-full h-screen object-fill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 2 } }}
              onAnimationComplete={() => console.log('Image animation complete')}
            >
              <Image
                src={URL.createObjectURL(imageFile)}
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
              className={`${josefin_slab.className} text-lg gamescreen-component overflow-y-auto w-10/12 m-auto sm:w-2/3 sm:left-1/2 sm:top-1/2 cursor-grab active:cursor-grabbing`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 2.5 } }}
              drag
              dragConstraints={{
                top: -0.9 * window.innerHeight,
                bottom: 0.9 * window.innerHeight,
                left: -0.9 * window.innerWidth,
                right: 0.9 * window.innerWidth,
              }}
              dragElastic={0.2}
              dragMomentum={false}
              onAnimationComplete={() => console.log('Primary text rendered')}
            >
              {displayState.primary_text || "Loading text."}
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
              exit={{ opacity: 0, transition: { duration: 5 } }}
              onAnimationComplete={() => console.log('Transition text rendered')}
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
                {actionsVisible && displayState.actions_available?.map((action) => (
                  <motion.button
                    key={action.direction}
                    onClick={() => handleAction(action)}
                    className="gamescreen-button m-2 first-letter:uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    onAnimationComplete={() => console.log(`Action "${action.command_text}" rendered`)}
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
              {audioFile && audioReady && newAudioReady && (
                <motion.div
                  className="audio-player-wrapper"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100, transition: { duration: 0.5 } }}
                  onAnimationComplete={() => console.log('Audio player rendered')}
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
