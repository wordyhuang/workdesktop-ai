<template>
  <div class="doc-page">
    <header class="doc-page__header">
      <span class="doc-page__header-bar" />
      <div class="doc-page__heading">
        <div class="doc-page__title-row">
          <h1 class="doc-page__title">{{ meta.title }}</h1>
          <span class="doc-page__name-tag">{{ meta.name }}</span>
        </div>
        <p class="doc-page__desc">{{ meta.desc }}</p>
      </div>
    </header>

    <!-- 组件介绍：概述 + 何时使用 -->
    <section v-if="meta.intro?.overview || meta.intro?.whenToUse?.length" class="doc-page__intro">
      <p v-if="meta.intro?.overview" class="doc-page__intro-overview" v-html="inline(meta.intro!.overview!)" />
      <div v-if="meta.intro?.whenToUse?.length" class="doc-page__intro-block">
        <h3 class="doc-page__intro-title">何时使用</h3>
        <ul class="doc-page__intro-list">
          <li v-for="(item, i) in meta.intro!.whenToUse" :key="i" v-html="inline(item)" />
        </ul>
      </div>
    </section>

    <!-- 示例区 -->
    <slot name="examples" />

    <!-- API 表格 -->
    <section class="doc-page__api">
      <h2 class="doc-page__section">
        <span class="doc-page__section-no">01</span>
        <span class="doc-page__section-text">Props</span>
        <span class="doc-page__section-en">属性</span>
      </h2>
      <div class="doc-page__table-card">
        <el-table :data="meta.props" size="default" class="doc-page__table">
          <el-table-column prop="name" label="属性" width="180" />
          <el-table-column prop="desc" label="说明" min-width="220" />
          <el-table-column prop="type" label="类型" min-width="200" />
          <el-table-column prop="default" label="默认值" width="150" />
        </el-table>
      </div>

      <template v-if="meta.emits?.length">
        <h2 class="doc-page__section">
          <span class="doc-page__section-no">02</span>
          <span class="doc-page__section-text">Events</span>
          <span class="doc-page__section-en">事件</span>
        </h2>
        <div class="doc-page__table-card">
          <el-table :data="meta.emits" size="default" class="doc-page__table">
            <el-table-column prop="name" label="事件" width="200" />
            <el-table-column prop="desc" label="说明" min-width="200" />
            <el-table-column prop="payload" label="参数" min-width="240" />
          </el-table>
        </div>
      </template>

      <template v-if="meta.slots?.length">
        <h2 class="doc-page__section">
          <span class="doc-page__section-no">03</span>
          <span class="doc-page__section-text">Slots</span>
          <span class="doc-page__section-en">插槽</span>
        </h2>
        <div class="doc-page__table-card">
          <el-table :data="meta.slots" size="default" class="doc-page__table">
            <el-table-column prop="name" label="插槽" width="200" />
            <el-table-column prop="desc" label="说明" min-width="220" />
            <el-table-column prop="params" label="作用域参数" min-width="200" />
          </el-table>
        </div>
      </template>

      <template v-if="meta.methods?.length">
        <h2 class="doc-page__section">
          <span class="doc-page__section-no">04</span>
          <span class="doc-page__section-text">Methods</span>
          <span class="doc-page__section-en">通过 ref 调用</span>
        </h2>
        <p class="doc-page__methods-tip">
          给组件加 <code>ref</code>，再通过 <code>ref.xxx()</code> 调用，例如
          <code>const grid = ref(); grid.value.refresh()</code>
        </p>
        <div class="doc-page__table-card">
          <el-table :data="meta.methods" size="default" class="doc-page__table">
            <el-table-column prop="name" label="方法" width="230" />
            <el-table-column prop="desc" label="说明" min-width="220" />
            <el-table-column prop="params" label="参数" min-width="180" />
            <el-table-column prop="returns" label="返回值" min-width="150" />
          </el-table>
        </div>
      </template>
    </section>

    <!-- 数据类型 -->
    <section v-if="meta.dataTypes?.length" class="doc-page__types">
      <h2 class="doc-page__section">
        <span class="doc-page__section-no">05</span>
        <span class="doc-page__section-text">Types</span>
        <span class="doc-page__section-en">数据类型</span>
      </h2>
      <p class="doc-page__types-tip">
        Props / Methods / Events 中出现的自定义数据类型，以源码 <code>code/src</code> 中的定义为准。
      </p>
      <div v-for="(t, i) in meta.dataTypes" :key="i" class="doc-page__type-item">
        <h3 class="doc-page__type-head">
          <span class="doc-page__type-name">{{ t.name }}</span>
          <span class="doc-page__type-ref" v-html="inline(t.ref)" />
        </h3>
        <p v-for="(d, j) in t.desc" :key="`d${j}`" class="doc-page__type-desc" v-html="inline(d)" />
        <div v-if="t.fields?.length" class="doc-page__table-card">
          <el-table :data="t.fields" size="default" class="doc-page__table">
            <el-table-column prop="name" label="字段" min-width="170" />
            <el-table-column prop="type" label="类型" min-width="170" />
            <el-table-column prop="required" label="必填" width="90" />
            <el-table-column prop="default" label="默认值" width="130" />
            <el-table-column prop="desc" label="说明" min-width="220" />
          </el-table>
        </div>
        <CodeBlock v-if="t.code" :code="t.code" lang="ts" class="doc-page__type-code" />
        <p v-for="(a, j) in t.after" :key="`a${j}`" class="doc-page__type-desc" v-html="inline(a)" />
      </div>
    </section>

    <!-- 最佳实践与注意事项 + FAQ -->
    <section v-if="meta.intro?.notes?.length" class="doc-page__notes">
      <h2 class="doc-page__section">
        <span class="doc-page__section-no">06</span>
        <span class="doc-page__section-text">Notes</span>
        <span class="doc-page__section-en">最佳实践与注意事项</span>
      </h2>
      <div class="doc-page__table-card doc-page__notes-card">
        <ul class="doc-page__intro-list">
          <li v-for="(item, i) in meta.intro!.notes" :key="i" v-html="inline(item)" />
        </ul>
      </div>
    </section>

    <section v-if="meta.intro?.faq?.length" class="doc-page__faq">
      <h2 class="doc-page__section">
        <span class="doc-page__section-no">07</span>
        <span class="doc-page__section-text">FAQ</span>
        <span class="doc-page__section-en">常见问题</span>
      </h2>
      <div class="doc-page__faq-list">
        <div
          v-for="(item, i) in meta.intro!.faq"
          :key="i"
          class="doc-page__faq-item"
          :class="{ 'is-open': openSet.has(i) }"
        >
          <button
            type="button"
            class="doc-page__faq-head"
            :aria-expanded="openSet.has(i)"
            @click="toggleFaq(i)"
          >
            <span class="doc-page__faq-badge">Q{{ i + 1 }}</span>
            <span class="doc-page__faq-q" v-html="inline(item.q)" />
            <span class="doc-page__faq-icon" aria-hidden="true" />
          </button>
          <div class="doc-page__faq-body">
            <div class="doc-page__faq-body-inner">
              <span class="doc-page__faq-badge doc-page__faq-badge--a">A</span>
              <p class="doc-page__faq-a" v-html="inline(item.a)" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { ComponentMeta } from '../api-meta'
