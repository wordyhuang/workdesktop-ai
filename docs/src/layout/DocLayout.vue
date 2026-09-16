<template>
  <div class="doc-layout">
    <!-- 文档站外壳：用 WdStation 构建（左侧分组可折叠菜单：children → el-sub-menu + 内容区 + 底栏，无分导台） -->
    <wd-station v-model:active-group="activeGroupKey" v-model:active-menu="activeMenuKey" title="WorkDesktop"
      :logo="BrandMark" :menu-groups="menuGroups" menus="group" header-mode="title" menu-mode="side" content-mode="page"
      router-mode="router" :toolbar-config="toolbarConfig" copyright="© 2026 WorkDesktop"
      :footer-info="footerInfo" @settings="skinVisible = true" :collapsible="false">
      <!-- 顶栏吸顶标题：内容页滚到看不到页面标题时，在顶栏标题旁淡入当前页标题；滚过章节标题后按 h2/h3/h4 层级逐级追加 -->
      <template #header-center>
        <span v-if="stickyTitle" class="doc-sticky-title" :class="{ 'is-visible': stickyTitleVisible }">
          <span class="doc-sticky-title__sep">/</span>{{ stickyTitle }}
          <template v-for="(sec, i) in stickySections" :key="i">
            <span class="doc-sticky-title__sep">/</span>
            <span class="doc-sticky-title__section">{{ sec }}</span>
          </template>
        </span>
      </template>
    </wd-station>

    <!-- 全站主题皮肤：挂到 WdStation 顶栏 settings 工具，点击打开抽屉 -->
    <el-drawer v-model="skinVisible" title="全站主题皮肤" size="420px">
      <div class="skin-picker">
        <p class="skin-picker__tip">
          选择皮肤，全站实时换肤（主题色 / 底色 / 描边，Element 组件联动）。
          <el-tag size="small" type="info" effect="plain">刷新恢复默认</el-tag>
        </p>
        <div v-for="s in SITE_SKINS" :key="s.key" class="skin-item" :class="{ 'is-active': s.key === currentSkinKey }"
          role="button" tabindex="0" @click="applySkin(s.key)" @keydown.enter="applySkin(s.key)">
          <div class="skin-swatches">
            <i v-for="c in swatchesOf(s)" :key="c.key" class="skin-swatch" :style="{ background: c.value }"
              :title="c.key" />
          </div>
          <div class="skin-item__main">
            <b>{{ s.label }}</b>
            <span>{{ s.desc }}</span>
          </div>
          <el-icon v-if="s.key === currentSkinKey" class="skin-item__check">
            <CircleCheckFilled />
          </el-icon>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { useGlobalConfig } from '../../../src'
import { componentNav } from '../api-meta'
import { SITE_SKINS, currentSkinKey, swatchesOf, applySkin } from '../skins'
import BrandMark from '../components/BrandMark.vue'

const skinVisible = ref(false)

/** 底栏版本信息：版本号统一从全局配置读取（src/lib/configs/default-config.ts 的 version） */
const footerInfo = `v${useGlobalConfig().version} · Vue3 + ElementPlus`

/** 顶栏工具点位：只保留 settings（皮肤），refresh/user/login 关闭 */
const toolbarConfig = { refresh: 'none', settings: 'right', user: 'none', login: 'none' }

/**
 * 导航映射为 WdStation 分组菜单（分组可折叠形态）：
 * - 单分组承载全部菜单；组内「带 children 的节点」由 WdStation 渲染为 el-sub-menu（可折叠分组），
 *   无 children 的节点为平铺菜单项（el-menu-item）
 * - 概览：首页（平铺）
 * - 组件分组：复用 componentNav，每组一个可折叠节点（path → /components/{path}；
 *   菜单显示名去掉 Wd 前缀，如 WdDataGrid → DataGrid）
 * - 工具指南：Playground / 联动演示 / 场景搭建指引 / 全局样式·主题
 * 菜单项 path 与路由一致，router 模式点击跳转。
 */
interface DocMenuNode {
  title: string
  path?: string
  icon?: string
  children?: DocMenuNode[]
}

