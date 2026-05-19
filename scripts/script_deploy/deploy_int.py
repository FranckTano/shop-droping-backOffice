import paramiko
import os, subprocess, time
import asyncio, asyncssh
import argparse

# -----------------------
# Configuration de base
# -----------------------
HOST = '152.228.135.60'  # Adresse IP ou hostname du serveur distant
PORT = 22  # Port SSH
USERNAME = 'ubuntu'  # Nom d'utilisateur SSH
PASSWORD = '2w28jYkmhgMQ'  # Mot de passe SSH
REMOTE_DIR = '/home/ubuntu'  # Répertoire distant où stocker les fichiers

# Paramètres activables/désactivables via arguments de ligne de commande
parser = argparse.ArgumentParser()
parser.add_argument("--EXECUTE_COMMANDS_BEFORE_UPLOAD", type=int, default=1)
parser.add_argument("--UPLOAD_FILES", type=int, default=1)
parser.add_argument("--RESET_REMOTE_BD", type=int, default=0)
parser.add_argument("--EXECUTE_COMMANDS_AFTER_UPLOAD", type=int, default=1)

args = parser.parse_args()

# Conversion des paramètres en booléens
EXECUTE_COMMANDS_BEFORE_UPLOAD = bool(args.EXECUTE_COMMANDS_BEFORE_UPLOAD)
UPLOAD_FILES = bool(args.UPLOAD_FILES)
RESET_REMOTE_BD = bool(args.RESET_REMOTE_BD)
EXECUTE_COMMANDS_AFTER_UPLOAD = bool(args.EXECUTE_COMMANDS_AFTER_UPLOAD)

# Configuration base de données cible
TARGET_DB = "abbi"
TARGET_ROLE = "abbi"
LOCAL_BACKEND_WAR_NAME = "abbi.war"
REMOTE_FRONTEND_PATH = "/app/abbi"
LOCAL_FRONTEND_FILE_NAME = "abbi-frontend"

# -----------------------
# Fichiers locaux à envoyer
# -----------------------
LOCAL_FILES = [
    'deploy/abbi-frontend.zip',
    f'deploy/{LOCAL_BACKEND_WAR_NAME}'
]  # fichiers à envoyer

# -----------------------
# Commandes à exécuter avant l’upload
# (sauvegarde des anciens fichiers)
# -----------------------
COMMANDS_TO_RUN_BEFORE_UPLOAD = [
    # f'sudo apt install -y zip unzip tar',
    f'mv -f {LOCAL_BACKEND_WAR_NAME} {LOCAL_BACKEND_WAR_NAME}.old > /dev/null 2>&1',
    f'mv -f abbi-frontend abbi-frontend-old > /dev/null 2>&1',
    f'sudo mkdir -p {REMOTE_FRONTEND_PATH}',
    f'sudo chown {USERNAME}:{USERNAME} {REMOTE_FRONTEND_PATH}',
]

# -----------------------
# Commandes à exécuter après l’upload
# (déploiement des nouveaux fichiers)
# -----------------------
COMMANDS_TO_RUN_AFTER_UPLOAD = [
    "rm -rf abbi-frontend",
    {"text" : "unzip -o abbi-frontend.zip -d abbi-frontend", "decode_utf8" : True},
    f"sudo cp -f {LOCAL_BACKEND_WAR_NAME} /opt/tomcat/webapps",
    f"sudo rm -rf {REMOTE_FRONTEND_PATH}/*",
    f"sudo cp -rf {LOCAL_FRONTEND_FILE_NAME}/* {REMOTE_FRONTEND_PATH}/"
]

# -----------------------
# Commandes pour initialiser la base de données
# (création rôle + db + extensions nécessaires)
# -----------------------
COMMANDS_INIT_DB = [
    f"sudo -u postgres psql -c \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '{TARGET_ROLE}') THEN CREATE ROLE {TARGET_ROLE} LOGIN; END IF; END \\$\\$;\"",
    f"sudo -u postgres psql -c \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '{TARGET_DB}') THEN CREATE DATABASE {TARGET_DB} OWNER {TARGET_ROLE}; END IF; END \\$\\$;\"",
    f"sudo -u postgres psql -d {TARGET_DB} -c \"DROP SCHEMA IF EXISTS public CASCADE;\"",
    f"sudo -u postgres psql -d {TARGET_DB} -c \"CREATE SCHEMA public AUTHORIZATION {TARGET_ROLE};\"",
    f"sudo -u postgres psql -d {TARGET_DB} -c \"CREATE EXTENSION IF NOT EXISTS postgis;\"",
    f"sudo -u postgres psql -d {TARGET_DB} -c \"CREATE EXTENSION IF NOT EXISTS unaccent;\"",
    f"sudo -u postgres psql -d {TARGET_DB} -c \"CREATE EXTENSION IF NOT EXISTS pg_trgm;\""
]