import CodeBlock from './CodeBlock.vue'

defineProps<{ meta: ComponentMeta }>()

/** FAQ 展开状态：多开（与原 el-collapse 默认行为一致），Set 存已展开项下标 */
const openSet = reactive(new Set<number>())
function toggleFaq(i: number) {
  if (openSet.has(i)) openSet.delete(i)
  else openSet.add(i)
}

/** 行内渲染：先 HTML 转义，再把 `code` 反引号转为 <code>、**加粗** 转为 <strong>（数据源为本仓静态内容，无 XSS 风险） */
function inline(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}
</script>

<style scoped>
.doc-page {
  color: var(--wd-text-color-primary, #303133);
}

/* —— 页头 —— */
.doc-page__header {
  display: flex;
  align-items: stretch;
  gap: 14px;
  margin-bottom: 18px;
}
.doc-page__header-bar {
  flex: 0 0 4px;
  border-radius: 4px;
  background: linear-gradient(180deg, var(--wd-color-primary, #409eff), var(--el-color-primary-light-3, #79bbff));
}
.doc-page__heading {
  flex: 1;
  min-width: 0;
}
.doc-page__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.doc-page__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.2px;
  line-height: 1.3;
  color: var(--wd-text-color-primary, #303133);
}
.doc-page__name-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  border-radius: 6px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  color: var(--wd-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  border: 1px solid var(--el-color-primary-light-7, #d9ecff);
}
.doc-page__desc {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--wd-text-color-regular, #606266);
}

/* —— API 章节 —— */
.doc-page__api {
  margin-top: 26px;
}
.doc-page__section {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 24px 0 12px;
  font-size: 17px;
  font-weight: 650;
  color: var(--wd-text-color-primary, #303133);
}
.doc-page__section-no {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--wd-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  border: 1px solid var(--el-color-primary-light-7, #d9ecff);
  border-radius: 5px;
  padding: 2px 6px;
  transform: translateY(-1px);
}
.doc-page__section-text {
  font-family: 'SFMono-Regular', Consolas, monospace;
}
.doc-page__section-en {
  font-size: 12px;
  font-weight: 400;
  color: var(--wd-text-color-secondary, #909399);
}

/* —— 表格卡片 —— */
.doc-page__table-card {
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 10px;
  overflow: hidden;
  background: var(--wd-bg-color, #fff);
  box-shadow: 0 2px 10px rgba(13, 18, 30, 0.04);
  transition: box-shadow 0.25s ease;
}
.doc-page__table-card:hover {
  box-shadow: 0 6px 18px rgba(13, 18, 30, 0.07);
}
.doc-page__table {
  width: 100%;
}
.doc-page__table :deep(.el-table__cell) {
  padding: 10px 0;
}
.doc-page__table :deep(th.el-table__cell) {
  background: var(--wd-bg-color-page, #f5f7fa);
  color: var(--wd-text-color-regular, #606266);
  font-weight: 600;
}
.doc-page__table :deep(.cell) {
  line-height: 1.6;
}
/* 属性名 / 事件名等首列等宽风格 */
.doc-page__table :deep(.el-table__body tr td:first-child .cell) {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12.5px;
  color: var(--wd-color-primary, #409eff);
}

.doc-page__methods-tip {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--wd-text-color-regular, #606266);
}
.doc-page__methods-tip code {
  padding: 2px 6px;
  background: var(--wd-bg-color-page, #f4f4f5);
  border: 1px solid var(--wd-border-color-light, #e9ecf1);
  border-radius: 5px;
  color: var(--wd-color-primary, #409eff);
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
}

/* —— 组件介绍（概述 / 何时使用 / 注意事项 / FAQ） —— */
.doc-page__intro {
  margin: 4px 0 8px;
  padding: 14px 16px;
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-left: 4px solid var(--wd-color-primary, #409eff);
  border-radius: 10px;
  background: var(--wd-bg-color, #fff);
}
.doc-page__intro-overview {
  margin: 0;
  font-size: 14px;
  line-height: 1.85;
  color: var(--wd-text-color-regular, #606266);
}
.doc-page__intro-block {
  margin-top: 10px;
}
.doc-page__intro-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 650;
  color: var(--wd-text-color-primary, #303133);
}
.doc-page__intro-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--wd-text-color-regular, #606266);
}
.doc-page__intro code,
.doc-page__notes code,
.doc-page__faq code {
  padding: 1px 6px;
  background: var(--wd-bg-color-page, #f4f4f5);
  border: 1px solid var(--wd-border-color-light, #e9ecf1);
  border-radius: 5px;
  color: var(--wd-color-primary, #409eff);
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
}
.doc-page__notes-card {
  padding: 12px 16px;
}
/* —— 数据类型 —— */
.doc-page__types-tip {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--wd-text-color-regular, #606266);
}
.doc-page__type-item + .doc-page__type-item {
  margin-top: 24px;
}
.doc-page__type-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  margin: 0 0 8px;
}
.doc-page__type-name {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 14.5px;
  font-weight: 650;
  color: var(--wd-text-color-primary, #303133);
}
.doc-page__type-ref {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--wd-text-color-secondary, #909399);
}
.doc-page__type-desc {
  margin: 6px 0;
  font-size: 13px;
  line-height: 1.85;
  color: var(--wd-text-color-regular, #606266);
}
.doc-page__type-code {
  margin: 10px 0;
}
.doc-page__types-tip code,
.doc-page__types code {
  padding: 1px 6px;
  background: var(--wd-bg-color-page, #f4f4f5);
  border: 1px solid var(--wd-border-color-light, #e9ecf1);
  border-radius: 5px;
  color: var(--wd-color-primary, #409eff);
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
}
/* —— FAQ：台账式手风琴卡片（Q 徽章 + 圆钮 +/×，答案区浅 tint） —— */
.doc-page__faq-list {
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 10px;
  overflow: hidden;
  background: var(--wd-bg-color, #fff);
  box-shadow: 0 2px 10px rgba(13, 18, 30, 0.04);
  transition: box-shadow 0.25s ease;
}
.doc-page__faq-list:hover {
  box-shadow: 0 6px 18px rgba(13, 18, 30, 0.07);
}
.doc-page__faq-item + .doc-page__faq-item {
  border-top: 1px solid var(--wd-border-color-light, #ebeef5);
}
.doc-page__faq-head {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 13px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background 0.2s ease;
}
.doc-page__faq-head:hover {
  background: rgba(64, 158, 255, 0.05);
}
.doc-page__faq-head:focus-visible {
  outline: 2px solid var(--wd-color-primary, #409eff);
  outline-offset: -2px;
}
/* Q/A 徽章：等宽对齐（同 min-width），Q 浅蓝填充、A 描边对偶 */
.doc-page__faq-badge {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 20px;
  padding: 0 6px;
  box-sizing: border-box;
  border-radius: 5px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--wd-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  border: 1px solid var(--el-color-primary-light-7, #d9ecff);
}
.doc-page__faq-badge--a {
  margin-top: 2px;
  background: var(--wd-bg-color, #fff);
}
.doc-page__faq-q {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--wd-text-color-primary, #303133);
}
/* 右侧圆钮：+ 形，展开时填充主题色并旋转 45° 成 × */
.doc-page__faq-icon {
  position: relative;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--wd-border-color, #dcdfe6);
  transition:
    transform 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.25s ease,
    border-color 0.25s ease;
}
.doc-page__faq-icon::before,
.doc-page__faq-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 1.6px;
  border-radius: 1px;
  background: var(--wd-text-color-secondary, #909399);
  transform: translate(-50%, -50%);
  transition: background 0.25s ease;
}
.doc-page__faq-icon::after {
  transform: translate(-50%, -50%) rotate(90deg);
}
.doc-page__faq-head:hover .doc-page__faq-icon {
  border-color: var(--wd-color-primary, #409eff);
}
.doc-page__faq-head:hover .doc-page__faq-icon::before,
.doc-page__faq-head:hover .doc-page__faq-icon::after {
  background: var(--wd-color-primary, #409eff);
}
.doc-page__faq-item.is-open .doc-page__faq-icon {
  transform: rotate(45deg);
  background: var(--wd-color-primary, #409eff);
  border-color: var(--wd-color-primary, #409eff);
}
.doc-page__faq-item.is-open .doc-page__faq-icon::before,
.doc-page__faq-item.is-open .doc-page__faq-icon::after {
  background: #fff;
}
/* 展开动画：grid-template-rows 0fr→1fr + 答案淡入 */
.doc-page__faq-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}
.doc-page__faq-item.is-open .doc-page__faq-body {
  grid-template-rows: 1fr;
  background: rgba(64, 158, 255, 0.04);
}
.doc-page__faq-body-inner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 0;
  overflow: hidden;
  padding: 0 16px;
  opacity: 0;
  transition: opacity 0.25s ease 0.06s;
}
.doc-page__faq-item.is-open .doc-page__faq-body-inner {
  opacity: 1;
  padding-bottom: 15px;
}
.doc-page__faq-a {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--wd-text-color-regular, #606266);
}
@media (prefers-reduced-motion: reduce) {
  .doc-page__faq-body,
  .doc-page__faq-body-inner,
  .doc-page__faq-icon {
    transition: none;
  }
}
</style>
