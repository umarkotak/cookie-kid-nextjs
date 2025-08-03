
import React, { useState, useEffect, useRef } from 'react';

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
  const [hasRun, setHasRun] = useState(false); // New state to track if game has been run

  // Theme colors
  const colors = {
    primary: '#7C3AED',
    secondary: '#A78BFA',
    accent: '#F59E0B',
    success: '#10B981',
    danger: '#EF4444',
    obstacle: '#6B7280',
    board: '#F3F4F6',
    cell: '#FFFFFF',
    text: '#1F2937'
  };

  // Available commands
  const commands = [
    { id: 'right', label: 'Move Right', icon: '→', color: '#3B82F6' },
    { id: 'up', label: 'Move Up', icon: '↑', color: '#10B981' },
    { id: 'left', label: 'Move Left', icon: '←', color: '#F59E0B' },
    { id: 'down', label: 'Move Down', icon: '↓', color: '#EF4444' }
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
    setHasRun(false); // Reset the hasRun state
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
          setHasRun(true); // Set hasRun to true when execution completes
          return;
        }
      } else {
        setMessage('💥 Oops! Hit an obstacle or boundary!');
        setIsRunning(false);
        setCurrentCommandIndex(-1);
        setHasRun(true); // Set hasRun to true when execution completes
        return;
      }

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    setCurrentCommandIndex(-1);
    setMessage('Commands completed. Try to reach the goal! 🎯');
    setHasRun(true); // Set hasRun to true when execution completes
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

  // Cell component
  const Cell = ({ x, y }) => {
    const isPlayer = playerPos.x === x && playerPos.y === y;
    const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
    const isFinish = finishPos.x === x && finishPos.y === y && gridSize === 6;
    const isCustomFinish = x === gridSize - 1 && y === gridSize - 1 && gridSize !== 6;

    return (
      <div
        className="cell"
        style={{
          width: `${400 / gridSize}px`,
          height: `${400 / gridSize}px`,
          backgroundColor: isObstacle ? colors.obstacle : isFinish || isCustomFinish ? colors.success : colors.cell,
          border: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${300 / gridSize}px`,
          transition: 'all 0.3s ease',
          transform: isPlayer ? 'scale(1.1)' : 'scale(1)',
          boxShadow: isPlayer ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
        }}
      >
        {isPlayer && '🤖'}
        {isObstacle && '🧱'}
        {(isFinish || isCustomFinish) && '🎯'}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFBFC',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: '0.5rem'
          }}>
            🎮 Flowchart Puzzle Game
          </h1>
          <p style={{ color: colors.text, fontSize: '1.1rem' }}>
            Drag commands to program your robot's path to the goal!
          </p>
        </div>

        {/* Main Game Area */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Game Board */}
          <div>
            {/* Grid Size Control and Regenerate Button */}
            <div style={{
              marginBottom: '1rem',
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: '1rem', color: colors.text, fontWeight: '500' }}>
                  Grid Size: {gridSize}x{gridSize}
                </label>
                <input
                  type="range"
                  min="4"
                  max="8"
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  disabled={isRunning}
                  style={{
                    width: '150px',
                    accentColor: colors.primary
                  }}
                />
              </div>
              <button
                onClick={regenerateObstacles}
                disabled={isRunning}
                style={{
                  backgroundColor: colors.secondary,
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  opacity: isRunning ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                🎲 Regenerate Obstacles
              </button>
            </div>

            {/* Game Grid */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gap: '4px',
                width: '400px',
                height: '400px'
              }}>
                {Array.from({ length: gridSize }, (_, y) =>
                  Array.from({ length: gridSize }, (_, x) => (
                    <Cell key={`${x}-${y}`} x={x} y={y} />
                  ))
                )}
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: hasWon ? colors.success : colors.accent,
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '500',
                animation: 'slideIn 0.3s ease'
              }}>
                {message}
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            {/* Available Commands */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: '1rem'
              }}>
                Available Commands
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {commands.map(command => (
                  <div
                    key={command.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, command)}
                    style={{
                      backgroundColor: command.color,
                      color: 'white',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'transform 0.2s',
                      userSelect: 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{command.icon}</span>
                    {command.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Command Sequence */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              marginBottom: '1.5rem',
              minHeight: '200px'
            }}>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: '1rem'
              }}>
                Command Sequence
              </h2>
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e)}
                style={{
                  backgroundColor: colors.board,
                  borderRadius: '8px',
                  padding: '1rem',
                  minHeight: '120px',
                  border: '2px dashed #D1D5DB'
                }}
              >
                {commandSequence.length === 0 ? (
                  <p style={{
                    textAlign: 'center',
                    color: '#9CA3AF',
                    margin: '2rem 0'
                  }}>
                    Drag commands here to create your program
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {commandSequence.map((cmd, index) => (
                      <div
                        key={cmd.uniqueId}
                        style={{
                          backgroundColor: cmd.color,
                          color: 'white',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          position: 'relative',
                          opacity: isRunning && currentCommandIndex === index ? 1 : isRunning ? 0.5 : 1,
                          transform: isRunning && currentCommandIndex === index ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span>{cmd.icon}</span>
                        {cmd.label}
                        <button
                          onClick={() => removeCommand(index)}
                          disabled={isRunning}
                          style={{
                            marginLeft: '0.25rem',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            color: 'white'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={executeCommands}
                disabled={isRunning || commandSequence.length === 0 || hasRun}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: isRunning || commandSequence.length === 0 || hasRun ? 'not-allowed' : 'pointer',
                  opacity: isRunning || commandSequence.length === 0 || hasRun ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isRunning ? 'Running...' : 'Run Program'} ▶
              </button>
              <button
                onClick={resetGame}
                style={{
                  flex: 1,
                  backgroundColor: colors.danger,
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Reset 🔄
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '3rem',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: '1rem'
          }}>
            How to Play
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            color: colors.text
          }}>
            <div>
              <strong style={{ color: colors.primary }}>1. Goal:</strong>
              <p>Guide the robot 🤖 to reach the target 🎯</p>
            </div>
            <div>
              <strong style={{ color: colors.primary }}>2. Program:</strong>
              <p>Drag movement commands to create your program</p>
            </div>
            <div>
              <strong style={{ color: colors.primary }}>3. Execute:</strong>
              <p>Click "Run Program" to see your robot move</p>
            </div>
            <div>
              <strong style={{ color: colors.primary }}>4. Avoid:</strong>
              <p>Don't hit the walls 🧱 or go out of bounds!</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FlowchartPuzzleGame;

