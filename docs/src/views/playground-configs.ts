/**
 * Playground 组件配置
 * - 覆盖文档站全部 27 个组件页（不含 use-config / use-request 两个基础设施页）
 * - 每个组件：常用 props 编辑器 + 预览静态数据 + 可复制运行的 SFC 代码片段
 * - 生成代码与预览一一对应（脚手架数据在 setup 段，演示核心组件在 template 段）
 */
import { markRaw, type Component } from 'vue'
import {
  WdDataGrid,
  WdEditableGrid,
  WdViewer,
  WdRequester,
  WdDataForm,
  WdSearchPanel,
  WdFormItem,
  WdSearchItem,
  WdApiButton,
  WdConfirmButton,
  WdPopconfirmButton,
  WdPromptButton,
  WdRouteButton,
  WdTipsButton,
  WdDrawerButton,
  WdDrawer,
  WdIframe,
  WdSelect,
  WdAutoComplete,
  WdCheckboxList,
  WdRadioList,
  WdSwitch,
  WdUpload,
  WdImageUpload,
  WdPanel,
  WdTips,
  WdStation
} from '../../../src'

export interface PlayPropDef {
  /** camelCase prop 名；'__slot__' 表示默认插槽文案 */
  name: string
  label: string
  type: 'string' | 'boolean' | 'number' | 'select'
  options?: { label: string; value: any }[]
  default?: any
}

export interface PlayConfig {
  /** 组件 key，生成代码标签为 wd-${key} */
  key: string
  label: string
  group: string
  comp: Component
  props: PlayPropDef[]
  /** 预览静态绑定（kebab-case 名 → 运行时数据，不进生成代码的 attrs） */
  extra?: Record<string, any>
  /** 生成代码：固定属性段（原样拼接到标签） */
  attrs?: string
  /** 生成代码：<script setup> 数据段（出现即生成完整 SFC） */
  setup?: string
  /** 生成代码：组件内部内容，{{slotText}} 会被默认插槽文案替换 */
  inner?: string
  /** 生成代码：顶部 HTML 注释 */
  comment?: string
}

/* ---------- 公共选项 ---------- */

const BTN_TYPE_OPTIONS = [
  { label: 'primary', value: 'primary' },
  { label: 'success', value: 'success' },
  { label: 'warning', value: 'warning' },
  { label: 'danger', value: 'danger' },
  { label: 'info', value: 'info' },
  { label: 'default', value: '' }
]
const METHOD_OPTIONS = ['get', 'post', 'put', 'delete'].map((m) => ({ label: m, value: m }))
const PLACEMENT_OPTIONS = ['top', 'right', 'bottom', 'left'].map((m) => ({ label: m, value: m }))

/** 按钮类公共 props：接口地址 + 请求方法 + 按钮文案（docs 全局 urlPrefix=/mock，这里写短路径） */
const btnApiProps = (slotDefault: string, slotLabel = '按钮文案'): PlayPropDef[] => [
  { name: 'api', label: '接口地址', type: 'string', default: '/user/save' },
  { name: 'apiMethod', label: '请求方法', type: 'select', options: METHOD_OPTIONS, default: 'post' },
  { name: '__slot__', label: slotLabel, type: 'string', default: slotDefault }
]

/* ---------- 预览静态数据 ---------- */

const playRows = [
  { id: 1, name: '项目 A', owner: '张三' },
  { id: 2, name: '项目 B', owner: '李四' },
  { id: 3, name: '项目 C', owner: '王五' }
]

const playRoleOptions = [
  { value: 1, text: '管理员' },
  { value: 2, text: '编辑' },
  { value: 3, text: '访客' }
]

const editColumns = [
  {
    prop: 'name',
    label: '任务名称',
    editor: 'input',
    rules: [{ required: true, message: '任务名称不能为空', trigger: 'change' }]
  },
  { prop: 'owner', label: '负责人', editor: 'input' }
]

const viewerItems = [
  { prop: 'name', label: '姓名' },
  { prop: 'dept', label: '部门' },
  { prop: 'job', label: '岗位' },
  { prop: 'email', label: '邮箱', span: 2 }
]
const viewerRow = { name: '张三', dept: '技术部', job: '前端工程师', email: 'zhangsan@example.com' }

