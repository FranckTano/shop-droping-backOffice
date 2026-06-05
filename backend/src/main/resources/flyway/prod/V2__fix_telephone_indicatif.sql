-- Correction de l'indicatif téléphonique : +255 → +225 dans la table utilisateur
UPDATE utilisateur SET telephone = '+2250799136306' WHERE username = 'franck';
UPDATE utilisateur SET telephone = '+2250749516657' WHERE username = 'momo';
UPDATE utilisateur SET telephone = '+2250789261994' WHERE username = 'moussa';

-- Correction dans la table configuration (utilisée par le FrontOffice)
-- On recopie le numéro de l'admin actif (recevoir_commandes = true) maintenant corrigé
UPDATE configuration
SET valeur = (SELECT telephone FROM utilisateur WHERE recevoir_commandes = true LIMIT 1)
WHERE cle = 'whatsapp_numero'
  AND EXISTS (SELECT 1 FROM utilisateur WHERE recevoir_commandes = true AND telephone IS NOT NULL);
