<template>
  <section
    class="demo-block"
    :class="{ 'is-code-open': showCode, 'is-row': layout === 'row' }"
  >
    <header class="demo-block__head">
      <span class="demo-block__bar" aria-hidden="true" />
      <div class="demo-block__heading">
        <h3 class="demo-block__title">{{ title }}</h3>
        <p v-if="desc" class="demo-block__desc">{{ desc }}</p>
      </div>
    </header>

    <div class="demo-block__preview" :class="`is-${layout}`">
      <slot />
    </div>

    <div v-if="code" class="demo-block__footer">
      <button
        type="button"
        class="demo-block__toggle"
        :class="{ 'is-open': showCode }"
        @click="showCode = !showCode"
      >
        <el-icon class="demo-block__toggle-icon"><View v-if="!showCode" /><Hide v-else /></el-icon>
        <span>{{ showCode ? '收起代码' : '查看代码' }}</span>
        <el-icon class="demo-block__chevron"><ArrowDown /></el-icon>
      </button>
    </div>

    <div v-if="code" class="demo-block__code-wrap" :class="{ 'is-open': showCode }">
      <div class="demo-block__code-inner has-tabs">
        <div v-if="segments.length" class="demo-block__code-tabs">
          <button
            v-for="seg in segments"
            :key="seg.key"
            type="button"
            class="demo-block__code-tab"
            :class="{ 'is-active': activeSegment && seg.key === activeSegment.key }"
            @click="activeKey = seg.key"
          >
            {{ seg.label }}
          </button>
        </div>
        <CodeBlock
          v-if="activeSegment"
          :key="activeSegment.key"
          :code="activeSegment.code"
          :lang="activeSegment.lang"
          :file="activeSegment.file"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { View, Hide, ArrowDown } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    title: string
    desc?: string
    code?: string
    /** 预览区布局：default 纵向 / row 横向排列 */
    layout?: 'default' | 'row'
  }>(),
  { layout: 'default' }
)

const showCode = ref(false)

/* —— 示例代码按 HTML / JavaScript / CSS 分类展示（有什么显什么） —— */

type CodeSegKey = 'html' | 'js' | 'css'
interface CodeSegment {
  key: CodeSegKey
  label: string
  lang: string
  file: string
  code: string
}

const SEG_META: Record<CodeSegKey, { label: string; lang: string; file: string }> = {
  html: { label: 'HTML', lang: 'html', file: 'example.html' },
  js: { label: 'JavaScript', lang: 'js', file: 'example.js' },
  css: { label: 'CSS', lang: 'css', file: 'example.css' }
}
const SEG_ORDER: CodeSegKey[] = ['html', 'js', 'css']

/** 去掉 SFC 块内容的基础缩进，剥掉外层标签后统一顶格展示 */
function dedent(text: string): string {
  const lines = text.split('\n')
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length)
  const min = indents.length ? Math.min(...indents) : 0
  return min ? lines.map((l) => (l.trim() ? l.slice(min) : '')).join('\n') : text
}

/** 从 rest 中提取首个配对块（script/style 在 SFC 中唯一，无嵌套，非贪婪即可） */
function extractBlock(rest: string, re: RegExp): [string, string | null] {
  const m = rest.match(re)
  if (!m) return [rest, null]
  return [rest.replace(m[0], ''), dedent(m[1].replace(/^\n+|\n+$/g, ''))]
}

/** 拆 SFC 顶层块（template/script/style）为三类；纯片段按首字符嗅探：`<` 开头归 HTML，其余归 JavaScript。
 *  template 只在剩余内容以顶层 `<template>` 包裹开头时才剥离（贪婪取最外层），
 *  片段内的 #default/#card 等插槽模板保持原位，避免被误拆、打乱代码顺序 */
function splitCode(raw: string): CodeSegment[] {
  const blocks: Partial<Record<CodeSegKey, string>> = {}
  let rest = raw
  let part: string | null
  ;[rest, part] = extractBlock(rest, /<script[^>]*>([\s\S]*?)<\/script>/i)
  if (part !== null) blocks.js = part
  ;[rest, part] = extractBlock(rest, /<style[^>]*>([\s\S]*?)<\/style>/i)
  if (part !== null) blocks.css = part
  if (rest.trimStart().startsWith('<template')) {
    const m = rest.match(/<template[^>]*>([\s\S]*)<\/template>/i)
    if (m) {
      blocks.html = dedent(m[1].replace(/^\n+|\n+$/g, ''))
      rest = rest.replace(m[0], '')
    }
  }

  rest = rest.replace(/^\n+|\n+$/g, '')
  if (rest) {
    const key: CodeSegKey = rest.trimStart().startsWith('<') ? 'html' : 'js'
    blocks[key] = blocks[key] ? `${blocks[key]}\n\n${rest}` : rest
  }

  return SEG_ORDER.filter((k) => blocks[k]?.trim()).map((k) => ({
    key: k,
    ...SEG_META[k],
    code: blocks[k]!
  }))
}

