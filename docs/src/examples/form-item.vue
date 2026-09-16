<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="WdFormItem 用法与 el-form-item 完全一致，包裹任意表单控件，通过 label 设置标签、prop 绑定字段（用于校验）"
      :code="code1"
    >
      <el-form :model="form" label-width="90px" style="max-width: 520px">
        <wd-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </wd-form-item>
        <wd-form-item label="部门" prop="dept">
          <el-select v-model="form.dept" placeholder="请选择部门" style="width: 100%">
            <el-option label="研发部" value="rd" />
            <el-option label="产品部" value="pd" />
            <el-option label="运营部" value="op" />
          </el-select>
        </wd-form-item>
        <wd-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </wd-form-item>
      </el-form>
    </demo-block>

    <demo-block
      title="tip 帮助提示"
      desc="提供 tip 属性后，label 右侧自动出现问号图标，鼠标悬停显示解释说明；不传 tip 时与普通 el-form-item 完全一致。tip-placement 可控制气泡方向"
      :code="code2"
    >
      <el-form :model="form2" label-width="110px" style="max-width: 520px">
        <wd-form-item label="登录账号" prop="account" tip="账号一旦创建不可修改，建议使用工号或邮箱">
          <el-input v-model="form2.account" placeholder="请输入登录账号" />
        </wd-form-item>
        <wd-form-item label="安全等级" prop="level" tip="密码至少 8 位，需包含大小写字母与数字" tip-placement="right">
          <el-radio-group v-model="form2.level">
            <el-radio value="low">低</el-radio>
            <el-radio value="mid">中</el-radio>
            <el-radio value="high">高</el-radio>
          </el-radio-group>
        </wd-form-item>
        <wd-form-item label="备注">
          <el-input v-model="form2.remark" type="textarea" placeholder="无 tip，不显示问号图标" />
        </wd-form-item>
      </el-form>
    </demo-block>

    <demo-block
      title="必填校验"
      desc="prop 配合 el-form 的 rules 即可使用原生校验，required 显示红色星号，与 el-form-item 行为一致"
      :code="code3"
    >
      <el-form ref="formRef" :model="form3" :rules="rules" label-width="90px" style="max-width: 520px">
        <wd-form-item label="名称" prop="name" required>
          <el-input v-model="form3.name" placeholder="必填项" />
        </wd-form-item>
        <wd-form-item label="邮箱" prop="email" required>
          <el-input v-model="form3.email" placeholder="请输入邮箱" />
        </wd-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交校验</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const code1 = `<el-form :model="form" label-width="90px">
  <wd-form-item label="姓名" prop="name">
    <el-input v-model="form.name" />
  </wd-form-item>
  <wd-form-item label="部门" prop="dept">
    <el-select v-model="form.dept"> ... </el-select>
  </wd-form-item>
  <wd-form-item label="状态" prop="status">
    <el-switch v-model="form.status" />
  </wd-form-item>
</el-form>`

const code2 = `<wd-form-item label="登录账号" prop="account"
  tip="账号一旦创建不可修改，建议使用工号或邮箱">
  <el-input v-model="form.account" />
</wd-form-item>

<!-- tip-placement 控制气泡弹出方向 -->
<wd-form-item label="安全等级" prop="level"
  tip="密码至少 8 位，需包含大小写字母与数字" tip-placement="right">
  <el-radio-group v-model="form.level"> ... </el-radio-group>
</wd-form-item>`

const code3 = `<el-form :model="form" :rules="rules" label-width="90px">
  <wd-form-item label="名称" prop="name" required>
    <el-input v-model="form.name" />
  </wd-form-item>
  <wd-form-item label="邮箱" prop="email" required>
    <el-input v-model="form.email" />
  </wd-form-item>
</el-form>`

const form = reactive({ name: '', dept: '', status: 1 })
const form2 = reactive({ account: '', level: 'mid', remark: '' })

const formRef = ref()
const form3 = reactive({ name: '', email: '' })
const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

function submit() {
  formRef.value?.validate()
}
function reset() {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
