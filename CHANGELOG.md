# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

- 暂无

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

<!-- 仓库地址确定后，可在各版本标题补上比较链接，例如：
[Unreleased]: https://github.com/<owner>/workdesktop-ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/<owner>/workdesktop-ai/releases/tag/v1.0.0
-->
