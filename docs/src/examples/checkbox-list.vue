<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="API 自动加载选项，v-model 绑定选中值数组"
      :code="code1"
    >
      <wd-checkbox-list
        v-model="value"
        :data-source="options"
      />
      <div class="current">当前选中：{{ value }}</div>
    </demo-block>

    <demo-block
      title="按钮样式"
      desc="button-style 切换为按钮组形态"
      :code="code2"
    >
      <wd-checkbox-list
        v-model="value2"
        :data-source="options"
        button-style
      />
      <div class="current">当前选中：{{ value2 }}</div>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const code1 = `<wd-checkbox-list v-model="value"
  :data-source="options" />`
const code2 = `<wd-checkbox-list v-model="value"
  :data-source="options" button-style />`

const options = [
  { value: 'vue', text: 'Vue' },
  { value: 'react', text: 'React' },
  { value: 'angular', text: 'Angular' }
]
const value = ref(['vue'])
const value2 = ref(['vue', 'react'])
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
