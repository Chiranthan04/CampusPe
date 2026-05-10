package com.internship.tool.repository;

import com.internship.tool.entity.Procedure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcedureRepository extends JpaRepository<Procedure, Long> {

    // ── ADMIN — sees all ──────────────────────────────────────
    Page<Procedure> findByStatus(Procedure.Status status, Pageable pageable);

    Page<Procedure> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
        String title, String description, Pageable pageable);

    long countByStatus(Procedure.Status status);

    // ── USER — sees only own ──────────────────────────────────
    Page<Procedure> findByCreatedBy(String createdBy, Pageable pageable);

    Page<Procedure> findByCreatedByAndStatus(
        String createdBy, Procedure.Status status, Pageable pageable);

    Page<Procedure> findByCreatedByAndTitleContainingIgnoreCaseOrCreatedByAndDescriptionContainingIgnoreCase(
        String createdBy1, String title,
        String createdBy2, String description,
        Pageable pageable);

    long countByCreatedBy(String createdBy);

    long countByCreatedByAndStatus(String createdBy, Procedure.Status status);
}
