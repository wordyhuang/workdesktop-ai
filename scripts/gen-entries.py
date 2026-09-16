"""生成所有单组件入口文件"""
import re
import os
from pathlib import Path

base = Path(__file__).parent / ".." / "src"  # src/
base = base.resolve()
components_map = base / "entries" / "components-map.ts"
entries_dir = base / "entries"

content = components_map.read_text(encoding="utf-8")

# 提取 key-value
pattern = r"'([\w-]+)':\s*'([^']+)'"
matches = re.findall(pattern, content)

for name, rel_path in matches:
    # kebab -> PascalCase (加 Wd 前缀)
    parts = name.split("-")
    pascal = "Wd" + "".join(p.capitalize() for p in parts)

    # 从 src/entries/xxx.ts 到 src/styles/ 的相对路径
    styles_path = f"../styles/index.css"
    # 从 src/entries/xxx.ts 到 src/components/xxx 的相对路径
    comp_path = f"../components/{rel_path}"

    tpl = f"""/**
 * {pascal} 单独入口
 * 用法：import {pascal} from 'workdesktop-ai/{name}'
 *       import 'workdesktop-ai/{name}/style.css'
 */
import '../styles/index.css'
import {pascal} from '{comp_path}'
export {{ {pascal} }}
export default {pascal}
"""

    entry_file = entries_dir / f"{name}.ts"
    entry_file.write_text(tpl, encoding="utf-8")
    print(f"  created: src/entries/{name}.ts")

print(f"\n共生成 {len(matches)} 个组件入口文件")
