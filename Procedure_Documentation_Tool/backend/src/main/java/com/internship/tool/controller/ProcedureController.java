package com.internship.tool.controller;

import com.internship.tool.dto.ProcedureRequest;
import com.internship.tool.dto.ProcedureResponse;
import com.internship.tool.dto.StatsResponse;
import com.internship.tool.entity.AuditLog;
import com.internship.tool.service.AuditLogService;
import com.internship.tool.service.ProcedureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/procedures")
@RequiredArgsConstructor
public class ProcedureController {

    private final ProcedureService procedureService;
    private final AuditLogService  auditLogService;

    // ── Get All / Search / Filter ────────────────────────────
    @GetMapping
    public ResponseEntity<Page<ProcedureResponse>> getAll(
            @RequestParam(defaultValue = "0")    int    page,
            @RequestParam(defaultValue = "10")   int    size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false)      String status,
            @RequestParam(required = false)      String search) {

        Page<ProcedureResponse> result =
            procedureService.getAll(page, size, sortBy, sortDir, status, search);
        return ResponseEntity.ok(result);
    }

    // ── Get By ID ────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ProcedureResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(procedureService.getById(id));
    }

    // ── Create ───────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ProcedureResponse> create(
            @Valid @RequestBody ProcedureRequest request) {
        ProcedureResponse created = procedureService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── Update ───────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<ProcedureResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProcedureRequest request) {
        return ResponseEntity.ok(procedureService.update(id, request));
    }

    // ── Delete ───────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        procedureService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Stats ────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(procedureService.getStats());
    }

    // ── Audit Logs ───────────────────────────────────────────
    @GetMapping("/{id}/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogService.getLogsForProcedure(id));
    }
}
