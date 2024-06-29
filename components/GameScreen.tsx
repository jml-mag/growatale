import Image from "next/image";
import { Action, Scene } from "@/app/play/types";
import { useState, useEffect, useRef } from "react";
import AudioPlayer from "./AudioPlayer";
import { josefin_slab } from "@/app/fonts";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  fetchImage,
  fetchAudio,
  staggerChildren,
  initiateSceneTransition,
  preloadSceneAssets,
} from "@/utils/gameScreen";

interface GameScreenProps {
  signOut: () => void;
  user: any;
  gameId: string | string[] | undefined;
  scene: Scene | null;
  fetchNewScene: (previousSceneId: string, storyId: string, previousPrimaryText: string, playerChoice: string) => Promise<void>;
  fetchPreviousScene: (previousSceneId: string, storyId: string, previousPrimaryText: string) => Promise<void>;
}

const GameScreen: React.FC<GameScreenProps> = ({
  signOut,
  user,
  gameId,
  scene,
  fetchNewScene,
  fetchPreviousScene,
}) => {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transitionText, setTransitionText] = useState<string | null>(null);
  const [renderedScene, setRenderedScene] = useState<Scene | null>(null);
  const [isTextTransitioning, setIsTextTransitioning] = useState<boolean>(false);
  const [isImageTransitioning, setIsImageTransitioning] = useState<boolean>(false);
  const [isAudioTransitioning, setIsAudioTransitioning] = useState<boolean>(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);

  const textContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const scrollY = useMotionValue(0);
  const containerTransform = useTransform(scrollY, value => `translateY(${value}px)`);

  useEffect(() => {
    if (scene) {
      initiateSceneTransition({
        setIsTextTransitioning,
        setIsImageTransitioning,
        setIsAudioTransitioning,
        setIsAudioLoaded,
      });
      preloadSceneAssets(
        scene,
        fetchImage,
        fetchAudio,
        setImageURL,
        setAudioFile
      );
    }
  }, [scene]);

  useEffect(() => {
    const handleTransitionEnd = () => {
      if (!isTextTransitioning && !isImageTransitioning && !isAudioTransitioning) {
        setRenderedScene(scene);
      }
    };

    handleTransitionEnd();
  }, [isTextTransitioning, isImageTransitioning, isAudioTransitioning, scene]);

  const handleScroll = () => {
    const container = textContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const containerHeight = clientHeight * 0.7; // Move 70% of container height

      if (scrollTop + clientHeight >= scrollHeight && scrollDirection !== "up") {
        setScrollDirection("up");
        animate(scrollY, -containerHeight, { type: "tween", duration: 1.0 });
      } else if (scrollTop === 0 && scrollDirection !== "down") {
        setScrollDirection("down");
        animate(scrollY, 0, { type: "tween", duration: 0.5 });
      }
    }
  };

  const playerChoice = async (action: Action) => {
    setTransitionText(action.transition_text);
    initiateSceneTransition({
      setIsTextTransitioning,
      setIsImageTransitioning,
      setIsAudioTransitioning,
      setIsAudioLoaded,
    });

    if (scene) {
      const previousPrimaryText = scene.primary_text;
      if (action.command_text.toLowerCase() === "go back") {
        await fetchPreviousScene(scene.previous_scene || "", scene.story_id, previousPrimaryText);
      } else {
        const playerChoice = action.command_text;
        await fetchNewScene(scene.id || "", scene.story_id, previousPrimaryText, playerChoice);
      }
    }
  };

  return (
    <div className="text-white w-full h-screen overflow-hidden" ref={mainContainerRef}>
      <div className="fixed top-0 left-0 w-full h-full -z-50">
        {imageURL && (
          <motion.div
            className="fixed w-full h-screen object-fill"
            initial={{ opacity: 0 }}
            animate={{ opacity: isImageTransitioning ? 0 : 1 }}
            transition={{ duration: 8.0 }}
            onAnimationComplete={() => setIsImageTransitioning(false)}
          >
            <Image src={imageURL} alt="Scene Image" fill style={{"objectFit": "cover"}} />
          </motion.div>
        )}
      </div>
      <div className="hidden bg-blue-950 bg-opacity-70 p-4 rounded-2xl">
        <button onClick={signOut}>Sign Out</button>
      </div>
      <motion.div
        className="absolute w-full h-full"
        style={{ transform: containerTransform }}
      >
        <motion.div
          className={`${josefin_slab.className} text-lg gamescreen-component fixed left-2 top-2 max-h-72 overflow-y-auto`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isTextTransitioning ? 0 : 1 }}
          transition={{ duration: 2.5 }}
          onAnimationComplete={() => setIsTextTransitioning(false)}
          ref={textContainerRef}
          onScroll={handleScroll}
        >
          {renderedScene?.primary_text || "Loading text..."}
        </motion.div>
      </motion.div>
      <div className="fixed bottom-0 w-full text-center content-center sm:flex sm:justify-center sm:items-center sm:space-x-4">
        <motion.div
          className="w-full sm:w-1/2 sm:order-last mb-4 sm:mb-0"
          variants={staggerChildren}
          initial="hidden"
          animate={isAudioLoaded ? (isTextTransitioning ? "hidden" : "visible") : "hidden"}
          exit="hidden"
          transition={{ duration: 0.3 }}
        >
          <div className="w-full flex justify-center">
            <div className="flex w-full max-w-sm justify-around">
              <AnimatePresence>
                {renderedScene?.actions_available.map((action, index) => (
                  <motion.button
                    key={action.direction}
                    onClick={() => playerChoice(action)}
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
                  animate={{ opacity: isAudioTransitioning ? 0 : 1, y: isAudioTransitioning ? 100 : 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ duration: 0.5 }}
                  onAnimationComplete={() => {
                    setIsAudioTransitioning(false);
                    setIsAudioLoaded(true);
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
          {isTextTransitioning && (
            <motion.div
              className={`${josefin_slab.className} text-lg gamescreen-component fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5 }}
              onAnimationComplete={() => {
                setTransitionText(null);
                setIsTextTransitioning(false);
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
