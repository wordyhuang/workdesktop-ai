<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="v-model 控制显隐，方向/尺寸可配；关闭后触发 confirm 事件"
      :code="code1"
    >
      <el-button type="primary" @click="visible = true">打开抽屉</el-button>
      <el-button type="success" @click="topVisible = true">顶部抽屉</el-button>

      <wd-drawer v-model="visible" title="基础抽屉" size="40%">
        <p class="content-line">抽屉内容区域，可放置表单或任意内容。</p>
      </wd-drawer>

      <wd-drawer v-model="topVisible" title="顶部抽屉" direction="ttb" size="280px">
        <p class="content-line">direction=ttb 顶部滑出。</p>
      </wd-drawer>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const code1 = `<wd-drawer v-model="visible" title="基础抽屉" size="40%">
  <p>抽屉内容</p>
</wd-drawer>`

const visible = ref(false)
const topVisible = ref(false)
</script>

<style scoped>
.example-page {
  width: 100%;
}
.content-line {
  color: #606266;
  margin: 8px 0;
}
</style>
