<template>
  <div class="scenario-page">
    <wd-panel title="数据导入" description="场景：文件上传导入 —— Upload 组件自动上传，二次确认删除，成功后联动刷新">
      <wd-upload
        api="/file/upload"
        delete-api="/file"
        :limit="5"
        :multiple="true"
        accept=".xlsx,.xls,.csv,.png,.jpg,.pdf"
        button-text="选择文件上传"
      />
      <div class="tip">支持批量上传；删除需二次确认，且会调用后端删除接口。</div>
    </wd-panel>

    <wd-panel title="图片上传" description="场景：图片素材上传 —— ImageUpload 缩略图 + 数量限制 + 大图预览">
      <wd-image-upload
        api="/file/upload"
        delete-api="/file"
        :max-count="6"
        thumbnail-size="90"
        tip="最多上传 6 张图片，点击缩略图可放大预览"
      />
    </wd-panel>

    <wd-panel title="数据导出" description="场景：一键导出 —— ApiButton 请求导出接口，成功后自动提示并刷新表格">
      <wd-api-button
        type="success"
        text="导出用户数据"
        icon="Download"
        api="/user/export"
      />
      <div class="tip">点击后调用 /user/export 接口，成功提示；可配合 headRefreshDatagrid 联动刷新。</div>
    </wd-panel>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.scenario-page {
  width: 100%;
}
.tip {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}
</style>
