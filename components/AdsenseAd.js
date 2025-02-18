import { Adsense } from '@ctrl/react-adsense';
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
      ></ins>
      {/* <Adsense
        client="ca-pub-6813236705463574"
        slot="7790215901"
        style={{ display: 'block' }}
        layout="in-article"
        format="fluid"
      /> */}
    </div>
  );
};

export default AdsenseAd;