import json
import os

def parse_suggestions(filepath, label):
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    
    task = data['tasks'][0]
    if task['status_code'] != 20000 or not task.get('result'):
        print(f"ERROR for {label}: {task.get('status_message')}")
        return []
    
    result = task['result'][0]
    total = result.get('total_count', 0)
    items = result.get('items', [])
    seed_kw_data = result.get('seed_keyword_data', {})
    
    print(f"\n{'='*80}")
    print(f"SEED: {label} | Total related: {total}")
    
    # Print seed keyword data
    if seed_kw_data:
        ski = seed_kw_data.get('keyword_info', {})
        skp = seed_kw_data.get('keyword_properties', {})
        print(f"  Seed SV: {ski.get('search_volume')} | CPC: {ski.get('cpc')} | Competition: {ski.get('competition')} | KD: {skp.get('keyword_difficulty')}")
    
    print(f"{'='*80}")
    print(f"{'Keyword':<50} {'SV':>8} {'CPC':>8} {'Comp':>8} {'KD':>5}")
    print('-'*80)
    
    results = []
    for item in items:
        kw = item.get('keyword', '')
        ki = item.get('keyword_info', {})
        kp = item.get('keyword_properties', {})
        sv = ki.get('search_volume', 0) or 0
        cpc = ki.get('cpc', 0) or 0
        comp = ki.get('competition', 0) or 0
        kd = kp.get('keyword_difficulty', 0) or 0
        
        print(f"{kw:<50} {sv:>8} {cpc:>8.2f} {comp:>8.2f} {kd:>5}")
        results.append({
            'keyword': kw,
            'search_volume': sv,
            'cpc': cpc,
            'competition': comp,
            'keyword_difficulty': kd,
            'monthly_searches': ki.get('monthly_searches', [])
        })
    
    return results

# Parse all files
all_results = {}

files = [
    ('f:/Fysio/kw_suggestions_fysiotherapeut.json', 'fysiotherapeut'),
    ('f:/Fysio/kw_suggestions_fysiotherapie.json', 'fysiotherapie'),
    ('f:/Fysio/kw_suggestions_rugpijn.json', 'rugpijn'),
]

for filepath, label in files:
    if os.path.exists(filepath):
        results = parse_suggestions(filepath, label)
        all_results[label] = results

# Save combined results
with open('f:/Fysio/kw_all_parsed.json', 'w', encoding='utf-8') as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)

print(f"\n\nTotal keywords collected: {sum(len(v) for v in all_results.values())}")
print("Saved to kw_all_parsed.json")
