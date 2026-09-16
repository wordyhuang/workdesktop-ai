<template>
  <div class="example-page">
    <unpack-note>
      该组件自动对 API 返回数据中的 <code>data</code> 进行解包：<code>data</code> 为选项数组（若为 <code>{ list }</code> 结构则取其 <code>list</code>），逐项按字段映射解析出：
      <ul>
        <li><code>text</code>：选项中显示的文本</li>
        <li><code>value</code>：选项选中时传递的值</li>
        <li><code>tips</code>：对选项的说明解释（非空时选项右侧显示悬停提示图标）</li>
      </ul>
      字段名可用 <code>text-prop</code> / <code>value-prop</code> / <code>tips-prop</code> 自定义（默认 <code>text</code> / <code>value</code> / <code>tips</code>）。
    </unpack-note>

    <demo-block title="API 加载选项" desc="api 自动加载，active 控制是否挂载即请求" :code="code1" layout="row">
      <wd-select v-model="roleApi" api="/options/roles" placeholder="请选择角色" style="width: 220px" />
      <div class="current">当前值：{{ roleApi }}</div>
    </demo-block>

    <demo-block
      title="静态选项 + 前后追加"
      desc="dataSource 静态数据，addData/appendData 固定插入首尾"
      :code="code2"
      layout="row"
    >
      <wd-select
        v-model="role"
        :data-source="options"
        :add-data="[{ value: 0, text: '全部角色' }]"
        placeholder="选择角色"
        style="width: 220px"
      />
      <div class="current">当前值：{{ role }}</div>
    </demo-block>

    <demo-block
      title="多选"
      desc="multiple 开启多选，绑定值为数组；配合 collapse-tags 折叠标签、clearable 可清空"
      :code="code5"
      layout="row"
    >
      <wd-select
        v-model="roles"
        :data-source="options"
        multiple
        collapse-tags
        collapse-tags-tooltip
        clearable
        placeholder="多选角色"
        style="width: 280px"
      />
      <div class="current">当前值：{{ roles }}</div>
    </demo-block>

    <demo-block title="选项悬停提示（tipsProp）"
      desc="数据项中 tips 字段非空时，选项右侧出现问号图标，鼠标悬停图标弹出 tooltip，不干扰正常浏览和选择；可用 tips-prop 自定义解包字段名（默认 tips）"
      :code="code4" layout="row">
      <wd-select v-model="tipRole" :data-source="tipOptions" placeholder="默认 tips 字段" style="width: 240px" />
      <wd-select v-model="customTipRole" :data-source="customTipOptions" value-prop="id" text-prop="name" tips-prop="remark"
        placeholder="自定义 remark 字段" style="width: 240px" />
      <div class="current">当前值：{{ tipRole }} / {{ customTipRole }}</div>
    </demo-block>

    <demo-block title="远程搜索" desc="remote 开启远程搜索，关键字通过 keyword-key 字段提交" :code="code3" layout="row">
      <wd-select
        v-model="remoteUser"
        api="/user/list"
        remote
        filterable
        value-prop="id"
        text-prop="name"
        keyword-key="name"
        placeholder="输入姓名远程搜索"
        style="width: 280px"
      >
        <template #default="{ option }">
          <div class="remote-option">
            <span>{{ option.name }}</span>
            <span class="remote-option__sub">{{ option.dept }} · {{ option.email }}</span>
          </div>
        </template>
      </wd-select>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const code1 = `<wd-select v-model="role" api="/options/roles" placeholder="请选择角色" />`
const code2 = `<wd-select v-model="role" :data-source="options"
  :add-data="[{ value: 0, text: '全部角色' }]" />`
const code5 = `<wd-select v-model="roles" :data-source="options"
  multiple collapse-tags collapse-tags-tooltip clearable
  placeholder="多选角色" />`
const code3 = `<wd-select api="/user/list" remote filterable
  value-prop="id" text-prop="name"
  keyword-key="name" placeholder="输入姓名远程搜索" />`
const code4 = `<!-- 默认取数据项 tips 字段 -->
<wd-select :data-source="options" />
// [{ value: 1, text: '管理员', tips: '拥有全部权限，请谨慎分配' }, ...]

<!-- 自定义解包字段名 -->
<wd-select :data-source="options"
  value-prop="id" text-prop="name" tips-prop="remark" />`

const options = [
  { value: 1, text: '管理员' },
  { value: 2, text: '编辑' },
  { value: 3, text: '访客' }
]
const tipOptions = [
  { value: 1, text: '管理员', tips: '拥有全部权限，请谨慎分配' },
  { value: 2, text: '编辑', tips: '可维护数据，但不能管理用户与权限' },
  { value: 3, text: '访客' }
]
const customTipOptions = [
  { id: 1, name: '正式员工', remark: '享受完整薪酬与福利' },
  { id: 2, name: '外包人员', remark: '仅授予项目所需的最小权限' },
  { id: 3, name: '实习生' }
]

const roleApi = ref('')
const role = ref(0)
const roles = ref([1])
const tipRole = ref(1)
const customTipRole = ref(1)
const remoteUser = ref('')
</script>

<style scoped>
.example-page {
  width: 100%;
}
.current {
  color: #909399;
  font-size: 13px;
  white-space: nowrap;
}
.remote-option {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.remote-option__sub {
  color: #909399;
  font-size: 12px;
}
</style>
