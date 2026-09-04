<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="点击打开对话框，可嵌入 iframe 或任意内容"
      :code="code1"
      layout="row"
    >
      <wd-dialog-button
        type="primary"
        text="打开对话框"
        dialog-title="通知"
      >
        <div class="dialog-content">
          <p>这是一个通过 DialogButton 打开的对话框。</p>
          <p>内部可以放任意内容，包括 DataForm、表格等。</p>
        </div>
      </wd-dialog-button>

      <wd-dialog-button
        type="success"
        text="iframe 对话框"
        dialog-title="内嵌页面"
        dialog-url="https://www.example.com"
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
const code1 = `<wd-dialog-button type="primary" text="打开对话框"
  dialog-title="通知">
  <p>任意内容</p>
</wd-dialog-button>

<wd-dialog-button type="success" text="iframe 对话框"
  dialog-title="内嵌页面" dialog-url="https://www.example.com" />`
</script>

<style scoped>
.example-page {
  width: 100%;
}
.dialog-content p {
  margin: 8px 0;
  color: #606266;
}
</style>
