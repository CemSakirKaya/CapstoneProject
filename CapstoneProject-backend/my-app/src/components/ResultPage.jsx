import React, { useRef, useState, useEffect } from "react"; 
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./ResultPage.module.css";
import { FaSave, FaInfoCircle } from "react-icons/fa";


export default function ResultPage() { 
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [steps, setSteps] = useState([]);
  
  
  useEffect(() => {
    const locationSteps = location.state?.steps;
    const saved = localStorage.getItem("inputPageState");
    const localSteps = saved ? JSON.parse(saved).steps || [] : [];
  
    const combinedSteps = locationSteps?.length ? locationSteps : localSteps;
  
    setSteps(combinedSteps);
    setLoading(false);
  }, [location.state]);
  
  
  const handleSave = async () => {
    console.log("Save button clicked");
  
    const baseUrl = process.env.REACT_APP_API_BASE;
  
    try {
      setIsSaving(true);
  
      // 1. Adım: Step'leri backend'e gönder
      const payload = steps.map((step) => ({
        description: step.description,
        time: parseInt(step.time, 10),
        distance: parseInt(step.distance, 10),
        type: step.type.toUpperCase(),
        valueAdded: step.isValueAdded
      }));
  
      console.log("PDF payload being sent:", payload);
  
      const postResponse = await fetch(`${baseUrl}/api/flowchart/add-steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
  
      if (!postResponse.ok) {
        throw new Error("Failed to send steps to backend.");
      }
  
      // 2. Adım: PDF iste
      const pdfResponse = await fetch(`${baseUrl}/api/report/pdf`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "1",
          "User-Agent": "Mozilla/5.0 PDFClient"
        }
      });
      
      const contentType = pdfResponse.headers.get("Content-Type");
      console.log("Content-Type of PDF response:", contentType);
      
      if (!pdfResponse.ok || !contentType.includes("application/pdf")) {
        const text = await pdfResponse.text(); // sadece hata varsa oku
        console.error(" PDF generation failed. Server responded with:", text.slice(0, 300));
        alert("PDF alınamadı:\n" + text);
        return;
      }
      
      // ✅ sadece buraya geldiysen blob al
      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "FlowchartReport.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
  
    } catch (error) {
      console.error("Error during save as PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  

  const getOperationIcons = (selectedType) => {
    const operationTypes = ['OPERATION', 'TRANSPORTATION', 'INSPECTION', 'DELAY', 'STORAGE'];
  
    return (
      <div className={styles.operationSymbols}>
        {operationTypes.map((type) => (
          <div
            key={type}
            className={`${styles.symbolWrapper} ${selectedType === type ? styles.selected : ''}`}
          >
            <img
              src={`/${type.charAt(0) + type.slice(1).toLowerCase()}.svg`}
              alt={type}
              className={styles.symbolIcon}
            />
          </div>
        ))}
      </div>
    );
  };
  

  const calculateOperationPercentages = () => {
    if (steps.length === 0) return {
      Operation: 0,
      Transportation: 0,
      Delay: 0,
      Storage: 0,
      Inspection: 0
    };
  
    const counts = steps.reduce((acc, step) => {
      const type = (step.type || "").toUpperCase(); // normalize
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  
    const total = steps.length;
    return {
      Operation: Math.round((counts["OPERATION"] || 0) / total * 100),
      Transportation: Math.round((counts["TRANSPORTATION"] || 0) / total * 100),
      Delay: Math.round((counts["DELAY"] || 0) / total * 100),
      Storage: Math.round((counts["STORAGE"] || 0) / total * 100),
      Inspection: Math.round((counts["INSPECTION"] || 0) / total * 100)
    };
  };
  

  const operationPercentages = calculateOperationPercentages();

  // Calculate value-added and non-value-added percentages
  const calculateValueAddedPercentages = () => {
    if (steps.length === 0) return { valueAdded: 0, nonValueAdded: 0 };

    const valueAddedCount = steps.filter(step => step.isValueAdded).length;
    const totalSteps = steps.length;

    const valueAdded = Math.round((valueAddedCount / totalSteps) * 100);
    const nonValueAdded = 100 - valueAdded;

    return { valueAdded, nonValueAdded };
  };

  const { valueAdded, nonValueAdded } = calculateValueAddedPercentages();

  // SVG Donut Chart calculations
  const radius = 60;
  const strokeWidth = 15;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const valueAddedOffset = circumference * (1 - valueAdded / 100);

  // Calculate totals
  const totalTime = steps.reduce((sum, step) => sum + (Number(step.time) || 0), 0);
  const totalDistance = steps.reduce((sum, step) => sum + (Number(step.distance) || 0), 0);

  return (
    <div className={styles.resultPageContainer}>
      {/* Save icon with loading state */}
      
      

      <button
        type="button"
        onClick={handleSave}
        className={`${styles.downloadButton}`}
        style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        padding: "0.75rem 1.25rem",
        backgroundColor: "#6cb8f6",
        color: "#fff",
        border: "none",
        borderRadius: "50px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
        <FaSave />
        <span>Save as PDF</span>
      </button>



      <div ref={contentRef} className={styles.contentWrapper}>
        {/* SOL KISIM */}
        <div className={styles.leftSection}>
          <div className={styles.tablesContainer}>
            {/* Ana Tablo */}
            <div className={styles.mainTable}>
              {/* Tablo Başlığı */}
              <div className={styles.tableHeader}>
                <div className={styles.descriptionHeader}>Description</div>
                <div className={styles.timeHeader}>
                  <div>Time</div>
                  <div className={styles.unitText}>(sec)</div>
                </div>
                <div className={styles.distanceHeader}>
                  <div>Distance</div>
                  <div className={styles.unitText}>(m)</div>
                </div>
                <div className={styles.vaHeader}>VA/NVA</div>
              </div>

              {/* Tablo İçeriği */}
              <div className={styles.tableBody}>
                {steps.map((step, index) => (
                  <div key={index} className={styles.tableRow}>
                    <div className={styles.descriptionCell}>
                      <span className={styles.stepDescription}>{step.description}</span>
                    </div>
                    <div className={styles.timeCell}>{step.time}</div>
                    <div className={styles.distanceCell}>{step.distance}</div>
                    <div className={styles.vaCell}>
                      <span className={step.isValueAdded ? styles.valueAddedText : styles.nonValueAddedText}>
                        {step.isValueAdded ? 'V' : 'NV'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Toplam Değerler */}
              <div className={styles.tableTotals}>
                <div className={styles.totalTime}>Σ TIME: {totalTime} sec</div>
                <div className={styles.totalDistance}>Σ DISTANCE: {totalDistance} m</div>
              </div>
            </div>

            {/* Operation Tablosu */}
            <div className={styles.operationTable}>
              {/* Operation Tablo Başlığı */}
              <div className={styles.operationHeader}>
                <div className={styles.operationHeaderText}>
                  <div>Process Flow</div>
                  <div className={styles.operationSubHeader}>&nbsp;</div>
                </div>
              </div>

              {/* Operation Tablo İçeriği */}
              <div className={styles.operationBody}>
                {steps.map((step, index) => (
                  <div key={index} className={styles.operationRow}>
                    {getOperationIcons(step.type)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Total Ratios Section */}
          <div className={styles.totalRatiosSection}>
            <div className={styles.ratiosTitleLine}>
              <span>Total ratios</span>
            </div>
            <div className={styles.ratiosContainer}>
              <div className={`${styles.ratioBox} ${styles.operationRatio}`}>
                Operation {operationPercentages.Operation}%
              </div>
              <div className={`${styles.ratioBox} ${styles.transportationRatio}`}>
                Transportation {operationPercentages.Transportation}%
              </div>
              <div className={`${styles.ratioBox} ${styles.delayRatio}`}>
                Delay {operationPercentages.Delay}%
              </div>
              <div className={`${styles.ratioBox} ${styles.storageRatio}`}>
                Storage {operationPercentages.Storage}%
              </div>
              <div className={`${styles.ratioBox} ${styles.inspectionRatio}`}>
                Inspection {operationPercentages.Inspection}%
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ KISIM: Donut */}
        <div className={styles.rightSection}>
          <div className={styles.donutContainer}>
            <div className={styles.chartWrapper}>
              {steps.length > 0 ? (
                <svg
                  className={styles.donutChart}
                  width="200"
                  height="200"
                  viewBox="-100 -100 200 200"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Non-Value-Added (Orange) */}
                  <circle
                    className={styles.donutRing}
                    cx="0"
                    cy="0"
                    r={normalizedRadius}
                    fill="transparent"
                    stroke="rgba(255, 159, 64, 0.8)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={0}
                    transform="rotate(-90)"
                  />
                  {/* Value-Added (Blue) */}
                  <circle
                    className={styles.donutSegment}
                    cx="0"
                    cy="0"
                    r={normalizedRadius}
                    fill="transparent"
                    stroke="rgba(54, 162, 235, 0.8)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={valueAddedOffset}
                    transform="rotate(-90)"
                  />
                </svg>
              ) : (
                <div className={styles.noDataMessage}>No data available</div>
              )}
            </div>
            <div className={styles.valueText}>
              <span className={styles.valueAddedText}>{valueAdded}% Value-Added</span>
            </div>
            <div className={styles.valueText}>
              <span className={styles.nonValueAddedText}>{nonValueAdded}% Non-Value-Added</span>
              <span className={styles.otherTypesText}>(other types)</span>
            </div>
            <div className={styles.infoIconContainer}>
              <FaInfoCircle className={styles.infoIcon} />
              <div className={styles.infoTooltip}>
                <div><strong>Value Added (VA):</strong> Steps that improve the product and make it more valuable to the customer. It involves operation type of process.</div>
                <div><strong>Non-Value Added (NVA):</strong> Steps that don't improve the product and are considered waste. It involves rest of the process types such as transportation, delay, storage and inspection.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Geri Butonu */}
      <div className={styles.backButtonContainer}>
        <button onClick={() => navigate("/input", { 
          state: { 
            steps: steps,
            time: totalTime,
            isPlaying: location.state?.isPlaying,
            videoSrc: location.state?.videoSrc,
            videoTime: location.state?.videoTime
          }
        })} className={styles.backButton}>
          ❮ Back
        </button>
      </div>
    </div>
  );
}