const menuGroups: { key: string; title?: string; menus: DocMenuNode[] }[] = [
  {
    key: 'docs',
    menus: [
      { title: '首页', path: '/', icon: 'HomeFilled' },
      ...componentNav.map((g) => ({
        title: g.label,
        children: g.items.map((c) => ({ title: c.name.replace(/^Wd/, ''), path: `/components/${c.path}` }))
      })),
      {
        title: '工具指南',
        icon: 'Collection',
        children: [
          { title: 'Playground', path: '/playground', icon: 'MagicStick' },
          { title: '联动演示', path: '/linkage', icon: 'Connection' },
          { title: '场景搭建指引', path: '/scenario-guide', icon: 'Guide' },
          { title: '全局样式 / 主题', path: '/theme', icon: 'Brush' }
        ]
      }
    ]
  }
]

/**
 * 受控高亮：activeGroup / activeMenu 由当前路由反查驱动。
 * WdStation 内部对 $route 的引用在 setup 顶层固化，冷启动（刷新/地址栏直达）时
 * 其内置 route.path 监听不会再触发，反查会停在默认分组；这里改用 vue-router 官方
 * useRoute()（响应式、随导航更新）在展示层受控同步，可覆盖刷新/直达/前进后退。
 * 菜单 _key 规则同 WdStation assignKeys：${groupKey}:${path}（菜单项无 name，取 path；
 * children 与平铺项共用所属分组 groupKey）。
 */
const route = useRoute()
const activeGroupKey = ref('')
const activeMenuKey = ref('')

function findNav(path: string): { groupKey: string; menuKey: string } | null {
  for (const g of menuGroups) {
    for (const m of g.menus) {
      if (m.path === path) return { groupKey: g.key, menuKey: `${g.key}:${m.path}` }
      if (m.children) {
        for (const c of m.children) {
          if (c.path === path) return { groupKey: g.key, menuKey: `${g.key}:${c.path}` }
        }
      }
    }
  }
  return null
}

watch(
  () => route.path,
  (path) => {
    const hit = findNav(path)
    if (hit) {
      activeGroupKey.value = hit.groupKey
      activeMenuKey.value = hit.menuKey
    }
  },
  { immediate: true }
)

/**
 * 顶栏吸顶标题：观察内容区页面标题（文档页 .doc-page__title / 其他页 .page-header__title），
 * 滚出内容区可视范围时把标题淡入顶栏，滚回可见时隐藏；
 * 同时以内容区 h2 作为章节锚点，滚动经过章节标题后在其后追加当前章节名。路由切换后重新绑定。
 */
const stickyTitle = ref('')
const stickyTitleVisible = ref(false)
/** 当前阅读位置的章节路径（h2/h3/h4 逐级下钻，如 ['Types 数据类型', 'GridColumn']） */
const stickySections = ref<string[]>([])
let stickyObserver: IntersectionObserver | null = null
/** 异步示例挂载后刷新章节锚点的 DOM 观察器 */
let anchorObserver: MutationObserver | null = null
let sectionEls: HTMLElement[] = []
let stickyScrollEl: HTMLElement | null = null

/**
 * 章节标题取显示文本：
 * - 文档页 h2 章节为「01 Props 属性」结构，取正文+中文（排除序号）
 * - Types 章节的 h3 类型头取类型名（不含 ref 引用说明）
 * - 其余（demo 标题 h3、视图裸 h3/h4）取自身文本
 */
function sectionLabel(el: HTMLElement): string {
  const main = el.querySelector('.doc-page__section-text')
  if (main) {
    const sub = el.querySelector('.doc-page__section-en')?.textContent?.trim()
    return `${main.textContent?.trim()}${sub ? ' ' + sub : ''}`
  }
  const typeName = el.querySelector('.doc-page__type-name')
  if (typeName) return typeName.textContent?.trim() || ''
  return el.textContent?.trim() || ''
}

/** 章节路径 = 各层级最后一个顶部越过阅读线（容器顶 + 4px 容差）的标题；遇到更高层级时截断下级 */
function updateStickySection() {
  if (!stickyScrollEl || !sectionEls.length) {
    stickySections.value = []
    return
  }
  const rootTop = stickyScrollEl.getBoundingClientRect().top
  const path: string[] = []
  for (const el of sectionEls) {
    if (el.getBoundingClientRect().top - rootTop > 4) break
    const level = el.tagName === 'H2' ? 0 : el.tagName === 'H3' ? 1 : 2
    path.length = level
    path[level] = sectionLabel(el)
  }
  stickySections.value = path.filter(Boolean)
}

