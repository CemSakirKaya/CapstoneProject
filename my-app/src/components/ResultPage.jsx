import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./ResultPage.module.css";
import { FaSave, FaInfoCircle } from "react-icons/fa";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const steps = location.state?.steps || [];
  const contentRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // PDF generation code will be implemented later
      alert('PDF generation feature is coming soon!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getOperationIcons = (selectedType) => {
    const operationTypes = ['Operation', 'Transportation', 'Inspection', 'Delay', 'Storage'];
    
    return (
      <div className={styles.operationSymbols}>
        {operationTypes.map((type) => (
          <div 
            key={type} 
            className={`${styles.symbolWrapper} ${selectedType === type ? styles.selected : ''}`}
          >
            <img 
              src={`/${type}.svg`} 
              alt={type} 
              className={styles.symbolIcon}
            />
          </div>
        ))}
      </div>
    );
  };

  // Calculate percentages for each operation type
  const calculateOperationPercentages = () => {
    if (steps.length === 0) return {
      Operation: 0,
      Transportation: 0,
      Delay: 0,
      Storage: 0,
      Inspection: 0
    };

    const counts = steps.reduce((acc, step) => {
      acc[step.operationType] = (acc[step.operationType] || 0) + 1;
      return acc;
    }, {});

    const total = steps.length;
    return {
      Operation: Math.round((counts.Operation || 0) / total * 100),
      Transportation: Math.round((counts.Transportation || 0) / total * 100),
      Delay: Math.round((counts.Delay || 0) / total * 100),
      Storage: Math.round((counts.Storage || 0) / total * 100),
      Inspection: Math.round((counts.Inspection || 0) / total * 100)
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
      <div 
        className={`${styles.saveIcon} ${isSaving ? styles.saving : ''}`} 
        onClick={handleSave}
      >
        <FaSave size={20} />
        <span className={styles.saveIconText}>
          {isSaving ? 'Saving...' : 'Save as PDF'}
        </span>
      </div>

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
                    {getOperationIcons(step.operationType)}
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
