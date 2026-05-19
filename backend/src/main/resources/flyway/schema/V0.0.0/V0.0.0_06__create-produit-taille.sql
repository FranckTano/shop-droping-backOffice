-- Table des tailles disponibles par produit avec stock
CREATE TABLE produit_taille (
    id BIGINT PRIMARY KEY,
    produit_id BIGINT NOT NULL REFERENCES produit(id) ON DELETE CASCADE,
    taille VARCHAR(10) NOT NULL, -- XS, S, M, L, XL, XXL, etc.
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_produit_taille UNIQUE (produit_id, taille)
);

CREATE SEQUENCE produit_taille_id_seq START WITH 1 INCREMENT BY 50;
ALTER TABLE produit_taille ALTER COLUMN id SET DEFAULT nextval('produit_taille_id_seq');

CREATE INDEX idx_produit_taille_produit ON produit_taille(produit_id);

