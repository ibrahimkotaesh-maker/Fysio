"""Collect physiotherapy practices for specific missing Dutch cities."""
import json, os, time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

API_KEY = os.environ.get("GOOGLE_API_KEY", "")
if not API_KEY:
    raise ValueError("Set GOOGLE_API_KEY environment variable")
BASE_URL = "https://places.googleapis.com/v1/places:searchText"

FIELD_MASK = ",".join([
    "places.id", "places.displayName", "places.formattedAddress",
    "places.location", "places.nationalPhoneNumber",
    "places.internationalPhoneNumber", "places.websiteUri",
    "places.rating", "places.userRatingCount", "places.googleMapsUri",
    "places.businessStatus", "places.types",
])

# Missing cities with coordinates for locationBias
MISSING_CITIES = [
    {"name": "Alphen aan den Rijn", "lat": 52.1286, "lng": 4.6553},
    {"name": "Haarlem", "lat": 52.3874, "lng": 4.6462},
    {"name": "Gouda", "lat": 52.0115, "lng": 4.7104},
    {"name": "Delft", "lat": 52.0116, "lng": 4.3571},
    {"name": "Zoetermeer", "lat": 52.0572, "lng": 4.4932},
    {"name": "Amersfoort", "lat": 52.1561, "lng": 5.3878},
    {"name": "Amstelveen", "lat": 52.3008, "lng": 4.8631},
    {"name": "Schiedam", "lat": 51.9217, "lng": 4.3999},
    {"name": "Vlaardingen", "lat": 51.9120, "lng": 4.3419},
    {"name": "Purmerend", "lat": 52.5050, "lng": 4.9597},
    {"name": "Heerlen", "lat": 50.8884, "lng": 5.9813},
    {"name": "Sittard", "lat": 51.0007, "lng": 5.8681},
    {"name": "Roermond", "lat": 51.1945, "lng": 5.9860},
    {"name": "Helmond", "lat": 51.4818, "lng": 5.6611},
    {"name": "Oss", "lat": 51.7650, "lng": 5.5195},
    {"name": "Roosendaal", "lat": 51.5308, "lng": 4.4653},
    {"name": "Bergen op Zoom", "lat": 51.4949, "lng": 4.2911},
    {"name": "Waalwijk", "lat": 51.6837, "lng": 5.0725},
    {"name": "Veenendaal", "lat": 52.0273, "lng": 5.5564},
    {"name": "Ede", "lat": 52.0484, "lng": 5.6718},
    {"name": "Wageningen", "lat": 51.9692, "lng": 5.6654},
    {"name": "Doetinchem", "lat": 51.9665, "lng": 6.2892},
    {"name": "Harderwijk", "lat": 52.3476, "lng": 5.6234},
    {"name": "Kampen", "lat": 52.5575, "lng": 5.9100},
    {"name": "Deventer", "lat": 52.2508, "lng": 6.1636},
    {"name": "Almelo", "lat": 52.3567, "lng": 6.6627},
    {"name": "Heerenveen", "lat": 52.9598, "lng": 5.9217},
    {"name": "Sneek", "lat": 53.0338, "lng": 5.6614},
    {"name": "Assen", "lat": 52.9929, "lng": 6.5623},
    {"name": "Hoogeveen", "lat": 52.7237, "lng": 6.4740},
    {"name": "Meppel", "lat": 52.6957, "lng": 6.1944},
    {"name": "Lelystad", "lat": 52.5185, "lng": 5.4714},
    {"name": "Zeist", "lat": 52.0907, "lng": 5.2332},
    {"name": "Nieuwegein", "lat": 52.0285, "lng": 5.0835},
    {"name": "Capelle aan den IJssel", "lat": 51.9329, "lng": 4.5780},
    {"name": "Spijkenisse", "lat": 51.8448, "lng": 4.3293},
    {"name": "Ridderkerk", "lat": 51.8729, "lng": 4.6023},
    {"name": "Gorinchem", "lat": 51.8361, "lng": 4.9741},
    {"name": "Leidschendam", "lat": 52.0866, "lng": 4.3936},
    {"name": "Katwijk", "lat": 52.2001, "lng": 4.4142},
    {"name": "Beverwijk", "lat": 52.4870, "lng": 4.6569},
    {"name": "Hoorn", "lat": 52.6424, "lng": 5.0593},
    {"name": "Den Helder", "lat": 52.9534, "lng": 4.7600},
    {"name": "Goes", "lat": 51.5041, "lng": 3.8910},
    {"name": "Terneuzen", "lat": 51.3356, "lng": 3.8277},
    {"name": "Veendam", "lat": 53.1060, "lng": 6.8793},
    {"name": "Hardenberg", "lat": 52.5747, "lng": 6.6206},
    {"name": "Weert", "lat": 51.2517, "lng": 5.7066},
    {"name": "Kerkrade", "lat": 50.8660, "lng": 6.0625},
    {"name": "Geleen", "lat": 50.9772, "lng": 5.8339},
    {"name": "Brunssum", "lat": 50.9478, "lng": 5.9696},
    {"name": "Boxtel", "lat": 51.5918, "lng": 5.3267},
    {"name": "Uden", "lat": 51.6615, "lng": 5.6200},
    {"name": "Barneveld", "lat": 52.1364, "lng": 5.5884},
    {"name": "Nunspeet", "lat": 52.3775, "lng": 5.7872},
    {"name": "Tiel", "lat": 51.8875, "lng": 5.4318},
    {"name": "Culemborg", "lat": 51.9557, "lng": 5.2277},
    {"name": "Zutphen", "lat": 52.1384, "lng": 6.1968},
    {"name": "Winterswijk", "lat": 51.9717, "lng": 6.7206},
    {"name": "Zevenaar", "lat": 51.9308, "lng": 6.0707},
    {"name": "Drachten", "lat": 53.1037, "lng": 6.0904},
    {"name": "Dokkum", "lat": 53.3287, "lng": 5.9997},
    {"name": "Harlingen", "lat": 53.1760, "lng": 5.4266},
    {"name": "Rijssen", "lat": 52.3067, "lng": 6.5187},
    {"name": "Nijverdal", "lat": 52.3647, "lng": 6.4580},
]


