<template>
  <div class="home">
    <section class="home__hero">
      <h1 class="home__title">WorkDesktop 组件库</h1>
      <p class="home__subtitle">企业级 Vue3 组件库 · 基于 ElementPlus · HTML 模板渲染友好 · AI 编码友好 · 声明式联动</p>
      <div class="home__actions">
        <el-button type="primary" size="large" @click="$router.push('/components/datagrid')">快速开始</el-button>
        <el-button size="large" @click="$router.push('/playground')">打开 Playground</el-button>
      </div>
      <div class="home__stats">
        <el-statistic title="组件" :value="allComponents.length" />
        <el-statistic title="基础模块" :value="4" />
        <el-statistic title="双产物" value="ESM / UMD" />
      </div>
    </section>

    <section class="home__section">
      <h2>核心特性</h2>
      <el-row :gutter="16">
        <el-col v-for="f in features" :key="f.title" :span="8">
          <div class="home__feature">
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </el-col>
      </el-row>
    </section>

    <section class="home__section">
      <h2>快速开始</h2>
      <CodeBlock
        lang="bash"
        :code="`npm install workdesktop-ai element-plus vue\n\n// main.ts\nimport { createApp } from 'vue'\nimport WorkDesktop from 'workdesktop-ai'\nimport 'workdesktop-ai/style.css'\n\ncreateApp(App).use(WorkDesktop, {\n  request: { urlPrefix: '/api' }\n}).mount('#app')`"
      />
      <p class="home__note">纯 HTML 引入：<code>&lt;script src="dist/index.umd.js"&gt;&lt;/script&gt;</code>，全局变量 <code>WorkDesktop</code>，通过 <code>window.workDesktopConfig</code> 注入配置。</p>
    </section>

    <section class="home__section">
      <h2>组件总览</h2>
      <el-row :gutter="12">
        <el-col v-for="g in componentNav" :key="g.label" :span="12">
          <div class="home__group">
            <h3>{{ g.label }}（{{ g.items.length }}）</h3>
            <el-tag
              v-for="c in g.items"
              :key="c.path"
              class="home__tag"
              type="info"
              effect="plain"
              @click="$router.push(`/components/${c.path}`)"
            >{{ c.title }}</el-tag>
          </div>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup lang="ts">
import { allComponents, componentNav } from '../api-meta'

const features = [
  { title: 'HTML 模板渲染友好', desc: 'UMD 一等公民：纯 script 标签即可使用全部能力，配合 window.workDesktopConfig 注入全局配置' },
  { title: 'AI 编码友好', desc: '统一命名约定（withXxx / api / headXxx），声明式联动，天然适合 AI 生成业务页面' },
  { title: '声明式联动', desc: 'filter 分组 + headRefreshDatagrid / headCloseDrawer，提交、关闭、搜索自动刷新目标 DataGrid' },
  { title: '薄封装不锁死', desc: '基于 ElementPlus 薄封装，属性/插槽透传，ElementPlus 生态完全可用' },
  { title: 'TypeScript 全量类型', desc: 'Props/Emits/Slots/Methods 类型导出，IDE 智能提示完整' },
  { title: '统一请求协议', desc: '自动封解封、统一错误提示、loading 计数、可中断、reqOptions 逐项可配' }
]
</script>

<style scoped>
.home {
  max-width: 1080px;
  margin: 0 auto;
}
.home__hero {
  text-align: center;
  padding: 48px 0 32px;
}
.home__title {
  font-size: 36px;
  margin: 0 0 12px;
  color: #303133;
}
.home__subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0 0 24px;
}
.home__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
}
.home__stats {
  display: flex;
  justify-content: center;
  gap: 64px;
}
.home__section {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
}
.home__section h2 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #303133;
}
.home__feature {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 12px;
  min-height: 110px;
}
.home__feature h3 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #409eff;
}
.home__feature p {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}
.home__group {
  margin-bottom: 16px;
}
.home__group h3 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #606266;
}
.home__tag {
  margin: 0 8px 8px 0;
  cursor: pointer;
}
.home__note {
  font-size: 13px;
  color: #909399;
  margin-top: 12px;
}
.home__note code {
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
