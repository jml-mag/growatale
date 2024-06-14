// @/app/play-3/page

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { generateClient, Client } from "aws-amplify/data";
import { getAudio, getImage } from "@/app/play-3/utils/apiCalls";
import { Schema } from "@/amplify/data/resource";
import {
  initializeGame,
  saveScene,
  updateStoryCurrentScene,
  fetchScene,
  convertToActions,
} from "@/app/play-3/utils/gameUtils";
import { Scene, Story } from "@/app/play-3/types";
import Image from "next/image";

const client: Client<Schema> = generateClient<Schema>();

const Play = () => {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [previousGames, setPreviousGames] = useState<Story[]>([]);
  const [initialScene, setInitialScene] = useState<Scene>({
    id: "",
    image: "",
    audio: "",
    actions_available: [],
    primary_text: " ",
    scene_description: "",
    time: "12:00 PM",
    previous_scene: "",
    story_id: "",
  });

  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    console.log(`Next step state: ${JSON.stringify(initialScene, null, 2)}`);
}, [initialScene]);

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

  function generateInitialPrompt() {
    let sceneDescription = "a forest with mountains in the very far distance";
    let genre = "Mystery";
    let time = initialScene.time;
    let writer = `A great author of exciting, interactive ${genre} text games`;

    let age = 12;

    const foundationPrompt = `You are ${writer}, writing a ${genre} text game in your literary style appropriate for a ${age} year old. The scene to write is based on ${sceneDescription} at ${time}. The story must be told from the perspective of the player in the first person. Never use 'I' or 'you' in the description. The scene is only from the eyes of the player. Do not describe the player in the scene, describe the scene as seen by the player. Please return a detailed JSON object with keys for 'story', 'scene_description', and 'player_options'.`;

    const dataShapePrompt = `The Story should describe the surroundings and options to the player. The scene description will be used by an AI image generator to create a visualization of the story from the player's first-person perspective. It must be detailed and vivid, always feature at least one path for the player to move in, and be under 500 characters. The player options should only include directions explicitly mentioned in the scene description (e.g., if a pathway is described as leading forward, 'forward' should be the only option). 'Player_options' should be structured as an object with a 'direction' key which should be an array containing the direction and a 'command text' like ['forward', 'Continue down alley'], limited to three words maximum, and a 'transition_text' key. The transition_text should describe the action of moving in that direction, keeping these texts to one or two sentences. The JSON object structure must include 'story', 'scene_description', and 'player_options', where 'player_options' contain 'directions' with all available directions the player can move, each including 'direction', 'command_text', and 'transition_text'.`;

    const prompt = `${foundationPrompt} ${dataShapePrompt}`;
    console.log(prompt);

    return [
      {
        role: "system",
        content: prompt,
      },
    ];
  }

  async function getPrimaryResponse(prompt: any) {
    try {
      const response = await fetch("/api/openai/primary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt[0].content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }

  const handleStartNewGame = async () => {
    try {
      // Step 1: Initialize the game
      const newStoryId = await initializeGame(user.username);
      console.log("New Story ID:", newStoryId);

      // Step 2: Set initial scene state with the new story ID
      console.log('Step 2')
      setInitialScene((prevState) => ({
        ...prevState,
        story_id: newStoryId,
      }));
  
      // Step 3: Generate the initial prompt and get the primary response
      const initialPrompt = generateInitialPrompt();
      const primaryResponseString = await getPrimaryResponse(initialPrompt);
      console.log("Primary Response String:", primaryResponseString);
  
      // Parsing the response
      const primaryResponse = JSON.parse(primaryResponseString.message);
      console.log("Primary Response:", primaryResponse);
  
      // Step 4: Update the scene state with the primary response data
      console.log('Step 4')
      setInitialScene((prevState) => ({
        ...prevState,
        primary_text: primaryResponse.story,
        scene_description: primaryResponse.scene_description,
        actions_available: convertToActions(primaryResponse.player_options.directions),
      }));
  
      // Step 5: Fetch image and audio URLs asynchronously
      const [imageUrl, audioUrl] = await Promise.all([
        getImage(primaryResponse.scene_description),
        getAudio(primaryResponse.story),
      ]);
  
      // Step 6: Update the scene state with image and audio URLs
      console.log('Step 6')
      setInitialScene((prevState) => ({
        ...prevState,
        image: imageUrl || "",
        audio: audioUrl || "",
      }));
  
      // Step 7: Save the scene data
      const sceneData: Scene = {
        ...initialScene,
        actions_available: initialScene.actions_available,
      };
      console.log("Step 7, Scene Data to Save:", sceneData);
  
      const savedSceneData = await saveScene(sceneData);
      console.log("Saved Scene Data:", savedSceneData);
  
      // Step 8: Update the story with the current scene
      await updateStoryCurrentScene(newStoryId, savedSceneData.id);
  
      // Step 9: Fetch the scene data to present
      const fetchedScene = await fetchScene(savedSceneData.id);
      console.log("Fetched Scene Data:", fetchedScene);
  
      // Step 10: Update the scene state with the fetched scene data
      console.log('Step 10')
      setInitialScene((prevState) => ({
        ...prevState,
        id: fetchedScene.id,
        image: fetchedScene.image,
        audio: fetchedScene.audio,
        actions_available: convertToActions(fetchedScene.actions_available),
        primary_text: fetchedScene.primary_text,
        scene_description: fetchedScene.scene_description,
        time: fetchedScene.time,
        previous_scene: fetchedScene.previous_scene,
        story_id: fetchedScene.story_id,
      }));
  
      // Step 11: Display the scene data
      setShowScene(true);
    } catch (error) {
      console.error("Error starting new game:", error);
    }
  };
  
  
  

  return (
    <div className="text-center text-white">
      {showScene ? (
        <div>
          <h1 className="text-3xl font-bold">Scene</h1>
          <p>{initialScene.primary_text}</p>
          <Image
            src={initialScene.image}
            alt="Scene Image"
            width={600}
            height={400}
          />
          <audio controls>
            <source src={initialScene.audio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <ul>
            {initialScene.actions_available.map((action) => (
              <li key={action.direction}>{action.command_text}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
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
        </div>
      )}
    </div>
  );
};

export default Play;
