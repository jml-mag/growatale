import Image from "next/image";
import { Action, Scene } from "@/app/play/types";
import { useState, useEffect } from "react";
import { downloadData } from "@aws-amplify/storage";
import AudioPlayer from "./AudioPlayer";
import { josefin_slab } from "@/app/fonts";
import { motion } from "framer-motion";

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
  const [renderedScene, setRenderedScene] = useState<Scene | null>(null);
  const [isTextTransitioning, setIsTextTransitioning] = useState<boolean>(false);
  const [isImageTransitioning, setIsImageTransitioning] = useState<boolean>(false);
  const [isAudioTransitioning, setIsAudioTransitioning] = useState<boolean>(false);

  useEffect(() => {
    if (scene) {
      initiateSceneTransition();
      preloadSceneAssets(scene);
    }
  }, [scene]);

  const initiateSceneTransition = () => {
    setIsTextTransitioning(true);
    setIsImageTransitioning(true);
    setIsAudioTransitioning(true);
  };

  const preloadSceneAssets = (scene: Scene) => {
    if (scene.image) {
      fetchImage(scene.image);
    }
    if (scene.audio) {
      fetchAudio(scene.audio);
    }
  };

  const fetchImage = async (imagePath: string) => {
    try {
      const result = await downloadData({ path: imagePath });
      const blob = await (await result.result).body.blob();
      const url = URL.createObjectURL(blob);
      setImageURL(url);
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
    initiateSceneTransition();
  };

  const handleTransitionEnd = () => {
    if (!isTextTransitioning && !isImageTransitioning && !isAudioTransitioning) {
      setRenderedScene(scene);
    }
  };

  useEffect(() => {
    handleTransitionEnd();
  }, [isTextTransitioning, isImageTransitioning, isAudioTransitioning]);

  return (
    <div className="text-white w-full">
      <div className="fixed top-0 left-0 w-full h-full -z-50">
        {imageURL && (
          <motion.div
            className="object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: isImageTransitioning ? 0 : 1 }}
            transition={{ duration: 8.0 }}
            onAnimationComplete={() => setIsImageTransitioning(false)}
          >
            <Image
              src={imageURL}
              alt="Scene Image"
              fill
            />
          </motion.div>
        )}
      </div>
      <div className="hidden bg-blue-950 bg-opacity-70 p-4 rounded-2xl">
        <button onClick={signOut}>Sign Out</button>
      </div>
      <div>
        <motion.div
          className={`${josefin_slab.className} text-lg gamescreen-component fixed left-2 top-2 max-h-72 overflow-y-auto`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isTextTransitioning ? 0 : 1 }}
          transition={{ duration: 2.5 }}
          onAnimationComplete={() => setIsTextTransitioning(false)}
        >
          {renderedScene?.primary_text || "Loading text..."}
        </motion.div>
        <div className="fixed bottom-0 w-full text-center content-center sm:flex sm:justify-center sm:items-center sm:space-x-4">
          <div className="w-full sm:w-1/2 sm:order-last mb-4 sm:mb-0">
            <div className="w-full flex justify-center">
              <div className="flex w-full max-w-sm justify-around">
                {renderedScene?.actions_available.map((action) => (
                  <motion.button
                    onClick={() => playerChoice(action)}
                    className="gamescreen-button m-2"
                    key={action.direction}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isTextTransitioning ? 0 : 1 }}
                    transition={{ duration: 3.5 }}
                  >
                    {action.command_text}
                  </motion.button>
                )) || <div>Loading actions...</div>}
              </div>
              <div className="gamescreen-component">{transitionText}</div>
            </div>
          </div>
          <div className="w-full sm:w-1/2 sm:order-first">
            <div className="w-full flex justify-center">
              {audioFile && (
                <motion.div
                  className="audio-player-wrapper"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isAudioTransitioning ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
                  onAnimationComplete={() => setIsAudioTransitioning(false)}
                >
                  <AudioPlayer audioFile={audioFile} />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
