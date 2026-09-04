<template>
  <div class="doc-page">
    <div class="doc-page__header">
      <h1 class="doc-page__title">{{ meta.title }}</h1>
      <el-tag size="small" type="info">{{ meta.name }}</el-tag>
    </div>
    <p class="doc-page__desc">{{ meta.desc }}</p>

    <!-- 示例区 -->
    <slot name="examples" />

    <!-- API 表格 -->
    <h2 class="doc-page__section">Props</h2>
    <el-table :data="meta.props" border size="small" class="doc-page__table">
      <el-table-column prop="name" label="属性" width="180" />
      <el-table-column prop="desc" label="说明" min-width="220" />
      <el-table-column prop="type" label="类型" min-width="200" />
      <el-table-column prop="default" label="默认值" width="150" />
    </el-table>

    <template v-if="meta.emits?.length">
      <h2 class="doc-page__section">Events</h2>
      <el-table :data="meta.emits" border size="small" class="doc-page__table">
        <el-table-column prop="name" label="事件" width="200" />
        <el-table-column prop="desc" label="说明" min-width="200" />
        <el-table-column prop="payload" label="参数" min-width="240" />
      </el-table>
    </template>

    <template v-if="meta.slots?.length">
      <h2 class="doc-page__section">Slots</h2>
      <el-table :data="meta.slots" border size="small" class="doc-page__table">
        <el-table-column prop="name" label="插槽" width="200" />
        <el-table-column prop="desc" label="说明" min-width="220" />
        <el-table-column prop="params" label="作用域参数" min-width="200" />
      </el-table>
    </template>

    <template v-if="meta.expose?.length">
      <h2 class="doc-page__section">Methods</h2>
      <el-tag v-for="m in meta.expose" :key="m" class="doc-page__method" type="success" effect="plain">
        {{ m }}
      </el-tag>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ComponentMeta } from '../api-meta'

defineProps<{ meta: ComponentMeta }>()
</script>

<style scoped>
.doc-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.doc-page__title {
  margin: 0;
  font-size: 22px;
  color: #303133;
}
.doc-page__desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.7;
  margin: 0 0 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}
.doc-page__section {
  font-size: 17px;
  margin: 28px 0 12px;
  color: #303133;
}
.doc-page__table {
  width: 100%;
}
.doc-page__method {
  margin: 0 8px 8px 0;
}
</style>
