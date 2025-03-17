import React, { useEffect, useRef, useState } from "react";

const YouTubePlayer = ({ videoSrc }) => {
  const iframeRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  function getYouTubeVideoId(url) {
    const regex =
      /(?:youtube\.com\/(?:.*v=|embed\/|v\/)|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  const videoId = getYouTubeVideoId(videoSrc);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          window.YT.ready(() => {
            initializePlayer();
          });
        };
      } else {
        initializePlayer();
      }
    };

    const initializePlayer = () => {
      const newPlayer = new window.YT.Player(iframeRef.current, {
        videoId,
        events: {
          onReady: (event) => setPlayer(event.target),
        },
      });
    };

    loadYouTubeAPI();
  }, [videoId]);

  // Handle Play
  const handlePlay = () => {
    if (player) {
      player.playVideo();
      setIsRunning(true);
    }
  };

  // Handle Pause
  const handlePause = () => {
    if (player) {
      player.pauseVideo();
      setIsRunning(false);
    }
  };

  // Handle Reset
  const handleReset = () => {
    if (player) {
      player.seekTo(0, true);
      setIsRunning(false);
      setTimer(0);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  return (
    <div>
    {/* YouTube Iframe */}
    <div>
      <iframe
        ref={iframeRef}
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="YouTube video player"
      />
    </div>
  
    {/* Controls - Now aligned to the right */}
    <div style={{ 
      marginTop: "10px", 
      display: "flex", 
      alignItems: "center", 
      gap: "10px",
      justifyContent: "flex-end", /* Moves buttons and timer to the right */
      textAlign: "right" 
    }}>
      <button onClick={handlePlay} className="btn btn-success">
        Play
      </button>
      <button onClick={handlePause} className="btn btn-warning">
        Pause
      </button>
      <button onClick={handleReset} className="btn btn-secondary">
        Reset
      </button>
      <span style={{ fontSize: "18px", fontWeight: "bold", marginLeft:"1rem" }}>{timer}s</span>
    </div>
  </div>
  
  );
};

export default YouTubePlayer;
