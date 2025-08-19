import { useState } from 'react';

export default function AffiliatePage() {
  const [isLoading, setIsLoading] = useState(false);

  // Replace with your actual affiliate link
  const affiliateLink = "https://www.tokopedia.com/";

  const handleAffiliateClick = () => {
    // Open link in a new window/tab (background)
    const newWindow = window.open(
      affiliateLink,
      '_blank',
      'popup,width=800,height=600,scrollbars=yes,resizable=yes',
      // 'noopener,noreferrer',
    );

    // Optional: Focus back to original window to keep it in foreground
    window.focus();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Special Offer
        </h1>

        <p className="text-gray-600 mb-6 text-center">
          Click the button below to check out our recommended product with an exclusive discount!
        </p>

        <button
          onClick={handleAffiliateClick}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Opening...
            </div>
          ) : (
            'Get Exclusive Discount'
          )}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          * This will open in a new window
        </p>
      </div>
    </div>
  );
}