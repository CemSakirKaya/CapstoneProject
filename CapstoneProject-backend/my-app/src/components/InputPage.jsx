import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "./InputPage.module.css";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Process from "../Process";
import { FaInfoCircle, FaTimes, FaCheck, FaEdit } from "react-icons/fa";

export default function InputPage() {
  const location = useLocation();
  const videoSrc = location.state?.videoSrc || localStorage.getItem('videoSource') || "";
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [showProcessCard, setShowProcessCard] = useState(false);
  const [steps, setSteps] = useState([]);
  const [stepDescription, setStepDescription] = useState("");
  const [processTime, setProcessTime] = useState("");
  const [processDistance, setProcessDistance] = useState("");
  const [processType, setProcessType] = useState("");
  const [isValueAdded, setIsValueAdded] = useState(undefined);
  const videoRef = useRef(null);
  const youtubePlayer = useRef(null);
  const timerRef = useRef(null);
  const playerReadyRef = useRef(false);
  const navigate = useNavigate();

  // Load saved steps from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('inputPageState');
    const locationState = location.state;
  
    if (locationState) {
      // ResultPage'den geri dönüldüğünde
      setSteps(locationState.steps || []);
      setTime(locationState.time || 0);
      setIsPlaying(locationState.isPlaying || false);
      if (locationState.videoSrc) {
        localStorage.setItem('videoSource', locationState.videoSrc);
      }
  
      // 🔥 Yeni ek: gelen veriyi localStorage’a da yaz
      const stateToSave = {
        steps: locationState.steps || [],
        time: locationState.time || 0,
        isPlaying: locationState.isPlaying || false,
        videoSrc: locationState.videoSrc || "",
        videoTime: locationState.videoTime || 0
      };
      localStorage.setItem('inputPageState', JSON.stringify(stateToSave));
  
    } else if (savedData) {
      // WelcomePage'den veya yenilemeden gelinmişse
      const parsedData = JSON.parse(savedData);
      setSteps(parsedData.steps || []);
      setTime(parsedData.time || 0);
      setIsPlaying(parsedData.isPlaying || false);
      if (parsedData.videoSrc) {
        localStorage.setItem('videoSource', parsedData.videoSrc);
      }
    }
  }, [location.state]);
  

  // Initialize YouTube API and Player
  useEffect(() => {
    if (!videoSrc.includes("youtube.com")) return;

    let player = null;
    const savedData = localStorage.getItem('inputPageState');
    let savedVideoTime = 0;
    let savedIsPlaying = false;

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      savedVideoTime = parsedData.videoTime || 0;
      savedIsPlaying = parsedData.isPlaying || false;
    }

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Wait for API to be ready
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      // If API is already loaded, initialize player directly
      initializePlayer();
    }

    function initializePlayer() {
      player = new window.YT.Player('youtube-player', {
        height: '315',
        width: '560',
        videoId: getYouTubeVideoId(videoSrc),
        playerVars: {
          controls: 1,
          disablekb: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
          start: Math.floor(savedVideoTime)
        },
        events: {
          onReady: (event) => {
            youtubePlayer.current = event.target;
            playerReadyRef.current = true;
            console.log('YouTube Player is ready');
            
            if (savedVideoTime > 0) {
              youtubePlayer.current.seekTo(savedVideoTime);
              if (!savedIsPlaying) {
                youtubePlayer.current.pauseVideo();
              }
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startTimer();
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              stopTimer();
            }
          }
        }
      });
    }

    return () => {
      stopTimer();
      playerReadyRef.current = false;
      if (player) {
        player.destroy();
      }
    };
  }, [videoSrc]);

  // Save steps to localStorage whenever they change
  useEffect(() => {
    const currentVideoTime = videoSrc.includes("youtube.com") 
      ? (youtubePlayer.current ? youtubePlayer.current.getCurrentTime() : 0)
      : (videoRef.current ? videoRef.current.currentTime : 0);

    const stateToSave = {
      steps,
      time,
      isPlaying,
      videoSrc,
      videoTime: currentVideoTime
    };

    localStorage.setItem('inputPageState', JSON.stringify(stateToSave));
  }, [steps, time, isPlaying, videoSrc]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Zamanı 00.00 formatında göstermek için fonksiyon
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}.${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setTime(0);
    stopTimer();
  };

  const handleStart = () => {
    if (videoSrc.includes("youtube.com")) {
      if (youtubePlayer.current && playerReadyRef.current) {
        try {
          youtubePlayer.current.playVideo();
          setIsPlaying(true);
          startTimer();
        } catch (error) {
          console.error('Error playing video:', error);
        }
      }
    } else if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      startTimer();
    }
  };

  const handlePause = () => {
    if (videoSrc.includes("youtube.com")) {
      if (youtubePlayer.current && playerReadyRef.current) {
        try {
          youtubePlayer.current.pauseVideo();
          setIsPlaying(false);
          stopTimer();
        } catch (error) {
          console.error('Error pausing video:', error);
        }
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      stopTimer();
    }
  };

  const handleAddProcess = () => {
    setShowProcessCard(true);
  };

  const handleClickOfProcessType = (type) => () => {
    setProcessType(type.toUpperCase());
  };

  const handleEditStep = (index) => {
    const stepToEdit = steps[index];
    setStepDescription(stepToEdit.description);
    setProcessTime(stepToEdit.time);
    setProcessDistance(stepToEdit.distance);
    setProcessType(stepToEdit.type);
    setShowProcessCard(true);
    
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[index] = {
        ...updatedSteps[index],
        isEditing: true
      };
      return updatedSteps;
    });
  };

  const handleSubmitProcess = () => {
    // Check if any required field is empty
    if (!stepDescription.trim()) {
      alert('Please enter a process description');
      return;
    }
    if (!processTime) {
      alert('Please enter the time');
      return;
    }
    if (!processDistance) {
      alert('Please enter the distance');
      return;
    }
    if (!processType) {
      alert('Please select a process type');
      return;
    }
    if (isValueAdded === undefined) {
      alert('Please select whether this step is value added or non-value added');
      return;
    }

    const newStep = {
      description: stepDescription.trim(),
      time: processTime,
      distance: processDistance,
      type: processType.toUpperCase(),
      isValueAdded: isValueAdded,
      confirmed: false
    };
    
    const editingIndex = steps.findIndex(step => step.isEditing);
    if (editingIndex !== -1) {
      setSteps((prevSteps) => {
        const updatedSteps = [...prevSteps];
        updatedSteps[editingIndex] = {
          ...newStep,
          isEditing: false
        };
        return updatedSteps;
      });
    } else {
      setSteps([...steps, newStep]);
    }
    
    setStepDescription("");
    setProcessTime("");
    setProcessDistance("");
    setProcessType("");
    setIsValueAdded(undefined);
    setShowProcessCard(false);
  };

  const handleConfirmStep = (index) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[index].confirmed = true;
      return updatedSteps;
    });
  };

  const handleDeleteStep = (index) => {
    setSteps((prevSteps) => prevSteps.filter((_, i) => i !== index));
  };

  const getCurrentVideoTime = () => {
    return videoSrc.includes("youtube.com")
      ? (youtubePlayer.current ? youtubePlayer.current.getCurrentTime() : 0)
      : (videoRef.current ? videoRef.current.currentTime : 0);
  };
  
  const handleSubmit = () => {
    console.log("Submit button clicked");
  
    const confirmedSteps = steps.filter(step => step.confirmed);
  
    console.log("Confirmed steps:", confirmedSteps);
  
    if (confirmedSteps.length === 0) {
      alert("Please confirm at least one step before submitting.");
      return;
    }
  
    const videoTime = getCurrentVideoTime();
  
    navigate("/result", {
      state: {
        steps: confirmedSteps,
        time,
        isPlaying,
        videoSrc,
        videoTime
      }
    });
  };
  
  
  

  // Function to extract video ID from YouTube URL
  const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? match[1] : null;
  };

  return (
    <div className={styles.inputPageContainer}>
      {/* SOL KISIM */}
      <div className={styles.leftSection}>
        {/* Video Alanı */}
        <div className={styles.videoContainer}>
          {videoSrc ? (
            videoSrc.includes("youtube.com") ? (
              <div id="youtube-player" className={styles.videoPlayer}></div>
            ) : (
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                className={styles.videoPlayer}
                onPlay={() => {
                  setIsPlaying(true);
                  startTimer();
                }}
                onPause={() => {
                  setIsPlaying(false);
                  stopTimer();
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setVideoTime(Math.floor(videoRef.current.currentTime));
                  }
                }}
              />
            )
          ) : (
            <p>No video selected.</p>
          )}
        </div>

        {/* Kontroller ve Process Container */}
        <div className={styles.controlsStepsRow}>
          {/* Process Container Solda */}
          <div className={styles.processContainer}>
            <button onClick={handleAddProcess} className="btn btn-primary">
              + Step
            </button>
            <div className={styles.stepsList}>
              {steps.map((step, index) => (
                <div key={index} className={styles.processStep}>
                  <div className={styles.stepText}>
                    Step {index + 1}: {step.description}
                  </div>
                  {!step.confirmed ? (
                    <div className={styles.iconContainer}>
                      <FaCheck
                        className={styles.checkIcon}
                        onClick={() => handleConfirmStep(index)}
                      />
                      <FaTimes
                        className={styles.deleteIcon}
                        onClick={() => handleDeleteStep(index)}
                      />
                    </div>
                  ) : (
                    <div className={styles.iconContainer}>
                      <FaEdit
                        className={styles.editIcon}
                        onClick={() => handleEditStep(index)}
                      />
                      <FaTimes
                        className={styles.deleteIcon}
                        onClick={() => handleDeleteStep(index)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Kontrol Ekranı Sağda */}
          <div className={styles.timeAndControls}>
            <span className={styles.timeDisplay}>
              {formatTime(time)}
            </span>
            <div className={styles.controlsContainer}>
              <button 
                onClick={handleStart} 
                className="btn btn-success"
              >
                Start
              </button>
              <button 
                onClick={handlePause} 
                className="btn btn-warning"
              >
                Pause
              </button>
              <button 
                onClick={handleReset} 
                className="btn btn-secondary"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SAĞ KISIM */}
      <div className={styles.rightSection}>
        {showProcessCard && (
          <div className={styles.toggledProcessCard}>
            <FaTimes
              className={styles.closeIcon}
              onClick={() => setShowProcessCard(false)}
            />

            <div className={styles.cardHeader}>
              <h5>Process step description</h5>
            </div>

            <input
              type="text"
              value={stepDescription}
              onChange={(e) => setStepDescription(e.target.value)}
              placeholder="Enter process description"
              className="form-control"
            />

            <h5 style={{ paddingTop: "1.5rem" }}>
              Type of the processes{" "}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <FaInfoCircle className={styles.infoIcon} />
                <div className={styles.infoTooltip}>
                  <div><strong>Operation:</strong> A task where something is created, changed, or assembled.</div>
                  <div><strong>Transportation:</strong> Moving materials or products from one location to another.</div>
                  <div><strong>Delay:</strong> Waiting time when no activity is being performed.</div>
                  <div><strong>Storage:</strong> Keeping materials or products in a designated place for future use.</div>
                  <div><strong>Inspection:</strong> Checking the quality, quantity, or condition of an item or process.</div>
                </div>
              </div>
            </h5>

            <div className={styles.processIcons}>
              <div className={styles.processIconsRow}>
                <div
                  className={`${styles.processPhotoContainer} ${
                    processType === "OPERATION" ? styles.selected : ""
                  }`}
                  onClick={handleClickOfProcessType("Operation")}
                >
                  <img src="Operation.svg" alt="Operation" className={styles.processPhotoContainerPhoto} />
                  <span className={styles.processText}>Operation</span>
                </div>

                <div
                  className={`${styles.processPhotoContainer} ${
                    processType === "TRANSPORTATION" ? styles.selected : ""
                  }`}
                  onClick={handleClickOfProcessType("Transportation")}
                >
                  <img src="Transportation.svg" alt="Transportation" className={styles.processPhotoContainerPhoto} />
                  <span className={styles.processText}>Transportation</span>
                </div>

                <div
                  className={`${styles.processPhotoContainer} ${
                    processType === "DELAY" ? styles.selected : ""
                  }`}
                  onClick={handleClickOfProcessType("Delay")}
                >
                  <img src="Delay.svg" alt="Delay" className={styles.processPhotoContainerPhoto} />
                  <span className={styles.processText}>Delay</span>
                </div>
              </div>
              <div className={styles.processIconsRow}>
                <div
                  className={`${styles.processPhotoContainer} ${
                    processType === "STORAGE" ? styles.selected : ""
                  }`}
                  onClick={handleClickOfProcessType("Storage")}
                >
                  <img src="Storage.svg" alt="Storage" className={styles.processPhotoContainerPhoto} />
                  <span className={styles.processText}>Storage</span>
                </div>

                <div
                  className={`${styles.processPhotoContainer} ${
                    processType === "INSPECTION" ? styles.selected : ""
                  }`}
                  onClick={handleClickOfProcessType("Inspection")}
                >
                  <img src="Inspection.svg" alt="Inspection" className={styles.processPhotoContainerPhoto} />
                  <span className={styles.processText}>Inspection</span>
                </div>
              </div>
            </div>

            <div className={styles.processInputs}>
              <div>
                <label>Time (seconds)</label>
                <input
                  type="number"
                  value={processTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setProcessTime(value);
                    }
                  }}
                  className="form-control"
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </div>
              <div>
                <label>Distance (m)</label>
                <input
                  type="number"
                  value={processDistance}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setProcessDistance(value);
                    }
                  }}
                  className="form-control"
                  onKeyPress={(event) => {
                    if (!/[0-9.]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  step="0.01"
                />
              </div>
              <div>
                <label>Value Added / Non-Value Added</label>
                <div className={styles.radioGroup}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="valueAdded"
                      id="valueAdded"
                      onChange={() => setIsValueAdded(true)}
                    />
                    <label className="form-check-label" htmlFor="valueAdded">
                      Value Added
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="valueAdded"
                      id="nonValueAdded"
                      onChange={() => setIsValueAdded(false)}
                    />
                    <label className="form-check-label" htmlFor="nonValueAdded">
                      Non-Value Added
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSubmitProcess} className="btn btn-success mt-2">
              Submit
            </button>
          </div>
        )}
      </div>

      {/* Sağ Alt Köşedeki Back ve Output Butonları */}
      <div className={styles.navigationButtons}>
        <button onClick={() => navigate("/welcome")} className={`${styles.navButton} ${styles.backButton}`}>
          ❮ Back
        </button>
        <button onClick={handleSubmit} className={`${styles.navButton} ${styles.generateResultButton}`}>
          Generate Result ❯
        </button>
      </div>
    </div>
  );
}
