-- Migration performance : index manquants identifiés lors de l'audit

-- Index sur commande.created_at (utilisé par dashboard stats, chiffreAffairesParMois)
CREATE INDEX IF NOT EXISTS idx_commande_created_at ON commande(created_at DESC);

-- Index sur commande.statut (filtrages fréquents par statut)
CREATE INDEX IF NOT EXISTS idx_commande_statut ON commande(statut);

-- Index sur commande.client_telephone (suivi commande par téléphone)
CREATE INDEX IF NOT EXISTS idx_commande_client_telephone ON commande(client_telephone);

-- Index sur produit.categorie_id (filtrages par catégorie)
CREATE INDEX IF NOT EXISTS idx_produit_categorie_id ON produit(categorie_id);

-- Index sur produit.actif (lister produits actifs uniquement)
CREATE INDEX IF NOT EXISTS idx_produit_actif ON produit(actif);

-- Index composite produit actif + categorie (requête la plus fréquente)
CREATE INDEX IF NOT EXISTS idx_produit_actif_categorie ON produit(actif, categorie_id);

-- Colonne version manquante sur ligne_commande (optimistic locking)
ALTER TABLE ligne_commande ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
