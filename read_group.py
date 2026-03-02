"""Read a SQL group file and print it for MCP execution."""
import sys, os

group_num = int(sys.argv[1])
sql_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sql_groups")
filepath = os.path.join(sql_dir, f"group_{group_num:03d}.sql")
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()
print(content)
