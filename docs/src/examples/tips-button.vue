<template>
  <div class="example-page">
    <demo-block
      title="悬停提示"
      desc="基于 el-tooltip，主题与弹出位置可配"
      :code="code1"
      layout="row"
    >
      <wd-tips-button type="primary" text="深色提示" tips="这是一条深色主题提示" />
      <wd-tips-button type="success" text="浅色提示" tips="这是一条浅色主题提示" tips-type="light" />
      <wd-tips-button type="warning" text="右侧提示" tips="从右侧弹出" placement="right" />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
const code1 = `<wd-tips-button type="primary" text="深色提示"
  tips="这是一条深色主题提示" />
<wd-tips-button type="success" text="浅色提示"
  tips="浅色主题提示" tips-type="light" />
<wd-tips-button type="warning" text="右侧提示"
  tips="从右侧弹出" placement="right" />`
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
