"""Quick test: Can we connect to Supabase REST API?"""
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import json

SUPABASE_URL = "https://wxdwpnuxxcpsfgjfmxax.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZHdwbnV4eGNwc2ZnamZteGF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY3NTUwNywiZXhwIjoyMDg3MjUxNTA3fQ.CumPpLi_-YGK6CzOXMELc6bA9LlG0flKHh_wLrdnHJw"

# Test 1: Basic REST API 
print("Test 1: REST API connectivity...")
req = Request(f"{SUPABASE_URL}/rest/v1/")
req.add_header("apikey", KEY)
req.add_header("Authorization", f"Bearer {KEY}")
try:
    with urlopen(req) as resp:
        print(f"  OK: {resp.status}")
        data = resp.read().decode()
        print(f"  Response: {data[:300]}")
except HTTPError as e:
    body = e.read().decode() if e.fp else ""
    print(f"  Error {e.code}: {body[:300]}")

# Test 2: Try to create table via rpc (create a helper function first)
print("\nTest 2: Create helper SQL function...")
create_func_sql = """
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
  RETURN json_build_object('status', 'ok');
END;
$$;
"""

# We need to use the pg-meta API or the SQL editor endpoint
# Let's check what endpoints are available
for path in ["/pg", "/pg/query", "/rest/v1/rpc/exec_sql"]:
    url = f"{SUPABASE_URL}{path}"
    req = Request(url)
    req.add_header("apikey", KEY)
    req.add_header("Authorization", f"Bearer {KEY}")
    try:
        with urlopen(req) as resp:
            print(f"  {path}: {resp.status}")
    except HTTPError as e:
        print(f"  {path}: {e.code}")
