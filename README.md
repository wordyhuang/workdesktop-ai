<p align="center">
  <strong>WorkDesktop AI</strong><br/>
  <span>企业级 Vue 3 组件库 · 基于 ElementPlus · HTML 模板友好 / AI 编码友好</span>
</p>

> 文档版本：V\_1.0 ｜ 创建时间：2026-09-16 22:03:47 ｜ 最后修改时间：2026-09-16 22:03:47
> 适用对象：使用本库的开发者（人类阅读；AI 助手请改读 [llms.txt](./llms.txt)）
> 核心目标：帮助开发者快速了解、安装并上手 WorkDesktop AI
> 文档简述：项目门面说明，覆盖特性、安装、三种引入方式、全局配置、组件总览、请求核心、Hooks 与本地开发指引。当前库版本：v1.0.2

***

WorkDesktop AI 是一套面向企业后台管理场景的 Vue 3 组件库，在 ElementPlus 之上做「场景化复合封装」：

- **列表一体化**：`DataGrid` 一个组件完成「查询 + 分页 + 工具栏 + 表格 + 列设置 + 卡片/表格切换」；
- **请求一体化**：内置 axios 封装，自动完成 `{ code, message, data }` 解封包、Loading、错误提示；
- **AI 编码友好**：`HTML 模板渲染优先`，组件用标签即所得，TypeScript 类型完整；仓库根目录附带面向 AI 的 [llms.txt](./llms.txt)；
- **双入口**：既支持 npm 工程化使用，也支持浏览器 `<script>` 直引（UMD），无需构建。

## 特性

| 能力         | 说明                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| 28 个业务组件   | DataGrid / EditableGrid / Viewer / DataForm / SearchPanel / 8 类按钮 / Drawer / Iframe / Station 整页布局 等 |
| 三级配置       | 内置默认 → 全局（`app.use` / `window.workDesktopConfig`）→ 组件 props，deep merge                               |
| 内置 HTTP    | axios 封装：统一封包格式、URL 前缀、Loading、失败/异常提示、请求监听、并发去重、子实例配置；请求核心 `RequestAPI` 公开，支持手动调用 API 请求代码          |
| 声明式联动      | 属性（`filter` 分组 + `head-refresh-datagrid` 刷新）+ 事件驱动（A+B 混合），无需引入中心化 DSL                               |
| 组合式 Hooks  | `useRequest` / `useDataGrid` / `useConfig` / `useGlobalConfig` / `useEventBus` / `useGlobalState`    |
| 双产物 + 按需入口 | `dist/index.esm.js` + `dist/index.umd.js` + 27 个组件子路径入口 + 完整 `.d.ts`                                 |
| 开箱主题       | 语义色令牌 + CSS 变量覆盖 + 配置对象生成主题                                                                          |
| 测试保障       | vitest + @vue/test-utils：106 用例，基础库行覆盖率 98%                                                          |

## 安装

```bash
npm install workdesktop-ai element-plus @element-plus/icons-vue
```

`vue`（^3.3）与 `element-plus`（^2.5）为 peer 依赖，由宿主项目安装；`axios` 已打进产物。

## 快速开始

### npm 全量引入

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import WorkDesktop from 'workdesktop-ai' // Vue 插件：全量注册 28 个组件
import 'workdesktop-ai/style.css'

const app = createApp(App)
app.use(ElementPlus, { locale: zhCn })
app.use(WorkDesktop, {
  request: { urlPrefix: '/api' } // 可选的全局配置，见下文「全局配置」
})
app.mount('#app')
```

模板中直接写组件：

```html
<wd-search-panel head-refresh-datagrid filter="main" collapsible>
  <template #default="{ model }">
    <el-form-item label="姓名">
      <el-input v-model="model.name" placeholder="模糊搜索姓名" clearable />
    </el-form-item>
  </template>
</wd-search-panel>

<wd-data-grid api="/user/list" :active="true" filter="main">
  <el-table-column prop="id" label="ID" width="80" />
  <el-table-column prop="name" label="姓名" min-width="120" />
  <el-table-column prop="dept" label="部门" width="110" />
  <el-table-column prop="createTime" label="创建时间" min-width="120" />
</wd-data-grid>
```

> 搜索面板与表格配置相同 `filter`，点击「查询」即自动刷新表格并重置到第一页 —— 无需写任何联动代码。

### 按需引入

方式一：主入口命名导出（tree-shaking 由构建工具完成）：

```ts
import { createApp } from 'vue'
import { WdDataGrid, WdDataForm } from 'workdesktop-ai'
import 'workdesktop-ai/style.css'

