-- Champs supplementaires pour le catalogue et les options de commande.

ALTER TABLE produit
    ADD COLUMN IF NOT EXISTS couleurs_disponibles VARCHAR(255);

ALTER TABLE ligne_commande
    ADD COLUMN IF NOT EXISTS couleur VARCHAR(30),
    ADD COLUMN IF NOT EXISTS badges_officiels BOOLEAN,
    ADD COLUMN IF NOT EXISTS flocage BOOLEAN,
    ADD COLUMN IF NOT EXISTS flocage_nom VARCHAR(100),
    ADD COLUMN IF NOT EXISTS flocage_numero VARCHAR(20),
    ADD COLUMN IF NOT EXISTS prix_options_unitaire DECIMAL(10, 2);

UPDATE ligne_commande
SET couleur = COALESCE(couleur, 'Standard'),
    badges_officiels = COALESCE(badges_officiels, FALSE),
    flocage = COALESCE(flocage, FALSE),
    prix_options_unitaire = COALESCE(prix_options_unitaire, 0)
WHERE couleur IS NULL
   OR badges_officiels IS NULL
   OR flocage IS NULL
   OR prix_options_unitaire IS NULL;

ALTER TABLE ligne_commande
    ALTER COLUMN couleur SET DEFAULT 'Standard',
    ALTER COLUMN badges_officiels SET DEFAULT FALSE,
    ALTER COLUMN flocage SET DEFAULT FALSE,
    ALTER COLUMN prix_options_unitaire SET DEFAULT 0;
