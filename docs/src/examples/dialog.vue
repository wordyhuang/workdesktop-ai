<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="v-model 控制显隐，content 通过默认插槽传入；关闭前确认可选"
      :code="code1"
    >
      <el-button type="primary" @click="visible = true">打开对话框</el-button>
      <el-button type="success" @click="confirmVisible = true">带关闭确认</el-button>

      <wd-dialog v-model="visible" title="基础对话框" width="480px">
        <p class="content-line">这是对话框内容区域，支持任意插槽内容。</p>
      </wd-dialog>

      <wd-dialog
        v-model="confirmVisible"
        title="关闭确认"
        width="420px"
        confirm-message="确认关闭？有未保存内容将丢失。"
      >
        <p class="content-line">点击 X / 遮罩 / ESC 会触发关闭前确认。</p>
      </wd-dialog>
    </demo-block>

    <demo-block
      title="iframe 模式"
      desc="设置 url 后对话框内以 iframe 加载，data 会拼为 query 传递"
      :code="code2"
    >
      <el-button type="warning" @click="iframeVisible = true">打开 iframe 对话框</el-button>
      <wd-dialog v-model="iframeVisible" title="内嵌页面" :data="{ token: 'demo' }">
        <iframe
          src="https://www.example.com"
          style="width: 100%; height: 60vh; border: 0"
          title="example"
        />
      </wd-dialog>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const code1 = `<wd-dialog v-model="visible" title="基础对话框">
  <p>对话框内容</p>
</wd-dialog>`

const code2 = `<wd-dialog v-model="visible" title="内嵌页面" :data="{ token: 'demo' }">
  <iframe src="https://www.example.com" />
</wd-dialog>`

const visible = ref(false)
const confirmVisible = ref(false)
const iframeVisible = ref(false)
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
