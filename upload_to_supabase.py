"""Upload all 1,945 practices to Supabase via REST API."""
import json, os, re, time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

SUPABASE_URL = "https://wxdwpnuxxcpsfgjfmxax.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZHdwbnV4eGNwc2ZnamZteGF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY3NTUwNywiZXhwIjoyMDg3MjUxNTA3fQ.CumPpLi_-YGK6CzOXMELc6bA9LlG0flKHh_wLrdnHJw"
RAW_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "places_raw.json")
BATCH = 100

POSTAL_PROVINCE = [
    (1000,1099,"Noord-Holland"),(1100,1199,"Noord-Holland"),(1200,1299,"Noord-Holland"),
    (1300,1399,"Flevoland"),(1400,1499,"Noord-Holland"),(1500,1599,"Noord-Holland"),
    (1600,1699,"Noord-Holland"),(1700,1799,"Noord-Holland"),(1800,1899,"Noord-Holland"),
    (1900,1999,"Noord-Holland"),(2000,2099,"Noord-Holland"),(2100,2199,"Zuid-Holland"),
    (2200,2299,"Zuid-Holland"),(2300,2399,"Zuid-Holland"),(2400,2499,"Zuid-Holland"),
    (2500,2599,"Zuid-Holland"),(2600,2699,"Zuid-Holland"),(2700,2799,"Zuid-Holland"),
    (2800,2899,"Zuid-Holland"),(2900,2999,"Zuid-Holland"),(3000,3099,"Zuid-Holland"),
    (3100,3199,"Zuid-Holland"),(3200,3299,"Zuid-Holland"),(3300,3399,"Zuid-Holland"),
    (3400,3499,"Utrecht"),(3500,3599,"Utrecht"),(3600,3699,"Utrecht"),
    (3700,3799,"Utrecht"),(3800,3899,"Utrecht"),(3900,3999,"Gelderland"),
    (4000,4099,"Gelderland"),(4100,4199,"Noord-Brabant"),(4200,4299,"Noord-Brabant"),
    (4300,4399,"Zeeland"),(4400,4499,"Zeeland"),(4500,4599,"Zeeland"),
    (4600,4699,"Noord-Brabant"),(4700,4799,"Noord-Brabant"),(4800,4899,"Noord-Brabant"),
    (4900,4999,"Noord-Brabant"),(5000,5099,"Noord-Brabant"),(5100,5199,"Noord-Brabant"),
    (5200,5299,"Noord-Brabant"),(5300,5399,"Noord-Brabant"),(5400,5499,"Noord-Brabant"),
    (5500,5599,"Noord-Brabant"),(5600,5699,"Noord-Brabant"),(5700,5799,"Noord-Brabant"),
    (5800,5899,"Limburg"),(5900,5999,"Limburg"),(6000,6099,"Limburg"),
    (6100,6199,"Limburg"),(6200,6299,"Limburg"),(6300,6399,"Limburg"),
    (6400,6499,"Limburg"),(6500,6599,"Limburg"),(6600,6699,"Limburg"),
    (6700,6799,"Gelderland"),(6800,6899,"Gelderland"),(6900,6999,"Gelderland"),
    (7000,7099,"Gelderland"),(7100,7199,"Gelderland"),(7200,7299,"Gelderland"),
    (7300,7399,"Gelderland"),(7400,7499,"Overijssel"),(7500,7599,"Overijssel"),
    (7600,7699,"Overijssel"),(7700,7799,"Overijssel"),(7800,7899,"Overijssel"),
    (7900,7999,"Drenthe"),(8000,8099,"Overijssel"),(8100,8199,"Flevoland"),
    (8200,8299,"Flevoland"),(8300,8399,"Flevoland"),(8400,8499,"Friesland"),
    (8500,8599,"Friesland"),(8600,8699,"Friesland"),(8700,8799,"Friesland"),
    (8800,8899,"Friesland"),(8900,8999,"Friesland"),(9000,9099,"Groningen"),
    (9100,9199,"Groningen"),(9200,9299,"Drenthe"),(9300,9399,"Drenthe"),
    (9400,9499,"Drenthe"),(9500,9599,"Drenthe"),(9600,9699,"Groningen"),
    (9700,9799,"Groningen"),(9800,9899,"Groningen"),(9900,9999,"Groningen"),
]

def get_province(postal):
    if not postal: return None
    m = re.match(r'(\d{4})', postal)
    if not m: return None
    n = int(m.group(1))
    for lo, hi, p in POSTAL_PROVINCE:
        if lo <= n <= hi: return p
    return None

def extract_city(addr):
    if not addr: return None, None
    m = re.search(r'(\d{4}\s*[A-Z]{2})\s+(.+?)(?:,|$)', addr)
    if m: return m.group(2).strip(), m.group(1).replace(" ","")
    return None, None

def transform(p):
    dn = p.get("displayName", {})
    loc = p.get("location", {})
    addr = p.get("formattedAddress", "")
    name = dn.get("text","") if isinstance(dn,dict) else str(dn)
    city, postal = extract_city(addr)
    return {
        "google_place_id": p.get("id",""),
        "name": name, "address": addr,
        "city": city, "province": get_province(postal), "postal_code": postal,
        "latitude": loc.get("latitude"), "longitude": loc.get("longitude"),
        "phone": p.get("nationalPhoneNumber", p.get("internationalPhoneNumber")),
        "website": p.get("websiteUri"), "rating": p.get("rating"),
        "reviews_count": p.get("userRatingCount"),
        "google_maps_url": p.get("googleMapsUri"),
        "business_status": p.get("businessStatus"),
        "types": p.get("types", []),
    }

def insert_batch(records):
    url = f"{SUPABASE_URL}/rest/v1/practices"
    data = json.dumps(records).encode("utf-8")
    req = Request(url, data=data, method="POST")
    req.add_header("apikey", SERVICE_ROLE_KEY)
    req.add_header("Authorization", f"Bearer {SERVICE_ROLE_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "resolution=merge-duplicates")
    try:
        with urlopen(req) as resp:
            return True, resp.status
    except HTTPError as e:
        body = e.read().decode() if e.fp else ""
        return False, f"HTTP {e.code}: {body[:200]}"

# Load
print("Loading data...")
with open(RAW_FILE, "r", encoding="utf-8") as f:
    raw = json.load(f)
records = [transform(p) for p in raw if p.get("id")]
print(f"{len(records)} records ready")

# Upload
print(f"Uploading in batches of {BATCH}...")
ok = 0
fail = 0
for i in range(0, len(records), BATCH):
    batch = records[i:i+BATCH]
    success, result = insert_batch(batch)
    if success:
        ok += len(batch)
        pct = 100*ok//len(records)
        print(f"  [{pct:3d}%] {ok}/{len(records)}")
    else:
        print(f"  Batch error: {result}")
        for r in batch:
            s, res = insert_batch([r])
            if s: ok += 1
            else: fail += 1; print(f"    FAIL: {r['name'][:30]}")
    time.sleep(0.1)

print(f"\nDone! Uploaded: {ok} | Failed: {fail}")
