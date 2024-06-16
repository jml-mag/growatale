// @/app/play-5/page.tsx

'use client';
import { Scene, Story } from "@/app/play-5/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { generateClient, Client } from "aws-amplify/data";
import { getAudio, getImage } from "@/app/play-5/utils/apiCalls";
import { Schema } from "@/amplify/data/resource";
import {
  initializeGame,
  saveStateToScene,
} from "@/app/play-4/utils/gameUtils";

const client = generateClient<Schema>();

const Play = () => {
  const { signOut, user } = useAuth();
  const [previousGames, setPreviousGames] = useState<Story[]>([]);
  const [initialScene, setInitialScene] = useState({
    image: "",
    audio: "",
    actions_available: [],
    primary_text: " ",
    scene_description: "",
    time: "12:00 PM",
    previous_scene: "",
    story_id: "61de8810-2701-408d-9c0c-51f8ed878219",
  });
  
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

  const logState = () => {
    console.log(JSON.stringify(initialScene, null, 2));
  };

  const startStory = async (user: any) => {
    const gameId = await initializeGame(user.username);
    router.push(`/play-4/${gameId}`);
  };

  return (
    <div className="text-white">
      <button
        onClick={logState}
        className="py-3 px-2 m-3 bg-blue-600 text-blue-50"
      >
        Log State
      </button>
      <button
        onClick={() => saveStateToScene(initialScene)}
        className="py-3 px-2 m-3 bg-green-600 text-green-50"
      >
        Save State
      </button>
      <button
        onClick={() => startStory(user)}
        className="py-3 px-2 m-3 bg-green-600 text-green-50"
      >
        Start Story
      </button>
      <div>
            {previousGames.length > 0 ? (
              <ul>
                {previousGames.map((game) => (
                  <li key={game.id}>
                    <Link href={`/play-5/${game.id}`}>{game.id}</Link>
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
