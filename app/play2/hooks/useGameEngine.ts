// @/app/play2/hooks/useGameEngine.ts

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Scene, Action } from "@/app/play2/types";
import { fetchStoryById, fetchSceneById, saveScene } from "@/app/play2/utils/gameUtils";
import { createScene } from "@/app/play2/utils/generateContent";

const useGameEngine = () => {
    const [scene, setScene] = useState<Scene | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const pathname = usePathname();
    const gameId = pathname.split("/").pop();

    const fetchAndSetScene = async (sceneId: string) => {
        try {
            let fetchedScene = await fetchSceneById(sceneId);

            if (!fetchedScene.primary_text && fetchedScene.actions_available.length === 0) {
                const generatedContent = await createScene(fetchedScene, '', '');
                fetchedScene = {
                    ...fetchedScene,
                    primary_text: generatedContent.story,
                    actions_available: generatedContent.player_options.directions.filter((action: Action): action is Action => action !== null),
                };
                await saveScene(fetchedScene);
            }

            setScene(fetchedScene);
        } catch (error) {
            console.error('Error fetching and setting scene:', error);
            setError(error instanceof Error ? error.message : "Unknown error fetching the scene.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!gameId) return;
        const fetchCurrentScene = async () => {
            setLoading(true);
            try {
                const story = await fetchStoryById(gameId);
                await fetchAndSetScene(story.current_scene);
            } catch (error) {
                console.error('Error fetching current scene:', error);
                setError(error instanceof Error ? error.message : "Unknown error fetching the story.");
                setLoading(false);
            }
        };
        fetchCurrentScene();
    }, [gameId]);

    const handlePlayerAction = useCallback(async (action: Action) => {
        if (!scene || !scene.id) return;
        setLoading(true);
        try {
            // Check if the action already leads to an existing scene, if so, fetch and set that scene
            if (action.leads_to) {
                await fetchAndSetScene(action.leads_to);
                return;
            }

            // If not, create a new scene with the current scene's ID as the previous_scene
            const newScene: Scene = {
                image: "",
                audio: "",
                actions_available: [],
                primary_text: '',
                scene_description: '',
                time: '',
                previous_scene: scene.id,
                story_id: scene.story_id,
            };
            let createdScene = await saveScene(newScene);

            // Update the action with the new scene ID
            const updatedAction: Action = {
                ...action,
                leads_to: createdScene.id,
            };

            // Update the actions in the current scene with the updated action
            const updatedActions = scene.actions_available.map((act: Action | null) => {
                if (act && act.direction === action.direction) {
                    return updatedAction;
                }
                return act;
            }).filter((act): act is Action => act !== null); // Ensure no null values

            // Save the updated current scene
            const updatedScene: Scene = {
                ...scene,
                actions_available: updatedActions,
            };
            await saveScene(updatedScene);

            // Generate new content for the new scene
            const generatedContent = await createScene(createdScene as Scene, '', '');
            createdScene = {
                ...createdScene,
                primary_text: generatedContent.story,
                scene_description: generatedContent.scene_description,
                actions_available: generatedContent.player_options.directions.filter((action: Action): action is Action => action !== null),
            };

            // Ensure the 'back' action in the new scene is updated before saving
            const finalCreatedSceneActions = createdScene.actions_available.map((act: Action | null) => {
                if (act && act.direction === 'back') {
                    const updatedBackAction = {
                        ...act,
                        leads_to: scene.id,  // Set to previous scene's ID
                    };
                    return updatedBackAction;
                }
                return act;
            }).filter((act): act is Action => act !== null); // Ensure no null values

            createdScene = { ...createdScene, actions_available: finalCreatedSceneActions };

            // Save the new scene with the updated 'back' action
            await saveScene(createdScene as Scene);

            // Fetch and set the new scene
            await fetchAndSetScene(createdScene.id);
        } catch (error) {
            console.error('Error handling player action:', error);
            setError(error instanceof Error ? error.message : "Unknown error handling player action.");
        } finally {
            setLoading(false);
        }
    }, [scene]);
    return { scene, loading, error, handlePlayerAction };
};

export default useGameEngine;