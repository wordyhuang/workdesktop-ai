---
name: workdesktop-page
description: 用 WorkDesktop AI（workdesktop-ai / Wd 组件库 / wd- 标签）开发企业后台管理页面时使用。覆盖工作台、分页列表、表单、详情、树、批量操作、弹窗选择器、导入导出、状态 Tab 页等场景；涉及 WdStation、wd-panel、wd-datagrid、wd-dataform、wd-search-panel、wd-drawer-button 等组件，或使用纯 script（UMD）方式引入时，应先加载本 skill。
---

# WorkDesktop 页面开发

> **创建时间**：2026-11-16 17:20:00 ｜ **最后修改时间**：2026-11-19 17:30:00 ｜ **当前版本**：V_1.1
> **适用对象**：使用 workdesktop-ai 组件库产出页面的 AI 编码助手
> **核心目标**：让 AI 按固定阅读顺序取用随包文档、遵守不可违反的结构红线，稳定产出合规页面
> **文档简略描述**：本文件是薄壳（触发 + 红线 + 路由 + 自检），规范正文全部在随包的 `ai-router.md` / `scenarios/` / `ai-api/` 中

## 0. 适用版本

适用 `workdesktop-ai >= 1.2.0`。不确定时先核对宿主项目 `node_modules/workdesktop-ai/package.json` 的 `version`，低于此值部分组件与场景文档可能缺失。

## 1. 阅读顺序（禁止跳过第 3 步）

1. **本文件**——先记住第 2 节红线，再往下读。
2. `ai-router.md`——按「场景判定速查表」确定本次任务命中的场景。
3. `scenarios/00-common.md`——**必读地基**：框架搭建、容器划分、弹窗选型、操作反馈、按钮选型，所有任务都依赖。
4. 只读命中的场景子文件（见 `ai-router.md` 的速查表），**不要通读全部**。现有场景文件：`00-common` / `01-datagrid` / `02-dataform` / `03-detail` / `04-tree` / `05-batch` / `06-picker` / `07-import-export` / `08-status-tabs` / `09-workbench` / `99-spec-requests`。
5. 需要组件精确 API（props / emits / slots / 暴露方法 / 类型）时查 `ai-api/`：优先打开 `ai-api/README.md` 的组件索引定位，文件名规律为 `ai-api/wd-{组件名kebab}.md`（WdSelect → `wd-select.md`、WdImageUpload → `wd-image-upload.md`）。**注意两个例外**：WdDataGrid → `wd-datagrid.md`、WdDataForm → `wd-dataform.md`（无连字符，与子路径入口名不一致）。基础设施 3 篇：`use-config.md` / `use-request.md` / `custom-skin.md`。
6. **禁止**凭记忆猜参数；**禁止**逐个翻 `src/components/**/*.vue`。只有 `ai-api/` 未覆盖的实现细节才读源码或 `dist/types/`。

**路径基准**：下文所有 `ai-router.md` / `scenarios/` / `ai-api/` 均指**包根目录**下的文件。包根通常是宿主项目的 `node_modules/workdesktop-ai/`（本 skill 被复制到 AI 工具的 skills 目录后，与原包不再同级，因此**不要用相对路径**）。不确定包根时先读 `node_modules/workdesktop-ai/package.json` 确认存在；在本仓库内开发组件库时，包根即 `code/`。

## 2. 硬约束（违反即返工）

