package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ProcessType {
    OPERATION, TRANSPORTATION, DELAY, STORAGE, INSPECTION;

    @JsonCreator
    public static ProcessType fromString(String value) {
        return ProcessType.valueOf(value.toUpperCase());
    }
}
