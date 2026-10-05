<template>
  <div class="doc-layout">
    <!-- 文档站外壳：用 WdStation 构建（左侧分组可折叠菜单：children → el-sub-menu + 内容区 + 底栏，无分导台） -->
    <wd-station v-model:active-group="activeGroupKey" v-model:active-menu="activeMenuKey" title="WorkDesktop"
      :logo="BrandMark" :menu-groups="menuGroups" menus="group" header-mode="title" menu-mode="side" content-mode="page"
      router-mode="router" :toolbar-config="toolbarConfig" copyright="© 2026 WorkDesktop"
      :footer-info="footerInfo" @settings="skinVisible = true" :collapsible="false" :show-header-title="false"
      filter="doc-shell">
      <!-- 顶栏吸顶路径：自动联动模式（WdPath mode="auto" + WdStation 同 filter=doc-shell）。
           常驻显示，路径段由 Station 菜单链 + 内容区标题自动驱动。 -->
      <template #header-center>
        <wd-path
          ref="stickyPathRef"
          class="doc-sticky-title"
          mode="auto"
          filter="doc-shell"
          :show-home="false"
          container=".wd-station__content"
          animation="slide"
        />
      </template>
      <!-- 顶栏右侧：皮肤切换入口（画刷圆形按钮，点击打开全站换肤抽屉） -->
      <template #header-right>
        <el-tooltip content="切换皮肤" placement="bottom" :show-after="200">
          <el-button class="skin-entry" circle aria-label="切换皮肤" @click="skinVisible = true">
            <el-icon><Brush /></el-icon>
          </el-button>
        </el-tooltip>
      </template>
    </wd-station>

    <!-- 全站主题皮肤：挂到 WdStation 顶栏 settings 工具，点击打开抽屉 -->
    <el-drawer v-model="skinVisible" title="全站主题皮肤" size="420px">
      <div class="skin-picker">
        <p class="skin-picker__tip">
          组件库 10 套系统预设皮肤，选择后经 <code>theme.skin</code> 一键套用，全站实时换肤（Element 组件联动）。
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
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Brush, CircleCheckFilled } from '@element-plus/icons-vue'
import { WdPath, useGlobalConfig } from '../../../src'
import { componentNav } from '../api-meta'
import { SITE_SKINS, currentSkinKey, swatchesOf, applySkin } from '../skins'
import BrandMark from '../components/BrandMark.vue'

const skinVisible = ref(false)

/** 底栏版本信息：版本号统一从全局配置读取（src/lib/configs/default-config.ts 的 version） */
const footerInfo = `v${useGlobalConfig().version} · Vue3 + ElementPlus`

/** 顶栏工具点位全部关闭（refresh/settings/user/login）；皮肤入口为 header-right 插槽的画刷按钮 */
const toolbarConfig = { refresh: 'none', settings: 'none', user: 'none', login: 'none' }

/**
 * 导航映射为 WdStation 分组菜单（分组可折叠形态）：
 * - 单分组承载全部菜单；组内「带 children 的节点」由 WdStation 渲染为 el-sub-menu（可折叠分组），
 *   无 children 的节点为平铺菜单项（el-menu-item）
 * - 概览：首页（平铺）
 * - 组件分组：复用 componentNav，每组一个可折叠节点（path → /components/{path}；
 *   菜单显示名去掉 Wd 前缀，如 WdDataGrid → DataGrid）；
 *   「核心基础设施」组末尾额外挂独立页「全局样式 / 主题」（/theme）与「组件联动」（/linkage）
 * - 工具指南：Playground / 场景搭建指引
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
    // 单分组平铺不显示分组头，此 title 仅作为自动联动 Path 的菜单链根节点（“文档 / 分组 / 菜单”链首）
    title: '文档',
    menus: [
      { title: '首页', path: '/', icon: 'HomeFilled' },
      ...componentNav.map((g) => ({
        title: g.label,
        children: [
          ...g.items.map((c) => ({ title: c.name.replace(/^Wd/, ''), path: `/components/${c.path}` })),
          // 「全局样式 / 主题」「组件联动」独立页挂在核心基础设施分组下
          ...(g.label === '核心基础设施'
            ? [
                { title: '全局样式 / 主题', path: '/theme' },
                { title: '组件联动', path: '/linkage' }
              ]
            : [])
        ]
      })),
      {
        title: '工具指南',
        icon: 'Collection',
        children: [
          { title: 'Playground', path: '/playground', icon: 'MagicStick' },
          { title: '场景搭建指引', path: '/scenario-guide', icon: 'Guide' }
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
 * 顶栏吸顶路径（WdPath mode=auto 与 WdStation 同 filter=doc-shell 自动联动）。
 * Path 组件内部已通过 Station 菜单链 + 内容区标题 + 路由自身驱动刷新；
 * 但受控菜单高亮（本布局 watch route.path 反查同步 activeMenu）与 Path 的 $route
 * 监听在同一 UE 更新周期存在触发时序先后，为避免地址栏直达 / 前进后退等非点击导航
 * 读到旧菜单链，这里在路由切换完成（下个 tick）后主动调一次 Path.refresh() 兜底对齐。
 */
const stickyPathRef = ref<InstanceType<typeof WdPath>>()

watch(() => route.path, () => nextTick(() => stickyPathRef.value?.refresh()))
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

/* —— 顶栏吸顶路径（Path 组件）：常驻显示；约束宽度、单行渲染避免换行 —— */
.doc-sticky-title {
  max-width: 60%;
}

/* Path 自动模式更新时的路径变化过渡由组件内 animation="slide" 负责，此处无需额外显隐动画 */

/* el-breadcrumb 默认 flex-wrap: wrap，在顶栏有限宽度内改为单行，超长路径由段内省略兜底 */
.doc-sticky-title :deep(.el-breadcrumb) {
  flex-wrap: nowrap;
  min-width: 0;
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

/* —— 顶栏皮肤入口按钮 —— */
.skin-entry {
  flex: none;
}
</style>
