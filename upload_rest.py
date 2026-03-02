"""Upload practices to Supabase via PostgREST REST API using anon key."""
import os, json, time, ssl
from urllib.request import Request, urlopen
from urllib.error import HTTPError

SUPABASE_URL = "https://wxdwpnuxxcpsfgjfmxax.supabase.co"
ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

import re

def parse_address(address):
    """Extract city, postal_code from Dutch address format."""
    if not address:
        return "", ""
    postal_city_match = re.search(r'(\d{4}\s*[A-Z]{2})\s+(.+?)(?:,|$)', address)
    if postal_city_match:
        postal_code = postal_city_match.group(1)
        city = postal_city_match.group(2).strip()
        city = re.sub(r'\s*(Netherlands|Nederland)$', '', city, flags=re.IGNORECASE).strip()
        return city, postal_code
    return "", ""

provinces_map = {
    "Amsterdam": "Noord-Holland", "Haarlem": "Noord-Holland", "Amstelveen": "Noord-Holland",
    "Alkmaar": "Noord-Holland", "Hilversum": "Noord-Holland", "Purmerend": "Noord-Holland",
    "Hoorn": "Noord-Holland", "Den Helder": "Noord-Holland", "Beverwijk": "Noord-Holland",
    "Zaandam": "Noord-Holland", "Hoofddorp": "Noord-Holland", "Heemstede": "Noord-Holland",
    "Castricum": "Noord-Holland", "IJmuiden": "Noord-Holland", "Uithoorn": "Noord-Holland",
    "Aalsmeer": "Noord-Holland", "Diemen": "Noord-Holland", "Heerhugowaard": "Noord-Holland",
    "Heiloo": "Noord-Holland", "Bergen": "Noord-Holland", "Bussum": "Noord-Holland",
    "Naarden": "Noord-Holland", "Huizen": "Noord-Holland", "Stompetoren": "Noord-Holland",
    "Oudorp": "Noord-Holland", "Sint Pancras": "Noord-Holland", "Volendam": "Noord-Holland",
    "Edam": "Noord-Holland", "Broek op Langedijk": "Noord-Holland", "Weesp": "Noord-Holland",
    "Schagen": "Noord-Holland", "Enkhuizen": "Noord-Holland",
    
    "Rotterdam": "Zuid-Holland", "Den Haag": "Zuid-Holland", "Leiden": "Zuid-Holland",
    "Dordrecht": "Zuid-Holland", "Zoetermeer": "Zuid-Holland", "Delft": "Zuid-Holland",
    "Gouda": "Zuid-Holland", "Alphen aan den Rijn": "Zuid-Holland", "Schiedam": "Zuid-Holland",
    "Vlaardingen": "Zuid-Holland", "Capelle aan den IJssel": "Zuid-Holland",
    "Spijkenisse": "Zuid-Holland", "Ridderkerk": "Zuid-Holland", "Gorinchem": "Zuid-Holland",
    "Katwijk": "Zuid-Holland", "Wassenaar": "Zuid-Holland", "Rijswijk": "Zuid-Holland",
    "Noordwijk": "Zuid-Holland", "Hillegom": "Zuid-Holland", "Lisse": "Zuid-Holland",
    "Maassluis": "Zuid-Holland", "Voorburg": "Zuid-Holland", "Leidschendam": "Zuid-Holland",
    "Papendrecht": "Zuid-Holland", "Zwijndrecht": "Zuid-Holland", "Barendrecht": "Zuid-Holland",
    "Waddinxveen": "Zuid-Holland", "Bodegraven": "Zuid-Holland", "Leiderdorp": "Zuid-Holland",
    "Oegstgeest": "Zuid-Holland", "Voorschoten": "Zuid-Holland", "Pijnacker": "Zuid-Holland",
    
    "Utrecht": "Utrecht", "Amersfoort": "Utrecht", "Zeist": "Utrecht",
    "Nieuwegein": "Utrecht", "Veenendaal": "Utrecht", "Soest": "Utrecht",
    "Houten": "Utrecht", "IJsselstein": "Utrecht", "Woerden": "Utrecht",
    "Bilthoven": "Utrecht", "De Bilt": "Utrecht", "Baarn": "Utrecht",
    "Breukelen": "Utrecht", "Maarssen": "Utrecht", "Bunnik": "Utrecht",
    
    "Eindhoven": "Noord-Brabant", "Tilburg": "Noord-Brabant", "Breda": "Noord-Brabant",
    "'s-Hertogenbosch": "Noord-Brabant", "Helmond": "Noord-Brabant", "Oss": "Noord-Brabant",
    "Roosendaal": "Noord-Brabant", "Bergen op Zoom": "Noord-Brabant",
    "Waalwijk": "Noord-Brabant", "Veldhoven": "Noord-Brabant", "Uden": "Noord-Brabant",
    "Etten-Leur": "Noord-Brabant", "Oosterhout": "Noord-Brabant",
    
    "Arnhem": "Gelderland", "Nijmegen": "Gelderland", "Apeldoorn": "Gelderland",
    "Ede": "Gelderland", "Doetinchem": "Gelderland", "Harderwijk": "Gelderland",
    "Barneveld": "Gelderland", "Tiel": "Gelderland", "Zutphen": "Gelderland",
    "Wageningen": "Gelderland", "Zevenaar": "Gelderland", "Putten": "Gelderland",
    "Ermelo": "Gelderland", "Nunspeet": "Gelderland",
    
    "Zwolle": "Overijssel", "Enschede": "Overijssel", "Deventer": "Overijssel",
    "Almelo": "Overijssel", "Kampen": "Overijssel", "Hengelo": "Overijssel",
    
    "Maastricht": "Limburg", "Venlo": "Limburg", "Heerlen": "Limburg",
    "Sittard": "Limburg", "Roermond": "Limburg", "Weert": "Limburg",
    
    "Leeuwarden": "Friesland", "Heerenveen": "Friesland", "Sneek": "Friesland",
    "Drachten": "Friesland",
    
    "Groningen": "Groningen", "Emmen": "Drenthe", "Assen": "Drenthe",
    "Almere": "Flevoland", "Lelystad": "Flevoland",
    "Middelburg": "Zeeland", "Goes": "Zeeland", "Vlissingen": "Zeeland",
}

