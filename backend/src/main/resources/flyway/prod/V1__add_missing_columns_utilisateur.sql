-- Ajout des colonnes manquantes dans la table utilisateur
-- IF NOT EXISTS évite l'erreur si la colonne existe déjà
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS telephone character varying(20);
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS recevoir_commandes boolean DEFAULT false;
