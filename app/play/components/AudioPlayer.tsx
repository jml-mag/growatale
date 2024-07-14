import { useEffect, useRef, useState } from "react";

/**
 * Props for the AudioPlayer component.
 */
interface AudioPlayerProps {
  audioFile: File;
}

/**
 * AudioPlayer component for playing audio files with controls for play/pause, mute/unmute, and volume adjustment.
 * 
 * @param audioFile - The audio file to be played.
 * @returns A React component for the audio player.
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioFile }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("0:00");
  const [duration, setDuration] = useState<string>("0:00");
  const [volume, setVolume] = useState<number>(100);
  const [progress, setProgress] = useState<number>(0);
  const [audioSrc, setAudioSrc] = useState<string>("");
  const [previousVolume, setPreviousVolume] = useState<number>(100);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(audioFile);
    setAudioSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [audioFile]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(formatTime(audio.currentTime));
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleMetadata = () => {
      if (audio) {
        setDuration(formatTime(audio.duration));
      }
    };

    if (audio) {
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleMetadata);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleMetadata);
      };
    }
  }, [audioSrc]);

  /**
   * Toggles play and pause states for the audio.
   */
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.paused) {
        audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    }
  };

  /**
   * Toggles mute and unmute states for the audio.
   */
  const handleMuteUnmute = () => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.muted) {
        audio.muted = false;
        setIsMuted(false);
        setVolume(previousVolume);
        audio.volume = previousVolume / 100;
      } else {
        setPreviousVolume(volume);
        audio.muted = true;
        setIsMuted(true);
        setVolume(0);
        audio.volume = 0;
      }
    }
  };

  /**
   * Handles volume changes for the audio.
   * 
   * @param e - The event triggered by changing the volume slider.
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseInt(e.target.value);
    if (audio) {
      if (!isMuted) {
        audio.volume = newVolume / 100;
      }
      setVolume(newVolume);
      if (isMuted && newVolume > 0) {
        handleMuteUnmute();
      }
    }
  };

  /**
   * Handles seeking within the audio.
   * 
   * @param e - The event triggered by changing the progress slider.
   */
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const seekTime = (parseInt(e.target.value) / 100) * (audio?.duration || 0);
    if (audio) {
      audio.currentTime = seekTime;
    }
  };

  /**
   * Formats time from seconds to a MM:SS string.
   * 
   * @param time - The time in seconds.
   * @returns A formatted time string.
   */
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const playIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
      />
    </svg>
  );
  const pauseIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25v13.5m-7.5-13.5v13.5"
      />
    </svg>
  );
  const muteIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
      />
    </svg>
  );
  const unMuteIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
      />
    </svg>
  );

  return (
    <div className="gamescreen-component flex flex-col items-center w-80 pt-2">
      <audio ref={audioRef} src={audioSrc} />
      <div className="flex justify-between w-full text-xs">
        <span className="">{currentTime}</span>
        <input
          type="range"
          className="w-2/3"
          max="100"
          value={isNaN(progress) ? 0 : progress} // Ensure progress is not NaN
          onChange={handleSeek}
        />
        <span className="">{duration}</span>
      </div>
      <div className="flex text-center items-center justify-center w-full mt-2">
        <button
          onClick={handlePlayPause}
          className="p-4 bg-black bg-opacity-10 hover:bg-opacity-50 flex items-center justify-center"
        >
          {isPlaying ? pauseIcon : playIcon}
        </button>
        <button
          onClick={handleMuteUnmute}
          className="p-4 bg-black bg-opacity-10 hover:bg-opacity-50 flex items-center justify-center"
        >
          {isMuted ? unMuteIcon : muteIcon}
        </button>
        <div className="flex justify-around items-center w-full ml-4">
          <div className="text-xs mr-2">Volume</div>
          <input
            type="range"
            className="w-32"
            max="100"
            value={isNaN(volume) ? 0 : volume} // Ensure volume is not NaN
            onChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
