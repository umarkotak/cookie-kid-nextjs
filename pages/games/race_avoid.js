import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

const RaceAvoidanceGame = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'gameOver'
  const [playerLane, setPlayerLane] = useState(1); // 0, 1, 2 (left, center, right)
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(2);
  const [obstacleId, setObstacleId] = useState(0);
  const [lastObstacleY, setLastObstacleY] = useState(-200);

  // Game constants - Easy to adjust
  const GAME_CONFIG = {
    LANES: [0, 1, 2],
    OBSTACLE_HEIGHT: 80,
    GAME_HEIGHT: 600,
    PLAYER_POSITION: 500, // GAME_HEIGHT - 100
    INITIAL_SPEED: 10,
    MAX_SPEED: 15,
    SPEED_INCREASE_RATE: 0.001,
    OBSTACLE_SPAWN_RATE: 0.025, // Lower = less frequent spawning
    MIN_OBSTACLE_GAP: 200, // Minimum gap between obstacles
    SCORE_PER_OBSTACLE: 10
  };

  // Move player left/right
  const movePlayer = useCallback((direction) => {
    if (gameState !== 'playing') return;

    setPlayerLane(prev => {
      if (direction === 'left' && prev > 0) return prev - 1;
      if (direction === 'right' && prev < 2) return prev + 1;
      return prev;
    });
  }, [gameState]);

  // Generate random obstacle with guaranteed gap
  const generateObstacle = useCallback(() => {
    // Always ensure at least one lane is free
    const occupiedLanes = [];
    const numObstacles = Math.random() < 0.6 ? 1 : 2; // 60% chance for 1 obstacle, 40% for 2

    for (let i = 0; i < numObstacles; i++) {
      let lane;
      do {
        lane = Math.floor(Math.random() * 3);
      } while (occupiedLanes.includes(lane));

      occupiedLanes.push(lane);
    }

    // Create obstacles for occupied lanes
    return occupiedLanes.map((lane, index) => ({
      id: obstacleId + index,
      lane: lane,
      y: -GAME_CONFIG.OBSTACLE_HEIGHT,
      passed: false
    }));
  }, [obstacleId]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setObstacles([]);
    setPlayerLane(1);
    setGameSpeed(GAME_CONFIG.INITIAL_SPEED);
    setObstacleId(0);
    setLastObstacleY(-200);
  };

  // Pause/Resume game
  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  // Reset game
  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setObstacles([]);
    setPlayerLane(1);
    setGameSpeed(GAME_CONFIG.INITIAL_SPEED);
    setLastObstacleY(-200);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        movePlayer('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        movePlayer('right');
      } else if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'playing') togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer, gameState, togglePause]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setObstacles(prev => {
        const newObstacles = prev.map(obstacle => ({
          ...obstacle,
          y: obstacle.y + gameSpeed
        })).filter(obstacle => obstacle.y < GAME_CONFIG.GAME_HEIGHT + 50);

        // Check collisions
        const collision = newObstacles.some(obstacle => {
          const obstacleBottom = obstacle.y + GAME_CONFIG.OBSTACLE_HEIGHT;
          const obstacleTop = obstacle.y;
          const playerTop = GAME_CONFIG.PLAYER_POSITION;
          const playerBottom = GAME_CONFIG.PLAYER_POSITION + 80;

          return obstacle.lane === playerLane &&
                 obstacleBottom > playerTop &&
                 obstacleTop < playerBottom;
        });

        if (collision) {
          setGameState('gameOver');
          return prev;
        }

        // Update score for passed obstacles
        newObstacles.forEach(obstacle => {
          if (!obstacle.passed && obstacle.y > GAME_CONFIG.PLAYER_POSITION) {
            obstacle.passed = true;
            setScore(s => s + GAME_CONFIG.SCORE_PER_OBSTACLE);
          }
        });

        return newObstacles;
      });

      // Spawn new obstacles with proper spacing
      const shouldSpawnObstacle = Math.random() < GAME_CONFIG.OBSTACLE_SPAWN_RATE;
      const hasEnoughGap = lastObstacleY < -GAME_CONFIG.MIN_OBSTACLE_GAP;

      if (shouldSpawnObstacle && hasEnoughGap) {
        const newObstacleGroup = generateObstacle();
        setObstacles(prev => [...prev, ...newObstacleGroup]);
        setObstacleId(prev => prev + newObstacleGroup.length);
        setLastObstacleY(0);
      } else {
        setLastObstacleY(prev => prev - gameSpeed);
      }

      // Increase game speed gradually
      setGameSpeed(prev => Math.min(prev + GAME_CONFIG.SPEED_INCREASE_RATE, GAME_CONFIG.MAX_SPEED));
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameState, playerLane, gameSpeed, generateObstacle]);

  const renderGame = () => (
    <div className="relative bg-gradient-to-b from-blue-900 to-blue-600 overflow-hidden rounded-lg"
         style={{ height: GAME_CONFIG.GAME_HEIGHT }}>

      {/* Road lanes */}
      <div className="absolute inset-0 flex">
        {GAME_CONFIG.LANES.map(lane => (
          <div key={lane} className="flex-1 border-r-2 border-yellow-400 border-dashed opacity-50">
            <div className="w-full h-full bg-gray-800 bg-opacity-20" />
          </div>
        ))}
      </div>

      {/* Player */}
      <div
        className="absolute transition-all duration-200 ease-out"
        style={{
          left: `${playerLane * 33.33 + 16.67}%`,
          top: `${GAME_CONFIG.PLAYER_POSITION}px`,
          transform: 'translateX(-50%)'
        }}
      >
        <div className="w-12 h-20 bg-gradient-to-b from-green-400 to-green-600 rounded-lg shadow-lg border-2 border-green-300">
          <div className="w-full h-3 bg-green-200 rounded-t-lg mb-1" />
          <div className="w-8 h-8 bg-green-300 rounded mx-auto mb-1" />
          <div className="w-full h-6 bg-green-500 rounded-b-lg" />
        </div>
      </div>

      {/* Obstacles */}
      {obstacles.map(obstacle => (
        <div
          key={obstacle.id}
          className="absolute transition-none"
          style={{
            left: `${obstacle.lane * 33.33 + 16.67}%`,
            top: `${obstacle.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="w-12 h-20 bg-gradient-to-b from-red-500 to-red-700 rounded-lg shadow-lg border-2 border-red-400">
            <div className="w-full h-3 bg-red-300 rounded-t-lg mb-1" />
            <div className="w-8 h-8 bg-red-400 rounded mx-auto mb-1" />
            <div className="w-full h-6 bg-red-600 rounded-b-lg" />
          </div>
        </div>
      ))}

      {/* Game UI */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          Score: {score}
        </div>
        <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          Speed: {gameSpeed.toFixed(1)}x
        </div>
      </div>

      {/* Pause overlay */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
            <Button onClick={togglePause} className="mx-2">
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Game Area */}
        {gameState === 'menu' ? (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Race?</h2>
            <p className="text-gray-600 mb-6">
              Use arrow keys or buttons to move left/right. Avoid the red obstacles!
            </p>
            <Button onClick={startGame} size="lg" className="w-full">
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </Card>
        ) : gameState === 'gameOver' ? (
          <div className="space-y-4">
            {renderGame()}
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Game Over!</h2>
              <p className="text-xl mb-4">Final Score: {score}</p>
              <div className="flex gap-2">
                <Button onClick={startGame} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Button onClick={resetGame} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Menu
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {renderGame()}

            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => movePlayer('left')}
                disabled={gameState !== 'playing'}
                size="lg"
                className="w-20 h-20"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              <Button
                onClick={togglePause}
                size="lg"
                variant="outline"
                className="w-20 h-20"
              >
                {gameState === 'playing' ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>

              <Button
                onClick={() => movePlayer('right')}
                disabled={gameState !== 'playing'}
                size="lg"
                className="w-20 h-20"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>

            {/* Instructions */}
            <Card className="p-4 text-center text-sm text-gray-600">
              <p>Use ← → arrow keys or A/D keys to move</p>
              <p>Press SPACE to pause/resume</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaceAvoidanceGame;