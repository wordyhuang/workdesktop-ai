<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="API 自动加载选项，v-model 绑定选中值"
      :code="code1"
    >
      <wd-radio-list
        v-model="value"
        :data-source="options"
      />
      <div class="current">当前选中：{{ value }}</div>
    </demo-block>

    <demo-block
      title="按钮样式 + 前后追加"
      desc="button-style 切换按钮组；addData 前插固定项"
      :code="code2"
    >
      <wd-radio-list
        v-model="value"
        :data-source="options"
        :add-data="[{ value: 0, text: '不限' }]"
        button-style
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const code1 = `<wd-radio-list v-model="value"
  :data-source="options" />`
const code2 = `<wd-radio-list v-model="value"
  :data-source="options"
  :add-data="[{ value: 0, text: '不限' }]"
  button-style />`

const options = [
  { value: 1, text: '启用' },
  { value: 2, text: '停用' },
  { value: 3, text: '归档' }
]
const value = ref(1)
</script>

<style scoped>
.example-page {
  width: 100%;
}
.current {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
}
</style>
