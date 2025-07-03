// pages/video.js or app/video/page.js (depending on your Next.js version)
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic'
const ReactPlayerCsr = dynamic(() => import('@/components/ReactPlayerCsr'), { ssr: false })

export default function VideoPage() {
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const playerRef = useRef(null);

  // Handle autoplay restrictions
  const tryAutoplay = async (readyPlayer) => {
    try {
      // If user has already granted audio permission, this should work
      console.warn("DEBUG READY PLAYER", readyPlayer);
      if (readyPlayer && readyPlayer.play) {
        await readyPlayer.play();
        setMuted(false);
        setPlaying(true);
        return;
      }
      
      // if (playerRef.current) {
      //   const internalPlayer = playerRef.current.getInternalPlayer();
      //   console.log("INTERNAL PLAYER", internalPlayer);
      //   if (internalPlayer && internalPlayer.play) {
      //     await internalPlayer.play();
      //     setMuted(false);
      //     setPlaying(true);
      //   }
      // }
    } catch (error) {
      console.log('Autoplay with audio blocked, trying muted autoplay');
      // Fallback to muted autoplay
      setMuted(true);
      setPlaying(true);
    }
  };

  const handleReady = (readyPlayer) => {
    console.log('Player is ready');
    tryAutoplay(readyPlayer);
  };

  const handlePlay = () => {
    console.log('Video started playing');
    // setPlaying(true);
  };

  const handlePause = () => {
    console.log('Video paused');
    // setPlaying(false);
  };

  const handleError = (error) => {
    console.error('Player error:', error);
  };

  const handleUnmute = () => {
    setMuted(false);
    setHasUserInteracted(true);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
    setHasUserInteracted(true);
  };

  return (
    <div style={{
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        height: '80vh'
      }}>
        <ReactPlayerCsr
          ref={playerRef}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" // Replace with your video URL
          playing={playing}
          muted={muted}
          controls={true}
          width="100%"
          height="100%"
          onReady={handleReady}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={handleError}
          config={{
            file: {
              attributes: {
                crossOrigin: 'anonymous',
                preload: 'auto'
              }
            }
          }}
        />

        {/* Overlay controls for better UX */}
        {muted && !hasUserInteracted && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }} onClick={handleUnmute}>
            🔊 Click to unmute
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={handlePlayPause}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={() => setMuted(!muted)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: muted ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      <div style={{
        marginTop: '10px',
        color: '#666',
        fontSize: '12px',
        textAlign: 'center'
      }}>
        Status: {playing ? 'Playing' : 'Paused'} | Audio: {muted ? 'Muted' : 'Unmuted'}
      </div>
    </div>
  );
}