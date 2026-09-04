<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="点击弹出输入框，输入值并入请求参数（param-key 指定字段名）后发起请求"
      :code="code1"
      layout="row"
    >
      <wd-prompt-button
        type="primary"
        text="重命名"
        prompt-title="请输入新名称"
        prompt-placeholder="例如：新项目名"
        param-key="name"
        api="/user/save"
        :api-param="{ id: 1 }"
      />
      <wd-prompt-button
        text="备注"
        prompt-title="添加备注"
        param-key="remark"
        api="/user/save"
        :api-param="{ id: 2 }"
      />
    </demo-block>

    <demo-block title="事件" desc="prompt 事件携带输入值" :code="code2">
      <wd-prompt-button text="输入并回调" prompt-title="请输入内容" @prompt="onPrompt" />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const code1 = `<wd-prompt-button text="重命名"
  prompt-title="请输入新名称" param-key="name"
  api="/user/save" :api-param="{ id: 1 }" />`

const code2 = `<wd-prompt-button text="输入并回调"
  prompt-title="请输入内容" @prompt="onPrompt" />`

function onPrompt(value: string) {
  ElMessage.success(`输入内容：${value}`)
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
