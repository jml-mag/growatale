"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { generateClient, Client } from "aws-amplify/data";
import { uploadData, getUrl } from '@aws-amplify/storage';
import { type Schema } from "@/amplify/data/resource";
import Image from 'next/image';

const client: Client<Schema> = generateClient<Schema>();

interface Action {
  direction: string;
  command_text: string;
  transition_text: string;
}

interface Scene {
  id: string;
  image: string;
  audio: string;
  actions_available: Action[];
  primary_text: string;
  scene_description: string;
  time: string;
  previous_scene: string;
  story_id: string;
}

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

async function initializeGame(username: string): Promise<string> {
  const newStory: Omit<Story, "id"> = {
    owner: username,
    author: "Default Author",
    artist: "Default Artist",
    current_scene: "",
    player_health: 100,
    player_inventory: [],
    primary_ai: "",
    audio_ai: "",
    image_ai: "",
  };

  try {
    const { data, errors } = await client.models.Story.create(newStory);
    if (!errors && data) {
      return data.id;
    } else {
      console.error("Error creating new story: ", errors);
      throw new Error("Error creating new story");
    }
  } catch (error) {
    console.error("Error initializing game:", error);
    throw error;
  }
}

async function getImage(prompt: string) {
  try {
    const response = await fetch("/api/openai/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        response_format: "b64_json" // Ensure we get base64 response
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Image data:", data);

    if (data.image_base64) {
      // Handling base64 image
      const imageBuffer = Buffer.from(data.image_base64, 'base64');
      console.log("Decoded image buffer:", imageBuffer);
      return imageBuffer;
    } else {
      console.error("No valid image data received.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

async function getAudio(text: string) {
  try {
    const response = await fetch("/api/openai/audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model: "tts-1-hd",
        voice: "nova",
        response_format: "mp3"
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("Audio buffer:", audioBuffer);

    return audioBuffer;
  } catch (error) {
    console.error("Error fetching audio:", error);
    return null;
  }
}

async function saveBufferToStorage(buffer: Uint8Array, key: string, contentType: string) {
  try {
    const blob = new Blob([buffer], { type: contentType });
    const result = await uploadData({
      path: key,
      data: blob,
      options: { contentType }
    });
    return (await result.result).path; // Access the URL directly
  } catch (error) {
    console.error("Error saving to storage:", error);
    throw error;
  }
}

async function saveScene(sceneData: Scene) {
  // Convert actions_available from Action[] to string[]
  const stringActionsAvailable = sceneData.actions_available.map(action => action.direction);

  // Create a new sceneData object with string[] for actions_available
  const modifiedSceneData = {
    ...sceneData,
    actions_available: stringActionsAvailable,
  };

  try {
    const { data, errors } = await client.models.Scene.create(modifiedSceneData);
    if (!errors && data) {
      return data.id;
    } else {
      console.error("Error creating new scene: ", errors);
      throw new Error("Error creating new scene");
    }
  } catch (error) {
    console.error("Error saving scene:", error);
    throw error;
  }
}


async function updateStoryCurrentScene(storyId: string, sceneId: string) {
  try {
    const { data, errors } = await client.models.Story.update({
      id: storyId,
      current_scene: sceneId
    });
    if (!errors && data) {
      return data;
    } else {
      console.error("Error updating story:", errors);
      throw new Error("Error updating story");
    }
  } catch (error) {
    console.error("Error updating story:", error);
    throw error;
  }
}

async function fetchScene(sceneId: string) {
  try {
    const { data, errors } = await client.models.Scene.get({ id: sceneId });
    if (!errors && data) {
      return data;
    } else {
      console.error("Error fetching scene:", errors);
      throw new Error("Error fetching scene");
    }
  } catch (error) {
    console.error("Error fetching scene:", error);
    throw error;
  }
}

// Convert string[] | null | undefined to Action[]
function convertToActions(actions: string[] | null | undefined): Action[] {
  if (!actions) return [];
  return actions.map(action => ({
    direction: action,
    command_text: "", // Provide appropriate command_text
    transition_text: "" // Provide appropriate transition_text
  }));
}

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
    console.log(initialScene);
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
      const newStoryId = await initializeGame(user.username);
      setInitialScene((prevState) => ({
        ...prevState,
        story_id: newStoryId,
      }));

      const initialPrompt = generateInitialPrompt();
      const primaryResponseString = await getPrimaryResponse(initialPrompt);

      // Parsing the response
      const primaryResponse = JSON.parse(primaryResponseString.message);

      console.log(`primaryResponse: ${JSON.stringify(primaryResponse, null, 2)}`);

      setInitialScene((prevState) => ({
        ...prevState,
        primary_text: primaryResponse.story,
        scene_description: primaryResponse.scene_description,
        actions_available: primaryResponse.player_options.directions,
      }));

      // Fetch image and audio asynchronously
      const [imageData, audioData] = await Promise.all([
        getImage(primaryResponse.scene_description),
        getAudio(primaryResponse.story)
      ]);

      // Ensure imageData and audioData are not null
      if (!imageData || !(imageData instanceof Uint8Array)) {
        throw new Error("Invalid image data");
      }

      if (!audioData || !(audioData instanceof ArrayBuffer)) {
        throw new Error("Invalid audio data");
      }

      // Log detailed image and audio data
      console.log('Detailed Image data:', imageData);
      console.log('Image data type:', typeof imageData);
      if (imageData instanceof Uint8Array) {
        console.log('Image data is a Uint8Array');
      } else {
        console.log('Image data is not a Uint8Array');
      }

      console.log('Detailed Audio data:', audioData);
      console.log('Audio data type:', typeof audioData);
      if (audioData instanceof ArrayBuffer) {
        console.log('Audio data is an ArrayBuffer');
      } else {
        console.log('Audio data is not an ArrayBuffer');
      }

      // Save image and audio to storage
      const imageUrl = await saveBufferToStorage(imageData, `images/${newStoryId}.jpg`, 'image/jpeg');
      const audioUrl = await saveBufferToStorage(new Uint8Array(audioData), `audio/${newStoryId}.mp3`, 'audio/mpeg');

      // Save the scene data
      const sceneData: Scene = {
        id: "",
        image: imageUrl,
        audio: audioUrl,
        actions_available: primaryResponse.player_options.directions,
        primary_text: primaryResponse.story,
        scene_description: primaryResponse.scene_description,
        time: initialScene.time,
        previous_scene: "",
        story_id: newStoryId,
      };

      const sceneId = await saveScene(sceneData);

      // Update the story with the current scene
      await updateStoryCurrentScene(newStoryId, sceneId);

      // Fetch the scene data to present
      const fetchedScene = await fetchScene(sceneId);

      // Update the scene state with the fetched scene data
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

      // Display the scene data
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
          <Image src={initialScene.image} alt="Scene Image" width={600} height={400} />
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
