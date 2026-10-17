#!/usr/bin/env node
/**
 * 生成 ai-api/ 路由目录：主路由 README.md + 每个组件/基础设施页一个子文件。
 *
 * 数据源：docs/src/api-meta/（文档站组件页与本目录的共同单一源）
 * 用法：npm run gen:ai-api
 *
 * 注意：请勿手工编辑生成的 ai-api/ 目录；API 变更时修改 api-meta/*.ts 后重新运行本脚本。
 */
import { build } from 'esbuild'
import { writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const entry = resolve(root, 'docs/src/api-meta/index.ts')
const outDir = resolve(root, 'ai-api')

// api-meta 内部是无扩展名相对 import，Node 无法直接加载；用 esbuild 打包到内存后再 import
const result = await build({
  entryPoints: [entry],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'silent'
})
const code = result.outputFiles[0].text
const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
const { componentNav } = mod

/** 表格单元格转义：联合类型里的裸 | 必须转义，空值统一显示 — */
function cell(value) {
  if (value === undefined || value === null || value === '') return '—'
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')
}

function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`
  const rule = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map((r) => `| ${r.map(cell).join(' | ')} |`)
  return [head, rule, ...body].join('\n')
}

function renderDataType(dt) {
  const lines = [`#### ${dt.name}`, '']
  if (dt.ref) lines.push(`引用：${dt.ref}`, '')
  if (dt.desc?.length) {
    for (const p of dt.desc) lines.push(p, '')
  }
  if (dt.fields?.length) {
    lines.push(
      table(
        ['字段', '类型', '必填', '默认值', '说明'],
        dt.fields.map((f) => [f.name, f.type, f.required, f.default, f.desc])
      ),
      ''
    )
  }
  if (dt.code) {
    lines.push('```ts', dt.code, '```', '')
  }
  if (dt.after?.length) {
    for (const p of dt.after) lines.push(p, '')
  }
  return lines.join('\n')
}

function headingText(c) {
  const isWd = c.name?.startsWith('Wd')
  // title 本身已含组件名（如「WdRequester 请求触发组件」）时不重复拼接
  return isWd && !c.title.includes(c.name) ? `${c.name} ${c.title}` : c.title
}

function renderPassthrough(c) {
  const p = c.passthrough
  if (!p) return []
  const lines = ['### Element Plus 透传', '']
  lines.push(`- 透传目标：\`${p.target}\``)
  if (p.intercept?.length) {
    const names = p.intercept.map((n) => `\`${n}\``).join('、')
    lines.push(
      `- 截获事件：${names}——组件 \`defineEmits\` 已声明同名事件，监听器不进入 \`$attrs\`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。`
    )
  }
  if (p.note) lines.push(`- 说明：${p.note}`)
  lines.push('')
  return lines
}

/** 子文件名：Wd 组件用 wd-{path}.md；基础设施页（Config/HTTP/皮肤）用 {path}.md */
function subFileName(c) {
  return c.name?.startsWith('Wd') ? `wd-${c.path}.md` : `${c.path}.md`
}

