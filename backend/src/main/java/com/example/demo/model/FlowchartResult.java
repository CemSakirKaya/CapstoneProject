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

    public FlowchartResult(int totalTime, int totalDistance, Map<ProcessType, Long> typeCounts, 
        double valueAddedRatio, double nonValueAddedRatio, List<ProcessStep> steps) {
        this.totalTime = totalTime;
        this.totalDistance = totalDistance;
        this.typeCounts = typeCounts;
        this.valueAddedRatio = valueAddedRatio;
        this.nonValueAddedRatio = nonValueAddedRatio;
        this.steps = steps;
    }

    public int getTotalTime() { return totalTime; }
    public int getTotalDistance() { return totalDistance; }
    public Map<ProcessType, Long> getTypeCounts() { return typeCounts; }
    public double getValueAddedRatio() { return valueAddedRatio; }
    public double getNonValueAddedRatio() { return nonValueAddedRatio; }
    public List<ProcessStep> getSteps() { return steps; }
}
