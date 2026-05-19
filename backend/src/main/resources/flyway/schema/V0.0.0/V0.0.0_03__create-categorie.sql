-- Table des catégories de produits (ex: Maillots Clubs, Maillots Équipes Nationales, etc.)
CREATE TABLE categorie (
    id BIGINT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE SEQUENCE categorie_id_seq START WITH 1 INCREMENT BY 50;
ALTER TABLE categorie ALTER COLUMN id SET DEFAULT nextval('categorie_id_seq');