1. 整页外框架只用 `wd-station`；内页一级容器只用 `wd-panel`；两者之间不得再包**带视觉样式**的容器（背景 div、装饰容器）。纯布局容器豁免：页面根容器（限宽居中/纵向节奏）、栅格行列容器（grid/flex 行列）允许存在，但**不得自带背景色、边框、额外内边距**；顶条、欢迎横幅等通栏元素直接用 `header`/`section`，不包 wd-panel（细则见 scenarios/00-common.md §0.3）。
2. 不同 UI 逻辑**各自独立一个** `wd-panel`（搜索区、表格区、统计区分开）；逻辑相同的块放同一个 panel。
3. 只有一个 `wd-panel`，或页面只有「搜索 + 表格」时，panel **不传 `title`**（无标题栏）；存在多个不同逻辑 panel 时才用 title 区分。
4. 内页只有一个表格且页面布局**以该表格结尾**时，DataGrid 必须开 `height="fix"`（弹出层等动态元素不计入「结尾」）。
5. **所有功能页面**（列表 / 表单 / 详情 / 工作台 / 设置 / 统计分析等）顶部用 `<wd-tips type="box">` 说明页面用途与注意事项，工作台与数据分析页不豁免。
6. 请求统一走 `RequestAPI` / `request` 单例或组件内置请求能力，**不直接用原生 axios**（会绕过全局配置、解封包与错误处理）。
7. 表格内按钮、tag 一律 `size="small"`；操作列按钮只显示 icon，用 `wd-tips-button` 的 `tips` 悬停说明操作含义。
8. 短状态、分类不单独占列，用 `wd-tag` 与名称 / 型号等列合并展示。
9. 备注、说明类列不展开正文，用 `wd-tips`（word 模式）并在列上固定宽度；长内容列固定宽度 + 悬停看全文。
10. 行内操作 ≤ 3 个直接展示；超过时或横向空间紧张时，保留 1~2 个高频操作，其余收进「更多」下拉。
11. 选项少时（单选 / 多选一般 ≤ 6 个且文案短）用按钮形态的 `wd-radio-list` / `wd-checkbox-list`（开 `:button-style`），不用 select；选项多、文案长或需搜索时用 select。
12. 同类内容优先在当前页用 `wd-drawer-button` 展开抽屉，不做整页跳转；禁止 `window.open` / `target="_blank"`。
13. 不修改 `dist/` 下任何文件。
14. 全部文件 UTF-8；含中文的 HTML 必须保留 `<meta charset="UTF-8">`。

## 3. 两种引入方式

| 方式 | 注册 | 全局配置 |
| --- | --- | --- |
| npm | `app.use(WorkDesktop, {...})`，样式引 `workdesktop-ai/style.css` | `app.use` 第二参数 |
| 纯 script（UMD） | 全局 `window.WorkDesktop`，组件已全局注册，HTML 直接写 `<wd-xxx>` | `window.workDesktopConfig`，**必须在 `app.use` 之前声明** |

响应约定：`{ code, message, data }`；列表为 `data: { list, total, pageSize, currentPage }`；`code` 大于等于成功码视为成功（默认成功码可配）。字段名可全局覆盖（`resTransform`）。

## 4. 交付前自检

- [ ] 外框架 `wd-station` + 内页 `wd-panel` + 无多余包裹层（第 1 条）
- [ ] panel 拆分与 title 规则符合第 2、3 条；单表格页已开 `height="fix"`
- [ ] 页面顶部有 `<wd-tips type="box">`
- [ ] 表格按钮 `size="small"`，操作列只有 icon，不常用操作已折叠
- [ ] 用到的每个 `wd-` 组件的 props 均在 `ai-api/` 对应文件中核实过
- [ ] 无原生 axios 直连
- [ ] 中文无乱码，UTF-8 与 charset 标签齐备
- [ ] 若在组件库本仓库内：`npm run typecheck` 通过

## 5. 维护

本文件只承载触发、红线与路由，**不复制** `scenarios/` 与 `ai-api/` 的规范正文——两份内容必然漂移。规范变更请改源文件（`document/scenarios_v1.0.md` → 同步 `scenarios/`；组件 API 由 `npm run gen:ai-api` 生成）。本文件仅在红线或阅读顺序变化时修改。

---

**版本变化**：V_1.1（2026-11-19）——硬约束 1 补纯布局容器豁免（页面根容器 / 栅格行列容器允许存在但不得带背景边框内边距；通栏元素用 header/section 不包 wd-panel）；硬约束 5 适用范围明确为「所有功能页面」，工作台与数据分析页不豁免；硬约束 7 与自检清单表格内按钮 / tag 尺寸由 `size="mini"` 修正为 `size="small"`（wd-tag / el-tag 在 Element Plus 2.8 下无 mini 枚举）。V_1.0（2026-11-16）首次创建。