function bindStickyTitle() {
  stickyObserver?.disconnect()
  anchorObserver?.disconnect()
  stickyScrollEl?.removeEventListener('scroll', updateStickySection)
  stickyTitleVisible.value = false
  stickySections.value = []
  const content = document.querySelector<HTMLElement>('.wd-station__content')
  const titleEl = content?.querySelector('.page-header__title, .doc-page__title')
  stickyTitle.value = titleEl?.textContent?.trim() || ''
  if (!content || !titleEl || !stickyTitle.value) return
  stickyObserver = new IntersectionObserver(
    ([entry]) => {
      stickyTitleVisible.value = !entry.isIntersecting
    },
    { root: content, threshold: 0 }
  )
  stickyObserver.observe(titleEl)
  // 章节锚点：内容区 h2/h3/h4 逐级下钻；排除示例预览区内部的 h3/h4（属演示 UI 而非文档章节）
  const collectAnchors = () => {
    sectionEls = Array.from(content.querySelectorAll<HTMLElement>('h2, h3, h4')).filter(
      (el) => !el.closest('.demo-block__preview')
    )
  }
  collectAnchors()
  // 示例区为异步组件，demo 标题晚于首次绑定挂载；监听 DOM 变化刷新锚点（防抖合并渲染抖动）
  let anchorTimer: ReturnType<typeof setTimeout> | undefined
  anchorObserver = new MutationObserver(() => {
    clearTimeout(anchorTimer)
    anchorTimer = setTimeout(() => {
      collectAnchors()
      updateStickySection()
    }, 150)
  })
  anchorObserver.observe(content, { childList: true, subtree: true })
  stickyScrollEl = content
  content.addEventListener('scroll', updateStickySection, { passive: true })
  updateStickySection()
}

watch(() => route.path, () => nextTick(bindStickyTitle), { immediate: true, flush: 'post' })

onUnmounted(() => {
  stickyObserver?.disconnect()
  anchorObserver?.disconnect()
  stickyScrollEl?.removeEventListener('scroll', updateStickySection)
})
</script>

<style>
/* 全局根盒模型：清除 body 默认 8px margin，打通 100% 高度链，避免 window 级滚动条 */
html,
body,
#app {
  margin: 0;
  height: 100%;
}
</style>

<style scoped>
.doc-layout {
  height: 100vh;
  overflow: hidden;
}

/* —— 顶栏吸顶标题：默认透明，滚出页面标题时淡入上浮 —— */
.doc-sticky-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 60%;
  font-size: var(--wd-font-size-base, 14px);
  color: var(--wd-text-color-regular, #606266);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

.doc-sticky-title.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.doc-sticky-title__sep {
  color: var(--wd-border-color, #dcdfe6);
}

.doc-sticky-title__section {
  color: var(--wd-text-color-secondary, #909399);
}

/* —— 皮肤抽屉内容 —— */
.skin-picker__tip {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--wd-text-color-regular, #606266);
  line-height: 1.7;
}

.skin-picker__tip .el-tag {
  margin-left: 6px;
  vertical-align: 1px;
}

.skin-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  background: var(--wd-bg-color, #fff);
}

.skin-item:hover {
  border-color: var(--wd-color-primary, #409eff);
}

.skin-item.is-active {
  border-color: var(--wd-color-primary, #409eff);
  box-shadow: 0 0 0 1px var(--wd-color-primary, #409eff) inset;
}

.skin-item:focus-visible {
  outline: 2px solid var(--wd-color-primary, #409eff);
  outline-offset: 1px;
}

.skin-swatches {
  display: flex;
  flex: none;
}

.skin-swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.skin-swatch+.skin-swatch {
  margin-left: -5px;
}

.skin-item__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skin-item__main b {
  font-size: 14px;
  font-weight: 600;
  color: var(--wd-text-color-primary, #303133);
}

.skin-item__main span {
  font-size: 12px;
  color: var(--wd-text-color-secondary, #909399);
  line-height: 1.5;
}

.skin-item__check {
  color: var(--wd-color-primary, #409eff);
  font-size: 16px;
  flex: none;
}
</style>
