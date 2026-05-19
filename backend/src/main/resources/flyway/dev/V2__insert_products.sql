-- Supprimer les anciens produits pour éviter les doublons
DELETE FROM produit;

-- Insertion de nouveaux produits avec les images réelles
INSERT INTO produit (nom, description, prix, image_principale, categorie_id) VALUES
('Maillot Actuel 1', 'Description du maillot actuel 1', 9000, 'images/actuel/WhatsApp Image 2026-03-15 at 12.56.58.jpeg', 1),
('Maillot Actuel 2', 'Description du maillot actuel 2', 9000, 'images/actuel/WhatsApp Image 2026-03-15 at 12.56.59 (1).jpeg', 1),
('Maillot Actuel 3', 'Description du maillot actuel 3', 9500, 'images/actuel/WhatsApp Image 2026-03-15 at 12.56.59 (2).jpeg', 1),
('Maillot Vintage Court 1', 'Description du maillot vintage court 1', 10000, 'images/vintage-court/WhatsApp Image 2026-03-15 at 12.57.08 (1).jpeg', 2),
('Maillot Vintage Court 2', 'Description du maillot vintage court 2', 11000, 'images/vintage-court/WhatsApp Image 2026-03-15 at 12.57.08 (2).jpeg', 2),
('Maillot Vintage Long 1', 'Description du maillot vintage long 1', 12000, 'images/vintage-long/WhatsApp Image 2026-03-15 at 12.57.12 (2).jpeg', 3),
('Maillot Vintage Long 2', 'Description du maillot vintage long 2', 12500, 'images/vintage-long/WhatsApp Image 2026-03-15 at 12.57.12 (3).jpeg', 3),
('Maillot Collection 1', 'Description du maillot collection 1', 15000, 'images/collection/WhatsApp Image 2026-03-15 at 12.57.16 (3).jpeg', 4),
('Maillot Collection 2', 'Description du maillot collection 2', 25000, 'images/collection/WhatsApp Image 2026-03-15 at 12.57.16 (4).jpeg', 4);
