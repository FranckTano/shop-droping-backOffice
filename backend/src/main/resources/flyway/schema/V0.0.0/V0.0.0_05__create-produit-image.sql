-- Table des images produits (plusieurs images par produit)
CREATE TABLE produit_image (
    id BIGINT PRIMARY KEY,
    produit_id BIGINT NOT NULL REFERENCES produit(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    ordre INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE SEQUENCE produit_image_id_seq START WITH 1 INCREMENT BY 50;
ALTER TABLE produit_image ALTER COLUMN id SET DEFAULT nextval('produit_image_id_seq');

CREATE INDEX idx_produit_image_produit ON produit_image(produit_id);

