package com.example.demo.controller;

import com.example.demo.model.ProcessStep;
import com.example.demo.model.ProcessType;
import com.example.demo.model.FlowchartResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flowchart")
public class FlowchartController {

    private final List<ProcessStep> processSteps = new ArrayList<>();

    // ✔ Artık sadece OPERATION value-added olarak kabul ediliyor
    private static final Set<ProcessType> VALUE_ADDED_TYPES = Set.of(ProcessType.OPERATION);

    @PostMapping("/add-step")
    public ResponseEntity<String> addStep(@RequestBody ProcessStep step) {
        processSteps.add(step);
        return ResponseEntity.ok("Step added: " + step.getDescription() + " (" + step.getType() + ")");
    }

    @GetMapping("/result")
    public ResponseEntity<FlowchartResult> getResult() {
        int totalTime = processSteps.stream().mapToInt(ProcessStep::getTime).sum();
        int totalDistance = processSteps.stream().mapToInt(ProcessStep::getDistance).sum();

        Map<ProcessType, Long> typeCounts = processSteps.stream()
                .collect(Collectors.groupingBy(ProcessStep::getType, Collectors.counting()));

        long totalSteps = processSteps.size();
        long valueAddedCount = processSteps.stream()
                .filter(step -> VALUE_ADDED_TYPES.contains(step.getType()))
                .count();

        double valueAddedRatio = (double) valueAddedCount / totalSteps * 100;
        double nonValueAddedRatio = 100.0 - valueAddedRatio;

        FlowchartResult result = new FlowchartResult(
                totalTime,
                totalDistance,
                typeCounts,
                valueAddedRatio,
                nonValueAddedRatio,
                processSteps
        );

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/reset")
    public ResponseEntity<String> resetFlowchart() {
        processSteps.clear();
        return ResponseEntity.ok("Flowchart reset.");
    }

    public List<ProcessStep> getProcessSteps() {
        return processSteps;
    }
}
