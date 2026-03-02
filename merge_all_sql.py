"""Merge all SQL batch files into one large file."""
import os

sql_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_mcp")
files = sorted(os.listdir(sql_dir))
all_sql = []
for f in files:
    with open(os.path.join(sql_dir, f), "r", encoding="utf-8") as fh:
        content = fh.read().strip()
        if content:
            all_sql.append(content)

combined = "BEGIN;\n" + "\n".join(all_sql) + "\nCOMMIT;"
out_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "all_practices.sql")
with open(out_file, "w", encoding="utf-8") as f:
    f.write(combined)

print(f"Combined: {len(combined)} bytes from {len(all_sql)} statements")
print(f"Saved to: {out_file}")
