-- Données de test pour le développement
-- Insertion des catégories
INSERT INTO categorie (id, nom, description, image_url, actif) VALUES
(1, 'Maillots Clubs', 'Maillots des plus grands clubs européens', '/images/categories/clubs.jpg', true),
(2, 'Maillots Équipes Nationales', 'Maillots des sélections nationales', '/images/categories/nations.jpg', true),
(3, 'Maillots Rétro', 'Maillots vintage et collector', '/images/categories/retro.jpg', true),
(4, 'Promotions', 'Maillots en promotion', '/images/categories/promo.jpg', true);

-- Insertion des produits (Maillots)
INSERT INTO produit (id, nom, description, prix, prix_promo, categorie_id, image_principale, actif, en_promotion, nouveau, equipe, saison, marque) VALUES
(1, 'Maillot PSG Domicile 2025/2026', 'Le nouveau maillot domicile du Paris Saint-Germain pour la saison 2025/2026. Design élégant avec les couleurs traditionnelles bleu et rouge.', 15000, NULL, 1, '/images/produits/psg-home.jpg', true, false, true, 'Paris Saint-Germain', '2025/2026', 'Nike'),
(2, 'Maillot Real Madrid Domicile 2025/2026', 'Maillot officiel du Real Madrid. Blanc immaculé avec détails dorés.', 15000, 12000, 1, '/images/produits/real-home.jpg', true, true, true, 'Real Madrid', '2025/2026', 'Adidas'),
(3, 'Maillot FC Barcelone Domicile 2025/2026', 'Le classique maillot blaugrana du FC Barcelone.', 15000, NULL, 1, '/images/produits/barca-home.jpg', true, false, true, 'FC Barcelone', '2025/2026', 'Nike'),
(4, 'Maillot Manchester United Domicile 2025/2026', 'Le maillot rouge emblématique des Red Devils.', 14000, NULL, 1, '/images/produits/manu-home.jpg', true, false, false, 'Manchester United', '2025/2026', 'Adidas'),
(5, 'Maillot Liverpool Domicile 2025/2026', 'Le maillot rouge des Reds de Liverpool.', 14000, 11000, 1, '/images/produits/liverpool-home.jpg', true, true, false, 'Liverpool', '2025/2026', 'Nike'),
(6, 'Maillot Bayern Munich Domicile 2025/2026', 'Le maillot rouge et blanc du Bayern.', 14000, NULL, 1, '/images/produits/bayern-home.jpg', true, false, true, 'Bayern Munich', '2025/2026', 'Adidas'),
(7, 'Maillot France Domicile 2025/2026', 'Le maillot bleu de l''équipe de France.', 16000, NULL, 2, '/images/produits/france-home.jpg', true, false, true, 'France', '2025/2026', 'Nike'),
(8, 'Maillot Brésil Domicile 2025/2026', 'Le célèbre maillot jaune de la Seleção.', 16000, 13000, 2, '/images/produits/brazil-home.jpg', true, true, false, 'Brésil', '2025/2026', 'Nike'),
(9, 'Maillot Argentine Domicile 2025/2026', 'Le maillot albiceleste de l''Argentine.', 16000, NULL, 2, '/images/produits/argentina-home.jpg', true, false, true, 'Argentine', '2025/2026', 'Adidas'),
(10, 'Maillot Allemagne Domicile 2025/2026', 'Le maillot blanc de la Mannschaft.', 15000, NULL, 2, '/images/produits/germany-home.jpg', true, false, false, 'Allemagne', '2025/2026', 'Adidas'),
(11, 'Maillot Rétro AC Milan 1988/1989', 'Réédition du légendaire maillot de l''AC Milan.', 12000, 9000, 3, '/images/produits/milan-retro.jpg', true, true, false, 'AC Milan', '1988/1989', 'Adidas'),
(12, 'Maillot Rétro Manchester United 1999', 'Le maillot du triplé historique.', 12000, NULL, 3, '/images/produits/manu-retro-99.jpg', true, false, false, 'Manchester United', '1998/1999', 'Umbro');

-- Insertion des tailles pour chaque produit
INSERT INTO produit_taille (id, produit_id, taille, stock) VALUES
-- PSG
(1, 1, 'S', 10), (2, 1, 'M', 15), (3, 1, 'L', 20), (4, 1, 'XL', 12), (5, 1, 'XXL', 5),
-- Real Madrid
(6, 2, 'S', 8), (7, 2, 'M', 12), (8, 2, 'L', 18), (9, 2, 'XL', 10), (10, 2, 'XXL', 4),
-- Barcelone
(11, 3, 'S', 10), (12, 3, 'M', 14), (13, 3, 'L', 16), (14, 3, 'XL', 8), (15, 3, 'XXL', 6),
-- Man United
(16, 4, 'S', 7), (17, 4, 'M', 10), (18, 4, 'L', 12), (19, 4, 'XL', 6), (20, 4, 'XXL', 3),
-- Liverpool
(21, 5, 'S', 9), (22, 5, 'M', 11), (23, 5, 'L', 15), (24, 5, 'XL', 8), (25, 5, 'XXL', 4),
-- Bayern
(26, 6, 'S', 6), (27, 6, 'M', 8), (28, 6, 'L', 10), (29, 6, 'XL', 5), (30, 6, 'XXL', 2),
-- France
(31, 7, 'S', 12), (32, 7, 'M', 18), (33, 7, 'L', 25), (34, 7, 'XL', 15), (35, 7, 'XXL', 8),
-- Brésil
(36, 8, 'S', 10), (37, 8, 'M', 15), (38, 8, 'L', 20), (39, 8, 'XL', 12), (40, 8, 'XXL', 6),
-- Argentine
(41, 9, 'S', 8), (42, 9, 'M', 12), (43, 9, 'L', 16), (44, 9, 'XL', 10), (45, 9, 'XXL', 4),
-- Allemagne
(46, 10, 'S', 6), (47, 10, 'M', 10), (48, 10, 'L', 12), (49, 10, 'XL', 7), (50, 10, 'XXL', 3),
-- Milan Retro
(51, 11, 'S', 4), (52, 11, 'M', 6), (53, 11, 'L', 8), (54, 11, 'XL', 4), (55, 11, 'XXL', 2),
-- Man United Retro
(56, 12, 'S', 3), (57, 12, 'M', 5), (58, 12, 'L', 7), (59, 12, 'XL', 3), (60, 12, 'XXL', 1);

-- Mettre à jour les séquences
SELECT setval('categorie_id_seq', 100);
SELECT setval('produit_id_seq', 100);
SELECT setval('produit_taille_id_seq', 100);

