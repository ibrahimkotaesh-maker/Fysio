import json
import os
from collections import defaultdict

def parse_serp(filepath, keyword):
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    
    task = data['tasks'][0]
    if task['status_code'] != 20000 or not task.get('result'):
        print(f"ERROR for {keyword}")
        return []
    
    result = task['result'][0]
    items = result.get('items', [])
    
    print(f"\n{'='*100}")
    print(f"KEYWORD: {keyword} | Total results: {result.get('items_count', 0)}")
    print(f"{'='*100}")
    
    results = []
    rank = 0
    for item in items:
        item_type = item.get('type', '')
        if item_type == 'organic':
            rank += 1
            domain = item.get('domain', '')
            url = item.get('url', '')
            title = item.get('title', '')
            etv = item.get('estimated_paid_traffic_cost', 0) or 0
            backlinks = item.get('backlinks_info', {})
            rank_info = item.get('rank_info', {})
            
            bl_count = backlinks.get('backlinks', 0) or 0
            ref_domains = backlinks.get('referring_domains', 0) or 0
            domain_rank = rank_info.get('main_domain_rank', 0) or 0
            page_rank = rank_info.get('page_rank', 0) or 0
            
            page = (rank - 1) // 10 + 1
            
            print(f"  #{rank:>2} (P{page}) | DR:{domain_rank:>4} | PR:{page_rank:>4} | BL:{bl_count:>6} | RD:{ref_domains:>5} | {domain:<40} | {title[:60]}")
            
            results.append({
                'rank': rank,
                'page': page,
                'domain': domain,
                'url': url,
                'title': title,
                'domain_rank': domain_rank,
                'page_rank': page_rank,
                'backlinks': bl_count,
                'referring_domains': ref_domains
            })
    
    return results

# Parse all SERP files
all_serps = {}
files = [
    ('f:/Fysio/serp_fysiotherapeut.json', 'fysiotherapeut'),
    ('f:/Fysio/serp_fysiotherapie.json', 'fysiotherapie'),
    ('f:/Fysio/serp_amsterdam.json', 'fysiotherapeut amsterdam'),
    ('f:/Fysio/serp_bekken.json', 'bekkenfysiotherapie'),
]

domain_appearances = defaultdict(list)

for filepath, keyword in files:
    if os.path.exists(filepath):
        results = parse_serp(filepath, keyword)
        all_serps[keyword] = results
        for r in results:
            domain_appearances[r['domain']].append({
                'keyword': keyword,
                'rank': r['rank'],
                'page': r['page'],
                'domain_rank': r['domain_rank']
            })

# Print domain frequency analysis
print(f"\n\n{'='*100}")
print("COMPETITOR DOMAIN FREQUENCY ANALYSIS")
print(f"{'='*100}")

# Sort by number of keyword appearances
sorted_domains = sorted(domain_appearances.items(), key=lambda x: len(x[1]), reverse=True)
for domain, appearances in sorted_domains[:30]:
    avg_rank = sum(a['rank'] for a in appearances) / len(appearances)
    dr = max(a['domain_rank'] for a in appearances)
    keywords = ', '.join(f"{a['keyword']}(#{a['rank']})" for a in appearances)
    print(f"  {domain:<45} | Apps:{len(appearances)} | AvgRank:{avg_rank:>5.1f} | DR:{dr:>4} | {keywords}")

# Save combined data
with open('f:/Fysio/serp_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(all_serps, f, ensure_ascii=False, indent=2)
