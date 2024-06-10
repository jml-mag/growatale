// File Path: components/GameScreen.tsx

'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GameScreenProps {
    signOut: () => void;
    user: any; // Replace `any` with the actual type if you have it
    gameId: string | string[] | undefined;
}

// get current_scene in game by id
// get scene object from scene id
// save scene object to state
// state change triggers render new scene object

const GameScreen: React.FC<GameScreenProps> = ({ signOut, user, gameId }) => {
    return (
        <div className='text-white'>
            <div>
                <button onClick={signOut}>Sign Out</button>
                <p>Welcome, {user.username}</p>
            </div>
            <h1>Game ID: {gameId}</h1>
        </div>
    );
};

export default GameScreen;
