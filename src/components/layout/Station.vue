<template>
  <div class="wd-station" :class="{ 'is-collapsed': collapsedState }">
    <!-- 左侧菜单栏（menuMode=side）：logo 与菜单同列，菜单紧贴 logo -->
    <aside v-if="menuMode === 'side'" class="wd-station__aside" :class="{ 'is-collapsed': collapsedState }">
      <div class="wd-station__logo" :class="{ 'is-collapsed': collapsedState }">
        <slot name="logo" :collapsed="collapsedState">
          <el-icon v-if="resolveIcon(logo)" class="wd-station__logo-icon">
            <component :is="resolveIcon(logo)" />
          </el-icon>
          <span v-show="!collapsedState" class="wd-station__logo-title">{{ title }}</span>
        </slot>
      </div>
      <slot name="menu-top" :collapsed="collapsedState" />
      <el-scrollbar class="wd-station__menu-scroll">
        <el-menu class="wd-station__menu" :collapse="collapsedState" :default-active="currentKey">
          <template v-if="headerMode === 'title'">
            <template v-if="groups.length > 1">
              <el-menu-item-group v-for="g in groups" :key="g.key" :title="g.title">
                <station-menu-node :items="g.menus" @select="onMenuSelect" />
              </el-menu-item-group>
            </template>
            <!-- 单分组无分组语义，直接平铺菜单项（不渲染组标题） -->
            <station-menu-node v-else :items="groups[0]?.menus || []" @select="onMenuSelect" />
          </template>
          <station-menu-node v-else :items="currentGroupMenus" @select="onMenuSelect" />
        </el-menu>
      </el-scrollbar>
      <slot name="menu-bottom" :collapsed="collapsedState" />
    </aside>

    <div class="wd-station__main">
      <header class="wd-station__header">
        <div class="wd-station__header-left">
          <!-- 折叠按钮：分导台左侧。side 用左右折叠图标，top 用向上折叠图标 -->
          <el-icon
            v-if="collapsible && menuMode !== 'none'"
            class="wd-station__collapse"
            @click="toggleCollapsed"
          >
            <Fold v-if="menuMode === 'side' && !collapsedState" />
            <Expand v-else-if="menuMode === 'side'" />
            <ArrowUp v-else-if="!collapsedState" />
            <ArrowDown v-else />
          </el-icon>
          <!-- top / none 模式 logo 进 header -->
          <div v-if="menuMode !== 'side'" class="wd-station__logo wd-station__logo--header">
            <slot name="logo" :collapsed="collapsedState">
              <el-icon v-if="resolveIcon(logo)" class="wd-station__logo-icon">
                <component :is="resolveIcon(logo)" />
              </el-icon>
              <span class="wd-station__logo-title">{{ title }}</span>
            </slot>
          </div>
          <template v-for="tool in toolbarLeft" :key="tool">
            <el-icon
              v-if="tool === 'refresh'"
              data-tool="refresh"
              class="wd-station__tool"
              @click="refresh"
            ><Refresh /></el-icon>
            <el-icon
              v-else-if="tool === 'settings'"
              data-tool="settings"
              class="wd-station__tool"
              @click="onSettings"
            ><Setting /></el-icon>
            <el-dropdown v-else-if="tool === 'user'" data-tool="user" class="wd-station__tool" trigger="click">
              <span class="wd-station__user">
                <el-avatar :size="24" :src="userAvatar || undefined">{{ userInitial }}</el-avatar>
                <span class="wd-station__user-name">{{ userName }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="onLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button v-else-if="tool === 'login'" data-tool="login" size="small" @click="onLogin">登录</el-button>
          </template>
          <slot name="header-left" />
        </div>
        <div class="wd-station__header-center">
          <!-- 分导台：流式块状分组切换条，仅多分组且 headerMode=nav 时显示 -->
          <nav v-if="showNav" class="wd-station__nav">
            <span
              v-for="g in groups"
              :key="g.key"
              class="wd-station__nav-item"
              :class="{ 'is-active': g.key === activeGroupKey }"
              @click="setActiveGroup(g.key)"
            >
              <el-icon v-if="resolveIcon(g.icon)"><component :is="resolveIcon(g.icon)" /></el-icon>
              {{ g.title }}
            </span>
          </nav>
          <span v-else class="wd-station__header-title">{{ title }}</span>
          <slot name="header-center" />
        </div>
        <div class="wd-station__header-right">
          <slot name="header-right" />
          <template v-for="tool in toolbarRight" :key="tool">
            <el-icon
              v-if="tool === 'refresh'"
              data-tool="refresh"
              class="wd-station__tool"
              @click="refresh"
            ><Refresh /></el-icon>
            <el-icon
              v-else-if="tool === 'settings'"
              data-tool="settings"
              class="wd-station__tool"
              @click="onSettings"
            ><Setting /></el-icon>
            <el-dropdown v-else-if="tool === 'user'" data-tool="user" class="wd-station__tool" trigger="click">
              <span class="wd-station__user">
                <el-avatar :size="24" :src="userAvatar || undefined">{{ userInitial }}</el-avatar>
                <span class="wd-station__user-name">{{ userName }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="onLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button v-else-if="tool === 'login'" data-tool="login" size="small" @click="onLogin">登录</el-button>
          </template>
        </div>
      </header>

      <!-- 顶部菜单（menuMode=top），向上折叠时隐藏 -->
      <div v-if="menuMode === 'top'" v-show="!collapsedState" class="wd-station__top-menu">
        <slot name="top-menu-left" />
        <el-menu mode="horizontal" :default-active="currentKey">
          <station-menu-node :items="currentGroupMenus" @select="onMenuSelect" />
        </el-menu>
        <slot name="top-menu-right" />
      </div>

      <!-- tabs 导航（contentMode=tabs）：整宽撑满，右侧下拉批量关闭；自绘 label 插槽，affix 无关闭图标 -->
      <div v-if="contentMode === 'tabs'" class="wd-station__tabs-bar">
        <slot name="tabs-left" />
        <el-tabs
          :model-value="currentKey"
          type="card"
          class="wd-station__tabs"
        >
          <el-tab-pane v-for="tab in tabs" :key="tab.key" :name="tab.key">
            <template #label>
              <span class="wd-station__tab-label" @click="onTabClick(tab)">{{ tab.title }}</span>
              <el-icon v-if="!tab.affix" class="wd-station__tab-close" @click.stop="closeTab(tab.key)">
                <Close />
              </el-icon>
            </template>
          </el-tab-pane>
        </el-tabs>
        <el-dropdown class="wd-station__tabs-actions" trigger="click">
          <span class="wd-station__tabs-more">
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :disabled="!canCloseCurrent" @click="closeCurrentTab">关闭当前标签</el-dropdown-item>
              <el-dropdown-item :disabled="!canCloseLeft" @click="closeLeftTabs">关闭左侧标签</el-dropdown-item>
              <el-dropdown-item :disabled="!canCloseOthers" @click="closeOtherTabs">关闭其他标签</el-dropdown-item>
              <el-dropdown-item :disabled="!canCloseAll" @click="closeAllTabs">关闭所有标签</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <slot name="tabs-right" />
      </div>

      <!-- 内容区：router 模式渲染 RouterView，html 模式渲染默认插槽；contentKey 强制重挂载 -->
      <main class="wd-station__content">
        <div :key="contentKey" class="wd-station__content-inner">
          <template v-if="isRouterMode && RouterViewComp">
            <keep-alive v-if="keepAlive"><component :is="RouterViewComp" /></keep-alive>
            <component :is="RouterViewComp" v-else />
          </template>
          <slot v-else />
        </div>
      </main>

      <!-- 底部信息栏：动态信息 + 版权（footer 插槽可整体替换） -->
      <footer class="wd-station__footer">
        <slot name="footer">
          <span v-if="displayFooterInfo" class="wd-station__footer-info">{{ displayFooterInfo }}</span>
          <span v-if="copyright" class="wd-station__footer-copyright">{{ copyright }}</span>
        </slot>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onUnmounted, ref, watch, type PropType } from 'vue'
import * as ElIcons from '@element-plus/icons-vue'
import { Fold, Expand, ArrowUp, ArrowDown, Refresh, Setting, Close } from '@element-plus/icons-vue'
import { filterProp } from '../common/props'
import { registerStation } from '../../lib/core/station-linkage'
import StationMenuNode from './StationMenuNode.vue'
import type { StationMenuGroup, StationTab, StationToolbarConfig } from './types'

defineOptions({ name: 'WdStation' })

const props = defineProps({
  ...filterProp,
  /** 系统标题（logo 区 / headerMode=title 时的头部标题） */
  title: { type: String, default: '' },
  /** logo 图标（@element-plus/icons-vue 名称字符串，或直接传组件） */
  logo: { type: [String, Object] as PropType<string | object>, default: '' },
  /** 分组菜单结构（优先），支持 JSON 字符串 */
  menuGroups: { type: [Array, String] as PropType<any[] | string>, default: undefined },
  /** 扁平菜单结构（带 group/groupKey 字段按出现顺序归组），支持 JSON 字符串 */
  menus: { type: [Array, String] as PropType<any[] | string>, default: undefined },
  /** 头部中央模式：nav=分导台 / title=标题（此时侧边渲染全量菜单并带组标题） */
  headerMode: { type: String as PropType<'nav' | 'title'>, default: 'nav' },
  /** 菜单位置：side=左侧 / top=顶部 / none=不启用 */
  menuMode: { type: String as PropType<'side' | 'top' | 'none'>, default: 'side' },
  /** 内容方式：page=单页 / tabs=多标签 */
  contentMode: { type: String as PropType<'page' | 'tabs'>, default: 'page' },
  /** 路由适配：auto=自动检测 $router / router / html */
  routerMode: { type: String as PropType<'auto' | 'router' | 'html'>, default: 'auto' },
  /** 是否显示折叠按钮 */
  collapsible: { type: Boolean, default: true },
  /** 折叠状态（v-model:collapsed） */
  collapsed: { type: Boolean, default: false },
  /** 当前分组 key（v-model:active-group） */
  activeGroup: { type: String, default: '' },
  /** 当前菜单 key（v-model:active-menu） */
  activeMenu: { type: String, default: '' },
  /** 已开启标签（v-model:open-tabs，受控） */
  openTabs: { type: Array as PropType<StationTab[]>, default: undefined },
  /** 用户名（有值显示用户下拉，无值显示登录按钮） */
  userName: { type: String, default: '' },
  /** 用户头像地址 */
  userAvatar: { type: String, default: '' },
  /** 版权信息 */
  copyright: { type: String, default: '' },
  /** 底部动态信息（v-model:footer-info） */
  footerInfo: { type: String, default: '' },
  /** router 模式内容区 keep-alive */
  keepAlive: { type: Boolean, default: false },
  /** 工具栏点位配置：refresh/settings/user/login 各自 left/right/none，支持 JSON 字符串 */
  toolbarConfig: { type: [Object, String] as PropType<StationToolbarConfig | string>, default: undefined }
})

const emit = defineEmits([
  'update:collapsed',
  'update:active-group',
  'update:active-menu',
  'update:open-tabs',
  'update:footer-info',
  'group-change',
  'menu-select',
  'tab-click',
  'tab-close',
  'refresh',
  'login',
  'logout',
  'settings'
])

const instance = getCurrentInstance()

/* ---------- 软依赖检测：vue-router / RouterView ---------- */
const router =
  (instance?.proxy as any)?.$router || instance?.appContext?.config?.globalProperties?.$router
const route =
  (instance?.proxy as any)?.$route || instance?.appContext?.config?.globalProperties?.$route
const RouterViewComp = instance?.appContext?.components?.['RouterView']

const isRouterMode = computed(() => {
  if (props.routerMode === 'html') return false
  if (props.routerMode === 'router') return true
  return !!router
})

/* ---------- JSON 字符串入参兼容（UMD 属性式写法） ---------- */
function parseMaybeJson(val: any, fallback: any): any {
  if (val === undefined || val === null || val === '') return fallback
  if (typeof val !== 'string') return val
  try {
    return JSON.parse(val)
  } catch (e) {
    console.error('[WorkDesktop] WdStation JSON 解析失败，已回退默认值:', e)
    return fallback
  }
}

/* ---------- 菜单归一化：统一为 分组 Group → 菜单树 ---------- */
function assignKeys(menus: any[], groupKey: string): any[] {
  return menus.map((m) => ({
    ...m,
    _key: m._key || `${groupKey}:${m.name || m.path || m.title}`,
    children: m.children && m.children.length ? assignKeys(m.children, groupKey) : undefined
  }))
}

function flatToGroups(flat: any[]): StationMenuGroup[] {
  const order: string[] = []
  const map = new Map<string, StationMenuGroup>()
  flat.forEach((m) => {
    const key = m.groupKey || m.group || 'default'
    if (!map.has(key)) {
      map.set(key, {
        key,
        title: m.group || (key === 'default' ? '默认' : key),
        icon: m.groupIcon,
        menus: []
      })
      order.push(key)
    }
    map.get(key)!.menus.push(m)
  })
  return order.map((k) => map.get(k)!)
}

let depthWarned = false
function checkMenuDepth(list: StationMenuGroup[]): void {
  if (depthWarned) return
  const walk = (menus: any[], depth: number): void => {
    menus.forEach((m) => {
      if (depth > 2 && !depthWarned) {
        depthWarned = true
        console.warn('[WorkDesktop] WdStation: 菜单层级建议不超过两层，当前已超出（仍按原样渲染）')
      }
      if (m.children && m.children.length) walk(m.children, depth + 1)
    })
  }
  list.forEach((g) => walk(g.menus, 1))
}

const groups = computed<StationMenuGroup[]>(() => {
  const mg = parseMaybeJson(props.menuGroups, null)
  let list: StationMenuGroup[]
  if (Array.isArray(mg) && mg.length) {
    list = mg.map((g: any) => ({ key: g.key, title: g.title, icon: g.icon, menus: g.menus || [] }))
  } else {
    const flat = parseMaybeJson(props.menus, [])
    list = flatToGroups(Array.isArray(flat) ? flat : [])
  }
  // 统一分配 _key 并检查层级
  list = list.map((g) => ({ ...g, menus: assignKeys(g.menus, g.key) }))
  checkMenuDepth(list)
  return list
})

/* ---------- 分组（分导台） ---------- */
const innerActiveGroup = ref('')
const activeGroupKey = computed(
  () => props.activeGroup || innerActiveGroup.value || groups.value[0]?.key || ''
)
const showNav = computed(() => props.headerMode === 'nav' && groups.value.length > 1)
const currentGroup = computed(
  () => groups.value.find((g) => g.key === activeGroupKey.value) || groups.value[0]
)
const currentGroupMenus = computed(() => currentGroup.value?.menus || [])

function setActiveGroup(key: string) {
  innerActiveGroup.value = key
  emit('update:active-group', key)
  const g = groups.value.find((item) => item.key === key)
  if (g) emit('group-change', { key: g.key, title: g.title })
}

/* ---------- 当前菜单 / 标签激活 ---------- */
const innerActiveMenu = ref('')
watch(
  () => props.activeMenu,
  (v) => {
    if (v) innerActiveMenu.value = v
  }
)
const currentKey = computed(() => props.activeMenu || innerActiveMenu.value)

function setActiveMenu(key: string) {
  innerActiveMenu.value = key
  emit('update:active-menu', key)
}

/* ---------- 菜单点击 ---------- */
function onMenuSelect(item: any) {
  setActiveMenu(item._key)
  emit('menu-select', item)
  if (props.contentMode === 'tabs') openTab(item)
  if (isRouterMode.value && item.path) router.push(item.path)
}

/* ---------- 路由反查：按当前路径定位分组与菜单 ---------- */
function walkMenus(menus: any[], fn: (m: any) => void): void {
  menus.forEach((m) => {
    fn(m)
    if (m.children && m.children.length) walkMenus(m.children, fn)
  })
}

function findMenuByPath(path: string): { group: StationMenuGroup; item: any } | null {
  for (const g of groups.value) {
    let found: any = null
    walkMenus(g.menus, (m) => {
      if (!found && m.path === path) found = m
    })
    if (found) return { group: g, item: found }
  }
  return null
}

watch(
  () => route?.path,
  (path) => {
    if (!path || !isRouterMode.value) return
    const found = findMenuByPath(path)
    if (found) {
      innerActiveGroup.value = found.group.key
      setActiveMenu(found.item._key)
    }
  },
  { immediate: true }
)

/* ---------- tabs ---------- */
const innerTabs = ref<StationTab[]>([])
const isTabsControlled = computed(() => props.openTabs !== undefined)
const tabs = computed<StationTab[]>(() =>
  isTabsControlled.value ? (props.openTabs as StationTab[]) : innerTabs.value
)

function commitTabs(newTabs: StationTab[]) {
  if (!isTabsControlled.value) innerTabs.value = newTabs
  emit('update:open-tabs', newTabs)
}

function openTab(tab: any) {
  const key = tab._key || tab.key
  if (!key) return
  if (!tabs.value.find((t) => t.key === key)) {
    commitTabs([...tabs.value, { key, title: tab.title, path: tab.path, affix: tab.affix }])
  }
  setActiveMenu(key)
}

function closeTab(key: string) {
  const list = tabs.value
  const idx = list.findIndex((t) => t.key === key)
  if (idx < 0) return
  const tab = list[idx]
  if (tab.affix) return
  const newTabs = list.filter((t) => t.key !== key)
  commitTabs(newTabs)
  emit('tab-close', { ...tab })
  // 关闭激活标签 → 跳到相邻（先右后左）
  if (currentKey.value === key) {
    const next = newTabs[idx] || newTabs[idx - 1]
    if (next) setActiveMenu(next.key)
  }
}

function onTabClick(tab: StationTab) {
  setActiveMenu(tab.key)
  emit('tab-click', { ...tab })
  if (isRouterMode.value && tab.path) router.push(tab.path)
}

/* ---------- tabs 批量关闭（右侧下拉） ---------- */
function closeTabsBy(shouldClose: (t: StationTab, i: number) => boolean) {
  const list = tabs.value
  const removed = list.filter((t, i) => shouldClose(t, i) && !t.affix)
  if (!removed.length) return
  const removedKeys = new Set(removed.map((t) => t.key))
  const kept = list.filter((t) => !removedKeys.has(t.key))
  commitTabs(kept)
  removed.forEach((t) => emit('tab-close', { ...t }))
  // 激活标签被关掉 → 跳到原位置附近（先右后左）
  if (!kept.find((t) => t.key === currentKey.value)) {
    const idx = list.findIndex((t) => t.key === currentKey.value)
    const next = kept[Math.min(idx, kept.length - 1)]
    if (next) setActiveMenu(next.key)
  }
}

function closeCurrentTab() {
  closeTab(currentKey.value)
}
function closeLeftTabs() {
  const idx = tabs.value.findIndex((t) => t.key === currentKey.value)
  if (idx < 0) return
  closeTabsBy((_, i) => i < idx)
}
function closeOtherTabs() {
  closeTabsBy((t) => t.key !== currentKey.value)
}
function closeAllTabs() {
  closeTabsBy(() => true)
}

const canCloseCurrent = computed(() => {
  const cur = tabs.value.find((t) => t.key === currentKey.value)
  return !!cur && !cur.affix
})
const canCloseLeft = computed(() => {
  const idx = tabs.value.findIndex((t) => t.key === currentKey.value)
  return idx > 0 && tabs.value.slice(0, idx).some((t) => !t.affix)
})
const canCloseOthers = computed(() =>
  tabs.value.some((t) => !t.affix && t.key !== currentKey.value)
)
const canCloseAll = computed(() => tabs.value.some((t) => !t.affix))

/* ---------- 工具栏点位 ---------- */
const toolbarCfg = computed<Required<StationToolbarConfig>>(() => {
  const raw = parseMaybeJson(props.toolbarConfig, {}) || {}
  return {
    refresh: raw.refresh || 'right',
    settings: raw.settings || 'right',
    user: raw.user || 'right',
    login: raw.login || 'right'
  }
})
const accountTool = computed(() => (props.userName ? 'user' : 'login'))
const toolbarLeft = computed(() => {
  const list: string[] = []
  const cfg = toolbarCfg.value
  if (cfg.refresh === 'left') list.push('refresh')
  if (cfg.settings === 'left') list.push('settings')
  if (cfg[accountTool.value as keyof StationToolbarConfig] === 'left') list.push(accountTool.value)
  return list
})
const toolbarRight = computed(() => {
  const list: string[] = []
  const cfg = toolbarCfg.value
  if (cfg.refresh === 'right') list.push('refresh')
  if (cfg.settings === 'right') list.push('settings')
  if (cfg[accountTool.value as keyof StationToolbarConfig] === 'right') list.push(accountTool.value)
  return list
})

const userInitial = computed(() => (props.userName ? props.userName.charAt(0) : ''))

function onSettings() {
  emit('settings')
}
function onLogin() {
  emit('login')
}
function onLogout() {
  emit('logout')
}

/* ---------- 折叠 ---------- */
// 与 activeGroup 同一模式：props 优先，未受控时走内部状态
const innerCollapsed = ref(false)
const collapsedState = computed(() => props.collapsed || innerCollapsed.value)
function toggleCollapsed() {
  innerCollapsed.value = !collapsedState.value
  emit('update:collapsed', collapsedState.value)
}

/* ---------- 内容刷新（强制重挂载） ---------- */
const contentKey = ref(0)
function refresh() {
  contentKey.value += 1
  emit('refresh')
}

/* ---------- 底部动态信息 + 联动注册 ---------- */
const innerFooterInfo = ref('')
function setFooterInfo(info: string) {
  innerFooterInfo.value = info
  emit('update:footer-info', info)
}
const displayFooterInfo = computed(() => innerFooterInfo.value || props.footerInfo)

let unregister: (() => void) | null = null
onMounted(() => {
  unregister = registerStation({ filter: props.filter, setFooterInfo, refresh })
  // tabs 模式：affix 菜单挂载时自动开启
  if (props.contentMode === 'tabs') {
    groups.value.forEach((g) =>
      walkMenus(g.menus, (m) => {
        if (m.affix) openTab(m)
      })
    )
  }
})
onUnmounted(() => {
  unregister?.()
})

/* ---------- 图标归一 ---------- */
function resolveIcon(icon: any) {
  if (!icon) return null
  if (typeof icon === 'string') return (ElIcons as any)[icon] || null
  return icon
}

defineExpose({ refresh, openTab, closeTab })
</script>

<style scoped>
.wd-station {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--wd-bg-color-page);
  color: var(--wd-text-color-primary);
}

