package com.internship.tool.service;

import com.internship.tool.entity.AuditLog;
import com.internship.tool.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(Long procedureId, String action,
                    String performedBy, String details) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setProcedureId(procedureId);
            auditLog.setAction(action);
            auditLog.setPerformedBy(performedBy);
            auditLog.setDetails(details);
            auditLog.setTimestamp(LocalDateTime.now());
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to save audit log: {}", e.getMessage());
        }
    }

    public List<AuditLog> getLogsForProcedure(Long procedureId) {
        return auditLogRepository.findByProcedureIdOrderByTimestampDesc(procedureId);
    }
}
