"""Generate SQL and upload via file-based approach."""
import json, os, re

def parse_address(address):
    if not address:
        return "", "", ""
    provinces_map = {
        "Amsterdam": "Noord-Holland", "Haarlem": "Noord-Holland", "Amstelveen": "Noord-Holland",
        "Purmerend": "Noord-Holland", "Alkmaar": "Noord-Holland", "Hoorn": "Noord-Holland",
        "Den Helder": "Noord-Holland", "Hilversum": "Noord-Holland", "Beverwijk": "Noord-Holland",
        "Zaandam": "Noord-Holland", "Hoofddorp": "Noord-Holland", "Heemstede": "Noord-Holland",
        "Castricum": "Noord-Holland", "IJmuiden": "Noord-Holland", "Schagen": "Noord-Holland",
        "Uithoorn": "Noord-Holland", "Aalsmeer": "Noord-Holland", "Diemen": "Noord-Holland",
        "Bloemendaal": "Noord-Holland", "Velsen": "Noord-Holland", "Wormerveer": "Noord-Holland",
        "Zaandijk": "Noord-Holland", "Krommenie": "Noord-Holland", "Landsmeer": "Noord-Holland",
        "Bergen": "Noord-Holland", "Heiloo": "Noord-Holland", "Egmond aan Zee": "Noord-Holland",
        "Bussum": "Noord-Holland", "Naarden": "Noord-Holland", "Huizen": "Noord-Holland",
        "Laren": "Noord-Holland", "Blaricum": "Noord-Holland", "Muiderberg": "Noord-Holland",
        "Kortenhoef": "Noord-Holland", "Loosdrecht": "Noord-Holland", "Weesp": "Noord-Holland",
        "Rotterdam": "Zuid-Holland", "Den Haag": "Zuid-Holland", "Leiden": "Zuid-Holland",
        "Dordrecht": "Zuid-Holland", "Zoetermeer": "Zuid-Holland", "Delft": "Zuid-Holland",
        "Gouda": "Zuid-Holland", "Alphen aan den Rijn": "Zuid-Holland", "Schiedam": "Zuid-Holland",
        "Vlaardingen": "Zuid-Holland", "Capelle aan den IJssel": "Zuid-Holland",
        "Spijkenisse": "Zuid-Holland", "Ridderkerk": "Zuid-Holland", "Gorinchem": "Zuid-Holland",
        "Leidschendam": "Zuid-Holland", "Katwijk": "Zuid-Holland", "Wassenaar": "Zuid-Holland",
        "Voorburg": "Zuid-Holland", "Rijswijk": "Zuid-Holland", "Leiderdorp": "Zuid-Holland",
        "Oegstgeest": "Zuid-Holland", "Voorschoten": "Zuid-Holland", "Papendrecht": "Zuid-Holland",
        "Zwijndrecht": "Zuid-Holland", "Sliedrecht": "Zuid-Holland", "Barendrecht": "Zuid-Holland",
        "Noordwijk": "Zuid-Holland", "Hillegom": "Zuid-Holland", "Warmond": "Zuid-Holland",
        "Voorhout": "Zuid-Holland", "Hendrik-Ido-Ambacht": "Zuid-Holland", "Alblasserdam": "Zuid-Holland",
        "Maassluis": "Zuid-Holland", "Naaldwijk": "Zuid-Holland", "Pijnacker": "Zuid-Holland",
        "Nootdorp": "Zuid-Holland", "Waddinxveen": "Zuid-Holland", "Bodegraven": "Zuid-Holland",
        "Lisse": "Zuid-Holland", "Sassenheim": "Zuid-Holland", "Monster": "Zuid-Holland",
        "Zoeterwoude- Rijndijk": "Zuid-Holland",
        "Utrecht": "Utrecht", "Amersfoort": "Utrecht", "Zeist": "Utrecht",
        "Nieuwegein": "Utrecht", "Veenendaal": "Utrecht", "Soest": "Utrecht",
        "Baarn": "Utrecht", "De Bilt": "Utrecht", "IJsselstein": "Utrecht",
        "Houten": "Utrecht", "Culemborg": "Utrecht", "Abcoude": "Utrecht",
        "Den Dolder": "Utrecht", "Maartensdijk": "Utrecht", "Eemnes": "Utrecht",
        "Bilthoven": "Utrecht", "Bunnik": "Utrecht", "Woerden": "Utrecht",
        "Driebergen": "Utrecht", "Breukelen": "Utrecht", "Maarssen": "Utrecht",
        "Vleuten": "Utrecht", "De Meern": "Utrecht",
        "Eindhoven": "Noord-Brabant", "Tilburg": "Noord-Brabant", "Breda": "Noord-Brabant",
        "'s-Hertogenbosch": "Noord-Brabant", "Helmond": "Noord-Brabant", "Oss": "Noord-Brabant",
        "Roosendaal": "Noord-Brabant", "Bergen op Zoom": "Noord-Brabant",
        "Waalwijk": "Noord-Brabant", "Boxtel": "Noord-Brabant", "Uden": "Noord-Brabant",
        "Veldhoven": "Noord-Brabant", "Rosmalen": "Noord-Brabant", "Vught": "Noord-Brabant",
        "Goirle": "Noord-Brabant", "Etten-Leur": "Noord-Brabant", "Best": "Noord-Brabant",
        "Oisterwijk": "Noord-Brabant", "Dongen": "Noord-Brabant", "Cuijk": "Noord-Brabant",
        "Deurne": "Noord-Brabant", "Geldrop": "Noord-Brabant", "Nuenen": "Noord-Brabant",
        "Valkenswaard": "Noord-Brabant", "Heeze": "Noord-Brabant", "Someren": "Noord-Brabant",
        "Asten": "Noord-Brabant", "Gemert": "Noord-Brabant", "Veghel": "Noord-Brabant",
        "Schijndel": "Noord-Brabant", "Sint-Oedenrode": "Noord-Brabant",
        "Arnhem": "Gelderland", "Nijmegen": "Gelderland", "Apeldoorn": "Gelderland",
        "Ede": "Gelderland", "Doetinchem": "Gelderland", "Harderwijk": "Gelderland",
        "Barneveld": "Gelderland", "Tiel": "Gelderland", "Zutphen": "Gelderland",
        "Winterswijk": "Gelderland", "Zevenaar": "Gelderland", "Wageningen": "Gelderland",
        "Velp": "Gelderland", "Oosterbeek": "Gelderland", "Elst": "Gelderland",
        "Duiven": "Gelderland", "Westervoort": "Gelderland", "Dieren": "Gelderland",
        "Lent": "Gelderland", "Nunspeet": "Gelderland", "Epe": "Gelderland",
        "Hattem": "Gelderland", "Lochem": "Gelderland", "Borculo": "Gelderland",
        "Rheden": "Gelderland", "Heerde": "Gelderland", "Culemborg": "Gelderland",
        "Bennekom": "Gelderland", "Renkum": "Gelderland",
        "Zwolle": "Overijssel", "Enschede": "Overijssel", "Deventer": "Overijssel",
        "Almelo": "Overijssel", "Kampen": "Overijssel", "Hengelo": "Overijssel",
        "Oldenzaal": "Overijssel", "Hardenberg": "Overijssel", "Raalte": "Overijssel",
        "Rijssen": "Overijssel", "Nijverdal": "Overijssel", "Borne": "Overijssel",
        "Vriezenveen": "Overijssel", "Dalfsen": "Overijssel", "Steenwijk": "Overijssel",
        "IJsselmuiden": "Overijssel", "Hasselt": "Overijssel", "Zwartsluis": "Overijssel",
        "Wierden": "Overijssel",
        "Maastricht": "Limburg", "Venlo": "Limburg", "Heerlen": "Limburg",
        "Sittard": "Limburg", "Roermond": "Limburg", "Weert": "Limburg",
        "Kerkrade": "Limburg", "Geleen": "Limburg", "Brunssum": "Limburg",
        "Landgraaf": "Limburg", "Tegelen": "Limburg", "Venray": "Limburg",
        "Meerssen": "Limburg", "Valkenburg": "Limburg", "Horst": "Limburg",
        "Panningen": "Limburg", "Swalmen": "Limburg", "Neer": "Limburg",
        "Leeuwarden": "Friesland", "Heerenveen": "Friesland", "Sneek": "Friesland",
        "Drachten": "Friesland", "Dokkum": "Friesland", "Harlingen": "Friesland",
        "Franeker": "Friesland", "Joure": "Friesland", "Bolsward": "Friesland",
        "Groningen": "Groningen", "Veendam": "Groningen", "Stadskanaal": "Groningen",
        "Winschoten": "Groningen", "Hoogezand": "Groningen",
        "Emmen": "Drenthe", "Assen": "Drenthe", "Hoogeveen": "Drenthe",
        "Meppel": "Drenthe", "Coevorden": "Drenthe",
        "Almere": "Flevoland", "Lelystad": "Flevoland",
        "Middelburg": "Zeeland", "Goes": "Zeeland", "Terneuzen": "Zeeland",
        "Vlissingen": "Zeeland",
    }
    postal_match = re.search(r'(\d{4}\s*[A-Z]{2})', address)
    postal_code = postal_match.group(1) if postal_match else ""
    parts = address.split(",")
    city = ""
    province = ""
    if len(parts) >= 2:
        city_part = parts[-2].strip()
        city = re.sub(r'^\d{4}\s*[A-Z]{2}\s*', '', city_part).strip()
        province = provinces_map.get(city, "")
    if not province and len(parts) >= 3:
        city_part = parts[-3].strip()
        city2 = re.sub(r'^\d{4}\s*[A-Z]{2}\s*', '', city_part).strip()
        prov2 = provinces_map.get(city2, "")
        if prov2:
            city = city2
            province = prov2
    return city, postal_code, province


