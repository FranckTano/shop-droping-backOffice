-- Aligne les colonnes url/url_image pour eviter les erreurs d'insertion selon les versions de schema.

ALTER TABLE produit_image
    ADD COLUMN IF NOT EXISTS url_image VARCHAR(500);

ALTER TABLE produit_image
    ADD COLUMN IF NOT EXISTS url VARCHAR(500);

UPDATE produit_image
SET url_image = COALESCE(url_image, url)
WHERE url_image IS NULL;

UPDATE produit_image
SET url = COALESCE(url, url_image)
WHERE url IS NULL;

ALTER TABLE produit_image
    ALTER COLUMN url_image SET NOT NULL;
