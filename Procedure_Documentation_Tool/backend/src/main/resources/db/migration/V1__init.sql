-- Users table
CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name  VARCHAR(50),
    role       VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Procedures table
CREATE TABLE IF NOT EXISTS procedures (
    id                 BIGSERIAL PRIMARY KEY,
    title              VARCHAR(255) NOT NULL,
    description        TEXT,
    category           VARCHAR(100),
    tags               VARCHAR(255),
    status             VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    created_by         VARCHAR(100),
    ai_description     TEXT,
    ai_recommendations TEXT,
    ai_report          TEXT,
    ai_fallback        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGSERIAL PRIMARY KEY,
    procedure_id BIGINT,
    action       VARCHAR(50),
    performed_by VARCHAR(100),
    details      TEXT,
    timestamp    TIMESTAMP DEFAULT NOW()
);
