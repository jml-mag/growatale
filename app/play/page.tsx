// @/app/play/page.tsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  initializeGame,
  deleteStoryWithAssets,
} from "@/app/play/utils/gameUtils";
import { Story } from "@/app/play/types";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";

import GothicHorror from "@/public/gothichorror.webp";
import ScienceFiction from "@/public/sciencefiction.webp";
import Western from "@/public/western.webp";

const client = generateClient<Schema>();

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

  const startStory = async (genre: string) => {
    if (!user || !user.username) {
      console.error("User not authenticated or username is undefined");
      return;
    }

    try {
      const { gameId, sceneData, settings } = await initializeGame(
        user.username,
        genre
      );
      router.push(`/play/${gameId}`);
    } catch (error) {
      console.error("Error starting story:", error);
    }
  };

  const handleDelete = async (storyId: string) => {
    try {
      await deleteStoryWithAssets(storyId);
      setPreviousGames(previousGames.filter((game) => game.id !== storyId));
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  if (!user || !user.username) {
    return <p>Loading...</p>;
  }

  const genres = [
    { name: "gothic horror", image: GothicHorror },
    { name: "science fiction", image: ScienceFiction },
    { name: "western", image: Western },
  ];

  return (
    <div className="text-white">
      <div className="fixed top-0 right-0 p-4 bg-none">
        <button onClick={signOut} className="py-2 px-4 bg-gradient-to-br from-red-700 to-red-950 via-red-500 text-white border border-red-600">
          Sign Out
        </button>
      </div>
      <div className="container mx-auto">
        <div className="mt-24 flex flex-col sm:flex-row sm:justify-center sm:space-x-4">
          {genres.map(({ name, image }) => {
            const genreStory = previousGames.find((game) => game.genre === name);
            return (
              <div
                key={name}
                className="w-3/4 mt-4 mb-12 m-auto sm:w-1/3 sm:flex-shrink-0 sm:m-2"
              >
                <Image
                  src={image}
                  alt={`${name} image`}
                  layout="responsive"
                  width={200}
                  height={300}
                  className="mx-auto"
                />
                {genreStory ? (
                  <div className="mt-2 text-center">
                    <Link href={`/play/${genreStory.id}`}>
                      <button className="py-2 px-4 bg-blue-600 rounded-lg text-white">
                        Continue Story
                      </button>
                    </Link>
                    <p className="mt-6 text-sm">
                      To start a new story for {name}, you must delete the
                      existing one.
                    </p>
                    <button
                      onClick={() => handleDelete(genreStory.id || "")}
                      className="mt-2 py-1 px-2 bg-red-600 text-white font-light"
                    >
                      Delete This Story
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      onClick={() => startStory(name)}
                      className="mt-2 py-2 px-4 rounded-lg bg-green-950 bg-opacity-95 border border-green-800 text-white font-light"
                    >
                      Begin a new {name} Story
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Play;
