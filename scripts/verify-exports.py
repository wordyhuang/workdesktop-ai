# 验证 package.json exports 指向的产物文件都存在
import json
from pathlib import Path

root = Path(__file__).parent.parent
pkg = json.loads((root / "package.json").read_text(encoding="utf-8"))

errors = []

def check(rel: str, label: str):
    p = root / rel
    if not p.exists():
        errors.append(f"MISSING [{label}]: {rel}")

# 顶层字段
check(pkg["main"], "main")
check(pkg["module"], "module")
check(pkg["types"], "types")

# exports
count = 0
for key, val in pkg["exports"].items():
    if isinstance(val, str):
        check(val.lstrip("./"), f"exports {key}")
        count += 1
    else:
        for cond, path in val.items():
            check(path.lstrip("./"), f"exports {key} [{cond}]")
            count += 1

print(f"checked {count + 3} paths")
if errors:
    print("\n".join(errors))
    raise SystemExit(1)
print("OK: all export targets exist")
