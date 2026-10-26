# WorkDesktop AI 编码路由（AI 阅读入口）

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-10-17\
> **当前版本**：V\_1.8\
> **适用对象**：AI 编码助手（每次开发前必读的第一入口）\
> **核心目标**：让 AI 按任务命中场景，只读对应子路由文件，避免通读全篇\
> **文档简略描述**：本文件是编码场景指导的路由索引，供 AI 在每次开发前先阅读。内容按场景严格拆分为 `scenarios/` 目录下的子文件，小节编号（§x.y）与主文档 `document/scenarios_v1.0.md` 一致。组件精确 API（props/emits/slots/方法签名）统一查 [ai-api/](./ai-api/) 路由（主路由 [ai-api/README.md](./ai-api/README.md) 按组件名索引定位，只打开对应子文件，如 [wd-select.md](./ai-api/wd-select.md)），由 `docs/src/api-meta/` 自动生成、随包发布，不要翻组件源码。HTTP 请求的完整执行流程 / 配置全景 / 代码示例 / 排错表见手写版 [ai-api/use-request-guide.md](./ai-api/use-request-guide.md)。

***

## 一、AI 阅读规则（必遵守）

1. **每次开发前先读本文件**，用下方「场景判定速查表」确定任务命中的场景。
2. **通用规范必读**：[scenarios/00-common.md](./scenarios/00-common.md) 是地基（框架搭建/弹层选型/操作反馈/按钮选型），绝大多数任务都依赖它。
3. **只读命中场景对应的子文件**，按「场景描述 → 结构示意 → 交互流程 → 代码示例 → 规范要点」顺序阅读，不要通读全部子文件。
4. 子文件内若标注「补充需求」，再到 [scenarios/99-spec-requests.md](./scenarios/99-spec-requests.md) 核对对应组件条目。
5. 子文件解决"怎么组合与交互约定"；需要组件的精确 API（props/emits/slots/方法签名/自定义类型）时，统一查 [ai-api/](./ai-api/) 路由——主路由 [ai-api/README.md](./ai-api/README.md) 含阅读约定、Element Plus 透传规则与按组件名的索引，**只打开目标组件对应的子文件**，不要通读整个目录。**子文件路径规律（知道组件名即可直接构造，不必先翻索引）**：Wd 组件 = `ai-api/wd-{组件名kebab}.md`（WdSelect → `wd-select.md`、WdApiButton → `wd-api-button.md`、WdImageUpload → `wd-image-upload.md`）；3 个基础设施页 = `ai-api/use-config.md` / `ai-api/use-request.md` / `ai-api/custom-skin.md`。覆盖全部 30 个组件与 3 个基础设施 API（全局配置 / HTTP 请求核心 / 皮肤主题），由 `docs/src/api-meta/` 经 `npm run gen:ai-api` 自动生成、随 npm 包发布，与源码保持同步。不要凭名称猜测参数，也不要逐个翻 `src/components/**/*.vue`；只有 ai-api/ 未覆盖的实现细节才去读源码或 `dist/types/`。

## 二、场景判定速查表

按"要做的事情"判断（而非按组件名）。一个任务通常只命中 1 个场景 + 通用规范。

