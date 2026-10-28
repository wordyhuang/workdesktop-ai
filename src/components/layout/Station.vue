<template>
  <div class="wd-station" :class="{ 'is-collapsed': collapsedState }">
    <!-- 左侧菜单栏（menuMode=side）：logo 与菜单同列，菜单紧贴 logo -->
    <aside v-if="menuMode === 'side'" class="wd-station__aside" :class="{ 'is-collapsed': collapsedState }">
      <div id="wd-station__logo" class="wd-station__logo" :class="{ 'is-collapsed': collapsedState }">
        <slot name="logo" :collapsed="collapsedState">
          <el-icon v-if="isIconFontClass(logo)" class="wd-station__logo-icon"><i :class="logo" /></el-icon>
          <el-icon v-else-if="resolveStationIcon(logo)" class="wd-station__logo-icon">
            <component :is="resolveStationIcon(logo)" />
          </el-icon>
          <span v-show="!collapsedState" class="wd-station__logo-title">{{ title }}</span>
        </slot>
      </div>
      <div id="wd-station__menu-top" class="wd-station__menu-top">
        <slot name="menu-top" :collapsed="collapsedState" />
      </div>
      <el-scrollbar class="wd-station__menu-scroll">
        <el-menu class="wd-station__menu" :collapse="collapsedState" :default-active="currentKey" :unique-opened="menuAccordion">
          <template v-if="headerMode === 'title'">
            <template v-if="groups.length > 1">
              <el-menu-item-group v-for="g in groups" :key="g.key" :title="g.title">
                <station-menu-node :items="g.menus" @select="onMenuSelect" />
              </el-menu-item-group>
            </template>
            <!-- 单分组无分组语义，直接平铺菜单项（不渲染组标题） -->
            <station-menu-node v-else :items="groups[0]?.menus || []" @select="onMenuSelect" />
          </template>
          <template v-else-if="headerMode === 'both'">
            <!-- both：左侧跟随激活分组，一级菜单作 title 分组，二级平铺全量；二级含三级才折叠；叶子一级直接为菜单项 -->
            <template v-for="one in currentGroupMenus" :key="one._key">
              <el-menu-item-group v-if="one.children && one.children.length" :title="one.title">
                <station-menu-node :items="one.children" @select="onMenuSelect" />
              </el-menu-item-group>
              <el-menu-item v-else :index="one._key" :disabled="one.disabled" @click="onMenuSelect(one)">
                <el-icon v-if="isIconFontClass(one.icon)"><i :class="one.icon" /></el-icon>
                <el-icon v-else-if="resolveStationIcon(one.icon)"><component :is="resolveStationIcon(one.icon)" /></el-icon>
                <span>{{ one.title }}</span>
                <el-badge v-if="one.badge !== undefined && one.badge !== ''" :value="one.badge" class="wd-station__menu-badge" />
              </el-menu-item>
            </template>
          </template>
          <station-menu-node v-else :items="currentGroupMenus" @select="onMenuSelect" />
        </el-menu>
      </el-scrollbar>
      <div id="wd-station__menu-bottom" class="wd-station__menu-bottom">
        <slot name="menu-bottom" :collapsed="collapsedState" />
      </div>
    </aside>

    <div class="wd-station__main">
      <header class="wd-station__header">
        <div id="wd-station__header-left" class="wd-station__header-left">
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
          <div v-if="menuMode !== 'side'" id="wd-station__logo-header" class="wd-station__logo wd-station__logo--header">
            <slot name="logo" :collapsed="collapsedState">
              <el-icon v-if="isIconFontClass(logo)" class="wd-station__logo-icon"><i :class="logo" /></el-icon>
              <el-icon v-else-if="resolveStationIcon(logo)" class="wd-station__logo-icon">
                <component :is="resolveStationIcon(logo)" />
              </el-icon>
              <span class="wd-station__logo-title">{{ title }}</span>
            </slot>
          </div>
          <template v-for="tool in toolbarLeft" :key="tool">
            <el-icon
              v-if="tool === 'refresh'"
              data-tool="refresh"
              title="刷新内容"
              class="wd-station__tool"
              @click="refresh"
            ><Refresh /></el-icon>
            <el-icon
              v-else-if="tool === 'fullscreen'"
              data-tool="fullscreen"
              :title="isFullscreen ? '退出全屏' : '全屏显示'"
              class="wd-station__tool"
              @click="toggleFullscreen"
            ><FullScreen /></el-icon>
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
        <div id="wd-station__header-center" class="wd-station__header-center">
          <!-- 分导台：流式块状分组切换条，仅多分组且 headerMode=nav 时显示 -->
          <nav v-if="showNav" class="wd-station__nav">
            <span
              v-for="g in groups"
              :key="g.key"
              class="wd-station__nav-item"
              :class="{ 'is-active': g.key === activeGroupKey }"
              @click="setActiveGroup(g.key)"
            >
              <el-icon v-if="isIconFontClass(g.icon)"><i :class="g.icon" /></el-icon>
              <el-icon v-else-if="resolveStationIcon(g.icon)"><component :is="resolveStationIcon(g.icon)" /></el-icon>
              {{ g.title }}
            </span>
          </nav>
          <span v-else-if="showHeaderTitle" class="wd-station__header-title">{{ title }}</span>
          <slot name="header-center" />
        </div>
        <div id="wd-station__header-right" class="wd-station__header-right">
          <slot name="header-right" />
          <template v-for="tool in toolbarRight" :key="tool">
            <el-icon
              v-if="tool === 'refresh'"
              data-tool="refresh"
              title="刷新内容"
              class="wd-station__tool"
              @click="refresh"
            ><Refresh /></el-icon>
            <el-icon
              v-else-if="tool === 'fullscreen'"
              data-tool="fullscreen"
              :title="isFullscreen ? '退出全屏' : '全屏显示'"
              class="wd-station__tool"
              @click="toggleFullscreen"
            ><FullScreen /></el-icon>
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
        <div id="wd-station__top-menu-left" class="wd-station__top-menu-left">
          <slot name="top-menu-left" />
        </div>
        <el-menu mode="horizontal" :default-active="currentKey">
          <station-menu-node :items="currentGroupMenus" @select="onMenuSelect" />
        </el-menu>
        <div id="wd-station__top-menu-right" class="wd-station__top-menu-right">
          <slot name="top-menu-right" />
        </div>
      </div>

      <!-- tabs 导航（contentMode=tabs）：整宽撑满，右侧下拉批量关闭；自绘 label 插槽，affix 无关闭图标 -->
      <div v-if="contentMode === 'tabs'" class="wd-station__tabs-bar">
        <div id="wd-station__tabs-left" class="wd-station__tabs-left">
          <slot name="tabs-left" />
        </div>
        <el-tabs
          :model-value="currentKey"
          type="card"
          class="wd-station__tabs"
        >
          <el-tab-pane v-for="tab in tabs" :key="tab.key" :name="tab.key">
            <template #label>
              <el-icon v-if="tabIcon && tab.icon && isIconFontClass(tab.icon)" class="wd-station__tab-icon">
                <i :class="tab.icon" />
              </el-icon>
              <el-icon v-else-if="tabIcon && tab.icon && resolveStationIcon(tab.icon)" class="wd-station__tab-icon">
                <component :is="resolveStationIcon(tab.icon)" />
              </el-icon>
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
        <div id="wd-station__tabs-right" class="wd-station__tabs-right">
          <slot name="tabs-right" />
        </div>
      </div>

      <!-- 内容区：router 模式渲染 RouterView，html 模式渲染默认插槽；contentKey 强制重挂载 -->
      <main id="wd-station__content" class="wd-station__content">
        <div :key="contentKey" class="wd-station__content-inner">
          <template v-if="isRouterMode && RouterViewComp">
            <keep-alive v-if="keepAlive"><component :is="RouterViewComp" /></keep-alive>
            <component :is="RouterViewComp" v-else />
          </template>
          <slot v-else />
        </div>
      </main>

      <!-- 底部信息栏：动态信息 + 版权（footer 插槽可整体替换） -->
      <footer id="wd-station__footer" class="wd-station__footer">
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
import { Fold, Expand, ArrowUp, ArrowDown, Refresh, Setting, Close, FullScreen } from '@element-plus/icons-vue'
import { filterProp } from '../common/props'
import { registerStation, notifyStationChange } from '../../lib/core/station-linkage'
import { isIconFontClass, resolveStationIcon } from '../../lib/core/station-icon'
import StationMenuNode from './StationMenuNode.vue'
import type { MenuChainItem } from '../../lib/core/station-linkage'
import type { StationMenuGroup, StationTab, StationToolbarConfig } from './types'

