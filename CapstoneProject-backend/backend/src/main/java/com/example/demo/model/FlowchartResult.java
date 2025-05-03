package com.example.demo.model;

import java.util.List;
import java.util.Map;

public class FlowchartResult {
    private int totalTime;
    private int totalDistance;
    private Map<ProcessType, Long> typeCounts;
    private double valueAddedRatio;
    private double nonValueAddedRatio;
    private List<ProcessStep> steps;

    public FlowchartResult(
            int totalTime,
            int totalDistance,
            Map<ProcessType, Long> typeCounts,
            double valueAddedRatio,
            double nonValueAddedRatio,
            List<ProcessStep> steps
    ) {
        this.totalTime = totalTime;
        this.totalDistance = totalDistance;
        this.typeCounts = typeCounts;
        this.valueAddedRatio = valueAddedRatio;
        this.nonValueAddedRatio = nonValueAddedRatio;
        this.steps = steps;
    }

    public int getTotalTime() {
        return totalTime;
    }

    public void setTotalTime(int totalTime) {
        this.totalTime = totalTime;
    }

    public int getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(int totalDistance) {
        this.totalDistance = totalDistance;
    }

    public Map<ProcessType, Long> getTypeCounts() {
        return typeCounts;
    }

    public void setTypeCounts(Map<ProcessType, Long> typeCounts) {
        this.typeCounts = typeCounts;
    }

    public double getValueAddedRatio() {
        return valueAddedRatio;
    }

    public void setValueAddedRatio(double valueAddedRatio) {
        this.valueAddedRatio = valueAddedRatio;
    }

    public double getNonValueAddedRatio() {
        return nonValueAddedRatio;
    }

    public void setNonValueAddedRatio(double nonValueAddedRatio) {
        this.nonValueAddedRatio = nonValueAddedRatio;
    }

    public List<ProcessStep> getSteps() {
        return steps;
    }

    public void setSteps(List<ProcessStep> steps) {
        this.steps = steps;
    }
}