const app = createApp(App)
app.component(WdDataGrid.name, WdDataGrid)
app.component(WdDataForm.name, WdDataForm)
```

方式二：子路径按需入口（27 个子路径，产物与样式都可按组件粒度引入）：

```ts
import WdDataGrid from 'workdesktop-ai/data-grid'
import 'workdesktop-ai/base.css'            // 基础样式（必引）
import 'workdesktop-ai/data-grid/style.css' // 该组件的样式
```

- 子路径命名规则为组件名的 kebab-case：`data-grid` / `data-form` / `drawer-button` / `search-panel` / `station` 等；
- 其中 14 个组件带独立 `style.css`（data-grid、data-form、editable-grid、drawer、iframe、panel、viewer、station、search-panel、search-item、form-item、auto-complete、image-upload、tips），其余组件无额外样式；
- 注意：`WdPopconfirmButton` 没有子路径入口，只从主入口 `import { WdPopconfirmButton } from 'workdesktop-ai'` 引入。

### 纯 script 直引（UMD，无需构建）

在 HTML 中依次引入 Vue3、ElementPlus、图标库与本库产物：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css" />
  <link rel="stylesheet" href="./dist/style.css" />
</head>
<body>
  <div id="app">
    <wd-data-grid :data-source="rows" :active="false" with-index>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="age" label="年龄" width="90" />
    </wd-data-grid>
  </div>

  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <script src="https://unpkg.com/element-plus/dist/index.full.min.js"></script>
  <script src="https://unpkg.com/@element-plus/icons-vue/dist/index.iife.min.js"></script>
  <!-- UMD 产物：挂载到 window.WorkDesktop -->
  <script src="./dist/index.umd.js"></script>
  <script>
    // 全局配置（可选，在 install 之前声明即可）
    window.workDesktopConfig = {
      request: { urlPrefix: '/api' },
      theme: { colors: { primary: '#2f6bff' } }
    }
    const { WorkDesktop } = window.WorkDesktop
    const app = Vue.createApp({
      setup() { return { rows: [{ name: '张三', age: 28 }] } }
    })
    app.use(ElementPlus)
    app.use(WorkDesktop)
    app.mount('#app')
  </script>
</body>
</html>
```

## 全局配置

配置按 **默认层 → 全局层 → 组件 props** 三级覆盖（deep merge）。全局层可通过插件的第二个参数，或在纯 script 场景下通过 `window.workDesktopConfig` 声明：

```ts
app.use(WorkDesktop, {
  // HTTP
  request: {
    urlPrefix: '/api',
    axiosConfig: { timeout: 15000 }, // 透传给 axios
    loading: { enable: true },
    dedup: true, // 并发相同请求合并去重（method+url+params 一致只发一次）
    transform: {
      requestInterceptor: (config) => config, // 发请求前改写 axios 配置
      responseInterceptor: (res) => res // 拿到响应后改写
    }
  },
  // 响应约定：{ code, message, data }，code >= successCode 视为成功
  response: { successCode: 0 },
  // 每个组件的默认 props
  page: {
    componentDefault: {
      WdDatagrid: { withPager: true, pageSize: 20 },
      WdDataForm: { submitApi: '/save' }
    }
  },
  // 主题
  theme: { colors: { primary: '#2f6bff' }, cssVars: { '--wd-radius': '8px' } }
})
```

组件级 props 优先级最高，三者按需覆盖。运行期也提供 API：`setGlobalConfig` / `mergeConfig` / `getGlobalConfig` / `resetConfig`。

> 注意：配置在组件挂载时读取一次并缓存，运行中修改全局配置只影响之后新挂载的组件；已挂载组件可通过变更 `:key` 强制重建。

## 与 ElementPlus 的边界

- 基础控件（按钮、输入框、下拉、表格单元格等）继续使用 ElementPlus，**不重复造轮子**；
- 本库只做场景化复合与业务约定的封装，宿主对 ElementPlus 的使用方式完全不受影响。

## 组件总览（28 个）

| 分组       | 组件                                                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 数据       | `WdDataGrid`（分页表格）、`WdEditableGrid`（可编辑表格）、`WdViewer`（详情描述列表）                                                                                                               |
| 表单       | `WdDataForm`（数据表单）、`WdSearchPanel`（搜索面板）、`WdFormItem` / `WdSearchItem`（表单项包装）                                                                                               |
| 按钮组（8 个） | `WdApiButton` / `WdConfirmButton` / `WdPopconfirmButton` / `WdPromptButton` / `WdRouteButton` / `WdTipsButton` / `WdDrawerButton`（`mode` 切换抽屉/对话框）/ `WdDialogButton`（对话框专用） |
| 容器       | `WdDrawer`（`mode` 切换抽屉/对话框，支持 iframe 宿主）、`WdIframe`（iframe 嵌入与通信）                                                                                                           |
| 输入选择     | `WdSelect` / `WdAutoComplete` / `WdCheckboxList` / `WdRadioList` / `WdSwitch`（切换即请求，失败自动回滚）                                                                                 |
| 上传       | `WdUpload`（文件）、`WdImageUpload`（图片，强制 image/\*）                                                                                                                              |
| 样式       | `WdPanel`（面板）、`WdTips`（提示图标/提示框）                                                                                                                                            |
| 布局       | `WdStation`（管理台整页布局：菜单分组 / 标签页 / 工具栏 / 页脚）                                                                                                                                  |
| 核心       | `WdRequester`（命令式请求触发器，v-model 开关语义）                                                                                                                                        |

