CREATE TABLE utilisateur
(
    id BIGINT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL
        DEFAULT '$2b$10$Y9Z0x6dYk9zJzX4zF4Zp0eM5f8xV9pYy6XKZ2X9bZ0mZc7Ww1r2aS',
    -- Mot de passe par défaut : shopdroping2026
    nom VARCHAR(100) NOT NULL,
    prenoms VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'ACTIF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE SEQUENCE utilisateur_id_seq
    START WITH 1
    INCREMENT BY 50;

ALTER TABLE utilisateur
    ALTER COLUMN id SET DEFAULT nextval('utilisateur_id_seq');
