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
  const currentSceneRef = useRef<string | null>(null);

  useEffect(() => {
    if (scene && scene.id !== currentSceneRef.current) {
      console.log('New scene detected', { current: currentSceneRef.current, incoming: scene });

      if (readyForNewScene) {
        currentSceneRef.current = scene.id ?? null;
        resetState();
        setDisplayState(scene);

        // Delay the rendering of the new primary text until the transition text is fully gone
        setTimeout(() => {
          setShowPrimary(true); // Show the new text
        }, 4500); // Ensures the primary text only renders after transition text fades out

        // Delay to ensure text is rendered first
        setTimeout(() => {
          setAudioReady(true); // Render audio first
          console.log('Audio displayed');
        }, 5000);

        setTimeout(() => {
          setActionsVisible(true);
          console.log('Buttons displayed');
        }, 5500);

        setTimeout(() => {
          setImageLoaded(true);
          console.log('Image displayed');
        }, 6000);
      }
    }
  }, [scene, readyForNewScene]);

  const resetState = () => {
    // Reset visibility states
    setShowPrimary(false);
    setShowTransition(false);
    setImageLoaded(false);
    setActionsVisible(false);
    setAudioReady(false);
    console.log('State reset');
  };

  const handleAction = (action: Action) => {
    // Handle graceful exit of the scene components
    setTransitionText(action.transition_text);
    setShowPrimary(false); // Start fading out the primary text when transition begins
    setActionsVisible(false); // Start hiding buttons
    console.log('Buttons hidden for transition');

    setTimeout(() => {
      setAudioReady(false); // Hide audio after buttons are gone
      console.log('Audio hidden for transition');
    }, 500); // Delay between buttons and audio hiding

    setTimeout(() => {
      setImageLoaded(false); // Hide image after audio is gone
      console.log('Image hidden for transition');
    }, 1000);

    setTimeout(() => {
      // Display the transition text
      setShowTransition(true);
      console.log('Transition text displayed');
    }, 1500);

    setTimeout(() => {
      // Keep the transition text visible for 3 seconds before fading it out
      setTimeout(() => {
        setShowTransition(false); // Fade out the transition text
        setTransitionText("");
        setReadyForNewScene(true); // Indicate that it’s safe to render new content
        console.log('Transition text hidden after delay, action processed:', action);
      }, 3000); // 3-second delay

      handlePlayerAction(action); // Process the action
      setReadyForNewScene(false); // Prevent new content from rendering during the transition
    }, 4500); // Total delay to ensure everything fades out smoothly
  };

  return (
    <div className="text-white w-full h-screen overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full -z-50">
        <AnimatePresence>
          {imageFile && imageLoaded && (
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
              onAnimationComplete={() => console.log('Text animation complete')}
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
              exit={{ opacity: 0, transition: { duration: 5 } }}
              onAnimationComplete={() => {
                console.log('Transition text faded out');
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
                {actionsVisible && displayState.actions_available?.map((action) => (
                    <motion.button
                      key={action.direction}
                      onClick={() => handleAction(action)}
                      className="gamescreen-button m-2 first-letter:uppercase"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.3 } }}
                      onAnimationComplete={() => console.log('Button animation complete', action)}
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
              {audioFile && audioReady && (
                <motion.div
                  className="audio-player-wrapper"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100, transition: { duration: 0.5 } }}
                  onAnimationComplete={() => console.log('Audio animation complete')}
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
