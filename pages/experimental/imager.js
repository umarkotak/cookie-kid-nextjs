import { useState, useEffect } from 'react';
import Image from 'next/image';

// Function to generate sample objects from page 1 to 100
const generateMathPages = () => {
  const baseUrl = 'https://cbdata.cloudflare-avatar-id-1.site/books/singapore-math-3pdf/';
  const pages = [];
  
  for (let i = 1; i <= 100; i++) {
    pages.push({
      id: i,
      title: `Singapore Math - Page ${i}`,
      description: `Math exercises and problems - Page ${i} of 100`,
      imageUrl: `${baseUrl}${i}.jpeg`,
    });
  }
  
  return pages;
};

// Generate the sample objects
const sampleObjects = generateMathPages();

// Individual object component
const ObjectComponent = ({ object, onImageLoad }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onImageLoad(object.id);
  };

  const handleImageError = () => {
    setImageError(true);
    onImageLoad(object.id); // Continue to next item even on error
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 transition-opacity duration-500 ease-in-out">
      <div className="relative">
        {!imageLoaded && !imageError && (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Failed to load page {object.id}</p>
            </div>
          </div>
        ) : (
          <img
            src={object.imageUrl}
            alt={object.title}
            width={500}
            height={300}
            className={`w-full h-64 object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={false}
          />
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{object.title}</h3>
        <p className="text-gray-600">{object.description}</p>
      </div>
    </div>
  );
};

// Main page component
export default function SequentialImageLoader({ objects = sampleObjects }) {
  const [visibleItems, setVisibleItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // Initialize with first item
  useEffect(() => {
    if (objects.length > 0) {
      setVisibleItems([objects[0]]);
    }
  }, [objects]);

  // Handle when an image finishes loading
  const handleImageLoad = (loadedId) => {
    // Add next item if available
    if (currentIndex + 1 < objects.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setVisibleItems(prev => [...prev, objects[nextIndex]]);
    } else {
      setLoadingComplete(true);
    }
  };

  // Option to load all remaining items at once
  const loadAllRemaining = () => {
    setVisibleItems(objects);
    setCurrentIndex(objects.length - 1);
    setLoadingComplete(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Singapore Math Book - Sequential Page Loader
          </h1>
          <p className="text-gray-600 mb-4">
            Math book pages load one by one for better performance and faster initial visibility
          </p>
          
          {/* Progress indicator */}
          <div className="bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(visibleItems.length / objects.length) * 100}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-500">
            Loaded {visibleItems.length} of {objects.length} pages
          </p>
          
          {/* Load all button */}
          {!loadingComplete && visibleItems.length > 1 && (
            <button
              onClick={loadAllRemaining}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load All Remaining ({objects.length - visibleItems.length} pages)
            </button>
          )}
        </div>

        {/* Render visible items */}
        <div className="space-y-6">
          {visibleItems.map((object, index) => (
            <div
              key={object.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ObjectComponent
                object={object}
                onImageLoad={handleImageLoad}
              />
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {!loadingComplete && (
          <div className="text-center py-8">
            <div className="inline-flex items-center text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
              Loading next page...
            </div>
          </div>
        )}

        {/* Completion message */}
        {loadingComplete && (
          <div className="text-center py-8">
            <div className="text-green-600 font-semibold">
              ✓ All 100 pages loaded successfully!
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}