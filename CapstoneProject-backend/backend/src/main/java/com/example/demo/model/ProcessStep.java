package com.example.demo.model;

public class ProcessStep {

    private String description;
    private int time;
    private int distance;
    private ProcessType type;
    private boolean valueAdded;

    public ProcessStep() {
    }

    public ProcessStep(String description, int time, int distance, ProcessType type, boolean valueAdded) {
        this.description = description;
        this.time = time;
        this.distance = distance;
        this.type = type;
        this.valueAdded = valueAdded;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getTime() {
        return time;
    }

    public void setTime(int time) {
        this.time = time;
    }

    public int getDistance() {
        return distance;
    }

    public void setDistance(int distance) {
        this.distance = distance;
    }

    public ProcessType getType() {
        return type;
    }

    public void setType(ProcessType type) {
        this.type = type;
    }

    public boolean isValueAdded() {
        return valueAdded;
    }

    public void setValueAdded(boolean valueAdded) {
        this.valueAdded = valueAdded;
    }
}
