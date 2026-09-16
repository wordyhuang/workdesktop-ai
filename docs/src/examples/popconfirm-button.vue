<template>
  <div class="example-page">
    <unpack-note>
      该组件点击后发起 API 请求，对返回数据中的 <code>data</code> 不做字段提取，而是把请求结果通过事件抛出：成功 <code>api-success</code> 携带 <code>{ data, code, message }</code>、业务失败 <code>api-fail</code> 携带 <code>{ code, message }</code>、异常 <code>api-exception</code> 携带 <code>{ error, message }</code>；其中 <code>data</code> 即后端返回的业务数据本体。
    </unpack-note>
    <demo-block
      title="基础用法"
      desc="点击按钮弹出气泡确认，确认后自动请求 API（api 与请求事件同 ApiButton）"
      :code="code1"
      layout="row"
    >
      <wd-popconfirm-button
        type="danger"
        label="删除用户"
        title="确认删除该用户？"
        api="/user"
        api-method="delete"
        :api-param="{ id: 1 }"
      />
      <wd-popconfirm-button
        type="primary"
        label="保存配置"
        title="确定保存当前配置？"
        api="/user/save"
        :api-param="{ id: 1 }"
      />
    </demo-block>

    <demo-block
      title="自定义文案与样式"
      desc="通过 popconfirm 集成属性定制确认/取消按钮文案、类型、弹层宽度与弹出位置；tips 提供悬停提示（hover 显示、click 确认，互不冲突）"
      :code="code2"
      layout="row"
    >
      <wd-popconfirm-button
        type="warning"
        label="禁用用户"
        title="确定禁用该用户？"
        confirm-button-text="禁用"
        cancel-button-text="再想想"
        confirm-button-type="danger"
        :width="180"
        api="/user/status"
        :api-param="{ id: 2, status: 0 }"
      />
      <wd-popconfirm-button
        label="悬停提示+确认"
        title="确定执行该操作？"
        tips="点击后需要二次确认"
        tips-type="dark"
        placement="bottom"
        api="/user/save"
        :api-param="{ id: 3 }"
      />
    </demo-block>

    <demo-block title="事件" desc="confirm/cancel 与 api 事件均可监听" :code="code3" layout="row">
      <wd-popconfirm-button
        label="确认并回调"
        title="确定执行该操作？"
        api="/user/save"
        :api-param="{ id: 4 }"
        @confirm="onConfirm"
        @cancel="onCancel"
        @api-success="onApiSuccess"
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const code1 = `<wd-popconfirm-button type="danger"
  label="删除用户" title="确认删除该用户？"
  api="/user" api-method="delete" :api-param="{ id: 1 }" />`

const code2 = `<wd-popconfirm-button label="禁用用户"
  title="确定禁用该用户？"
  confirm-button-text="禁用" cancel-button-text="再想想"
  confirm-button-type="danger" :width="180"
  api="/user/status" :api-param="{ id: 2, status: 0 }" />

<wd-popconfirm-button label="悬停提示+确认"
  title="确定执行该操作？"
  tips="点击后需要二次确认" tips-type="dark"
  placement="bottom"
  api="/user/save" :api-param="{ id: 3 }" />`

const code3 = `<wd-popconfirm-button label="确认并回调"
  title="确定执行该操作？"
  api="/user/save" :api-param="{ id: 4 }"
  @confirm="onConfirm" @cancel="onCancel"
  @api-success="onApiSuccess" />`

function onConfirm() {
  ElMessage.info('用户点击了确定，开始请求 API')
}
function onCancel() {
  ElMessage.info('用户点击了取消')
}
function onApiSuccess() {
  ElMessage.success('API 请求成功')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
