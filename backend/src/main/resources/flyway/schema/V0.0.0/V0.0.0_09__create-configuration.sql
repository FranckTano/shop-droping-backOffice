-- Table de configuration du site (numéro WhatsApp admin, etc.)
CREATE TABLE configuration (
    id BIGINT PRIMARY KEY,
    cle VARCHAR(100) NOT NULL UNIQUE,
    valeur TEXT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE SEQUENCE configuration_id_seq START WITH 1 INCREMENT BY 50;
ALTER TABLE configuration ALTER COLUMN id SET DEFAULT nextval('configuration_id_seq');

-- Insertion des configurations par défaut
INSERT INTO configuration (id, cle, valeur, description) VALUES
(1, 'whatsapp_numero', '+22900000000', 'Numéro WhatsApp de l''administrateur pour les commandes'),
(2, 'nom_boutique', 'Shop Droping', 'Nom de la boutique'),
(3, 'devise', 'XOF', 'Devise utilisée (FCFA)'),
(4, 'email_contact', 'contact@shop-droping.com', 'Email de contact'),
(5, 'message_whatsapp_template', 'Bonjour, je souhaite commander les articles suivants:', 'Template du message WhatsApp');

