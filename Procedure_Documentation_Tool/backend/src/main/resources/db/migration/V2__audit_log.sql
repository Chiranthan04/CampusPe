-- Add index on audit_logs for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_procedure_id
    ON audit_logs(procedure_id);

-- Add index on procedures status
CREATE INDEX IF NOT EXISTS idx_procedures_status
    ON procedures(status);

-- Add index on procedures created_at
CREATE INDEX IF NOT EXISTS idx_procedures_created_at
    ON procedures(created_at DESC);
