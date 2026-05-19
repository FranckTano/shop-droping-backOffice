import psycopg2

POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "password"
POSTGRES_HOST = "localhost"
POSTGRES_PORT = "5432"
TARGET_DB = "shop_dropping"
TARGET_ROLE = "user"

def init_db():
    try:
        # Connexion à la base postgres pour gérer rôles et bases
        conn = psycopg2.connect(
            dbname="postgres",
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            host=POSTGRES_HOST,
            port=POSTGRES_PORT
        )
        conn.autocommit = True
        cur = conn.cursor()

        # Vérifier si le rôle existe, sinon le créer
        cur.execute("SELECT 1 FROM pg_roles WHERE rolname=%s;", (TARGET_ROLE,))
        if not cur.fetchone():
            print(f"Création du rôle {TARGET_ROLE}...")
            cur.execute(f"CREATE ROLE {TARGET_ROLE} LOGIN PASSWORD '{POSTGRES_PASSWORD}';")

        # Vérifier si la base existe, sinon la créer
        cur.execute("SELECT 1 FROM pg_database WHERE datname=%s;", (TARGET_DB,))
        if not cur.fetchone():
            print(f"Création de la base {TARGET_DB}...")
            cur.execute(f"CREATE DATABASE {TARGET_DB} OWNER {TARGET_ROLE};")

        cur.close()
        conn.close()

        # Connexion à la base cible
        conn = psycopg2.connect(
            dbname=TARGET_DB,
            user=POSTGRES_USER,  # superuser pour les extensions
            password=POSTGRES_PASSWORD,
            host=POSTGRES_HOST,
            port=POSTGRES_PORT
        )
        conn.autocommit = True
        cur = conn.cursor()

        # Drop et recréer le schéma public
        print("Suppression du schema public...")
        cur.execute("DROP SCHEMA IF EXISTS public CASCADE;")

        print(f"Création du schema public avec l'utilisateur {TARGET_ROLE}...")
        cur.execute(f"CREATE SCHEMA public AUTHORIZATION {TARGET_ROLE};")

        # Extensions
        print("Activation des extensions...")
        cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
        cur.execute("CREATE EXTENSION IF NOT EXISTS unaccent;")
        cur.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

        print("✅ Tout est prêt !")

        cur.close()
        conn.close()

    except Exception as e:
        print("❌ Erreur :", e)

if __name__ == "__main__":
    init_db()