# Load raw data
raw_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "places_raw.json")
with open(raw_file, "r", encoding="utf-8") as f:
    raw = json.load(f)

print(f"Total practices: {len(raw)}")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Upload in batches of 50 using PostgREST upsert
batch_size = 50
success = 0
errors_count = 0
skipped = 0

for i in range(0, len(raw), batch_size):
    batch = raw[i:i+batch_size]
    records = []
    for p in batch:
        pid = p.get("id")
        if not pid:
            skipped += 1
            continue
        dn = p.get("displayName", {})
        name = dn.get("text", "") if isinstance(dn, dict) else str(dn)
        loc = p.get("location", {})
        addr = p.get("formattedAddress", "")
        city, postal_code = parse_address(addr)
        province = provinces_map.get(city, "")
        
        record = {
            "google_place_id": pid,
            "name": name,
            "address": addr,
            "city": city if city else None,
            "province": province if province else None,
            "postal_code": postal_code if postal_code else None,
            "latitude": loc.get("latitude"),
            "longitude": loc.get("longitude"),
            "phone": p.get("nationalPhoneNumber", p.get("internationalPhoneNumber")),
            "website": p.get("websiteUri"),
            "rating": p.get("rating"),
            "reviews_count": p.get("userRatingCount"),
            "google_maps_url": p.get("googleMapsUri"),
            "business_status": p.get("businessStatus"),
        }
        records.append(record)
    
    if not records:
        continue
    
    data = json.dumps(records).encode("utf-8")
    # PostgREST upsert: POST with Prefer: resolution=merge-duplicates
    url = f"{SUPABASE_URL}/rest/v1/practices"
    req = Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("apikey", ANON_KEY)
    req.add_header("Authorization", f"Bearer {ANON_KEY}")
    req.add_header("Prefer", "resolution=merge-duplicates")
    
    try:
        with urlopen(req, context=ctx) as resp:
            resp.read()
            success += len(records)
    except HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else "?"
        print(f"  Batch {i//batch_size}: Error {e.code} - {body[:200]}")
        errors_count += len(records)
    
    if (i // batch_size + 1) % 10 == 0:
        print(f"  Progress: {i+batch_size}/{len(raw)} (success={success}, errors={errors_count})")
    
    time.sleep(0.1)

print(f"\nDone! Success: {success}, Errors: {errors_count}, Skipped: {skipped}")
