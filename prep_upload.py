"""Save SQL group content to a text file for easy copy."""
import os

sql_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_groups")
out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_out")
os.makedirs(out_dir, exist_ok=True)

for i in range(35):
    filepath = os.path.join(sql_dir, f"group_{i:03d}.sql")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    out = os.path.join(out_dir, f"g{i:02d}.sql")
    with open(out, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Group {i}: {len(content)} bytes")

print(f"\nReady for upload: {out_dir}")