| 我要做的页面 / 事情 | 子路由文件 | 覆盖编号 |
| ---- | ---- | ---- |
| **任何任务的必读地基**：框架搭建（WdStation+wd-panel）、页面介绍、弹窗/抽屉选型、操作反馈、确认机制、空状态、加载、文案、按钮选型 | [scenarios/00-common.md](./scenarios/00-common.md) | §0.1–§0.13 |
| 手动发起 HTTP 请求、对接后端接口、自定义 token / 超时 / 提示、请求去重与中断、排错 | [ai-api/use-request-guide.md](./ai-api/use-request-guide.md) | 流程 / 配置全景 / 示例 / 排错 |
| 分页列表 + 搜索 + 表格展示（最常见）；表格列很多的显示优化；行操作列规范；可编辑表格 | [scenarios/01-datagrid.md](./scenarios/01-datagrid.md) | §1.1–§1.19 |
| 新增表单 / 编辑表单 / 数据维护；表单项分组；WdFormItem 与原生 ElFormItem 差异 | [scenarios/02-dataform.md](./scenarios/02-dataform.md) | 场景二 全部小节 |
| 查看某条记录详情、只读展示；明细子表；统计口径说明 | [scenarios/03-detail.md](./scenarios/03-detail.md) | 场景三 全部小节 |
| 树形数据（部门、分类）展示与选择 | [scenarios/04-tree.md](./scenarios/04-tree.md) | 场景四 全部小节 |
| 表格多选 + 批量删除/启用/停用等操作 | [scenarios/05-batch.md](./scenarios/05-batch.md) | 场景五 全部小节 |
| 表单里选择关联数据（选用户/部门/商品），弹窗内嵌列表选择 | [scenarios/06-picker.md](./scenarios/06-picker.md) | 场景六 全部小节 |
| 数据导入 / 导出（模板下载、上传校验、结果反馈） | [scenarios/07-import-export.md](./scenarios/07-import-export.md) | §7.1–§7.9 |
| 审核页 / 结果展示页等按状态分类的列表页：拆 Tab + Tab 后带数据总量 + 按分类定制列与操作按钮 | [scenarios/08-status-tabs.md](./scenarios/08-status-tabs.md) | §8.1–§8.6 |
| 核对场景落地中对组件规格的新增/修改诉求（回流 PRD） | [scenarios/99-spec-requests.md](./scenarios/99-spec-requests.md) | 组件规格补充需求汇总 |

> **判定技巧**：拿不准命中哪个场景时，打开候选子文件读第一节「场景描述」一句话判断，再深入。

## 三、跨文件编号引用说明

子文件之间通过 §x.y 编号互相引用（如"见 §1.7 操作列规范"）。编号前缀对应文件：§0.x → 00-common；§1.x → 01-datagrid；§2.x → 02-dataform；§3.x → 03-detail；§4.x → 04-tree；§5.x → 05-batch；§6.x → 06-picker；§7.x → 07-import-export。

***

## 版本变化