def esc(s):
    if s is None or s == "":
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "places_raw.json"), "r", encoding="utf-8") as f:
    raw = json.load(f)

print(f"Total raw: {len(raw)}")

# Generate SQL batches of 25 records
batch_size = 25
batch_idx = 0
sql_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_batches")
os.makedirs(sql_dir, exist_ok=True)

for i in range(0, len(raw), batch_size):
    batch = raw[i:i+batch_size]
    values = []
    for p in batch:
        pid = p.get("id")
        if not pid:
            continue
        dn = p.get("displayName", {})
        name = dn.get("text", "") if isinstance(dn, dict) else str(dn)
        loc = p.get("location", {})
        addr = p.get("formattedAddress", "")
        city, postal_code, province = parse_address(addr)
        lat = loc.get("latitude")
        lng = loc.get("longitude")
        
        val = f"({esc(pid)}, {esc(name)}, {esc(addr)}, {esc(city)}, {esc(province)}, {esc(postal_code)}, {lat if lat else 'NULL'}, {lng if lng else 'NULL'}, {esc(p.get('nationalPhoneNumber', p.get('internationalPhoneNumber')))}, {esc(p.get('websiteUri'))}, {p.get('rating') if p.get('rating') else 'NULL'}, {p.get('userRatingCount') if p.get('userRatingCount') else 'NULL'}, {esc(p.get('googleMapsUri'))}, {esc(p.get('businessStatus'))})"
        values.append(val)
    
    if values:
        sql = f"INSERT INTO practices (google_place_id, name, address, city, province, postal_code, latitude, longitude, phone, website, rating, review_count, google_maps_url, business_status) VALUES\n" + ",\n".join(values) + "\nON CONFLICT (google_place_id) DO NOTHING;"
        
        out_file = os.path.join(sql_dir, f"batch_{batch_idx:04d}.sql")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(sql)
        batch_idx += 1

print(f"Generated {batch_idx} batch files in {sql_dir}")
