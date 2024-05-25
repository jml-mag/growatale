// generatePrompt.ts
interface GameState {
  id: string;
  name: string;
  models: {
    chat: {
      options: string[];
      selected: number;
    };
    image: {
      options: string[];
      selected: number;
    };
    audio: {
      options: string[];
      selected: number;
    };
  };
  scene: {
    id: string;
    writer: string;
    artist: string;
    scene_description: string;
    time: string;
    voice: string;
    previous_scene: string;
    player_move: string;
    image: string;
    audio: string;
  };
  /*
  displayScene: {
    id: string,
    story: string,
    audio: string,
    image: string,
    playerOptions: {
      directions: [{ direction: string, commandText: string, transitionText: string }],
    },
  },
  */
}

interface Prompt {
  role: string;
  content: string;
}

export function generatePrompt(gameState: GameState): Prompt[] {
  let sceneDescription: string;
  let backOption: string;

  if (gameState.scene.previous_scene.trim()) {
    sceneDescription = `a previous game scene which read: '${gameState.scene.previous_scene}' and the player chose to move ${gameState.scene.player_move}.`;
    backOption = "Additionally, include an option to 'go back', allowing the player to return to the previous location.";
  } else {
    sceneDescription = gameState.scene.scene_description;
    backOption = "This scene should not offer the player a 'go back' option, as it is the starting location of the game.";
  }

  const foundationPrompt = `You are ${gameState.scene.writer}, writing a ${gameState.name} text game in your literary style for a twelve-year-old. The scene to write is based on ${sceneDescription} at ${gameState.scene.time}. Do not name the player or give them any tools or weapons. Please return a detailed JSON object with keys for 'story', 'scene_description', and 'player_options'.`;

  const dataShapePrompt = `The scene description should be used by an image generator to create a visualization of the story from the player's first-person perspective. It must be detailed and vivid, always feature at least one path for the player to move in, and be under 500 characters. The player options should only include directions explicitly mentioned in the scene description (e.g., if a pathway is described as leading forward, 'forward' should be the only option). ${backOption} 'Player_options' should be structured as an object with a 'direction' key which should be an array containing the direction and a 'command text' like ['forward', 'Continue down alley'], limited to three words maximum, and a 'transition_text' key. The transition_text should describe the action of moving in that direction, keeping these texts to one or two sentences. The JSON object structure must include 'story', 'scene_description', and 'player_options', where 'player_options' contain 'directions' with all available directions the player can move, each including 'direction', 'command_text', and 'transition_text'.`;

  return [{
    role: "system",
    content: `${foundationPrompt} ${dataShapePrompt}`
  }];
}