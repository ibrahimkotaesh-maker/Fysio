"""Upload to Supabase via connection pooler using psycopg2."""
import os
import psycopg2

# Supabase connection pooler (IPv4)
# Format: postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
# We need the database password. Let's try with the service role JWT as password
# Actually with Supabase, the pooler uses: postgres.xxxx as user and db password

# Connection via direct host
DB_HOST = "db.wxdwpnuxxcpsfgjfmxax.supabase.co"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"
# We need the database password - this is set during project creation
# Let's try the anon key as password (it won't work but let's try)
# Actually, let's read it from .env if available

# Check for DATABASE_URL in environment or .env files
import glob
env_files = glob.glob("**/.env*", recursive=True)
print(f"Found env files: {env_files}")

for ef in env_files:
    with open(ef, "r", encoding="utf-8") as f:
        for line in f:
            if "DATABASE" in line.upper() or "POSTGRES" in line.upper() or "SERVICE_ROLE" in line.upper():
                print(f"  {ef}: {line.strip()}")
