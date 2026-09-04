<template>
  <div class="scenario-page">
    <wd-panel title="数据维护表单" description="场景：表格 + 抽屉表单的增删改 —— 新增/编辑走抽屉 DataForm，提交成功后声明式刷新表格（headRefreshDatagrid）">
      <wd-data-grid
        api="/user/list"
        :active="true"
        filter="s2"
        :tools="{ refresh: true }"
      >
        <template #toolbar="{ selection }">
          <wd-drawer-button
            type="primary"
            text="新增用户"
            drawer-title="新增用户"
            filter="s2"
            head-refresh-datagrid="s2"
          >
            <wd-data-form
              mode="create"
              submit-api="/user/save"
              :rules="rules"
            >
              <template #default="{ model }">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="model.name" />
                </el-form-item>
                <el-form-item label="部门" prop="dept">
                  <el-select v-model="model.dept" style="width: 100%">
                    <el-option v-for="d in depts" :key="d" :label="d" :value="d" />
                  </el-select>
                </el-form-item>
                <el-form-item label="角色" prop="role">
                  <el-radio-group v-model="model.role">
                    <el-radio :value="1">管理员</el-radio>
                    <el-radio :value="2">编辑</el-radio>
                    <el-radio :value="3">访客</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="model.email" />
                </el-form-item>
              </template>
            </wd-data-form>
          </wd-drawer-button>
          <el-button v-if="selection.length" type="danger" plain @click="removeSelection(selection)">
            删除选中（{{ selection.length }}）
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
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <wd-drawer-button
              link
              type="primary"
              text="编辑"
              drawer-title="编辑用户"
              :drawer-data="row"
              filter="s2"
              head-refresh-datagrid="s2"
            >
              <wd-data-form
                mode="edit"
                submit-api="/user/save"
                :rules="rules"
              >
                <template #default="{ model }">
                  <el-form-item label="姓名" prop="name">
                    <el-input v-model="model.name" />
                  </el-form-item>
                  <el-form-item label="部门" prop="dept">
                    <el-select v-model="model.dept" style="width: 100%">
                      <el-option v-for="d in depts" :key="d" :label="d" :value="d" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="角色" prop="role">
                    <el-radio-group v-model="model.role">
                      <el-radio :value="1">管理员</el-radio>
                      <el-radio :value="2">编辑</el-radio>
                      <el-radio :value="3">访客</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="状态" prop="status">
                    <el-switch v-model="model.status" :active-value="1" :inactive-value="0" />
                  </el-form-item>
                </template>
              </wd-data-form>
            </wd-drawer-button>
            <wd-confirm-button
              link
              type="danger"
              text="删除"
              confirm-text="确认删除该用户？"
              api="/user"
              :api-method="'delete'"
              :api-param="{ id: row.id }"
              filter="s2"
              head-refresh-datagrid="s2"
            />
          </template>
        </el-table-column>
      </wd-data-grid>
    </wd-panel>
  </div>
</template>

<script setup lang="ts">
import { request } from '../../../../src'
import { ElMessage } from 'element-plus'

function roleText(role: number) {
  return { 1: '管理员', 2: '编辑', 3: '访客' }[role] || '未知'
}
const depts = ['技术部', '产品部', '设计部', '市场部', '运营部']
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  dept: [{ required: true, message: '请选择部门', trigger: 'change' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

async function removeSelection(selection: any[]) {
  const ids = selection.map((r) => r.id)
  const result = await request.post('/user/batch', { ids, action: 'remove' })
  if (result.success) {
    ElMessage.success('批量删除成功')
  }
}
</script>

<style scoped>
.scenario-page {
  width: 100%;
}
</style>
