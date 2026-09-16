<template>
  <div class="code-block">
    <!-- 窗口栏：三色点 + 文件名 + 行信息 + 复制 -->
    <div class="code-block__chrome">
      <span class="code-block__dots" aria-hidden="true">
        <i class="is-close" />
        <i class="is-min" />
        <i class="is-max" />
      </span>
      <span class="code-block__file">
        <el-icon class="code-block__file-icon"><Document /></el-icon>
        {{ resolvedFile }}
      </span>
      <span class="code-block__meta">{{ lineCount }} 行</span>
      <button
        type="button"
        class="code-block__copy"
        :class="{ 'is-copied': copied }"
        @click="copy"
      >
        <el-icon><CircleCheckFilled v-if="copied" /><DocumentCopy v-else /></el-icon>
        <span>{{ copied ? '已复制' : '复制代码' }}</span>
      </button>
    </div>

    <!-- 代码区：行号 + 高亮代码，横向滚动时行号列吸附 -->
    <div class="code-block__scroll">
      <div v-for="(line, i) in lines" :key="i" class="code-row">
        <span class="code-row__no">{{ i + 1 }}</span>
        <span class="code-row__code" v-html="line || '&#8203;'"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DocumentCopy, CircleCheckFilled, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = withDefaults(
  defineProps<{
    code: string
    lang?: string
    /** 窗口栏文件名，缺省按语言给一个拟真文件名 */
    file?: string
  }>(),
  { lang: 'vue', file: '' }
)

const copied = ref(false)

const FILE_BY_LANG: Record<string, string> = {
  vue: 'example.vue',
  ts: 'example.ts',
  css: 'theme.css',
  bash: '终端',
  html: 'example.html'
}
const resolvedFile = computed(() => props.file || FILE_BY_LANG[props.lang] || 'example.txt')
const lineCount = computed(() => props.code.replace(/\n$/, '').split('\n').length)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = props.code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  ElMessage.success('代码已复制到剪贴板')
  setTimeout(() => (copied.value = false), 1600)
}

/* —————————————— 轻量语法高亮（零依赖，仅处理库内静态示例串） —————————————— */

type TokenType =
  | 'plain'
  | 'comment'
  | 'string'
  | 'tag'
  | 'attr'
  | 'keyword'
  | 'number'
  | 'punct'
interface Token {
  type: TokenType
  text: string
}

const KEYWORDS = new Set([
  'import', 'from', 'const', 'let', 'var', 'function', 'return', 'if', 'else',
  'for', 'of', 'in', 'new', 'await', 'async', 'true', 'false', 'null',
  'undefined', 'ref', 'reactive', 'computed', 'export', 'default', 'type',
  'interface', 'class', 'extends', 'this', 'typeof', 'void', 'as'
])

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** 整串扫描为 token；块注释跨多行由状态维护，拆行时每段各自闭合 */
function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  let block: 'none' | 'js' | 'html' = 'none'
  let inTag = false

  const push = (type: TokenType, text: string) => {
    if (text) tokens.push({ type, text })
  }
  const startsWith = (s: string) => src.startsWith(s, i)
  const matchAt = (re: RegExp) => {
    const sticky = new RegExp(re.source, re.flags.replace('g', '') + 'y')
    sticky.lastIndex = i
    const m = sticky.exec(src)
    return m ? m[0] : ''
  }

  while (i < src.length) {
    // 块注释续接
    if (block === 'js') {
      const end = src.indexOf('*/', i)
      if (end === -1) {
        push('comment', src.slice(i))
        i = src.length
      } else {
        push('comment', src.slice(i, end + 2))
        i = end + 2
      }
      block = 'none'
      continue
    }
    if (block === 'html') {
      const end = src.indexOf('-->', i)
      if (end === -1) {
        push('comment', src.slice(i))
        i = src.length
      } else {
        push('comment', src.slice(i, end + 3))
        i = end + 3
      }
      block = 'none'
      continue
    }

    // 换行 / 空白原样
    const ws = matchAt(/[ \t\r\n]+/)
    if (ws) {
      push('plain', ws)
      i += ws.length
      continue
    }

    // 注释开块
    if (startsWith('/*')) {
      block = 'js'
      continue
    }
    if (startsWith('<!--')) {
      block = 'html'
      continue
    }

    // 行注释（吃到行尾；示例 // 后不出现 http 链接）
    if (startsWith('//')) {
      const nl = src.indexOf('\n', i)
      const text = nl === -1 ? src.slice(i) : src.slice(i, nl)
      push('comment', text)
      i += text.length
      continue
    }

    // 字符串（同行闭合；未闭合则吃到行尾）
    const str = matchAt(/['"`](?:\\.|(?!['"`]).)*['"`]|['"`][^\n]*/)
    if (str) {
      push('string', str)
      i += str.length
      continue
    }

    // 标签名（进入标签上下文）
    const tagName = matchAt(/<\/?[a-zA-Z][\w-]*/)
    if (tagName) {
      push('tag', tagName)
      i += tagName.length
      inTag = true
      continue
    }
    // 标签结束（退出标签上下文）
    if (inTag && matchAt(/\/?>/)) {
      push('punct', src[i] === '/' ? '/>' : '>')
      i += src[i] === '/' ? 2 : 1
      inTag = false
      continue
    }

    // 属性 / 绑定名（后接 =）
    if (inTag) {
      const attr = matchAt(/[^\s=>/]+(?=\s*=)/)
      if (attr) {
        push('attr', attr)
        i += attr.length
        continue
      }
    }

    // 关键字
    const kw = matchAt(/[a-zA-Z_$][\w$]*/)
    if (kw) {
      push(KEYWORDS.has(kw) ? 'keyword' : 'plain', kw)
      i += kw.length
      continue
    }

    // 数字（含 hex 色值）
    const num = matchAt(/#[0-9a-fA-F]{3,8}\b|\d[\d.]*/)
    if (num) {
      push('number', num)
      i += num.length
      continue
    }

    // 标点
    const punct = matchAt(/[{}()[\];,.:?=<>/+\-*/%&|!]+/)
    if (punct) {
      push('punct', punct)
      i += punct.length
      continue
    }

    push('plain', src[i])
    i += 1
  }
  return tokens
}

/** token 渲染为带 class 的 HTML（先转义再包裹） */
function renderToken(t: Token): string {
  const text = escapeHtml(t.text)
  if (t.type === 'plain') return text
  return `<span class="tok-${t.type}">${text}</span>`
}

/** 按行切分：跨行 token 拆段，保证每行标签自闭合 */
const lines = computed<string[]>(() => {
  const out: string[] = []
  let line = ''
  for (const token of tokenize(props.code)) {
    const parts = token.text.split('\n')
    parts.forEach((part, idx) => {
      if (idx > 0) {
        out.push(line)
        line = ''
      }
      if (part) line += renderToken({ type: token.type, text: part })
    })
  }
  out.push(line)
  // 去掉末尾因结尾换行产生的空行
  if (out.length && out[out.length - 1] === '') out.pop()
  return out
})
</script>

<style scoped>
.code-block {
  --code-bg: #10151f;
  --code-chrome: #171d2b;
  --code-line: #1d2433;
  border-radius: 10px;
  background: var(--code-bg);
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(13, 18, 30, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  font-family: 'JetBrains Mono', 'Cascadia Code', Consolas, 'Courier New', monospace;
}

/* —— 窗口栏 —— */
.code-block__chrome {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 12px 0 14px;
  background: var(--code-chrome);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.code-block__dots {
  display: flex;
  gap: 7px;
  flex: none;
}
.code-block__dots i {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  display: block;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
}
.code-block__dots .is-close {
  background: #ff5f57;
}
.code-block__dots .is-min {
  background: #febc2e;
}
.code-block__dots .is-max {
  background: #28c840;
}
.code-block__file {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: #aab6cc;
  font-size: 12px;
  letter-spacing: 0.2px;
}
.code-block__file-icon {
  font-size: 13px;
  color: #7f8ca6;
}
.code-block__meta {
  margin-left: auto;
  font-size: 11.5px;
  color: #5d6a85;
  letter-spacing: 0.3px;
}
.code-block__copy {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: none;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: #aab6cc;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.code-block__copy:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #e6ecf7;
}
.code-block__copy.is-copied {
  color: #28c840;
  border-color: rgba(40, 200, 64, 0.35);
  background: rgba(40, 200, 64, 0.1);
}

/* —— 代码区 —— */
.code-block__scroll {
  max-height: 520px;
  overflow: auto;
  padding: 12px 0;
}
.code-row {
  display: flex;
  align-items: flex-start;
  line-height: 1.75;
}
.code-row:hover {
  background: rgba(255, 255, 255, 0.025);
}
.code-row__no {
  position: sticky;
  left: 0;
  flex: none;
  width: 48px;
  padding-right: 14px;
  text-align: right;
  user-select: none;
  color: #424c64;
  background: var(--code-bg);
  border-right: 1px solid var(--code-line);
  margin-right: 16px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.code-row__code {
  white-space: pre;
  padding-right: 24px;
  font-size: 12.5px;
  color: #c7d2e3;
}

/* —— 语法配色 —— */
.code-row__code :deep(.tok-comment) {
  color: #5f6e8a;
  font-style: italic;
}
.code-row__code :deep(.tok-string) {
  color: #9ece6a;
}
.code-row__code :deep(.tok-tag) {
  color: #82aaff;
}
.code-row__code :deep(.tok-attr) {
  color: #7dcfff;
}
.code-row__code :deep(.tok-keyword) {
  color: #bb9af7;
}
.code-row__code :deep(.tok-number) {
  color: #ff9e64;
}
.code-row__code :deep(.tok-punct) {
  color: #7c8aa6;
}

/* 细滚动条（深色） */
.code-block__scroll::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}
.code-block__scroll::-webkit-scrollbar-thumb {
  background: #2a3347;
  border-radius: 6px;
  border: 2px solid var(--code-bg);
}
.code-block__scroll::-webkit-scrollbar-thumb:hover {
  background: #39445c;
}
.code-block__scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
