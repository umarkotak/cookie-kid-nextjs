import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Eraser, Undo, Redo, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const ImageDrawer = ({
  imageUrl, className, onImageLoad, bookID, bookContentID,
}) => {

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('draw'); // 'draw' or 'erase'
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [opacity, setOpacity] = useState(0.88);
  const searchParams = useSearchParams()

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

  // Handle resize and redraw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.offsetWidth;
        canvas.height = containerRef.current.offsetHeight;
        const ctx = canvas.getContext('2d');
        drawAll(ctx);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [strokes, currentPath, tool, color, brushSize, opacity]);

  // Prevent page scroll/zoom on iPad (fallback for older iOS)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const prevent = (e) => {
      // if drawing, or just always prevent over the canvas to avoid pinch/scroll
      e.preventDefault();
    };
    el.addEventListener('touchstart', prevent, { passive: false });
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => {
      el.removeEventListener('touchstart', prevent);
      el.removeEventListener('touchmove', prevent);
    };
  }, []);

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
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return { x, y };
  };

  // --- Pointer-events based drawing (works for mouse, pen, touch) ---
  const startDrawing = (e) => {
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
    if (!isDrawing) return;
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
        className="flex-1 relative overflow-hidden select-none"
        style={{ overscrollBehavior: 'none' }} // blocks scroll chaining on iOS
      >
        <img
          src={imageUrl}
          alt="Background"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}               // prevent native panning/zooming
          onContextMenu={(e) => e.preventDefault()}     // block long-press context menu
          // Pointer Events (covers mouse/pen/touch)
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
          onPointerLeave={finishDrawing}
        />
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
