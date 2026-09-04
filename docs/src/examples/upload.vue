<template>
  <div class="example-page">
    <demo-block
      title="自动上传"
      desc="选择即上传（api=/file/upload），删除需二次确认且调用后端删除接口"
      :code="code1"
    >
      <wd-upload
        api="/file/upload"
        delete-api="/file"
        :limit="3"
        :multiple="true"
        accept=".png,.jpg,.xlsx,.xls,.csv,.pdf"
        button-text="选择文件"
      />
    </demo-block>

    <demo-block
      title="手动提交"
      desc="auto-upload=false 先选文件，点击「开始上传」统一提交；max-size 限制大小"
      :code="code2"
    >
      <wd-upload
        api="/file/upload"
        delete-api="/file"
        :auto-upload="false"
        :limit="5"
        :multiple="true"
        :max-size="10"
        button-text="选择文件"
        submit-button-text="开始上传"
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
const code1 = `<wd-upload api="/file/upload" delete-api="/file"
  :limit="3" :multiple="true" accept=".xlsx,.xls,.csv,.png,.jpg,.pdf"
  button-text="选择文件" />`

const code2 = `<wd-upload api="/file/upload" delete-api="/file"
  :auto-upload="false" :limit="5" :multiple="true" :max-size="10"
  button-text="选择文件" submit-button-text="开始上传" />`
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
