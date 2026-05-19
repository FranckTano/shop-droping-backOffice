-- Table des lignes de commande
CREATE TABLE ligne_commande (
    id BIGINT PRIMARY KEY,
    commande_id BIGINT NOT NULL REFERENCES commande(id) ON DELETE CASCADE,
    produit_id BIGINT NOT NULL REFERENCES produit(id),
    taille VARCHAR(10) NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    prix_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE SEQUENCE ligne_commande_id_seq START WITH 1 INCREMENT BY 50;
ALTER TABLE ligne_commande ALTER COLUMN id SET DEFAULT nextval('ligne_commande_id_seq');

CREATE INDEX idx_ligne_commande_commande ON ligne_commande(commande_id);
CREATE INDEX idx_ligne_commande_produit ON ligne_commande(produit_id);

