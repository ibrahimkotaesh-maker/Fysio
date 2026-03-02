"""Parse raw data and generate individual SQL INSERT statements for MCP execution."""
import json, os, re

def parse_address(address):
    """Extract city, postal_code from Dutch address format: 'Street, Postal City, Netherlands'"""
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
        "Landsmeer": "Noord-Holland", "Bergen": "Noord-Holland", "Heiloo": "Noord-Holland",
        "Bussum": "Noord-Holland", "Naarden": "Noord-Holland", "Huizen": "Noord-Holland",
        "Laren": "Noord-Holland", "Blaricum": "Noord-Holland", "Weesp": "Noord-Holland",
        "Heerhugowaard": "Noord-Holland", "Enkhuizen": "Noord-Holland", "Stompetoren": "Noord-Holland",
        "Koedijk": "Noord-Holland", "Kortenhoef": "Noord-Holland", "Loosdrecht": "Noord-Holland",
        "De Rijp": "Noord-Holland", "Egmond aan Zee": "Noord-Holland", "Edam": "Noord-Holland",
        "Volendam": "Noord-Holland", "Sint Pancras": "Noord-Holland", "Oudorp": "Noord-Holland",
        "Broek op Langedijk": "Noord-Holland", "Noord-Scharwoude": "Noord-Holland",

        "Rotterdam": "Zuid-Holland", "Den Haag": "Zuid-Holland", "Leiden": "Zuid-Holland",
        "Dordrecht": "Zuid-Holland", "Zoetermeer": "Zuid-Holland", "Delft": "Zuid-Holland",
        "Gouda": "Zuid-Holland", "Alphen aan den Rijn": "Zuid-Holland", "Schiedam": "Zuid-Holland",
        "Vlaardingen": "Zuid-Holland", "Capelle aan den IJssel": "Zuid-Holland",
        "Spijkenisse": "Zuid-Holland", "Ridderkerk": "Zuid-Holland", "Gorinchem": "Zuid-Holland",
        "Leidschendam": "Zuid-Holland", "Katwijk": "Zuid-Holland", "Wassenaar": "Zuid-Holland",
        "Voorburg": "Zuid-Holland", "Rijswijk": "Zuid-Holland", "Leiderdorp": "Zuid-Holland",
        "Oegstgeest": "Zuid-Holland", "Voorschoten": "Zuid-Holland", "Papendrecht": "Zuid-Holland",
        "Zwijndrecht": "Zuid-Holland", "Sliedrecht": "Zuid-Holland", "Barendrecht": "Zuid-Holland",
        "Noordwijk": "Zuid-Holland", "Hillegom": "Zuid-Holland", "Maassluis": "Zuid-Holland",
        "Naaldwijk": "Zuid-Holland", "Pijnacker": "Zuid-Holland", "Nootdorp": "Zuid-Holland",
        "Waddinxveen": "Zuid-Holland", "Bodegraven": "Zuid-Holland", "Lisse": "Zuid-Holland",
        "Sassenheim": "Zuid-Holland", "Voorhout": "Zuid-Holland", "Warmond": "Zuid-Holland",
        "Hendrik-Ido-Ambacht": "Zuid-Holland", "Alblasserdam": "Zuid-Holland",
        "Monster": "Zuid-Holland", "Nieuwkoop": "Zuid-Holland",

        "Utrecht": "Utrecht", "Amersfoort": "Utrecht", "Zeist": "Utrecht",
        "Nieuwegein": "Utrecht", "Veenendaal": "Utrecht", "Soest": "Utrecht",
        "Baarn": "Utrecht", "De Bilt": "Utrecht", "IJsselstein": "Utrecht",
        "Houten": "Utrecht", "Culemborg": "Utrecht", "Abcoude": "Utrecht",
        "Den Dolder": "Utrecht", "Maartensdijk": "Utrecht", "Eemnes": "Utrecht",
        "Bilthoven": "Utrecht", "Bunnik": "Utrecht", "Woerden": "Utrecht",
        "Driebergen": "Utrecht", "Breukelen": "Utrecht", "Maarssen": "Utrecht",
        "Vleuten": "Utrecht", "De Meern": "Utrecht", "Wijk bij Duurstede": "Utrecht",

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
        "Drunen": "Noord-Brabant", "Kaatsheuvel": "Noord-Brabant", "Oosterhout": "Noord-Brabant",
        "Woensdrecht": "Noord-Brabant", "Rucphen": "Noord-Brabant", "Halsteren": "Noord-Brabant",

        "Arnhem": "Gelderland", "Nijmegen": "Gelderland", "Apeldoorn": "Gelderland",
        "Ede": "Gelderland", "Doetinchem": "Gelderland", "Harderwijk": "Gelderland",
        "Barneveld": "Gelderland", "Tiel": "Gelderland", "Zutphen": "Gelderland",
        "Winterswijk": "Gelderland", "Zevenaar": "Gelderland", "Wageningen": "Gelderland",
        "Velp": "Gelderland", "Oosterbeek": "Gelderland", "Elst": "Gelderland",
        "Duiven": "Gelderland", "Westervoort": "Gelderland", "Dieren": "Gelderland",
        "Lent": "Gelderland", "Nunspeet": "Gelderland", "Epe": "Gelderland",
        "Hattem": "Gelderland", "Lochem": "Gelderland", "Borculo": "Gelderland",
        "Rheden": "Gelderland", "Heerde": "Gelderland", "Bennekom": "Gelderland",
        "Renkum": "Gelderland", "Culemborg": "Gelderland", "Putten": "Gelderland",
        "Ermelo": "Gelderland", "Vaassen": "Gelderland", "Eerbeek": "Gelderland",
        "Voorst": "Gelderland", "Brummen": "Gelderland", "Ruurlo": "Gelderland",
        "Lichtenvoorde": "Gelderland", "Groenlo": "Gelderland", "Neede": "Gelderland",
        "Zelhem": "Gelderland", "Hengelo": "Gelderland", "Ulft": "Gelderland",
        "Silvolde": "Gelderland", "'s-Heerenberg": "Gelderland", "Terborg": "Gelderland",
        "Didam": "Gelderland", "Angerlo": "Gelderland", "Bemmel": "Gelderland",
        "Huissen": "Gelderland", "Ubbergen": "Gelderland", "Beuningen": "Gelderland",
        "Wijchen": "Gelderland", "Druten": "Gelderland", "Geldermalsen": "Gelderland",

        "Zwolle": "Overijssel", "Enschede": "Overijssel", "Deventer": "Overijssel",
        "Almelo": "Overijssel", "Kampen": "Overijssel", "Hengelo": "Overijssel",
        "Oldenzaal": "Overijssel", "Hardenberg": "Overijssel", "Raalte": "Overijssel",
        "Rijssen": "Overijssel", "Nijverdal": "Overijssel", "Borne": "Overijssel",
        "Vriezenveen": "Overijssel", "Dalfsen": "Overijssel", "Steenwijk": "Overijssel",
        "IJsselmuiden": "Overijssel", "Hasselt": "Overijssel", "Zwartsluis": "Overijssel",
        "Wierden": "Overijssel", "Bathmen": "Overijssel", "Heino": "Overijssel",
        "Olst": "Overijssel", "Tubbergen": "Overijssel", "Ootmarsum": "Overijssel",
        "Losser": "Overijssel", "Denekamp": "Overijssel",

        "Maastricht": "Limburg", "Venlo": "Limburg", "Heerlen": "Limburg",
        "Sittard": "Limburg", "Roermond": "Limburg", "Weert": "Limburg",
        "Kerkrade": "Limburg", "Geleen": "Limburg", "Brunssum": "Limburg",
        "Landgraaf": "Limburg", "Tegelen": "Limburg", "Venray": "Limburg",
        "Meerssen": "Limburg", "Valkenburg": "Limburg", "Horst": "Limburg",
        "Panningen": "Limburg", "Swalmen": "Limburg", "Neer": "Limburg",
        "Born": "Limburg", "Stein": "Limburg", "Beek": "Limburg",
        "Schinnen": "Limburg", "Hoensbroek": "Limburg", "Klimmen": "Limburg",
        "Eygelshoven": "Limburg", "Simpelveld": "Limburg", "Nuth": "Limburg",
        "Schaesberg": "Limburg", "Bocholtz": "Limburg", "Vaals": "Limburg",
        "Eijsden": "Limburg", "Gulpen": "Limburg", "Margraten": "Limburg",
        "Cadier en Keer": "Limburg", "Elsloo": "Limburg",
        "Ospel": "Limburg", "Nederweert": "Limburg", "Maasbracht": "Limburg",
        "Echt": "Limburg", "Susteren": "Limburg",

        "Leeuwarden": "Friesland", "Heerenveen": "Friesland", "Sneek": "Friesland",
        "Drachten": "Friesland", "Dokkum": "Friesland", "Harlingen": "Friesland",
        "Franeker": "Friesland", "Joure": "Friesland", "Bolsward": "Friesland",
        "Workum": "Friesland", "Burgum": "Friesland", "Akkrum": "Friesland",
        "Stiens": "Friesland", "Grou": "Friesland", "Wolvega": "Friesland",
        "Lemmer": "Friesland", "Balk": "Friesland", "Sint Nicolaasga": "Friesland",
        "De Knipe": "Friesland", "Oranjewoud": "Friesland", "Gorredijk": "Friesland",
        "Surhuisterveen": "Friesland", "Kollum": "Friesland",

        "Groningen": "Groningen", "Veendam": "Groningen", "Stadskanaal": "Groningen",
        "Winschoten": "Groningen", "Hoogezand": "Groningen", "Delfzijl": "Groningen",
        "Appingedam": "Groningen", "Leek": "Groningen", "Roden": "Groningen",
        "Zuidhorn": "Groningen",

        "Emmen": "Drenthe", "Assen": "Drenthe", "Hoogeveen": "Drenthe",
        "Meppel": "Drenthe", "Coevorden": "Drenthe", "Beilen": "Drenthe",
        "Borger": "Drenthe", "Zuidlaren": "Drenthe", "Gieten": "Drenthe",

        "Almere": "Flevoland", "Lelystad": "Flevoland",

        "Middelburg": "Zeeland", "Goes": "Zeeland", "Terneuzen": "Zeeland",
        "Vlissingen": "Zeeland", "Zierikzee": "Zeeland", "Hulst": "Zeeland",
        "Kapelle": "Zeeland", "Heinkenszand": "Zeeland", "Krabbendijke": "Zeeland",
        "Kruiningen": "Zeeland", "Yerseke": "Zeeland", "Axel": "Zeeland",
        "Sas van Gent": "Zeeland", "Sluis": "Zeeland", "Breskens": "Zeeland",
    }
    
    # Find postal code + city pattern: "1234 AB CityName"
    # Dutch addresses: "Street Address, 1234 AB City, Netherlands"
    postal_city_match = re.search(r'(\d{4}\s*[A-Z]{2})\s+(.+?)(?:,|$)', address)
    
    city = ""
    postal_code = ""
    province = ""
    
    if postal_city_match:
        postal_code = postal_city_match.group(1)
        city = postal_city_match.group(2).strip()
        # Remove "Netherlands" or "Nederland" from city
        city = re.sub(r'\s*(Netherlands|Nederland)$', '', city, flags=re.IGNORECASE).strip()
        province = provinces_map.get(city, "")
    
    return city, postal_code, province


