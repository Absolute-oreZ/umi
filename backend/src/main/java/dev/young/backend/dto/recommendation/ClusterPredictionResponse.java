package dev.young.backend.dto.recommendation;

import lombok.Data;

import java.util.Map;

@Data
public class ClusterPredictionResponse {
    Integer clusterId;
    private Map<String, Double> features;
}