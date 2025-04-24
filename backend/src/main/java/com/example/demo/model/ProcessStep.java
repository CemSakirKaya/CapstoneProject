package com.example.demo.model;

public class ProcessStep {
    private String description;
    private ProcessType type;
    private int time;
    private int distance;

    public ProcessStep(String description, ProcessType type, int time, int distance) {
        this.description = description;
        this.type = type;
        this.time = time;
        this.distance = distance;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ProcessType getType() { return type; }
    public void setType(ProcessType type) { this.type = type; }
    public int getTime() { return time; }
    public void setTime(int time) { this.time = time; }
    public int getDistance() { return distance; }
    public void setDistance(int distance) { this.distance = distance; }
}
