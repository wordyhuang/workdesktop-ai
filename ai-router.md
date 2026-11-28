﻿﻿﻿﻿﻿﻿﻿# WorkDesktop AI 编码路由（AI 阅读入口）

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-11-27\
> **当前版本**：V\_1.19\
> **适用对象**：AI 编码助手（每次开发前必读的第一入口）\
> **核心目标**：让 AI 按任务命中场景，只读对应子路由文件，避免通读全篇\
> **文档简略描述**：本文件是编码场景指导的路由索引，供 AI 在每次开发前先阅读。第零节给出「一条提示词自动安装随包 Skill」的自举方式（不限定 Agent 类型），第一至三节为阅读规则、场景判定与编号引用。内容按场景严格拆分为 `scenarios/` 目录下的子文件，小节编号（§x.y）与主文档 `document/scenarios_v1.0.md` 一致。组件精确 API（props/emits/slots/方法签名）统一查 [ai-api/](./ai-api/) 路由（主路由 [ai-api/README.md](./ai-api/README.md) 按组件名索引定位，只打开对应子文件，如 [wd-select.md](./ai-api/wd-select.md)），由 `docs/src/api-meta/` 自动生成、随包发布，不要翻组件源码。HTTP 请求的完整执行流程 / 配置全景 / 代码示例 / 排错表见手写版 [ai-api/use-request-guide.md](./ai-api/use-request-guide.md)。

***

## 零、优先启用随包 Skill（推荐）

本包自带 [skills/workdesktop-page/SKILL.md](./skills/workdesktop-page/SKILL.md)。若当前 AI 工具尚未安装它，请开发者把下面这段提示词整段交给 AI——不限定 Agent 类型，由 AI 自行定位包根、安装并回报路径；工具不支持 Skill 时自动降级为按本文件开发。

```text
使用 workdesktop-ai 组件库开发页面，并先尝试启用它自带的 AI Skill；如果你的工具不支持 Skill，就降级为直接读文档。

1. 定位包根：在当前项目找到 node_modules/workdesktop-ai。若不存在，先执行 npm install workdesktop-ai element-plus @element-plus/icons-vue。
2. 安装 Skill：把 <包根>/skills/workdesktop-page 整个目录复制到你所在 AI 工具的 skills 目录。优先用项目级目录（如当前项目内 .claude/skills/），工具只支持用户级时再用用户级（如 ~/.claude/skills/）；其他工具用其文档约定的目录。目录不确定时先查一次约定，仍不确定就问我，不要猜一个路径复制后当作已完成。两种目录都无法写入时，直接进入第 4 步。
3. 确认并回报：复制后确认 <skills目录>/workdesktop-page/SKILL.md 存在，告诉我实际安装路径；若需要重启工具才生效，也请说明。
4. 降级方案：安装不了或工具不支持 Skill 时，跳过第 2、3 步，直接读 <包根>/ai-router.md，按其中的「场景判定速查表」定位 <包根>/scenarios/ 与 <包根>/ai-api/。
5. 开发约束（两种方式都适用）：先读 scenarios/00-common.md；组件的 props / emits / slots / 方法只查 ai-api/ 对应文件，不要翻源码猜参数。
```

> 已安装 Skill 时，Skill 负责触发、结构红线与交付自检，本文件及 `scenarios/` / `ai-api/` 仍是规范正文的唯一来源，二者不重复维护。

## 一、AI 阅读规则（必遵守）

1. **每次开发前先读本文件**，用下方「场景判定速查表」确定任务命中的场景。
2. **通用规范必读**：[scenarios/00-common.md](./scenarios/00-common.md) 是地基（框架搭建/弹层选型/操作反馈/按钮选型），绝大多数任务都依赖它。
3. **只读命中场景对应的子文件**，按「场景描述 → 结构示意 → 交互流程 → 代码示例 → 规范要点」顺序阅读，不要通读全部子文件。
4. 子文件内若标注「补充需求」，再到 [scenarios/99-spec-requests.md](./scenarios/99-spec-requests.md) 核对对应组件条目。
5. 子文件解决"怎么组合与交互约定"；需要组件的精确 API（props/emits/slots/方法签名/自定义类型）时，统一查 [ai-api/](./ai-api/) 路由——主路由 [ai-api/README.md](./ai-api/README.md) 含阅读约定、Element Plus 透传规则与按组件名的索引，**只打开目标组件对应的子文件**，不要通读整个目录。**子文件路径规律（知道组件名即可直接构造，不必先翻索引）**：Wd 组件 = `ai-api/wd-{组件名kebab}.md`（WdSelect → `wd-select.md`、WdApiButton → `wd-api-button.md`、WdImageUpload → `wd-image-upload.md`；例外：WdDataGrid → `wd-datagrid.md`、WdDataForm → `wd-dataform.md`，文件名无连字符，与子路径入口 `data-grid` / `data-form` 不同）；3 个基础设施页 = `ai-api/use-config.md` / `ai-api/use-request.md` / `ai-api/custom-skin.md`。覆盖全部 35 个组件与 3 个基础设施 API（全局配置 / HTTP 请求核心 / 皮肤主题），由 `docs/src/api-meta/` 经 `npm run gen:ai-api` 自动生成、随 npm 包发布，与源码保持同步。不要凭名称猜测参数，也不要逐个翻 `src/components/**/*.vue`；只有 ai-api/ 未覆盖的实现细节才去读源码或 `dist/types/`。

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
| 登录后首屏工作台 / 仪表盘聚合页（指标统计卡、待办审批、趋势图表、快捷入口、同高卡片布局） | [scenarios/09-workbench.md](./scenarios/09-workbench.md) | §9.1–§9.8 |
| 数据分析页 / 统计中心（KPI 指标卡联动趋势图、悬浮查看、点击下钻明细、渠道占比环、时间范围切换） | [scenarios/09-workbench.md](./scenarios/09-workbench.md) | §9.4 ⑦⑧⑨ + §9.9 |
| 设置中心 / 个人配置页（分类导航 + 单页长滚动、统一保存留痕、偏好控件选型、危险操作确认分级） | [scenarios/10-settings.md](./scenarios/10-settings.md) | §10.1–§10.9 |
| 核对场景落地中对组件规格的新增/修改诉求（回流 PRD） | [scenarios/99-spec-requests.md](./scenarios/99-spec-requests.md) | 组件规格补充需求汇总 |

> **判定技巧**：拿不准命中哪个场景时，打开候选子文件读第一节「场景描述」一句话判断，再深入。

## 三、跨文件编号引用说明

子文件之间通过 §x.y 编号互相引用（如"见 §1.7 操作列规范"）。编号前缀对应文件：§0.x → 00-common；§1.x → 01-datagrid；§2.x → 02-dataform；§3.x → 03-detail；§4.x → 04-tree；§5.x → 05-batch；§6.x → 06-picker；§7.x → 07-import-export；§8.x → 08-status-tabs；§9.x → 09-workbench；§10.x → 10-settings。

