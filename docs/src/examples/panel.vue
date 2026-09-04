<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="带标题/描述的面板，作为表单分组与详情分区容器"
      :code="code1"
    >
      <wd-panel title="基本信息" description="用户基础资料">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">张三</el-descriptions-item>
          <el-descriptions-item label="部门">技术部</el-descriptions-item>
          <el-descriptions-item label="邮箱">zhangsan@example.com</el-descriptions-item>
        </el-descriptions>
      </wd-panel>

      <wd-panel title="自定义插槽" description="title 与 footer 插槽">
        <template #title>
          <span style="color: #409eff">自定义标题</span>
          <el-tag size="small" style="margin-left: 8px">标签</el-tag>
        </template>
        <p>面板主体内容。</p>
        <template #footer>
          <el-button size="small" type="primary">操作按钮</el-button>
        </template>
      </wd-panel>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
const code1 = `<wd-panel title="基本信息" description="用户基础资料">
  <el-descriptions :column="2" border>
    <el-descriptions-item label="姓名">张三</el-descriptions-item>
  </el-descriptions>
</wd-panel>`
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
