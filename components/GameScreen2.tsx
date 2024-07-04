// app/components/GameScreen2.tsx
import React from 'react';
import { Scene } from "@/app/play2/types";

interface GameScreenProps {
  signOut: () => void;
  user: any;
  gameId: string | string[] | undefined;
  scene: Scene | null;
}

const GameScreen: React.FC<GameScreenProps> = ({
  signOut,
  user,
  gameId,
  scene,
}) => {
  return (
    <div className="text-white w-full h-screen overflow-hidden">
      <div className="text-sm">
        <div>UserId: {user.username}</div>
        <div>GameId: {gameId}</div>
        <div>SceneId: {scene?.id}</div>
      </div>
    </div>
  );
};

export default GameScreen;
