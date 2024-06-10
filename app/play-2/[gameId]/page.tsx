// File Path: app/play/[gameId]/page.tsx

"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/components/GameScreen2";

export default function Game() {
    const { signOut, user } = useAuth();
    const pathname = usePathname();
    const gameId = pathname;
    console.log(gameId);
    // Fetch game data based on gameId
    // const gameData = fetchGameData(gameId);

    return <GameScreen signOut={signOut} user={user} gameId={gameId} />; // Ensure that the `signOut` prop is correctly passed
}
