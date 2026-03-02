"""Upload SQL batches using Supabase Management API v1."""
import os, json, time, ssl
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# Supabase Management API
PROJECT_REF = "wxdwpnuxxcpsfgjfmxax"
# Using the personal access token
ACCESS_TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")

# Try the correct endpoint format
BASE_URL = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"

# Create SSL context that doesn't verify (for corporate proxies)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sql_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_groups")
files = sorted(os.listdir(sql_dir))
print(f"Total groups to upload: {len(files)}")

# Test with first file
test_sql = "SELECT count(*) FROM practices;"
data = json.dumps({"query": test_sql}).encode("utf-8")
req = Request(BASE_URL, data=data, method="POST")
req.add_header("Content-Type", "application/json")
req.add_header("Authorization", f"Bearer {ACCESS_TOKEN}")

try:
    with urlopen(req, context=ctx) as resp:
        result = resp.read().decode("utf-8")
        print(f"Test query result: {result}")
except HTTPError as e:
    body = e.read().decode("utf-8") if e.fp else "?"
    print(f"Test query error: {e.code} - {body[:300]}")
    # Try alternate endpoint
    alt_url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/sql"
    print(f"\nTrying alternate endpoint: {alt_url}")
    req2 = Request(alt_url, data=data, method="POST")
    req2.add_header("Content-Type", "application/json")
    req2.add_header("Authorization", f"Bearer {ACCESS_TOKEN}")
    try:
        with urlopen(req2, context=ctx) as resp:
            result = resp.read().decode("utf-8")
            print(f"Alt result: {result}")
    except HTTPError as e2:
        body2 = e2.read().decode("utf-8") if e2.fp else "?"
        print(f"Alt error: {e2.code} - {body2[:300]}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
