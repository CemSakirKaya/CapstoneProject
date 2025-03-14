import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import styles from "./WelcomePage.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaVideo, FaLink } from "react-icons/fa";

export default function WelcomePage() {
  const navigate = useNavigate(); // React Router navigation
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState("");

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(URL.createObjectURL(file)); // Create object URL
      console.log("Selected file:", file.name);
    }
  };

  const handleURLInput = () => {
    const url = prompt("Enter video URL:");
  
    if (!url) return; // If user cancels
  
    // Check if it's a YouTube URL
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:.*v=|.*\/)|youtu.be\/)([^#\&\?]{11})/
    );
  
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      setVideoURL(`https://www.youtube.com/embed/${videoId}`);
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

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setVideoFile(URL.createObjectURL(file));
      console.log("Dropped file:", file.name);
    }
  };

  // Navigate to InputPage with selected video
  const handleNext = () => {
    if (videoFile || videoURL) {
      navigate("/input", { state: { videoSrc: videoFile || videoURL } });
    } else {
      alert("Please select or add a video first!");
    }
  };

  return (
    <div className={` ${styles.welcomeContainer}`}>
      <div className="text-center">
        <img
          src="logo.png" // Replace with your logo path
          alt="Flow Process Chart Maker"
          className={styles.logo}
        />
      </div>

      {/* Drag & Drop Box */}
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

      <div className="text-center mt-3">
  {videoURL ? (
    videoURL.includes("youtube.com") ? (
      <iframe
        width="560"
        height="315"
        src={videoURL}
        frameBorder="0"
        allowFullScreen
        className={styles.videoPlayer}
      ></iframe>
    ) : (
      <video src={videoURL} controls className={styles.videoPlayer} />
    )
  ) : videoFile ? (
    <video width="560" height="315" src={videoFile} controls className={styles.videoPlayer} />
  ) : null}
</div>

      {/* Next Button */}
      <div className="text-center mt-3">
        <button className="btn btn-lg btn-primary" onClick={handleNext}>
          Next <span>&#10148;</span>
        </button>
      </div>
    </div>
  );
}
