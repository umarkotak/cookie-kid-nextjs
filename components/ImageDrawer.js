import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Eraser, Undo, Redo, Trash2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const ImageDrawer = ({
  imageUrl, className, onImageLoad, bookID, bookContentID,
}) => {

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('draw'); // 'draw' or 'erase'
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [opacity, setOpacity] = useState(0.88);

  // Zoom and pan states
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [imageNaturalWidth, setImageNaturalWidth] = useState(0);
  const [imageNaturalHeight, setImageNaturalHeight] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const searchParams = useSearchParams();

  // Default color palette
  const defaultColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'
  ];

  const storageKey = `drawing_${imageUrl}`;

  // Load from localStorage on mount
  useEffect(() => {
    const savedStrokes = localStorage.getItem(storageKey);
    if (savedStrokes) {
      setStrokes(JSON.parse(savedStrokes));
    }
  }, [searchParams, storageKey]);

  // Save to localStorage on strokes change (also clear when empty)
  useEffect(() => {
    if (strokes.length <= 0) {
      return
    }

    localStorage.setItem(storageKey, JSON.stringify(strokes));
  }, [strokes, storageKey]);

  // Handle image load to get natural dimensions
  const handleImageLoad = (e) => {
    const img = e.target;
    setImageNaturalWidth(img.naturalWidth);
    setImageNaturalHeight(img.naturalHeight);
    if (onImageLoad) onImageLoad(e);
  };

  // Calculate canvas dimensions based on container and image aspect ratio
  const getCanvasDimensions = () => {
    if (!containerRef.current || !imageNaturalWidth || !imageNaturalHeight) {
      return { width: 800, height: 600 };
    }

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let canvasWidth, canvasHeight;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider relative to container
      canvasWidth = containerWidth;
      canvasHeight = containerWidth / imageAspectRatio;
    } else {
      // Image is taller relative to container
      canvasHeight = containerHeight;
      canvasWidth = containerHeight * imageAspectRatio;
    }

    return { width: canvasWidth, height: canvasHeight };
  };

  // Handle resize and redraw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      if (containerRef.current && imageNaturalWidth && imageNaturalHeight) {
        const { width, height } = getCanvasDimensions();
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        drawAll(ctx);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [strokes, currentPath, tool, color, brushSize, opacity, imageNaturalWidth, imageNaturalHeight]);

  // Pinch zoom handling
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    let initialDistance = 0;
    let initialZoom = 1;

    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getDistance(e.touches);
        initialZoom = zoom;
        setIsDrawing(false);
        setCurrentPath([]);
      } else if (e.touches.length === 1 && !isDrawing) {
        // Single touch for panning (only when not drawing)
        if (zoom > 1) {
          setIsPanning(true);
          setLastPanPoint({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        const scaleChange = currentDistance / initialDistance;
        const newZoom = Math.max(0.5, Math.min(5, initialZoom * scaleChange));
        setZoom(newZoom);
      } else if (e.touches.length === 1 && isPanning && zoom > 1) {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - lastPanPoint.x;
        const deltaY = e.touches[0].clientY - lastPanPoint.y;
        setPanX(prev => prev + deltaX);
        setPanY(prev => prev + deltaY);
        setLastPanPoint({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        initialDistance = 0;
      }
      if (e.touches.length === 0) {
        setIsPanning(false);
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoom, isPanning, lastPanPoint, isDrawing]);

  const drawStrokesOnCanvas = (ctx, strokesToDraw) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    strokesToDraw.forEach((stroke) => {
      if (stroke.points.length < 1) return;
      ctx.beginPath();
      ctx.globalCompositeOperation = stroke.tool === 'erase' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = stroke.color || '#000000';
      ctx.lineWidth = stroke.relativeSize * ctx.canvas.width;
      ctx.globalAlpha = stroke.opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const [firstPoint, ...restPoints] = stroke.points;
      ctx.moveTo(firstPoint.x * ctx.canvas.width, firstPoint.y * ctx.canvas.height);
      restPoints.forEach((point) => {
        ctx.lineTo(point.x * ctx.canvas.width, point.y * ctx.canvas.height);
      });
      ctx.stroke();
    });
  };

  const drawAll = (ctx) => {
    drawStrokesOnCanvas(ctx, strokes);
    if (currentPath.length > 0) {
      drawStrokesOnCanvas(ctx, [
        ...strokes,
        { tool, color: tool === 'draw' ? color : undefined, relativeSize: brushSize / ctx.canvas.width, opacity, points: currentPath },
      ]);
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;

    // Account for zoom and pan
    const x = ((clientX - rect.left) / zoom - panX / zoom) / rect.width * zoom;
    const y = ((clientY - rect.top) / zoom - panY / zoom) / rect.height * zoom;
    return { x, y };
  };

  // --- Pointer-events based drawing (works for mouse, pen, touch) ---
  const startDrawing = (e) => {
    if (e.touches && e.touches.length > 1) return; // Ignore multi-touch for drawing
    if (isPanning) return; // Don't draw while panning

    e.preventDefault();
    const { x, y } = getCoordinates(e);
    setCurrentPath([{ x, y }]);
    setIsDrawing(true);
    // keep events even if finger goes outside canvas
    const canvas = canvasRef.current;
    if (canvas && e.pointerId !== undefined && canvas.setPointerCapture) {
      try { canvas.setPointerCapture(e.pointerId); } catch {}
    }
  };

  const draw = (e) => {
    if (!isDrawing || isPanning) return;
    if (e.touches && e.touches.length > 1) return; // Ignore multi-touch for drawing

    e.preventDefault();
    const { x, y } = getCoordinates(e);
    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const finishDrawing = (e) => {
    if (e) e.preventDefault();
    if (currentPath.length > 0) {
      const canvas = canvasRef.current;
      const newStroke = {
        tool,
        color: tool === 'draw' ? color : undefined,
        relativeSize: brushSize / canvas.width,
        opacity,
        points: currentPath,
      };
      setStrokes((prev) => [...prev, newStroke]);
      setRedoStack([]);
    }
    setCurrentPath([]);
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas && e?.pointerId !== undefined && canvas.releasePointerCapture) {
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    }
  };

  const undo = () => {
    if (strokes.length === 0) return;
    const lastStroke = strokes[strokes.length - 1];
    setStrokes(strokes.slice(0, -1));
    setRedoStack((prev) => [...prev, lastStroke]);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextStroke = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setStrokes((prev) => [...prev, nextStroke]);
  };

  const clearCanvas = () => {
    if (!confirm("Apakah kamu yakin untuk membersihkan halaman ini?")) { return }
    setStrokes([]);
    setRedoStack([]);
    setCurrentPath([]);
    // also clear persisted data
    localStorage.removeItem(storageKey);
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(5, prev * 1.2));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(0.5, prev / 1.2));
  };

  const resetZoom = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();

  return (
    <div className={`flex lg:flex-row flex-col h-full ${className || ''}`}>
      {/* Responsive Toolbar */}
      <div className="bg-white lg:border-r border-b lg:border-b-0 border-gray-200 shadow-sm overflow-auto lg:w-48 lg:min-w-48 lg:max-w-48 lg:h-full max-h-32 lg:max-h-none">
        <div className="lg:p-2 p-0">
          <div className="flex lg:flex-col flex-row lg:gap-6 gap-1 lg:items-stretch items-center flex-nowrap lg:flex-nowrap">
            {/* Tool Selection */}
            <div className="lg:w-full">
              <h3 className="text-sm font-medium text-gray-700 mb-2 hidden lg:block">Tools</h3>
              <div className="flex lg:flex-col flex-row bg-gray-100 rounded-lg p-1 lg:gap-1 gap-0">
                <button
                  onClick={() => {setTool('draw'); setBrushSize(2); setOpacity(0.88)}}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors lg:w-full lg:justify-start justify-center ${
                    tool === 'draw'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Pencil size={16} />
                  <span className="lg:inline hidden">Draw</span>
                </button>
                <button
                  onClick={() => {setTool('erase'); setBrushSize(50); setOpacity(1)}}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors lg:w-full lg:justify-start justify-center ${
                    tool === 'erase'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eraser size={16} />
                  <span className="lg:inline hidden">Erase</span>
                </button>
              </div>
            </div>

            {/* Color Selection */}
            {tool === 'draw' && (
              <div className="lg:w-full">
                <h3 className="text-sm font-medium text-gray-700 mb-2 hidden lg:block">Colors</h3>
                <div className="flex lg:flex-col flex-row lg:items-stretch items-center lg:gap-3 gap-2">
                  <div className="lg:grid lg:grid-cols-5 flex gap-1 p-1 bg-gray-100 rounded-lg lg:w-full w-40 overflow-auto">
                    {defaultColors.map((defaultColor) => (
                      <button
                        key={defaultColor}
                        onClick={() => setColor(defaultColor)}
                        className={`flex-none w-7 h-7 lg:w-8 lg:h-8 rounded-md border-2 transition-all hover:scale-110 ${
                          color === defaultColor ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: defaultColor }}
                        title={`Color: ${defaultColor}`}
                      />
                    ))}
                  </div>
                  <div className="lg:w-full">
                    <label className="text-xs text-gray-600 mb-1 hidden lg:block">Custom</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 lg:w-full lg:h-10 rounded-md border-2 border-gray-300 cursor-pointer"
                      title="Custom color picker"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Brush Controls */}
            <div className="lg:w-full">
              <h3 className="text-sm font-medium text-gray-700 mb-2 hidden lg:block">Brush Settings</h3>
              <div className="flex lg:flex-col flex-row lg:gap-4 gap-3">
                <div className="flex lg:flex-col flex-row lg:items-start items-center lg:gap-2 gap-2">
                  <label className="text-sm font-medium text-gray-700 lg:mb-0">Size</label>
                  <div className="flex items-center gap-2 lg:w-full">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="lg:flex-1 w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-500 lg:w-8 w-6 text-center">{brushSize}</span>
                  </div>
                </div>

                <div className="flex lg:flex-col flex-row lg:items-start items-center lg:gap-2 gap-2">
                  <label className="text-sm font-medium text-gray-700 lg:mb-0">Opacity</label>
                  <div className="flex items-center gap-2 lg:w-full">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="lg:flex-1 w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-500 lg:w-12 w-8 text-center">{Math.round(opacity * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="lg:w-full">
              <h3 className="text-sm font-medium text-gray-700 mb-2 hidden lg:block">Zoom</h3>
              <div className="flex lg:flex-col flex-row lg:gap-2 gap-1">
                <button
                  onClick={zoomIn}
                  className="lg:flex lg:items-center lg:gap-2 lg:px-3 lg:py-2 lg:text-sm lg:font-medium lg:justify-start lg:w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                  <span className="lg:inline hidden">Zoom In</span>
                </button>
                <button
                  onClick={zoomOut}
                  className="lg:flex lg:items-center lg:gap-2 lg:px-3 lg:py-2 lg:text-sm lg:font-medium lg:justify-start lg:w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                  <span className="lg:inline hidden">Zoom Out</span>
                </button>
                <button
                  onClick={resetZoom}
                  className="lg:flex lg:items-center lg:gap-2 lg:px-3 lg:py-2 lg:text-sm lg:font-medium lg:justify-start lg:w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw size={18} />
                  <span className="lg:inline hidden">Reset</span>
                </button>
                <div className="lg:block hidden text-xs text-gray-500 text-center py-1">
                  {Math.round(zoom * 100)}%
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="lg:w-full lg:ml-0 ml-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-2 hidden lg:block">Actions</h3>
              <div className="flex lg:flex-col flex-row lg:gap-2 gap-1">
                <button
                  onClick={undo}
                  disabled={strokes.length === 0}
                  className="lg:flex lg:items-center lg:gap-2 lg:px-3 lg:py-2 lg:text-sm lg:font-medium lg:justify-start lg:w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <Undo size={18} />
                  <span className="lg:inline hidden">Undo</span>
                </button>
                <button
                  onClick={redo}
                  disabled={redoStack.length === 0}
                  className="lg:flex lg:items-center lg:gap-2 lg:px-3 lg:py-2 lg:text-sm lg:font-medium lg:justify-start lg:w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <Redo size={18} />
                  <span className="lg:inline hidden">Redo</span>
                </button>
                <button
                  onClick={clearCanvas}
                  className="lg:flex lg:items-center lg:gap-2 lg:px-3 lg:py-2 lg:text-sm lg:font-medium lg:justify-start lg:w-full p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  title="Clear canvas"
                >
                  <Trash2 size={18} />
                  <span className="lg:inline hidden">Clear</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden select-none bg-gray-100 flex items-center justify-center"
        style={{ overscrollBehavior: 'none' }}
      >
        <div
          className="relative"
          style={{
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
            transformOrigin: 'center center'
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Background"
            className="block pointer-events-none select-none"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              objectFit: 'contain'
            }}
            draggable={false}
            onLoad={handleImageLoad}
            onError={handleImageLoad}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair touch-none"
            style={{
              touchAction: 'none',
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`
            }}
            onContextMenu={(e) => e.preventDefault()}
            // Pointer Events (covers mouse/pen/touch)
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={finishDrawing}
            onPointerCancel={finishDrawing}
            onPointerLeave={finishDrawing}
          />
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }

        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
          border: none;
        }

        /* Small extras so images/canvas don't get selected on iOS */
        img, canvas {
          -webkit-user-select: none;
                  user-select: none;
          -webkit-touch-callout: none;
        }
      `}</style>
    </div>
  );
};

export default ImageDrawer;