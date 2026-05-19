-- Align schema with current JPA entities used by ecommerce endpoints.

-- categorie
ALTER TABLE categorie ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE categorie ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE categorie ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE categorie ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE categorie ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE categorie ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

UPDATE categorie
SET created_at = COALESCE(created_at, date_creation),
    updated_at = COALESCE(updated_at, date_modification)
WHERE created_at IS NULL OR updated_at IS NULL;

-- produit
ALTER TABLE produit ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE produit ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE produit ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE produit ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE produit ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

UPDATE produit
SET created_at = COALESCE(created_at, date_creation),
    updated_at = COALESCE(updated_at, date_modification)
WHERE created_at IS NULL OR updated_at IS NULL;

-- produit_image
ALTER TABLE produit_image ADD COLUMN IF NOT EXISTS url VARCHAR(500);
ALTER TABLE produit_image ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE produit_image ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE produit_image ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE produit_image ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE produit_image ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

UPDATE produit_image
SET url = COALESCE(url, url_image),
    created_at = COALESCE(created_at, date_creation),
    updated_at = COALESCE(updated_at, date_modification)
WHERE url IS NULL OR created_at IS NULL OR updated_at IS NULL;

-- produit_taille
ALTER TABLE produit_taille ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE produit_taille ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE produit_taille ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE produit_taille ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE produit_taille ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

UPDATE produit_taille
SET created_at = COALESCE(created_at, date_creation),
    updated_at = COALESCE(updated_at, date_modification)
WHERE created_at IS NULL OR updated_at IS NULL;

-- commande
ALTER TABLE commande ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE commande ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE commande ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE commande ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE commande ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

UPDATE commande
SET created_at = COALESCE(created_at, date_creation),
    updated_at = COALESCE(updated_at, date_modification)
WHERE created_at IS NULL OR updated_at IS NULL;

-- ligne_commande
ALTER TABLE ligne_commande ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE ligne_commande ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE ligne_commande ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE ligne_commande ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE ligne_commande ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

UPDATE ligne_commande
SET created_at = COALESCE(created_at, date_creation),
    updated_at = COALESCE(updated_at, date_modification)
WHERE created_at IS NULL OR updated_at IS NULL;
