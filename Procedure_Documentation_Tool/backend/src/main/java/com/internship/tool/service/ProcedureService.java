package com.internship.tool.service;

import com.internship.tool.dto.ProcedureRequest;
import com.internship.tool.dto.ProcedureResponse;
import com.internship.tool.dto.StatsResponse;
import com.internship.tool.entity.Procedure;
import com.internship.tool.entity.Procedure.Status;
import com.internship.tool.entity.User;
import com.internship.tool.exception.ResourceNotFoundException;
import com.internship.tool.repository.ProcedureRepository;
import com.internship.tool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcedureService {

    private final ProcedureRepository procedureRepository;
    private final UserRepository       userRepository;
    private final AiServiceClient      aiServiceClient;
    private final AuditLogService      auditLogService;

    // ── Get All (RBAC) ────────────────────────────────────────
    public Page<ProcedureResponse> getAll(
            int page, int size,
            String sortBy, String sortDir,
            String status, String search) {

        String username = getCurrentUsername();
        String role     = getCurrentUserRole();

        // Safe sort field
        String safeSortBy = List.of(
            "createdAt", "updatedAt", "title", "status", "category", "id"
        ).contains(sortBy) ? sortBy : "createdAt";

        Sort sort = "asc".equalsIgnoreCase(sortDir)
            ? Sort.by(safeSortBy).ascending()
            : Sort.by(safeSortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Procedure> procedures;

        // ── ADMIN sees ALL procedures ─────────────────────────
        if ("ADMIN".equals(role)) {
            if (search != null && !search.trim().isEmpty()) {
                procedures = procedureRepository
                    .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                        search.trim(), search.trim(), pageable);
            } else if (status != null && !status.trim().isEmpty()) {
                try {
                    Status s = Status.valueOf(status.toUpperCase());
                    procedures = procedureRepository.findByStatus(s, pageable);
                } catch (IllegalArgumentException e) {
                    procedures = procedureRepository.findAll(pageable);
                }
            } else {
                procedures = procedureRepository.findAll(pageable);
            }
        }
        // ── USER sees ONLY their own procedures ───────────────
        else {
            if (search != null && !search.trim().isEmpty()) {
                procedures = procedureRepository
                    .findByCreatedByAndTitleContainingIgnoreCaseOrCreatedByAndDescriptionContainingIgnoreCase(
                        username, search.trim(),
                        username, search.trim(),
                        pageable);
            } else if (status != null && !status.trim().isEmpty()) {
                try {
                    Status s = Status.valueOf(status.toUpperCase());
                    procedures = procedureRepository
                        .findByCreatedByAndStatus(username, s, pageable);
                } catch (IllegalArgumentException e) {
                    procedures = procedureRepository
                        .findByCreatedBy(username, pageable);
                }
            } else {
                procedures = procedureRepository
                    .findByCreatedBy(username, pageable);
            }
        }

        return procedures.map(this::toResponse);
    }

    // ── Get By ID (RBAC) ──────────────────────────────────────
    public ProcedureResponse getById(Long id) {
        String username = getCurrentUsername();
        String role     = getCurrentUserRole();

        Procedure procedure = procedureRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Procedure not found with id: " + id));

        // USER can only view their own procedure
        if (!"ADMIN".equals(role) &&
            !procedure.getCreatedBy().equals(username)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You do not have permission to view this procedure.");
        }

        return toResponse(procedure);
    }

    // ── Create ────────────────────────────────────────────────
    @Transactional
    public ProcedureResponse create(ProcedureRequest request) {
        String username = getCurrentUsername();

        Procedure procedure = new Procedure();
        procedure.setTitle(request.getTitle());
        procedure.setDescription(request.getDescription());
        procedure.setCategory(request.getCategory());
        procedure.setTags(request.getTags());
        procedure.setCreatedBy(username);

        try {
            procedure.setStatus(Status.valueOf(
                request.getStatus().toUpperCase()));
        } catch (Exception e) {
            procedure.setStatus(Status.DRAFT);
        }

        // AI Generation
        try {
            String aiDesc = aiServiceClient.generateDescription(
                request.getTitle(), request.getDescription());
            String aiRec  = aiServiceClient.generateRecommendations(
                request.getTitle(), request.getDescription());
            String aiRep  = aiServiceClient.generateReport(
                request.getTitle(), request.getDescription());

            procedure.setAiDescription(aiDesc);
            procedure.setAiRecommendations(aiRec);
            procedure.setAiReport(aiRep);
            procedure.setAiFallback(false);
        } catch (Exception e) {
            log.warn("AI generation failed: {}", e.getMessage());
            procedure.setAiDescription("AI service unavailable. Please try again later.");
            procedure.setAiRecommendations("AI service unavailable. Please try again later.");
            procedure.setAiReport("AI service unavailable. Please try again later.");
            procedure.setAiFallback(true);
        }

        Procedure saved = procedureRepository.save(procedure);

        try {
            auditLogService.log(saved.getId(), "CREATE", username,
                "Procedure created: " + saved.getTitle());
        } catch (Exception e) {
            log.warn("Audit log failed: {}", e.getMessage());
        }

        return toResponse(saved);
    }

    // ── Update (RBAC) ─────────────────────────────────────────
    @Transactional
    public ProcedureResponse update(Long id, ProcedureRequest request) {
        String username = getCurrentUsername();
        String role     = getCurrentUserRole();

        Procedure procedure = procedureRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Procedure not found with id: " + id));

        // USER can only update their own procedure
        if (!"ADMIN".equals(role) &&
            !procedure.getCreatedBy().equals(username)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You do not have permission to update this procedure.");
        }

        procedure.setTitle(request.getTitle());
        procedure.setDescription(request.getDescription());
        procedure.setCategory(request.getCategory());
        procedure.setTags(request.getTags());
        procedure.setUpdatedAt(LocalDateTime.now());

        try {
            procedure.setStatus(Status.valueOf(
                request.getStatus().toUpperCase()));
        } catch (Exception e) {
            procedure.setStatus(Status.DRAFT);
        }

        // Regenerate AI
        try {
            String aiDesc = aiServiceClient.generateDescription(
                request.getTitle(), request.getDescription());
            String aiRec  = aiServiceClient.generateRecommendations(
                request.getTitle(), request.getDescription());
            String aiRep  = aiServiceClient.generateReport(
                request.getTitle(), request.getDescription());

            procedure.setAiDescription(aiDesc);
            procedure.setAiRecommendations(aiRec);
            procedure.setAiReport(aiRep);
            procedure.setAiFallback(false);
        } catch (Exception e) {
            log.warn("AI regeneration failed: {}", e.getMessage());
            procedure.setAiFallback(true);
        }

        Procedure saved = procedureRepository.save(procedure);

        try {
            auditLogService.log(saved.getId(), "UPDATE", username,
                "Procedure updated: " + saved.getTitle());
        } catch (Exception e) {
            log.warn("Audit log failed: {}", e.getMessage());
        }

        return toResponse(saved);
    }

    // ── Delete (RBAC) ─────────────────────────────────────────
    @Transactional
    public void delete(Long id) {
        String username = getCurrentUsername();
        String role     = getCurrentUserRole();

        Procedure procedure = procedureRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Procedure not found with id: " + id));

        // USER can only delete their own procedure
        if (!"ADMIN".equals(role) &&
            !procedure.getCreatedBy().equals(username)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You do not have permission to delete this procedure.");
        }

        try {
            auditLogService.log(id, "DELETE", username,
                "Procedure deleted: " + procedure.getTitle());
        } catch (Exception e) {
            log.warn("Audit log failed: {}", e.getMessage());
        }

        procedureRepository.deleteById(id);
    }

    // ── Stats (RBAC) ──────────────────────────────────────────
    public StatsResponse getStats() {
        String username = getCurrentUsername();
        String role     = getCurrentUserRole();

        try {
            // ADMIN sees global stats
            if ("ADMIN".equals(role)) {
                long total    = procedureRepository.count();
                long active   = procedureRepository.countByStatus(Status.ACTIVE);
                long draft    = procedureRepository.countByStatus(Status.DRAFT);
                long archived = procedureRepository.countByStatus(Status.ARCHIVED);
                return new StatsResponse(total, active, draft, archived);
            }
            // USER sees only their own stats
            else {
                long total    = procedureRepository.countByCreatedBy(username);
                long active   = procedureRepository.countByCreatedByAndStatus(username, Status.ACTIVE);
                long draft    = procedureRepository.countByCreatedByAndStatus(username, Status.DRAFT);
                long archived = procedureRepository.countByCreatedByAndStatus(username, Status.ARCHIVED);
                return new StatsResponse(total, active, draft, archived);
            }
        } catch (Exception e) {
            log.error("Stats error: {}", e.getMessage());
            return new StatsResponse(0, 0, 0, 0);
        }
    }

    // ── Helpers ───────────────────────────────────────────────
    private String getCurrentUsername() {
        try {
            return SecurityContextHolder.getContext()
                .getAuthentication().getName();
        } catch (Exception e) {
            return "system";
        }
    }

    private String getCurrentUserRole() {
        try {
            return SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("USER");
        } catch (Exception e) {
            return "USER";
        }
    }

    private ProcedureResponse toResponse(Procedure p) {
        ProcedureResponse r = new ProcedureResponse();
        r.setId(p.getId());
        r.setTitle(p.getTitle());
        r.setDescription(p.getDescription());
        r.setCategory(p.getCategory());
        r.setTags(p.getTags());
        r.setStatus(p.getStatus() != null ? p.getStatus().name() : "DRAFT");
        r.setCreatedBy(p.getCreatedBy());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        r.setAiDescription(p.getAiDescription());
        r.setAiRecommendations(p.getAiRecommendations());
        r.setAiReport(p.getAiReport());
        r.setAiFallback(p.isAiFallback());
        return r;
    }
}
