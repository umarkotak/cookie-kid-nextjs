import React, { useState, useEffect, useCallback, useRef } from 'react';

const GAME_WIDTH = 500;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 190;
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_SPEED = 1;

export default function FlappyBird() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [bird, setBird] = useState({ x: 100, y: 300, velocity: 0 });
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef();
  const lastPipeRef = useRef(0);

  const createPipe = useCallback((x) => {
    const gapTop = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
    return {
      x,
      topHeight: gapTop,
      bottomY: gapTop + PIPE_GAP,
      bottomHeight: GAME_HEIGHT - (gapTop + PIPE_GAP),
      passed: false,
      id: Math.random()
    };
  }, []);

  const resetGame = useCallback(() => {
    setBird({ x: 100, y: 300, velocity: 0 });
    setPipes([createPipe(GAME_WIDTH)]);
    setScore(0);
    lastPipeRef.current = 0;
  }, [createPipe]);

  const jump = useCallback(() => {
    if (gameState === 'menu') {
      setGameState('playing');
      resetGame();
    } else if (gameState === 'playing') {
      setBird(prev => ({ ...prev, velocity: JUMP_FORCE }));
    } else if (gameState === 'gameOver') {
      setGameState('menu');
    }
  }, [gameState, resetGame]);

  const checkCollision = useCallback((birdPos, pipeList) => {
    // Ground collision
    if (birdPos.y + BIRD_SIZE >= GAME_HEIGHT || birdPos.y <= 0) {
      return true;
    }

    // Pipe collision
    for (let pipe of pipeList) {
      if (
        birdPos.x + BIRD_SIZE > pipe.x &&
        birdPos.x < pipe.x + PIPE_WIDTH
      ) {
        if (
          birdPos.y < pipe.topHeight ||
          birdPos.y + BIRD_SIZE > pipe.bottomY
        ) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    setBird(prevBird => {
      const newBird = {
        ...prevBird,
        velocity: prevBird.velocity + GRAVITY,
        y: prevBird.y + prevBird.velocity + GRAVITY
      };

      setPipes(prevPipes => {
        let newPipes = prevPipes.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }));
        
        // Remove pipes that are off screen
        newPipes = newPipes.filter(pipe => pipe.x + PIPE_WIDTH > -50);
        
        // Add new pipes
        const lastPipe = newPipes[newPipes.length - 1];
        if (!lastPipe || lastPipe.x < GAME_WIDTH - 200) {
          newPipes.push(createPipe(GAME_WIDTH));
        }
        
        // Check for score
        newPipes.forEach(pipe => {
          if (!pipe.passed && pipe.x + PIPE_WIDTH < newBird.x) {
            pipe.passed = true;
            setScore(prev => prev + 1);
          }
        });

        // Check collision
        if (checkCollision(newBird, newPipes)) {
          setGameState('gameOver');
          setHighScore(prev => Math.max(prev, score));
        }

        return newPipes;
      });

      return newBird;
    });
  }, [gameState, checkCollision, createPipe, score]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, 16);
    } else {
      clearInterval(gameLoopRef.current);
    }
    
    return () => clearInterval(gameLoopRef.current);
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  const renderBird = () => (
    <div
      className="absolute bg-yellow-400 rounded-full border-2 border-orange-400 transition-transform"
      style={{
        left: bird.x,
        top: bird.y,
        width: BIRD_SIZE,
        height: BIRD_SIZE,
        transform: `rotate(${Math.min(bird.velocity * 3, 45)}deg)`
      }}
    >
      <div className="absolute top-1 left-1 w-2 h-2 bg-black rounded-full"></div>
      <div className="absolute top-1 right-2 w-1 h-3 bg-orange-500"></div>
    </div>
  );

  const renderPipes = () =>
    pipes.map(pipe => (
      <div key={pipe.id}>
        {/* Top pipe */}
        <div
          className="absolute bg-green-500 border-2 border-green-600"
          style={{
            left: pipe.x,
            top: 0,
            width: PIPE_WIDTH,
            height: pipe.topHeight
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-400 border-b-2 border-green-600"></div>
        </div>
        
        {/* Bottom pipe */}
        <div
          className="absolute bg-green-500 border-2 border-green-600"
          style={{
            left: pipe.x,
            top: pipe.bottomY,
            width: PIPE_WIDTH,
            height: pipe.bottomHeight
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-8 bg-green-400 border-t-2 border-green-600"></div>
        </div>
      </div>
    ));

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-400 p-4">
      <div className="relative">
        <div
          className="relative bg-gradient-to-b from-sky-300 to-sky-400 border-4 border-gray-800 overflow-hidden"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onClick={jump}
        >
          {/* Background clouds */}
          <div className="absolute top-10 left-10 w-16 h-10 bg-white rounded-full opacity-60"></div>
          <div className="absolute top-20 right-16 w-12 h-8 bg-white rounded-full opacity-60"></div>
          <div className="absolute top-32 left-20 w-20 h-12 bg-white rounded-full opacity-60"></div>
          
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-green-400 border-t-4 border-green-600">
            <div className="absolute top-2 left-0 right-0 h-2 bg-green-300"></div>
          </div>
          
          {gameState === 'playing' && (
            <>
              {renderBird()}
              {renderPipes()}
            </>
          )}
          
          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
              <h1 className="text-4xl font-bold mb-4 text-yellow-400">Flappy Bird</h1>
              <div className="text-center mb-6">
                <p className="text-lg mb-2">Press SPACE or click to play</p>
                <p className="text-sm opacity-75">High Score: {highScore}</p>
              </div>
            </div>
          )}
          
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white">
              <h2 className="text-3xl font-bold mb-4 text-red-400">Game Over!</h2>
              <p className="text-xl mb-2">Score: {score}</p>
              <p className="text-lg mb-4">High Score: {highScore}</p>
              <p className="text-sm opacity-75">Press SPACE or click to restart</p>
            </div>
          )}
          
          {gameState === 'playing' && (
            <div className="absolute top-4 left-4 text-2xl font-bold text-white drop-shadow-lg">
              {score}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center text-gray-700">
          <p className="text-sm">Use SPACE bar or click to jump</p>
        </div>
      </div>
    </div>
  );
}