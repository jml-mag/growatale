// File Path: app/play/[gameId]/page.tsx

"use client";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import GameScreen from "@/components/GameScreen";

export default function Game() {
    const { signOut, user } = useAuth();
    const router = useRouter();
    const { gameId } = router.query;

    // Fetch game data based on gameId
    // const gameData = fetchGameData(gameId);

    return <GameScreen signOut={signOut} user={user} gameId={gameId} />; // Ensure that the `signOut` prop is correctly passed
}
