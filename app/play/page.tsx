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
import { motion } from "framer-motion";
import { josefin_slab, inter } from "@/app/fonts";

import GothicHorror from "@/public/gothichorror.webp";
import ScienceFiction from "@/public/sciencefiction.webp";
import Western from "@/public/western.webp";

const client = generateClient<Schema>();

const Play = (): JSX.Element => {
  const { signOut, user } = useAuth();
  const [previousGames, setPreviousGames] = useState<Story[]>([]);
  const [isFading, setIsFading] = useState(false);
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

    setIsFading(true);

    try {
      const { gameId, sceneData, settings } = await initializeGame(
        user.username,
        genre
      );
      setTimeout(() => router.push(`/play/${gameId}`), 500); // Wait for fade-out animation to complete
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
    <motion.div
      className="text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: isFading ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="fixed top-0 right-0 p-4 bg-none">
        <button
          onClick={signOut}
          className="py-2 px-4 bg-gradient-to-br from-red-700 to-red-950 via-red-700 text-white border border-red-600 hover:from-red-600"
        >
          Sign Out
        </button>
      </div>
      <div className="container mx-auto">
        <div className="mt-24 flex flex-col sm:flex-row sm:justify-center sm:space-x-4">
          {genres.map(({ name, image }) => {
            const genreStory = previousGames.find(
              (game) => game.genre === name
            );
            return (
              <div
                key={name}
                className={`rounded-3xl w-3/4 mt-4 mb-12 m-auto sm:w-1/3 sm:flex-shrink-0 sm:m-2 shadow-lg shadow-blue-300 hover:shadow-sky-300 bg-blue-950 hover:bg-sky-700 bg-opacity-50 hover:bg-opacity-30 pb-4`}
              >
                <Image
                  src={image}
                  alt={`${name} image`}
                  style={{ objectFit: "cover" }}
                  priority
                  className="mx-auto rounded-t-3xl border-t-2 border-blue-200"
                />
                {genreStory ? (
                  <div className="mt-4 text-center">
                    <Link href={`/play/${genreStory.id}`}>
                      <button className="mt-2 py-2 px-4 rounded-lg bg-blue-950 bg-opacity-95 border border-blue-800 text-white hover:bg-blue-700">
                        Continue Story
                      </button>
                    </Link>
                    <p className={`text-sm p-4`}>
                      To start a new {name} story you must delete the existing
                      one.
                    </p>
                    <button
                      onClick={() => handleDelete(genreStory.id || "")}
                      className="mt-2 py-2 px-4 rounded-lg bg-red-950 bg-opacity-95 border border-red-800 text-white hover:bg-red-700"
                    >
                      Delete This Story
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => startStory(name)}
                      className="mt-2 py-2 px-4 rounded-lg bg-green-950 bg-opacity-95 border border-green-800 text-white hover:bg-green-700"
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
    </motion.div>
  );
};

export default Play;
