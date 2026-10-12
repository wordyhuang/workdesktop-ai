<template>
  <div class="example-page">
    <demo-block
      title="基础对话框"
      desc="WdDialogButton 固定弹出对话框（居中），内部放任意内容：DataForm、表格等"
      :code="code1"
      layout="row"
    >
      <wd-dialog-button
        type="primary"
        label="打开对话框"
        title="通知"
      >
        <div class="dialog-content">
          <p>这是一个对话框。</p>
          <p>内部可以放任意内容，包括 DataForm、表格等。</p>
        </div>
      </wd-dialog-button>

      <wd-dialog-button
        type="success"
        label="iframe 对话框"
        title="内嵌页面"
        url="https://www.example.com"
      />
    </demo-block>

    <demo-block
      title="新增表单对话框"
      desc="弹层内放置 DataForm，提交成功后自动关闭并刷新同组表格（headRefreshDatagrid）"
      :code="code2"
    >
      <wd-dialog-button
        type="primary"
        label="新增用户"
        title="新增用户"
        filter="demo-dialog"
        head-refresh-datagrid="demo-dialog"
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
      </wd-dialog-button>
      <div style="height: 12px" />
      <wd-data-grid
        api="/user/list"
        :active="true"
        filter="demo-dialog"
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
const code1 = `<wd-dialog-button type="primary" label="打开对话框"
  title="通知">
  <p>任意内容</p>
</wd-dialog-button>

<wd-dialog-button type="success" label="iframe 对话框"
  title="内嵌页面" url="https://www.example.com" />`

const code2 = `<template>
  <wd-dialog-button type="primary" label="新增用户" title="新增用户"
    filter="demo-dialog" head-refresh-datagrid="demo-dialog">
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
  </wd-dialog-button>

  <!-- 同 filter 分组表格：表单提交成功后自动关闭对话框并刷新 -->
  <wd-data-grid api="/user/list" :active="true" filter="demo-dialog" :with-pager="false" :with-index="true">
    <el-table-column prop="id" label="ID" width="70" />
    <el-table-column prop="name" label="姓名" min-width="120" />
    <el-table-column prop="dept" label="部门" width="110" />
    <el-table-column prop="role" label="角色" width="100">
      <template #default="{ row }">{{ roleText(row.role) }}</template>
    </el-table-column>
  </wd-data-grid>
</template>

<script>
const depts = ['技术部', '产品部', '设计部', '市场部', '运营部']

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  dept: [{ required: true, message: '请选择部门', trigger: 'change' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

function roleText(role) {
  return { 1: '管理员', 2: '编辑', 3: '访客' }[role] || '未知'
}
<\/script>`

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
.dialog-content p {
  margin: 8px 0;
  color: #606266;
}
</style>
