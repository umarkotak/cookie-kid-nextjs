import { Adsense } from '@ctrl/react-adsense';
import React, { useEffect } from 'react';

const AdsenseAd = () => {
  useEffect(() => {
    // Load the AdSense script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6813236705463574';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    // Initialize the ad
    (window.adsbygoogle = window.adsbygoogle || []).push({});

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div>
      {/* AdSense ad unit */}
      {/* <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6813236705463574"
        data-ad-slot="7790215901"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins> */}
      <Adsense
        client="ca-pub-6813236705463574"
        slot="7790215901"
        style={{ display: 'block' }}
        layout="in-article"
        format="fluid"
      />
    </div>
  );
};

export default AdsenseAd;