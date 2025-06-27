import React, { useState, useEffect } from 'react';

const PuzzleGame = () => {
  const [imageUrl, setImageUrl] = useState('https://pbs.twimg.com/media/BeNPfJNCAAAp1DW.png');
  const [inputUrl, setInputUrl] = useState('');
  const [pieces, setPieces] = useState([]);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [gridSize, setGridSize] = useState(4);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const TOTAL_PIECES = gridSize * gridSize;
  const PIECE_SIZE = 100;

  // Initialize puzzle pieces
  useEffect(() => {
    initializePuzzle();
  }, [imageUrl, gridSize]);

  const initializePuzzle = () => {
    const newPieces = [];
    for (let i = 0; i < TOTAL_PIECES; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: null,
        inSpareArea: true,
        row: Math.floor(i / gridSize),
        col: i % gridSize
      });
    }
    setPieces(shuffleArray([...newPieces]));
    setIsComplete(false);
    setImageLoaded(true);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleShuffle = () => {
    setPieces(prevPieces => {
      const sparePieces = prevPieces.filter(p => p.inSpareArea);
      const targetPieces = prevPieces.filter(p => !p.inSpareArea);
      return [...shuffleArray(sparePieces), ...targetPieces];
    });
    setIsComplete(false);
  };

  const handleGridSizeChange = (newSize) => {
    setGridSize(newSize);
    setIsComplete(false);
  };

  // Mouse events
  const handleDragStart = (e, piece) => {
    setDraggedPiece(piece);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Touch events
  const handleTouchStart = (e, piece) => {
    e.preventDefault();
    setDraggedPiece(piece);
    setIsDragging(true);
    
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    setTouchOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    
    // Add visual feedback
    e.target.style.opacity = '0.7';
    e.target.style.transform = 'scale(1.1)';
    e.target.style.zIndex = '1000';
    e.target.style.position = 'fixed';
    e.target.style.pointerEvents = 'none';
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !draggedPiece) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const draggedElement = document.querySelector(`[data-piece-id="${draggedPiece.id}"]`);
    
    if (draggedElement) {
      draggedElement.style.left = `${touch.clientX - touchOffset.x}px`;
      draggedElement.style.top = `${touch.clientY - touchOffset.y}px`;
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging || !draggedPiece) return;
    e.preventDefault();
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Reset dragged element styles
    const draggedElement = document.querySelector(`[data-piece-id="${draggedPiece.id}"]`);
    if (draggedElement) {
      draggedElement.style.opacity = '1';
      draggedElement.style.transform = 'scale(1)';
      draggedElement.style.zIndex = 'auto';
      draggedElement.style.position = 'static';
      draggedElement.style.pointerEvents = 'auto';
      draggedElement.style.left = 'auto';
      draggedElement.style.top = 'auto';
    }
    
    // Check if dropped on target area
    if (elementBelow && elementBelow.classList.contains('drop-target')) {
      const targetPosition = parseInt(elementBelow.dataset.position);
      handlePieceDrop(targetPosition);
    } else if (elementBelow && elementBelow.classList.contains('spare-area')) {
      handlePieceDropOnSpare();
    }
    
    setIsDragging(false);
    setDraggedPiece(null);
  };

  const handleDropOnTarget = (e, targetPosition) => {
    e.preventDefault();
    if (!draggedPiece) return;
    handlePieceDrop(targetPosition);
  };

  const handleDropOnSpare = (e) => {
    e.preventDefault();
    if (!draggedPiece || draggedPiece.inSpareArea) return;
    handlePieceDropOnSpare();
  };

  const handlePieceDrop = (targetPosition) => {
    setPieces(prevPieces => {
      const newPieces = prevPieces.map(piece => {
        if (piece.id === draggedPiece.id) {
          return {
            ...piece,
            currentPosition: targetPosition,
            inSpareArea: false
          };
        }
        // If there's already a piece in the target position, move it back to spare
        if (piece.currentPosition === targetPosition && piece.id !== draggedPiece.id) {
          return {
            ...piece,
            currentPosition: null,
            inSpareArea: true
          };
        }
        return piece;
      });

      // Check if puzzle is complete
      checkCompletion(newPieces);
      return newPieces;
    });
    setDraggedPiece(null);
  };

  const handlePieceDropOnSpare = () => {
    setPieces(prevPieces => {
      return prevPieces.map(piece => {
        if (piece.id === draggedPiece.id) {
          return {
            ...piece,
            currentPosition: null,
            inSpareArea: true
          };
        }
        return piece;
      });
    });
    setDraggedPiece(null);
    setIsComplete(false);
  };

  const checkCompletion = (currentPieces) => {
    const isCompleted = currentPieces.every(
      piece => piece.currentPosition === piece.correctPosition
    );
    setIsComplete(isCompleted);
  };

  const handleImageSubmit = (e) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setImageUrl(inputUrl);
      setImageLoaded(false);
    }
  };

  const PuzzlePiece = ({ piece }) => {
    const imageSize = PIECE_SIZE * gridSize;

    return (
      <div
        data-piece-id={piece.id}
        draggable
        onDragStart={(e) => handleDragStart(e, piece)}
        onDragEnd={handleDragEnd}
        onTouchStart={(e) => handleTouchStart(e, piece)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="cursor-move transition-all duration-200 hover:scale-105 hover:shadow-lg select-none touch-none"
        style={{
          width: `${PIECE_SIZE}px`,
          height: `${PIECE_SIZE}px`,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${imageSize}px ${imageSize}px`,
          backgroundPosition: `-${piece.col * PIECE_SIZE}px -${piece.row * PIECE_SIZE}px`,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Touch-Friendly Puzzle Game</h1>

          {/* Image URL Input */}
          <form onSubmit={handleImageSubmit} className="max-w-2xl mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter image URL (or use default)"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Load Image
              </button>
            </div>
          </form>

          {/* Grid Size Controls */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puzzle Difficulty: {gridSize}x{gridSize} ({TOTAL_PIECES} pieces)
            </label>
            <div className="flex justify-center gap-2 flex-wrap">
              {[3, 4, 5, 6].map(size => (
                <button
                  key={size}
                  onClick={() => handleGridSizeChange(size)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    gridSize === size
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={handleShuffle}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >
            Shuffle Pieces
          </button>
        </div>

        {/* Completion Message */}
        {isComplete && (
          <div className="text-center mb-6 animate-bounce">
            <div className="inline-block px-8 py-4 bg-green-500 text-white rounded-lg shadow-lg">
              <p className="text-xl font-bold">🎉 Congratulations! Puzzle Completed! 🎉</p>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spare Area */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Puzzle Pieces</h2>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropOnSpare}
              className="spare-area min-h-[450px] bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300"
            >
              <div className="flex flex-wrap gap-3">
                {pieces.filter(p => p.inSpareArea).map(piece => (
                  <PuzzlePiece key={piece.id} piece={piece} />
                ))}
              </div>
            </div>
          </div>

          {/* Target Area */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Target Area</h2>
            <div className="inline-block bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
              <div
                className="grid gap-1"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  width: `${(PIECE_SIZE + 4) * gridSize}px`,
                  height: `${(PIECE_SIZE + 4) * gridSize}px`
                }}
              >
                {Array.from({ length: TOTAL_PIECES }).map((_, index) => {
                  const piece = pieces.find(p => p.currentPosition === index);
                  return (
                    <div
                      key={index}
                      data-position={index}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnTarget(e, index)}
                      className="drop-target relative bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center"
                      style={{ width: `${PIECE_SIZE}px`, height: `${PIECE_SIZE}px` }}
                    >
                      {piece && <PuzzlePiece piece={piece} />}
                      {!piece && (
                        <span className="text-gray-400 text-sm font-medium">
                          {index + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">Drag or touch and drag pieces from the left to complete the puzzle on the right.</p>
          <p className="mb-2">Change the grid size to adjust difficulty level.</p>
          <p>You can drag pieces back to the spare area if needed.</p>
        </div>
      </div>
    </div>
  );
};

export default PuzzleGame;