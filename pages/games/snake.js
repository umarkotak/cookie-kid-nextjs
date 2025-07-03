import React, { useState, useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const SNAKE_SIZE = 25;
const FOOD_SIZE = 16;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 8;
const MIN_SPEED = 60;

const SmoothSnakeGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(0);

  const [snake, setSnake] = useState([{ x: 300, y: 200 }]);
  const [food, setFood] = useState({ x: 450, y: 300 });
  const [direction, setDirection] = useState({ x: SNAKE_SIZE, y: 0 });
  const [nextDirection, setNextDirection] = useState({ x: SNAKE_SIZE, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    let attempts = 0;
    do {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_WIDTH - FOOD_SIZE * 2)) + FOOD_SIZE,
        y: Math.floor(Math.random() * (CANVAS_HEIGHT - FOOD_SIZE * 2)) + FOOD_SIZE
      };
      attempts++;
    } while (
      attempts < 50 &&
      currentSnake.some(segment =>
        Math.abs(segment.x - newFood.x) < SNAKE_SIZE + 10 &&
        Math.abs(segment.y - newFood.y) < SNAKE_SIZE + 10
      )
    );
    return newFood;
  }, []);

  const resetGame = () => {
    const initialSnake = [{ x: 300, y: 200 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: SNAKE_SIZE, y: 0 });
    setNextDirection({ x: SNAKE_SIZE, y: 0 });
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPlaying(true);
  };

  const changeDirection = useCallback((newDir) => {
    // Prevent reversing into itself
    if (newDir.x === -direction.x && newDir.y === -direction.y) {
      return;
    }
    setNextDirection(newDir);
  }, [direction]);

  const wrapPosition = (pos) => {
    let { x, y } = pos;

    // Wrap horizontally
    if (x < 0) x = CANVAS_WIDTH;
    if (x > CANVAS_WIDTH) x = 0;

    // Wrap vertically
    if (y < 0) y = CANVAS_HEIGHT;
    if (y > CANVAS_HEIGHT) y = 0;

    return { x, y };
  };

  const checkCollision = (head, segments) => {
    // Only check self collision - no wall collision since we wrap
    // Self collision - more forgiving hitbox
    for (let i = 4; i < segments.length; i++) {
      const segment = segments[i];
      const distance = Math.sqrt(
        Math.pow(head.x - segment.x, 2) + Math.pow(head.y - segment.y, 2)
      );
      if (distance < SNAKE_SIZE * 0.7) { // More forgiving collision
        return true;
      }
    }
    return false;
  };

  const checkFoodCollision = (head, foodPos) => {
    const distance = Math.sqrt(
      Math.pow(head.x - foodPos.x, 2) + Math.pow(head.y - foodPos.y, 2)
    );
    return distance < (SNAKE_SIZE + FOOD_SIZE) / 2;
  };

  const updateGame = useCallback((currentTime) => {
    if (!isPlaying || gameOver) return;

    if (currentTime - lastTimeRef.current < speed) {
      return;
    }
    lastTimeRef.current = currentTime;

    setSnake(currentSnake => {
      // Update direction
      const currentDirection = { ...nextDirection };
      setDirection(currentDirection);

      const newSnake = [...currentSnake];
      let head = { ...newSnake[0] };

      // Move head
      head.x += currentDirection.x;
      head.y += currentDirection.y;

      // Wrap around edges
      head = wrapPosition(head);

      // Check collisions
      if (checkCollision(head, newSnake)) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (checkFoodCollision(head, food)) {
        setFood(generateFood(newSnake));
        setScore(prevScore => prevScore + 1);
        setSpeed(prevSpeed => Math.max(MIN_SPEED, prevSpeed - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [isPlaying, gameOver, speed, nextDirection, food, generateFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas with subtle background
    ctx.fillStyle = '#020817';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Add subtle grid pattern
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Draw snake with smooth segments
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const radius = SNAKE_SIZE / 2;

      ctx.beginPath();
      ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);

      if (isHead) {
        // Head with shadcn primary colors
        const headGradient = ctx.createRadialGradient(
          segment.x, segment.y, 0,
          segment.x, segment.y, radius
        );
        headGradient.addColorStop(0, '#0ea5e9');
        headGradient.addColorStop(1, '#0284c7');
        ctx.fillStyle = headGradient;
      } else {
        // Body with muted colors
        const bodyGradient = ctx.createRadialGradient(
          segment.x, segment.y, 0,
          segment.x, segment.y, radius
        );
        bodyGradient.addColorStop(0, '#64748b');
        bodyGradient.addColorStop(1, '#475569');
        ctx.fillStyle = bodyGradient;
      }

      ctx.fill();

      // Subtle glow for modern look
      if (isHead) {
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw food with pulsing effect
    const time = Date.now() / 1000;
    const pulse = Math.sin(time * 4) * 0.1 + 1;
    const foodRadius = (FOOD_SIZE / 2) * pulse;

    ctx.beginPath();
    ctx.arc(food.x, food.y, foodRadius, 0, Math.PI * 2);

    const foodGradient = ctx.createRadialGradient(
      food.x, food.y, 0,
      food.x, food.y, foodRadius
    );
    foodGradient.addColorStop(0, '#f97316');
    foodGradient.addColorStop(1, '#ea580c');
    ctx.fillStyle = foodGradient;
    ctx.fill();

    // Food glow
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [snake, food]);

  const gameLoop = useCallback((currentTime) => {
    updateGame(currentTime);
    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, draw]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      const keyActions = {
        ArrowUp: () => changeDirection({ x: 0, y: -SNAKE_SIZE }),
        ArrowDown: () => changeDirection({ x: 0, y: SNAKE_SIZE }),
        ArrowLeft: () => changeDirection({ x: -SNAKE_SIZE, y: 0 }),
        ArrowRight: () => changeDirection({ x: SNAKE_SIZE, y: 0 }),
        ' ': () => {
          e.preventDefault();
          if (!isPlaying && !gameOver) {
            setIsPlaying(true);
          }
        }
      };

      if (keyActions[e.key]) {
        keyActions[e.key]();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [changeDirection, isPlaying, gameOver]);

  const startGame = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-background">
      <div className="flex gap-6 items-center">
        <div className="text-2xl font-semibold text-foreground">Score: {score}</div>
        <div className="text-lg text-muted-foreground">Speed: {Math.round((INITIAL_SPEED - speed + MIN_SPEED) / 10)}</div>
        <button
          onClick={resetGame}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          New Game
        </button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border border-border rounded-lg shadow-lg bg-card"
          onClick={startGame}
        />

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-2xl font-semibold text-foreground">Click to Start</div>
              <div className="text-sm text-muted-foreground">Use arrow keys to control</div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg">
            <div className="text-center space-y-4">
              <div className="text-3xl font-bold text-destructive">Game Over!</div>
              <div className="text-xl text-foreground">Final Score: {score}</div>
              <button
                onClick={resetGame}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 w-48">
        <div />
        <button
          onClick={() => changeDirection({ x: 0, y: -SNAKE_SIZE })}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
        >
          ↑
        </button>
        <div />
        <button
          onClick={() => changeDirection({ x: -SNAKE_SIZE, y: 0 })}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
        >
          ←
        </button>
        <button
          onClick={() => changeDirection({ x: 0, y: SNAKE_SIZE })}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
        >
          ↓
        </button>
        <button
          onClick={() => changeDirection({ x: SNAKE_SIZE, y: 0 })}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
        >
          →
        </button>
      </div>

      <div className="text-muted-foreground text-sm text-center max-w-md space-y-1">
        <p>Use arrow keys or buttons to control the snake.</p>
        <p>Collect orange food to grow and increase speed!</p>
        <p>Snake wraps around edges - no walls to hit!</p>
      </div>
    </div>
  );
};

export default SmoothSnakeGame;