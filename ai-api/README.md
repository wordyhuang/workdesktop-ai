# WorkDesktop AI 组件 API 参考（路由）

> **本目录由脚本自动生成，请勿手工编辑。**
>
> - 数据源：`docs/src/api-meta/`（文档站组件页与本目录的共同单一源）
> - 生成命令：`npm run gen:ai-api`
> - 生成时间：2026-10-26 13:46:54（Asia/Shanghai）
> - 组件源码：`src/components/**/*.vue`；类型声明：`dist/types/`
>
> 覆盖 32 个组件（Wd 前缀）的 Props / Events / Slots / 暴露方法与自定义数据类型，
> 以及 3 个基础设施 API（全局配置、HTTP 请求核心、皮肤主题）。
> 组件的组合用法与交互约定见 [ai-router.md](../ai-router.md) 与 `scenarios/**.md`。

## 使用流程（AI 必读）

1. 先按场景判定命中组件（见 [ai-router.md](../ai-router.md) 的场景判定速查表与 `scenarios/**.md`）。
2. 在下方「组件索引」定位目标组件，**只打开它对应的子文件**（如 [WdSelect 选择器](./wd-select.md)），不要通读本目录全部子文件。**文件名规律（知道组件名即可直接构造路径，不必先翻索引）**：Wd 组件为 `wd-{组件名kebab}.md`（WdSelect → `wd-select.md`、WdImageUpload → `wd-image-upload.md`）；3 个基础设施页为 `use-config.md` / `use-request.md` / `custom-skin.md`。**需要 HTTP 请求的完整执行流程、配置全景、代码示例或排错表时，直接读手写版 [use-request-guide.md](./use-request-guide.md)**，它是自动生成的 use-request.md 的详细补充。
3. 子文件内的 Props / Events / Slots / 暴露方法 / 数据类型 / Element Plus 透传，即该组件的全部 API 事实；需要 Element Plus 原生属性/事件的权威定义时，结合子文件「Element Plus 透传」小节与官方文档。

## 阅读约定

- 类型列统一放在反引号中；联合类型写作 `'a' \| 'b'`。
- 默认值 `—` 表示无默认值（必传项或行为型开关）。
- Props 说明中标注「继承自 el-xxx / 透传」的属性是 Element Plus 原生属性，经 `$attrs` 透传生效，源码 `defineProps` 中不显式声明，使用时同样可直接传入。
- 事件参数、插槽参数、方法签名均按元数据原样列出；复杂结构见各组件「数据类型」章节。

## Element Plus 属性与事件透传规则

所有 Wd 组件均基于 Element Plus 二次封装。能否直接使用 Element Plus 原生属性/事件，遵循以下三条规则；每个组件的具体结论见其子文件内「Element Plus 透传」小节。

1. **未声明的属性与事件默认透传**：组件 `defineProps` / `defineEmits` 未声明的属性（含 `onXxx` 事件监听器、class、style 等）进入 `$attrs`，由模板内部的目标 el 组件 `v-bind="$attrs"` 接收，可直接按 Element Plus 官方文档使用。各组件 Props 表中显式列出的同名属性以本组件语义为准。
2. **同名事件会被截获重发**：组件 `defineEmits` 声明过的事件名（如 `change`、`click`、`success`、`close`）**不进入** `$attrs`。即使模板内部监听了 el 组件的同名事件，也是组件先处理再重新 emit，回调参数（载荷）以本文档 Events 表为准，不保证等同于 Element Plus 原生载荷。各组件的截获清单见其子文件「Element Plus 透传」小节。
3. **厚封装/复合组件不透传**：标注「—（不透传）」的组件，根节点为自研元素或内部 el 组件未绑定 `$attrs`，Element Plus 原生属性/事件不可用，只能使用本文档列出的 props/emits 与配置项（如 columns、items、rowActions）。

Element Plus 原生 API 的权威定义以官方文档为准（[https://element-plus.org/zh-CN/component/](https://element-plus.org/zh-CN/component/)），本目录不复制其全量属性表，只声明本组件的差异、截获与边界。

## 组件索引

### 核心基础设施

- [Config 全局配置](./use-config.md)
- [HTTP 请求（RequestAPI / request 单例 / useRequest）](./use-request.md)
- [自定义皮肤](./custom-skin.md)
- [HTTP 请求详细指引（流程 / 配置全景 / 示例 / 排错）](./use-request-guide.md)

### 数据组件

- [WdDataGrid DataGrid 数据表格](./wd-datagrid.md)
- [WdEditableGrid EditableGrid 可编辑数据表格](./wd-editable-grid.md)
- [WdViewer Viewer 数据详情](./wd-viewer.md)
- [WdRequester 请求触发组件](./wd-requester.md)

### 表单组件

- [WdDataForm DataForm 数据表单](./wd-dataform.md)
- [WdSearchPanel SearchPanel 搜索表单面板](./wd-search-panel.md)
- [WdFormItem FormItem 通用表单项](./wd-form-item.md)
- [WdSearchItem SearchItem 搜索面板专用表单项](./wd-search-item.md)

### 按钮组件

- [WdApiButton ApiButton 请求按钮](./wd-api-button.md)
- [WdConfirmButton ConfirmButton 确认按钮](./wd-confirm-button.md)
- [WdDialogButton DialogButton 对话框按钮](./wd-dialog-button.md)
- [WdPopconfirmButton PopconfirmButton 气泡确认按钮](./wd-popconfirm-button.md)
- [WdPromptButton PromptButton 输入按钮](./wd-prompt-button.md)
- [WdRouteButton RouteButton 路由按钮](./wd-route-button.md)
- [WdTipsButton TipsButton 提示按钮](./wd-tips-button.md)
- [WdDrawerButton DrawerButton 弹层按钮](./wd-drawer-button.md)

### 容器组件

- [WdDrawer Drawer 抽屉 / 对话框容器](./wd-drawer.md)
- [WdIframe Iframe 内嵌框架](./wd-iframe.md)
- [WdPanel Panel 面板](./wd-panel.md)

### 表单元素

- [WdSelect Select 下拉选择](./wd-select.md)
- [WdAutoComplete AutoComplete 自动完成](./wd-auto-complete.md)
- [WdCheckboxList CheckboxList 多选列表](./wd-checkbox-list.md)
- [WdRadioList RadioList 单选列表](./wd-radio-list.md)
- [WdSwitch Switch 状态开关](./wd-switch.md)
- [WdDateRangePicker DateRangePicker 日期范围选择器](./wd-date-range-picker.md)
- [WdUpload Upload 文件上传](./wd-upload.md)
- [WdImageUpload ImageUpload 图片上传](./wd-image-upload.md)

### 页面元素

- [WdPath Path 路径（面包屑）](./wd-path.md)
- [WdAnchor Anchor 快速导航（锚点）](./wd-anchor.md)
- [WdTips Tips 提示](./wd-tips.md)
- [WdGuide Guide 指引](./wd-guide.md)

### 布局组件

- [WdStation Station 中后台外框架](./wd-station.md)
