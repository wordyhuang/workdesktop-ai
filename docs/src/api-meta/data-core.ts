import type { ComponentMeta } from './types'

/** 数据/表单组：DataGrid、EditableTable、DataForm */
export const coreData: ComponentMeta[] = [
  {
    path: 'datagrid',
    name: 'WdDataGrid',
    title: 'DataGrid 数据表格',
    desc: '旗舰组件：内部封装 el-table + el-pagination，支持 API/静态双数据源、分页搜索、工具栏、卡片模式切换、动态列、行合并、树形、多选',
    group: '数据',
    props: [
      { name: 'api', type: 'string', default: "''", desc: '列表接口地址' },
      { name: 'apiMethod', type: "'get' | 'post' | 'put' | 'delete'", default: "'post'", desc: '请求方法' },
      { name: 'apiParam', type: 'object', default: '{}', desc: '固定请求参数（并入搜索条件 param）' },
      { name: 'active', type: 'boolean', default: 'false', desc: '挂载后自动请求第一页' },
      { name: 'dataSource', type: 'array', default: '—', desc: '静态数据数组（与 api 二选一）' },
      { name: 'withPager', type: 'boolean', default: 'true', desc: '显示分页' },
      { name: 'pagerStyle', type: "'simple' | 'normal' | 'full'", default: "'normal'", desc: '分页档位' },
      { name: 'modeSwitch', type: 'boolean', default: 'false', desc: '启用表格/卡片模式切换' },
      { name: 'dynamicColumn', type: 'boolean', default: 'false', desc: '启用列设置（隐藏/排序/持久化）' },
      { name: 'columnStorageKey', type: 'string', default: "''", desc: '列设置与尺寸持久化 key（localStorage）' },
      { name: 'border', type: 'boolean', default: 'false', desc: '表格边框' },
      { name: 'stripe', type: 'boolean', default: 'false', desc: '斑马纹' },
      { name: 'autoHeight', type: 'boolean', default: 'false', desc: '高度自适应撑满容器' },
      { name: 'rowKey', type: 'string', default: "''", desc: '行主键（树形/多选必备）' },
      { name: 'tableSize', type: "'large' | 'default' | 'small'", default: "'default'", desc: '表格尺寸' },
      { name: 'withIndex', type: 'boolean', default: 'true', desc: '序号列（翻页连续）' },
      { name: 'withSelection', type: 'boolean', default: 'false', desc: '多选列' },
      { name: 'rowspanKey', type: 'string', default: "''", desc: '行合并分组字段' },
      { name: 'rowspanColumn', type: 'string[]', default: '[]', desc: '参与合并的列 prop' },
      { name: 'treeProps', type: 'object', default: "{ children:'children' }", desc: '树形数据字段映射' },
      { name: 'defaultExpandAll', type: 'boolean', default: 'false', desc: '树默认展开全部' },
      { name: 'tools', type: 'object', default: '{}', desc: '工具栏开关 { refresh, columnSetting, modeSwitch, size }' },
      { name: 'rowActions', type: 'array', default: '[]', desc: '内置操作列：[{ text, command?, type? }]，点击 emit row-action' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'row-action', payload: '{ row, command }', desc: '行内操作触发' },
      { name: 'page-change', payload: '{ currentPage, pageSize }', desc: '分页变化' },
      { name: 'selection-change', payload: 'rows', desc: '多选变化' },
      { name: 'mode-change', payload: "'table' | 'card'", desc: '视图模式切换' },
      { name: 'loaded', payload: '{ list, total }', desc: '数据加载完成' },
      { name: 'apiBefore', payload: '{ url, method, params }', desc: '请求前' },
      { name: 'apiAfter', payload: '—', desc: '请求完成' }
    ],
    slots: [
      { name: 'default', params: '—', desc: 'el-table-column 集合（业务列）' },
      { name: 'toolbar', params: '{ selection, list }', desc: '左侧工具栏' },
      { name: 'empty', params: '—', desc: '空数据插槽' },
      { name: 'card-item', params: '{ row, index }', desc: '卡片模式单项' }
    ],
    expose: ['requestApi', 'refresh', 'getSelection', 'clearSelection', 'search', 'resetSearch', 'tableRef']
  },
  {
    path: 'editable-table',
    name: 'WdEditableTable',
    title: 'EditableTable 可编辑表格',
    desc: '基于 el-table 的可编辑表格：单元格/行双编辑模式、脏行跟踪、批量保存、required + 自定义校验门控',
    group: '数据',
    props: [
      { name: 'columns', type: 'EditableColumn[]', default: '[]', desc: '列配置（prop/label/editor/required/validator 等）' },
      { name: 'modelValue', type: 'object[]', default: '[]', desc: '行数据（v-model）' },
      { name: 'editMode', type: "'cell' | 'row'", default: "'cell'", desc: '编辑模式' },
      { name: 'saveApi', type: 'string', default: "''", desc: '批量保存地址；为空仅本地提交并 emit save' },
      { name: 'saveMethod', type: "'post' | 'put'", default: "'post'", desc: '保存请求方法' },
      { name: 'defaultRow', type: 'object | () => object', default: '—', desc: '新增行默认值' },
      { name: 'rowKey', type: 'string', default: "'id'", desc: '行主键' },
      { name: 'withToolbar', type: 'boolean', default: 'true', desc: '显示工具栏' },
      { name: 'withAdd', type: 'boolean', default: 'true', desc: '新增按钮' },
      { name: 'withSave', type: 'boolean', default: 'true', desc: '批量保存按钮' },
      { name: 'withDelete', type: 'boolean', default: 'true', desc: '删除按钮' },
      { name: 'withIndex', type: 'boolean', default: 'false', desc: '序号列' },
      { name: 'withActions', type: 'boolean', default: 'true', desc: '操作列' },
      { name: 'addButtonText', type: 'string', default: "'新增一行'", desc: '新增按钮文案' },
      { name: 'saveButtonText', type: 'string', default: "'批量保存'", desc: '保存按钮文案' },
      { name: 'actionWidth', type: 'string | number', default: '150', desc: '操作列宽度' },
      { name: 'border', type: 'boolean', default: 'true', desc: '边框' },
      { name: 'stripe', type: 'boolean', default: 'true', desc: '斑马纹' },
      { name: 'size', type: "'large' | 'default' | 'small'", default: "'default'", desc: '尺寸' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '保存成功后刷新目标 DataGrid' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'update:modelValue', payload: 'rows', desc: '行数据变化' },
      { name: 'change', payload: 'rows', desc: '任意编辑触发' },
      { name: 'save', payload: '{ rows, all, data? }', desc: '批量保存成功' },
      { name: 'row-add', payload: 'row', desc: '新增行' },
      { name: 'row-remove', payload: 'index', desc: '删除行' },
      { name: 'validate-fail', payload: '{ index, row, error }', desc: '校验失败' },
      { name: 'apiBefore', payload: '{ url, rows }', desc: '保存请求前' },
      { name: 'apiSuccess', payload: '{ data }', desc: '保存成功' },
      { name: 'apiFail', payload: '{ code, message }', desc: '保存失败' },
      { name: 'apiException', payload: '{ error, message }', desc: '保存异常' },
      { name: 'apiAfter', payload: '—', desc: '保存完成' }
    ],
    slots: [
      { name: 'toolbar', params: '{ dirtyRows, rows }', desc: '工具栏左侧' },
      { name: 'actions', params: '{ dirtyRows, rows }', desc: '工具栏右侧' },
      { name: 'edit-{prop}', params: '{ row, index, column }', desc: '自定义某列编辑器' },
      { name: 'row-actions', params: '{ row, index }', desc: '操作列追加' },
      { name: 'empty', params: '—', desc: '空数据' }
    ],
    expose: ['saveAll', 'validate', 'addRow', 'getDirtyRows', 'tableRef']
  },
  {
    path: 'dataform',
    name: 'WdDataForm',
    title: 'DataForm 数据表单',
    desc: '自动表单：mode(create/edit) + 详情回填 + 校验 + 修改检测 + 提交联动关抽屉/刷新表格/连续操作，适合弹窗内维护数据',
    group: '表单',
    props: [
      { name: 'mode', type: "'create' | 'edit'", default: "'create'", desc: '新增/编辑模式' },
      { name: 'api', type: 'string', default: "''", desc: '详情接口（edit 模式回填）' },
      { name: 'apiMethod', type: "'get' | 'post'", default: "'get'", desc: '详情接口方法' },
      { name: 'apiParam', type: 'object', default: '{}', desc: '详情接口参数' },
      { name: 'submitApi', type: 'string', default: "''", desc: '提交接口' },
      { name: 'submitMethod', type: "'post' | 'put'", default: "'post'", desc: '提交方法' },
      { name: 'submitKeys', type: 'string | string[]', default: '—', desc: '提交字段白名单' },
      { name: 'submitExcludeKeys', type: 'string | string[]', default: '—', desc: '提交字段黑名单' },
      { name: 'active', type: 'boolean', default: 'false', desc: 'edit 模式自动请求详情' },
      { name: 'confirmLeave', type: 'boolean', default: 'true', desc: '有未保存修改时离开确认' },
      { name: 'withActions', type: 'boolean', default: 'true', desc: '显示底部操作区' },
      { name: 'actionConfig', type: 'object', default: '{}', desc: '按钮文案 { resetText, submitText, continueText, closeText, showReset, showContinue }' },
      { name: 'headCloseDrawer', type: 'boolean | string', default: 'true', desc: '提交成功后关闭容器' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '提交成功后刷新目标 DataGrid' },
      { name: 'keepFormButton', type: 'boolean', default: 'true', desc: 'create 模式显示"保存并继续"' },
      { name: 'rules', type: 'object', default: '{}', desc: 'el-form 校验规则' },
      { name: 'labelWidth', type: 'string | number', default: "'100px'", desc: '标签宽度' },
      { name: 'labelPosition', type: "'left' | 'right' | 'top'", default: "'right'", desc: '标签位置' },
      { name: 'inline', type: 'boolean', default: 'false', desc: '行内模式' },
      { name: 'data', type: 'object', default: '—', desc: '外部初始数据（DrawerButton drawerData 等）' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'submit-success', payload: 'data', desc: '提交成功' },
      { name: 'submit-fail', payload: 'result', desc: '提交失败' },
      { name: 'load-success', payload: 'data', desc: '详情加载成功' },
      { name: 'change', payload: 'formData', desc: '表单值变化' },
      { name: 'close', payload: '{ reason }', desc: '请求关闭' },
      { name: 'apiBefore', payload: '{ type }', desc: '请求前' },
      { name: 'apiAfter', payload: '{ type }', desc: '请求完成' }
    ],
    slots: [
      { name: 'default', params: '{ model, form }', desc: '表单字段（el-form-item + v-model="model.xxx"）' },
      { name: 'footer', params: '{ submit, reset, loading }', desc: '底部操作区' }
    ],
    expose: ['requestApi', 'submitForm', 'resetForm', 'validate', 'getFormData', 'isDirty', 'beforeLeave', 'fillForm']
  }
]
