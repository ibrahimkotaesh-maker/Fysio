"""Merge SQL batches into medium groups for MCP execution."""
import os

sql_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_mcp")
files = sorted(os.listdir(sql_dir))
out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_groups")
os.makedirs(out_dir, exist_ok=True)

# Each batch file is ~10KB. Groups of 5 = ~50KB each
group_size = 5
group_idx = 0
for i in range(0, len(files), group_size):
    parts = []
    for f in files[i:i+group_size]:
        with open(os.path.join(sql_dir, f), "r", encoding="utf-8") as fh:
            parts.append(fh.read().strip())
    combined = "\n".join(parts)
    out = os.path.join(out_dir, f"group_{group_idx:03d}.sql")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(combined)
    group_idx += 1

print(f"Created {group_idx} groups in {out_dir}")
# Check sizes
sizes = []
for f in sorted(os.listdir(out_dir)):
    fp = os.path.join(out_dir, f)
    sizes.append(os.path.getsize(fp))
print(f"Min size: {min(sizes)} bytes, Max size: {max(sizes)} bytes, Avg: {sum(sizes)//len(sizes)} bytes")
