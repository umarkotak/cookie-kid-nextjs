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
  const [draggedCommand, setDraggedCommand] = useState(null);
  const [message, setMessage] = useState('');
  const [hasRun, setHasRun] = useState(false);

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
        newObstacles.some(obs => obs.x === x && obs.y === y)
      );
      newObstacles.push({ x, y });
    }

    return newObstacles;
  };

  // Regenerate obstacles function
  const regenerateObstacles = () => {
    const newObstacles = generateRandomObstacles();
    setObstacles(newObstacles);
    setPlayerPos(startPos);
    setCommandSequence([]);
    setHasWon(false);
    setMessage('');
    setHasRun(false);
  };

  // Reset game
  const resetGame = () => {
    setPlayerPos(startPos);
    setIsRunning(false);
    setHasWon(false);
    setCurrentCommandIndex(-1);
    setMessage('');
    setHasRun(false);
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

        // Check win condition
        if ((gridSize === 6 && newPos.x === finishPos.x && newPos.y === finishPos.y) ||
            (gridSize !== 6 && newPos.x === gridSize - 1 && newPos.y === gridSize - 1)) {
          setHasWon(true);
          setMessage('🎉 Congratulations! You reached the goal!');
          setIsRunning(false);
          setCurrentCommandIndex(-1);
          setHasRun(true);
          return;
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

  // Drag and drop handlers
  const handleDragStart = (e, command) => {
    setDraggedCommand(command);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e, index = null) => {
    e.preventDefault();
    if (!draggedCommand) return;

    if (index !== null) {
      // Dropping at specific position
      const newSequence = [...commandSequence];
      newSequence.splice(index, 0, { ...draggedCommand, uniqueId: Date.now() });
      setCommandSequence(newSequence);
    } else {
      // Dropping at end
      setCommandSequence([...commandSequence, { ...draggedCommand, uniqueId: Date.now() }]);
    }
    setDraggedCommand(null);
  };

  const removeCommand = (index) => {
    setCommandSequence(commandSequence.filter((_, i) => i !== index));
  };

  // Update obstacles when grid size changes
  useEffect(() => {
    const newObstacles = generateRandomObstacles();
    setObstacles(newObstacles);
    setPlayerPos(startPos);
    setCommandSequence([]);
    setHasWon(false);
    setMessage('');
    setHasRun(false);
  }, [gridSize]);

  // Calculate dynamic cell size based on grid size
  const cellSize = Math.floor(400 / gridSize);
  const fontSize = Math.floor(300 / gridSize);

  // Cell component
  const Cell = ({ x, y }) => {
    const isPlayer = playerPos.x === x && playerPos.y === y;
    const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
    const isFinish = finishPos.x === x && finishPos.y === y && gridSize === 6;
    const isCustomFinish = x === gridSize - 1 && y === gridSize - 1 && gridSize !== 6;

    return (
      <div
        className={`
          border border-gray-200 flex items-center justify-center transition-all duration-300 ease-in-out
          ${isObstacle ? 'bg-gray-500' : isFinish || isCustomFinish ? 'bg-green-500' : 'bg-white'}
          ${isPlayer ? 'scale-110 shadow-lg shadow-purple-300' : 'scale-100'}
        `}
        style={{
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          fontSize: `${fontSize}px`
        }}
      >
        {isPlayer && '🤖'}
        {isObstacle && '🧱'}
        {(isFinish || isCustomFinish) && '🎯'}
      </div>
    );
  };

  return (
    <div className="font-sans">
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div className="mb-2">
          <h1 className="text-xl font-bold text-accent mb-2">
            🎮 Flowchart Puzzle Game
          </h1>
          <p className="text-sm">
            Drag commands to program your robot's path to the goal!
          </p>
        </div>
        <div>
          <Button size="sm">How to play</Button>
        </div>
      </div>

      <div className='flex items-center justify-between gap-2 mb-2'>
        {/* Grid Size Control and Regenerate Button */}
        <div className="bg-white p-2 rounded shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center">
            <label className="mr-4 text-gray-700 font-medium">
              Grid Size: {gridSize}x{gridSize}
            </label>
            <input
              type="range"
              min="4"
              max="8"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              disabled={isRunning}
              className="w-36 accent-purple-600"
            />
          </div>
          <button
            onClick={regenerateObstacles}
            disabled={isRunning}
            className={`
              bg-purple-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500 cursor-pointer'}
            `}
          >
            🎲 Regenerate Obstacles
          </button>
        </div>

        <div className="bg-white p-2 rounded shadow-sm flex items-center justify-between gap-4">
          <button
            onClick={executeCommands}
            disabled={isRunning || commandSequence.length === 0 || hasRun}
            className={`
              bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold
              transition-all duration-200
              ${isRunning || commandSequence.length === 0 || hasRun
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-purple-700 cursor-pointer'}
            `}
          >
            {isRunning ? 'Running...' : 'Run Program'} ▶
          </button>
          <button
            onClick={resetGame}
            className="bg-red-500 text-white px-4 py-2 rounded text-sm font-bold cursor-pointer hover:bg-red-600 transition-all duration-200"
          >
            Reset 🔄
          </button>
        </div>
      </div>

      <div className='grid grid-cols-12 gap-2'>
        {/* Available Commands */}
        <div className='col-span-2'>
          <div className="p-2 rounded shadow-lg mb-6 bg-white text-primary">
            <h2 className="mb-4">
              Available Commands
            </h2>
            <div className="flex flex-col gap-2">
              {commands.map(command => (
                <div
                  key={command.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, command)}
                  className={`
                    ${command.colorClass} text-white p-2 rounded cursor-grab
                    flex items-center gap-2 text-sm font-medium transition-transform duration-200
                    hover:scale-105 select-none
                  `}
                >
                  <span className="text-xl">{command.icon}</span>
                  {command.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Command Sequence */}
        <div className='col-span-5'>
          <div className="p-2 rounded shadow-lg mb-6 bg-white text-primary">
            <h2 className="mb-4">
              Command Sequence
            </h2>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e)}
              className="bg-gray-100 rounded-lg p-2 min-h-32 border-2 border-dashed border-gray-300 max-h-[400px] overflow-auto"
            >
              {commandSequence.length === 0 ? (
                <p className="text-center text-gray-400 my-8">
                  Drag commands here to create your program
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {commandSequence.map((cmd, index) => (
                    <div
                      key={cmd.uniqueId}
                      className={`
                        ${cmd.colorClass} text-white p-1.5 rounded-md
                        flex justify-between items-center gap-2 text-xs font-medium relative
                        transition-all duration-300 ease-in-out
                        ${isRunning && currentCommandIndex === index ? 'scale-110 opacity-100' :
                          isRunning ? 'opacity-50' : 'opacity-100'}
                      `}
                    >
                      <div className='flex gap-2'>
                        <span>{cmd.icon}</span>
                        <span>{cmd.label}</span>
                      </div>
                      <button
                        onClick={() => removeCommand(index)}
                        disabled={isRunning}
                        className="ml-1 bg-black bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer hover:bg-opacity-30"
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

        <div className='col-span-5'>
          {/* Game Grid */}
          <div className="bg-zinc-100 p-6 rounded shadow-lg">
            <div
              className="gap-1"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: '400px',
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
              mt-4 p-4 rounded-lg text-center font-medium text-white animate-pulse
              ${hasWon ? 'bg-green-500' : 'bg-yellow-500'}
            `}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 bg-white p-3 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          How to Play
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-700">
          <div>
            <strong className="text-purple-600">1. Goal:</strong>
            <p>Guide the robot 🤖 to reach the target 🎯</p>
          </div>
          <div>
            <strong className="text-purple-600">2. Program:</strong>
            <p>Drag movement commands to create your program</p>
          </div>
          <div>
            <strong className="text-purple-600">3. Execute:</strong>
            <p>Click "Run Program" to see your robot move</p>
          </div>
          <div>
            <strong className="text-purple-600">4. Avoid:</strong>
            <p>Don't hit the walls 🧱 or go out of bounds!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartPuzzleGame;