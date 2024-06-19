// @/components/AudioPlayer.tsx

import React, { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  audioFile: File;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioFile }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('0:00');
  const [duration, setDuration] = useState<string>('0:00');
  const [volume, setVolume] = useState<number>(100);
  const [progress, setProgress] = useState<number>(0);
  const [audioSrc, setAudioSrc] = useState<string>('');

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
      audio.play();
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleMetadata);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleMetadata);
      };
    }
  }, [audioSrc]);

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

  const handleMuteUnmute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(audio.muted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const volume = parseInt(e.target.value);
    if (audio) {
      audio.volume = volume / 100;
      setVolume(volume);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const seekTime = (parseInt(e.target.value) / 100) * (audio?.duration || 0);
    if (audio) {
      audio.currentTime = seekTime;
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="audio-player flex flex-col items-center bg-blue-950 bg-opacity-70 p-4 rounded-2xl text-white w-96">
      <audio ref={audioRef} src={audioSrc} autoPlay loop />

      <div className="controls flex items-center justify-between w-full mt-4">
        <button onClick={handlePlayPause} className="player-button">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={handleMuteUnmute} className="player-button">
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <input
          type="range"
          className="timeline w-2/3"
          max="100"
          value={progress}
          onChange={handleSeek}
        />
        <input
          type="range"
          className="volume-slider w-1/3"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>

      <div className="time-info flex justify-between w-full mt-2">
        <span className="current-time">{currentTime}</span>
        <span className="duration">{duration}</span>
      </div>
    </div>
  );
};

export default AudioPlayer;
