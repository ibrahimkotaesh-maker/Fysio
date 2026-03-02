"""Upload data to Supabase using the SQL API via service role key."""
import os, json, time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# Use the Supabase Management API to execute SQL
# We'll use the Supabase REST /rest/v1/rpc endpoint instead

SUPABASE_URL = "https://wxdwpnuxxcpsfgjfmxax.supabase.co"

# Read the publishable key from .env.local
env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "website", ".env.local")
service_key = None

# Let's just use the exec_sql approach with raw HTTP to the pg endpoint
# Supabase project ref: wxdwpnuxxcpsfgjfmxax
# Using the Management API: POST /v1/projects/{ref}/database/query

MGMT_API = "https://api.supabase.com/v1/projects/wxdwpnuxxcpsfgjfmxax/database/query"
ACCESS_TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")

sql_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_mcp")
files = sorted(os.listdir(sql_dir))
total = len(files)
print(f"Total SQL files: {total}")

success = 0
errors = 0

for i, fname in enumerate(files):
    filepath = os.path.join(sql_dir, fname)
    with open(filepath, "r", encoding="utf-8") as f:
        sql = f.read()
    
    data = json.dumps({"query": sql}).encode("utf-8")
    req = Request(MGMT_API, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {ACCESS_TOKEN}")
    
    try:
        with urlopen(req) as resp:
            result = resp.read().decode("utf-8")
            success += 1
    except HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else "?"
        print(f"  Error {fname}: {e.code} - {body[:150]}")
        errors += 1
    
    if (i + 1) % 10 == 0:
        print(f"  Progress: {i+1}/{total} (success={success}, errors={errors})")
    
    time.sleep(0.1)

print(f"\nDone! Success: {success}, Errors: {errors}")
