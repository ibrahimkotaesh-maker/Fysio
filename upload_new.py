"""Upload new practices to Supabase, skipping existing ones."""
import json, os, re
from urllib.request import Request, urlopen
from urllib.error import HTTPError

SUPABASE_URL = "https://wxdwpnuxxcpsfgjfmxax.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZHdwbnV4eGNwc2ZnamZteGF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY3NTUwNywiZXhwIjoyMDg3MjUxNTA3fQ.bJR39Hcbf51TN3BOpaFZU4TM0iVEfBCHhwvmsLpLnPs"

def parse_address(address):
    """Extract city, postal_code, province from Dutch address."""
    if not address:
        return {}, "", ""
    
    # Dutch provinces
    provinces = {
        "Noord-Holland": ["Amsterdam", "Haarlem", "Zaandam", "Hilversum", "Purmerend", "Alkmaar", "Hoorn", "Den Helder", "Amstelveen", "Hoofddorp", "Diemen", "Beverwijk", "Heerhugowaard", "Enkhuizen", "Bussum", "Naarden", "Huizen", "Weesp", "Muiden", "Laren", "Blaricum", "Baarn", "Schagen", "Castricum", "Uithoorn", "Aalsmeer", "Haarlemmermeer", "Bloemendaal", "Heemstede", "Velsen", "IJmuiden", "Landsmeer", "Edam", "Volendam", "Monnickendam", "Wormer", "Krommenie", "Assendelft", "Wormerveer", "Zaandijk", "Koog aan de Zaan", "Oostzaan", "Broek op Langedijk", "Noord-Scharwoude", "Stompetoren", "Heiloo", "Egmond", "Bergen", "Oudorp", "Koedijk", "Sint Pancras", "De Rijp", "Kortenhoef", "Loosdrecht", "Muiderberg"],
        "Zuid-Holland": ["Rotterdam", "Den Haag", "Leiden", "Dordrecht", "Zoetermeer", "Delft", "Gouda", "Alphen aan den Rijn", "Schiedam", "Vlaardingen", "Capelle aan den IJssel", "Spijkenisse", "Ridderkerk", "Gorinchem", "Leidschendam", "Katwijk", "Noordwijk", "Wassenaar", "Voorburg", "Rijswijk", "Leiderdorp", "Oegstgeest", "Voorschoten", "Voorhout", "Warmond", "Papendrecht", "Zwijndrecht", "Sliedrecht", "Hendrik-Ido-Ambacht", "Alblasserdam", "Barendrecht", "Hillegom", "Lisse", "Sassenheim", "Nieuwkoop", "Waddinxveen", "Boskoop", "Bodegraven", "Woerden", "Zoeterwoude"],
        "Utrecht": ["Utrecht", "Amersfoort", "Zeist", "Nieuwegein", "Veenendaal", "IJsselstein", "Soest", "Baarn", "De Bilt", "Maartensdijk", "Bunnik", "Wijk bij Duurstede", "Culemborg", "Abcoude", "Eemnes", "Leersum", "Driebergen", "Bilthoven", "Den Dolder", "Houten", "Vianen", "Montfoort", "Oudewater", "Lopik"],
        "Noord-Brabant": ["Eindhoven", "Tilburg", "Breda", "'s-Hertogenbosch", "Helmond", "Oss", "Roosendaal", "Bergen op Zoom", "Waalwijk", "Boxtel", "Uden", "Veldhoven", "Wierden", "Rosmalen", "Vught", "Goirle", "Dongen", "Bavel", "Prinsenbeek", "Ulvenhout", "Etten-Leur", "Berkel-Enschot", "Cuijk", "Deurne"],
        "Gelderland": ["Arnhem", "Nijmegen", "Apeldoorn", "Ede", "Doetinchem", "Harderwijk", "Barneveld", "Tiel", "Zutphen", "Winterswijk", "Zevenaar", "Wageningen", "Velp", "Oosterbeek", "Elst", "Bemmel", "Duiven", "Westervoort", "Rheden", "Dieren", "Huissen", "Ubbergen", "Lent", "Nunspeet", "Putten", "Ermelo", "Vaassen", "Beekbergen", "Ugchelen", "Klarenbeek", "Hattem", "Lochem", "Borculo", "Culemborg", "Geldermalsen", "Buren", "Stroe", "Wapenveld"],
        "Overijssel": ["Zwolle", "Enschede", "Deventer", "Almelo", "Kampen", "Hengelo", "Oldenzaal", "Hardenberg", "Raalte", "Dalfsen", "Rijssen", "Nijverdal", "Vriezenveen", "Borne", "Wierden", "Nieuwleusen", "IJsselmuiden", "Steenwijk", "Wolvega", "Hasselt", "Zwartsluis", "Overdinkel", "Langeveen"],
        "Limburg": ["Maastricht", "Venlo", "Heerlen", "Sittard", "Roermond", "Weert", "Kerkrade", "Geleen", "Brunssum", "Landgraaf", "Tegelen", "Horst", "Baarlo", "Maasbree", "Panningen", "Kessel", "Grubbenvorst", "Reuver", "Swalmen", "Velden", "Sevenum", "Belfeld", "Lottum", "Meerlo", "Melderslo", "Venray", "Neer", "Haelen", "Posterholt", "Vlodrop", "Steyl", "Meerssen", "Bunde", "Valkenburg", "Hulsberg"],
        "Friesland": ["Leeuwarden", "Heerenveen", "Sneek", "Drachten", "Dokkum", "Harlingen", "Franeker", "Bolsward", "Joure", "Workum", "Akkrum", "Burgum", "Stiens", "Sint Annaparochie", "Berlikum", "Mantgum", "Goutum", "Wergea", "Oentsjerk", "Hurdegaryp", "Feanwâlden", "Damwâld", "Kootstertille", "Dronryp"],
        "Groningen": ["Groningen", "Veendam", "Stadskanaal", "Winschoten", "Hoogezand", "Winsum", "Ter Apel", "Wildervank", "Veelerveen"],
        "Drenthe": ["Emmen", "Assen", "Hoogeveen", "Meppel", "Coevorden", "Beilen", "Borger", "Klazienaveen", "Nieuw-Amsterdam", "Barger-Compascuum", "Emmer-Compascuum", "Schoonebeek", "Sleen", "Schoonoord", "Westerbork", "Dalen", "Oosterhesselen", "Erica", "Klijndijk", "Valthermond", "Valthe", "Veenoord", "Slagharen", "Aalden"],
        "Flevoland": ["Almere", "Lelystad"],
        "Zeeland": ["Middelburg", "Goes", "Terneuzen", "Vlissingen", "Schoondijke", "Domburg", "Oostkapelle", "Westkapelle", "Veere", "Serooskerke", "Kamperland", "Arnemuiden", "Oost-Souburg", "Koudekerke", "Brouwershaven", "Nieuw- en Sint Joosland"],
    }
    
    # Build reverse lookup
    city_to_province = {}
    for prov, cities in provinces.items():
        for c in cities:
            city_to_province[c.lower()] = prov
    
    postal_match = re.search(r'(\d{4}\s*[A-Z]{2})', address)
    postal_code = postal_match.group(1).replace(" ", " ") if postal_match else ""
    
    # Try to get city from address
    parts = address.split(",")
    city = ""
    province = ""
    
    if len(parts) >= 2:
        city_part = parts[-2].strip()
        # Remove postal code prefix
        city = re.sub(r'^\d{4}\s*[A-Z]{2}\s*', '', city_part).strip()
        province = city_to_province.get(city.lower(), "")
    
    if not province and len(parts) >= 3:
        city_part = parts[-3].strip()
        city = re.sub(r'^\d{4}\s*[A-Z]{2}\s*', '', city_part).strip()
        province = city_to_province.get(city.lower(), "")
    
    return {"city": city, "postal_code": postal_code, "province": province}