def esc(s):
    if s is None or s == "":
        return "NULL"
    return "'" + str(s).replace("'", "''").replace("\\", "\\\\") + "'"


# Load raw data
raw_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "places_raw.json")
with open(raw_file, "r", encoding="utf-8") as f:
    raw = json.load(f)

print(f"Total raw: {len(raw)}")

# Generate SQL in batches of 25 for MCP
batch_size = 25
sql_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_mcp")
os.makedirs(sql_dir, exist_ok=True)

batch_idx = 0
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
        sql = "INSERT INTO practices (google_place_id, name, address, city, province, postal_code, latitude, longitude, phone, website, rating, reviews_count, google_maps_url, business_status) VALUES\n" + ",\n".join(values) + "\nON CONFLICT (google_place_id) DO UPDATE SET city = EXCLUDED.city, province = EXCLUDED.province, postal_code = EXCLUDED.postal_code WHERE practices.city IS NULL OR practices.city = '' OR practices.province IS NULL OR practices.province = '';"
        
        out_file = os.path.join(sql_dir, f"batch_{batch_idx:04d}.sql")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(sql)
        batch_idx += 1

# Also test parsing
test_addrs = [
    "Nieuwe Keizersgracht 45, 1018 VC Amsterdam",
    "Pieterstraat 18, 1811 LW Alkmaar",
    "Diependaalselaan 337A, 1215 KG Hilversum",
    "Parklaan 4, 1241 BG Kortenhoef",
    "Bijlestaal 66, 1721 PW Broek op Langedijk",
]
print("\nTest parsing:")
for a in test_addrs:
    city, pc, prov = parse_address(a)
    print(f"  {a}")
    print(f"    -> city={city}, postal={pc}, province={prov}")

print(f"\nGenerated {batch_idx} batch files in {sql_dir}")
