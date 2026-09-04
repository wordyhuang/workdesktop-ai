<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="图片上传 + 缩略图，超 max-count 隐藏加号；点击缩略图集成 Viewer 大图预览"
      :code="code1"
    >
      <wd-image-upload
        v-model="urls"
        api="/file/upload"
        delete-api="/file"
        :max-count="5"
        thumbnail-size="90"
        tip="最多上传 5 张图片"
      />
      <div class="current">已上传 {{ urls.length }} 张</div>
    </demo-block>

    <demo-block
      title="初始回显"
      desc="通过 v-model 传入已上传图片地址数组，展示缩略图并支持删除"
      :code="code2"
    >
      <wd-image-upload
        v-model="initUrls"
        api="/file/upload"
        delete-api="/file"
        :max-count="4"
        thumbnail-size="80"
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const code1 = `<wd-image-upload v-model="urls" api="/file/upload"
  delete-api="/file" :max-count="5" thumbnail-size="90"
  tip="最多上传 5 张图片" />`

const code2 = `<wd-image-upload v-model="initUrls" api="/file/upload"
  delete-api="/file" :max-count="4" />`

const urls = ref<string[]>([])
const initUrls = ref<string[]>([
  'https://picsum.photos/seed/wd-doc-1/200/120',
  'https://picsum.photos/seed/wd-doc-2/200/120',
  'https://picsum.photos/seed/wd-doc-3/200/120'
])
</script>

<style scoped>
.example-page {
  width: 100%;
}
.current {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
}
</style>
