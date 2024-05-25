// File Path: components/GameScreen.tsx

'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { initialTurn, processTurn, Turn } from '../GameEngine';

interface GameScreenProps {
    signOut: () => void;
    user: any; // Replace `any` with the actual type if you have it
    gameId: string | string[] | undefined;
}

const GameScreen: React.FC<GameScreenProps> = ({ signOut, user, gameId }) => {
    const [currentTurn, setCurrentTurn] = useState<Turn>(initialTurn);

    useEffect(() => {
        const nextTurn = processTurn(currentTurn);
        setCurrentTurn(nextTurn);
    }, [currentTurn]);

    return (
        <div>
            <div>
                <button onClick={signOut}>Sign Out</button>
                <p>Welcome, {user.username}</p>
            </div>
            <h1>Game ID: {gameId}</h1>
            <h1>Turn: {currentTurn.turnNumber}</h1>
            <h2>Health: {currentTurn.playerState.health}</h2>
            <div>
                <Image src={currentTurn.currentScene.image} alt="Scene" fill />
                <p>{currentTurn.currentScene.scene_description}</p> {/* Updated property name */}
            </div>
            <div>
                <h3>Inventory</h3>
                <ul>
                    {currentTurn.playerState.inventory.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GameScreen;
