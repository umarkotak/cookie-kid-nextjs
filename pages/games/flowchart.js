import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';

const FlowchartPuzzleGame = () => {
  // Game state
  const [gridSize, setGridSize] = useState(6);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [startPos] = useState({ x: 0, y: 0 });
  const [obstacles, setObstacles] = useState([
    { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 4, y: 3 }, { x: 1, y: 4 }
  ]);
  const [finishPos] = useState({ x: 5, y: 5 });
  const [commandSequence, setCommandSequence] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(-1);
  const [message, setMessage] = useState('');
  const [hasRun, setHasRun] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Game mode state
  const [gameMode, setGameMode] = useState('default');
  const [starPos, setStarPos] = useState({ x: 3, y: 3 });
  const [hasCollectedStar, setHasCollectedStar] = useState(false);

  // Available commands
  const commands = [
    { id: 'right', label: 'Move Right', icon: '→', colorClass: 'bg-blue-500' },
    { id: 'up', label: 'Move Up', icon: '↑', colorClass: 'bg-green-500' },
    { id: 'left', label: 'Move Left', icon: '←', colorClass: 'bg-yellow-500' },
    { id: 'down', label: 'Move Down', icon: '↓', colorClass: 'bg-red-500' }
  ];

  // Generate random obstacles
  const generateRandomObstacles = () => {
    const newObstacles = [];
    const numObstacles = Math.floor(gridSize * gridSize * 0.15);

    for (let i = 0; i < numObstacles; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
      } while (
        (x === startPos.x && y === startPos.y) ||
        (x === (gridSize === 6 ? finishPos.x : gridSize - 1) && y === (gridSize === 6 ? finishPos.y : gridSize - 1)) ||
        newObstacles.some(obs => obs.x === x && obs.y === y) ||
        (gameMode === 'star' && x === starPos.x && y === starPos.y)
      );
      newObstacles.push({ x, y });
    }

    return newObstacles;
  };

  // Generate random star position
  const generateRandomStarPosition = () => {
    let x, y;
    do {
      x = Math.floor(Math.random() * gridSize);
      y = Math.floor(Math.random() * gridSize);
    } while (
      (x === startPos.x && y === startPos.y) ||
      (x === (gridSize === 6 ? finishPos.x : gridSize - 1) && y === (gridSize === 6 ? finishPos.y : gridSize - 1))
    );
    return { x, y };
  };

  // Add command to sequence
  const addCommand = (command) => {
    if (isRunning) return;
    setCommandSequence([...commandSequence, { ...command, uniqueId: Date.now() }]);
  };

  // Regenerate obstacles function
  const regenerateObstacles = () => {
    if (gameMode === 'star') {
      const newStarPos = generateRandomStarPosition();
      setStarPos(newStarPos);
    }
    const newObstacles = generateRandomObstacles();
    setObstacles(newObstacles);
    setPlayerPos(startPos);
    setCommandSequence([]);
    setHasWon(false);
    setHasCollectedStar(false);
    setMessage('');
    setHasRun(false);
  };

  // Reset game
  const resetGame = () => {
    setPlayerPos(startPos);
    setIsRunning(false);
    setHasWon(false);
    setHasCollectedStar(false);
    setCurrentCommandIndex(-1);
    setMessage('');
    setHasRun(false);
  };

  // Clear all commands
  const clearCommands = () => {
    if (isRunning) return;
    setCommandSequence([]);
  };

  // Check if position is valid
  const isValidPosition = (x, y) => {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return false;
    return !obstacles.some(obs => obs.x === x && obs.y === y);
  };

  // Execute commands
  const executeCommands = async () => {
    if (commandSequence.length === 0) {
      setMessage('Add some commands first!');
      return;
    }

    setIsRunning(true);
    setHasWon(false);
    setMessage('');

    let currentPos = { ...playerPos };

    for (let i = 0; i < commandSequence.length; i++) {
      setCurrentCommandIndex(i);
      const command = commandSequence[i];
      let newPos = { ...currentPos };

      switch (command.id) {
        case 'right':
          newPos.x += 1;
          break;
        case 'left':
          newPos.x -= 1;
          break;
        case 'up':
          newPos.y -= 1;
          break;
        case 'down':
          newPos.y += 1;
          break;
      }

      if (isValidPosition(newPos.x, newPos.y)) {
        currentPos = newPos;
        setPlayerPos(newPos);

        // Check if player collected the star in star mode
        if (gameMode === 'star' && !hasCollectedStar && newPos.x === starPos.x && newPos.y === starPos.y) {
          setHasCollectedStar(true);
          setMessage('⭐ Star collected! Now head to the goal! 🎯');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Check win condition
        const reachedGoal = (gridSize === 6 && newPos.x === finishPos.x && newPos.y === finishPos.y) ||
                           (gridSize !== 6 && newPos.x === gridSize - 1 && newPos.y === gridSize - 1);

        if (reachedGoal) {
          if (gameMode === 'default' || (gameMode === 'star' && hasCollectedStar)) {
            setHasWon(true);
            setMessage('🎉 Congratulations! You reached the goal!');
            setIsRunning(false);
            setCurrentCommandIndex(-1);
            setHasRun(true);
            return;
          } else if (gameMode === 'star' && !hasCollectedStar) {
            setMessage('🌟 You need to collect the star first!');
            setIsRunning(false);
            setCurrentCommandIndex(-1);
            setHasRun(true);
            return;
          }
        }
      } else {
        setMessage('💥 Oops! Hit an obstacle or boundary!');
        setIsRunning(false);
        setCurrentCommandIndex(-1);
        setHasRun(true);
        return;
      }

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    setCurrentCommandIndex(-1);
    setMessage('Commands completed. Try to reach the goal! 🎯');
    setHasRun(true);
  };

  const removeCommand = (index) => {
    if (isRunning) return;
    setCommandSequence(commandSequence.filter((_, i) => i !== index));
  };

  // Update obstacles when grid size changes
  useEffect(() => {
    if (gameMode === 'star') {
      const newStarPos = generateRandomStarPosition();
      setStarPos(newStarPos);
    }
    const newObstacles = generateRandomObstacles();
    setObstacles(newObstacles);
    setPlayerPos(startPos);
    setCommandSequence([]);
    setHasWon(false);
    setHasCollectedStar(false);
    setMessage('');
    setHasRun(false);
  }, [gridSize, gameMode]);

  // Calculate dynamic cell size based on grid size and screen size
  const getGridSize = () => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) return Math.min(280, screenWidth - 40); // Small screens
      if (screenWidth < 1024) return 320; // Medium screens
      return 400; // Large screens
    }
    return 400;
  };

  const [dynamicGridSize, setDynamicGridSize] = useState(400);

  useEffect(() => {
    const handleResize = () => {
      setDynamicGridSize(getGridSize());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cellSize = Math.floor(dynamicGridSize / gridSize);
  const fontSize = Math.max(12, Math.floor(cellSize * 0.6));

  // Modal component
  const Modal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                🎮 How to Play
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🎯</span>
                    <strong className="text-purple-600 text-lg">Goal</strong>
                  </div>
                  <p className="text-gray-700">
                    <strong>Default Mode:</strong> Guide the robot 🤖 to reach the target 🎯.<br/>
                    <strong>Pick Up Star Mode:</strong> First collect the star ⭐, then reach the target 🎯.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">⚙️</span>
                    <strong className="text-blue-600 text-lg">Program</strong>
                  </div>
                  <p className="text-gray-700">
                    Click the movement commands (↑ ↓ ← →) to add them to your sequence. Plan your path carefully!
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">▶️</span>
                    <strong className="text-green-600 text-lg">Execute</strong>
                  </div>
                  <p className="text-gray-700">
                    Click the "Run" button to execute your commands and watch your robot move step by step.
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🚫</span>
                    <strong className="text-red-600 text-lg">Avoid</strong>
                  </div>
                  <p className="text-gray-700">
                    Don't hit the walls 🧱 or go out of bounds! Plan your route to avoid obstacles.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <span className="text-xl mr-2">💡</span>
                  Tips for Success
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    You can adjust the grid size (4x4 to 8x8) to change difficulty
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Use "Regenerate" to create new obstacle layouts
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Click the "×" on command blocks to remove them from your sequence
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Use "Reset" to return the robot to start and try again
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Switch between Default and Pick Up Star modes for different challenges
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Got it! Let's Play 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cell component
  const Cell = ({ x, y }) => {
    const isPlayer = playerPos.x === x && playerPos.y === y;
    const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
    const isFinish = finishPos.x === x && finishPos.y === y && gridSize === 6;
    const isCustomFinish = x === gridSize - 1 && y === gridSize - 1 && gridSize !== 6;
    const isStar = gameMode === 'star' && starPos.x === x && starPos.y === y && !hasCollectedStar;

    return (
      <div
        className={`
          border border-gray-200 flex items-center justify-center transition-all duration-300 ease-in-out
          ${isObstacle ? 'bg-gray-500' :
            isFinish || isCustomFinish ? 'bg-green-500' :
            isStar ? 'bg-yellow-200' : 'bg-white'}
          ${isPlayer ? 'scale-110 shadow-lg shadow-purple-300' : 'scale-100'}
        `}
        style={{
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          fontSize: `${fontSize}px`
        }}
      >
        {isPlayer && (gameMode === 'star' && hasCollectedStar ? '🤖⭐' : '🤖')}
        {isObstacle && '🧱'}
        {(isFinish || isCustomFinish) && '🎯'}
        {isStar && '⭐'}
      </div>
    );
  };

  return (
    <div className="font-sans p-2 sm:p-4">
      {/* Modal */}
      <Modal />

      {/* Header */}
      <div className='flex flex-row justify-between items-start sm:items-center mb-4'>
        <div className="mb-2 sm:mb-0">
          <h1 className="text-lg sm:text-xl font-bold text-accent mb-2">
            🎮 Flowchart Puzzle Game
          </h1>
          <p className="text-xs sm:text-sm">
            Click commands to program your robot's path to the goal!
          </p>
        </div>
        <div>
          <Button size="sm" onClick={() => setShowModal(true)}>
            How to play
          </Button>
        </div>
      </div>

      {/* Game Mode Selection */}

      {/* Controls */}
      <div className='flex flex-row items-stretch lg:items-center justify-between gap-2 mb-4'>
        <div className="bg-white p-1 sm:p-2 rounded shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center w-full sm:w-auto">
            <label className="mr-2 sm:mr-4 text-gray-700 font-medium text-sm">
              Grid: {gridSize}x{gridSize}
            </label>
            <input
              type="range"
              min="4"
              max="8"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              disabled={isRunning}
              className="flex-1 sm:w-24 lg:w-36 accent-purple-600"
            />
          </div>
          <button
            onClick={regenerateObstacles}
            disabled={isRunning}
            className={`
              bg-purple-400 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500 cursor-pointer'}
            `}
          >
            🎲 Regenerate
          </button>
        </div>

        <div className="bg-white p-1 sm:p-2 rounded shadow-sm">
          <div className="flex items-center gap-4">
            <label className="text-gray-700 font-medium text-sm">Game Mode:</label>
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              disabled={isRunning}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="default">Default - Reach Goal</option>
              <option value="star">Pick Up Star - Collect Star Then Reach Goal</option>
            </select>
            {gameMode === 'star' && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${hasCollectedStar ? 'text-green-600' : 'text-orange-600'}`}>
                  {hasCollectedStar ? '⭐ Star Collected!' : '⭐ Need to collect star'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-1 sm:p-2 rounded shadow-sm flex items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={executeCommands}
            disabled={isRunning || commandSequence.length === 0 || hasRun}
            className={`
              bg-purple-600 text-white px-3 py-2 rounded text-xs sm:text-sm font-bold
              transition-all duration-200 whitespace-nowrap
              ${isRunning || commandSequence.length === 0 || hasRun
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-purple-700 cursor-pointer'}
            `}
          >
            {isRunning ? 'Running...' : 'Run'} ▶
          </button>
          <button
            onClick={resetGame}
            className="bg-red-500 text-white px-3 py-2 rounded text-xs sm:text-sm font-bold cursor-pointer hover:bg-red-600 transition-all duration-200"
          >
            Reset 🔄
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
        {/* Available Commands */}
        <div className='lg:col-span-3 order-2 lg:order-1'>
          <div className="p-3 rounded shadow-lg bg-white text-primary">
            <h2 className="mb-3 font-semibold text-sm sm:text-base">
              Available Commands
            </h2>
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
              {commands.map(command => (
                <button
                  key={command.id}
                  onClick={() => addCommand(command)}
                  disabled={isRunning}
                  className={`
                    ${command.colorClass} text-white p-2 sm:p-3 rounded cursor-pointer
                    flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-medium transition-all duration-200
                    hover:scale-105 select-none disabled:opacity-50 disabled:cursor-not-allowed
                    ${isRunning ? 'pointer-events-none' : ''}
                  `}
                >
                  <span className="text-base sm:text-xl">{command.icon}</span>
                  <span className="hidden sm:inline lg:inline">{command.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Command Sequence */}
        <div className='lg:col-span-4 order-3 lg:order-2'>
          <div className="p-3 rounded shadow-lg bg-white text-primary">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-sm sm:text-base">
                Command Sequence ({commandSequence.length})
              </h2>
              <button
                onClick={clearCommands}
                disabled={isRunning || commandSequence.length === 0}
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
            <div className="bg-gray-100 rounded-lg p-2 min-h-32 border-2 border-dashed border-gray-300 max-h-[200px] sm:max-h-[300px] lg:max-h-[400px] overflow-auto">
              {commandSequence.length === 0 ? (
                <p className="text-center text-gray-400 my-8 text-xs sm:text-sm">
                  Click commands to add them here
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {commandSequence.map((cmd, index) => (
                    <div
                      key={cmd.uniqueId}
                      className={`
                        ${cmd.colorClass} text-white p-1.5 rounded-md
                        flex justify-between items-center gap-1 text-xs font-medium relative
                        transition-all duration-300 ease-in-out
                        ${isRunning && currentCommandIndex === index ? 'scale-110 opacity-100 ring-2 ring-white' :
                          isRunning ? 'opacity-50' : 'opacity-100'}
                      `}
                    >
                      <div className='flex gap-1 items-center flex-1 min-w-0'>
                        <span>{cmd.icon}</span>
                        <span className="truncate text-xs">{cmd.label.split(' ')[1]}</span>
                      </div>
                      <button
                        onClick={() => removeCommand(index)}
                        disabled={isRunning}
                        className="ml-1 bg-black bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer hover:bg-opacity-30 flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className='lg:col-span-5 order-1 lg:order-3'>
          <div className="bg-zinc-100 p-3 sm:p-6 rounded shadow-lg flex flex-col items-center">
            <div
              className="gap-1"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: `${dynamicGridSize}px`,
              }}
            >
              {Array.from({ length: gridSize }, (_, y) =>
                Array.from({ length: gridSize }, (_, x) => (
                  <Cell key={`${x}-${y}`} x={x} y={y} />
                ))
              )}
            </div>
          </div>
          {message && (
            <div className={`
              mt-4 p-3 rounded-lg text-center font-medium text-white animate-pulse text-sm
              ${hasWon ? 'bg-green-500' : 'bg-yellow-500'}
            `}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowchartPuzzleGame;