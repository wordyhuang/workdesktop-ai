# 贡献指南 CONTRIBUTING

感谢你愿意为 WorkDesktop AI 贡献力量。请先花两分钟读完本指南，保证协作顺畅、代码质量稳定。

## 环境要求

- Node.js ≥ 18
- npm ≥ 9
- 包管理器统一使用 **npm**（仓库已提交 `package-lock.json`）

## 本地开发

```bash
npm install            # 安装依赖
npm run docs:dev       # 文档站本地预览（http://localhost:5003）
npm run dev            # Playground 本地开发
```

文档站即组件开发预览台：每个组件在 `docs/src/examples/*.vue` 有可运行示例。**新增/修改组件建议先改示例再改实现**，保持「示例先行」。

## 提交前必须通过的门禁

```bash
npm run typecheck        # 类型检查（vue-tsc --noEmit）
npm run test             # 全量单测 / 集成测试（vitest run）
npm run test:coverage    # 覆盖率检查（lib 行覆盖 ≥ 80%，分支 ≥ 70%）
npm run build            # 库构建（ESM + UMD + d.ts + style.css）
```

- 使用 **TDD**：先写/先补测试，再改实现；每个行为变更都要有对应用例。
- 新增逻辑处于 `src/lib/**`（config/http/hooks/utils 等）时，必须补单元测试并维持覆盖率阈值。
- 核心复合组件（DataGrid/DataForm/按钮枢纽类）建议补 `*.integration.test.ts` 集成用例（参考 `src/components/__tests__/` 现有写法：EP 叶子组件桩 + http mock，不依赖真实 EP DOM 渲染）。

## 代码规范（必读）

1. **编码**：文件一律 `UTF-8`；中文文案为默认语言，组件内置文案写中文。
2. **命名**：清晰、不缩写。组件导出名 `Wd` 前缀 + PascalCase（如 `WdDataGrid`），组件内部 `defineOptions({ name })` 决定注册标签（kebab-case）。
3. **注释**：代码注释用中文，标注设计意图而非复述实现。
4. **接口**：Props/Emits/Slots 定义在组件顶部并尽量带 JSDoc；新 Props 遵循「默认值尽量可用」原则。
5. **目录纪律**：
   - `src/components/<group>/<comp>/` 放组件；
   - 组件汇总与分组在 `src/components/index.ts` 维护；
   - 样式类改动遵循语义令牌（CSS 变量），不写死品牌色；
   - **不要改动 `dist/`**——它是构建产物，由 `npm run build` 生成。
6. **技术栈**：Vue 3 `<script setup>` + TypeScript；UI 基于 ElementPlus，`el-` 基础控件复用优先。

## 新增组件清单

提交新增组件 PR 前逐项核对：

- [ ] 目录结构与命名符合既有分组；
- [ ] `src/components/index.ts` 已导出（含 d.ts 类型随之产出）；
- [ ] `docs/src/examples/<comp>.vue` 可运行示例 + `docs/src/api-meta/` 增加 API 元数据；
- [ ] 关键行为有测试（单元或集成）；
- [ ] 文案中文、样式走语义令牌；
- [ ] `npm run typecheck && npm run test && npm run build` 全绿。

## 提交信息约定

采用中文、面向「为什么」的提交信息，格式：

```
类型(范围): 一句话说明

类型：feat / fix / refactor / docs / test / style / build / ci / chore
范围：小组件名或模块名，如 datagrid、http、docs
```

示例：`feat(datagrid): 支持卡片模式与表格模式切换`、`fix(http): urlPrefix 为空时不再拼出多余斜杠`。

提交范围明确，**不要夹带无关文件**（如误提交 `dist/`、本地配置）。

## PR 流程

1. 从最新 `main` 切分支：`git checkout -b feat/<your-feature>`；
2. 小步提交，确保每步可通过门禁；
3. 推送后创建 PR，模板中说明：改动动机、验收路径、是否影响既有组件 API；
4. 由维护者 review 并跑 CI（typecheck + test:coverage + build）；
5. 合入 `main` 后，若涉及用户可见变更，维护者会补充到 `CHANGELOG.md`。

## Issue 报告

- Bug 请附：复现步骤、期望/实际表现、控制台报错、运行环境（浏览器/Vue/ElementPlus 版本）。
- 特性建议请说明：业务场景、期望 API（Props/Events）、可接受的取舍。

## 行为准则

保持友善、具体、可执行。讨论聚焦代码与场景，不做人身评价。
