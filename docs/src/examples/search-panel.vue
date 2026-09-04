<template>
  <div class="example-page">
    <demo-block
      title="搜索联动"
      desc="SearchPanel 与 DataGrid 配置同 filter，查询/重置自动刷新表格（查询重置到第一页、异组不刷新）"
      :code="code1"
    >
      <wd-search-panel
        head-refresh-datagrid
        filter="panel-demo"
        collapsible
        @search="onSearch"
        @reset="onReset"
      >
        <template #default="{ model }">
          <el-form-item label="姓名">
            <el-input v-model="model.name" clearable placeholder="模糊搜索" style="width: 200px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="model.status" clearable placeholder="全部" style="width: 120px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </template>
      </wd-search-panel>

      <wd-data-grid
        api="/user/list"
        :active="true"
        filter="panel-demo"
        :with-pager="false"
        :with-index="true"
      >
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="dept" label="部门" width="110" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </wd-data-grid>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const code1 = `<wd-search-panel head-refresh-datagrid filter="main">
  <template #default="{ model }">
    <el-form-item label="姓名">
      <el-input v-model="model.name" />
    </el-form-item>
  </template>
</wd-search-panel>

<wd-data-grid api="/user/list" :active="true" filter="main">
  <el-table-column prop="name" label="姓名" />
</wd-data-grid>`

function onSearch(params: Record<string, any>) {
  ElMessage.info(`查询参数：${JSON.stringify(params)}`)
}
function onReset() {
  ElMessage.info('已重置')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
