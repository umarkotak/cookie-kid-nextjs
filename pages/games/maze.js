'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const generateMaze = (width, height) => {
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

  return maze;
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
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [gameWon, setGameWon] = useState(false);
  const [currentDirection, setCurrentDirection] = useState(null);
  const gameLoopRef = useRef(null);
  const keysPressed = useRef(new Set());
  const lastMoveTime = useRef(0);

  const resetGame = useCallback(() => {
    const { width, height } = difficulties[difficulty];
    const newMaze = generateMaze(width, height);
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setGameWon(false);
    setCurrentDirection(null);
    keysPressed.current.clear();
  }, [difficulty]);

  // Check collision with walls
  const checkCollision = useCallback((x, y) => {
    if (!maze.length) return true;
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return true;
    return maze[y][x] === 1; // Wall collision
  }, [maze]);

  // Move player with collision detection
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

      // Check collision
      if (checkCollision(newX, newY)) {
        return prevPos; // Don't move if collision
      }

      // Check if reached the end
      if (maze[newY] && maze[newY][newX] === 3) {
        setGameWon(true);
        setCurrentDirection(null);
        keysPressed.current.clear();
      }

      return { x: newX, y: newY };
    });
  }, [gameWon, checkCollision, maze]);

  // Get current movement direction based on pressed keys
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

  // Game loop for smooth movement
  const gameLoop = useCallback(() => {
    const now = Date.now();
    const direction = getCurrentDirection();

    if (direction && now - lastMoveTime.current >= speedOptions[speed]) {
      movePlayer(direction);
      lastMoveTime.current = now;
    }

    setCurrentDirection(direction);

    if (!gameWon) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [getCurrentDirection, movePlayer, speed, gameWon, speedOptions]);

  // Handle keyboard input
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

  // Start/stop game loop
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

  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Button controls
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

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {maze.length > 0 && (
        <div className='flex-1 flex items-center w-full justify-center p-4'>
          <div
            className="grid bg-gray-300 rounded-lg p-1"
            style={{
              gridTemplateColumns: `repeat(${difficulties[difficulty].width}, 1.2rem)`
            }}
          >
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-5 h-5 flex items-center justify-center ${
                    cell === 1 ? 'bg-gray-800' :
                    cell === 3 ? 'bg-green-500' :
                    cell === 2 ? 'bg-blue-100' :
                    'bg-white'
                  }`}
                >
                  {playerPos.x === x && playerPos.y === y && (
                    <div className={`w-4 h-4 rounded-full shadow transition-colors duration-150 ${
                      currentDirection ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className='flex-none flex flex-col items-center gap-4 w-96'>
        <div className="flex gap-4 flex-wrap justify-center">
          <div>
            Difficulty:
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            Speed:
            <Select value={speed} onValueChange={setSpeed}>
              <SelectTrigger className="w-32">
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

          <Button onClick={resetGame}>New Game</Button>
        </div>

        <div className="grid grid-cols-3 gap-2 w-48">
          <div />
          <Button
            variant="outline"
            onMouseDown={() => handleButtonDown('up')}
            onMouseUp={() => handleButtonUp('up')}
            onMouseLeave={() => handleButtonUp('up')}
            className={currentDirection === 'up' ? 'bg-blue-100' : ''}
          >
            ↑
          </Button>
          <div />
          <Button
            variant="outline"
            onMouseDown={() => handleButtonDown('left')}
            onMouseUp={() => handleButtonUp('left')}
            onMouseLeave={() => handleButtonUp('left')}
            className={currentDirection === 'left' ? 'bg-blue-100' : ''}
          >
            ←
          </Button>
          <Button
            variant="outline"
            onMouseDown={() => handleButtonDown('down')}
            onMouseUp={() => handleButtonUp('down')}
            onMouseLeave={() => handleButtonUp('down')}
            className={currentDirection === 'down' ? 'bg-blue-100' : ''}
          >
            ↓
          </Button>
          <Button
            variant="outline"
            onMouseDown={() => handleButtonDown('right')}
            onMouseUp={() => handleButtonUp('right')}
            onMouseLeave={() => handleButtonUp('right')}
            className={currentDirection === 'right' ? 'bg-blue-100' : ''}
          >
            →
          </Button>
        </div>

        <div className="text-center text-sm">
          <p>Use arrow keys or buttons to move</p>
          {/* <p>Current speed: {speed} | Moving: {currentDirection || 'none'}</p> */}
        </div>

        {gameWon && (
          <div className="text-lg font-bold text-green-600 animate-bounce">
            🎉 Congratulations! You won! 🎉
          </div>
        )}
      </div>

    </div>
  );
};

export default MazeGame;