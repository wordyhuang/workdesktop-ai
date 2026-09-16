<template>
  <div class="example-page">
    <unpack-note>
      该组件上传成功后，按全局响应约定从返回数据的 <code>data</code> 中提取文件信息：整个 <code>data</code> 挂在文件的 <code>biz</code> 上，并取 <code>data.url</code> 或 <code>data.path</code> 作为文件回显地址；随后通过 <code>v-model</code>（文件列表）与 <code>api-success</code> 事件（<code>{ data, raw }</code>）暴露给使用方。删除时按 <code>primary-key</code>（默认 <code>id</code>）从 <code>data</code> 取主键调用删除接口。
    </unpack-note>
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

    <demo-block
      title="方法调用（ref）"
      desc="给 Upload 加 ref，可外部触发上传、清空文件列表；addFile 可追加外部文件记录（如表单回显）"
      :code="code3"
    >
      <div class="method-bar">
        <el-button size="small" type="primary" @click="callSubmit">submitUpload()</el-button>
        <el-button size="small" @click="callClear">clearFiles()</el-button>
      </div>
      <wd-upload
        ref="uploadRef"
        api="/file/upload"
        delete-api="/file"
        :auto-upload="false"
        :limit="5"
        :multiple="true"
        button-text="选择文件"
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const uploadRef = ref()

function callSubmit() {
  uploadRef.value?.submitUpload()
  ElMessage.success('已触发上传')
}
function callClear() {
  uploadRef.value?.clearFiles()
  ElMessage.success('已清空文件列表')
}

const code1 = `<wd-upload api="/file/upload" delete-api="/file"
  :limit="3" :multiple="true" accept=".xlsx,.xls,.csv,.png,.jpg,.pdf"
  button-text="选择文件" />`

const code2 = `<wd-upload api="/file/upload" delete-api="/file"
  :auto-upload="false" :limit="5" :multiple="true" :max-size="10"
  button-text="选择文件" submit-button-text="开始上传" />`

const code3 = `<wd-upload ref="uploadRef" api="/file/upload" delete-api="/file"
  :auto-upload="false" :limit="5" :multiple="true" button-text="选择文件" />

// 通过 ref 调用方法
const uploadRef = ref()
uploadRef.value.submitUpload()                       // 手动触发上传（auto-upload=false 时）
uploadRef.value.clearFiles()                         // 清空文件列表
uploadRef.value.addFile({ name: 'a.pdf', url: '...' })  // 追加外部文件记录（如表单回显）`
</script>

<style scoped>
.example-page {
  width: 100%;
}
.method-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
