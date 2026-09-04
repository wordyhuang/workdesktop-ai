<template>
  <div class="example-page">
    <demo-block
      title="新增模式（create）"
      desc="基于 el-form 自动表单，提交走 submitApi；校验通过才提交，成功后 emit submit-success"
      :code="code1"
    >
      <wd-data-form
        mode="create"
        submit-api="/user/save"
        :head-close-drawer="false"
        :rules="rules"
        style="max-width: 520px"
      >
        <template #default="{ model }">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="model.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="部门" prop="dept">
            <el-select v-model="model.dept" placeholder="请选择部门" style="width: 100%">
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
            <el-input v-model="model.email" placeholder="请输入邮箱" />
          </el-form-item>
        </template>
      </wd-data-form>
    </demo-block>

    <demo-block
      title="编辑模式（edit）回填"
      desc="mode=edit + data 回填初始数据，可改 submitKeys 白名单控制提交字段"
      :code="code2"
    >
      <wd-data-form
        mode="edit"
        submit-api="/user/save"
        :head-close-drawer="false"
        :data="editData"
        :rules="rules"
        style="max-width: 520px"
      >
        <template #default="{ model }">
          <el-form-item label="ID" prop="id">
            <el-input v-model="model.id" disabled />
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="model.name" />
          </el-form-item>
          <el-form-item label="部门" prop="dept">
            <el-select v-model="model.dept" style="width: 100%">
              <el-option v-for="d in depts" :key="d" :label="d" :value="d" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch v-model="model.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </template>
      </wd-data-form>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
const code1 = `<wd-data-form mode="create" submit-api="/user/save" :rules="rules">
  <template #default="{ model }">
    <el-form-item label="姓名" prop="name">
      <el-input v-model="model.name" />
    </el-form-item>
    <el-form-item label="部门" prop="dept">
      <el-select v-model="model.dept">
        <el-option v-for="d in depts" :key="d" :label="d" :value="d" />
      </el-select>
    </el-form-item>
  </template>
</wd-data-form>`

const code2 = `<wd-data-form mode="edit" submit-api="/user/save" :data="editData">
  <template #default="{ model }">
    <el-form-item label="姓名" prop="name">
      <el-input v-model="model.name" />
    </el-form-item>
  </template>
</wd-data-form>`

const depts = ['技术部', '产品部', '设计部', '市场部', '运营部']

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  dept: [{ required: true, message: '请选择部门', trigger: 'change' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

const editData = { id: 1, name: '用户1', dept: '技术部', status: 1 }
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
