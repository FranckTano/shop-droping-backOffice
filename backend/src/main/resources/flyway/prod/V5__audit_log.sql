-- Migration V5 : Table de traçabilité des actions admin

CREATE SEQUENCE IF NOT EXISTS audit_log_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS audit_log (
    id               BIGINT        NOT NULL DEFAULT nextval('audit_log_seq') PRIMARY KEY,
    admin_username   VARCHAR(100)  NOT NULL,
    admin_nom        VARCHAR(200),
    type_action      VARCHAR(30)   NOT NULL,
    type_entite      VARCHAR(30)   NOT NULL,
    entite_id        BIGINT,
    entite_reference VARCHAR(100),
    description      VARCHAR(500)  NOT NULL,
    created_at       TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at      ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_username  ON audit_log(admin_username);
CREATE INDEX IF NOT EXISTS idx_audit_log_type_entite     ON audit_log(type_entite);