const segments = computed<CodeSegment[]>(() => (props.code ? splitCode(props.code) : []))
const activeKey = ref<CodeSegKey>('html')
const activeSegment = computed(
  () => segments.value.find((s) => s.key === activeKey.value) || segments.value[0]
)
</script>

<style scoped>
.demo-block {
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: 10px;
  margin-bottom: 14px;
  background: var(--wd-bg-color, #fff);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(16, 21, 31, 0.03);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}
.demo-block:hover {
  box-shadow: 0 6px 20px rgba(16, 21, 31, 0.07);
  border-color: var(--wd-border-color, #dcdfe6);
}

/* 行内稀疏示例（按钮等）：卡片与填充类示例一致，保持全宽；
   内部预览舞台 fit-content 紧贴控件左对齐，右侧只是安静的卡片白底。
   仅作用于文档展示层。 */
.demo-block.is-row {
  box-sizing: border-box;
  width: 100%;
}

/* —— 头部 —— */
.demo-block__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 16px 0;
}
.demo-block__bar {
  flex: none;
  width: 4px;
  height: 16px;
  margin-top: 3px;
  border-radius: 3px;
  background: linear-gradient(
    180deg,
    var(--wd-color-primary, #409eff),
    var(--el-color-primary-light-3, #79bbff)
  );
}
.demo-block__heading {
  min-width: 0;
}
.demo-block__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--wd-text-color-primary, #303133);
  letter-spacing: 0.2px;
}
.demo-block__desc {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--wd-text-color-secondary, #909399);
}

/* —— 预览舞台：极淡点阵底纹，区分“演示”与“文档” —— */
.demo-block__preview {
  position: relative;
  margin: 12px 16px 0;
  padding: 18px;
  border: 1px dashed var(--wd-border-color-light, #e4e7ed);
  border-radius: 8px;
  background-color: var(--wd-bg-color, #fff);
  transition: border-color 0.25s ease;
}
.demo-block:hover .demo-block__preview {
  border-color: var(--el-color-primary-light-5, #a0cfff);
}
.demo-block__preview.is-row {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  align-items: center;
  /* 行内控件（按钮等稀疏示例）舞台收缩包裹内容，避免全宽预览盒右侧大片空场；
     表格/表单等填充类示例走默认块级布局，仍保持全宽 */
  width: fit-content;
  max-width: 100%;
}

/* —— 底部“查看代码”触发栏 —— */
.demo-block__footer {
  display: flex;
  justify-content: center;
  padding: 10px 16px 12px;
}
.demo-block__toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: 999px;
  background: var(--wd-bg-color, #fff);
  color: var(--wd-text-color-regular, #606266);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.18s ease, border-color 0.18s ease, background-color 0.18s ease,
    box-shadow 0.18s ease;
}
.demo-block__toggle:hover {
  color: var(--wd-color-primary, #409eff);
  border-color: var(--el-color-primary-light-5, #a0cfff);
  background: var(--el-color-primary-light-9, #ecf5ff);
}
.demo-block__toggle.is-open {
  color: var(--wd-color-primary, #409eff);
  border-color: var(--el-color-primary-light-5, #a0cfff);
  background: var(--el-color-primary-light-9, #ecf5ff);
}
.demo-block__toggle-icon {
  font-size: 14px;
}
.demo-block__chevron {
  font-size: 12px;
  transition: transform 0.25s ease;
}
.demo-block__toggle.is-open .demo-block__chevron {
  transform: rotate(180deg);
}

/* —— 代码展开容器：grid 0fr→1fr 高度过渡 —— */
.demo-block__code-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}
.demo-block__code-wrap.is-open {
  grid-template-rows: 1fr;
}
.demo-block__code-inner {
  overflow: hidden;
  min-height: 0;
}

/* —— 代码分类标签：tab 切换展示各分类（有几个显几个），与深色代码窗一体化 —— */
.demo-block__code-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px 4px;
  background: #10151f;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.demo-block__code-tab {
  border: none;
  background: transparent;
  color: rgba(230, 237, 243, 0.55);
  font-size: 12.5px;
  font-family: inherit;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.18s ease, background-color 0.18s ease;
}
.demo-block__code-tab:hover {
  color: #e6edf3;
}
.demo-block__code-tab.is-active {
  color: #fff;
  background: rgba(88, 166, 255, 0.22);
}
/* 有分类标签时，标签条已承担顶部分隔线，代码窗不再重复描边 */
.demo-block__code-inner.has-tabs :deep(.code-block) {
  border-top: none;
}
.demo-block__code-inner :deep(.code-block) {
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  animation: code-rise 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes code-rise {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 展开后卡片底边与代码窗口一体化：去掉外层圆角收口感 */
.demo-block.is-code-open {
  border-color: #171d2b;
  box-shadow: 0 12px 30px rgba(13, 18, 30, 0.16);
}
.demo-block.is-code-open .demo-block__footer {
  padding-bottom: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .demo-block__code-wrap,
  .demo-block__code-inner :deep(.code-block) {
    animation: none;
    transition: none;
  }
}
</style>
