"""
Google Places API — Collect all fysiotherapie practices in the Netherlands.

Usage:
    python collect_places.py                  # Full collection
    python collect_places.py --test           # Test with 1 search point
    python collect_places.py --stats          # Show stats from existing data
    python collect_places.py --resume         # Resume from last checkpoint
"""

import json
import csv
import time
import os
import sys
import argparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from datetime import datetime

# ─── Config ───────────────────────────────────────────────────────────────────
API_KEY = os.environ.get("GOOGLE_API_KEY", "")
if not API_KEY:
    raise ValueError("Set GOOGLE_API_KEY environment variable")
BASE_URL = "https://places.googleapis.com/v1/places:searchText"

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_FILE = os.path.join(OUTPUT_DIR, "places_raw.json")
CLEAN_FILE = os.path.join(OUTPUT_DIR, "places_clean.csv")
CHECKPOINT_FILE = os.path.join(OUTPUT_DIR, "places_checkpoint.json")

# Fields to request (controls pricing tier)
FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.rating",
    "places.userRatingCount",
    "places.googleMapsUri",
    "places.businessStatus",
    "places.types",
])

# ─── Search Points ────────────────────────────────────────────────────────────
# 25 points distributed across the Netherlands to ensure full coverage.
# Each point uses a 25-30km radius. Points overlap slightly to avoid gaps.

SEARCH_POINTS = [
    # Noord-Holland
    {"name": "Amsterdam", "lat": 52.3676, "lng": 4.9041, "radius": 25000},
    {"name": "Alkmaar", "lat": 52.6324, "lng": 4.7534, "radius": 25000},
    {"name": "Hilversum", "lat": 52.2292, "lng": 5.1765, "radius": 25000},
    
    # Zuid-Holland
    {"name": "Rotterdam", "lat": 51.9244, "lng": 4.4777, "radius": 25000},
    {"name": "Den Haag", "lat": 52.0705, "lng": 4.3007, "radius": 25000},
    {"name": "Leiden", "lat": 52.1601, "lng": 4.4970, "radius": 20000},
    {"name": "Dordrecht", "lat": 51.8133, "lng": 4.6901, "radius": 25000},
    
    # Utrecht
    {"name": "Utrecht", "lat": 52.0907, "lng": 5.1214, "radius": 25000},
    
    # Noord-Brabant
    {"name": "Eindhoven", "lat": 51.4416, "lng": 5.4697, "radius": 30000},
    {"name": "Tilburg", "lat": 51.5555, "lng": 5.0913, "radius": 25000},
    {"name": "Breda", "lat": 51.5719, "lng": 4.7683, "radius": 25000},
    {"name": "'s-Hertogenbosch", "lat": 51.6978, "lng": 5.3037, "radius": 25000},
    
    # Gelderland
    {"name": "Arnhem", "lat": 51.9851, "lng": 5.8987, "radius": 30000},
    {"name": "Nijmegen", "lat": 51.8426, "lng": 5.8527, "radius": 25000},
    {"name": "Apeldoorn", "lat": 52.2112, "lng": 5.9699, "radius": 30000},
    
    # Overijssel
    {"name": "Zwolle", "lat": 52.5168, "lng": 6.0830, "radius": 30000},
    {"name": "Enschede", "lat": 52.2215, "lng": 6.8937, "radius": 30000},
    
    # Limburg
    {"name": "Maastricht", "lat": 50.8514, "lng": 5.6910, "radius": 30000},
    {"name": "Venlo", "lat": 51.3704, "lng": 6.1724, "radius": 30000},
    
    # Friesland
    {"name": "Leeuwarden", "lat": 53.2014, "lng": 5.7998, "radius": 35000},
    
    # Groningen
    {"name": "Groningen", "lat": 53.2194, "lng": 6.5665, "radius": 35000},
    
    # Drenthe
    {"name": "Emmen", "lat": 52.7792, "lng": 6.9069, "radius": 35000},
    
    # Flevoland
    {"name": "Almere", "lat": 52.3508, "lng": 5.2647, "radius": 25000},
    
    # Zeeland
    {"name": "Middelburg", "lat": 51.4988, "lng": 3.6109, "radius": 35000},
]


