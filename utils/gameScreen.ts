// @/utils/gameScreen

import { downloadData } from "@aws-amplify/storage";
import { Scene } from "@/app/play/types";

export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.3 * i,
    },
  }),
};

export const fetchImage = async (imagePath: string) => {
  try {
    const result = await downloadData({ path: imagePath });
    const blob = await (await result.result).body.blob();
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

export const fetchAudio = async (audioPath: string) => {
  try {
    const result = await downloadData({ path: audioPath });
    const blob = await (await result.result).body.blob();
    const file = new File([blob], "audio-file.mp3", { type: "audio/mpeg" });
    return file;
  } catch (error) {
    console.error("Error fetching audio:", error);
    return null;
  }
};

export const initiateSceneTransition = (setters: {
  setIsTextTransitioning: (value: boolean) => void;
  setIsImageTransitioning: (value: boolean) => void;
  setIsAudioTransitioning: (value: boolean) => void;
  setIsAudioLoaded: (value: boolean) => void;
}) => {
  const { setIsTextTransitioning, setIsImageTransitioning, setIsAudioTransitioning, setIsAudioLoaded } = setters;
  setIsTextTransitioning(true);
  setIsImageTransitioning(true);
  setIsAudioTransitioning(true);
  setIsAudioLoaded(false);
};

export const preloadSceneAssets = async (
  scene: Scene,
  fetchImage: (imagePath: string) => Promise<string | null>,
  fetchAudio: (audioPath: string) => Promise<File | null>,
  setImageURL: (url: string | null) => void,
  setAudioFile: (file: File | null) => void
) => {
  if (scene.image) {
    const url = await fetchImage(scene.image);
    setImageURL(url);
  }
  if (scene.audio) {
    const file = await fetchAudio(scene.audio);
    setAudioFile(file);
  }
};
