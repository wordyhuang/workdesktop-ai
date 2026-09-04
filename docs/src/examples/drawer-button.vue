<template>
  <div class="example-page">
    <demo-block
      title="新增表单抽屉"
      desc="点击打开抽屉，内部 DataForm 提交成功后自动关闭并刷新同组表格（headRefreshDatagrid）"
      :code="code1"
    >
      <wd-drawer-button
        type="primary"
        text="新增用户"
        drawer-title="新增用户"
        filter="demo-drawer"
        head-refresh-datagrid="demo-drawer"
      >
        <wd-data-form mode="create" submit-api="/user/save" :rules="rules">
          <template #default="{ model }">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="model.name" />
            </el-form-item>
            <el-form-item label="部门" prop="dept">
              <el-select v-model="model.dept" style="width: 100%">
                <el-option v-for="d in depts" :key="d" :label="d" :value="d" />
              </el-select>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="model.email" />
            </el-form-item>
          </template>
        </wd-data-form>
      </wd-drawer-button>
      <div style="height: 12px" />
      <wd-data-grid
        api="/user/list"
        :active="true"
        filter="demo-drawer"
        :with-pager="false"
        :with-index="true"
        style="height: 260px"
      >
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="dept" label="部门" width="110" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">{{ roleText(row.role) }}</template>
        </el-table-column>
      </wd-data-grid>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
const code1 = `<wd-drawer-button type="primary" text="新增用户"
  drawer-title="新增用户" filter="demo" head-refresh-datagrid="demo">
  <wd-data-form mode="create" submit-api="/user/save">
    <template #default="{ model }">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="model.name" />
      </el-form-item>
    </template>
  </wd-data-form>
</wd-drawer-button>`

function roleText(role: number) {
  return { 1: '管理员', 2: '编辑', 3: '访客' }[role] || '未知'
}
const depts = ['技术部', '产品部', '设计部', '市场部', '运营部']
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  dept: [{ required: true, message: '请选择部门', trigger: 'change' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
