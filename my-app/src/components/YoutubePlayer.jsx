import React, { useEffect, useRef, useState } from "react";
import styles from "./InputPage.module.css";

const YouTubePlayer = ({ 
  videoSrc, 
  onAddStep,
  showProcessCard,
  setShowProcessCard,
  stepDescription,
  setStepDescription,
  processTime,
  setProcessTime,
  processDistance,
  setProcessDistance,
  processType,
  setProcessType,
  handleSubmitProcess,
  handleClickOfProcessType,
  onStart,
  onPause,
  onReset,
  isPlaying,
  onTimeUpdate,
  onReady
}) => {
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const timeUpdateInterval = useRef(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);

  function getYouTubeVideoId(url) {
    if (!url) return null;
    
    // Handle various YouTube URL formats
    const patterns = [
      /[?&]v=([^&]+)/, // Standard watch URL
      /youtu\.be\/([^?]+)/, // Shortened URL
      /embed\/([^?]+)/, // Embed URL
      /^([^?]+)/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  const videoId = getYouTubeVideoId(videoSrc);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setApiLoaded(true);
      };
    } else {
      setApiLoaded(true);
    }
  }, []);

  // Initialize player
  useEffect(() => {
    if (!apiLoaded || !videoId || !playerRef.current) return;

    const newPlayer = new window.YT.Player(playerRef.current, {
      height: '315',
      width: '100%',
      videoId: videoId,
      playerVars: {
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        autoplay: 0,
        mute: 0,
        playsinline: 1,
        enablejsapi: 1
      },
      events: {
        onReady: (event) => {
          console.log("YouTube player is ready");
          setPlayer(event.target);
          setIsPlayerReady(true);
          if (onReady) onReady();
          
          // Set up control functions
          if (onStart) onStart(() => {
            event.target.playVideo();
            startTimeUpdate(event.target);
          });
          
          if (onPause) onPause(() => {
            event.target.pauseVideo();
            stopTimeUpdate();
          });
          
          if (onReset) onReset(() => {
            event.target.seekTo(0);
            event.target.pauseVideo();
            stopTimeUpdate();
          });
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            stopTimeUpdate();
          }
        },
        onError: (event) => {
          console.error("YouTube Player Error:", event.data);
        }
      }
    });

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
      // Clean up player
      if (player) {
        player.destroy();
      }
    };
  }, [apiLoaded, videoId]);

  const startTimeUpdate = (playerInstance) => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }
    
    timeUpdateInterval.current = setInterval(() => {
      if (playerInstance && onTimeUpdate) {
        try {
          const currentTime = playerInstance.getCurrentTime();
          onTimeUpdate(Math.floor(currentTime));
        } catch (error) {
          console.error("Error getting current time:", error);
        }
      }
    }, 1000);
  };

  const stopTimeUpdate = () => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
      timeUpdateInterval.current = null;
    }
  };

  if (!videoId) {
    return <div>Invalid YouTube URL</div>;
  }

  return (
    <div className={styles.videoContainer}>
      <div
        ref={playerRef}
        style={{
          width: '100%',
          height: '315px',
          maxWidth: '560px',
          margin: '0 auto'
        }}
      />
    </div>
  );
};

export default YouTubePlayer;
