'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

// Array of path tile images
const pathTiles = [
  '/game-assets/images/tile-var-1.png',
  '/game-assets/images/tile-var-2.png',
  '/game-assets/images/tile-var-3.png',
  '/game-assets/images/tile-var-4.png',
  '/game-assets/images/tile-var-5.png',
  '/game-assets/images/tile-var-6.png'
];

const generateMaze = (width, height) => {
  // --- Maze generation logic (unchanged) ---
  const maze = Array(height).fill().map(() => Array(width).fill(1));
  const stack = [];
  const startX = 1;
  const startY = 1;
  maze[startY][startX] = 0;
  stack.push([startX, startY]);

  while (stack.length > 0) {
    const [currentX, currentY] = stack[stack.length - 1];
    const neighbors = [
      [currentX + 2, currentY, currentX + 1, currentY],
      [currentX - 2, currentY, currentX - 1, currentY],
      [currentX, currentY + 2, currentX, currentY + 1],
      [currentX, currentY - 2, currentX, currentY - 1]
    ].filter(([x, y]) =>
      x > 0 && x < width - 1 && y > 0 && y < height - 1 && maze[y][x] === 1
    );

    if (neighbors.length > 0) {
      const [nextX, nextY, wallX, wallY] = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[wallY][wallX] = 0;
      maze[nextY][nextX] = 0;
      stack.push([nextX, nextY]);
    } else {
      stack.pop();
    }
  }

  maze[1][1] = 2; // Start
  maze[height - 2][width - 2] = 3; // End

  // --- Generate a tile map for path textures (unchanged) ---
  const tileMap = Array(height).fill().map(() => Array(width).fill(null));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (maze[y][x] !== 1) { // If it's not a wall
        tileMap[y][x] = pathTiles[Math.floor(Math.random() * pathTiles.length)];
      }
    }
  }

  return { maze, tileMap };
};


