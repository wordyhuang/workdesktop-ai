<template>
  <div class="example-page">
    <unpack-note>
      该组件对 API 返回数据中 <code>data</code> 的解包分两处：
      <ul>
        <li><b>加载详情</b>（<code>api</code> 拉取）：把 <code>data</code> 整体作为表单对象回填到表单（按字段名浅合并），并通过 <code>load-success</code> 事件抛出 <code>data</code></li>
        <li><b>提交表单</b>（<code>submitApi</code>）：提交后从返回中解出 <code>data</code>，成功时通过 <code>submit-success</code> 事件抛出 <code>data</code>，失败时通过 <code>submit-fail</code> 抛出完整结果</li>
      </ul>
    </unpack-note>
    <demo-block
      title="新增模式（create）+ 方法调用"
      desc="基于 el-form 自动表单，提交走 submitApi；校验通过才提交。上方按钮演示通过 ref 调用 getFormData() / isDirty() / validate() / resetForm()（提交按钮已内置，submitForm() 亦可手动调用）"
      :code="code1"
    >
      <div style="margin-bottom: 12px">
        <el-button size="small" @click="callGetData">getFormData() 取表单数据</el-button>
        <el-button size="small" @click="callDirty">isDirty() 是否改动</el-button>
        <el-button size="small" @click="callValidate">validate() 校验</el-button>
        <el-button size="small" @click="callReset">resetForm() 重置</el-button>
      </div>
      <wd-data-form
        ref="createForm"
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const createForm = ref()

async function callGetData() {
  const data = createForm.value?.getFormData() || {}
  ElMessage.info(`getFormData() => ${JSON.stringify(data)}`)
}
function callDirty() {
  ElMessage.info(createForm.value?.isDirty() ? 'isDirty() => 有未保存修改' : 'isDirty() => 无修改')
}
async function callValidate() {
  const ok = await createForm.value?.validate()
  if (ok) ElMessage.success('validate() 校验通过')
  else ElMessage.warning('validate() 校验未通过')
}
function callReset() {
  createForm.value?.resetForm()
  ElMessage.success('已调用 resetForm()')
}

const code1 = `<!-- 加 ref -->
<wd-data-form ref="createForm" mode="create"
  submit-api="/user/save" :rules="rules">
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
</wd-data-form>

// 通过 ref 调用方法
const createForm = ref()
createForm.value.getFormData()           // -> 当前表单数据副本
createForm.value.isDirty()               // -> boolean，是否有修改
await createForm.value.validate()        // -> Promise<boolean>
createForm.value.resetForm()             // 重置（create 清空 / edit 还原快照）
await createForm.value.submitForm()      // 校验并提交`

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
