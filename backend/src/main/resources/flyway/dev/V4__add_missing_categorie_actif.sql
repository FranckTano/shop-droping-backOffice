-- Missing column required by Categorie entity.
ALTER TABLE categorie
    ADD COLUMN IF NOT EXISTS actif BOOLEAN NOT NULL DEFAULT TRUE;
