import React, { useState, useEffect } from 'react';

const PuzzleGame = () => {
  const [imageUrl, setImageUrl] = useState('https://pbs.twimg.com/media/BeNPfJNCAAAp1DW.png');
  const [inputUrl, setInputUrl] = useState('');
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [gridSize, setGridSize] = useState(4);

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

  // Click-to-select system
  const handlePieceClick = (piece) => {
    if (selectedPiece && selectedPiece.id === piece.id) {
      // Clicking the same piece deselects it
      setSelectedPiece(null);
    } else {
      // Select the piece
      setSelectedPiece(piece);
    }
  };

  const handleTargetClick = (targetPosition) => {
    if (!selectedPiece) return;

    setPieces(prevPieces => {
      const newPieces = prevPieces.map(piece => {
        if (piece.id === selectedPiece.id) {
          return {
            ...piece,
            currentPosition: targetPosition,
            inSpareArea: false
          };
        }
        // If there's already a piece in the target position, move it back to spare
        if (piece.currentPosition === targetPosition && piece.id !== selectedPiece.id) {
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

    setSelectedPiece(null);
  };

  const handleSpareAreaClick = () => {
    if (!selectedPiece || selectedPiece.inSpareArea) return;

    setPieces(prevPieces => {
      return prevPieces.map(piece => {
        if (piece.id === selectedPiece.id) {
          return {
            ...piece,
            currentPosition: null,
            inSpareArea: true
          };
        }
        return piece;
      });
    });

    setSelectedPiece(null);
    setIsComplete(false);
  };

  const checkCompletion = (currentPieces) => {
    const isCompleted = currentPieces.every(
      piece => piece.currentPosition === piece.correctPosition
    );
    setIsComplete(isCompleted);
  };

  const handleImageSubmit = () => {
    if (inputUrl.trim()) {
      setImageUrl(inputUrl);
      setImageLoaded(false);
    }
  };

  const PuzzlePiece = ({ piece }) => {
    const imageSize = PIECE_SIZE * gridSize;
    const isSelected = selectedPiece && selectedPiece.id === piece.id;

    return (
      <div
        onClick={() => handlePieceClick(piece)}
        className={`cursor-pointer transition-all duration-200 select-none ${
          isSelected
            ? 'scale-110 shadow-xl ring-4 ring-blue-500 ring-opacity-75 z-10'
            : 'hover:scale-105 hover:shadow-lg'
        }`}
        style={{
          width: `${PIECE_SIZE}px`,
          height: `${PIECE_SIZE}px`,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${imageSize}px ${imageSize}px`,
          backgroundPosition: `-${piece.col * PIECE_SIZE}px -${piece.row * PIECE_SIZE}px`,
          borderRadius: '8px',
          boxShadow: isSelected
            ? '0 8px 25px rgba(59, 130, 246, 0.4)'
            : '0 2px 8px rgba(0,0,0,0.15)',
          border: isSelected
            ? '2px solid #3B82F6'
            : '1px solid rgba(0,0,0,0.1)',
          position: 'relative'
        }}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Click-to-Move Puzzle Game</h1>

          {/* Selection Status */}
          {/* {selectedPiece && (
            <div className="mb-4 p-3 bg-blue-100 rounded-lg inline-block">
              <p className="text-blue-800 font-medium">
                ✨ Piece selected! Click on a target position or spare area to place it.
              </p>
            </div>
          )} */}

          {/* Image URL Input */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter image URL (or use default)"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleImageSubmit();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleImageSubmit}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Load Image
              </button>
            </div>
          </div>

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
              <button
                onClick={handleShuffle}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                Shuffle Pieces
              </button>
            </div>
          </div>
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
              onClick={handleSpareAreaClick}
              className={`spare-area min-h-[450px] bg-gray-50 rounded-lg p-4 border-2 border-dashed transition-colors ${
                selectedPiece && !selectedPiece.inSpareArea
                  ? 'border-green-400 bg-green-50 cursor-pointer'
                  : 'border-gray-300'
              }`}
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
                  const isTargetHighlighted = selectedPiece && !piece;

                  return (
                    <div
                      key={index}
                      onClick={() => handleTargetClick(index)}
                      className={`drop-target relative rounded border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${
                        isTargetHighlighted
                          ? 'border-blue-400 bg-blue-50 scale-105'
                          : 'border-gray-400 bg-gray-200 hover:bg-gray-300'
                      }`}
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
      </div>
    </div>
  );
};

export default PuzzleGame;