<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="点击发起请求，自动 loading 与成功提示；无 api 时仅触发 click"
      :code="code1"
      layout="row"
    >
      <wd-api-button type="primary" text="保存配置" api="/user/save" :api-param="{ id: 1 }" />
      <wd-api-button type="success" text="触发导出" api="/user/export" />
      <wd-api-button text="无接口按钮（仅事件）" @click="onClick" />
    </demo-block>

    <demo-block
      title="页面级 loading"
      desc="page-loading 开启全局遮罩 ElLoading，适合慢请求"
      :code="code2"
    >
      <wd-api-button type="warning" text="页面遮罩请求" api="/user/list" :page-loading="true" />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const code1 = `<wd-api-button type="primary" api="/user/save" :api-param="{ id: 1 }">
  保存配置
</wd-api-button>`

const code2 = `<wd-api-button type="warning" api="/user/list" :page-loading="true">
  页面遮罩请求
</wd-api-button>`

function onClick() {
  ElMessage.info('触发了 click 事件')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
