<template>
  <div class="example-page">
    <demo-block
      title="单元格编辑（cell 模式）"
      desc="点击单元格进入编辑，失焦提交；required 必填校验，未通过则无法批量保存"
      :code="code1"
    >
      <wd-editable-table
        :columns="columns"
        :model-value="cellRows"
        :with-index="true"
        save-button-text="保存修改"
        @save="onSave"
      />
    </demo-block>

    <demo-block
      title="行编辑（row 模式）"
      desc="行内编辑/保存/取消，取消可还原快照"
      :code="code2"
    >
      <wd-editable-table
        :columns="columns"
        :model-value="rowRows"
        edit-mode="row"
        :with-index="true"
        :with-toolbar="true"
        save-button-text="批量提交"
        @save="onSave"
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const code1 = `<wd-editable-table :columns="columns"
  :model-value="rows" :with-index="true"
  save-button-text="保存修改" @save="onSave" />`

const code2 = `<wd-editable-table :columns="columns"
  :model-value="rows" edit-mode="row"
  :with-index="true" @save="onSave" />`

const columns = [
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
  {
    prop: 'progress',
    label: '进度(%)',
    editor: 'number',
    min: 0,
    max: 100,
    required: true
  }
]

const cellRows = ref([
  { name: '组件库文档站', owner: '张三', priority: '高', progress: 80 },
  { name: '订单中台重构', owner: '李四', priority: '中', progress: 60 },
  { name: '数据看板二期', owner: '王五', priority: '低', progress: 35 }
])

const rowRows = ref([
  { name: '权限体系升级', owner: '钱七', priority: '高', progress: 15 },
  { name: '移动端适配', owner: '赵六', priority: '中', progress: 45 }
])

function onSave({ rows }: { rows: any[] }) {
  ElMessage.success(`已提交 ${rows.length} 行修改`)
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