- **V_1.11（2026-10-19）**：[scenarios/00-common.md](./scenarios/00-common.md) 升 V_1.4——§0.7 开头新增「页面跳转原则」：非必要不做直接跳转，新内容展示（新增/编辑/详情）优先 `wd-drawer-button` 抽屉完成（`drawer-size` 控制弹层尺寸、`head-refresh-datagrid` 关闭后声明式刷新列表）；内容确需独立工作区时用 `wd-station` 联动打开新标签页（`content-mode="tabs"` + `openTab({ key, title, path })` / 受控 `v-model:open-tabs` / `v-model:active-menu`）；**非常不建议** `window.open` / `target="_blank"` 新开浏览器窗口或当前页直接跳转。§0.13 决策树 RouteButton 分支与组件说明补充该原则交叉引用；主文档 scenarios_v1.0.md 同步升至 V_1.24。
- **V_1.10（2026-10-19）**：[scenarios/00-common.md](./scenarios/00-common.md) 升 V_1.3——§0.3 新增「搜索面板容器」规范（≥3 个搜索条件时 `wd-search-panel` 单独占用一个 `wd-panel`），§0.5 规则表新增「搜索面板组件选型 / 常用条件外露 / 低频条件折叠 / 声明式联动刷新」4 行，§0.5 标准代码示例从旧 `:fields` + `@search` 事件写法重写为「默认插槽 + `#more` + `:head-refresh-datagrid`」声明式联动写法；主文档 scenarios_v1.0.md 同步升至 V_1.23。
- **V_1.9（2026-10-18）**：下线 `WdDatePicker` 组件——组件源码 / 测试 / docs 示例 / `api-meta/data-containers.ts` 元数据 / 规格稿接口段落全量移除；`WdDateRangePicker` 完整保留为唯一日期封装组件；[scenarios/02-dataform.md](./scenarios/02-dataform.md) 日期小节重写为「WdDateRangePicker 专章」（单日期字段回归原生 el-date-picker）并升 V_1.2；主文档 scenarios_v1.0.md 同步升至 V_1.22。
- **V_1.8（2026-10-17）**：[scenarios/00-common.md](./scenarios/00-common.md) §0.10 新增「0.10.1 空状态文案规范（统一口径）」——四种空态（初始空/筛选空/加载失败/无权限）主文案、副文案、主次按钮命名规律；[scenarios/99-spec-requests.md](./scenarios/99-spec-requests.md) 新增四项规格：DataGrid `batchBar` prop + `#batch-bar` 插槽（勾选行悬浮批量操作条）、DataGrid `storageKey` prop（列配置 localStorage 持久化）、新增 `WdDatePicker` / `WdDateRangePicker` 组件；主文档 scenarios_v1.0.md 同步升至 V_1.20。
- **V_1.7（2026-10-17）**：[scenarios/00-common.md](./scenarios/00-common.md) §0.3 新增「操作按钮归属原则」——操作表格数据的按钮放进对应 DataGrid 的 `#toolbar` 插槽，页面只有一个 DataGrid 时所有按钮统一进该表 `#toolbar`；§0.5「工具栏布局」条目扩写并修正原示例无效插槽 `#toolbar-left`（DataGrid 只暴露 `#toolbar`）为 `#toolbar="{ selection }"`；主文档 scenarios_v1.0.md 同步升至 V_1.19。
- **V_1.6（2026-10-16）**：新增场景八子路由 [scenarios/08-status-tabs.md](./scenarios/08-status-tabs.md)（审核页/结果展示页按状态分类拆 Tab、Tab 后带数据总量、「全部」常量分类可不显示总量、按分类定制列与操作按钮）；速查表新增一行直达场景八；主文档 scenarios_v1.0.md 同步升至 V_1.18。
- **V_1.5（2026-10-16）**：新增手写版 HTTP 请求详细指引 [ai-api/use-request-guide.md](./ai-api/use-request-guide.md)（执行流程、配置全景、ReqOptions 示例、useRequest 声明式、排错对照表）；速查表新增一行「手动发起 HTTP 请求」直达指引入口；ai-api/README.md 使用流程第 2 步补充指引入口与索引。
- **V_1.4（2026-10-14）**：阅读规则第 5 条补充子文件路径规律——Wd 组件 `ai-api/wd-{组件名kebab}.md`、基础设施页 `ai-api/use-config.md` 等，AI 知道组件名即可直接构造子文件路径，不必先翻索引；ai-api/README.md 使用流程同步。
- **V_1.3（2026-10-14）**：ai-api 由单文件改为路由目录 [ai-api/](./ai-api/)（主路由 [README.md](./ai-api/README.md) + 30 组件 / 3 基础设施页各一个子文件，`npm run gen:ai-api` 生成、随包发布）；阅读规则第 5 条改指 ai-api/ 路由，要求按组件名索引只打开对应子文件，不再通读单文件；package.json `files` 同步改为 `ai-api` 目录。
- **V_1.2（2026-10-14）**：新增随包发布的 [ai-api.md](./ai-api.md) 聚合 API 参考（30 组件 + 3 基础设施，脚本从 `docs/src/api-meta/` 自动生成）；阅读规则第 5 条由"查源码 / dist/types"改为"统一查 ai-api.md"，AI 无需再逐个读取组件源码；package.json `files` 同步纳入 ai-api.md。
- **V_1.1（2026-10-14）**：移除 llms.txt，精确 API 查阅改道组件源码与 `dist/types/`；package.json `files` 同步移除。
- **V_1.0（2026-10-14）**：初版，按场景拆分 `scenarios/` 9 个子路由，作为 AI 开发的第一阅读入口。
