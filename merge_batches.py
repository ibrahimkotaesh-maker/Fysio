"""Merge small batches into medium ones and upload via Supabase API."""
import os, json, time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

sql_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_mcp")
files = sorted(os.listdir(sql_dir))

# Merge into groups of 3 (3 x 25 = 75 records per group, ~30KB)
group_size = 3
groups = []
for i in range(0, len(files), group_size):
    group = []
    for f in files[i:i+group_size]:
        with open(os.path.join(sql_dir, f), "r", encoding="utf-8") as fh:
            group.append(fh.read())
    groups.append("\n".join(group))

print(f"Total groups: {len(groups)}, avg size: {sum(len(g) for g in groups)//len(groups)} bytes")

# Save as individual files
out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_upload")
os.makedirs(out_dir, exist_ok=True)
for i, sql in enumerate(groups):
    with open(os.path.join(out_dir, f"group_{i:03d}.sql"), "w", encoding="utf-8") as f:
        f.write(sql)

print(f"Saved {len(groups)} files to {out_dir}")
print(f"Largest group: {max(len(g) for g in groups)} bytes")
