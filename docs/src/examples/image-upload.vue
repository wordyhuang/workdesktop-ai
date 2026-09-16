<template>
  <div class="example-page">
    <unpack-note>
      该组件上传成功后，按全局响应约定从返回数据的 <code>data</code> 中提取图片地址：<code>data</code> 为对象时取 <code>data.url</code> 或 <code>data.path</code>，为字符串时直接把 <code>data</code> 当作图片地址；<code>v-model</code> 收集所有图片地址组成 <code>string[]</code> 暴露，并通过 <code>api-success</code> 事件抛出 <code>{ data, raw }</code>。
    </unpack-note>
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

    <demo-block
      title="方法调用（ref）"
      desc="给 ImageUpload 加 ref，可外部清空图片列表"
      :code="code3"
    >
      <div class="method-bar">
        <el-button size="small" @click="callClear">clearFiles()</el-button>
      </div>
      <wd-image-upload
        ref="imgUploadRef"
        v-model="methodUrls"
        api="/file/upload"
        delete-api="/file"
        :max-count="5"
        thumbnail-size="90"
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const code1 = `<wd-image-upload v-model="urls" api="/file/upload"
  delete-api="/file" :max-count="5" thumbnail-size="90"
  tip="最多上传 5 张图片" />`

const code2 = `<wd-image-upload v-model="initUrls" api="/file/upload"
  delete-api="/file" :max-count="4" />`

const code3 = `<wd-image-upload ref="imgUploadRef" v-model="urls"
  api="/file/upload" delete-api="/file" :max-count="5" />

// 通过 ref 调用方法
const imgUploadRef = ref()
imgUploadRef.value.clearFiles()   // 清空图片列表`

const imgUploadRef = ref()
const methodUrls = ref<string[]>([])

function callClear() {
  imgUploadRef.value?.clearFiles()
  ElMessage.success('已清空图片列表')
}

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
.method-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
