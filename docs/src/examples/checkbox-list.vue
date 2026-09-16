<template>
  <div class="example-page">
    <unpack-note>
      该组件自动对 API 返回数据中的 <code>data</code> 进行解包：<code>data</code> 为选项数组（若为 <code>{ list }</code> 结构则取其 <code>list</code>），逐项按字段映射解析出：
      <ul>
        <li><code>text</code>：选项中显示的文本（复选框标签）</li>
        <li><code>value</code>：选项选中时传递的值</li>
        <li><code>tips</code>：对选项的说明解释（非空时显示悬停提示）</li>
      </ul>
      字段名可用 <code>text-prop</code> / <code>value-prop</code> / <code>tips-prop</code> 自定义（默认 <code>text</code> / <code>value</code> / <code>tips</code>）。
    </unpack-note>
    <demo-block
      title="基础用法"
      desc="API 自动加载选项，v-model 绑定选中值数组"
      :code="code1"
    >
      <wd-checkbox-list
        v-model="value"
        :data-source="options"
      />
      <div class="current">当前选中：{{ value }}</div>
    </demo-block>

    <demo-block
      title="按钮样式"
      desc="button-style 切换为按钮组形态"
      :code="code2"
    >
      <wd-checkbox-list
        v-model="value2"
        :data-source="options"
        button-style
      />
      <div class="current">当前选中：{{ value2 }}</div>
    </demo-block>

    <demo-block
      title="选项悬停提示（tipsProp）"
      desc="数据项中 tips 字段非空时，鼠标悬停该选项弹出 tooltip；可用 tips-prop 自定义解包字段名（默认 tips）"
      :code="code3"
      layout="row"
    >
      <wd-checkbox-list
        v-model="value3"
        :data-source="tipOptions"
      />
      <wd-checkbox-list
        v-model="value4"
        :data-source="customTipOptions"
        value-prop="id"
        text-prop="name"
        tips-prop="remark"
        button-style
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const code1 = `<wd-checkbox-list v-model="value"
  :data-source="options" />`
const code2 = `<wd-checkbox-list v-model="value"
  :data-source="options" button-style />`
const code3 = `<!-- 默认取数据项 tips 字段 -->
<wd-checkbox-list :data-source="options" />
// [{ value: 1, text: '管理员', tips: '拥有全部权限，请谨慎分配' }, ...]

<!-- 自定义解包字段名（按钮样式） -->
<wd-checkbox-list :data-source="options" button-style
  value-prop="id" text-prop="name" tips-prop="remark" />`

const options = [
  { value: 'vue', text: 'Vue' },
  { value: 'react', text: 'React' },
  { value: 'angular', text: 'Angular' }
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
const value = ref(['vue'])
const value2 = ref(['vue', 'react'])
const value3 = ref([1])
const value4 = ref([2])
</script>

<style scoped>
.example-page {
  width: 100%;
}
.current {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
}
</style>
