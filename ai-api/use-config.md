> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# Config 全局配置

三级配置覆盖（默认层 → 全局层 → 组件 Props）；读取用 useGlobalConfig()/getGlobalConfig()，运行中修改用 setGlobalConfig()/mergeConfig()，组件内合并用 useConfig()

### 概述

Config 是 WorkDesktop 的全局配置体系，采用三级配置覆盖：默认层（库内置 defaultConfig）→ 全局层（app.use 或 window.workDesktopConfig 注入）→ 组件 Props。读取用 `useGlobalConfig()` / `getGlobalConfig()`，运行中修改用 `setGlobalConfig()` / `mergeConfig()`，组件内合并用 `useConfig()`。通过它可以在不改业务代码的前提下，统一调整请求前缀、分页字段、响应字段名、主题色乃至单个组件类型的 props 默认值。

### 何时使用

- 项目初始化时统一注入请求前缀、分页字段名、响应字段名等全局约定（如后端返回结构不是 `{ code, message, data }`）。
- 需要按组件类型批量设置 props 默认值（如全站 WdRequester 默认用 GET、WdDataGrid 默认 withPager）。
- 运行中需要动态调整全局配置（如切换租户后修改 pageSize、主题色）。
- 封装业务组件时，需要合并「组件全局默认」与「调用方 props」。
- 不建议：只想调整单个组件的一次行为——直接传 props 即可，无需走全局配置。
- 不建议：需要在已挂载组件上立即生效的动态响应式配置——配置在组件挂载时读取一次并缓存，运行中修改只影响之后新挂载的组件。

### 注意事项

- **三级覆盖优先级**：默认层 < 全局层 < 组件 Props。单个组件的临时调整直接传 props，不要动全局配置。
- **运行中修改只对「之后挂载」的组件生效**：已挂载组件在 onMounted 时读取一次并缓存。需要立即生效时可用 `:key` 强制重建组件（官方示例即采用此方式演示 WdRequester 默认 method 切换）。
- **setGlobalConfig 是增量合并**：只需传入要改的分支，如 `setGlobalConfig({ page: { pager: { pageSize: 15 } } })`，不会影响其他配置项。
- **componentDefault 的 key 是组件 name**：如 `WdRequester`、`WdDataGrid`，写错名字不会生效。
- **示例页面离开时应恢复现场**：动态修改全局配置的页面建议在 onUnmounted 中恢复默认值，避免影响其他页面（官方示例做法）。
- **响应字段名不一致无需改后端**：通过 `response.props`（code/message/data）与 `response.list`（list/total/pageSize/currentPage）全局改名即可。

### 常见问题

**问：useGlobalConfig() 和 getGlobalConfig() 有什么区别？**

`useGlobalConfig()` 读取「默认层 + 全局层」merge 后的最终生效配置；`getGlobalConfig()` 只读取当前全局层配置（非响应式），即用户实际注入/修改过的那一层。

**问：运行中用 setGlobalConfig 改了配置，为什么页面上的组件没变化？**

组件在 onMounted 时读取一次配置并缓存，运行中修改只影响之后新挂载的组件。如需验证新配置，可通过 `:key` 变化强制组件重建。

**问：script 引入（非 npm）项目如何注入全局配置？**

在加载组件库前设置 `window.workDesktopConfig`，结构与 app.use 第二参完全一致。

**问：如何恢复出厂配置？**

调用 `resetConfig()` 即可恢复为库内置默认配置。

### API（import 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| useGlobalConfig() | — | WorkDesktopConfig | 读取当前生效的全局配置（默认层 + 全局层 merge 结果） |
| setGlobalConfig(partial) | DeepPartial<WorkDesktopConfig> | WorkDesktopConfig | 增量合并到全局层并返回新配置；影响新挂载组件 |
| mergeConfig(local?) | local?: DeepPartial \| Record<string,any> | WorkDesktopConfig | 本地层合并（local > global > default），产出最终配置 |
| getGlobalConfig() | — | WorkDesktopConfig | 读取当前全局层配置（非响应式） |
| resetConfig() | — | WorkDesktopConfig | 恢复为库内置默认配置 |
| useConfig(componentName?, props?) | string, Record<string,any> | ShallowRef<T> | 组件封装者用：合并 componentDefault 与本地 props（props 非 undefined 覆盖默认） |

### 数据类型

#### WorkDesktopConfig（全局配置）

引用：`useGlobalConfig()` / `setGlobalConfig()` / `mergeConfig()` 等方法的参数与返回值；`app.use(WorkDesktop, config)` 第二参

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| page | PageConfig | 否 | 内置默认 | 页面级配置：global.size（组件默认尺寸）、componentDefault（按组件名覆盖 props 默认值）、pager（分页默认，见 PagerConfig） |
| request | RequestConfig | 否 | 内置默认 | 请求配置：urlPrefix / throwException / dedup / loading / axiosConfig / pageParam / transform |
| response | ResponseConfig | 否 | 内置默认 | 响应解封与提示配置，见下方补充说明 |
| theme | ThemeConfig | 否 | 内置默认 | 主题配置：colors（主题色令牌）、cssVars（CSS 变量覆盖，优先级高于 colors） |

**PagerConfig**：`{ size, pageSizes, pageSize, layout, hideOnSinglePage, position }`，对应 DataGrid 分页器默认值（position 为 left / center / right）。

**PageParamConfig**：`{ pageField, sizeField, searchField }`，分页与搜索参数的字段名映射（默认 currentPage / pageSize / param）。

**ResponseConfig**：`props`（响应体中 code / message / data 的字段名映射）、`successCode`（判定成功的状态码）、`list`（列表响应的字段名映射 listName / totalName / pageSizeName / currentPageName）、`success / fail / exception`（成功 / 业务失败 / 网络异常三类 TipsConfig）、`complete`（请求完成时的提示语义类型）。

**TipsConfig**：`{ tipsMode: 'message' | 'notify' | 'messagebox' | 'none', tipsType, showTips?, title?, props? }`。

各配置路径的内置默认值见上文「参数 / 配置项」章节的对照表。

#### DeepPartial<T>（递归可选）

引用：`setGlobalConfig(partial)` / `mergeConfig(local?)` 的参数类型

将 T 的所有字段（含嵌套对象）递归变为可选，用于「只传要覆盖的字段」的增量配置：

```ts
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }
```
