# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

- 暂无

## [1.0.2] - 2026-09-06

文档示例告警治理与 HTML 模板渲染友好性修复。基于文档站 24 个组件页 + 7 个场景页的自动化控制台检测，修复 5 类 Vue / Element Plus 警告。

### Fixed

**按钮组 text 属性透传报错（影响 5 个按钮）**

- `WdApiButton`、`WdConfirmButton`、`WdPromptButton`、`WdRouteButton`、`WdTipsButton` 新增 `text` 文字 prop（String），支持 `text="保存配置"` 属性式写法；默认插槽兜底渲染 `{{ text }}`。
- 根因：组件未声明 `text` 时，属性式写法的字符串会经 `$attrs` 透传给 `el-button`，而 el-button 的 `text` 是 Boolean 型「文字按钮」开关，触发类型校验警告。声明 prop 后该属性自动从 `$attrs` 移除。统一对齐 `WdDrawerButton` / `WdDialogButton` 已有的 `text` + 插槽范式。

**WdImageUpload thumbnailSize 类型**

- `thumbnail-size` prop 类型由 `Number` 放宽为 `[Number, String]`，兼容 HTML 属性式字符串写法（如 `thumbnail-size="90"`），`v-bind` CSS 对两种类型均正确产出像素值。

**WdDataForm 编辑态首帧控件告警**

- 同步数据（`props.data` / 容器 `data`）的回填由 `onMounted` 提前到 setup 阶段（首次渲染前），避免插槽内 `el-switch` / `el-radio` 等控件首帧绑定 `undefined` 触发 Element Plus 校验警告；api 异步详情仍在 `onMounted` 拉取并覆盖。

**WdAutoComplete v-loading 指令告警**

- `v-loading` 由根节点 `el-autocomplete`（根为 ElTooltip / fragment 非单一原生元素）移至包裹 `<div>`，修复 "Runtime directive used on component with non-element root node at <ElPopper>" 告警。

**文档示例**

- `select` 远程搜索示例补全 `value-prop="id" text-prop="name"`：mock `/user/list` 返回用户对象主键为 `id`、名称字段为 `name`（非默认 `value` / `text`），缺失映射导致 `el-option` 的 `value` 为 `undefined` 告警。

## [1.0.1] - 2026-09-05

1.0.0 修订发布。

## [1.0.0] - 2026-09-05

首个正式发布。

### Added

**基础设施**

- HTTP 客户端 `request` / `http`：axios 封装，统一 `{ code, message, data }` 解封包、`urlPrefix` 前缀、Loading、成功/失败/异常提示、请求全生命周期监听、`create()` 子实例配置覆盖、请求/响应拦截器。
- 三级配置系统：内置默认配置 → 全局配置（`app.use` 第二参 / `window.workDesktopConfig`）→ 组件 props，deep merge；运行期 API `initConfig / setGlobalConfig / getGlobalConfig / mergeConfig / resetConfig`。
- 主题系统：语义色令牌（primary/success/warning/danger/info）与自定义 CSS 变量，支持配置对象生成 + CSS 变量覆盖。
- 声明式联动注册中心（`registerDataGrid / refreshDataGrid / searchDataGrid / resetSearchDataGrid / getDataGrids`）：属性式联动（`head-refresh-datagrid` / `head-close-drawer` 等）。
- 组合式 Hooks：`useRequest`、`useDataGrid`、`useConfig`、`useGlobalConfig`、`useEventBus`、`useGlobalState`。
- 轻量事件总线 `useEventBus` 支持跨层级事件驱动联动。

**数据组件**

- `WdDataGrid`：API / 静态双数据源、分页、搜索联动、工具栏（刷新 / 表格大小 / 视图切换）、动态列设置与本地持久化、序号列、多选、树形数据、卡片模式、行操作列场景规范。
- `WdEditableTable`：单元格级可编辑表格。
- `WdDataForm`：新增 / 编辑 / 详情回填、校验、提交（含保存并继续）、API 加载、字段白/黑名单、改动检测（`isDirty` / 离开拦截）、提交后联动刷新目标 DataGrid。

**按钮组（7）**

- `WdApiButton`、`WdConfirmButton`、`WdPromptButton`、`WdRouteButton`、`WdTipsButton`、`WdDrawerButton`、`WdDialogButton`。

**容器组（4）**

- `WdDialog`、`WdDrawer`、`WdIframe`、`WdSearchPanel`（含头部刷新/重置声明式联动）。

**输入选择组（5）**

- `WdSelect`、`WdAutoComplete`、`WdCheckboxList`、`WdRadioList`、`WdSwitch`。

**上传组（2）**

- `WdUpload`（单/多文件、模板下载、错误回显）、`WdImageUpload`（图片预览与裁剪配合 Viewer）。

**展示与工具**

- `WdPanel`、`WdTips`（长内容悬停提示）、`WdViewer`（图片 / PDF / 文档预览，缩放旋转翻页）。

**工程与质量**

- Vite 库模式双产物：ESM（`index.esm.js`）+ UMD（`index.umd.js`，全局名 `WorkDesktop`）+ 全量 `.d.ts` + 汇总 `style.css`。
- TypeScript 全类型导出；文档站（组件示例 + 场景演示 + Playground）、Mock 服务。
- 测试体系：vitest + @vue/test-utils，基础设施单测 87 用例 + DataGrid/DataForm 集成 19 用例，基础库行覆盖率 98%。
- 中文内置文案，语义化版本与开源配置（MIT）。

[Unreleased]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/wordyhuang/workdesktop-ai/releases/tag/v1.0.0
