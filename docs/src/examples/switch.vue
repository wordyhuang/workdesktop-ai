<template>
  <div class="example-page">
    <unpack-note>
      该组件通过 <code>api</code> 提交开关状态，对返回数据中的 <code>data</code> 不做字段提取（开关状态由 <code>v-model</code> 维护，失败自动回滚）；请求结果通过 <code>api-success</code> / <code>api-after</code> 事件携带 <code>data</code> 抛出。
    </unpack-note>
    <demo-block
      title="切换即请求"
      desc="开关切换自动提交请求（param-key 指定字段），失败自动回滚"
      :code="code1"
      layout="row"
    >
      <wd-switch
        v-model="status"
        :api="'/user/status'"
        :api-param="{ id: 1 }"
        param-key="status"
        :active-value="1"
        :inactive-value="0"
        tips="切换后自动提交状态"
      />
      <span class="current">当前状态：{{ status === 1 ? '启用' : '禁用' }}</span>
    </demo-block>

    <demo-block
      title="无接口模式"
      desc="未配置 api 时仅本地切换，不发请求"
      :code="code2"
      layout="row"
    >
      <wd-switch v-model="plain" />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const code1 = `<wd-switch v-model="status"
  api="/user/status" :api-param="{ id: 1 }"
  param-key="status" :active-value="1" :inactive-value="0" />`
const code2 = `<wd-switch v-model="plain" />`

const status = ref(1)
const plain = ref(true)
</script>

<style scoped>
.example-page {
  width: 100%;
}
.current {
  margin-left: 16px;
  font-size: 13px;
  color: #606266;
}
</style>
