import json

with open('f:/Fysio/backlinks_summary.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

for task in data['tasks']:
    if task['status_code'] != 20000 or not task.get('result'):
        print("Task error:", task.get('status_message'))
        continue
    for item in task['result']:
        target = item.get('target', '')
        rank = item.get('rank', 0)
        bl = item.get('backlinks', 0)
        rd = item.get('referring_domains', 0)
        ips = item.get('referring_ips', 0)
        print(target.ljust(40), "Rank:", str(rank).rjust(6), "BL:", str(bl).rjust(8), "RD:", str(rd).rjust(6), "IPs:", str(ips).rjust(6))
