// @/components/GameScreen4

"use client";
import Image from "next/image";
import { Scene } from "@/app/play-4/types";
import { useState } from "react";

interface GameScreenProps {
  signOut: () => void;
  user: any; // Replace `any` with the actual type if you have it
  gameId: string | string[] | undefined;
  scene: Scene | null; // Accept scene data as a prop
}

const GameScreen: React.FC<GameScreenProps> = ({ signOut, user, gameId, scene }) => {
    
    
  if (!scene) {
    return <div>No scene data available.</div>;
  }

  return (
    <div className="text-white">
      <div>
        <button onClick={signOut}>Sign Out</button>
        <p>Welcome, {user.username}</p>
      </div>
      <div>
        <h1 className="text-3xl font-bold">Scene</h1>
        <p>{scene.primary_text}</p>
        <p>{`image file: ${scene.image}`}</p>
        <audio controls>
          <source src={scene.audio} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <ul>
          {scene.actions_available.map((action) => (
            <li key={action.direction}>{action.command_text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GameScreen;