def make_api_request(text_query, lat, lng, radius, page_token=None):
    """Make a Text Search (New) API request."""
    
    body = {
        "textQuery": text_query,
        "locationBias": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": float(radius)
            }
        },
        "languageCode": "nl",
        "regionCode": "NL",
        "maxResultCount": 20,
    }
    
    if page_token:
        body["pageToken"] = page_token
    
    data = json.dumps(body).encode("utf-8")
    
    req = Request(BASE_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-Goog-Api-Key", API_KEY)
    req.add_header("X-Goog-FieldMask", FIELD_MASK + ",nextPageToken")
    
    try:
        with urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else "No details"
        print(f"  ❌ HTTP Error {e.code}: {error_body[:200]}")
        return None
    except URLError as e:
        print(f"  ❌ URL Error: {e.reason}")
        return None


def search_area(point, all_places, search_terms=None):
    """Search for fysiotherapie in a given area, handling pagination."""
    
    if search_terms is None:
        search_terms = ["fysiotherapie", "fysiotherapeut"]
    
    found_in_area = 0
    new_in_area = 0
    
    for term in search_terms:
        page = 1
        page_token = None
        
        while True:
            print(f"  🔍 '{term}' page {page}...", end=" ", flush=True)
            
            result = make_api_request(
                text_query=term,
                lat=point["lat"],
                lng=point["lng"],
                radius=point["radius"],
                page_token=page_token
            )
            
            if result is None:
                print("failed")
                break
            
            places = result.get("places", [])
            print(f"got {len(places)} results")
            
            if not places:
                break
            
            for place in places:
                place_id = place.get("id", "")
                if place_id and place_id not in all_places:
                    all_places[place_id] = place
                    new_in_area += 1
                found_in_area += 1
            
            page_token = result.get("nextPageToken")
            if not page_token:
                break
            
            page += 1
            time.sleep(0.5)  # Be gentle with the API
        
        time.sleep(0.3)
    
    return found_in_area, new_in_area


def extract_clean_data(place):
    """Extract clean data from a place result."""
    
    display_name = place.get("displayName", {})
    location = place.get("location", {})
    
    return {
        "place_id": place.get("id", ""),
        "name": display_name.get("text", "") if isinstance(display_name, dict) else str(display_name),
        "address": place.get("formattedAddress", ""),
        "latitude": location.get("latitude", ""),
        "longitude": location.get("longitude", ""),
        "phone": place.get("nationalPhoneNumber", place.get("internationalPhoneNumber", "")),
        "website": place.get("websiteUri", ""),
        "rating": place.get("rating", ""),
        "reviews_count": place.get("userRatingCount", ""),
        "google_maps_url": place.get("googleMapsUri", ""),
        "business_status": place.get("businessStatus", ""),
        "types": "|".join(place.get("types", [])),
    }


def save_checkpoint(all_places, completed_points):
    """Save progress to checkpoint file."""
    checkpoint = {
        "timestamp": datetime.now().isoformat(),
        "completed_points": completed_points,
        "total_places": len(all_places),
        "place_ids": list(all_places.keys()),
    }
    with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
        json.dump(checkpoint, f, ensure_ascii=False, indent=2)


def save_results(all_places):
    """Save results to JSON and CSV."""
    
    # Save raw JSON
    places_list = list(all_places.values())
    with open(RAW_FILE, "w", encoding="utf-8") as f:
        json.dump(places_list, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Raw data saved: {RAW_FILE} ({len(places_list)} places)")
    
    # Save clean CSV
    if places_list:
        clean_data = [extract_clean_data(p) for p in places_list]
        
        fieldnames = clean_data[0].keys()
        with open(CLEAN_FILE, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(clean_data)
        print(f"📊 Clean CSV saved: {CLEAN_FILE} ({len(clean_data)} rows)")


def show_stats():
    """Show statistics from existing data."""
    
    if not os.path.exists(RAW_FILE):
        print("❌ No data file found. Run collection first.")
        return
    
    with open(RAW_FILE, "r", encoding="utf-8") as f:
        places = json.load(f)
    
    print(f"\n📊 Statistics for {RAW_FILE}")
    print(f"{'─' * 50}")
    print(f"Total practices: {len(places)}")
    
    # Count by city (extract from address)
    cities = {}
    for p in places:
        addr = p.get("formattedAddress", "")
        # Try to extract city from Dutch address format
        parts = addr.split(",")
        if len(parts) >= 2:
            city_part = parts[-2].strip()
            # Remove postal code
            city = " ".join(city_part.split()[1:]) if city_part and city_part[0].isdigit() else city_part
            cities[city] = cities.get(city, 0) + 1
    
    print(f"\nTop 20 cities:")
    for city, count in sorted(cities.items(), key=lambda x: -x[1])[:20]:
        print(f"  {city}: {count}")
    
    # Ratings
    rated = [p["rating"] for p in places if p.get("rating")]
    if rated:
        print(f"\nRatings: avg={sum(rated)/len(rated):.1f}, min={min(rated)}, max={max(rated)}")
        print(f"With rating: {len(rated)}/{len(places)}")
    
    # Websites
    with_website = sum(1 for p in places if p.get("websiteUri"))
    with_phone = sum(1 for p in places if p.get("nationalPhoneNumber") or p.get("internationalPhoneNumber"))
    print(f"\nWith website: {with_website}/{len(places)} ({100*with_website//len(places)}%)")
    print(f"With phone: {with_phone}/{len(places)} ({100*with_phone//len(places)}%)")


def main():
    parser = argparse.ArgumentParser(description="Collect fysiotherapie practices from Google Places API")
    parser.add_argument("--test", action="store_true", help="Test with 1 search point only")
    parser.add_argument("--stats", action="store_true", help="Show stats from existing data")
    parser.add_argument("--resume", action="store_true", help="Resume from checkpoint")
    args = parser.parse_args()
    
    if args.stats:
        show_stats()
        return
    
    print("=" * 60)
    print("🏥 Google Places — Fysiotherapie Practices in Netherlands")
    print("=" * 60)
    
    points = SEARCH_POINTS
    if args.test:
        points = [SEARCH_POINTS[0]]  # Just Amsterdam
        print("⚡ TEST MODE: searching Amsterdam only\n")
    
    # Load existing data if resuming
    all_places = {}
    completed_points = []
    
    if args.resume and os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
            checkpoint = json.load(f)
        completed_points = checkpoint.get("completed_points", [])
        
        if os.path.exists(RAW_FILE):
            with open(RAW_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
            for p in existing:
                pid = p.get("id", "")
                if pid:
                    all_places[pid] = p
        
        print(f"📂 Resumed: {len(all_places)} places, {len(completed_points)} points completed\n")
    
    total_api_calls = 0
    
    for i, point in enumerate(points, 1):
        if point["name"] in completed_points:
            print(f"[{i}/{len(points)}] ⏭️  {point['name']} — already done, skipping")
            continue
        
        print(f"\n[{i}/{len(points)}] 📍 {point['name']} (r={point['radius']//1000}km)")
        
        before = len(all_places)
        found, new = search_area(point, all_places)
        total_api_calls += (found // 20) + 2  # Rough estimate
        
        print(f"  ✅ Found: {found} | New unique: {new} | Total: {len(all_places)}")
        
        completed_points.append(point["name"])
        save_checkpoint(all_places, completed_points)
        
        time.sleep(1)  # Pause between areas
    
    # Final save
    save_results(all_places)
    
    print(f"\n{'=' * 60}")
    print(f"✅ DONE!")
    print(f"   Total unique practices: {len(all_places)}")
    print(f"   Estimated API calls: ~{total_api_calls}")
    print(f"   Cost: likely $0 (within free tier)")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
