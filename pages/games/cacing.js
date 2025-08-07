import React, { useState, useEffect, useCallback, useRef } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SEGMENT_SIZE = 20;
const INITIAL_SPEED = 150;
const ACCELERATION = 0.5;
const MAX_SPEED = 300;
const FRICTION = 0.98;

const LEVELS = {
  easy: { 
    name: 'Easy - No Obstacles', 
    obstacles: [] 
  },
  hard: { 
    name: 'Hard - With Obstacles', 
    obstacles: [
      { x: 150, y: 150, width: 60, height: 20 },
      // { x: 400, y: 250, width: 20, height: 80 },
      // { x: 600, y: 400, width: 80, height: 20 },
      // { x: 200, y: 450, width: 100, height: 20 }
    ] 
  }
};

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  
  const [gameState, setGameState] = useState('menu');
  const [level, setLevel] = useState('easy');
  const [score, setScore] = useState(0);
  
  // Physics state
  const [snake, setSnake] = useState([
    { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0 }
  ]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [currentSpeed, setCurrentSpeed] = useState(INITIAL_SPEED);
  const [food, setFood] = useState({ x: 300, y: 200, radius: 10 });
  const [keys, setKeys] = useState({});

  // Generate random food position
  const generateFood = useCallback(() => {
    const obstacles = LEVELS[level].obstacles;
    let newFood;
    let attempts = 0;
    
    do {
      newFood = {
        x: Math.random() * (CANVAS_WIDTH - 40) + 20,
        y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
        radius: 10
      };
      attempts++;
    } while (attempts < 100 && (
      // Check collision with snake
      snake.some(segment => 
        Math.sqrt((segment.x - newFood.x) ** 2 + (segment.y - newFood.y) ** 2) < 30
      ) ||
      // Check collision with obstacles
      obstacles.some(obstacle => 
        newFood.x > obstacle.x - 20 && 
        newFood.x < obstacle.x + obstacle.width + 20 &&
        newFood.y > obstacle.y - 20 && 
        newFood.y < obstacle.y + obstacle.height + 20
      )
    ));
    
    return newFood;
  }, [snake, level]);

  // Check collision between circle and rectangle
  const circleRectCollision = (circle, rect) => {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const distance = Math.sqrt((circle.x - closestX) ** 2 + (circle.y - closestY) ** 2);
    return distance < SEGMENT_SIZE / 2;
  };

  // Check collision between two circles
  const circleCollision = (c1, c2, r1 = SEGMENT_SIZE / 2, r2 = SEGMENT_SIZE / 2) => {
    const distance = Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
    return distance < r1 + r2;
  };

  // Physics update function
  const updatePhysics = useCallback((deltaTime) => {
    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      // Apply input to velocity
      const inputStrength = currentSpeed * deltaTime * 0.001;
      head.vx += direction.x * inputStrength;
      head.vy += direction.y * inputStrength;
      
      // Apply friction
      head.vx *= FRICTION;
      head.vy *= FRICTION;
      
      // Limit speed
      const speed = Math.sqrt(head.vx ** 2 + head.vy ** 2);
      if (speed > MAX_SPEED * deltaTime * 0.001) {
        const ratio = (MAX_SPEED * deltaTime * 0.001) / speed;
        head.vx *= ratio;
        head.vy *= ratio;
      }
      
      // Update position
      head.x += head.vx;
      head.y += head.vy;
      
      // Wrap around edges
      if (head.x < -SEGMENT_SIZE / 2) head.x = CANVAS_WIDTH + SEGMENT_SIZE / 2;
      if (head.x > CANVAS_WIDTH + SEGMENT_SIZE / 2) head.x = -SEGMENT_SIZE / 2;
      if (head.y < -SEGMENT_SIZE / 2) head.y = CANVAS_HEIGHT + SEGMENT_SIZE / 2;
      if (head.y > CANVAS_HEIGHT + SEGMENT_SIZE / 2) head.y = -SEGMENT_SIZE / 2;
      
      // Check collision with obstacles
      const obstacles = LEVELS[level].obstacles;
      for (const obstacle of obstacles) {
        if (circleRectCollision(head, obstacle)) {
          setGameState('gameOver');
          return currentSnake;
        }
      }
      
      // Check self collision (skip first segment)
      for (let i = 3; i < newSnake.length; i++) {
        if (circleCollision(head, newSnake[i])) {
          setGameState('gameOver');
          return currentSnake;
        }
      }
      
      newSnake[0] = head;
      
      // Update body segments to follow
      for (let i = 1; i < newSnake.length; i++) {
        const current = newSnake[i];
        const target = newSnake[i - 1];
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (distance > SEGMENT_SIZE * 1.5) {
          const ratio = 0.1; // Follow smoothly
          current.x += dx * ratio;
          current.y += dy * ratio;
        }
      }
      
      // Check food collision
      if (circleCollision(head, food, SEGMENT_SIZE / 2, food.radius)) {
        setScore(prev => prev + 10);
        setFood(generateFood());
        setCurrentSpeed(prev => Math.min(prev + ACCELERATION * 10, MAX_SPEED));
        
        // Add new segment
        const tail = newSnake[newSnake.length - 1];
        newSnake.push({ 
          x: tail.x - 20, 
          y: tail.y - 20, 
          vx: 0, 
          vy: 0 
        });
      }
      
      return newSnake;
    });
  }, [direction, currentSpeed, food, level, generateFood]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = (currentTime) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      if (deltaTime > 0) {
        updatePhysics(deltaTime);
      }
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, updatePhysics]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update direction based on keys
  useEffect(() => {
    let newDirection = { x: 0, y: 0 };
    
    if (keys['ArrowUp'] || keys['w']) newDirection.y -= 1;
    if (keys['ArrowDown'] || keys['s']) newDirection.y += 1;
    if (keys['ArrowLeft'] || keys['a']) newDirection.x -= 1;
    if (keys['ArrowRight'] || keys['d']) newDirection.x += 1;
    
    // Normalize diagonal movement
    if (newDirection.x !== 0 && newDirection.y !== 0) {
      const length = Math.sqrt(newDirection.x ** 2 + newDirection.y ** 2);
      newDirection.x /= length;
      newDirection.y /= length;
    }
    
    if (newDirection.x !== 0 || newDirection.y !== 0) {
      setDirection(newDirection);
    }
  }, [keys]);

  // Render function
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw obstacles
      ctx.fillStyle = '#374151';
      LEVELS[level].obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        // Add border
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });
      
      // Draw food
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add food glow effect
      const gradient = ctx.createRadialGradient(food.x, food.y, 0, food.x, food.y, food.radius * 2);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(food.x, food.y, food.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw snake
      snake.forEach((segment, index) => {
        // Head is larger and different color
        const radius = index === 0 ? SEGMENT_SIZE / 2 : SEGMENT_SIZE / 2.5;
        const color = index === 0 ? '#10b981' : '#34d399';
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = index === 0 ? '#059669' : '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add eyes to head
        if (index === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(segment.x - 5, segment.y - 5, 3, 0, Math.PI * 2);
          ctx.arc(segment.x + 5, segment.y - 5, 3, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(segment.x - 5, segment.y - 5, 1.5, 0, Math.PI * 2);
          ctx.arc(segment.x + 5, segment.y - 5, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      requestAnimationFrame(render);
    };
    
    render();
  }, [gameState, snake, food, level]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setSnake([{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0 }]);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setCurrentSpeed(INITIAL_SPEED);
    setFood(generateFood());
  };

  // Reset to menu
  const goToMenu = () => {
    setGameState('menu');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-green-400">Physics Snake</h1>

      {gameState === 'menu' && (
        <div className="text-center">
          <h2 className="text-2xl mb-6">Select Level</h2>
          <div className="space-y-4 mb-8">
            {Object.entries(LEVELS).map(([key, levelData]) => (
              <div
                key={key}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  level === key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setLevel(key)}
              >
                {levelData.name}
              </div>
            ))}
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-semibold transition-colors"
          >
            Start Game
          </button>
          <div className="mt-6 text-gray-400 text-sm">
            <p>Use Arrow Keys or WASD to move</p>
            <p>Smooth physics-based movement</p>
            <p>Snake wraps around edges</p>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="text-center">
          <div className="mb-4 flex justify-between items-center w-full max-w-4xl">
            <div>
              <span className="text-xl">Score: {score}</span>
              <span className="ml-8 text-lg text-gray-400">Speed: {Math.round(currentSpeed)}</span>
            </div>
            <div className="text-lg text-gray-400">
              Level: {LEVELS[level].name}
            </div>
          </div>
          
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-gray-600 rounded-lg shadow-2xl"
          />
          
          <div className="mt-4 flex justify-center space-x-4">
            <div className="text-gray-400 text-sm">
              <p>Arrow Keys / WASD: Move</p>
              <p>Physics: Acceleration, Friction, Smooth Movement</p>
            </div>
          </div>
          
          <button
            onClick={goToMenu}
            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
          >
            Back to Menu
          </button>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="text-center">
          <h2 className="text-3xl mb-4 text-red-400">Game Over!</h2>
          <p className="text-xl mb-2">Final Score: {score}</p>
          <p className="text-lg mb-6 text-gray-400">Top Speed: {Math.round(currentSpeed)}</p>
          <div className="space-x-4">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-lg font-semibold transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={goToMenu}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-lg font-semibold transition-colors"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;