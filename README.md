<p align="center">
  <strong>WorkDesktop AI</strong><br/>
  <span>企业级 Vue 3 组件库 · 基于 ElementPlus · HTML 模板友好 / AI 编码友好</span>
</p>

---

WorkDesktop AI 是一套面向企业后台管理场景的 Vue 3 组件库，在 ElementPlus 之上做「场景化复合封装」：

- **列表一体化**：`DataGrid` 一个组件完成「查询 + 分页 + 工具栏 + 表格 + 列设置 + 卡片/表格切换」；
- **请求一体化**：内置 axios 封装，自动完成 `{ code, message, data }` 解封包、Loading、错误提示；
- **AI 编码友好**：`HTML 模板渲染优先`，组件用标签即所得，TypeScript 类型完整；
- **双入口**：既支持 npm 工程化使用，也支持浏览器 `<script>` 直引（UMD），无需构建。

## 特性

| 能力 | 说明 |
| ---- | ---- |
| 25 个业务组件 | DataGrid / DataForm / EditableTable / SearchPanel / 7 类按钮 / Dialog / Drawer / Viewer 等 |
| 三级配置 | 内置默认 → 全局（`app.use` / `window.workDesktopConfig`）→ 组件 props，deep merge |
| 内置 HTTP | axios 封装：统一封包格式、URL 前缀、Loading、失败/异常提示、请求监听、子实例配置 |
| 声明式联动 | 属性（`head-refresh-datagrid` 等）+ 事件驱动（A+B 混合），无需引入中心化 DSL |
| 组合式 Hooks | `useRequest` / `useDataGrid` / `useConfig` / `useEventBus` / `useGlobalState` |
| 双产物构建 | `dist/index.esm.js` + `dist/index.umd.js` + `dist/style.css` + 完整 `.d.ts` |
| 开箱主题 | 语义色令牌 + CSS 变量覆盖 + 配置对象生成主题 |
| 测试保障 | vitest + @vue/test-utils：106 用例，基础库行覆盖率 98% |

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

import WorkDesktop from 'workdesktop-ai' // Vue 插件：全量注册 25 个组件
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

```ts
import { createApp } from 'vue'
import { WdDataGrid, WdDataForm } from 'workdesktop-ai'
import 'workdesktop-ai/style.css'

const app = createApp(App)
app.component(WdDataGrid.name, WdDataGrid)
app.component(WdDataForm.name, WdDataForm)
```

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

## 与 ElementPlus 的边界

- 基础控件（按钮、输入框、下拉、表格单元格等）继续使用 ElementPlus，**不重复造轮子**；
- 本库只做场景化复合与业务约定的封装，宿主对 ElementPlus 的使用方式完全不受影响。

## 组件总览

| 分组 | 组件 |
| ---- | ---- |
| 数据 | `WdDataGrid`（WdDatagrid，`<wd-data-grid>`）、`WdEditableTable` |
| 表单 | `WdDataForm`（`<wd-data-form>`） |
| 按钮组 | `WdApiButton` / `WdConfirmButton` / `WdPromptButton` / `WdRouteButton` / `WdTipsButton` / `WdDrawerButton` / `WdDialogButton` |
| 容器组 | `WdDialog` / `WdDrawer` / `WdIframe` / `WdSearchPanel` |
| 输入选择 | `WdSelect` / `WdAutoComplete` / `WdCheckboxList` / `WdRadioList` / `WdSwitch` |
| 上传 | `WdUpload` / `WdImageUpload` |
| 样式 | `WdPanel` / `WdTips` |
| 工具 | `WdViewer` |

## Hooks

```ts
import { useRequest, useDataGrid, useEventBus } from 'workdesktop-ai'

// 请求：自动 loading / 错误处理
const { data, loading, run, refresh } = useRequest('/user/detail', { immediate: true })

// 表格数据流
const grid = useDataGrid({ api: '/user/list', immediate: true })
await grid.search({ name: '张' })
```

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

## 参与贡献

欢迎提交 Issue 与 PR，详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## License

[MIT](./LICENSE)
