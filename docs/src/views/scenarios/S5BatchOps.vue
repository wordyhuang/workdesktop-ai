<template>
  <div class="scenario-page">
    <wd-panel title="批量操作" description="场景：表格多选 + 批量启用/禁用/删除，操作完成后刷新表格">
      <wd-data-grid
        ref="gridRef"
        api="/user/list"
        :active="true"
        filter="s5"
        :with-selection="true"
        :tools="{ refresh: true }"
        @selection-change="onSelectionChange"
      >
        <template #toolbar>
          <el-button type="success" plain :disabled="!selection.length" @click="batch('enable')">
            批量启用
          </el-button>
          <el-button type="warning" plain :disabled="!selection.length" @click="batch('disable')">
            批量禁用
          </el-button>
          <el-button type="danger" plain :disabled="!selection.length" @click="batch('remove')">
            批量删除
          </el-button>
        </template>

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
      </wd-data-grid>
    </wd-panel>

    <wd-panel title="可编辑表格" description="场景：单元格编辑 + 校验 + 批量保存（无 saveApi 时本地提交并 emit save）">
      <wd-editable-table
        :columns="editableColumns"
        :model-value="editableRows"
        :with-index="true"
        save-button-text="保存修改"
        @save="onTableSave"
      />
    </wd-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { request, refreshDataGrid } from '../../../../src'
import { ElMessage } from 'element-plus'

function roleText(role: number) {
  return { 1: '管理员', 2: '编辑', 3: '访客' }[role] || '未知'
}

const gridRef = ref()
const selection = ref<any[]>([])

function onSelectionChange(rows: any[]) {
  selection.value = rows
}

async function batch(action: 'enable' | 'disable' | 'remove') {
  const ids = selection.value.map((r) => r.id)
  if (!ids.length) return
  const result = await request.post('/user/batch', { ids, action })
  if (result.success) {
    ElMessage.success(`批量操作完成（${ids.length} 条）`)
    refreshDataGrid('s5')
  }
}

// ---- 可编辑表格 ----
const editableColumns = [
  { prop: 'name', label: '任务名称', editor: 'input', required: true },
  { prop: 'owner', label: '负责人', editor: 'input', required: true },
  {
    prop: 'priority',
    label: '优先级',
    editor: 'select',
    options: [
      { text: '高', value: '高' },
      { text: '中', value: '中' },
      { text: '低', value: '低' }
    ],
    required: true
  },
  { prop: 'progress', label: '进度(%)', editor: 'number', min: 0, max: 100, required: true }
]
const editableRows = ref([
  { name: '组件库文档站', owner: '张三', priority: '高', progress: 80 },
  { name: '订单中台重构', owner: '李四', priority: '中', progress: 60 },
  { name: '数据看板二期', owner: '王五', priority: '低', progress: 35 }
])

function onTableSave({ rows }: { rows: any[] }) {
  ElMessage.success(`已提交 ${rows.length} 行修改（本地模式）`)
}
</script>

<style scoped>
.scenario-page {
  width: 100%;
}
</style>
