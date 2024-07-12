// app/play3/page.tsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { initializeGame } from "@/app/play/utils/gameUtils";
import { Story } from "@/app/play/types";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

const Play = () => {
  const { signOut, user } = useAuth();
  const [previousGames, setPreviousGames] = useState<Story[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchPreviousGames() {
      try {
        const { data: stories, errors } = await client.models.Story.list({
          filter: { owner: { eq: user.username } },
        });
        if (!errors) {
          setPreviousGames(stories as Story[]);
        } else {
          console.error("Errors fetching games: ", errors);
        }
      } catch (error) {
        console.error("Error fetching previous games:", error);
      }
    }

    fetchPreviousGames();
  }, [user.username]);

  // Initializes a new game, creates an initial scene, and navigates to the game screen
  const startStory = async () => {
    try {
      //  Create a new story and scene
      const { gameId, sceneData } = await initializeGame(user.username);
      router.push(`/play/${gameId}`);
    } catch (error) {
      console.error("Error starting story:", error);
    }
  };

  return (
    <div className="text-white">
      <button
        onClick={startStory}
        className="py-3 px-2 m-3 bg-green-600 text-green-50"
      >
        Start Story
      </button>
      <div>
        {previousGames.length > 0 ? (
          <ul>
            {previousGames.map((game) => (
              <li key={game.id}>
                <Link href={`/play/${game.id}`}>{game.id}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No previous games found.</p>
        )}
      </div>
    </div>
  );
};

export default Play;
