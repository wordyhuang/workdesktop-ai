<template>
  <div class="home">
    <PageHeader
      eyebrow="COMPONENT LIBRARY"
      icon="Promotion"
      title="WorkDesktop 组件库"
      desc="企业级 Vue3 组件库 · 基于 ElementPlus · HTML 模板渲染友好 · AI 编码友好 · 声明式联动"
    >
      <template #extra>
        <div class="home__actions">
          <el-button type="primary" size="large" @click="$router.push('/components/datagrid')">
            快速开始
          </el-button>
          <el-button size="large" @click="$router.push('/playground')">打开 Playground</el-button>
        </div>
      </template>
    </PageHeader>

    <!-- 关键指标 -->
    <section class="home__stats">
      <div v-for="s in stats" :key="s.label" class="home-stat">
        <span class="home-stat__icon" :style="{ color: s.color, background: s.bg }">
          <el-icon><component :is="s.icon" /></el-icon>
        </span>
        <div class="home-stat__body">
          <b>{{ s.value }}</b>
          <i>{{ s.label }}</i>
        </div>
      </div>
    </section>

    <!-- 核心特性 -->
    <section class="home__section">
      <h2 class="home-h2"><span class="home-h2__bar" />核心特性</h2>
      <div class="home__feature-grid">
        <div v-for="f in features" :key="f.title" class="home-feature">
          <span class="home-feature__icon" :style="{ color: f.color, background: f.bg }">
            <el-icon><component :is="f.icon" /></el-icon>
          </span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="home__section">
      <h2 class="home-h2"><span class="home-h2__bar" />快速开始</h2>
      <CodeBlock
        lang="bash"
        :code="`npm install workdesktop-ai element-plus vue\n\n// main.ts\nimport { createApp } from 'vue'\nimport WorkDesktop from 'workdesktop-ai'\nimport 'workdesktop-ai/style.css'\n\ncreateApp(App).use(WorkDesktop, {\n  request: { urlPrefix: '/api' }\n}).mount('#app')`"
      />
      <p class="home__note">
        纯 HTML 引入：<code>&lt;script src="dist/index.umd.js"&gt;&lt;/script&gt;</code>，全局变量
        <code>WorkDesktop</code>，通过 <code>window.workDesktopConfig</code> 注入配置。
      </p>
    </section>

    <!-- 组件总览 -->
    <section class="home__section">
      <h2 class="home-h2">
        <span class="home-h2__bar" />组件总览
        <span class="home-h2__count">{{ allComponents.length }} 个组件</span>
      </h2>
      <el-row :gutter="14">
        <el-col v-for="g in componentNav" :key="g.label" :xs="24" :sm="12">
          <div class="home__group">
            <div class="home__group-head">
              <span>{{ g.label }}</span>
              <i>{{ g.items.length }}</i>
            </div>
            <div class="home__tags">
              <span
                v-for="c in g.items"
                :key="c.path"
                class="home__tag"
                @click="$router.push(`/components/${c.path}`)"
              >{{ c.title }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Platform, MagicStick, Connection, Box, DocumentChecked, Promotion, Grid, Coin, Files } from '@element-plus/icons-vue'
import { allComponents, componentNav } from '../api-meta'

const stats = [
  { label: '组件数量', value: String(allComponents.length), icon: Grid, color: 'var(--wd-color-primary)', bg: 'var(--el-color-primary-light-9)' },
  { label: '基础模块', value: '4', icon: Coin, color: '#e6a23c', bg: 'rgba(230, 162, 60, 0.12)' },
  { label: '产物形态', value: 'ESM / UMD', icon: Files, color: '#67c23a', bg: 'rgba(103, 194, 58, 0.12)' }
]

