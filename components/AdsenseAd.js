import React, { useEffect } from 'react';

const AdsenseAd = () => {
  return (
    <div>
      {/* AdSense ad unit */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6813236705463574"
        data-ad-slot="7790215901"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <div>google ads here</div>
    </div>
  );
};

export default AdsenseAd;