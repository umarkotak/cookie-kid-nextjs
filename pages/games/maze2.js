import React, { useState, useEffect, useCallback, useRef } from 'react';

const MazeGame = () => {
    // --- Constants ---
    const CELL_SIZE = 30;
    const PATH = 0, WALL = 1, GOAL = 2, COIN = 3, TRAP = 4;

    // --- Game Settings ---
    const difficulties = {
        easy: { width: 11, height: 11, wallDensity: 0.2, coinDensity: 0.07, trapDensity: 0.03 },
        medium: { width: 15, height: 15, wallDensity: 0.3, coinDensity: 0.06, trapDensity: 0.04 },
        hard: { width: 19, height: 19, wallDensity: 0.4, coinDensity: 0.05, trapDensity: 0.05 }
    };

    // --- Sound Effects ---
    let moveSound
    let pickupSound
    let winSound
    let loseSound
    try {
      moveSound = useRef(new Audio('/sounds/game_flowchart_move.mp3'));
      pickupSound = useRef(new Audio('/sounds/game_flowchart_pickup_star.mp3'));
      winSound = useRef(new Audio('/sounds/game_flowchart_win.mp3'));
      loseSound = useRef(new Audio('/sounds/game_flowchart_lose.mp3'));
    } catch (e) {}

    // --- State Management ---
    const [difficulty, setDifficulty] = useState('medium');
    const [maze, setMaze] = useState([]);
    const [mazeSize, setMazeSize] = useState(difficulties.medium);
    const [player, setPlayer] = useState({ x: 1.5 * CELL_SIZE, y: 1.5 * CELL_SIZE, vx: 0, vy: 0, size: 12 });
    const [keys, setKeys] = useState({});
    const [gameWon, setGameWon] = useState(false);
    const [gameLost, setGameLost] = useState(false);
    const [coinsCollected, setCoinsCollected] = useState(0);
    const [totalCoins, setTotalCoins] = useState(0);
    const [touchStart, setTouchStart] = useState(null);

    // --- Physics Constants ---
    const ACCELERATION = 0.8;
    const FRICTION = 0.85;
    const MAX_SPEED = 4;

    // --- Maze Generation (with Coins and Traps) ---
    const generateMaze = (width, height, wallDensity, coinDensity, trapDensity) => {
        const newMaze = Array(height).fill().map(() => Array(width).fill(WALL));
        const stack = [];
        const visited = Array(height).fill().map(() => Array(width).fill(false));
        const startX = 1, startY = 1;
        newMaze[startY][startX] = PATH;
        visited[startY][startX] = true;
        stack.push([startX, startY]);

        const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];
        while (stack.length > 0) {
            const [currentX, currentY] = stack[stack.length - 1];
            const neighbors = [];
            for (const [dx, dy] of directions) {
                const newX = currentX + dx;
                const newY = currentY + dy;
                if (newX > 0 && newX < width - 1 && newY > 0 && newY < height - 1 && !visited[newY][newX]) {
                    neighbors.push([newX, newY, currentX + dx / 2, currentY + dy / 2]);
                }
            }
            if (neighbors.length > 0) {
                const [nextX, nextY, wallX, wallY] = neighbors[Math.floor(Math.random() * neighbors.length)];
                newMaze[nextY][nextX] = PATH;
                newMaze[wallY][wallX] = PATH;
                visited[nextY][nextX] = true;
                stack.push([nextX, nextY]);
            } else {
                stack.pop();
            }
        }

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (newMaze[y][x] === WALL && Math.random() < (1 - wallDensity)) {
                    newMaze[y][x] = PATH;
                }
            }
        }
        newMaze[1][1] = PATH; // Ensure start is clear

        // Place Goal first
        let goalPlaced = false;
        for (let attempts = 0; attempts < 30 && !goalPlaced; attempts++) {
            const goalX = Math.floor(width * 0.7 + Math.random() * (width * 0.25));
            const goalY = Math.floor(height * 0.7 + Math.random() * (height * 0.25));
            if (goalX < width - 1 && goalY < height - 1 && newMaze[goalY][goalX] === PATH) {
                newMaze[goalY][goalX] = GOAL;
                goalPlaced = true;
            }
        }
        if (!goalPlaced) newMaze[height - 2][width - 2] = GOAL;

        // Place Coins and Traps on empty paths
        const emptyCells = [];
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (newMaze[y][x] === PATH && !(y === 1 && x === 1)) {
                    emptyCells.push({ x, y });
                }
            }
        }
        emptyCells.sort(() => Math.random() - 0.5); // Shuffle

        const numCoins = Math.max(1, Math.floor(emptyCells.length * coinDensity));
        const numTraps = Math.floor(emptyCells.length * trapDensity);

        for (let i = 0; i < numCoins && emptyCells.length > 0; i++) {
            const { x, y } = emptyCells.pop();
            newMaze[y][x] = COIN;
        }
        for (let i = 0; i < numTraps && emptyCells.length > 0; i++) {
            const { x, y } = emptyCells.pop();
            newMaze[y][x] = TRAP;
        }

        return newMaze;
    };

    // --- Collision Detection ---
    const checkCollision = (x, y, size) => {
        const gridX1 = Math.floor((x - size / 2) / CELL_SIZE);
        const gridX2 = Math.floor((x + size / 2) / CELL_SIZE);
        const gridY1 = Math.floor((y - size / 2) / CELL_SIZE);
        const gridY2 = Math.floor((y + size / 2) / CELL_SIZE);

        const checkPoints = [[gridX1, gridY1], [gridX2, gridY1], [gridX1, gridY2], [gridX2, gridY2]];
        for (const [gx, gy] of checkPoints) {
            if (gy < 0 || gy >= mazeSize.height || gx < 0 || gx >= mazeSize.width || (maze[gy] && maze[gy][gx] === WALL)) {
                return true;
            }
        }
        return false;
    };
    
    // --- Game Logic Loop ---
    const gameLoop = useCallback(() => {
        if (gameWon || gameLost) return;

        setPlayer(prev => {
            let newVx = prev.vx;
            let newVy = prev.vy;

            if (keys['ArrowLeft'] || keys['a']) newVx -= ACCELERATION;
            if (keys['ArrowRight'] || keys['d']) newVx += ACCELERATION;
            if (keys['ArrowUp'] || keys['w']) newVy -= ACCELERATION;
            if (keys['ArrowDown'] || keys['s']) newVy += ACCELERATION;

            newVx *= FRICTION;
            newVy *= FRICTION;

            const speed = Math.sqrt(newVx * newVx + newVy * newVy);
            if (speed > MAX_SPEED) {
                newVx = (newVx / speed) * MAX_SPEED;
                newVy = (newVy / speed) * MAX_SPEED;
            }

            // --- Movement Sound Logic ---
            if (speed > 0.1 && moveSound.current.paused) {
                moveSound.current.play().catch(e => console.error("Audio play failed:", e));
            } else if (speed <= 0.1 && !moveSound.current.paused) {
                moveSound.current.pause();
            }

            let newX = prev.x + newVx;
            let newY = prev.y + newVy;

            if (checkCollision(newX, prev.y, prev.size)) {
                newX = prev.x;
                newVx = 0;
            }
            if (checkCollision(newX, newY, prev.size)) {
                newY = prev.y;
                newVy = 0;
            }
            
            // --- Check for Interactions (Coins, Traps, Goal) ---
            const gridX = Math.floor(newX / CELL_SIZE);
            const gridY = Math.floor(newY / CELL_SIZE);
            const currentCell = maze[gridY] && maze[gridY][gridX];

            if (currentCell === COIN) {
                pickupSound.current.play();
                setCoinsCollected(c => c + 1);
                const newMaze = maze.map(r => [...r]);
                newMaze[gridY][gridX] = PATH;
                setMaze(newMaze);
            } else if (currentCell === TRAP) {
                loseSound.current.play();
                setGameLost(true);
            } else if (currentCell === GOAL) {
                if (coinsCollected >= totalCoins) {
                    winSound.current.play();
                    setGameWon(true);
                }
            }

            return { ...prev, x: newX, y: newY, vx: newVx, vy: newVy };
        });
    }, [keys, gameWon, gameLost, maze, totalCoins, coinsCollected]);

    // --- Game State Management ---
    const resetGame = (newDifficulty) => {
        const diffKey = newDifficulty || difficulty;
        const newSize = difficulties[diffKey];
        const newMaze = generateMaze(newSize.width, newSize.height, newSize.wallDensity, newSize.coinDensity, newSize.trapDensity);

        setDifficulty(diffKey);
        setMazeSize(newSize);
        setMaze(newMaze);
        setTotalCoins(newMaze.flat().filter(cell => cell === COIN).length);
        setCoinsCollected(0);
        setPlayer({ x: 1.5 * CELL_SIZE, y: 1.5 * CELL_SIZE, vx: 0, vy: 0, size: 12 });
        setGameWon(false);
        setGameLost(false);
        setKeys({});
    };
    
    // --- Event Handlers ---
    const handleKeyDown = useCallback((e) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true })), []);
    const handleKeyUp = useCallback((e) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false })), []);
    const handleButtonPress = (direction) => setKeys(prev => ({ ...prev, [direction]: true }));
    const handleButtonRelease = (direction) => setKeys(prev => ({ ...prev, [direction]: false }));
    const handleTouchStart = (e, direction) => { e.preventDefault(); handleButtonPress(direction); setTouchStart(direction); };
    const handleTouchEnd = (e) => { e.preventDefault(); if (touchStart) { handleButtonRelease(touchStart); setTouchStart(null); } };

    // --- Effects ---
    useEffect(() => {
        resetGame();
        moveSound.current.loop = true;
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    useEffect(() => {
        const gameInterval = setInterval(gameLoop, 16); // ~60 FPS
        return () => clearInterval(gameInterval);
    }, [gameLoop]);

    useEffect(() => {
        if (gameWon || gameLost) {
            moveSound.current.pause();
            moveSound.current.currentTime = 0;
        }
    }, [gameWon, gameLost]);

    // --- JSX Rendering ---
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-sans">
            <div className="mb-4 text-center">
                <h1 className="text-4xl font-bold mb-2">Maze Runner</h1>
                <div className="flex justify-center items-center gap-4 mb-2">
                    <p className="text-gray-300">Difficulty:</p>
                    {Object.keys(difficulties).map((diff) => (
                        <button
                            key={diff}
                            onClick={() => resetGame(diff)}
                            className={`px-3 py-1.5 rounded transition-colors text-sm ${difficulty === diff ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                        >
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                    ))}
                </div>
                {totalCoins > 0 && <p className="text-xl text-yellow-400 font-semibold my-2">💰 Coins: {coinsCollected} / {totalCoins}</p>}
                
                {gameWon && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold text-green-400 mb-2">🎉 You Won! 🎉</p>
                        <button onClick={() => resetGame()} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">New Maze</button>
                    </div>
                )}
                {gameLost && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold text-red-500 mb-2">☠️ You Lost! ☠️</p>
                        <button onClick={() => resetGame()} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">Try Again</button>
                    </div>
                )}
            </div>

            <div className="relative border-2 border-gray-600 bg-white mx-auto shadow-2xl" style={{ width: mazeSize.width * CELL_SIZE, height: mazeSize.height * CELL_SIZE }}>
                {maze.map((row, y) =>
                    row.map((cell, x) => {
                        let content = null;
                        let bgColor = 'bg-white';
                        if (cell === WALL) bgColor = 'bg-gray-800';
                        else if (cell === GOAL) bgColor = 'bg-red-500';
                        else if (cell === COIN) content = <div className="w-2/3 h-2/3 bg-yellow-400 rounded-full animate-pulse"></div>;
                        else if (cell === TRAP) content = <div className="w-full h-full bg-red-800 flex items-center justify-center"><div className="w-1/2 h-1/2 bg-red-500 transform rotate-45"></div></div>;

                        return (
                            <div key={`${x}-${y}`} className={`absolute flex items-center justify-center ${bgColor}`}
                                style={{ left: x * CELL_SIZE, top: y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>
                                {content}
                            </div>
                        );
                    })
                )}
                <div className="absolute bg-blue-500 rounded-full" style={{ left: player.x - player.size / 2, top: player.y - player.size / 2, width: player.size, height: player.size, boxShadow: '0 0 10px rgba(59, 130, 246, 0.7)' }} />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
                <div></div>
                <button className="w-16 h-16 bg-blue-600 text-white rounded-lg text-2xl active:bg-blue-700 select-none" onTouchStart={(e) => handleTouchStart(e, 'arrowup')} onTouchEnd={handleTouchEnd}>↑</button>
                <div></div>
                <button className="w-16 h-16 bg-blue-600 text-white rounded-lg text-2xl active:bg-blue-700 select-none" onTouchStart={(e) => handleTouchStart(e, 'arrowleft')} onTouchEnd={handleTouchEnd}>←</button>
                <div></div>
                <button className="w-16 h-16 bg-blue-600 text-white rounded-lg text-2xl active:bg-blue-700 select-none" onTouchStart={(e) => handleTouchStart(e, 'arrowright')} onTouchEnd={handleTouchEnd}>→</button>
                <div></div>
                <button className="w-16 h-16 bg-blue-600 text-white rounded-lg text-2xl active:bg-blue-700 select-none" onTouchStart={(e) => handleTouchStart(e, 'arrowdown')} onTouchEnd={handleTouchEnd}>↓</button>
                <div></div>
            </div>
        </div>
    );
};

export default MazeGame;