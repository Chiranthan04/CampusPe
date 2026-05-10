package com.internship.tool.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.Map;

@Slf4j
@Service
public class AiServiceClient {

    @Value("${ai.service.url:http://ai-service:5001}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Public methods called by ProcedureService ─────────────
    public String generateDescription(String title, String description) {
        String content = "Title: " + title + "\n\nDescription: " + description;
        Map<String, Object> response = callAiService("/describe", content);
        if (response != null && response.containsKey("description")) {
            return response.get("description").toString();
        }
        throw new RuntimeException("No description in response");
    }

    public String generateRecommendations(String title, String description) {
        String content = "Title: " + title + "\n\nDescription: " + description;
        Map<String, Object> response = callAiService("/recommend", content);
        if (response != null && response.containsKey("recommendations")) {
            return response.get("recommendations").toString();
        }
        throw new RuntimeException("No recommendations in response");
    }

    public String generateReport(String title, String description) {
        String content = "Title: " + title + "\n\nDescription: " + description;
        Map<String, Object> response = callAiService("/generate-report", content);
        if (response != null && response.containsKey("report")) {
            return response.get("report").toString();
        }
        throw new RuntimeException("No report in response");
    }

    // ── Private helper ────────────────────────────────────────
    private Map<String, Object> callAiService(String endpoint, String content) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // AI service expects "content" field
            Map<String, String> body = Map.of("content", content);

            HttpEntity<Map<String, String>> request =
                new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                aiServiceUrl + endpoint, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()
                    && response.getBody() != null) {
                return response.getBody();
            }
            throw new RuntimeException("AI service returned: "
                + response.getStatusCode());

        } catch (Exception e) {
            log.warn("AI service call failed [{}]: {}", endpoint, e.getMessage());
            throw new RuntimeException("AI service unavailable: " + e.getMessage());
        }
    }
}