/** 单个组件/基础设施页正文（标题用一级 #，其余小节 ###；不含头部导航行） */
function renderComponentBody(c) {
  const lines = [`# ${headingText(c)}`, '', c.desc, '']

  if (c.intro?.overview) lines.push('### 概述', '', c.intro.overview, '')
  if (c.intro?.whenToUse?.length) {
    lines.push('### 何时使用', '', ...c.intro.whenToUse.map((s) => `- ${s}`), '')
  }
  if (c.intro?.notes?.length) {
    lines.push('### 注意事项', '', ...c.intro.notes.map((s) => `- ${s}`), '')
  }
  if (c.intro?.faq?.length) {
    lines.push('### 常见问题', '')
    for (const { q, a } of c.intro.faq) lines.push(`**问：${q}**`, '', a, '')
  }
  lines.push(...renderPassthrough(c))
  if (c.props?.length) {
    lines.push(
      '### Props',
      '',
      table(
        ['属性', '类型', '默认值', '说明'],
        c.props.map((p) => [p.name, `\`${p.type}\``, p.default, p.desc])
      ),
      ''
    )
  }
  if (c.emits?.length) {
    lines.push(
      '### Events',
      '',
      table(
        ['事件名', '回调参数', '说明'],
        c.emits.map((e) => [e.name, e.payload, e.desc])
      ),
      ''
    )
  }
  if (c.slots?.length) {
    lines.push(
      '### Slots',
      '',
      table(
        ['插槽', '容器 id', '插槽参数', '说明'],
        c.slots.map((s) => [s.name, s.id || '—', s.params, s.desc])
      ),
      ''
    )
  }
  if (c.methods?.length) {
    const methodTitle = c.name?.startsWith('Wd')
      ? '### 暴露方法（通过 ref 调用）'
      : '### API（import 调用）'
    lines.push(
      methodTitle,
      '',
      table(
        ['方法', '参数', '返回值', '说明'],
        c.methods.map((m) => [m.name, m.params, m.returns, m.desc])
      ),
      ''
    )
  }
  if (c.dataTypes?.length) {
    lines.push('### 数据类型', '', ...c.dataTypes.map(renderDataType))
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()
}

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const generatedAt =
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
  `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

const allItems = componentNav.flatMap((g) => g.items)
const componentCount = allItems.filter((c) => c.name?.startsWith('Wd')).length
const infraCount = allItems.length - componentCount

/** 主路由 README：头部声明 + 阅读约定 + 透传规则 + 组件索引（按导航分组，链接到子文件） */
function renderReadme() {
  const indexBlocks = componentNav
    .map((g) => {
      const links = g.items.map((c) => `- [${headingText(c)}](./${subFileName(c)})`).join('\n')
      // 核心基础设施组：在 use-request 后插入手写详细指引链接
      const extra = g.label === '核心基础设施'
        ? '\n- [HTTP 请求详细指引（流程 / 配置全景 / 示例 / 排错）](./use-request-guide.md)'
        : ''
      return `### ${g.label}\n\n${links}${extra}`
    })
    .join('\n\n')

  return `# WorkDesktop AI 组件 API 参考（路由）

> **本目录由脚本自动生成，请勿手工编辑。**
>
> - 数据源：\`docs/src/api-meta/\`（文档站组件页与本目录的共同单一源）
> - 生成命令：\`npm run gen:ai-api\`
> - 生成时间：${generatedAt}（Asia/Shanghai）
> - 组件源码：\`src/components/**/*.vue\`；类型声明：\`dist/types/\`
>
> 覆盖 ${componentCount} 个组件（Wd 前缀）的 Props / Events / Slots / 暴露方法与自定义数据类型，
> 以及 ${infraCount} 个基础设施 API（全局配置、HTTP 请求核心、皮肤主题）。
> 组件的组合用法与交互约定见 [ai-router.md](../ai-router.md) 与 \`scenarios/\*\*.md\`。

## 使用流程（AI 必读）

1. 先按场景判定命中组件（见 [ai-router.md](../ai-router.md) 的场景判定速查表与 \`scenarios/\*\*.md\`）。
2. 在下方「组件索引」定位目标组件，**只打开它对应的子文件**（如 [WdSelect 选择器](./wd-select.md)），不要通读本目录全部子文件。**文件名规律（知道组件名即可直接构造路径，不必先翻索引）**：Wd 组件为 \`wd-{组件名kebab}.md\`（WdSelect → \`wd-select.md\`、WdImageUpload → \`wd-image-upload.md\`）；3 个基础设施页为 \`use-config.md\` / \`use-request.md\` / \`custom-skin.md\`。**需要 HTTP 请求的完整执行流程、配置全景、代码示例或排错表时，直接读手写版 [use-request-guide.md](./use-request-guide.md)**，它是自动生成的 use-request.md 的详细补充。
3. 子文件内的 Props / Events / Slots / 暴露方法 / 数据类型 / Element Plus 透传，即该组件的全部 API 事实；需要 Element Plus 原生属性/事件的权威定义时，结合子文件「Element Plus 透传」小节与官方文档。

## 阅读约定

- 类型列统一放在反引号中；联合类型写作 \`'a' \\| 'b'\`。
- 默认值 \`—\` 表示无默认值（必传项或行为型开关）。
- Props 说明中标注「继承自 el-xxx / 透传」的属性是 Element Plus 原生属性，经 \`$attrs\` 透传生效，源码 \`defineProps\` 中不显式声明，使用时同样可直接传入。
- 事件参数、插槽参数、方法签名均按元数据原样列出；复杂结构见各组件「数据类型」章节。

## Element Plus 属性与事件透传规则

所有 Wd 组件均基于 Element Plus 二次封装。能否直接使用 Element Plus 原生属性/事件，遵循以下三条规则；每个组件的具体结论见其子文件内「Element Plus 透传」小节。

1. **未声明的属性与事件默认透传**：组件 \`defineProps\` / \`defineEmits\` 未声明的属性（含 \`onXxx\` 事件监听器、class、style 等）进入 \`$attrs\`，由模板内部的目标 el 组件 \`v-bind="$attrs"\` 接收，可直接按 Element Plus 官方文档使用。各组件 Props 表中显式列出的同名属性以本组件语义为准。
2. **同名事件会被截获重发**：组件 \`defineEmits\` 声明过的事件名（如 \`change\`、\`click\`、\`success\`、\`close\`）**不进入** \`$attrs\`。即使模板内部监听了 el 组件的同名事件，也是组件先处理再重新 emit，回调参数（载荷）以本文档 Events 表为准，不保证等同于 Element Plus 原生载荷。各组件的截获清单见其子文件「Element Plus 透传」小节。
3. **厚封装/复合组件不透传**：标注「—（不透传）」的组件，根节点为自研元素或内部 el 组件未绑定 \`$attrs\`，Element Plus 原生属性/事件不可用，只能使用本文档列出的 props/emits 与配置项（如 columns、items、rowActions）。

Element Plus 原生 API 的权威定义以官方文档为准（[https://element-plus.org/zh-CN/component/](https://element-plus.org/zh-CN/component/)），本目录不复制其全量属性表，只声明本组件的差异、截获与边界。

## 组件索引

${indexBlocks}
`
}

