-- Table des commandes (pour tracking, même si validation par WhatsApp)
CREATE TABLE commande (
    id BIGINT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    client_nom VARCHAR(100) NOT NULL,
    client_telephone VARCHAR(50) NOT NULL,
    client_email VARCHAR(100),
    client_adresse TEXT,
    montant_total DECIMAL(10, 2) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'EN_ATTENTE', -- EN_ATTENTE, CONFIRMEE, LIVREE, ANNULEE
    notes TEXT,
    whatsapp_message_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE SEQUENCE commande_id_seq START WITH 1 INCREMENT BY 50;
ALTER TABLE commande ALTER COLUMN id SET DEFAULT nextval('commande_id_seq');

CREATE INDEX idx_commande_statut ON commande(statut);
CREATE INDEX idx_commande_created ON commande(created_at);