def transform(place):
    dn = place.get("displayName", {})
    loc = place.get("location", {})
    addr = place.get("formattedAddress", "")
    info = parse_address(addr)
    
    return {
        "google_place_id": place.get("id", ""),
        "name": dn.get("text", "") if isinstance(dn, dict) else str(dn),
        "address": addr,
        "city": info.get("city", ""),
        "province": info.get("province", ""),
        "postal_code": info.get("postal_code", ""),
        "latitude": loc.get("latitude"),
        "longitude": loc.get("longitude"),
        "phone": place.get("nationalPhoneNumber", place.get("internationalPhoneNumber", "")),
        "website": place.get("websiteUri", ""),
        "rating": place.get("rating"),
        "review_count": place.get("userRatingCount"),
        "google_maps_url": place.get("googleMapsUri", ""),
        "business_status": place.get("businessStatus", ""),
        "types": place.get("types", []),
    }

# Load raw data
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "places_raw.json"), "r", encoding="utf-8") as f:
    raw = json.load(f)

print(f"Total raw places: {len(raw)}")

# Get existing IDs from Supabase
print("Fetching existing IDs from Supabase...")
req = Request(f"{SUPABASE_URL}/rest/v1/practices?select=google_place_id")
req.add_header("apikey", SERVICE_ROLE_KEY)
req.add_header("Authorization", f"Bearer {SERVICE_ROLE_KEY}")
with urlopen(req) as resp:
    existing = json.loads(resp.read().decode())
existing_ids = {r["google_place_id"] for r in existing}
print(f"Existing in Supabase: {len(existing_ids)}")

# Upload new ones only
records = [transform(p) for p in raw if p.get("id") and p["id"] not in existing_ids]
print(f"New records to upload: {len(records)}")

# Upload in batches
batch_size = 100
success = 0
errors = 0

for i in range(0, len(records), batch_size):
    batch = records[i:i+batch_size]
    data = json.dumps(batch).encode("utf-8")
    
    req = Request(f"{SUPABASE_URL}/rest/v1/practices", data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("apikey", SERVICE_ROLE_KEY)
    req.add_header("Authorization", f"Bearer {SERVICE_ROLE_KEY}")
    req.add_header("Prefer", "return=minimal")
    
    try:
        with urlopen(req) as resp:
            success += len(batch)
    except HTTPError as e:
        body = e.read().decode() if e.fp else "?"
        print(f"  Error batch {i//batch_size}: {body[:200]}")
        
        # Try one by one
        for r in batch:
            data2 = json.dumps(r).encode("utf-8")
            req2 = Request(f"{SUPABASE_URL}/rest/v1/practices", data=data2, method="POST")
            req2.add_header("Content-Type", "application/json")
            req2.add_header("apikey", SERVICE_ROLE_KEY)
            req2.add_header("Authorization", f"Bearer {SERVICE_ROLE_KEY}")
            req2.add_header("Prefer", "return=minimal")
            try:
                with urlopen(req2) as resp2:
                    success += 1
            except:
                errors += 1
    
    print(f"  Uploaded {min(i+batch_size, len(records))}/{len(records)}", end="\r")

print(f"\n\nDone! Success: {success}, Errors: {errors}")
print(f"Total in Supabase: {len(existing_ids) + success}")