const stationMenus = [
  {
    key: 'workspace',
    title: '工作区',
    icon: 'Monitor',
    menus: [
      { title: '工作台', path: '#pg-dashboard', icon: 'Odometer' },
      { title: '任务列表', path: '#pg-tasks', icon: 'Tickets' }
    ]
  },
  {
    key: 'system',
    title: '系统设置',
    icon: 'Setting',
    menus: [{ title: '用户管理', path: '#pg-user', icon: 'User' }]
  }
]

/* ---------- 27 个组件配置 ---------- */

export const playConfigs: PlayConfig[] = [
  /* ===== 数据组件 ===== */
  {
    key: 'data-grid',
    label: 'DataGrid',
    group: '数据组件',
    comp: markRaw(WdDataGrid),
    props: [
      { name: 'withIndex', label: '序号列', type: 'boolean', default: true },
      { name: 'withSelection', label: '多选', type: 'boolean', default: true },
      { name: 'stripe', label: '斑马纹', type: 'boolean', default: true },
      { name: 'border', label: '边框', type: 'boolean', default: true },
      {
        name: 'tableSize',
        label: '尺寸',
        type: 'select',
        options: [
          { label: 'large', value: 'large' },
          { label: 'default', value: 'default' },
          { label: 'small', value: 'small' }
        ],
        default: 'default'
      }
    ],
    extra: { 'data-source': playRows, 'with-pager': false },
    attrs: ':data-source="rows" :with-pager="false"',
    inner: `<el-table-column prop="id" label="ID" width="70" />
<el-table-column prop="name" label="项目名称" min-width="140" />
<el-table-column prop="owner" label="负责人" min-width="100" />`,
    setup: `const rows = [
  { id: 1, name: '项目 A', owner: '张三' },
  { id: 2, name: '项目 B', owner: '李四' },
  { id: 3, name: '项目 C', owner: '王五' }
]`,
    comment: '静态数据演示；传 api 可切换接口分页模式'
  },
  {
    key: 'editable-grid',
    label: 'EditableGrid',
    group: '数据组件',
    comp: markRaw(WdEditableGrid),
    props: [
      {
        name: 'editMode',
        label: '编辑模式',
        type: 'select',
        options: [
          { label: 'cell（单元格）', value: 'cell' },
          { label: 'row（整行）', value: 'row' }
        ],
        default: 'cell'
      },
      { name: 'withIndex', label: '序号列', type: 'boolean', default: true },
      { name: 'withToolbar', label: '工具栏', type: 'boolean', default: false },
      { name: 'saveButtonText', label: '保存按钮文案', type: 'string', default: '保存修改' }
    ],
    extra: { columns: editColumns, 'model-value': playRows.map((r) => ({ ...r })), 'with-pager': false },
    attrs: ':columns="columns" :model-value="rows" :with-pager="false" @save="onSave"',
    setup: `import { ElMessage } from 'element-plus'

const columns = [
  { prop: 'name', label: '任务名称', editor: 'input',
    rules: [{ required: true, message: '任务名称不能为空', trigger: 'change' }] },
  { prop: 'owner', label: '负责人', editor: 'input' }
]
const rows = [
  { id: 1, name: '项目 A', owner: '张三' },
  { id: 2, name: '项目 B', owner: '李四' }
]
const onSave = (dirtyRows) => ElMessage.success('已保存 ' + dirtyRows.length + ' 行')`,
    comment: '点击单元格进入编辑，失焦提交；saveApi 可换接口批量保存'
  },
  {
    key: 'viewer',
    label: 'Viewer',
    group: '数据组件',
    comp: markRaw(WdViewer),
    props: [
      { name: 'title', label: '标题', type: 'string', default: '员工信息' },
      { name: 'column', label: '列数', type: 'number', default: 2 }
    ],
    extra: { items: viewerItems, data: viewerRow },
    attrs: ':items="items" :data="row"',
    inner: `<el-descriptions-item label="备注" :span="2">年度核心贡献者，主导多个重点项目落地。</el-descriptions-item>`,
    setup: `const items = [
  { prop: 'name', label: '姓名' },
  { prop: 'dept', label: '部门' },
  { prop: 'job', label: '岗位' },
  { prop: 'email', label: '邮箱', span: 2 }
]
const row = { name: '张三', dept: '技术部', job: '前端工程师', email: 'zhangsan@example.com' }`,
    comment: 'items 声明字段；配 api + api-param + active 可自动拉取详情'
  },
  {
    key: 'requester',
    label: 'Requester',
    group: '数据组件',
    comp: markRaw(WdRequester),
    props: [
      { name: 'url', label: '请求地址', type: 'string', default: '/user/list' },
      { name: 'method', label: '请求方法', type: 'select', options: METHOD_OPTIONS, default: 'get' }
    ],
    extra: { params: { currentPage: 1, pageSize: 5 } },
    attrs: 'v-model="trigger" :params="{ currentPage: 1, pageSize: 5 }" @api-success="onSuccess"',
    setup: `import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const trigger = ref(false)
const onSuccess = (res) => ElMessage.success('请求成功，total=' + res.data.total)
// 触发：trigger.value = true（请求完成后自动复位为 false）`,
    comment: 'v-model 为一次性触发开关：true 发起请求，完成后自动回 false'
  },

  /* ===== 表单组件 ===== */
  {
    key: 'data-form',
    label: 'DataForm',
    group: '表单组件',
    comp: markRaw(WdDataForm),
    props: [
      {
        name: 'mode',
        label: '模式',
        type: 'select',
        options: [
          { label: 'create（新增）', value: 'create' },
          { label: 'edit（编辑）', value: 'edit' }
        ],
        default: 'create'
      },
      { name: 'headCloseDrawer', label: '提交后关闭抽屉', type: 'boolean', default: true }
    ],
    extra: { 'submit-api': '/user/save', rules: { name: [{ required: true, message: '请输入姓名', trigger: 'blur' }] } },
    attrs: 'submit-api="/user/save" :rules="rules"',
    inner: `<template #default="{ model }">
  <el-form-item label="姓名" prop="name">
    <el-input v-model="model.name" placeholder="请输入姓名" />
  </el-form-item>
  <el-form-item label="部门" prop="dept">
    <el-input v-model="model.dept" placeholder="请输入部门" />
  </el-form-item>
</template>`,
    setup: `const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}`,
    comment: '校验通过才提交；edit 模式配 :data 回填初始数据'
  },
  {
    key: 'search-panel',
    label: 'SearchPanel',
    group: '表单组件',
    comp: markRaw(WdSearchPanel),
    props: [
      { name: 'collapsible', label: '可展开收起', type: 'boolean', default: true },
      { name: 'defaultExpand', label: '默认展开', type: 'boolean', default: false },
      { name: 'searchText', label: '搜索按钮文案', type: 'string', default: '搜索' },
      { name: 'resetText', label: '重置按钮文案', type: 'string', default: '重置' },
      { name: 'labelWidth', label: '标签宽度', type: 'string', default: '80px' }
    ],
    extra: { filter: 'play-search' },
    attrs: 'filter="play-search" @search="onSearch"',
    inner: `<template #default="{ model }">
  <wd-search-item label="姓名" prop="name">
    <el-input v-model="model.name" clearable style="width: 160px" />
  </wd-search-item>
  <wd-search-item label="部门" prop="dept">
    <el-input v-model="model.dept" clearable style="width: 160px" />
  </wd-search-item>
</template>`,
    setup: `const onSearch = (model) => console.log('搜索条件：', model)
// 配 filter 后可与同 filter 的 wd-data-grid 声明式联动`,
    comment: '隐藏条件放 #more 插槽，点「展开」滑出'
  },
  {
    key: 'form-item',
    label: 'FormItem',
    group: '表单组件',
    comp: markRaw(WdFormItem),
    props: [
      { name: 'label', label: '标签', type: 'string', default: '姓名' },
      { name: 'tip', label: 'tip 提示', type: 'string', default: '姓名一旦创建不可修改' },
      { name: 'tipPlacement', label: '提示方向', type: 'select', options: PLACEMENT_OPTIONS, default: 'top' }
    ],
    attrs: 'prop="name"',
    inner: `<el-input v-model="form.name" placeholder="请输入姓名" />`,
    setup: `import { reactive } from 'vue'

const form = reactive({ name: '' })
// 注意：wd-form-item 需放在 el-form / wd-data-form 内使用`,
    comment: '用法与 el-form-item 一致，tip 让 label 右侧出现问号图标'
  },
  {
    key: 'search-item',
    label: 'SearchItem',
    group: '表单组件',
    comp: markRaw(WdSearchItem),
    props: [
      { name: 'label', label: '标签', type: 'string', default: '关键词' },
      { name: 'tip', label: 'tip 提示', type: 'string', default: '支持模糊搜索' }
    ],
    attrs: 'prop="kw"',
    inner: `<el-input v-model="model.kw" clearable style="width: 180px" />`,
    comment: '专用于 wd-search-panel 的 #default / #more 插槽，通过插槽参数 model 绑定字段'
  },

  /* ===== 按钮组件 ===== */
  {
    key: 'api-button',
    label: 'ApiButton',
    group: '按钮组件',
    comp: markRaw(WdApiButton),
    props: [
      { name: 'type', label: '类型', type: 'select', options: BTN_TYPE_OPTIONS, default: 'primary' },
      ...btnApiProps('点击请求'),
      { name: 'buttonLoading', label: '按钮 loading', type: 'boolean', default: true },
      { name: 'pageLoading', label: '页面遮罩', type: 'boolean', default: false }
    ],
    comment: '点击直接发起请求，内置 loading 防重复提交'
  },
  {
    key: 'confirm-button',
    label: 'ConfirmButton',
    group: '按钮组件',
    comp: markRaw(WdConfirmButton),
    props: [
      { name: 'type', label: '类型', type: 'select', options: BTN_TYPE_OPTIONS, default: 'danger' },
      { name: 'confirmTitle', label: '确认框标题', type: 'string', default: '提示' },
      { name: 'confirmText', label: '确认内容', type: 'string', default: '确认执行该操作？' },
      { name: 'cancelText', label: '取消文案', type: 'string', default: '取消' },
      ...btnApiProps('删除')
    ],
    comment: 'el-message-box 弹窗二次确认后才发起请求'
  },
  {
    key: 'popconfirm-button',
    label: 'PopconfirmButton',
    group: '按钮组件',
    comp: markRaw(WdPopconfirmButton),
    props: [
      { name: 'type', label: '类型', type: 'select', options: BTN_TYPE_OPTIONS, default: 'danger' },
      { name: 'title', label: '气泡内容', type: 'string', default: '确认删除该记录？' },
      { name: 'confirmButtonText', label: '确定文案', type: 'string', default: '确定' },
      { name: 'cancelButtonText', label: '取消文案', type: 'string', default: '取消' },
      ...btnApiProps('删除')
    ],
    comment: 'el-popconfirm 气泡轻量确认，不打断页面流'
  },
  {
    key: 'prompt-button',
    label: 'PromptButton',
    group: '按钮组件',
    comp: markRaw(WdPromptButton),
    props: [
      { name: 'type', label: '类型', type: 'select', options: BTN_TYPE_OPTIONS, default: 'primary' },
      { name: 'promptTitle', label: '输入框标题', type: 'string', default: '请输入备注' },
      { name: 'promptPlaceholder', label: '占位文本', type: 'string', default: '请输入内容' },
      { name: 'promptDefault', label: '默认值', type: 'string', default: '' },
      ...btnApiProps('备注提交')
    ],
    comment: '弹输入框，输入值以 paramKey（默认 value）合并进 api-param 提交'
  },
  {
    key: 'route-button',
    label: 'RouteButton',
    group: '按钮组件',
    comp: markRaw(WdRouteButton),
    props: [
      { name: 'type', label: '类型', type: 'select', options: BTN_TYPE_OPTIONS, default: 'primary' },
      { name: 'routePath', label: '跳转路径', type: 'string', default: '/components/datagrid' },
      {
        name: 'target',
        label: '打开方式',
        type: 'select',
        options: [
          { label: '_self（当前页）', value: '_self' },
          { label: '_blank（新标签）', value: '_blank' }
        ],
        default: '_blank'
      },
      { name: '__slot__', label: '按钮文案', type: 'string', default: '跳转 DataGrid 文档' }
    ],
    comment: 'route-path 与 route-name 二选一；可带 params / query'
  },
  {
    key: 'tips-button',
    label: 'TipsButton',
    group: '按钮组件',
    comp: markRaw(WdTipsButton),
    props: [
      { name: 'type', label: '类型', type: 'select', options: BTN_TYPE_OPTIONS, default: 'warning' },
      { name: 'tips', label: '悬停提示', type: 'string', default: '操作前请仔细阅读说明' },
      { name: 'placement', label: '提示方向', type: 'select', options: PLACEMENT_OPTIONS, default: 'top' },
      { name: '__slot__', label: '按钮文案', type: 'string', default: '悬停查看提示' }
    ],
    comment: '纯悬停提示按钮：不发请求，click 事件完全交给开发者'
  },
  {
    key: 'drawer-button',
    label: 'DrawerButton',
    group: '按钮组件',
    comp: markRaw(WdDrawerButton),
    props: [
      {
        name: 'mode',
        label: '弹出形式',
        type: 'select',
        options: [
          { label: 'drawer（抽屉）', value: 'drawer' },
          { label: 'dialog（对话框）', value: 'dialog' }
        ],
        default: 'drawer'
      },
      { name: 'type', label: '按钮类型', type: 'select', options: BTN_TYPE_OPTIONS, default: 'primary' },
      { name: 'label', label: '按钮文案', type: 'string', default: '新增用户' },
      { name: 'title', label: '面板标题', type: 'string', default: '新增用户' },
      { name: 'size', label: '面板尺寸', type: 'string', default: '50%' }
    ],
    inner: `<div style="padding: 8px 0">内容区：可嵌 wd-data-form、表格等任意内容；配 filter + head-refresh-datagrid 可在提交成功后自动关闭并刷新同组表格。</div>`,
    comment: 'url 可直接内嵌页面；插槽内容与 url 二选一'
  },

  /* ===== 容器组件 ===== */
  {
    key: 'drawer',
    label: 'Drawer',
    group: '容器组件',
    comp: markRaw(WdDrawer),
    props: [
      { name: 'title', label: '标题', type: 'string', default: '详情抽屉' },
      { name: 'size', label: '尺寸', type: 'string', default: '50%' },
      {
        name: 'direction',
        label: '方向',
        type: 'select',
        options: [
          { label: 'rtl（右侧）', value: 'rtl' },
          { label: 'ltr（左侧）', value: 'ltr' },
          { label: 'ttb（顶部）', value: 'ttb' },
          { label: 'btt（底部）', value: 'btt' }
        ],
        default: 'rtl'
      }
    ],
    attrs: 'v-model="visible"',
    inner: `<div style="padding: 8px 0">抽屉内容区：可放任意组件；url 内嵌页面时可基于 wd-container:* 协议双向通信。</div>`,
    setup: `import { ref } from 'vue'

const visible = ref(false)
// 打开：visible.value = true`,
    comment: 'v-model 控制显隐；url 内嵌 iframe 页面时支持 reload-on-open / data 下发'
  },
  {
    key: 'iframe',
    label: 'Iframe',
    group: '容器组件',
    comp: markRaw(WdIframe),
    props: [
      { name: 'height', label: '高度', type: 'string', default: '200px' },
      { name: 'autoHeight', label: '高度自适应', type: 'boolean', default: false }
    ],
    extra: { src: 'https://example.com' },
    attrs: ':src="pageSrc" @load="onLoad"',
    setup: `// 子页面通过 postMessage 上报高度时，auto-height 生效
const pageSrc = 'https://example.com'
const onLoad = () => console.log('iframe 加载完成')`,
    comment: '支持 postMessage 双向通信（ref.send 下发 / @message 透传）与 refresh-key 重载'
  },

  /* ===== 表单元素 ===== */
  {
    key: 'select',
    label: 'Select',
    group: '表单元素',
    comp: markRaw(WdSelect),
    props: [
      { name: 'multiple', label: '多选', type: 'boolean', default: false },
      { name: 'filterable', label: '可搜索', type: 'boolean', default: true },
      { name: 'clearable', label: '可清空', type: 'boolean', default: true },
      { name: 'placeholder', label: '占位文本', type: 'string', default: '请选择角色' }
    ],
    extra: { api: '/options/roles' },
    attrs: 'v-model="value" api="/options/roles"',
    setup: `import { ref } from 'vue'

const value = ref()`,
    comment: 'api 远程加载选项；data-source 可传静态数组；remote 开启远程搜索'
  },
  {
    key: 'auto-complete',
    label: 'AutoComplete',
    group: '表单元素',
    comp: markRaw(WdAutoComplete),
    props: [
      { name: 'debounce', label: '防抖(ms)', type: 'number', default: 300 },
      { name: 'placeholder', label: '占位文本', type: 'string', default: '输入关键字搜索' }
    ],
    extra: { api: '/options/roles' },
    attrs: 'v-model="keyword" api="/options/roles"',
    setup: `import { ref } from 'vue'

const keyword = ref('')`,
    comment: '输入即搜（防抖），下拉展示远程匹配结果'
  },
  {
    key: 'checkbox-list',
    label: 'CheckboxList',
    group: '表单元素',
    comp: markRaw(WdCheckboxList),
    props: [
      { name: 'buttonStyle', label: '按钮样式', type: 'boolean', default: false }
    ],
    extra: { 'data-source': playRoleOptions },
    attrs: 'v-model="checked" :data-source="options"',
    setup: `import { ref } from 'vue'

const checked = ref([])
const options = [
  { value: 1, text: '管理员' },
  { value: 2, text: '编辑' },
  { value: 3, text: '访客' }
]`,
    comment: '选项默认取 value / text 字段，可用 text-prop / value-prop 自定义'
  },
  {
    key: 'radio-list',
    label: 'RadioList',
    group: '表单元素',
    comp: markRaw(WdRadioList),
    props: [
      { name: 'buttonStyle', label: '按钮样式', type: 'boolean', default: false }
    ],
    extra: { 'data-source': playRoleOptions },
    attrs: 'v-model="picked" :data-source="options"',
    setup: `import { ref } from 'vue'

const picked = ref()
const options = [
  { value: 1, text: '管理员' },
  { value: 2, text: '编辑' },
  { value: 3, text: '访客' }
]`,
    comment: '单选版本，数据源与 checkbox-list 一致'
  },
  {
    key: 'switch',
    label: 'Switch',
    group: '表单元素',
    comp: markRaw(WdSwitch),
    props: [
      { name: 'activeValue', label: '开启值', type: 'string', default: '1' },
      { name: 'inactiveValue', label: '关闭值', type: 'string', default: '0' },
      { name: 'tips', label: '悬停提示', type: 'string', default: '切换后同步到服务端' }
    ],
    extra: { api: '/user/status', 'api-param': { id: 1 } },
    attrs: 'v-model="status" api="/user/status" :api-param="{ id: 1 }"',
    setup: `import { ref } from 'vue'

const status = ref('1')`,
    comment: '切换即提交请求：新值以 paramKey（默认 status）合并进 api-param'
  },
  {
    key: 'upload',
    label: 'Upload',
    group: '表单元素',
    comp: markRaw(WdUpload),
    props: [
      { name: 'multiple', label: '多文件', type: 'boolean', default: true },
      { name: 'limit', label: '数量上限', type: 'number', default: 3 },
      { name: 'buttonText', label: '按钮文案', type: 'string', default: '点击上传' }
    ],
    extra: { api: '/file/upload' },
    attrs: 'api="/file/upload"',
    comment: '上传走统一请求核心；max-size（MB）可限制大小'
  },
  {
    key: 'image-upload',
    label: 'ImageUpload',
    group: '表单元素',
    comp: markRaw(WdImageUpload),
    props: [
      { name: 'maxCount', label: '数量上限', type: 'number', default: 3 },
      { name: 'tip', label: '提示文案', type: 'string', default: '仅支持图片，单个不超过 5MB' }
    ],
    extra: { api: '/file/upload' },
    attrs: 'api="/file/upload"',
    comment: '图片专用上传：缩略图墙 + 预览'
  },

  /* ===== 辅助组件 ===== */
  {
    key: 'panel',
    label: 'Panel',
    group: '辅助组件',
    comp: markRaw(WdPanel),
    props: [
      { name: 'title', label: '标题', type: 'string', default: '面板标题' },
      { name: 'description', label: '描述', type: 'string', default: '面板描述文字' },
      { name: 'collapsible', label: '可折叠', type: 'boolean', default: false },
      { name: '__slot__', label: '内容文案', type: 'string', default: '面板内容区：可放任意组件。' }
    ],
    inner: `<p style="margin: 0">{{slotText}}</p>`,
    comment: '带标题栏的内容容器；collapsible 开启后可折叠'
  },
  {
    key: 'tips',
    label: 'Tips',
    group: '辅助组件',
    comp: markRaw(WdTips),
    props: [
      {
        name: 'type',
        label: '模式',
        type: 'select',
        options: [
          { label: 'word（悬停图标）', value: 'word' },
          { label: 'box（行内文字）', value: 'box' }
        ],
        default: 'word'
      },
      { name: 'tips', label: '提示内容', type: 'string', default: '这是一条提示' },
      { name: 'color', label: '颜色', type: 'string', default: '#909399' }
    ],
    comment: 'word 模式渲染问号图标，box 模式直接渲染带色文字'
  },

  /* ===== 布局组件 ===== */
  {
    key: 'station',
    label: 'Station',
    group: '布局组件',
    comp: markRaw(WdStation),
    props: [
      { name: 'title', label: '系统标题', type: 'string', default: 'WorkDesktop' },
      { name: 'userName', label: '用户名', type: 'string', default: '管理员' },
      {
        name: 'headerMode',
        label: '头部模式',
        type: 'select',
        options: [
          { label: 'nav（导航）', value: 'nav' },
          { label: 'title（纯标题）', value: 'title' }
        ],
        default: 'nav'
      },
      {
        name: 'menuMode',
        label: '菜单位置',
        type: 'select',
        options: [
          { label: 'side（侧边）', value: 'side' },
          { label: 'top（顶部）', value: 'top' },
          { label: 'none（无菜单）', value: 'none' }
        ],
        default: 'side'
      },
      { name: 'copyright', label: '版权信息', type: 'string', default: '© 2026 WorkDesktop' }
    ],
    extra: { 'menu-groups': stationMenus, 'router-mode': 'html' },
    attrs: ':menu-groups="menuGroups" router-mode="html"',
    inner: `<div style="padding: 16px">内容区：页面渲染在这里</div>`,
    setup: `const menuGroups = [
  { key: 'workspace', title: '工作区', icon: 'Monitor', menus: [
    { title: '工作台', path: '/work/dashboard', icon: 'Odometer' },
    { title: '任务列表', path: '/work/tasks', icon: 'Tickets' }
  ] },
  { key: 'system', title: '系统设置', icon: 'Setting', menus: [
    { title: '用户管理', path: '/sys/user', icon: 'User' }
  ] }
]`,
    comment: '整页布局骨架：头部 + 菜单 + 内容 + 底栏；router-mode=auto 时自动接管 vue-router'
  }
]

/** 分组（保持 api-meta 导航顺序） */
export const playGroups: { label: string; items: PlayConfig[] }[] = []
for (const c of playConfigs) {
  let g = playGroups.find((x) => x.label === c.group)
  if (!g) {
    g = { label: c.group, items: [] }
    playGroups.push(g)
  }
  g.items.push(c)
}