## 手动调用请求（RequestAPI）

本库所有请求类组件（DataGrid / DataForm / 按钮组 / 输入选择 / 上传等）都基于同一个请求核心开发，该核心对外公开，开发者可以在组件外**手动调用 API 请求代码**：

```ts
import { RequestAPI, request, type ApiResult } from 'workdesktop-ai'

// 方式一：全局单例（与组件共用同一套 urlPrefix / loading / 提示 / 解封逻辑）
const result: ApiResult = await request.get('/user/list', { currentPage: 1, pageSize: 20 })
if (result.success) {
  console.log(result.data) // 已解封的业务 data
}

// 方式二：new RequestAPI() 自建独立实例（可传 axios 配置：baseURL / timeout / headers 等）
const customApi = new RequestAPI({ baseURL: '/other-api', timeout: 20000 })
await customApi.post('/user/save', { name: '张三' })

// 方法一致：get / post / put / delete / request；业务失败 resolve(success=false)，仅网络异常 reject
```

`reqOptions` 可覆盖项：`{ showLoading?, showTips?, tipsConfig?, axiosConfig?, signal?, dedup? }`；可用 `request.on(handler)` 订阅 `apiBefore / apiSuccess / apiFail / apiException / apiAfter` 请求事件。

## Hooks

```ts
import { useRequest, useDataGrid, useEventBus } from 'workdesktop-ai'

// 请求：自动 loading / 错误处理
const { data, loading, run, refresh } = useRequest('/user/detail', { immediate: true })

// 表格数据流
const grid = useDataGrid({ api: '/user/list', immediate: true })
await grid.search({ name: '张' })
```

## AI 编码助手

仓库根目录提供 [llms.txt](./llms.txt) —— 面向 AI 的机器可读全量参考（28 个组件 API、配置体系、请求协议、声明式联动、跨 iframe 通信协议、常见陷阱清单）。使用 Copilot / Cursor / Trae 等 AI 助手开发时，让它先阅读该文件，可显著减少组件误用。

## 本地开发

```bash
npm install        # 安装依赖
npm run dev        # 本地 Playground（vite）
npm run docs:dev   # 文档站本地预览
npm test           # 单元 / 集成测试
npm run test:coverage  # 覆盖率（阈值：lines/funcs ≥ 80%，branches ≥ 70%）
npm run typecheck  # 类型检查（vue-tsc）
npm run build      # 产出 ESM + UMD + .d.ts 到 dist/
```

## 项目示例与文档站启动

### 文档站

项目内置独立文档站（Vue Vite 应用），包含组件完整文档、API 表格、可运行代码示例：

```bash
cd code
npm install      # 如果已安装过依赖可跳过
npm run docs:dev # 启动文档站，默认 http://localhost:5003
```

打开浏览器访问即可查看每个组件的 API 与在线可运行示例。所有示例均可「查看代码」复制粘贴直接使用。

### 纯 HTML UMD 示例

项目内置 `code/examples/index.html`，可直接打开浏览器查看纯 script 标签引入用法（UMD 全局版本）。也可以启动一个简单 HTTP 服务器预览：

```powershell
# PowerShell 自带 Python，无需额外安装
cd code
python -m http.server 8000
# 打开浏览器访问 http://localhost:8000/examples/index.html
```

```cmd
::  cmd 下也一样
cd code
python -m http.server 8000
```

### Playground

`npm run dev` 可启动组件调试游乐场，用于开发测试新组件或修改现有组件。

## 参与贡献

欢迎提交 Issue 与 PR，详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。版本变更记录见 [CHANGELOG.md](./CHANGELOG.md)。

## License

[MIT](./LICENSE)

***

## 版本变化

- **V\_1.0**（2026-09-16 22:03:47）：首次建立带版本标注的 README。相对旧版的变化：
  1. 组件总数 25 → 28（按 `src/components/index.ts` 实际导出核对）；
  2. 「组件总览」按源码分组重排：`WdViewer` 归入数据组、`WdSearchPanel`/`WdFormItem`/`WdSearchItem` 归入表单组，补齐旧版遗漏的 `WdRequester`、`WdFormItem`、`WdSearchItem`、`WdDialogButton`、`WdPopconfirmButton`、`WdStation`；
  3. 「按需引入」新增子路径入口方式（27 个子路径 + 14 个独立样式说明，标注 `WdPopconfirmButton` 仅主入口）；
  4. 特性表补充「并发去重」「27 个组件子路径入口」，Hooks 列表补齐 `useGlobalConfig` / `useGlobalState`；
  5. 新增「AI 编码助手」章节，指引阅读仓库根目录的 `llms.txt`；
  6. `reqOptions` 补充 `dedup` 项；全局配置示例补充 `dedup`，并新增「配置挂载时缓存」注意提示；
  7. 头部新增文档版本信息块（版本 / 时间 / 适用对象 / 目标 / 简述），文尾新增本「版本变化」章节。

