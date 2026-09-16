<template>
  <div class="example-page">
    <unpack-note>
      该组件点击后发起 API 请求，对返回数据中的 <code>data</code> 不做字段提取，而是把请求结果通过事件抛出：成功 <code>api-success</code> 携带 <code>{ data, code, message }</code>、业务失败 <code>api-fail</code> 携带 <code>{ code, message }</code>、异常 <code>api-exception</code> 携带 <code>{ error, message }</code>；其中 <code>data</code> 即后端返回的业务数据本体。
    </unpack-note>
    <demo-block
      title="基础用法"
      desc="点击弹出输入框，输入值并入请求参数（param-key 指定字段名）后发起请求"
      :code="code1"
      layout="row"
    >
      <wd-prompt-button
        type="primary"
        label="重命名"
        prompt-title="请输入新名称"
        prompt-placeholder="例如：新项目名"
        param-key="name"
        api="/user/save"
        :api-param="{ id: 1 }"
      />
      <wd-prompt-button
        label="备注"
        prompt-title="添加备注"
        param-key="remark"
        api="/user/save"
        :api-param="{ id: 2 }"
      />
    </demo-block>

    <demo-block title="自定义内容（使用 DataForm）" desc="通过 #content 插槽自定义弹窗内容，支持多字段表单。点击确认后自动请求 API，API 成功自动关闭弹窗，失败保留弹窗可修改" :code="code3" layout="row">
      <wd-prompt-button
        type="primary"
        label="新增用户"
        prompt-title="新增用户"
        api="/user/add"
      >
        <template #content>
          <wd-data-form :data="formData" :items="formItems" />
        </template>
      </wd-prompt-button>
    </demo-block>

    <demo-block title="事件" desc="prompt 事件携带输入值" :code="code2" layout="row">
      <wd-prompt-button label="输入并回调" prompt-title="请输入内容" @prompt="onPrompt" />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'

const code1 = `<wd-prompt-button label="重命名"
  prompt-title="请输入新名称" param-key="name"
  api="/user/save" :api-param="{ id: 1 }" />`

const code2 = `<wd-prompt-button label="输入并回调"
  prompt-title="请输入内容" @prompt="onPrompt" />`

const code3 = `<wd-prompt-button
  type="primary"
  label="新增用户"
  prompt-title="新增用户"
  api="/user/add"
>
  <template #content>
    <wd-data-form :data="formData" :items="formItems" />
  </template>
</wd-prompt-button>`

function onPrompt(value: string) {
  ElMessage.success(`输入内容：${value}`)
}

// 自定义内容示例：DataForm 多字段
const formData = reactive({
  name: '',
  department: '',
  email: ''
})

const formItems = [
  { label: '姓名', prop: 'name', type: 'input', required: true },
  { label: '部门', prop: 'department', type: 'select', options: [
    { label: '技术部', value: 'tech' },
    { label: '产品部', value: 'product' }
  ]},
  { label: '邮箱', prop: 'email', type: 'input' }
]
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
