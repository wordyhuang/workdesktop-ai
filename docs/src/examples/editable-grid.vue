<template>
  <div class="example-page">
    <unpack-note>
      该组件自动对 API 返回数据中的 <code>data</code> 进行解包：<code>data</code> 为分页对象 <code>{ list, total, pageSize, currentPage }</code>，逐项解析出：
      <ul>
        <li><code>list</code>：表格行数据数组</li>
        <li><code>total</code>：数据总条数（用于分页）</li>
        <li><code>pageSize</code>：每页条数（回显分页器）</li>
        <li><code>currentPage</code>：当前页码（回显分页器）</li>
      </ul>
      字段名可用全局配置 <code>response.list</code> 的 <code>listName</code> / <code>totalName</code> / <code>pageSizeName</code> / <code>currentPageName</code> 自定义（默认 <code>list</code> / <code>total</code> / <code>pageSize</code> / <code>currentPage</code>）。
    </unpack-note>
    <demo-block
      title="单元格编辑（cell 模式）+ 方法调用"
      desc="点击单元格进入编辑，失焦提交；required 必填校验，未通过则无法批量保存。下方按钮演示通过 ref 调用 addRow() / getDirtyRows() / validate() / saveAll()。本地静态数据关闭分页：with-pager=false"
      :code="code1"
    >
      <div style="margin-bottom: 12px">
        <el-button size="small" @click="callAddRow">addRow() 新增一行</el-button>
        <el-button size="small" @click="callDirty">getDirtyRows() 脏行数</el-button>
        <el-button size="small" @click="callValidate">validate() 校验</el-button>
        <el-button size="small" type="primary" @click="callSaveAll">saveAll() 批量保存</el-button>
      </div>
      <wd-editable-grid
        ref="editRef"
        :columns="columns"
        :model-value="cellRows"
        :with-index="true"
        :with-pager="false"
        save-button-text="保存修改"
        @save="onSave"
      />
    </demo-block>

    <demo-block
      title="行编辑（row 模式）"
      desc="行内编辑/保存/取消，取消可还原快照"
      :code="code2"
    >
      <wd-editable-grid
        :columns="columns"
        :model-value="rowRows"
        edit-mode="row"
        :with-index="true"
        :with-pager="false"
        :with-toolbar="true"
        save-button-text="批量提交"
        @save="onSave"
      />
    </demo-block>

    <demo-block
      title="接口分页 + 可编辑（完整继承 DataGrid）"
      desc="传 api 即启用接口分页/加载，可与 apiParam、分页、多选、动态列、高度模式、卡片切换、SearchPanel 联动等 DataGrid 能力同时使用；编辑后的脏行走 saveApi 批量保存"
      :code="code3"
    >
      <wd-editable-grid
        api="/task/list"
        save-api="/task/batch-save"
        :active="true"
        :columns="columns"
        row-key="id"
        :with-selection="true"
        :dynamic-column="true"
        column-storage-key="demo-task-grid"
        :tools="{ refresh: true, size: true, columnSetting: true }"
      />
    </demo-block>

    <demo-block
      title="已修改样式 + ElForm 风格 rules 单元格校验"
      desc="改动单元格后，最右侧自动出现「已修改」警告感叹号图标（is-dirty，默认显示图标，可通过 CSS 变量自定义形态、颜色、是否显示，见下方说明）；列配置与 ElForm 完全一致的 rules 时，不满足约束的单元格显示 is-error 红色约束样式，批量保存会中断并提示（title 悬浮可看错误文案）。改回原值样式自动消失"
      :code="code4"
    >
      <wd-editable-grid
        :columns="rulesColumns"
        :model-value="rulesRows"
        :with-index="true"
        :with-pager="false"
        save-button-text="保存修改"
        @save="onSave"
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const code1 = `<!-- 加 ref；本地静态数据建议关闭分页 -->
<wd-editable-grid ref="editRef" :columns="columns"
  :model-value="rows" :with-pager="false" @save="onSave" />

// 通过 ref 调用方法
const editRef = ref()
editRef.value.addRow()                  // 新增一行
editRef.value.getDirtyRows()            // -> 未保存的脏行数组
await editRef.value.validate()          // -> Promise<boolean>，校验脏行
await editRef.value.saveAll()           // 校验并批量保存`

