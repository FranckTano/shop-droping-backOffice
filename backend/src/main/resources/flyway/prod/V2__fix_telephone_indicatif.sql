-- Correction de l'indicatif téléphonique : +255 → +225 dans la table utilisateur
UPDATE utilisateur SET telephone = '+2250799136306' WHERE username = 'franck';
UPDATE utilisateur SET telephone = '+2250749516657' WHERE username = 'momo';
UPDATE utilisateur SET telephone = '+2250789261994' WHERE username = 'moussa';
