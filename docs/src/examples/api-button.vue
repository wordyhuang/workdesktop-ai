<template>
  <div class="example-page">
    <unpack-note>
      该组件点击后发起 API 请求，对返回数据中的 <code>data</code> 不做字段提取，而是把请求结果通过事件抛出：成功 <code>api-success</code> 携带 <code>{ data, code, message }</code>、业务失败 <code>api-fail</code> 携带 <code>{ code, message }</code>、异常 <code>api-exception</code> 携带 <code>{ error, message }</code>；其中 <code>data</code> 即后端返回的业务数据本体。
    </unpack-note>
    <demo-block title="基础用法" desc="点击发起请求，自动 loading 与成功提示；无 api 时仅触发 click" :code="code1" layout="row">
      <wd-api-button type="primary" label="保存配置" api="/user/save" :api-param="{ id: 1 }" />
      <wd-api-button type="success" label="触发导出" api="/user/export" />
      <wd-api-button label="无接口按钮（仅事件）" @click="onClick" />
    </demo-block>

    <demo-block title="页面级 loading" desc="page-loading 开启全局遮罩 ElLoading，适合慢请求" :code="code2" layout="row">
      <wd-api-button type="warning" label="页面遮罩请求" api="/user/list" :page-loading="true" />
    </demo-block>

    <demo-block title="按钮组（el-button-group）"
      desc="所有 Wd 按钮组件均可在 el-button-group 中连排使用，圆角衔接、边框合并、类型分割色与点击能力与原生 el-button 一致" :code="code3" layout="row">
      <el-button-group>
        <wd-api-button type="primary" label="保存" api="/user/save" :api-param="{ id: 1 }" />
        <wd-confirm-button label="删除" confirm-text="确认删除该用户？" api="/user" api-method="delete" :api-param="{ id: 2 }" />
        <wd-popconfirm-button label="气泡删除" title="确定删除该用户？" api="/user" api-method="delete" :api-param="{ id: 3 }" />
        <wd-tips-button label="提示" tips="基于 el-tooltip 的提示按钮" />
        <wd-drawer-button label="详情" title="用户详情" size="60%">
          <div>详情内容（抽屉 / 对话框内渲染）</div>
        </wd-drawer-button>
      </el-button-group>
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

const code3 = `<el-button-group>
  <wd-api-button type="primary" label="保存" api="/user/save" :api-param="{ id: 1 }" />
  <wd-confirm-button label="删除" confirm-text="确认删除该用户？"
    api="/user" api-method="delete" :api-param="{ id: 2 }" />
  <wd-popconfirm-button label="气泡删除" title="确定删除该用户？"
    api="/user" api-method="delete" :api-param="{ id: 3 }" />
  <wd-tips-button label="提示" tips="基于 el-tooltip 的提示按钮" />
  <wd-drawer-button label="详情" title="用户详情" size="60%">
    详情内容（抽屉 / 对话框内渲染）
  </wd-drawer-button>
</el-button-group>`

function onClick() {
  ElMessage.info('触发了 click 事件')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