/* 左侧菜单栏：logo 与菜单同列同宽，菜单紧贴 logo */
.wd-station__aside {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--wd-bg-color);
  border-right: 1px solid var(--wd-border-color-light);
  transition: width 0.2s;
}
.wd-station__aside.is-collapsed {
  width: 64px;
}
.wd-station__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 16px;
  overflow: hidden;
  flex-shrink: 0;
  border-bottom: 1px solid var(--wd-border-color-light);
}
.wd-station__logo.is-collapsed {
  padding: 0;
  justify-content: center;
}
.wd-station__logo--header {
  height: auto;
  padding: 0;
  border-bottom: none;
}
.wd-station__logo-title {
  font-size: var(--wd-font-size-large);
  font-weight: 600;
  white-space: nowrap;
}
.wd-station__menu-scroll {
  flex: 1;
  min-height: 0;
}
.wd-station__menu {
  border-right: none;
}

/* 右侧主区 */
.wd-station__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.wd-station__header {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 var(--wd-spacing-large);
  background: var(--wd-bg-color);
  border-bottom: 1px solid var(--wd-border-color-light);
  flex-shrink: 0;
}
.wd-station__header-left {
  display: flex;
  align-items: center;
  gap: var(--wd-spacing-base);
  min-width: 0;
  flex-shrink: 0;
}
/* 中央区占满剩余空间，分导台/标题左对齐排列 */
.wd-station__header-center {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  min-width: 0;
  padding: 0 var(--wd-spacing-base);
}
.wd-station__header-right {
  display: flex;
  align-items: center;
  gap: var(--wd-spacing-base);
  min-width: 0;
  flex-shrink: 0;
  justify-content: flex-end;
}
.wd-station__header-title {
  font-size: var(--wd-font-size-large);
  font-weight: 600;
}
.wd-station__collapse {
  cursor: pointer;
  font-size: 18px;
  color: var(--wd-text-color-regular);
}
.wd-station__collapse:hover {
  color: var(--wd-color-primary);
}

