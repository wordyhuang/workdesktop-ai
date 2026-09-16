<template>
  <div class="example-page">
    <demo-block
      title="路由跳转"
      desc="基于 el-button 的路由跳转；无 vue-router 环境自动退化到 location"
      :code="code1"
      layout="row"
    >
      <wd-route-button
        type="primary"
        label="当前页跳转"
        route-path="/user/detail"
        :query="{ id: 1 }"
      />
      <wd-route-button
        type="success"
        label="新窗口打开"
        route-path="/user/detail"
        :query="{ id: 2 }"
        target="_blank"
      />
    </demo-block>

    <demo-block
      title="只触发事件"
      desc="不配置路由时仅触发 click，可自由扩展"
      :code="code2"
      layout="row"
    >
      <wd-route-button label="自定义跳转逻辑" @click="customJump" />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const code1 = `<wd-route-button type="primary" label="当前页跳转"
  route-path="/user/detail" :query="{ id: 1 }" />`

const code2 = `<wd-route-button label="自定义跳转逻辑" @click="customJump" />`

function customJump() {
  ElMessage.info('此处可写自定义路由逻辑')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
