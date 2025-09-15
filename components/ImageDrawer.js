import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Eraser, Undo, Redo, Trash2, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import ytkiddAPI from '@/apis/ytkidApi';
import useDebounce from './useDebounce';

const ImageDrawer = ({
  imageUrl, className, onImageLoad, bookID, bookContentID, focus,
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const activePointerIdRef = useRef(null);
  const touchCountRef = useRef(0); // Track number of active touches

  const [containerSize, setContainerSize] = useState(0)
  const [strokes, setStrokes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Tool settings
  const [tool, setTool] = useState('draw');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [opacity, setOpacity] = useState(0.88);
  const [brushSizeDropdownOpen, setBrushSizeDropdownOpen] = useState(false);

  const searchParams = useSearchParams();
  const debouncedStrokes = useDebounce(strokes, 500);

  const defaultColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'
  ];

  // Brush size options for dropdown
  const brushSizeOptions = {
    draw: [1, 2, 3, 4, 5, 8, 10, 12, 15, 20],
    erase: [10, 15, 20, 25, 30, 35, 40, 45, 50]
  };

  // --- API Communication ---
  useEffect(() => {
    const getUserStroke = async (id) => {
      if (!id) return;
      setIsInitialLoad(true);
      try {
        const response = await ytkiddAPI.GetUserStroke("", {}, { book_content_id: id });
        if (response.ok) {
          const body = await response.json();
          setStrokes(body.data.strokes || []);
        }
      } catch (error) {
        console.error('Error loading strokes:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };
    getUserStroke(bookContentID);
  }, [bookContentID]);

  useEffect(() => {
    const postUserStroke = async () => {
      if (isInitialLoad || !bookContentID || debouncedStrokes.length === 0) return;
      try {
        await ytkiddAPI.PostUserStroke("", {}, {
          book_id: bookID,
          book_content_id: bookContentID,
          image_url: imageUrl,
          strokes: debouncedStrokes
        });
      } catch (error) {
        console.error('Error saving strokes:', error);
      }
    };
    postUserStroke();
  }, [debouncedStrokes, bookID, bookContentID, imageUrl, isInitialLoad]);

  // --- Canvas Setup and Drawing Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio || 1;

    const containerRect = canvas.parentElement.getBoundingClientRect();
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerAspectRatio = containerRect.width / containerRect.height;

    let renderedWidth, renderedHeight;
    if (containerAspectRatio > imageAspectRatio) {
      renderedHeight = containerRect.height;
      renderedWidth = renderedHeight * imageAspectRatio;
    } else {
      renderedWidth = containerRect.width;
      renderedHeight = renderedWidth / imageAspectRatio;
    }

    canvas.style.width = `${renderedWidth}px`;
    canvas.style.height = `${renderedHeight}px`;
    canvas.width = renderedWidth * pixelRatio;
    canvas.height = renderedHeight * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);

    const leftOffset = (containerRect.width - renderedWidth) / 2;
    const topOffset = (containerRect.height - renderedHeight) / 2;
    canvas.style.left = `${leftOffset}px`;
    canvas.style.top = `${topOffset}px`;

    const drawPath = (stroke) => {
      if (stroke.points.length < 1) return;

      ctx.beginPath();
      ctx.globalCompositeOperation = stroke.tool === 'erase' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = stroke.color || '#000000';
      ctx.lineWidth = stroke.relativeSize ? stroke.relativeSize * renderedWidth : (stroke.brushSize || 2);
      ctx.globalAlpha = stroke.opacity || 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const [firstPoint, ...restPoints] = stroke.points;
      ctx.moveTo(firstPoint.x * renderedWidth, firstPoint.y * renderedHeight);
      restPoints.forEach(point => {
        ctx.lineTo(point.x * renderedWidth, point.y * renderedHeight);
      });
      ctx.stroke();
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(drawPath);
    if (currentPath.length > 0) {
      drawPath({
        tool,
        color: tool === 'draw' ? color : undefined,
        relativeSize: brushSize / renderedWidth,
        opacity,
        points: currentPath,
      });
    }

  }, [strokes, currentPath, imageLoaded, tool, color, brushSize, opacity, containerSize]);

  useEffect(() => {
    if (!imageLoaded) return;
    const handleResize = () => setStrokes(prev => [...prev]);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded]);

  // --- Enhanced Touch/Pointer Event Handlers ---
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
  };

  // Enhanced touch start handler
  const handleTouchStart = useCallback((e) => {
    touchCountRef.current = e.touches.length;

    // Block drawing if more than one touch
    if (e.touches.length > 1) {
      e.preventDefault();
      if (isDrawing) {
        setIsDrawing(false);
        setCurrentPath([]);
      }
      return;
    }

    // Prevent text selection and default behaviors
    e.preventDefault();

    const touch = e.touches[0];
    const coords = getCanvasCoordinates({ clientX: touch.clientX, clientY: touch.clientY });
    if (coords) {
      setCurrentPath([coords]);
      setIsDrawing(true);
      setRedoStack([]);
    }
  }, [isDrawing]);

  const handleTouchMove = useCallback((e) => {
    // Block if more than one touch
    if (e.touches.length > 1 || touchCountRef.current > 1) {
      e.preventDefault();
      return;
    }

    if (!isDrawing) return;

    e.preventDefault();
    const touch = e.touches[0];
    const coords = getCanvasCoordinates({ clientX: touch.clientX, clientY: touch.clientY });
    if (coords) {
      setCurrentPath(prev => [...prev, coords]);
    }
  }, [isDrawing]);

  const handleTouchEnd = useCallback((e) => {
    touchCountRef.current = e.touches.length;

    // If there are still touches remaining, don't end drawing
    if (e.touches.length > 0) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    setIsDrawing(false);

    if (currentPath.length > 0) {
      const canvas = canvasRef.current;
      const renderedWidth = parseFloat(canvas.style.width);

      const newStroke = {
        tool,
        color: tool === 'draw' ? color : undefined,
        relativeSize: brushSize / renderedWidth,
        opacity,
        points: currentPath,
      };
      setStrokes(prev => [...prev, newStroke]);
    }
    setCurrentPath([]);
  }, [currentPath, tool, color, brushSize, opacity]);

  // Fallback pointer events for non-touch devices
  const handlePointerDown = useCallback((e) => {
    // Skip if this is a touch event (handled by touch handlers)
    if (e.pointerType === 'touch') return;

    if (!e.isPrimary) return;

    e.target.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;

    const coords = getCanvasCoordinates(e);
    if (coords) {
      setCurrentPath([coords]);
      setIsDrawing(true);
      setRedoStack([]);
    }
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (e.pointerType === 'touch') return;
    if (!isDrawing || e.pointerId !== activePointerIdRef.current) return;

    const coords = getCanvasCoordinates(e);
    if (coords) {
      setCurrentPath(prev => [...prev, coords]);
    }
  }, [isDrawing]);

  const handlePointerUp = useCallback((e) => {
    if (e.pointerType === 'touch') return;
    if (e.pointerId !== activePointerIdRef.current) return;

    e.target.releasePointerCapture(e.pointerId);
    activePointerIdRef.current = null;
    setIsDrawing(false);

    if (currentPath.length > 0) {
      const canvas = canvasRef.current;
      const renderedWidth = parseFloat(canvas.style.width);

      const newStroke = {
        tool,
        color: tool === 'draw' ? color : undefined,
        relativeSize: brushSize / renderedWidth,
        opacity,
        points: currentPath,
      };
      setStrokes(prev => [...prev, newStroke]);
    }
    setCurrentPath([]);
  }, [currentPath, tool, color, brushSize, opacity]);

  const handleImageLoad = useCallback((e) => {
    if (onImageLoad) { onImageLoad(e) };
    setImageLoaded(true);
  }, [onImageLoad]);

  // --- Toolbar Actions ---
  const undo = useCallback(() => {
    if (strokes.length === 0) return;
    const lastStroke = strokes[strokes.length - 1];
    setRedoStack(prev => [...prev, lastStroke]);
    setStrokes(strokes.slice(0, -1));
  }, [strokes]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextStroke = redoStack[redoStack.length - 1];
    setStrokes(prev => [...prev, nextStroke]);
    setRedoStack(redoStack.slice(0, -1));
  }, [redoStack]);

  const clearCanvas = useCallback(() => {
    if (window.confirm("Apakah kamu yakin untuk membersihkan halaman ini?")) {
        setStrokes([]);
        setRedoStack([]);
        setCurrentPath([]);
    }
  }, []);

  async function checkWidth() {
    for (let index = 0; index < 15; index++) {
      if (!focus) { return }
      console.log(bookContentID, "width", containerRef.current?.offsetWidth)
      setContainerSize(containerRef.current?.offsetWidth)
      await sleep(500);
    }
  }

  useEffect(() => {
    if (!focus) { return }
    checkWidth()
  }, [focus])

  // Handle brush size selection
  const handleBrushSizeChange = (size) => {
    setBrushSize(size);
    setBrushSizeDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.brush-size-dropdown')) {
        setBrushSizeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex lg:flex-row flex-col h-full ${className || ''}`}>
      {/* --- Toolbar --- */}
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
                  onClick={() => {setTool('erase'); setBrushSize(20); setOpacity(1)}}
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
                {/* Brush Size Dropdown */}
                <div className="flex lg:flex-col flex-row lg:items-start items-center lg:gap-2 gap-2">
                  <label className="text-sm font-medium text-gray-700 lg:mb-0">Size</label>
                  <div className="relative brush-size-dropdown">
                    <button
                      onClick={() => setBrushSizeDropdownOpen(!brushSizeDropdownOpen)}
                      className="flex items-center justify-between lg:w-full w-16 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span>{brushSize}</span>
                      <ChevronDown size={16} className={`transition-transform ${brushSizeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {brushSizeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 lg:w-full w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                        {brushSizeOptions[tool].map((size) => (
                          <button
                            key={size}
                            onClick={() => handleBrushSizeChange(size)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                              brushSize === size ? 'bg-blue-100 text-blue-900' : ''
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
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

      {/* --- Enhanced Canvas Container --- */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden select-none bg-background"
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Drawing background"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          onLoad={handleImageLoad}
          draggable="false"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        />
        {imageLoaded && (
          <canvas
            ref={canvasRef}
            className="absolute cursor-crosshair"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
            onSelectStart={(e) => e.preventDefault()}
            style={{
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          />
        )}
      </div>

      {/* --- Styles --- */}
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
      `}</style>
    </div>
  );
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default ImageDrawer;