// 手写文件白名单：这些文件不由脚本生成，重建目录时保留
const HANDWRITTEN_KEEP = ['use-request-guide.md']

// 只清理本脚本生成的文件，保留手写白名单
mkdirSync(outDir, { recursive: true })
const existing = readdirSync(outDir)
for (const f of existing) {
  if (!HANDWRITTEN_KEEP.includes(f)) {
    rmSync(resolve(outDir, f), { recursive: true, force: true })
  }
}

// 子文件头部导航行：标明自动生成 + 回主路由
const subHeader = (c) =>
  `> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 \`docs/src/api-meta/\`，重生成：\`npm run gen:ai-api\`。\n\n`

writeFileSync(resolve(outDir, 'README.md'), renderReadme(), 'utf-8')
for (const c of allItems) {
  writeFileSync(
    resolve(outDir, subFileName(c)),
    subHeader(c) + renderComponentBody(c) + '\n',
    'utf-8'
  )
}

console.log(`[gen-ai-api] 已生成 ${outDir}/（README.md + ${allItems.length} 个子文件）`)
console.log(`[gen-ai-api] ${componentCount} 个组件 + ${infraCount} 个基础设施页，共 ${allItems.length} 章`)
if (HANDWRITTEN_KEEP.length) {
  console.log(`[gen-ai-api] 保留手写文件：${HANDWRITTEN_KEEP.join('、')}`)
}
