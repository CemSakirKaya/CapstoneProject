import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ResultPage.module.css";
import { FaSave, FaInfoCircle } from "react-icons/fa";

export default function ResultPage() {
  const navigate = useNavigate();

  const handleSave = () => {
    alert("Save as PNG (placeholder)!");
  };

  return (
    <div className={styles.resultPageContainer}>
      {/* Sağ üstte Save ikonu */}
      <div className={styles.saveIcon} onClick={handleSave}>
        <FaSave size={20} />
      </div>

      {/* Sol altta Back butonu */}
      <div className={styles.backButtonContainer}>
        <button onClick={() => navigate("/input")} className={styles.backButton}>
          ❮ Back
        </button>
      </div>

      {/* SOL KISIM */}
      <div className={styles.leftSection}>
        {/* Steps + Table yan yana */}
        <div className={styles.stepsAndTableRow}>
          {/* Step Listesi */}
          <div className={styles.stepsColumn}>
            <div className={styles.stepItem}>Step 1: Lorem ipsum</div>
            <div className={styles.stepItem}>Step 2: Dolor sit amet</div>
            <div className={styles.stepItem}>Step 3: Consectetur</div>
          </div>

          {/* Time/Distance Tablosu */}
          <div className={styles.tableColumn}>
            <div className={styles.tableHeaderRow}>
              <span className={styles.headerCell}>Time</span>
              <span className={styles.headerCell}>Distance</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataCell}>3</span>
              <span className={styles.dataCell}>12</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataCell}>5</span>
              <span className={styles.dataCell}>7</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataCell}>2</span>
              <span className={styles.dataCell}>3</span>
            </div>

            {/* 
              Toplam Time & Distance + Total Ratios 
              Aynı satırda, yan yana
            */}
            <div className={styles.totalsAndRatiosRow}>
              {/* Sol kısım: Σ TIME & Σ DISTANCE */}
              <div className={styles.totalsRow}>
                <span>Σ TIME: 10s</span>
                <span>Σ DISTANCE: 22cm</span>
              </div>

              {/* Sağ kısım: Total Ratios */}
              <div className={styles.ratiosArea}>
                <div className={styles.ratiosTitleLine}>
                  <span>Total ratios</span>
                  <FaInfoCircle className={styles.infoIcon} />
                </div>
                <div className={styles.ratiosRow}>
                  <span className={styles.ratioBox}>Operation %53</span>
                  <span className={styles.ratioBox}>Transportation %14</span>
                  <span className={styles.ratioBox}>Delay %5</span>
                  <span className={styles.ratioBox}>Storage %18</span>
                  <span className={styles.ratioBox}>Inspection %10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SAĞ KISIM: Donut */}
      <div className={styles.rightSection}>
        <div className={styles.donutContainer}>
          <div className={styles.valueText}>65% Value-Added</div>
          <div className={styles.valueText}>35% Non-Value-Added</div>
        </div>
      </div>
    </div>
  );
}
