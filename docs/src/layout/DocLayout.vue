<template>
  <el-container class="doc-layout">
    <el-aside width="240px" class="doc-layout__aside">
      <div class="doc-layout__logo" @click="$router.push('/')">
        <span class="doc-layout__logo-mark">Wd</span>
        <span class="doc-layout__logo-text">WorkDesktop</span>
      </div>
      <el-scrollbar class="doc-layout__menu">
        <el-menu :default-active="activePath" router class="doc-layout__nav">
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-sub-menu v-for="g in componentNav" :key="g.label" :index="g.label">
            <template #title>{{ g.label }}</template>
            <el-menu-item v-for="c in g.items" :key="c.path" :index="`/components/${c.path}`">
              {{ c.title }}
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/playground">
            <el-icon><MagicStick /></el-icon>
            <span>Playground</span>
          </el-menu-item>

          <el-menu-item index="/linkage">
            <el-icon><Connection /></el-icon>
            <span>联动演示</span>
          </el-menu-item>

          <el-sub-menu index="场景示例">
            <template #title>场景示例</template>
            <el-menu-item v-for="s in scenarioRoutes" :key="s.path" :index="`/scenarios/${s.path}`">
              {{ s.label }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container class="doc-layout__body">
      <el-header class="doc-layout__header" height="48px">
        <span class="doc-layout__breadcrumb">{{ breadcrumb }}</span>
        <span class="doc-layout__version">v1.0.0 · Vue3 + ElementPlus</span>
      </el-header>
      <el-main class="doc-layout__main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, MagicStick, Connection } from '@element-plus/icons-vue'
import { componentNav } from '../api-meta'
import { scenarioRoutes } from '../router'

const route = useRoute()
const activePath = computed(() => route.path)
const breadcrumb = computed(() => {
  const p = route.path
  if (p === '/') return '首页'
  if (p.startsWith('/playground')) return 'Playground'
  if (p.startsWith('/linkage')) return '联动演示'
  const c = componentNav.flatMap((g) => g.items).find((x) => p === `/components/${x.path}`)
  if (c) return `${c.group} · ${c.title}`
  const s = scenarioRoutes.find((x) => p === `/scenarios/${x.path}`)
  if (s) return `场景示例 · ${s.label}`
  return 'WorkDesktop'
})
</script>

<style scoped>
.doc-layout {
  height: 100vh;
  overflow: hidden;
}
.doc-layout__aside {
  border-right: 1px solid #ebeef5;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.doc-layout__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}
.doc-layout__logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}
.doc-layout__logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.doc-layout__menu {
  flex: 1;
}
.doc-layout__nav {
  border-right: none;
}
.doc-layout__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.doc-layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
  padding: 0 24px;
}
.doc-layout__breadcrumb {
  font-size: 14px;
  color: #606266;
}
.doc-layout__version {
  font-size: 12px;
  color: #c0c4cc;
}
.doc-layout__main {
  background: #f5f7fa;
  padding: 24px;
  overflow: auto;
}
</style>
