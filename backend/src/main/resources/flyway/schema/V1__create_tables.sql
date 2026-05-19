-- V1__create_tables.sql

-- Suppression de la table si elle existe
DROP TABLE IF EXISTS categorie CASCADE;

-- Création de la table des catégories
CREATE TABLE categorie (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    date_modification TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Création de la table des produits
DROP TABLE IF EXISTS produit CASCADE;
CREATE TABLE produit (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    prix NUMERIC(10, 2) NOT NULL,
    prix_promo NUMERIC(10, 2),
    categorie_id BIGINT REFERENCES categorie(id),
    image_principale VARCHAR(500),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    en_promotion BOOLEAN NOT NULL DEFAULT FALSE,
    nouveau BOOLEAN NOT NULL DEFAULT FALSE,
    equipe VARCHAR(100),
    saison VARCHAR(20),
    marque VARCHAR(50),
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    date_modification TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Création de la table des images de produits
DROP TABLE IF EXISTS produit_image CASCADE;
CREATE TABLE produit_image (
    id BIGSERIAL PRIMARY KEY,
    produit_id BIGINT NOT NULL REFERENCES produit(id),
    url_image VARCHAR(500) NOT NULL,
    legende VARCHAR(255),
    ordre INTEGER,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    date_modification TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Création de la table des tailles de produits
DROP TABLE IF EXISTS produit_taille CASCADE;
CREATE TABLE produit_taille (
    id BIGSERIAL PRIMARY KEY,
    produit_id BIGINT NOT NULL REFERENCES produit(id),
    taille VARCHAR(20) NOT NULL,
    stock INTEGER,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    date_modification TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UNIQUE (produit_id, taille)
);

-- Création de la table des utilisateurs
DROP TABLE IF EXISTS utilisateur CASCADE;
CREATE TABLE utilisateur (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255),
    telephone VARCHAR(20),
    role VARCHAR(50),
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    date_modification TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Création de la table des commandes
DROP TABLE IF EXISTS commande CASCADE;
CREATE TABLE commande (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT REFERENCES utilisateur(id),
    date_commande TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    statut VARCHAR(50),
    montant_total NUMERIC(10, 2),
    adresse_livraison TEXT,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    date_modification TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Création de la table des lignes de commande
DROP TABLE IF EXISTS ligne_commande CASCADE;
CREATE TABLE ligne_commande (
    id BIGSERIAL PRIMARY KEY,
    commande_id BIGINT NOT NULL REFERENCES commande(id),
    produit_id BIGINT NOT NULL REFERENCES produit(id),
    quantite INTEGER NOT NULL,
    prix_unitaire NUMERIC(10, 2) NOT NULL,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    date_modification TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Insertion des catégories initiales
INSERT INTO categorie (nom, description) VALUES
('actuel', 'Maillots de la saison actuelle'),
('vintage-court', 'Maillots vintage à manches courtes'),
('vintage-long', 'Maillots vintage à manches longues'),
('collection', 'Maillots de collection');
