<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="点击弹出二次确认，确认后才发起请求；文案可配"
      :code="code1"
      layout="row"
    >
      <wd-confirm-button
        type="danger"
        text="删除用户"
        confirm-text="确认删除该用户？此操作不可恢复。"
        api="/user"
        :api-method="'delete'"
        :api-param="{ id: 1 }"
      />
      <wd-confirm-button
        type="warning"
        text="自定义标题"
        confirm-title="危险操作"
        confirm-text="确定要执行该操作吗？"
        api="/user/save"
        :api-param="{ id: 2 }"
      />
    </demo-block>

    <demo-block title="事件" desc="confirm / cancel 事件监听" :code="code2">
      <wd-confirm-button
        type="primary"
        text="带事件回调"
        confirm-text="确定执行？"
        @confirm="onConfirm"
        @cancel="onCancel"
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const code1 = `<wd-confirm-button type="danger"
  text="删除用户" confirm-text="确认删除该用户？"
  api="/user" :api-method="'delete'" :api-param="{ id: 1 }" />`

const code2 = `<wd-confirm-button text="带事件回调"
  @confirm="onConfirm" @cancel="onCancel" />`

function onConfirm() {
  ElMessage.success('用户已确认')
}
function onCancel() {
  ElMessage.info('用户已取消')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
