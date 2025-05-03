import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import styles from "./WelcomePage.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaVideo, FaLink, FaRedo } from "react-icons/fa";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState("");

  const resetBackendFlowchart = async () => {
    const baseUrl = process.env.REACT_APP_API_BASE;
    try {
      await fetch(`${baseUrl}/api/flowchart/reset`, { method: "DELETE" });
      console.log(" Backend resetlendi");
    } catch (error) {
      console.error(" Backend reset hatası:", error);
    }
  };

// Check localStorage for video source when component mounts
useEffect(() => {
  // Temiz başlangıç için localStorage temizleniyor
  localStorage.removeItem("videoSource");
  localStorage.removeItem("processSteps");
  localStorage.removeItem("inputPageState");

  // Video gösterme işlemi sıfırlanıyor
  setVideoFile(null);
  setVideoURL("");
}, []);


  

  // Handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      // Clear previous data when video changes
      localStorage.removeItem('processSteps');
      localStorage.removeItem('inputPageState');
      await resetBackendFlowchart();

      setVideoFile(URL.createObjectURL(file));
      console.log("Selected file:", file.name);
    }
  };

  // Handle video change
  const handleChangeVideo = async () => {
    // Clear previous data when video changes
    localStorage.removeItem('processSteps');
    localStorage.removeItem('inputPageState');
    await resetBackendFlowchart();

    setVideoFile(null);
    setVideoURL("");
  };

  
  

  const handleURLInput = async () => {
    const url = prompt("Enter video URL:");
    if (!url) return; // If user cancels
  
    // Clear previous data when video changes
    localStorage.removeItem('processSteps');
    localStorage.removeItem('inputPageState');
    await resetBackendFlowchart();

  
    // Check if it's a YouTube URL and extract video ID
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
  
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      // Store the original YouTube URL
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      setVideoURL(videoUrl);
      console.log("YouTube Video ID:", videoId);
      return;
    }
  
    // Check for valid file extensions (MP4, WebM, OGV, MKV, AVI)
    if (/\.(mp4|webm|ogv|mkv|avi)(\?.*)?$/.test(url)) {
      setVideoURL(url);
      console.log("Valid video URL:", url);
      return;
    }
  
    alert("Invalid URL. Please enter a YouTube link or a direct video file URL.");
  };

  // Handle drag & drop
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      localStorage.removeItem('processSteps');
      localStorage.removeItem('inputPageState');
      await resetBackendFlowchart(); // 🔥 backend temizle

      setVideoFile(URL.createObjectURL(file));
      console.log("Dropped file:", file.name);
    }
  };

  // Navigate to InputPage with selected video
  const handleNext = () => {
    if (videoFile || videoURL) {
      let videoSource = videoFile || videoURL;
      
      // Save video source to localStorage
      localStorage.setItem('videoSource', videoSource);
      
      // Get existing state from localStorage
      const existingState = localStorage.getItem('inputPageState');
      const parsedState = existingState ? JSON.parse(existingState) : null;
      
      // Navigate to input page with the video source and existing state
      navigate("/input", { 
        state: { 
          videoSrc: videoSource,
          ...(parsedState && {
            steps: parsedState.steps,
            time: parsedState.time,
            isPlaying: parsedState.isPlaying,
            videoTime: parsedState.videoTime
          })
        } 
      });
    } else {
      alert("Please select or add a video first!");
    }
  };

  // Function to extract video ID from YouTube URL
  const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? match[1] : null;
  };

  return (
    <div className={styles.welcomeContainer}>
      {/* LOGO Sabit (fixed) en üst ortada */}
      <div className={styles.logoContainer}>
        <img
          src="logo.png" // Replace with your logo path
          alt="Flow Process Chart Maker"
          className={styles.logo}
        />
      </div>

      {/* Drag & Drop Box */}
      {!(videoFile || videoURL) && (
        <div
          className={styles.uploadBox}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className={styles.uploadIcon}>
              <span>&#8679;</span>
            </div>
            <p className={styles.uploadText}>
              Drag Files To Upload Video <br />
              or <span className={styles.selectOption}>Select an Option Below</span>
            </p>
            <div className={styles.buttonContainer}>
              {/* File input (hidden) */}
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                id="fileInput"
                style={{ display: "none" }}
              />
              <button
                className={`${styles.uploadButton} btn btn-primary`}
                onClick={() => document.getElementById("fileInput").click()}
              >
                <FaVideo /> Add Video
              </button>
              <button
                className={`${styles.uploadButton} btn btn-danger`}
                onClick={handleURLInput}
              >
                <FaLink /> Use a URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview */}
      <div className="text-center mt-3">
        {videoURL ? (
          videoURL.includes("youtube.com") ? (
            <div className={styles.videoContainer}>
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(videoURL)}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.videoPlayer}
              ></iframe>
              <button
                className={`${styles.changeVideoButton} btn btn-secondary`}
                onClick={handleChangeVideo}
              >
                <FaRedo /> Change Video
              </button>
            </div>
          ) : (
            <div className={styles.videoContainer}>
              <video
                src={videoURL}
                controls
                className={styles.videoPlayer}
              />
              <button
                className={`${styles.changeVideoButton} btn btn-secondary`}
                onClick={handleChangeVideo}
              >
                <FaRedo /> Change Video
              </button>
            </div>
          )
        ) : videoFile ? (
          <div className={styles.videoContainer}>
            <video
              width="560"
              height="315"
              src={videoFile}
              controls
              className={styles.videoPlayer}
            />
            <button
              className={`${styles.changeVideoButton} btn btn-secondary`}
              onClick={handleChangeVideo}
            >
              <FaRedo /> Change Video
            </button>
          </div>
        ) : null}
      </div>

      {/* Next Button in bottom-right corner */}
      <div className={styles.navigationButtons}>
        <button className={styles.navButton} onClick={handleNext}>
          Next <span>&#10148;</span>
        </button>
      </div>
    </div>
  );
}
