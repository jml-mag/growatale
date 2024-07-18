// @/app/play/page.tsx

'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { initializeGame, deleteStoryWithAssets } from "@/app/play/utils/gameUtils";
import { Story } from "@/app/play/types";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

/**
 * Play component that lists previous games and allows starting a new game.
 *
 * @returns {JSX.Element} The Play component.
 */
const Play = (): JSX.Element => {
  const { signOut, user } = useAuth();
  const [previousGames, setPreviousGames] = useState<Story[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchPreviousGames() {
      if (!user || !user.username) {
        console.error("User not authenticated or username is undefined");
        return;
      }
      try {
        const { data: stories, errors } = await client.models.Story.list({
          filter: { owner: { eq: user.username } },
        });

        if (errors) {
          console.error("Errors fetching games: ", errors);
          return;
        }

        const validStories = stories.filter((story) => story && story.id);
        setPreviousGames(validStories as Story[]);
      } catch (error) {
        console.error("Error fetching previous games:", error);
      }
    }

    if (user && user.username) {
      fetchPreviousGames();
    }
  }, [user]);

  /**
   * Initializes a new game, creates an initial scene, and navigates to the game screen.
   */
  const startStory = async (genre: string) => {
    if (!user || !user.username) {
      console.error("User not authenticated or username is undefined");
      return;
    }

    try {
      const { gameId } = await initializeGame(user.username, genre);
      router.push(`/play/${gameId}`);
    } catch (error) {
      console.error("Error starting story:", error);
    }
  };

  /**
   * Handles the deletion of a story and its assets.
   * 
   * @param storyId - The ID of the story to delete.
   */
  const handleDelete = async (storyId: string) => {
    try {
      await deleteStoryWithAssets(storyId);
      // Refresh the list of previous games after deletion
      setPreviousGames(previousGames.filter(game => game.id !== storyId));
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  if (!user || !user.username) {
    return <p>Loading...</p>;
  }

  const genres = ["gothic horror", "science fiction", "western"];

  return (
    <div className="text-white">
      <div className="fixed top-0 right-0 p-4">
        <button onClick={signOut} className="py-2 px-4 bg-red-600 text-white">
          Sign Out
        </button>
      </div>
      {genres.map((genre) => {
        const genreStory = previousGames.find(game => game.genre === genre);
        return (
          <div key={genre} className="my-4 p-4 bg-gray-800 rounded-md">
            <h2 className="text-2xl capitalize">{genre}</h2>
            {genreStory ? (
              <div className="flex justify-between items-center">
                <Link href={`/play/${genreStory.id}`}>
                  Continue {genre} Story
                </Link>
                <button
                  onClick={() => handleDelete(genreStory.id || "")}
                  className="ml-4 py-1 px-2 bg-red-600 text-white"
                >
                  Delete
                </button>
              </div>
            ) : (
              <button
                onClick={() => startStory(genre)}
                className="py-2 px-4 mt-2 bg-green-600 text-green-50"
              >
                Start {genre} Story
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Play;
