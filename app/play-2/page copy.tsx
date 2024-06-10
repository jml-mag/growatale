// app/play/page.tsx

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { generateClient, Client } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";
import { generateInitialPrompt } from "@/GameEngine/generatePrompt2";
import { v4 as uuidv4 } from "uuid";

const client: Client<Schema> = generateClient<Schema>();

interface Story {
  id: string;
  owner: string;
  author: string;
  artist: string;
  current_scene: string;
  player_health: number;
  player_inventory: string[];
  primary_ai: string;
  audio_ai: string;
  image_ai: string;
}

interface Scene {
  image: string;
  audio: string;
  actions_available: Array<{
    direction: string;
    command_text: string;
    transition_text: string;
  }>;
  primary_text: string;
  scene_description: string;
  time: string;
  previous_scene: string;
  story_id: string;
}

const Play = () => {
  const { signOut, user } = useAuth();
  const [previousGames, setPreviousGames] = useState<Story[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [thisScene, setThisScene] = useState<Scene>({
    image: "",
    audio: "",
    actions_available: [],
    primary_text: "",
    scene_description: "",
    time: "12:00 PM",
    previous_scene: "",
    story_id: "",
  });

  const [primaryTime, setPrimaryTime] = useState<number | null>(null);
  const [audioTime, setAudioTime] = useState<number | null>(null);
  const [imageTime, setImageTime] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState<number | null>(null);

  useEffect(() => {
    console.log(thisScene);
  }, [thisScene]);

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

  const handleStartNewGame = async () => {
    const startTime = Date.now();
    setPrimaryTime(0);
    setAudioTime(0);
    setImageTime(0);
    setTotalTime(0);

    const totalInterval = setInterval(() => {
      setTotalTime(Date.now() - startTime);
    }, 1000);

    try {
      const prompt = generateInitialPrompt();

      // Primary API call
      const primaryStart = Date.now();
      const primaryInterval = setInterval(() => {
        setPrimaryTime(Date.now() - primaryStart);
      }, 1000);

      const response = await fetch("/api/openai/primary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt[0].content }),
      });

      clearInterval(primaryInterval);
      const data = await response.json();
      const primaryEnd = Date.now();
      setPrimaryTime(primaryEnd - primaryStart);

      const parsedData = JSON.parse(data.message);

      // Update state with the received data
      setThisScene((prevState) => ({
        ...prevState,
        primary_text: parsedData.story,
        actions_available: parsedData.player_options.directions,
        scene_description: parsedData.scene_description,
        image: "",
        audio: "",
        time: "12:00 PM",
        previous_scene: "",
        story_id: "",
      }));

      // Audio API call
      const audioStart = Date.now();
      const audioInterval = setInterval(() => {
        setAudioTime(Date.now() - audioStart);
      }, 1000);

      const audioResponse = fetch("/api/openai/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: parsedData.story,
          model: "tts-1-hd",
          voice: "fable",
          response_format: "mp3",
        }),
      }).then(async (response) => {
        const audioData = await response.json();
        clearInterval(audioInterval);
        const audioEnd = Date.now();
        setAudioTime(audioEnd - audioStart);

        const audioFileName = `${uuidv4()}.mp3`;

        // Update state with TTS response
        setThisScene((prevState) => ({
          ...prevState,
          audio: audioFileName,
        }));
      });

      // Image API call
      const imageStart = Date.now();
      const imageInterval = setInterval(() => {
        setImageTime(Date.now() - imageStart);
      }, 1000);

      const imageResponse = fetch("/api/openai/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: parsedData.scene_description,
          model: "dall-e-3",
          n: 1,
          quality: "standard",
          response_format: "url",
          size: "1024x1024",
          style: "vivid",
        }),
      }).then(async (response) => {
        const imageData = await response.json();
        clearInterval(imageInterval);
        const imageEnd = Date.now();
        setImageTime(imageEnd - imageStart);

        // Update state with image response
        setThisScene((prevState) => ({
          ...prevState,
          image: imageData,
        }));
      });

      // Wait for both audio and image responses
      await Promise.all([audioResponse, imageResponse]);

      setAiResponse(parsedData.message);

      const endTime = Date.now();
      setTotalTime(endTime - startTime);
      clearInterval(totalInterval);
    } catch (error) {
      clearInterval(totalInterval);
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
                <Link href={`/play/${game.id}`}>{game.id}</Link>
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
      <div>
        {primaryTime !== null && <p>Primary Call Time: {primaryTime} ms</p>}
        {audioTime !== null && <p>Audio Call Time: {audioTime} ms</p>}
        {imageTime !== null && <p>Image Call Time: {imageTime} ms</p>}
        {totalTime !== null && <p>Total Time: {totalTime} ms</p>}
      </div>
    </div>
  );
};

export default Play;
