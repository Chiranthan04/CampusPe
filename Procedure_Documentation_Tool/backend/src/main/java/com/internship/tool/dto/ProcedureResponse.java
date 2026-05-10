package com.internship.tool.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcedureResponse {

    private Long          id;
    private String        title;
    private String        description;
    private String        category;
    private String        tags;
    private String        status;
    private String        createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String        aiDescription;
    private String        aiRecommendations;
    private String        aiReport;
    private boolean       aiFallback;
}
