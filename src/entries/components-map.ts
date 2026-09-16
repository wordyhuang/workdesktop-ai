/**
 * 组件到子路径名的映射
 * 用于：1) 生成 entries 入口  2) vite 构建多入口  3) package.json exports 对齐
 *
 * key:   子路径名（kebab-case，用户 import 时的路径）
 * value: 组件源文件相对路径（相对于 src/components/）
 */
export const componentMap: Record<string, string> = {
  // 数据组件
  'data-grid': 'data/datagrid/DataGrid.vue',
  'editable-grid': 'data/editable-grid/EditableGrid.vue',

  // 表单组件
  'data-form': 'form/data-form/DataForm.vue',
  'search-panel': 'form/SearchPanel.vue',
  'form-item': 'form/FormItem.vue',
  'search-item': 'form/SearchItem.vue',

  // 按钮组
  'api-button': 'buttons/ApiButton.vue',
  'confirm-button': 'buttons/ConfirmButton.vue',
  'dialog-button': 'buttons/DialogButton.vue',
  'prompt-button': 'buttons/PromptButton.vue',
  'route-button': 'buttons/RouteButton.vue',
  'tips-button': 'buttons/TipsButton.vue',
  'drawer-button': 'buttons/DrawerButton.vue',

  // 容器组
  'drawer': 'containers/Drawer.vue',
  'iframe': 'containers/Iframe.vue',

  // 输入选择组
  'select': 'inputs/Select.vue',
  'auto-complete': 'inputs/AutoComplete.vue',
  'checkbox-list': 'inputs/CheckboxList.vue',
  'radio-list': 'inputs/RadioList.vue',
  'switch': 'inputs/Switch.vue',

  // 上传组
  'upload': 'upload/Upload.vue',
  'image-upload': 'upload/ImageUpload.vue',

  // 样式组
  'panel': 'styles/Panel.vue',
  'tips': 'styles/Tips.vue',

  // 内容查看器
  'viewer': 'data/viewer/Viewer.vue',

  // 布局组件
  'station': 'layout/Station.vue',

  // 核心
  'requester': 'core/Requester.vue'
}
