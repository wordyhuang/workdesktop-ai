<template>
  <div class="example-page">
    <demo-block
      title="图片预览"
      desc="点击按钮打开 Viewer，支持缩放/旋转/翻页（图片数组轮播），键盘方向键控制"
      :code="code1"
      layout="row"
    >
      <el-button type="primary" @click="openViewer(0)">预览图片</el-button>
      <el-button type="success" @click="openViewer(1)">从第 2 张开始</el-button>
    </demo-block>

    <demo-block
      title="PDF / 文档"
      desc="type=pdf 用 iframe 预览；doc 类型新窗口打开阅读"
      :code="code2"
      layout="row"
    >
      <el-button @click="openPdf">预览 PDF</el-button>
      <el-button @click="openDoc">打开文档</el-button>
    </demo-block>

    <wd-viewer
      v-model="viewerVisible"
      :src="viewerSrc"
      :type="viewerType"
      :page="viewerPage"
      @zoom-change="(z: number) => onZoom(z)"
      @page-change="(p: number) => onPage(p)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const code1 = `<el-button @click="viewerVisible = true">预览图片</el-button>
<wd-viewer v-model="viewerVisible" :src="images" type="image" />`
const code2 = `<wd-viewer v-model="visible" :src="pdfUrl" type="pdf" />`

const images = [
  'https://picsum.photos/seed/wd-viewer-1/800/500',
  'https://picsum.photos/seed/wd-viewer-2/800/500',
  'https://picsum.photos/seed/wd-viewer-3/800/500'
]

const viewerVisible = ref(false)
const viewerSrc = ref<string | string[]>(images)
const viewerType = ref<'image' | 'pdf' | 'doc'>('image')
const viewerPage = ref(1)

function openViewer(page: number) {
  viewerSrc.value = images
  viewerType.value = 'image'
  viewerPage.value = page + 1
  viewerVisible.value = true
}

function openPdf() {
  viewerSrc.value = 'https://www.w3.org/WHO/1996/06/04/www.w3.org.pdf'
  viewerType.value = 'pdf'
  viewerVisible.value = true
}

function openDoc() {
  viewerSrc.value = 'https://www.example.com/docs/help.html'
  viewerType.value = 'doc'
  viewerVisible.value = true
}

function onZoom(z: number) {
  ElMessage.info(`缩放：${Math.round(z * 100)}%`)
}
function onPage(p: number) {
  viewerPage.value = p
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
