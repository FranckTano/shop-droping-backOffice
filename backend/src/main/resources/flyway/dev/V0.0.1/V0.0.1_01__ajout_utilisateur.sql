INSERT INTO utilisateur (id, username, prenoms, nom, role, statut ) VALUES
(nextval('utilisateur_id_seq'), 'kali', 'Koffi', 'Ali','ADMIN','ACTIF'),
(nextval('utilisateur_id_seq'), 'ftano', 'Franck', 'Tano','ADMIN','ACTIF'),
(nextval('utilisateur_id_seq'), 'admin', '', 'Administrateur', 'ADMIN','ACTIF'),
(nextval('utilisateur_id_seq'), 'mlatoundji', 'Madjid', 'Latoundji', 'ADMIN','ACTIF'),
(nextval('utilisateur_id_seq'), 'mtraore', 'Moctar', 'Traore', 'ADMIN','ACTIF');
