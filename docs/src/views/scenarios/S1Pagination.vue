<template>
  <div class="scenario-page">
    <wd-panel title="分页数据展示" description="场景：列表页常见形态 —— 搜索面板 + API 数据表格 + 分页，声明式联动">
      <wd-search-panel head-refresh-datagrid filter="s1" collapsible>
        <template #default="{ model }">
          <el-form-item label="关键字">
            <el-input v-model="model.name" placeholder="姓名 / 邮箱" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="部门">
            <el-select v-model="model.dept" clearable placeholder="全部" style="width: 150px">
              <el-option v-for="d in depts" :key="d" :label="d" :value="d" />
            </el-select>
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
        filter="s1"
        :tools="{ refresh: true, size: true }"
      >
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="dept" label="部门" width="110" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">{{ roleText(row.role) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="createTime" label="创建时间" min-width="110" />
      </wd-data-grid>
    </wd-panel>
  </div>
</template>

<script setup lang="ts">
function roleText(role: number) {
  return { 1: '管理员', 2: '编辑', 3: '访客' }[role] || '未知'
}
const depts = ['技术部', '产品部', '设计部', '市场部', '运营部']
</script>

<style scoped>
.scenario-page {
  width: 100%;
}
</style>