# Si True → sudo ne demande pas de mot de passe
SUDO_NO_PROMPT = False


# -----------------------
# Fonction : Upload des fichiers via SFTP
# -----------------------
async def upload_files_sftp():
    try:
        print("Connexion SFTP...")
        async with asyncssh.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD, known_hosts=None) as conn:
            async with conn.start_sftp_client() as sftp:
                for file in LOCAL_FILES:
                    # Chemin de destination sur le serveur
                    remote_path = os.path.join(REMOTE_DIR, os.path.basename(file)).replace("\\", "/")
                    print(f"Transfert de {file} vers {remote_path}...")
                    await sftp.put(file, remote_path)
                print("Transfert terminé avec succès.")
            return True
    except Exception as e:
        print(f"Erreur durant le transfert SFTP: {e}")
        return False


# -----------------------
# Fonction : Exécution de commandes SSH
# -----------------------
def execute_remote_commands(commands):
    """
    Exécute une liste de commandes sur le serveur distant via SSH.
    Gère automatiquement les commandes sudo en envoyant le mot de passe si nécessaire.
    """
    try:
        print("Connexion SSH...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

        error_found = False

        print("Connexion SSH OK ! ....")

        for cmd in commands:
            # Normalisation de la commande
            if isinstance(cmd, str):
                cmd = {"text": cmd, "prompts": [], "mandatory": True, "sudo": False}
            if "mandatory" not in cmd:
                cmd["mandatory"] = True
            if "prompts" not in cmd:
                cmd["prompts"] = []
            if "sudo" not in cmd:
                cmd["sudo"] = False

            cmd_text = cmd["text"]
            cmd_sudo = cmd_text.strip().startswith("sudo")

            # Préparer la commande complète
            if cmd_sudo and not SUDO_NO_PROMPT:
                full_command = f"sudo -S {cmd_text[5:].strip()}"
            else:
                full_command = cmd_text

            print(f"Exécution: {full_command}")

            # Exécution
            stdin, stdout, stderr = ssh.exec_command(full_command, get_pty=True)

            # Envoi du mot de passe pour sudo si nécessaire
            if cmd_sudo and not SUDO_NO_PROMPT:
                stdin.write(f'{PASSWORD}\n')

            # Gestion des prompts supplémentaires
            for prompt in cmd["prompts"]:
                stdin.write(prompt + "\n")
            stdin.flush()
            time.sleep(1)

            # Lecture des sorties
            output = stdout.read().decode("utf-8", errors="ignore")
            errors = stderr.read().decode("utf-8", errors="ignore")
            print("Sortie:")
            print(output)
            if errors:
                print("Erreurs:")
                print(errors)
                if cmd["mandatory"]:
                    error_found = True
                    break

        ssh.close()
        print("Commandes exécutées avec succès.")
        return not error_found

    except Exception as e:
        print(f"Erreur SSH: {e}")
        return False

# -----------------------
# Point d’entrée du script
# -----------------------
if __name__ == '__main__':

    print(f"Valeur de COMMANDS_BEFORE_UPLOAD : {EXECUTE_COMMANDS_BEFORE_UPLOAD}")
    print(f"Valeur de UPLOAD_FILES : {UPLOAD_FILES}")
    print(f"Valeur de RESET_REMOTE_BD : {RESET_REMOTE_BD}")
    print(f"Valeur de EXECUTE_COMMANDS_AFTER_UPLOAD : {EXECUTE_COMMANDS_AFTER_UPLOAD}")

    # Étape 1 : Exécuter les commandes avant l’upload (sauvegardes)
    if EXECUTE_COMMANDS_BEFORE_UPLOAD and not execute_remote_commands(COMMANDS_TO_RUN_BEFORE_UPLOAD):
        exit

    # Étape 2 : Upload des fichiers si activé
    if UPLOAD_FILES:
        success = asyncio.run(upload_files_sftp())
        if not success:
            print("Erreur de transfert")
            exit

        # Étape 3 : Réinitialisation de la base de données
        if RESET_REMOTE_BD and not execute_remote_commands(COMMANDS_INIT_DB):
            exit

        # Étape 4 : Exécution des commandes après l’upload (déploiement)
        if EXECUTE_COMMANDS_AFTER_UPLOAD:
            execute_remote_commands(COMMANDS_TO_RUN_AFTER_UPLOAD)
