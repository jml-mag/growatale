// app/play3/[gameId]/page.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/app/play3/components/GameScreen3";
import useGameEngine from "@/app/play3/hooks/useGameEngine3";

const Game = () => {
  const { signOut, user } = useAuth();
  const { scene, loading, error, handlePlayerAction } = useGameEngine();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <GameScreen
      signOut={signOut}
      user={user}
      scene={scene}
      onAction={handlePlayerAction}
    />
  );
};

export default Game;
