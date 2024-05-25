// File Path: app/play/page.tsx

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { generateClient, Client } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";
import { generateInitialPrompt } from "@/GameEngine/generatePrompt2";

const client: Client<Schema> = generateClient<Schema>();

interface Game {
  id: string;
  title: string;
  userId: string;
  user: any;
}

const Play = () => {
  const { signOut, user } = useAuth();
  const [previousGames, setPreviousGames] = useState<Game[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPreviousGames() {
      try {
        const { data: games, errors } = await client.models.Story.list({
          filter: { userId: { eq: user.id } },
        });
        if (!errors) {
          setPreviousGames(games as Game[]);
        } else {
          console.error("Errors fetching games: ", errors);
        }
      } catch (error) {
        console.error("Error fetching previous games: ", error);
      }
    }

    fetchPreviousGames();
  }, [user.id, user]);

  const handleStartNewGame = async () => {
    try {
      const prompt = generateInitialPrompt();
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt[0].content }),
      });
      const data = await response.json();
      setAiResponse(data.message);
    } catch (error) {
      console.error("Error starting new game:", error);
    }
  };

  useEffect(() => {
    console.log(aiResponse);
  }, [aiResponse]);

  return (
    <div className="text-center text-white">
      <div>
        <button onClick={signOut}>Sign Out</button>
        <p>Welcome, {user.username}</p>
      </div>
      <h1 className="text-3xl font-bold">Your Games</h1>
      <div>
        {previousGames.length > 0 ? (
          <ul>
            {previousGames.map((game) => (
              <li key={game.id}>
                <Link href={`/play/${game.id}`}>{game.title}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No previous games found.</p>
        )}
      </div>
      <div>
        <button onClick={handleStartNewGame}>Start New Game</button>
      </div>
      {aiResponse && <div className="mt-4"><p>{aiResponse}</p></div>}
    </div>
  );
};

export default Play;