const code3 = `<!-- 接口模式：DataGrid 分页 + 可编辑同时生效 -->
<wd-editable-grid
  api="/task/list" save-api="/task/batch-save"
  :active="true" :columns="columns" row-key="id"
  :with-selection="true" :dynamic-column="true"
  column-storage-key="demo-task-grid"
  :tools="{ refresh: true, size: true, columnSetting: true }" />`

const code4 = `<wd-editable-grid :columns="rulesColumns"
  :model-value="rows" :with-index="true"
  :with-pager="false" @save="onSave" />

// 列规则与 ElForm 完全一致（async-validator）
const rulesColumns = [
  { prop: 'name', label: '任务名称', editor: 'input',
    rules: [{ required: true, message: '任务名称不能为空', trigger: 'change' }] },
  { prop: 'owner', label: '负责人', editor: 'input',
    rules: [{ min: 2, message: '负责人至少 2 个字', trigger: 'change' }] },
  { prop: 'priority', label: '优先级', editor: 'select',
    options: [{ text: '高', value: '高' }, { text: '中', value: '中' }, { text: '低', value: '低' }],
    rules: [{ required: true, message: '请选择优先级', trigger: 'change' }] },
  { prop: 'progress', label: '进度(%)', editor: 'number',
    rules: [{ type: 'number', min: 0, max: 100, message: '进度需在 0-100 之间', trigger: 'change' }] }
]
// 改动过的单元格最右侧加 is-dirty 感叹号图标（默认），CSS 变量可自定义标识样式；
// 不满足 rules 的单元格显示 is-error，保存会中断提示

// 自定义已修改标识（示例：改为底色高亮 + 关闭图标）：
// .wd-editable-grid__cell.is-dirty {
//   --wd-cell-dirty-show-icon: false;
//   --wd-cell-dirty-decoration: none;
//   --wd-cell-dirty-bg: rgba(230, 162, 60, 0.12);
// }`

const editRef = ref()

function callAddRow() {
  editRef.value?.addRow()
  ElMessage.success('已调用 addRow()')
}
function callDirty() {
  const rows = editRef.value?.getDirtyRows() || []
  ElMessage.info(`getDirtyRows() 当前 ${rows.length} 行未保存`)
}
async function callValidate() {
  const ok = await editRef.value?.validate()
  if (ok) ElMessage.success('validate() 校验通过')
  else ElMessage.warning('validate() 存在未通过的行')
}
function callSaveAll() {
  editRef.value?.saveAll()
}

const code2 = `<wd-editable-grid :columns="columns"
  :model-value="rows" edit-mode="row"
  :with-index="true" :with-pager="false" @save="onSave" />`

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

// 演示列：ElForm 风格 rules 校验（编辑单元格即生效）
const rulesColumns = [
  {
    prop: 'name',
    label: '任务名称',
    editor: 'input',
    rules: [{ required: true, message: '任务名称不能为空', trigger: 'change' }]
  },
  {
    prop: 'owner',
    label: '负责人',
    editor: 'input',
    rules: [{ min: 2, message: '负责人至少 2 个字', trigger: 'change' }]
  },
  {
    prop: 'priority',
    label: '优先级',
    editor: 'select',
    options: [
      { text: '高', value: '高' },
      { text: '中', value: '中' },
      { text: '低', value: '低' }
    ],
    rules: [{ required: true, message: '请选择优先级', trigger: 'change' }]
  },
  {
    prop: 'progress',
    label: '进度(%)',
    editor: 'number',
    min: 0,
    max: 100,
    rules: [{ type: 'number', min: 0, max: 100, message: '进度需在 0-100 之间', trigger: 'change' }]
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

const rulesRows = ref([
  { name: '组件库文档站', owner: '张三', priority: '高', progress: 80 },
  { name: '订单中台重构', owner: '李', priority: '中', progress: 60 },
  { name: '数据看板二期', owner: '王五', priority: '低', progress: 120 }
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
