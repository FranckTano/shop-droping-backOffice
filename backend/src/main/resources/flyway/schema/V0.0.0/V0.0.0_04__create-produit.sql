-- Table des produits (Maillots)
CREATE TABLE produit (
    id BIGINT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    prix DECIMAL(10, 2) NOT NULL,
    prix_promo DECIMAL(10, 2),
    categorie_id BIGINT REFERENCES categorie(id),
    image_principale VARCHAR(500),
    actif BOOLEAN DEFAULT TRUE,
    en_promotion BOOLEAN DEFAULT FALSE,
    nouveau BOOLEAN DEFAULT FALSE,
    equipe VARCHAR(100),
    saison VARCHAR(20),
    marque VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE SEQUENCE produit_id_seq START WITH 1 INCREMENT BY 50;
ALTER TABLE produit ALTER COLUMN id SET DEFAULT nextval('produit_id_seq');

CREATE INDEX idx_produit_categorie ON produit(categorie_id);
CREATE INDEX idx_produit_actif ON produit(actif);

