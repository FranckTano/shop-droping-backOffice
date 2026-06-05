-- Synchronise le numéro WhatsApp dans la table configuration du FrontOffice
-- Recopie le téléphone de l'admin actif (recevoir_commandes = true) maintenant corrigé
UPDATE configuration
SET valeur = (SELECT telephone FROM utilisateur WHERE recevoir_commandes = true LIMIT 1)
WHERE cle = 'whatsapp_numero'
  AND EXISTS (SELECT 1 FROM utilisateur WHERE recevoir_commandes = true AND telephone IS NOT NULL);
