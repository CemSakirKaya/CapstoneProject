import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "./InputPage.module.css";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Process from "../Process";
import { FaInfoCircle, FaTimes } from "react-icons/fa";

export default function InputPage() {
  const location = useLocation();
  const videoSrc = location.state?.videoSrc || "";
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [showProcessCard, setShowProcessCard] = useState(false);
  const [steps, setSteps] = useState([]);
  const [stepDescription, setStepDescription] = useState("");
  const [processTime, setProcessTime] = useState("");
  const [processDistance, setProcessDistance] = useState("");
  const [processType, setProcessType] = useState("");
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleStart = () => {
    videoRef.current?.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const handleReset = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setTime(0);
  };

  const handleAddProcess = () => {
    setShowProcessCard(true);
  };

 
    const handleClickOfProcessType = (type) => () =>   {
        setProcessType(type);
  }

  


 

  const handleSubmitProcess = () => {
    if (stepDescription.trim()) {
      setSteps((prevSteps) => [...prevSteps, { description: stepDescription.trim(), time: processTime, distance: processDistance }]);
      setStepDescription("");
      setProcessTime("");
      setProcessDistance("");
    }
    setShowProcessCard(false);

    console.log(processTime,processDistance,stepDescription,processType)

    var a = new Process(processType,processTime,processDistance,stepDescription)
    console.log(a)
    console.log(  a instanceof Process)
  };


  

  return (
    <div className={styles.inputPageContainer}>
      {/* Video Section */}
      <div className={styles.videoContainer}>
      {videoSrc ? (
          videoSrc.includes("youtube.com") ? (
            <iframe
          style={{
       
          aspectRatio: "3 / 2",
        
        }} 
           
            width={500}
        
            src={videoSrc}
            frameBorder="0"
            allowFullScreen
            className={styles.videoPlayer}
          />
          ) : (
            <video ref={videoRef} src={videoSrc} controls height="600" width="400" className={styles.videoPlayer} />
          )
        ) : (
          <p>No video selected.</p>
        )}

        <div className={styles.videoDetailsContainer}>

     

  {/* Process Section */}
  <div className={styles.processContainer}>
        <button onClick={handleAddProcess} className="btn btn-primary">+ Process</button>
        
       

        <div className={styles.stepsList}>
          {steps.map((step, index) => (
            <div key={index} className={styles.processStep}>
              Step {index + 1}: {step.description}
            </div>
          ))}
        </div>
      </div>

            <div style={{display:"flex",flexDirection:"column"}}>
            <span style={{fontWeight:"bold",paddingBottom:"0.5rem"}}>Time: {new Date(time * 1000).toISOString().substr(14, 5)}</span>
               <div className={styles.controlsContainer}>
          <button onClick={handleReset} className="btn btn-secondary">Reset</button>
          <button onClick={handleStart} className="btn btn-success">Start</button>
          <button onClick={handlePause} className="btn btn-warning">Pause</button>
          
        </div>
            </div>

     


      </div>
      </div>
      <div>
      {showProcessCard && (
          <div className={styles.toggledProcessCard}>
            <div className={styles.cardHeader}>
              <h5>Process step description</h5>
              <FaTimes style={{position:"absolute", top:"0.5rem",right:"0.5rem",color:"red",height:"2rem"}} className={styles.closeIcon} onClick={() => setShowProcessCard(false)} />
            </div>
            <input
              type="text"
              value={stepDescription}
              onChange={(e) => setStepDescription(e.target.value)}
              placeholder="Enter process description"
              className="form-control"
            />
            <h5 style={{paddingTop:"1.5rem"}} className={styles.processTypeLabel}>Type of the processes <FaInfoCircle style={{color:"blue",height:"1rem",position:"relative",top:"0px",left:"0.5rem"}} /></h5>
            <div className={styles.processIcons}>

            <div className={`${styles.processPhotoContainer} ${processType === "Operation" ? styles.selected : ""}`} onClick={handleClickOfProcessType("Operation")}>
            <img src="Operation.svg" alt="Operation" className={styles.     processPhotoContainerPhoto} />
            <span className={styles.processText}>Operation</span>
             </div>

             <div className={`${styles.processPhotoContainer} ${processType === "Transportation" ? styles.selected : ""}`} onClick={handleClickOfProcessType("Transportation")}>
            <img src="Transportation.svg" alt="Transportation" className={styles.     processPhotoContainerPhoto} />
            <span className={styles.processText}>Transportation</span>
             </div>

             <div className={`${styles.processPhotoContainer} ${processType === "Delay" ? styles.selected : ""}`} onClick={handleClickOfProcessType("Delay")}>
            <img src="Delay.svg" alt="Delay" className={styles.     processPhotoContainerPhoto} />
            <span className={styles.processText}>Delay</span>
             </div>

             <div className={`${styles.processPhotoContainer} ${processType === "Storage" ? styles.selected : ""}`} onClick={handleClickOfProcessType("Storage")}>
            <img src="Storage.svg" alt="Storage" className={styles.     processPhotoContainerPhoto} />
            <span className={styles.processText}>Storage</span>
             </div>

             <div className={`${styles.processPhotoContainer} ${processType === "Inspection" ? styles.selected : ""}`} onClick={handleClickOfProcessType("Inspection")}>
            <img src="Inspection.svg" alt="Inspection" className={styles.     processPhotoContainerPhoto} />
            <span className={styles.processText}>Inspection</span>
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
                    if (/^\d*$/.test(value)) { // Allows only digits (no letters, no special characters)
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
                <label>Distance (cm)</label>
                <input
                  type="number"
                  value={processDistance}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setProcessDistance(value);
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
            </div>
            <button onClick={handleSubmitProcess} className="btn btn-success mt-2">Submit</button>
          </div>
        )}
        
      </div>
      <div className={styles.fixedButtonsContainer}>
        <button onClick={() => navigate("/welcome")} className={styles.navButton}>
          ❮ Back
        </button>
        <button onClick={() => navigate("/result")} className={styles.navButton}>
          Output ❯
        </button>
      </div>

    
    </div>
  );
  
}


