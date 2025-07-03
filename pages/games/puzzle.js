import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shuffle, Check, Sparkles, Image, Eye, EyeOff, Images } from 'lucide-react';

const PuzzleGame = () => {
  const [imageUrl, setImageUrl] = useState('https://pbs.twimg.com/media/BeNPfJNCAAAp1DW.png');
  const [inputUrl, setInputUrl] = useState('');
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [gridSize, setGridSize] = useState(4);
  const [showPreview, setShowPreview] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const TOTAL_PIECES = gridSize * gridSize;
  const PIECE_SIZE = 80;

  // Predefined image gallery
  const imageGallery = [
    {
      id: 1,
      url: 'https://pbs.twimg.com/media/BeNPfJNCAAAp1DW.png',
      title: 'Colorful Pattern',
      category: 'Abstract'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      title: 'Mountain Lake',
      category: 'Nature'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
      title: 'Forest Path',
      category: 'Nature'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop',
      title: 'Ocean Waves',
      category: 'Nature'
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&h=400&fit=crop',
      title: 'Autumn Leaves',
      category: 'Nature'
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
      title: 'Colorful Flowers',
      category: 'Nature'
    },
    {
      id: 8,
      url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
      title: 'Golden Gate Bridge',
      category: 'Architecture'
    },
    {
      id: 9,
      url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=400&fit=crop',
      title: 'Cute Cat',
      category: 'Animals'
    },
    {
      id: 10,
      url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
      title: 'Golden Retriever',
      category: 'Animals'
    },
    {
      id: 11,
      url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop',
      title: 'Butterfly',
      category: 'Animals'
    },
  ];

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

  const handleImageSelect = (selectedImageUrl) => {
    setImageUrl(selectedImageUrl);
    setImageLoaded(false);
    setIsImageModalOpen(false);
    setShowPreview(false);
  };

  // Click-to-select system
  const handlePieceClick = (piece) => {
    if (selectedPiece && selectedPiece.id === piece.id) {
      setSelectedPiece(null);
    } else {
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
        if (piece.currentPosition === targetPosition && piece.id !== selectedPiece.id) {
          return {
            ...piece,
            currentPosition: null,
            inSpareArea: true
          };
        }
        return piece;
      });

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
        className={`relative cursor-pointer transition-all duration-200 select-none rounded-md overflow-hidden ${
          isSelected
            ? 'scale-105 shadow-lg ring-2 ring-primary z-10'
            : 'hover:scale-[1.02] hover:shadow-md'
        }`}
        style={{
          width: `${PIECE_SIZE}px`,
          height: `${PIECE_SIZE}px`,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${imageSize}px ${imageSize}px`,
          backgroundPosition: `-${piece.col * PIECE_SIZE}px -${piece.row * PIECE_SIZE}px`,
          border: isSelected ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--border))'
        }}
      >
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
    );
  };

  const PreviewOverlay = () => {
    if (!showPreview) return null;

    return (
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              Completed Puzzle Preview
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="mx-auto rounded-lg overflow-hidden shadow-lg"
              style={{
                width: `${PIECE_SIZE * 3}px`,
                height: `${PIECE_SIZE * 3}px`,
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <p className="text-sm text-muted-foreground mt-3 text-center">
              This is how the completed puzzle should look
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-background to-muted/50">
      <div className="relative">
        <PreviewOverlay />
        
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">Puzzle Game</h1>
              {selectedPiece && (
                <Badge variant="secondary" className="animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Piece selected - click to place
                </Badge>
              )}
            </div>

            {/* Controls in header */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="grid-size" className="text-sm">Size:</Label>
                {[3, 4, 5, 6].map(size => (
                  <Button
                    key={size}
                    variant={gridSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGridSizeChange(size)}
                    className="w-12"
                  >
                    {size}×{size}
                  </Button>
                ))}
              </div>
              
              <Button onClick={handleShuffle} size="sm" variant="secondary">
                <Shuffle className="w-4 h-4 mr-1" />
                Shuffle
              </Button>

              <Button 
                onClick={() => setShowPreview(true)} 
                size="sm" 
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>

              <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Images className="w-4 h-4 mr-1" />
                    Change Image
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Choose an Image</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {imageGallery.map((image) => (
                      <div key={image.id} className="space-y-2">
                        <div
                          onClick={() => handleImageSelect(image.url)}
                          className="relative cursor-pointer group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                        >
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Badge variant="secondary" className="text-xs">
                                Select
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{image.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {image.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Custom URL input in modal */}
                  <div className="mt-6 pt-4 border-t">
                    <Label className="text-sm font-medium">Or use custom image URL:</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Enter image URL"
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleImageSubmit();
                            setIsImageModalOpen(false);
                          }
                        }}
                      />
                      <Button 
                        onClick={() => {
                          handleImageSubmit();
                          setIsImageModalOpen(false);
                        }} 
                        size="sm"
                      >
                        Use URL
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {isComplete && (
          <div className="mb-4 text-center">
            <Badge className="text-base px-4 py-2 bg-green-500 hover:bg-green-500 animate-bounce">
              🎉 Puzzle Completed! 🎉
            </Badge>
          </div>
        )}

        {/* Main Game Area - Horizontal Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Puzzle Pieces - Left Side */}
          <div className="xl:col-span-2">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pieces ({pieces.filter(p => p.inSpareArea).length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onClick={handleSpareAreaClick}
                  className={`min-h-[300px] bg-muted/30 rounded-lg p-3 border-2 border-dashed transition-colors ${
                    selectedPiece && !selectedPiece.inSpareArea
                      ? 'border-green-400 bg-green-50 dark:bg-green-950/20 cursor-pointer'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  <div className="flex flex-wrap gap-2">
                    {pieces.filter(p => p.inSpareArea).map(piece => (
                      <PuzzlePiece key={piece.id} piece={piece} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Target Area - Right Side */}
          <div className="xl:col-span-3">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Target Area
                  <Badge variant="outline">
                    {pieces.filter(p => !p.inSpareArea).length}/{TOTAL_PIECES}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="inline-block bg-muted/30 rounded-lg p-3 border-2 border-muted-foreground/30">
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
                          className={`relative rounded-md border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${
                            isTargetHighlighted
                              ? 'border-primary bg-primary/10 scale-105'
                              : 'border-muted-foreground/30 bg-muted/50 hover:bg-muted/80'
                          }`}
                          style={{ width: `${PIECE_SIZE}px`, height: `${PIECE_SIZE}px` }}
                        >
                          {piece && <PuzzlePiece piece={piece} />}
                          {!piece && (
                            <span className="text-muted-foreground text-xs font-medium">
                              {index + 1}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleGame;