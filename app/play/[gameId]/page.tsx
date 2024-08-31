// @/app/play/[gameId]/page.tsx

"use client";
import { useAuth } from "@/context/AuthContext";
//import GameScreen from "@/app/play/components/GameScreen";
import GameScreen from "@/app/play/components/GameScreen2";
import useGameEngine from "@/app/play/hooks/useGameEngine";
import { usePathname } from "next/navigation";

const Game: React.FC = () => {
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const gameId = pathname.split("/").pop();
  const { scene, error, handlePlayerAction, showActions, audioFile, imageFile } = useGameEngine(gameId);

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
      audioFile={audioFile}
      imageFile={imageFile}
    />
  );
};

export default Game;