def search_city(city_info):
    """Search for physiotherapy practices in a specific city."""
    all_places = []
    next_token = None
    pages = 0

    while pages < 3:
        body = {
            "textQuery": f"fysiotherapie {city_info['name']}",
            "locationBias": {
                "circle": {
                    "center": {"latitude": city_info["lat"], "longitude": city_info["lng"]},
                    "radius": 15000.0
                }
            },
            "languageCode": "nl",
            "regionCode": "NL",
            "maxResultCount": 20,
        }
        if next_token:
            body["pageToken"] = next_token

        data = json.dumps(body).encode("utf-8")
        req = Request(BASE_URL, data=data, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("X-Goog-Api-Key", API_KEY)
        req.add_header("X-Goog-FieldMask", FIELD_MASK + ",nextPageToken")

        try:
            with urlopen(req) as resp:
                result = json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            body_text = e.read().decode("utf-8") if e.fp else "?"
            print(f"  Error {e.code}: {body_text[:100]}")
            break

        places = result.get("places", [])
        all_places.extend(places)
        next_token = result.get("nextPageToken")
        pages += 1

        if not next_token:
            break
        time.sleep(0.5)

    return all_places


# Load existing data
existing_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "places_raw.json")
with open(existing_file, "r", encoding="utf-8") as f:
    existing = json.load(f)

existing_ids = {p.get("id") for p in existing}
print(f"Existing: {len(existing)} places ({len(existing_ids)} unique IDs)")

new_places = []
total_cities = len(MISSING_CITIES)

for i, city_info in enumerate(MISSING_CITIES, 1):
    print(f"[{i:3d}/{total_cities}] {city_info['name']}...", end=" ", flush=True)
    places = search_city(city_info)

    added = 0
    for p in places:
        pid = p.get("id")
        if pid and pid not in existing_ids:
            new_places.append(p)
            existing_ids.add(pid)
            added += 1

    print(f"found {len(places)}, new: {added}")
    time.sleep(0.3)

print(f"\n=== Done ===")
print(f"New unique places: {len(new_places)}")
print(f"Total (existing + new): {len(existing) + len(new_places)}")

# Merge and save
all_places = existing + new_places
with open(existing_file, "w", encoding="utf-8") as f:
    json.dump(all_places, f, ensure_ascii=False, indent=2)

print(f"Saved to {existing_file}")