defineOptions({ name: 'WdStation' })

const props = defineProps({
  ...filterProp,
  /** 系统标题（logo 区 / headerMode=title 时的头部标题） */
  title: { type: String, default: '' },
  /** logo 图标（@element-plus/icons-vue 名称字符串 / 图标字体 class 如 'fa-solid fa-user'（需自行引入对应 CSS）/ 直接传组件） */
  logo: { type: [String, Object] as PropType<string | object>, default: '' },
  /** 分组菜单结构（优先），支持 JSON 字符串 */
  menuGroups: { type: [Array, String] as PropType<any[] | string>, default: undefined },
  /** 扁平菜单结构（带 group/groupKey 字段按出现顺序归组），支持 JSON 字符串 */
  menus: { type: [Array, String] as PropType<any[] | string>, default: undefined },
  /** 头部中央模式：nav=分导台 / title=标题（此时侧边渲染全量菜单并带组标题）/ both=分导台+标题并存（顶部显示分导台，侧边按分组标题渲染全量菜单） */
  headerMode: { type: String as PropType<'nav' | 'title' | 'both'>, default: 'nav' },
  /** 是否显示头部中央标题（headerMode 非 nav 时的 fallback 标题；需自绘 header-center 时可关闭） */
  showHeaderTitle: { type: Boolean, default: true },
  /** 菜单位置：side=左侧 / top=顶部 / none=不启用 */
  menuMode: { type: String as PropType<'side' | 'top' | 'none'>, default: 'side' },
  /** 左侧菜单手风琴：true 时同时只展开一个子菜单（透传 el-menu unique-opened，仅 side 模式） */
  menuAccordion: { type: Boolean, default: false },
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
  /** tabs 标签标题是否显示菜单图标（true 时菜单项 icon 随 tab 显示在标题前） */
  tabIcon: { type: Boolean, default: true },
  /** 关闭当前激活标签后是否跳回上一次激活的标签（true=MRU 历史；false=相邻，先右后左） */
  activatePreviousTab: { type: Boolean, default: true },
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
  /** 工具栏点位配置：refresh/fullscreen/settings/user/login 各自 left/right/none，支持 JSON 字符串；settings 默认 none（默认不渲染） */
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
const showNav = computed(() => props.headerMode !== 'title' && groups.value.length > 1)
const currentGroup = computed(
  () => groups.value.find((g) => g.key === activeGroupKey.value) || groups.value[0]
)
const currentGroupMenus = computed(() => currentGroup.value?.menus || [])

function setActiveGroup(key: string) {
  innerActiveGroup.value = key
  emit('update:active-group', key)
  const g = groups.value.find((item) => item.key === key)
  if (g) emit('group-change', { key: g.key, title: g.title })
  notifyStationChange(props.filter)
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
  notifyStationChange(props.filter)
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
// 标签激活历史（MRU）：末尾为最近激活的 key，供关闭当前标签时回跳
const tabHistory = ref<string[]>([])

function commitTabs(newTabs: StationTab[]) {
  if (!isTabsControlled.value) innerTabs.value = newTabs
  emit('update:open-tabs', newTabs)
}

/** 记录一次标签激活：移到历史末尾（去重），仅保留当前仍打开的 key */
function pushTabHistory(key: string) {
  const rest = tabHistory.value.filter((k) => k !== key)
  tabHistory.value = [...rest, key]
}

function openTab(tab: any) {
  const key = tab._key || tab.key
  if (!key) return
  if (!tabs.value.find((t) => t.key === key)) {
    commitTabs([...tabs.value, { key, title: tab.title, path: tab.path, affix: tab.affix, icon: tab.icon }])
  }
  pushTabHistory(key)
  setActiveMenu(key)
}

/** 关闭当前激活标签后的回跳目标：MRU 历史优先，历史无可用时回退相邻（先右后左） */
function resolveTabAfterClose(key: string, newTabs: StationTab[], idx: number): StationTab | undefined {
  if (props.activatePreviousTab) {
    const openKeys = new Set(newTabs.map((t) => t.key))
    for (let i = tabHistory.value.length - 1; i >= 0; i--) {
      const k = tabHistory.value[i]
      if (k !== key && openKeys.has(k)) return newTabs.find((t) => t.key === k)
    }
  }
  return newTabs[idx] || newTabs[idx - 1]
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
  tabHistory.value = tabHistory.value.filter((k) => k !== key)
  // 关闭激活标签 → 跳回上次激活标签（可配），无历史则回退相邻（先右后左）；router 模式同步路由
  if (currentKey.value === key) {
    const next = resolveTabAfterClose(key, newTabs, idx)
    if (next) {
      setActiveMenu(next.key)
      if (isRouterMode.value && next.path) router.push(next.path)
    }
  }
}

function onTabClick(tab: StationTab) {
  pushTabHistory(tab.key)
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
  // 激活标签被关掉 → 跳到原位置附近（先右后左）；router 模式同步路由
  if (!kept.find((t) => t.key === currentKey.value)) {
    const idx = list.findIndex((t) => t.key === currentKey.value)
    const next = kept[Math.min(idx, kept.length - 1)]
    if (next) {
      setActiveMenu(next.key)
      if (isRouterMode.value && next.path) router.push(next.path)
    }
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
    settings: raw.settings || 'none',
    fullscreen: raw.fullscreen || 'right',
    user: raw.user || 'right',
    login: raw.login || 'right'
  }
})
const accountTool = computed(() => (props.userName ? 'user' : 'login'))
const toolbarLeft = computed(() => {
  const list: string[] = []
  const cfg = toolbarCfg.value
  if (cfg.refresh === 'left') list.push('refresh')
  if (cfg.fullscreen === 'left') list.push('fullscreen')
  if (cfg.settings === 'left') list.push('settings')
  if (cfg[accountTool.value as keyof StationToolbarConfig] === 'left') list.push(accountTool.value)
  return list
})
const toolbarRight = computed(() => {
  const list: string[] = []
  const cfg = toolbarCfg.value
  if (cfg.refresh === 'right') list.push('refresh')
  if (cfg.fullscreen === 'right') list.push('fullscreen')
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

/* ---------- 全屏切换（document Fullscreen API） ---------- */
const isFullscreen = ref(false)
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}
function syncFullscreenState() {
  isFullscreen.value = !!document.fullscreenElement
}

/* ---------- 底部动态信息 + 联动注册 ---------- */
const innerFooterInfo = ref('')
function setFooterInfo(info: string) {
  innerFooterInfo.value = info
  emit('update:footer-info', info)
}
const displayFooterInfo = computed(() => innerFooterInfo.value || props.footerInfo)

/* ---------- 激活菜单路径链（WdPath 自动模式读取） ---------- */
function findMenuChain(key: string): { chain: MenuChainItem[] } | null {
  for (const g of groups.value) {
    const path: any[] = []
    const walk = (menus: any[], ancestors: any[]): boolean => {
      for (const m of menus) {
        if (m._key === key) {
          path.push(...ancestors, m)
          return true
        }
        if (m.children && m.children.length && walk(m.children, [...ancestors, m])) return true
      }
      return false
    }
    if (walk(g.menus, [])) {
      return {
        chain: [
          { title: g.title, icon: g.icon },
          ...path.map((m: any) => ({ title: m.title, path: m.path, icon: m.icon }))
        ]
      }
    }
  }
  return null
}

function getActiveMenuChain(): MenuChainItem[] {
  if (!currentKey.value) return []
  return findMenuChain(currentKey.value)?.chain || []
}

let unregister: (() => void) | null = null
onMounted(() => {
  unregister = registerStation({ filter: props.filter, setFooterInfo, refresh, getActiveMenuChain })
  // 通知同 filter 组的面包屑：本站已就绪，可读取菜单链
  notifyStationChange(props.filter)
  // tabs 模式：affix 菜单挂载时自动开启
  if (props.contentMode === 'tabs') {
    groups.value.forEach((g) =>
      walkMenus(g.menus, (m) => {
        if (m.affix) openTab(m)
      })
    )
  }
  document.addEventListener('fullscreenchange', syncFullscreenState)
})
onUnmounted(() => {
  unregister?.()
  document.removeEventListener('fullscreenchange', syncFullscreenState)
})

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
  /* 组件级令牌回退链：皮肤可单独定制导航区背景 */
  background: var(--wd-station-aside-bg, var(--wd-bg-color));
  /* 背景素材：皮肤可挂纹理/图片（须置于 background 简写之后，否则被简写重置） */
  background-image: var(--wd-station-aside-bg-image, none);
  border-right: var(--wd-border-width, 1px) var(--wd-border-style, solid) var(--wd-border-color-light);
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
  padding: 0 var(--wd-spacing-large, 16px);
  overflow: hidden;
  flex-shrink: 0;
  border-bottom: var(--wd-border-width, 1px) var(--wd-border-style, solid) var(--wd-border-color-light);
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

/* 左侧菜单 title 分组标题（headerMode=title/both）：小型章节标题风格，与菜单项拉开层级 */
.wd-station__aside :deep(.el-menu-item-group__title) {
  margin-top: 12px;
  padding: 4px 0 4px 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1.5;
  color: var(--wd-station-menu-group-color, var(--el-text-color-secondary));
}
/* 首个分组标题不加大顶部间距 */
.wd-station__aside :deep(.el-menu-item-group:first-child > .el-menu-item-group__title) {
  margin-top: 0;
}
/* 折叠时隐藏分组标题（EP collapse 不处理 group title，64px 窄栏会溢出） */
.wd-station__aside.is-collapsed :deep(.el-menu-item-group__title) {
  display: none;
}
/* EP collapse 的 icon/span 隐藏规则只命中 .el-menu--collapse 的直接子级菜单项；
   headerMode=title/both 下菜单项位于 el-menu-item-group 内不被命中，
   64px 窄栏下文字残留溢出——补齐 group 内菜单项的 collapse 处理 */
.wd-station__aside :deep(.el-menu--collapse .el-menu-item-group .el-menu-item > span) {
  visibility: hidden;
  width: 0;
  height: 0;
  display: inline-block;
  overflow: hidden;
}
.wd-station__aside :deep(.el-menu--collapse .el-menu-item-group .el-menu-item [class^='el-icon']) {
  margin: 0;
  vertical-align: middle;
  width: var(--el-menu-icon-width);
  text-align: center;
}

/* 菜单徽章对齐：与 StationMenuNode.vue 同款规则。
   headerMode=both 的叶子菜单项在本组件模板内联渲染（不经 StationMenuNode），
   scoped 规则互不渗透，需在此补齐——否则 badge 被 el-menu-item 的 56px
   line-height 撑成整行 block，红点沉到下半行 */
.wd-station__menu-badge {
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  align-self: center;
  flex-shrink: 0;
}
/* 折叠成窄条时隐藏徽章，避免溢出（both 模式 badge 同样受折叠影响） */
.el-menu--collapse .wd-station__menu-badge {
  display: none;
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
  background: var(--wd-station-header-bg, var(--wd-bg-color));
  /* 背景素材：皮肤可挂纹理/图片（须置于 background 简写之后，否则被简写重置） */
  background-image: var(--wd-station-header-bg-image, none);
  border-bottom: var(--wd-border-width, 1px) var(--wd-border-style, solid) var(--wd-border-color-light);
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
  border-bottom: var(--wd-border-width, 1px) var(--wd-border-style, solid) var(--wd-border-color-light);
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
  background: var(--wd-station-tabs-bg, var(--wd-bg-color));
  /* 背景素材：皮肤可挂纹理/图片（须置于 background 简写之后，否则被简写重置） */
  background-image: var(--wd-station-tabs-bg-image, none);
  border-bottom: var(--wd-border-width, 1px) var(--wd-border-style, solid) var(--wd-border-color-light);
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
  border-right: var(--wd-border-width, 1px) var(--wd-border-style, solid) var(--wd-border-color-light);
}
/* 激活 tab 增强：顶部主色指示条 + 浅主色背景 + 主色加粗文字，强化激活辨识 */
.wd-station__tabs-bar :deep(.el-tabs--card > .el-tabs__header .el-tabs__nav .el-tabs__item.is-active) {
  color: var(--wd-color-primary, var(--el-color-primary));
  background: var(--el-color-primary-light-9, var(--wd-bg-color-page));
  font-weight: 600;
  box-shadow: inset 0 3px 0 0 var(--wd-color-primary, var(--el-color-primary));
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
.wd-station__tab-icon {
  margin-right: 4px;
  vertical-align: -2px;
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
  /* 组件级令牌回退链：皮肤可单独定制底栏背景 */
  background: var(--wd-station-footer-bg, var(--wd-bg-color));
  border-top: var(--wd-border-width, 1px) var(--wd-border-style, solid) var(--wd-border-color-light);
  color: var(--wd-text-color-secondary);
  font-size: var(--wd-font-size-small);
  flex-shrink: 0;
}
.wd-station__footer-info {
  color: var(--wd-text-color-regular);
}
</style>