const features = [
  { title: 'HTML 模板渲染友好', icon: Platform, color: '#1677ff', bg: 'rgba(22,119,255,0.10)',
    desc: 'UMD 一等公民：纯 script 标签即可使用全部能力，配合 window.workDesktopConfig 注入全局配置' },
  { title: 'AI 编码友好', icon: MagicStick, color: '#5b5bd6', bg: 'rgba(91,91,214,0.10)',
    desc: '统一命名约定（withXxx / api / headXxx），声明式联动，天然适合 AI 生成业务页面' },
  { title: '声明式联动', icon: Connection, color: '#12a866', bg: 'rgba(18,168,102,0.10)',
    desc: 'filter 分组 + headRefreshDatagrid / headCloseDrawer，提交、关闭、搜索自动刷新目标 DataGrid' },
  { title: '薄封装不锁死', icon: Box, color: '#e0702a', bg: 'rgba(224,112,42,0.10)',
    desc: '基于 ElementPlus 薄封装，属性/插槽透传，ElementPlus 生态完全可用' },
  { title: 'TypeScript 全量类型', icon: DocumentChecked, color: '#0f9d8f', bg: 'rgba(15,157,143,0.10)',
    desc: 'Props/Emits/Slots/Methods 类型导出，IDE 智能提示完整' },
  { title: '统一请求协议', icon: Promotion, color: '#d64545', bg: 'rgba(214,69,69,0.09)',
    desc: '自动封解封、统一错误提示、loading 计数、可中断、reqOptions 逐项可配' }
]
</script>

<style scoped>
.home {
  max-width: 1080px;
  margin: 0 auto;
  color: var(--wd-text-color-primary, #303133);
}
.home__actions {
  display: flex;
  gap: 12px;
}

/* —— 指标条 —— */
.home__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: -4px 0 18px;
}
.home-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 12px;
  background: var(--wd-bg-color, #fff);
  box-shadow: 0 2px 10px rgba(13, 18, 30, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.home-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(13, 18, 30, 0.07);
}
.home-stat__icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex: none;
}
.home-stat__body {
  display: flex;
  flex-direction: column;
}
.home-stat__body b {
  font-size: 22px;
  font-weight: 750;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
  color: var(--wd-text-color-primary, #303133);
}
.home-stat__body i {
  font-style: normal;
  font-size: 12.5px;
  color: var(--wd-text-color-secondary, #909399);
}

/* —— 章节容器 / 标题 —— */
.home__section {
  background: var(--wd-bg-color, #fff);
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(13, 18, 30, 0.03);
}
.home-h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 700;
  color: var(--wd-text-color-primary, #303133);
}
.home-h2__bar {
  width: 4px;
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(180deg, var(--wd-color-primary, #409eff), var(--el-color-primary-light-3, #79bbff));
}
.home-h2__count {
  font-size: 12px;
  font-weight: 500;
  color: var(--wd-text-color-secondary, #909399);
  background: var(--wd-bg-color-page, #f5f7fa);
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 999px;
  padding: 2px 10px;
}

/* —— 特性卡 —— */
.home__feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.home-feature {
  padding: 16px;
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 12px;
  background: var(--wd-bg-color, #fff);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.home-feature:hover {
  transform: translateY(-3px);
  border-color: var(--el-color-primary-light-5, #a0cfff);
  box-shadow: 0 12px 26px rgba(13, 18, 30, 0.08);
}
.home-feature__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  margin-bottom: 10px;
}
.home-feature h3 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 650;
  color: var(--wd-text-color-primary, #303133);
}
.home-feature p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--wd-text-color-regular, #606266);
}

/* —— 快速开始 note —— */
.home__note {
  font-size: 13px;
  color: var(--wd-text-color-secondary, #909399);
  margin: 12px 0 0;
  line-height: 1.7;
}
.home__note code {
  background: var(--wd-bg-color-page, #f0f2f5);
  border: 1px solid var(--wd-border-color-light, #e9ecf1);
  padding: 1px 6px;
  border-radius: 5px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
  color: var(--wd-color-primary, #409eff);
}

/* —— 组件总览 —— */
.home__group {
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 14px;
  background: var(--wd-bg-color-page, transparent);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.home__group:hover {
  border-color: var(--el-color-primary-light-5, #a0cfff);
  box-shadow: 0 8px 20px rgba(13, 18, 30, 0.05);
}
.home__group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 650;
  color: var(--wd-text-color-primary, #303133);
}
.home__group-head i {
  font-style: normal;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--wd-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  border-radius: 999px;
  padding: 1px 9px;
}
.home__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.home__tag {
  font-size: 12.5px;
  padding: 4px 12px;
  border-radius: 999px;
  cursor: pointer;
  color: var(--wd-text-color-regular, #606266);
  background: var(--wd-bg-color, #fff);
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  transition: color 0.16s ease, border-color 0.16s ease, background-color 0.16s ease, transform 0.16s ease;
  user-select: none;
}
.home__tag:hover {
  color: var(--wd-color-primary, #409eff);
  border-color: var(--wd-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  transform: translateY(-1px);
}

@media (max-width: 960px) {
  .home__stats,
  .home__feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
