"use client";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/app/play/components/GameScreen";
import useGameEngine from "@/app/play/hooks/useGameEngine";

/**
 * Game component to manage the game state and render the GameScreen.
 * 
 * @returns A React component that renders the GameScreen or an error message if there's an error.
 */
const Game: React.FC = () => {
  const { signOut, user } = useAuth();
  const { scene, error, handlePlayerAction } = useGameEngine();

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