const MazeGame = () => {
  const difficulties = {
    easy: { width: 15, height: 15 },
    medium: { width: 21, height: 21 },
    hard: { width: 31, height: 31 }
  };

  const speedOptions = {
    slow: 120,
    normal: 80,
    fast: 40,
    turbo: 20
  };

  const [difficulty, setDifficulty] = useState('easy');
  const [speed, setSpeed] = useState('normal');
  const [maze, setMaze] = useState([]);
  const [tileMap, setTileMap] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [gameWon, setGameWon] = useState(false);
  const [currentDirection, setCurrentDirection] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  // --- 🎧 SOUNDS: Refs to hold audio instances ---
  const bgSoundRef = useRef(null);
  const stepSoundRef = useRef(null);
  const winSoundRef = useRef(null);

  const gameLoopRef = useRef(null);
  const keysPressed = useRef(new Set());
  const lastMoveTime = useRef(0);

  // --- 🎧 SOUNDS: Initialize audio objects on component mount ---
  useEffect(() => {
    // This effect runs only once
    bgSoundRef.current = new Audio('/game-assets/sounds/bg.ogg');
    bgSoundRef.current.loop = true;
    bgSoundRef.current.volume = 0.2; // Background music should be subtle

    stepSoundRef.current = new Audio('/game-assets/sounds/step.ogg');
    stepSoundRef.current.volume = 0.5;

    winSoundRef.current = new Audio('/game-assets/sounds/win.ogg');

    // Cleanup function to pause sounds when the component unmounts
    return () => {
      bgSoundRef.current?.pause();
      stepSoundRef.current?.pause();
      winSoundRef.current?.pause();
    };
  }, []);

  const resetGame = useCallback(() => {
    const { width, height } = difficulties[difficulty];
    const { maze: newMaze, tileMap: newTileMap } = generateMaze(width, height);
    setMaze(newMaze);
    setTileMap(newTileMap);
    setPlayerPos({ x: 1, y: 1 });
    setGameWon(false);
    setCurrentDirection(null);
    setIsMoving(false);
    keysPressed.current.clear();

    // --- 🎧 SOUNDS: Control music on game reset ---
    winSoundRef.current?.pause(); // Stop win sound if it was playing
    winSoundRef.current.currentTime = 0;
    // Play background music. Browsers often require user interaction to play audio.
    // This function is triggered by a button click, so it's a safe place to start.
    bgSoundRef.current?.play().catch(error => console.error("Audio autoplay failed:", error));
  }, [difficulty]);


  const checkCollision = useCallback((x, y) => {
    if (!maze.length) return true;
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return true;
    return maze[y][x] === 1; // Wall collision
  }, [maze]);

  const movePlayer = useCallback((direction) => {
    if (gameWon) return;
    const moves = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0]
    };
    const [dx, dy] = moves[direction];
    setPlayerPos(prevPos => {
      const newX = prevPos.x + dx;
      const newY = prevPos.y + dy;
      if (checkCollision(newX, newY)) {
        return prevPos; // Don't move if collision
      }

      // --- 🎧 SOUNDS: Play step sound on successful move ---
      if (stepSoundRef.current) {
          stepSoundRef.current.currentTime = 0; // Rewind to start
          stepSoundRef.current.play();
      }

      setIsMoving(true);
      if (maze[newY] && maze[newY][newX] === 3) {
        setGameWon(true);
        setCurrentDirection(null);
        setIsMoving(false);
        keysPressed.current.clear();
      }
      return { x: newX, y: newY };
    });
  }, [gameWon, checkCollision, maze]);

  // --- 🎧 SOUNDS: Effect to handle winning sound and music ---
  useEffect(() => {
    if (gameWon) {
      bgSoundRef.current?.pause(); // Stop the background music
      winSoundRef.current?.play(); // Play the victory sound
    }
  }, [gameWon]);


  const getCurrentDirection = useCallback(() => {
    const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    for (const dir of directions) {
      if (keysPressed.current.has(dir)) {
        return {
          ArrowUp: 'up',
          ArrowDown: 'down',
          ArrowLeft: 'left',
          ArrowRight: 'right'
        }[dir];
      }
    }
    return null;
  }, []);

  const gameLoop = useCallback(() => {
    const now = Date.now();
    const direction = getCurrentDirection();
    if (direction && now - lastMoveTime.current >= speedOptions[speed]) {
      movePlayer(direction);
      lastMoveTime.current = now;
    }
    setCurrentDirection(direction);
    setIsMoving(!!direction);
    if (!gameWon) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [getCurrentDirection, movePlayer, speed, gameWon, speedOptions]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.add(e.key);
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.delete(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (maze.length && !gameWon) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, maze, gameWon]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleButtonDown = (direction) => {
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight'
    };
    keysPressed.current.add(keyMap[direction]);
  };

  const handleButtonUp = (direction) => {
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight'
    };
    keysPressed.current.delete(keyMap[direction]);
  };

  const getCharacterSprite = () => {
    if (!isMoving || !currentDirection) {
      return '/game-assets/images/char-idle.gif';
    }

    switch (currentDirection) {
      case 'up':
        return '/game-assets/images/char-move-up.gif';
      case 'down':
        return '/game-assets/images/char-move-down.gif';
      case 'left':
        return '/game-assets/images/char-move-left.gif';
      case 'right':
        return '/game-assets/images/char-move-right.gif';
      default:
        return '/game-assets/images/char-idle.gif';
    }
  };

  return (
    // --- JSX (unchanged) ---
    <div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-100">
      {maze.length > 0 && (
        <div className='flex-1 flex items-center w-full justify-center p-4'>
          <div
            className="grid bg-slate-800 rounded-xl p-2 shadow-2xl border-4 border-purple-300"
            style={{
              gridTemplateColumns: `repeat(${difficulties[difficulty].width}, 1.5rem)`
            }}
          >
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-6 h-6 flex items-center justify-center relative ${
                    cell === 1 ? 'bg-purple-900 border border-purple-800' : ''
                  }`}
                  style={
                    cell !== 1 && tileMap.length > 0
                      ? {
                          backgroundImage: `url(${tileMap[y][x]})`,
                          backgroundSize: 'cover',
                          imageRendering: 'pixelated',
                        }
                      : {}
                  }
                >
                  {cell === 3 && (
                    <span className="text-xl animate-pulse" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'}}>💎</span>
                  )}
                  {cell === 2 && (
                    <span className="text-xl" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'}}>🏠</span>
                  )}
                  {playerPos.x === x && playerPos.y === y && (
                    <img
                      src={getCharacterSprite()}
                      alt="Character"
                      className="w-6 h-6 object-contain z-10 drop-shadow-md"
                      style={{
                        imageRendering: 'pixelated',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <div className='flex-none flex flex-col items-center gap-6 w-96 bg-white rounded-xl p-6 shadow-lg border border-purple-200'>
        <h2 className="text-2xl font-bold text-purple-800 mb-2">Maze Adventure</h2>

        <div className="flex gap-4 flex-wrap justify-center">
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Difficulty:</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-32 border-purple-300">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Speed:</label>
            <Select value={speed} onValueChange={setSpeed}>
              <SelectTrigger className="w-32 border-purple-300">
                <SelectValue placeholder="Speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="turbo">Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={resetGame}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg transform transition hover:scale-105"
        >
          🎮 New Adventure!
        </Button>

        <div className="grid grid-cols-3 gap-3 w-52">
          <div />
          <Button
            variant="outline"
            onMouseDown={() => handleButtonDown('up')}
            onMouseUp={() => handleButtonUp('up')}
            onMouseLeave={() => handleButtonUp('up')}
            onTouchStart={() => handleButtonDown('up')}
            onTouchEnd={() => handleButtonUp('up')}
            onTouchCancel={() => handleButtonUp('up')}
            className={`text-2xl h-12 border-2 transition-all ${
              currentDirection === 'up'
                ? 'bg-purple-200 border-purple-400 shadow-lg scale-95'
                : 'border-purple-300 hover:bg-purple-50'
            }`}
          >
            ↑
          </Button>
          <div />
          <Button
            variant="outline"
            onMouseDown={() => handleButtonDown('left')}
            onMouseUp={() => handleButtonUp('left')}
            onMouseLeave={() => handleButtonUp('left')}
            onTouchStart={() => handleButtonDown('left')}
            onTouchEnd={() => handleButtonUp('left')}
            onTouchCancel={() => handleButtonUp('left')}
            className={`text-2xl h-12 border-2 transition-all ${
              currentDirection === 'left'
                ? 'bg-purple-200 border-purple-400 shadow-lg scale-95'
                : 'border-purple-300 hover:bg-purple-50'
            }`}
          >
            ←
          </Button>
          <Button
            variant="outline"
            onMouseDown={() => handleButtonDown('down')}
            onMouseUp={() => handleButtonUp('down')}
            onMouseLeave={() => handleButtonUp('down')}
            onTouchStart={() => handleButtonDown('down')}
            onTouchEnd={() => handleButtonUp('down')}
            onTouchCancel={() => handleButtonUp('down')}
            className={`text-2xl h-12 border-2 transition-all ${
              currentDirection === 'down'
                ? 'bg-purple-200 border-purple-400 shadow-lg scale-95'
                : 'border-purple-300 hover:bg-purple-50'
            }`}
          >
            ↓
          </Button>
          <Button
            variant="outline"
            onMouseDown={() => handleButtonDown('right')}
            onMouseUp={() => handleButtonUp('right')}
            onMouseLeave={() => handleButtonUp('right')}
            onTouchStart={() => handleButtonDown('right')}
            onTouchEnd={() => handleButtonUp('right')}
            onTouchCancel={() => handleButtonUp('right')}
            className={`text-2xl h-12 border-2 transition-all ${
              currentDirection === 'right'
                ? 'bg-purple-200 border-purple-400 shadow-lg scale-95'
                : 'border-purple-300 hover:bg-purple-50'
            }`}
          >
            →
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Use arrow keys or buttons to explore!</p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>🏠 Start</span>
            <span>💎 Treasure</span>
          </div>
        </div>

        {gameWon && (
          <div className="text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg animate-pulse">
            <div className="text-2xl font-bold mb-2">🎉 Victory! 🎉</div>
            <div className="text-lg">You found the treasure!</div>
            <div className="text-sm mt-2">Ready for another adventure?</div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <img
            src={getCharacterSprite()}
            alt="Current character state"
            className="w-8 h-8 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="font-medium">
            {isMoving && currentDirection ? `Moving ${currentDirection}` : 'Standing still'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MazeGame;