/* 分导台：流式块状分组切换条 */
.wd-station__nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.wd-station__nav-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--wd-radius-base);
  cursor: pointer;
  color: var(--wd-text-color-regular);
  font-size: var(--wd-font-size-base);
  white-space: nowrap;
}
.wd-station__nav-item:hover {
  color: var(--wd-color-primary);
  background: var(--wd-bg-color-page);
}
.wd-station__nav-item.is-active {
  color: var(--wd-color-primary);
  background: var(--wd-bg-color-page);
  font-weight: 600;
}

/* 工具栏 */
.wd-station__tool {
  cursor: pointer;
  font-size: 16px;
  color: var(--wd-text-color-regular);
}
.wd-station__tool:hover {
  color: var(--wd-color-primary);
}
.wd-station__user {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.wd-station__user-name {
  font-size: var(--wd-font-size-base);
  color: var(--wd-text-color-primary);
}

/* 顶部菜单：flex 排版，左右插槽夹住中间菜单（菜单占满剩余宽度） */
.wd-station__top-menu {
  display: flex;
  align-items: center;
  background: var(--wd-bg-color);
  border-bottom: 1px solid var(--wd-border-color-light);
  flex-shrink: 0;
}
.wd-station__top-menu :deep(.el-menu) {
  flex: 1;
  min-width: 0;
}

/* tabs 条：整宽撑满，消左/上边框，右侧下拉批量关闭 */
.wd-station__tabs-bar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 4px;
  background: var(--wd-bg-color);
  border-bottom: 1px solid var(--wd-border-color-light);
}
.wd-station__tabs {
  flex: 1;
  min-width: 0;
}
.wd-station__tabs-bar :deep(.el-tabs--card > .el-tabs__header) {
  margin-bottom: 0;
  border-bottom: none;
}
.wd-station__tabs-bar :deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border: none;
  border-radius: 0;
}
/* 分隔线统一放右侧：每个 tab（含最后一个）默认带右边框，tabs 区右端封闭 */
.wd-station__tabs-bar :deep(.el-tabs--card > .el-tabs__header .el-tabs__nav .el-tabs__item) {
  border-left: none;
  border-right: 1px solid var(--wd-border-color-light);
}
.wd-station__tabs-actions {
  flex-shrink: 0;
  margin: 0 var(--wd-spacing-large);
  cursor: pointer;
}
.wd-station__tabs-more {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  color: var(--wd-text-color-regular);
}
.wd-station__tabs-more:hover {
  color: var(--wd-color-primary);
}
.wd-station__tab-label {
  cursor: pointer;
}
.wd-station__tab-close {
  margin-left: 4px;
  font-size: 12px;
  cursor: pointer;
}

/* 内容区 */
.wd-station__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--wd-spacing-large);
}
.wd-station__content-inner {
  height: 100%;
}

/* 底部信息栏 */
.wd-station__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-spacing-base);
  height: 32px;
  padding: 0 var(--wd-spacing-large);
  background: var(--wd-bg-color);
  border-top: 1px solid var(--wd-border-color-light);
  color: var(--wd-text-color-secondary);
  font-size: var(--wd-font-size-small);
  flex-shrink: 0;
}
.wd-station__footer-info {
  color: var(--wd-text-color-regular);
}
</style>
