// @/app/play/[gameId]/page.tsx 

"use client";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/app/play/components/GameScreen";
import useGameEngine from "@/app/play/hooks/useGameEngine";
import { usePathname } from "next/navigation";

/**
 * Game component to manage the game state and render the GameScreen.
 *
 * @returns A React component that renders the GameScreen or an error message if there's an error.
 */
const Game: React.FC = () => {
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const gameId = pathname.split("/").pop();
  const { scene, error, handlePlayerAction, showActions, audioLoaded } = useGameEngine(gameId);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <GameScreen
      signOut={signOut}
      user={user}
      scene={scene}
      handlePlayerAction={handlePlayerAction}
      showActions={showActions}
    />
  );
};

export default Game;
