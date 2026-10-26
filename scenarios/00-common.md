# 通用页面规范

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-10-19\
> **当前版本**：V\_1.4\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：跨场景通用编码约定（布局/交互/反馈/按钮选型）\
> **文档简略描述**：本文件是「编码场景指导」的子路由，由 `document/scenarios_v1.0.md`（V\_1.24）拆分而来。小节编号（§x.y）与主文档一致；跨场景引用（如"见 §1.7"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。内容修改请先改主文档，再同步本文件。
>
> **版本变更**：V_1.3 → V_1.4：新增「页面跳转原则」——非必要不做直接跳转，新内容展示优先用 `wd-drawer-button` 抽屉完成；确需独立工作区时用 `wd-station` 联动（`content-mode="tabs"` + `openTab` / `v-model:open-tabs` / `v-model:active-menu`）打开新标签页；非常不建议 `window.open` / `target="_blank"` 新开浏览器窗口或当前页直接跳转。

### 0.1 页面介绍与注意事项

对于表单填写页面、DataGrid 列表页面等功能页面，**应当在页面顶部使用 Tips 组件标记当前页面的介绍以及使用注意事项**，帮助用户快速理解页面用途和操作要点。

| 规范要点 | 说明                                |
| ---- | --------------------------------- |
| 位置   | 页面顶部，搜索栏/表单之前                     |
| 类型   | 使用 Tips 组件的 box 模式（提示框横幅，内容放默认插槽） |
| 内容   | 简洁说明页面功能、操作要点、注意事项                |
| 示例   | "本页面用于维护用户数据，删除用户后不可恢复，请谨慎操作。"    |

> Tips 组件有两种模式：`type="word"`（默认，图标 + 悬停 tooltip，适合列内行内提示）和 `type="box"`（提示框横幅，内容放默认插槽，适合页面级提示）。`icon` 仅支持 InfoFilled / WarningFilled / QuestionFilled 三个内置图标。

**wd-tips 五种典型使用场景**：

| 场景                 | 模式                                                                                                          | 位置                                        | 说明                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------- |
| 页面介绍 / 注意事项        | `type="box"`                                                                                                | 页面顶部横幅                                    | 见下方代码示例                               |
| 列内长文本（备注、不常看的提示）   | `type="word"` + WarningFilled                                                                               | 表格单元格内                                    | 只显示感叹号图标，悬停看全文                        |
| **统计指标 / 合计行口径说明** | `type="word"` + QuestionFilled                                                                              | 指标标签或合计项文字**紧接后方**                        | 问号图标悬停说明计算口径与包含范围                     |
| **关键字段说明**         | 表单（wd-form-item）用内置 `:tip` prop；原生 el-form-item / 详情页 el-descriptions-item 用 `type="word"` + QuestionFilled | 字段 label 文字**紧接后方**                       | 含义不直观的字段（如"信用额度""核定数量"）需说明取值规则、来源、上限等 |
| **关键操作说明**         | `type="word"` + QuestionFilled                                                                              | 操作区域的标题/说明文字旁（**不是按钮本身**——按钮用 TipsButton） | 成组操作、状态标签、区域标题旁说明操作含义                 |

> **边界**：按钮自身的 tooltip（按钮 hover 时的简短提示）用 `TipsButton`（§0.13）；操作**区域**的标题/分组说明、状态标签旁的说明、表格列头旁的提示——用 `wd-tips`。避免对按钮本体和其标签说明重复 tooltip（双提示反而混乱）。

代码示例：

```html
<!-- 页面顶部使用 Tips 提示（box 模式，内容放默认插槽） -->
<wd-tips type="box" icon="InfoFilled">本页面用于维护用户数据，删除用户后数据不可恢复，请谨慎操作。</wd-tips>

<!-- 然后是搜索面板和 DataGrid -->
<wd-search-panel ...>
...
</wd-search-panel>
<wd-datagrid ...>
...
</wd-datagrid>

<!-- 关键字段说明：表单内用 WdFormItem 内置 tip prop（label 右侧自动挂问号） -->
<wd-form-item
  label="信用额度"
  prop="creditLimit"
  tip="系统按客户等级自动核定；A级=10万，B级=5万，C级=1万">
  <el-input-number v-model="form.creditLimit" />
</wd-form-item>

<!-- 关键操作说明：表格列头旁嵌 Tips 说明不同状态对操作的影响 -->
<el-table-column>
  <template #header>
    <span>状态</span>
    <wd-tips
      type="word"
      icon="QuestionFilled"
      tips="已完成/已作废行的编辑按钮会自动隐藏；审批中行的删除按钮会禁用并提示" />
  </template>
  <template #default="{ row }">...</template>
</el-table-column>
```

### 0.2 手动请求 API 规范

一般情况下，组件已经内置了请求能力，可以满足绝大多数业务需求。如果需要**手动发起 API 请求**，应当使用 WorkDesktop 提供的 `RequestAPI` 方法，它是基于 axios 封装的统一请求底座，WorkDesktop 所有内置组件的 API 请求也都是通过它实现的，能保证请求流程、响应处理、错误处理的一致性。

> 注意：`RequestAPI` 会自动应用全局配置（响应转换、错误处理、拦截器等），直接使用 axios 会绕过这些配置，不推荐。

**使用示例**（TypeScript）：

```ts
import { RequestAPI } from 'work-desktop'

// GET 请求
const data = await RequestAPI.get('/api/users', { 
  params: { page: 1, pageSize: 10 } 
})

// POST 请求
const result = await RequestAPI.post('/api/users/save', {
  name: '张三',
  email: 'zhangsan@example.com'
})

// 完整自定义配置
const result = await RequestAPI.request({
  url: '/api/users/export',
  method: 'post',
  responseType: 'blob',
  // ... 其他 axios 配置
})
```

### 0.3 页面布局与容器规范

**框架搭建统一约定：`WdStation`** **作为外框架，内页均使用** **`wd-panel`** **作为一级容器，外层不再有其他容器包裹。**

- **页面整体框架**：用 `wd-station` 作为整页外框架（承菜单、头部、内容滚动、footer）。内页**直接**是若干个 `wd-panel`，二者之间**不再包裹任何其他容器**（不套 `div.page-content`、不套背景 div —— WdStation 内容区已自带 padding 与背景）。
- **容器划分**：按功能逻辑划分容器，**不同 UI 逻辑的内容用各自独立的** **`wd-panel`** **包裹**（例如搜索表单一个 panel、表格一个 panel、统计区一个 panel）；功能逻辑相同的块放同一容器。
- **标题规则**：只有**一个** wd-panel 时，或页面\*\*只有「搜索 + 表格」\*\*的常见情形，panel **不使用 title**（`show-header=false`）；当存在多个不同逻辑的 panel 时才用 title 区分语义。
- **表格固定高度**：当内页**只有一个表格**，且**页面布局固定以此表格结尾**（结尾指表格之后不再有随内容滚动的静态内容块，弹出层等动态元素不计入），则开启 DataGrid 的 `height="fix"` 让表格铺满剩余高度、行区内滚动。

| 规范要点    | 说明                                                                           |
| ------- | ---------------------------------------------------------------------------- |
| 外框架     | 整页用 `wd-station` 包裹（菜单、头部、内容滚动、footer 由它承担）                                  |
| 一级容器    | 内页功能块一律用 `wd-panel`，作为一级容器；**外层不再有其他包裹容器**                                   |
| 容器划分    | 功能逻辑相同的块放一个容器；不同 UI 逻辑内容（搜索/表格/统计）分别用独立 `wd-panel`                           |
| 容器间距    | 相邻 wd-panel 之间用 margin 分隔（建议 `16px` 左右）                                      |
| 面板标题    | **仅一个 panel、或仅「搜索+表格」情形：不使用 title（`show-header=false`）**；多逻辑时才用 title        |
| 容器组件    | 优先使用 wd-panel 无标题模式；确有必要才用带标题模式                                              |
| 嵌套限制    | **Panel 尽量只作一级容器，不建议 Panel 嵌套 Panel**；除非确实需要较大间距否则不嵌套                        |
| 搜索面板容器  | 多条件搜索（≥3 个）时，`wd-search-panel` **单独占用一个 `wd-panel`**（`show-header=false`），不再嵌套在其他外层容器内；搜索面板与表格面板相邻排列，结构清晰。仅 1–2 个条件才走「简要搜索免容器」 |
| 简要搜索免容器 | 搜索条件仅 1–2 个时，搜索与表格合并在一个容器——直接把搜索组件放进 DataGrid 的 `#toolbar` 插槽，不再单独包 wd-panel |
| 按钮归属    | 操作表格数据的按钮（新增/导出/批量删除等）放进**对应 DataGrid 的** **`#toolbar`** **插槽**；页面只有一个 DataGrid 时，所有操作按钮统一放进该表的 `#toolbar`。详见下方「操作按钮归属原则」 |
| 表格固定高度  | 内页仅一个表格且**布局固定以该表格结尾**（不含弹出层等动态元素）时，开 DataGrid `height="fix"` 铺满剩余高、行区滚动     |

布局骨架：

```html
<!-- 整页外框架：WdStation（自带 padding + 背景，承头部/菜单/内容滚动/footer） -->
<wd-station :menu-groups="menus" menu-mode="side" title="管理系统">
  <!-- v-slot:content 或默认插槽（html 模式）即内页 -->
  <!-- 内页直接是 wd-panel，外层不再有 div.page-content 等包裹 -->

  <!-- 仅「搜索+表格」常见情形：单个 panel，不使用 title -->
  <wd-panel :show-header="false">
    <wd-datagrid
      api="/api/users"
      :active="true"
      with-index
      :height="'fix'">
      <template #toolbar>
        <!-- 简要搜索（1–2 个条件）直接进 toolbar -->
      </template>
      <!-- 表格列 -->
      <el-table-column prop="name" label="名称" />
    </wd-datagrid>
  </wd-panel>
</wd-station>
```

多逻辑分 panel 的骨架：

```html
<wd-station ...>
  <!-- 一级容器一：统计区（有独立语义才用 title） -->
  <wd-panel title="统计概览">
    <el-row>...</el-row>
  </wd-panel>

  <!-- 一级容器二：多条件搜索单独一个 panel（>=3 个搜索条件时） -->
  <wd-panel :show-header="false" style="margin-top: 16px;">
    <wd-search-panel :head-refresh-datagrid="gridRef">
      <!-- 常用/重要条件：默认插槽，一行外露 -->
      <wd-search-item label="名称"><el-input v-model="q.name" /></wd-search-item>
      <wd-search-item label="状态">
        <el-select v-model="q.status" clearable>
          <el-option label="全部" value="" />
          <el-option label="启用" value="1" />
          <el-option label="停用" value="0" />
        </el-select>
      </wd-search-item>
      <!-- 不常用/次要条件：#more 插槽，默认收起，点展开才显示 -->
      <template #more>
        <wd-search-item label="创建时间">
          <el-date-picker v-model="q.createRange" type="daterange" />
        </wd-search-item>
        <wd-search-item label="创建人"><el-input v-model="q.creator" /></wd-search-item>
      </template>
    </wd-search-panel>
  </wd-panel>

  <!-- 一级容器三：表格（与搜索面板相邻，表格垫底开 height="fix"） -->
  <wd-panel :show-header="false" style="margin-top: 16px;">
    <wd-datagrid
      ref="gridRef"
      api="/api/users"
      :active="true"
      :height="'fix'">
      ...
    </wd-datagrid>
  </wd-panel>
</wd-station>
```

> `wd-station` 之外不再包背景/间距容器；`height="fix"` 会贴合最近一个「有确定高度 / 可滚动的祖先容器」，配合 WdStation 内容区（flex:1 定高区）即可实现表格占满余高、不弹出纵向滚动条。

#### 操作按钮归属原则

对表格数据进行操作的按钮（新增、导出、批量删除、批量启用、导入等），**应当放进对应 DataGrid 的 `#toolbar` 插槽**，而不是悬浮在页面独立区域或外层 panel 标题栏。

| 页面情形 | 按钮归属                                      |
| ---- | ----------------------------------------- |
| 页面对应操作的表格数量 | 按钮放进**被操作那张表**的 `#toolbar` 插槽            |
| 页面仅一个 DataGrid | 页面**所有**操作按钮统一放进这张表的 `#toolbar` 插槽，不在外层另设按钮区 |
| 操作不针对任何表格（如「返回上级」「页面级全局设置」） | 可放在页面外，不属于本原则约束                           |

**为什么放 DataGrid 的 `#toolbar`**：

- 按钮与表格视觉一体，用户一眼就知道按钮作用于这张表（「一致性」「状态可预期」原则，见 §0.4）；
- 工具栏高度被 `height="fix"` 自动扣除，按钮多时不会撑破表格余高布局；
- `#toolbar` 插槽暴露 `selection`（当前选中行）与 `list`（当前页数据），批量按钮可直接读取选中行，不必另写 ref 联动；
- 右侧功能区（刷新 / 列设置 / 调整大小，见 §1.3）已由 DataGrid 内置 tools 承担，左侧 `#toolbar` 留给业务按钮，左右分工天然清晰。

```html
<!-- 页面只有一个 DataGrid：所有操作按钮都放进它的 #toolbar -->
<wd-panel :show-header="false">
  <wd-datagrid
    ref="gridRef"
    api="/api/users"
    :active="true"
    with-selection
    :height="'fix'">
    <!-- 左侧 #toolbar：全部业务操作按钮都在这里 -->
    <template #toolbar="{ selection }">
      <wd-drawer-button label="新增用户" title="新增用户" type="primary">
        <wd-data-form mode="create" submit-api="/api/users/save"
          :head-close-drawer="true" :head-refresh-datagrid="true" />
      </wd-drawer-button>
      <wd-confirm-button
        api="/api/users/batch-delete"
        :api-param="{ ids: selection.map(r => r.id) }"
        confirm-text="确认删除选中的用户？删除后数据将无法恢复。"
        type="danger"
        :head-refresh-datagrid="true">批量删除</wd-confirm-button>
      <el-button @click="handleExport">导出</el-button>
    </template>
    <el-table-column prop="name" label="名称" />
  </wd-datagrid>
</wd-panel>
```

```html
<!-- 页面有多个 DataGrid：按钮放进「被操作那张表」的 #toolbar，各表互不干扰 -->
<wd-panel :show-header="false">
  <!-- 用户表：操作按钮只作用于用户表 -->
  <wd-datagrid filter="user-table" api="/api/users" :active="true" with-selection>
    <template #toolbar="{ selection }">
      <wd-drawer-button label="新增用户" title="新增用户" type="primary" />
      <wd-confirm-button api="/api/users/batch-delete"
        :api-param="{ ids: selection.map(r => r.id) }"
        confirm-text="确认删除选中的用户？" type="danger"
        :head-refresh-datagrid="true">批量删除</wd-confirm-button>
    </template>
    <el-table-column prop="name" label="名称" />
  </wd-datagrid>
</wd-panel>

<wd-panel :show-header="false" style="margin-top: 16px;">
  <!-- 角色表：操作按钮只作用于角色表 -->
  <wd-datagrid filter="role-table" api="/api/roles" :active="true" with-selection>
    <template #toolbar="{ selection }">
      <wd-drawer-button label="新增角色" title="新增角色" type="primary" />
      <wd-confirm-button api="/api/roles/batch-delete"
        :api-param="{ ids: selection.map(r => r.id) }"
        confirm-text="确认删除选中的角色？" type="danger"
        :head-refresh-datagrid="true">批量删除</wd-confirm-button>
    </template>
    <el-table-column prop="name" label="角色名" />
  </wd-datagrid>
</wd-panel>
```

> **注意插槽名**：DataGrid 只暴露一个自定义业务插槽 `#toolbar`（带 `selection` / `list` 两个插槽参数），**没有** `#toolbar-left` / `#toolbar-right` 插槽——左右分区由 DataGrid 内部自动处理（左区 = `#toolbar` 业务按钮，右区 = 内置 tools）。写 `#toolbar-left` 是无效的，内容不会渲染。

### 0.4 设计原则

所有页面的交互决策以以下五条原则为裁判标准，当规则之间冲突时按此优先级取舍：

| 原则     | 含义                         | 反例                    |
| ------ | -------------------------- | --------------------- |
| 效率优先   | 高频操作路径最短，低频操作可收纳           | 删除按钮和导出按钮同等视觉权重       |
| 即时反馈   | 任何操作 100ms 内有响应，1s 内有结果或进度 | 点击保存后页面无任何变化          |
| 状态可预期  | 用户随时知道自己在哪、系统在做什么、接下来会怎样   | 弹窗套弹窗，关闭后不知道回到哪       |
| 防错优于容错 | 通过约束和确认避免错误，而不是出错后补救       | 危险操作不做任何确认            |
| 一致性    | 同类场景交互模式全系统统一              | A 页面删除用确认弹窗，B 页面删除直接删 |

补充：一个视图内**主按钮（type="primary"）最多一个**，即当前页面最核心的推进动作（如「新增」「保存」）；常规操作用次按钮，行内和低频操作用文字按钮，危险操作才用 danger 按钮。

### 0.5 数据查询与表格交互规范

| 规则        | 要求                                                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 搜索面板组件选型  | 多条件搜索（≥3 个）一律用 `wd-search-panel` 包裹，**不要**手写 `<el-form>` + 自拼按钮；它自带「搜索 / 重置 / 展开收起」操作列（`with-actions` 默认 true），不需要额外添加按钮 |
| 常用条件外露    | 常用/重要的搜索条件放 `wd-search-panel` **默认插槽**（一行外露，≤ 3–4 个）                                                                                                                                                          |
| 低频条件折叠    | 不常用/次要的搜索条件放 `wd-search-panel` 的 **`#more` 插槽**，默认收起，点「展开」滑出；超过一行的条件自动进入折叠态                                                                                                             |
| 声明式联动刷新   | `wd-search-panel` 通过 `:head-refresh-datagrid="gridRef"` 声明式联动——点「搜索」自动带参刷新目标 DataGrid（重置到第一页）、点「重置」自动清空条件并重查；**不需要手写 `@search` 事件 / `@reset` 事件 / `searchParams` 双向绑定** |
| 简要搜索免容器   | 仅 1–2 个搜索条件时，可不包 wd-panel，直接把搜索组件放进 DataGrid 的 `#toolbar` 插槽（搜索与表格一体，少一层容器，见下方示例）                                                                                                                                  |
| 统计口径解释    | 页面/指标/合计行中出现的统计数据，**紧接标签文字后用** **`wd-tips type="word"`** **加问号图标**，悬停说明计算口径与包含范围（例：数量合计 = 已审核行数量总和，不含草稿；金额合计 = 含税金额）                                                                                               |
| 关键字段/操作解释 | 含义不直观的字段 label 旁用 `wd-form-item :tip="说明文字"`（表单内）或 `wd-tips type="word"`（详情页原生 item label）；操作区域的标题/状态标签旁用 `wd-tips type="word"` 说明含义（按钮本体 tooltip 用 TipsButton）                                                    |
| 选项形态选型    | 选项数量少时（单选 ≤ 6 个 / 多选 ≤ 6 个，选项文案较短），用按钮形态的列表组件 `wd-radio-list` / `wd-checkbox-list`（开 `buttonStyle`）——选项一目了然、少一次点击；选项多、文案长或需搜索时再用 select                                                                            |
| 列多优化      | 大列表列多时按下述策略降列数 + 省宽度 + 提可读：唯一标识列固定宽 + `show-overflow-tooltip`；短状态/分类用 Tag 与名称合并成一列；低频操作收进「更多」下拉；备注列用 wd-tips + 固定窄宽；维护者用「时间icon+姓名」悬停显时间；长内容列固定宽 + 悬停看全文；仍放不下再考虑默认 list 卡片（需 card-item 插槽 + modeSwitch）。完整规范见 §1.9 |
| 查询触发      | 点击「查询」按钮触发；输入框支持回车触发（`wd-search-panel` 内置 el-form 提交处理）                                                                                                                                                              |
| 重置行为      | 重置 = 清空条件 + 立即重新查询（`wd-search-panel` 内置逻辑，调用 `resetSearchDataGrid`）                                                                                                                                                      |
| 条件记忆      | 列表页跳转详情再返回时，查询条件和页码保持（路由 keep-alive）                                                                                                                                                                               |
| 工具栏布局     | 业务操作按钮（新增/导出/批量）放表格**左上角**——即放进对应 DataGrid 的 `#toolbar` 插槽；页面只有一个 DataGrid 时所有操作按钮统一放进该表 `#toolbar`（归属原则见 §0.3「操作按钮归属原则」）；刷新、调整大小、列设置放**右上角**（DataGrid 内置 tools，无需手写）                                              |
| 不可用操作隐藏   | 按行状态永远无法执行的操作**直接不渲染**（如状态=完成时不显示「编辑」），不用 disabled 占位；仅临时不可用（权限/处理中）才用禁用并说明原因                                                                                                                                      |
| 行操作收纳     | 行内操作 ≤ 3 个直接展示；超过时，或列数多、横向空间紧张时，保留 1–2 个最高频 + 其余收进「更多」下拉                                                                                                                                                           |
| 批量操作条     | 勾选后出现批量操作条，显示已选数量，提供「取消选择」；批量按钮禁用态要给出原因                                                                                                                                                                            |
| 排序与筛选     | 服务端排序/筛选，列头按 升序 → 降序 → 取消 三态循环                                                                                                                                                                                     |
| 行点击       | 整行点击不触发跳转（防误触），跳转入口收敛到名称列链接或「查看」按钮                                                                                                                                                                                 |
| 分页        | 显示总数和每页条数选择（10/20/50/100）；切换每页条数后回到第一页                                                                                                                                                                             |

标准代码示例（多条件搜索 ≥ 3 个）：

```html
<!-- 容器一：多条件搜索面板，单独一个 wd-panel，不嵌套在外层容器内 -->
<wd-panel :show-header="false" style="margin-bottom: 16px;">
  <!-- 常用/重要条件放默认插槽；不常用/次要条件放 #more 插槽；
       通过 head-refresh-datagrid 声明式联动下方 DataGrid，自动带参刷新 -->
  <wd-search-panel :head-refresh-datagrid="gridRef">
    <!-- 常用条件：一行外露 -->
    <wd-search-item label="名称" prop="name">
      <el-input v-model="q.name" placeholder="请输入名称" clearable />
    </wd-search-item>
    <wd-search-item label="状态" prop="status">
      <el-select v-model="q.status" placeholder="全部" clearable>
        <el-option label="启用" value="1" />
        <el-option label="停用" value="0" />
      </el-select>
    </wd-search-item>
    <wd-search-item label="分类" prop="categoryId">
      <el-select v-model="q.categoryId" placeholder="全部" clearable filterable>
        <el-option v-for="c in categoryOptions" :key="c.value" :label="c.text" :value="c.value" />
      </el-select>
    </wd-search-item>

    <!-- 不常用条件：#more 插槽，默认收起，点「展开」滑出 -->
    <template #more>
      <wd-search-item label="创建时间" prop="createRange">
        <el-date-picker v-model="q.createRange" type="daterange"
          range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
      </wd-search-item>
      <wd-search-item label="创建人" prop="creator">
        <el-input v-model="q.creator" placeholder="请输入创建人" clearable />
      </wd-search-item>
    </template>
  </wd-search-panel>
</wd-panel>

<!-- 容器二：数据表格 -->
<wd-panel :show-header="false">
  <wd-datagrid
    ref="gridRef"
    api="/api/users"
    :active="true"
    :height="'fix'"
    selectable
  >
    <!-- 左上角 #toolbar：业务操作按钮（插槽暴露 selection 当前选中行） -->
    <template #toolbar="{ selection }">
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
      <el-button @click="handleExport">导出</el-button>
      <el-button v-if="selection.length" link type="danger"
        @click="handleBatchDelete(selection)">批量删除（已选 {{ selection.length }} 项）</el-button>
    </template>

    <!-- 批量操作条（勾选后出现的悬浮条，与 #toolbar 是两个不同插槽） -->
    <template #batch-bar="{ selectedRows, clearSelection }">
      <div class="batch-bar">
        <span>已选 {{ selectedRows.length }} 项</span>
        <el-button link type="danger" @click="handleBatchDelete(selectedRows)">批量删除</el-button>
        <el-button link @click="clearSelection">取消选择</el-button>
      </div>
    </template>

    <!-- 行操作：按状态渲染高频按钮 + 更多收纳低频操作 -->
    <template #operation="{ row }">
      <el-button
        v-if="row.status !== 'completed'"
        link
        type="primary"
        @click="handleEdit(row)">编辑</el-button>
      <wd-confirm-button
        text="删除"
        type="danger"
        :disabled="row.status === 'approving'"
        :confirm-text="`确认删除用户「${row.name}」？删除后数据将无法恢复。`"
        @confirm="() => handleDelete(row)"
      />
      <el-dropdown @command="(cmd) => handleMore(cmd, row)">
        <el-button link type="primary">更多</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="resetPwd">重置密码</el-dropdown-item>
            <el-dropdown-item command="disable">禁用</el-dropdown-item>
            <el-dropdown-item command="logs" divided>查看日志</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
  </wd-datagrid>
</wd-panel>

<script setup>
// 说明：
// - q 的字段会自动被 wd-search-panel 收集为请求参数（点「搜索」时随 head-refresh-datagrid 一起发出）
// - 不需要手写 @search / @reset 事件，也不需要维护 searchParams 与 DataGrid 的双向同步
// - wd-search-panel 内置「搜索 / 重置 / 展开 / 收起」按钮，with-actions 默认开启，不要额外添加
const q = ref({ name: '', status: '', categoryId: '', createRange: null, creator: '' })
const gridRef = ref()
</script>
```

> 其他用法（`search-text` / `reset-text` / `expand-text` / `action-width` / `filter` 多表联动 / `default-expand` 等）详见 docs 站 `WdSearchPanel` 组件文档。

**简要搜索（仅 1–2 个条件）——免 wd-panel，直接放进 DataGrid 的** **`#toolbar`** **插槽**：搜索与表格合并在一个容器内，搜索项在工具栏左区，与表格一体，页面少一层容器更紧凑。

```html
<wd-datagrid
  ref="gridRef"
  api="/api/users"
  :search-params="searchParams"
  :columns="columns"
>
  <!-- #toolbar 左区：简要搜索（1–2 个条件）+ 业务操作按钮 -->
  <template #toolbar>
    <el-select
      v-model="searchParams.status"
      placeholder="状态"
      clearable
      style="width: 110px"
    />
    <el-input
      v-model="searchParams.keyword"
      placeholder="搜索姓名 / 编码"
      clearable
      style="width: 180px"
      @keyup.enter="handleSearch"
      @clear="handleSearch"
    />
    <el-button type="primary" @click="handleSearch">查询</el-button>
    <el-button @click="handleReset">重置</el-button>
  </template>
</wd-datagrid>

<script setup>
// searchParams 直接参与 DataGrid 请求；查询/重置调用表格实例方法
const searchParams = ref({ status: '', keyword: '' })
const gridRef = ref()

function handleSearch() { gridRef.value?.search() }   // 带当前 searchParams 重新查询
function handleReset() { searchParams.value = { status: '', keyword: '' }; gridRef.value?.resetSearch() }
</script>
```

**选型口径**：搜索条件 ≤ 2 个且为轻量单行输入/选择 → 用此「#toolbar 内联」方式；搜索条件 ≥ 3 个或有展开/收起需求 → 用完整结构（`wd-panel` + `wd-search-panel`，见上）。

### 0.6 表单录入交互规范

**校验时机**：

| 校验类型       | 时机               | 说明                  |
| ---------- | ---------------- | ------------------- |
| 必填/格式校验    | 失焦校验（blur）       | 避免输入过程中频繁打断         |
| 关联性校验（查重等） | 失焦后异步校验，输入中清除旧错误 | 需防抖 300ms，避免请求抖动    |
| 整体校验       | 提交时全量校验          | 失败后自动滚动定位到第一个错误项并聚焦 |
| 错误提示位置     | 字段下方行内提示         | 表单顶部不再重复堆叠错误摘要      |

```ts
import { RequestAPI } from 'work-desktop'

// 防抖工具
function debounce(fn: Function, delay: number) {
  let timer: any = null
  return (...args: any[]) => {
    clearTimeout(timer)
    return new Promise((resolve, reject) => {
      timer = setTimeout(() => fn(...args).then(resolve).catch(reject), delay)
    })
  }
}

const formFields = [
  {
    prop: 'username',
    label: '用户名',
    placeholder: '示例：zhangsan',
    rules: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      {
        // 失焦后异步查重，防抖 300ms
        asyncValidator: debounce(async (rule: any, value: string) => {
          if (!value) return
          const res = await RequestAPI.get('/api/users/check-username', {
            params: { username: value }
          })
          if (!res.available) throw new Error('用户名已存在，请更换')
        }, 300),
        trigger: 'blur'
      }
    ]
  },
  {
    prop: 'email',
    label: '邮箱',
    placeholder: '示例：zhangsan@example.com',
    rules: [
      { required: true, type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ]
  }
]
```

**表单组织**：

- 字段 > 6 个时按业务分组，每组 3-6 个（沿用 DataForm 分组规范）
- 分组方式优先级：**分组标题 > 卡片分区 > 分步表单（Steps）**；只有流程有明显先后依赖时才用分步表单
- 联动字段：条件不满足时**隐藏而非禁用**（减少界面噪音）；但已填写过值的字段只能禁用并提示，不能隐藏（防止用户困惑数据去哪了）

**提交规范**：

- 提交按钮点击后进入 loading 态并禁用，防止重复提交（DataForm 内置此行为，手动提交场景必须自行处理）
- 提交成功：轻提示 + 按场景执行后续动作（关闭弹窗 / 跳转列表 / 清空继续）
- 表单有修改时离开需确认（沿用 Dialog/Drawer 内嵌 DataForm 联动规则）；程序触发的关闭不提示

```ts
// 手动提交场景：防重复提交
const submitting = ref(false)

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    await formRef.value.submit()
    ElMessage.success('保存成功')
  } finally {
    submitting.value = false
  }
}
```

**输入辅助**：

- 有格式要求的字段：placeholder 给出示例（如 `示例：zhangsan@example.com`）
- 可枚举的值用 Select/RadioList，不让用户手输；选项 > 20 个时 Select 开启搜索（`filterable`）
- **选项少时优先按钮列表**：单选/多选选项数量少（一般 ≤ 4\~6 个）、选项文案短时，用按钮形态的 `wd-radio-list` / `wd-checkbox-list`（开 `:button-style`）替代 select——选项直接铺开、一眼看清、点一次即可选中，比下拉「点击展开 → 再点选项」少一次交互；选项多、文案长、或选项数不稳定会增长时，仍用 select（过滤项搜索/换行不占版面）
- 数字、金额、百分比用 InputNumber，金额自动千分位格式化

### 0.7 弹窗与抽屉选型规范

**页面跳转原则——非必要不做直接跳转**：

| 展示方式 | 优先级 | 适用情形 | 说明 |
| --- | --- | --- | --- |
| Drawer 弹层 | **首选** | 非必要不跳转——新增/编辑/详情等新内容展示，优先在当前页以抽屉完成 | 优先用 `wd-drawer-button`（触发按钮 + 弹层一体：默认插槽内嵌 DataForm、`url` 模式 iframe 内嵌页面；关闭后 `head-refresh-datagrid` 声明式刷新列表）——保留列表上下文，操作完即回，搜索条件与页码不丢 |
| 新标签页 | 次选 | 内容确实需要独立工作区（复杂表单、需长时间停留或多页面并排对照） | 用 `wd-station` 的联动能力打开：`content-mode="tabs"` 下 ref 调用 `openTab({ key, title, path })`（同 key 去重并激活），或受控绑定 `v-model:open-tabs` / `v-model:active-menu` 由菜单与路由自动联动成标签页 |
| 浏览器级跳转 | 强烈不建议 | —— | **非常不建议** `window.open` / `target="_blank"` 打开新浏览器窗口，或当前页面直接跳转——丢失上下文、多窗口难管理；仅外部系统链接等确有必要时例外（用 `wd-route-button`） |

代码示例：

```html
<!-- 首选：抽屉展示新内容（wd-drawer-button，关闭后声明式刷新列表） -->
<el-table-column label="操作">
  <template #default="{ row }">
    <wd-drawer-button label="查看详情" title="用户详情" :data="row" link drawer-size="720px">
      <!-- 详情 / 表单内容 -->
    </wd-drawer-button>
  </template>
</el-table-column>

<!-- 次选：Station tabs 联动打开新标签页（同 key 去重并激活） -->
<el-button
  link
  type="primary"
  @click="stationRef?.openTab({ key: `user-detail-${row.id}`, title: `用户详情 - ${row.name}`, path: '/user/detail' })">
  在新标签页打开
</el-button>
```

> 下方选型表中的「独立页面（路由跳转）」在 Station 应用（tabs 模式）内即指**新标签页打开**——路由 push 自动成标签，而非浏览器窗口级跳转。

| 场景                 | 容器                            | 理由                       |
| ------------------ | ----------------------------- | ------------------------ |
| 简单确认、短文本提示         | MessageBox / Confirm          | 成本最低，不遮挡上下文              |
| 3 个以内字段的轻量录入（如重命名） | Dialog（小尺寸）                   | 信息少，居中聚焦                 |
| 4-15 个字段的表单（新增/编辑） | **Drawer（右侧滑出，默认 500-600px）** | 保留列表上下文                  |
| 字段很多的复杂表单、含表格编辑    | 独立页面（路由跳转）                    | 弹层内不做复杂交互                |
| 详情查看               | Drawer（较宽 720px+）或独立详情页       | 引用关系简单用 Drawer，需要分享链接用页面 |
| 弹层内再触发选择（选用户/选商品）  | 二级 Dialog                     | 最多两层，禁止三层嵌套              |

补充规则：

- Drawer/Dialog 尺寸使用预设档位（Drawer：500px / 560px / 720px），不随意自定义宽度
- 弹层打开时背景滚动锁定；关闭后焦点还原到触发元素
- 弹层内内容超长时**内容区滚动、底部操作栏固定**，保证「取消/确定」始终可见

```html
<!-- 典型：Drawer 内嵌 DataForm 编辑表单 -->
<wd-drawer v-model="drawerVisible" title="编辑用户" size="560px">
  <wd-data-form
    ref="formRef"
    mode="edit"
    api="/api/users/save"
    :fields="formFields"
    :initial-data="currentRow"
    @success="drawerVisible = false"
  />
</wd-drawer>
```

### 0.8 操作反馈规范

按操作影响范围选择反馈强度（弱 → 强），反馈不足会让用户疑惑，反馈过度会打断流程：

| 反馈级别  | 组件              | 适用场景                                | 时长         |
| ----- | --------------- | ----------------------------------- | ---------- |
| 轻提示   | ElMessage       | 保存成功、复制成功等常规成功反馈                    | 2-3s 自动消失  |
| 带操作提示 | ElMessage（延长时长） | 「删除成功，可撤销」类需要留意的反馈                  | 4-5s       |
| 通知    | ElNotification  | 异步任务完成（导出完成、审批结果），用户可能已离开当前上下文      | 手动关闭或 4.5s |
| 结果页   | Result / 对话框    | 关键流程终态（批量导入结果：成功 X 条、失败 Y 条可下载错误明细） | 用户确认后关闭    |

```ts
// 轻提示：常规成功反馈
ElMessage.success('保存成功')

// 带操作提示：需要用户留意的反馈
ElMessage({
  message: '删除成功，可在回收站中恢复',
  type: 'success',
  duration: 5000
})

// 通知：异步任务完成（用户可能已离开当前页面）
ElNotification({
  title: '导出完成',
  message: '用户数据导出已完成，点击下载文件',
  type: 'success',
  onClick: () => downloadFile(taskId)
})

// 失败反馈：必须包含原因 + 建议
ElMessage.error('保存失败：用户名已存在，请更换后重试')
```

规则：

- **成功反馈要轻**，不阻断流程；**失败反馈要重**，明确告知原因和解决办法（❌「操作失败」→ ✅「保存失败：用户名已存在，请更换后重试」）
- 乐观更新（先改界面再发请求）仅用于低风险操作（收藏、开关）；涉及资金、权限、删除的操作必须等接口返回成功后再更新界面

### 0.9 确认机制分级规范

按操作破坏性分级选择确认强度，破坏性越强确认成本越高：

| 级别      | 适用操作            | 交互                            |
| ------- | --------------- | ----------------------------- |
| L0 无确认  | 查询、刷新、查看、常规保存   | 直接执行                          |
| L1 轻确认  | 单个删除、禁用/启用、撤回   | Confirm 弹窗：说明操作后果 + 「确认/取消」   |
| L2 强确认  | 批量删除、清空、不可恢复的变更 | Confirm + 需输入指定文本，或勾选「我已了解风险」 |
| L3 二次授权 | 涉及权限/资金的高危操作    | L2 基础上 + 身份验证（由业务侧实现）         |

Confirm 文案公式：**操作 + 对象 + 后果 + 不可逆提示**。
示例：`确认删除用户「张三」？删除后该用户的数据将无法恢复。`

```html
<!-- L1 轻确认：使用 wd-confirm-button -->
<wd-confirm-button
  text="删除"
  type="danger"
  :confirm-text="`确认删除用户「${row.name}」？删除后该用户的数据将无法恢复。`"
  @confirm="() => handleDelete(row)"
/>
```

```ts
// L2 强确认：需输入指定文本才能继续
async function handleBatchDelete(rows: any[]) {
  try {
    await ElMessageBox.prompt(
      `该操作为批量删除，共 ${rows.length} 条数据，删除后不可恢复。请输入「确认删除」以继续：`,
      '高危操作确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        inputPattern: /^确认删除$/,
        inputErrorMessage: '请输入「确认删除」'
      }
    )
    await RequestAPI.post('/api/users/batch-delete', { ids: rows.map(r => r.id) })
    ElMessage.success(`已删除 ${rows.length} 条数据`)
    gridRef.value.refresh()
  } catch {
    // 用户取消，不做任何操作
  }
}
```

### 0.10 空状态与异常状态规范

每个数据视图必须覆盖以下四种状态，空状态不是终点，必须给用户**下一步可以做什么**：

| 状态       | 展示             | 行动引导             |
| -------- | -------------- | ---------------- |
| 空数据（初始）  | 图标/插画 + 「暂无数据」 | 给出主行动按钮（如「立即新增」） |
| 空数据（筛选后） | 「未找到符合条件的数据」   | 提供「清空筛选条件」按钮     |
| 加载失败     | 错误图标 + 失败原因    | 提供「重新加载」按钮       |
| 无权限      | 403 图标 + 说明    | 引导联系管理员或返回       |

#### 0.10.1 空状态文案规范（统一口径）

**主文案命名规律**：`<暂无/未找到> + <业务对象名> + <数据/结果>`。

| 场景 | 主文案（description） | 副文案（可选） | 主行动按钮 | 次行动按钮 |
| --- | --- | --- | --- | --- |
| 列表初始空（一次筛选都没点过） | 「暂无{业务对象}数据」（如「暂无用户数据」「暂无订单数据」） | 「点击右上角「新增」，开始创建第一条{业务对象}」 | 「立即新增{业务对象}」（type=primary） | — |
| 搜索/筛选后空 | 「未找到匹配结果」 | 「试试调整搜索条件，或清空筛选」 | — | 「清空筛选条件」 |
| 加载失败 | 「数据加载失败」 | 「网络或服务器异常，请稍后重试」 | 「重新加载」（type=primary） | — |
| 无权限 | 「暂无访问权限」 | 「请联系管理员开通{模块名}权限」 | — | 「返回上一页」「联系管理员」 |

```html
<wd-datagrid ref="gridRef" api="/api/users" :columns="columns">
  <!-- 空数据：区分初始空与筛选空 -->
  <template #empty>
    <el-empty :description="hasSearchCondition ? '未找到匹配结果' : '暂无用户数据'">
      <template v-if="hasSearchCondition" #description>
        <span>未找到匹配结果</span>
        <p style="font-size: 13px; color: var(--el-text-color-secondary)">试试调整搜索条件，或清空筛选</p>
      </template>
      <el-button v-if="hasSearchCondition" @click="handleClearSearch">清空筛选条件</el-button>
      <el-button v-else type="primary" @click="handleAdd">立即新增用户</el-button>
    </el-empty>
  </template>

  <!-- 加载失败 -->
  <template #error="{ retry }">
    <el-result icon="error" title="数据加载失败" sub-title="网络或服务器异常，请稍后重试">
      <template #extra>
        <el-button type="primary" @click="retry">重新加载</el-button>
      </template>
    </el-result>
  </template>
</wd-datagrid>
```

> **规范要点**：
> - **主文案必须点明业务对象**（如「暂无用户数据」而非空泛的「暂无数据」），用户一眼知道在看哪个模块的空态。
> - **副文案用灰色小字**（`--el-text-color-secondary`），字号 13px，不要喧宾夺主。
> - **按钮顺序**：主行动按钮 `type="primary"` 放左侧，次行动按钮放右侧（默认 type）；只有一个按钮时不强制居右。
> - **插画统一**：列表空态用 `el-empty` 默认插画，不要各页面自行上传自定义插画；只有品牌化页面才允许换图。

### 0.11 加载模式规范

| 加载时长预期     | 模式                                   | 说明                            |
| ---------- | ------------------------------------ | ----------------------------- |
| < 300ms    | 不做任何加载提示                             | 避免 loading 一闪而过造成闪烁           |
| 300ms - 2s | 局部 loading（按钮 loading / 表格内 loading） | 只锁操作区域                        |
| 2s - 10s   | 骨架屏（首屏）/ 局部 loading + 文案             | 骨架屏用于页面/卡片首次加载                |
| > 10s      | 进度条或转异步任务                            | 导出等长任务转后台，完成后 Notification 通知 |

规则：

- 骨架屏结构需与真实内容布局一致（表格骨架 = 行 + 列占位）
- 全屏 loading 只用于**页面初始化**这一种场景，操作类请求一律局部 loading
- loading 超过 10s 时补充说明文案（「数据量较大，正在加载…」）

```html
<!-- 页面首次加载：骨架屏 -->
<el-skeleton v-if="pageLoading" :rows="8" animated />
<template v-else>
  <wd-datagrid ... />
</template>

<!-- 操作类请求：按钮局部 loading -->
<el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
```

### 0.12 文案规范

**按钮文案**：用动词或动词+名词，2-4 个字（「保存」「新增用户」优于「确定」「提交」）。同类词汇全系统统一：

| 统一用词  | 避免混用                                  |
| ----- | ------------------------------------- |
| 新增    | 新建、添加、创建                              |
| 编辑    | 修改、更新                                 |
| 删除    | 移除、清除                                 |
| 查询    | 搜索、查找（按钮用「查询」，输入框 placeholder 可用「搜索」） |
| 保存并继续 | 保存并新增、继续添加                            |

**提示文案**：

- 成功：陈述结果即可——「保存成功」
- 失败：原因 + 建议——「保存失败：网络异常，请稍后重试」
- 确认：操作 + 对象 + 后果（见 0.9 文案公式）
- 不说技术黑话：❌「接口 500」「请求超时 code:ECONNABORTED」→ ✅「系统繁忙，请稍后重试」

**时间与数字**：

- 时间展示：列表中用相对时间（刚刚 / x 分钟前 / x 小时前），悬停显示完整时间（沿用表格行规范）
- 数字：千分位格式化；金额统一保留 2 位小数；空值显示 `-`，不显示 `null` / `undefined` / 空白

### 0.13 按钮组件选型与使用场景

WorkDesktop 提供 8 个按钮组件，全部继承自 TipsButton（自带 `tips/tipsType/placement` 悬停提示能力，透传 el-button 全部属性），但核心能力分工不同。选型时从 **"我需要做什么"** 出发，而非按组件名直觉选择。

#### 选型决策树

```
用户点击按钮后，需要发生什么？
│
├── 只是按钮本身要触发一个 Vue 方法，但想加个悬停说明？
│   └── TipsButton（纯 el-button + el-tooltip，不发请求、不开弹层，emit=click）
│
├── 要跳转到另一个页面 / 路由？
│   ├── 当前窗口跳转 → RouteButton（routeName/routePath + params/query）
│   └── 新窗口打开     → RouteButton（target="_blank"）
│   ※ 不发请求，纯路由跳转；无 vue-router 环境时自动退化为 window.location
│   ⚠ 跳转受 §0.7 页面跳转原则约束——非必要不做直接跳转，新内容展示优先 Drawer 弹层 / Station 新标签页；仅外部系统链接等确有必要时才用
│
├── 要请求后端接口？
│   ├── 点击直接发请求（高频、低风险操作）
│   │   └── ApiButton（走 useApiAction：loading + 成功提示 + 联动刷新）
│   │       例：批量启用、设为默认、重置排序
│   │
│   ├── 发请求前需要用户先输入一个值（如重命名、重置密码新值）
│   │   └── PromptButton（ElMessageBox.prompt → 输入值并入 apiParam[paramKey] → 发请求）
│   │       例：重置密码需输入新密码、重命名需要输入新名称
│   │
│   ├── 发请求前需要二次确认（L1 轻确认）
│   │   ├── 强打断（MessageBox 居中弹窗，必须选"确定/取消"）
│   │   │   └── ConfirmButton（`confirm-text` + `confirm-title` + `cancel-text`）
│   │   │       例：批量删除、重置排序、清空缓存
│   │   │
│   │   └── 轻提示（气泡 popconfirm，附在按钮下方，不遮挡上下文）
│   │       └── PopconfirmButton（title 透传给 el-popconfirm，tooltip 与 popconfirm 平级共存）
│   │           例：行内单条启停状态切换、删除按钮（DataGrid 行操作列内）
│   │
│   └── 发请求前需要打开弹层让用户填写表单 / 选择数据
│       ├── 4-15 字段的表单（新增/编辑，保留列表上下文） → DrawerButton（右侧 Drawer）
│       ├── 3 字段以内的轻量录入 / 选择器 → DialogButton（居中 Dialog）
│       └── iframe 嵌入外部页面 → DrawerButton / DialogButton 的 url 模式
│
└── 以上都不是？
    → 用原生 el-button（不需要联动刷新 / 提示 / 弹层的场景）
```

#### 组件一览矩阵

| 组件                   | 核心能力               | 发请求                        | 开弹层                       | 联动刷新 | 典型场景                    | 关键 props                                       |
| -------------------- | ------------------ | -------------------------- | ------------------------- | ---- | ----------------------- | ---------------------------------------------- |
| **TipsButton**       | 给 el-button 加悬停提示  | ❌                          | ❌                         | ❌    | 按钮有专业术语/缩写需要解释时         | `tips` / `placement`                           |
| **RouteButton**      | 路由跳转               | ❌                          | ❌                         | ❌    | 跳到详情页 / 新窗口打开日志         | `routeName` 或 `routePath` / `query` / `target` |
| **ApiButton**        | 点击即请求              | ✅                          | ❌                         | ✅    | 批量启用、设为默认、状态切换          | `api` / `apiMethod` / `buttonLoading`          |
| **PromptButton**     | 输入框 → 请求           | ✅                          | ❌（MessageBox.prompt 不是弹层） | ✅    | 重置密码（需输入新密码）、重命名        | `promptTitle` / `paramKey`                     |
| **ConfirmButton**    | MessageBox 确认 → 请求 | ✅                          | ❌                         | ✅    | 批量删除、清空数据、重置排序          | `confirmText` / `cancelText`                   |
| **PopconfirmButton** | 气泡确认 → 请求          | ✅                          | ❌                         | ✅    | 行内删除、单条启停（不想打断上下文）      | `title` / `confirmButtonText`                  |
| **DrawerButton**     | 点开 Drawer          | 内部嵌 DataForm 时由 DataForm 发 | ✅（Drawer）                 | ✅    | 新增 / 编辑 / 导入流程（4-15 字段） | `title` / `data` / `size`                      |
| **DialogButton**     | 点开 Dialog          | 内部嵌 DataForm 时由 DataForm 发 | ✅（Dialog）                 | ✅    | 弹窗选择器 / 轻量录入（≤3 字段）     | `title` / `data` / `size`                      |

#### 各按钮典型场景代码

##### TipsButton —— 给普通按钮加悬停提示

纯 el-button + el-tooltip 封装，**不发请求、不开弹层、不 emit 联动事件**。适用场景：按钮文案有专业缩写、需要补充说明、或 UI 空间不够展开完整文案时。

```html
<!-- 工具栏：按钮文案是缩写，悬停展开完整说明 -->
<wd-tips-button tips="批量将选中用户状态改为启用">批量启用</wd-tips-button>
<wd-tips-button tips="重新触发所有定时任务执行">重跑任务</wd-tips-button>

<!-- 行内按钮：悬停显示操作后果（非确认，只是说明） -->
<el-table-column label="操作">
  <template #default="{ row }">
    <wd-tips-button tips="冻结后用户无法登录，可随时解冻">冻结</wd-tips-button>
  </template>
</el-table-column>
```

> **注意**：TipsButton 和 WdTips 组件是两个东西——TipsButton 是按钮组件（el-button + tooltip），WdTips 是提示组件（info/warning 图标 + 悬停说明，或 box 横幅）。TipsButton 用于按钮级，WdTips 用于表格单元格内的状态说明和页面顶部的横幅提示。

##### RouteButton —— 路由跳转

纯路由跳转，**不发请求**。适用：跳到详情页、跳转带参数到另一个业务页、新窗口打开日志/审计记录（受 §0.7 页面跳转原则约束——非必要不做直接跳转，仅外部系统链接等确有必要时使用）。支持 `target="_blank"` 新窗口打开，也支持无 vue-router 环境（自动退化为 `window.location`）。

```html
<!-- 行内"查看"按钮：跳到独立详情页（保留浏览器地址栏 + 可分享链接） -->
<el-table-column label="操作">
  <template #default="{ row }">
    <wd-route-button route-path="/user/detail" :query="{ id: row.id }" link>查看</wd-route-button>
    <!-- 对比：如果用 DrawerButton，则在当前页右侧滑出（不保留独立 URL） -->
  </template>
</el-table-column>

<!-- 工具栏"查看审计日志"：新窗口打开 -->
<wd-route-button
  route-name="auditLog"
  :params="{ bizType: 'user' }"
  target="_blank"
>查看审计日志</wd-route-button>
```

##### ApiButton —— 点击直接请求

**高频、低风险**操作首选。点击即发请求（ElMessageBox.prompt 不弹），请求期间按钮自动转圈 loading（`buttonLoading` 可关），成功后自动 `ElMessage.success`（可通过全局配置/`reqOptions.showTips` 关闭），声明式联动刷新目标 DataGrid。

```html
<!-- 批量启用：选中行后直接请求 -->
<wd-api-button
  api="/api/users/batch-enable"
  :api-param="{ ids: selectedIds }"
  :head-refresh-datagrid="true"
>批量启用</wd-api-button>

<!-- 设为默认：单条数据的快捷操作，行内 -->
<el-table-column label="默认" width="80">
  <template #default="{ row }">
    <wd-api-button
      v-if="!row.isDefault"
      type="text"
      api="/api/users/set-default"
      :api-param="{ id: row.id }"
      :head-refresh-datagrid="true"
    >设为默认</wd-api-button>
    <el-tag v-else type="success">默认</el-tag>
  </template>
</el-table-column>
```

##### PromptButton —— 输入值后请求

需要用户**先输入一个值再发请求**的场景。点击后弹 `ElMessageBox.prompt`，用户输入的值自动合并到 `apiParam[paramKey]`（默认字段名 `'value'`）然后发请求。

```html
<!-- 行内"重置密码"：让用户先输入新密码 -->
<el-table-column label="操作">
  <template #default="{ row }">
    <wd-prompt-button
      api="/api/users/reset-password"
      :api-param="{ userId: row.id }"
      param-key="newPassword"
      prompt-title="重置用户密码"
      prompt-placeholder="请输入新密码（6-20 位）"
      confirm-text="确认重置"
      type="warning"
      link
      :head-refresh-datagrid="false"
    >重置密码</wd-prompt-button>
    <!-- 注意：重置密码通常不改 DataGrid 数据，headRefreshDatagrid 关掉 -->
  </template>
</el-table-column>

<!-- 工具栏"重命名分类" -->
<wd-prompt-button
  api="/api/category/rename"
  :api-param="{ id: currentCategory.id }"
  param-key="newName"
  prompt-title="重命名分类"
  :prompt-default="currentCategory.name"
  prompt-placeholder="请输入分类新名称"
>重命名</wd-prompt-button>
```

##### ConfirmButton —— MessageBox 二次确认后请求

**破坏性 / 不可恢复**操作的首选。点击后弹 `ElMessageBox.confirm` 居中弹窗（强打断，必须选"确定/取消"才能继续），确认后才发请求。比 PopconfirmButton 确认成本更高，适合 L1 以上的破坏性操作（见 0.9 确认机制分级规范）。

```html
<!-- 批量删除：L1 轻确认 -->
<wd-confirm-button
  v-if="selectedRows.length"
  api="/api/users/batch-delete"
  :api-param="{ ids: selectedIds }"
  confirm-text="确认删除选中的用户？删除后该用户的数据将无法恢复。"
  type="danger"
  :head-refresh-datagrid="true"
>批量删除</wd-confirm-button>

<!-- 工具栏"清空全部数据"：L1 确认 + 自定义弹窗标题与取消按钮文案 -->
<!-- 注：ConfirmButton 的 confirmText 是 MessageBox 提示文字（message），confirmTitle 是弹窗标题，
      cancelText 是取消按钮文案；确认按钮文案硬编码为"确定"不可配。 -->
<wd-confirm-button
  api="/api/logs/clear"
  confirm-text="确认清空全部操作日志？该操作不可恢复。"
  confirm-title="高危操作"
  cancel-text="再想想"
  type="danger"
>清空日志</wd-confirm-button>
```

##### PopconfirmButton —— 气泡确认后请求

**比 ConfirmButton 轻量的二次确认形态**。不弹居中 MessageBox，而是在按钮下方弹 `el-popconfirm` 气泡（"确定 / 取消"），不遮挡页面上下文、用户扫一眼就能反应过来。适合 DataGrid 行操作列内的确认型操作——行内按钮本身空间有限，弹居中 MessageBox 显得过重。

实现技巧：`el-tooltip`（悬停提示）和 `el-popconfirm`（确认气泡）均以 `virtual-ref` 指向同一按钮，**平级共存不嵌套**——嵌套会触发 ElementPlus `[ElOnlyChild]` 警告且事件转发失效。

```html
<!-- DataGrid 行内：单条删除（行内操作列内用 PopconfirmButton 比 ConfirmButton 体验更轻） -->
<el-table-column label="操作" width="200">
  <template #default="{ row }">
    <wd-drawer-button label="编辑" title="编辑" :data="row" link />
    <wd-popconfirm-button
      title="确认删除该用户？"
      api="/api/users/delete"
      :api-param="{ id: row.id }"
      type="danger"
      link
      tips="删除后数据将无法恢复"
      :head-refresh-datagrid="true"
    >删除</wd-popconfirm-button>
    <!-- tooltip 气泡（tips）在 hover 时出现，popconfirm 气泡在 click 时出现，两者不冲突 -->
  </template>
</el-table-column>

<!-- 单条启用/禁用切换 -->
<wd-popconfirm-button
  :title="row.status === 1 ? '确认禁用？禁用后用户无法登录。' : '确认启用该用户？'"
  api="/api/users/toggle-status"
  :api-param="{ id: row.id, status: row.status === 1 ? 0 : 1 }"
  link
  :head-refresh-datagrid="true"
>{{ row.status === 1 ? '禁用' : '启用' }}</wd-popconfirm-button>
```

##### DrawerButton —— 打开 Drawer 弹层

点击打开右侧 Drawer（默认 size="50%"，500px），内部**内嵌一个插槽**，插槽里放什么都可以——最常见是 WdDataForm（新增/编辑），也可以是 iframe（`drawerUrl` 模式嵌入外部页面）。关闭后通过 `headCloseDrawer` 自动联动刷新目标 DataGrid。

**与 DialogButton 的边界**：DrawerButton 打开 Drawer（保留列表上下文、从右侧滑出），适合 **4-15 字段的表单**（新增/编辑）；DialogButton 打开居中 Dialog，适合 **3 字段以内的轻量录入或选择器**。

```html
<!-- 新增：DrawerButton 内嵌 DataForm（create 模式，保存后可连续新增） -->
<template #toolbar>
  <wd-drawer-button label="新增用户" title="新增用户" size="50%" type="primary">
    <wd-data-form
      mode="create"
      submit-api="/api/users/save"
      submit-method="post"
      :head-close-drawer="true"
      :head-refresh-datagrid="true"
      :keep-form-button="true"
    >
      <!-- 表单项... -->
    </wd-data-form>
  </wd-drawer-button>
</template>

<!-- 编辑：DrawerButton 带 data 传给 DataForm（edit 模式，自动回填） -->
<el-table-column label="操作">
  <template #default="{ row }">
    <wd-drawer-button label="编辑" title="编辑用户" size="50%" :data="row" link>
      <wd-data-form
        mode="edit"
        api="/api/users/detail"
        :api-param="{ id: row.id }"
        submit-api="/api/users/update"
        submit-method="put"
        :head-close-drawer="true"
        :head-refresh-datagrid="true"
        :confirm-leave="true"
      >
        <!-- 表单项... -->
      </wd-data-form>
    </wd-drawer-button>
  </template>
</el-table-column>
```

> **Prop 名说明**：DrawerButton / DialogButton 的弹层相关 props 不带前缀——`title` 是弹层标题、`size` 是弹层尺寸（Drawer 默认 `'50%'` 宽 / Dialog 默认 `'50%'` 宽）、`data` 是传给内部表单的数据（edit 模式下 DataForm 用它回填）。按钮自己的文案用 `label` prop 或默认插槽，按钮尺寸用 `buttonSize`（避免与弹层 size 冲突）。

##### DialogButton —— 打开 Dialog 弹层

点击打开居中 Dialog（默认 size="50%"，约 400px），与 DrawerButton 同构但弹层不同。适用场景：**3 字段以内的轻量录入 / 弹窗选择器**（见场景六：弹窗选择器）。

```html
<!-- 弹窗选择器：点"选择用户"打开 Dialog，内嵌 DataGrid 供选择 -->
<wd-dialog-button label="选择" title="选择用户" size="720px" link @confirm="handleUserSelect">
  <wd-datagrid api="/api/users" :active="true" :with-selection="true">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="deptName" label="部门" />
    <!-- ... -->
  </wd-datagrid>
  <template #footer>
    <el-button @click="dialogVisible = false">取消</el-button>
    <el-button type="primary" @click="confirmSelection">确认</el-button>
  </template>
</wd-dialog-button>

<!-- 轻量录入：Dialog 内嵌 3 字段 DataForm（重命名、快捷创建） -->
<wd-dialog-button label="新建标签" title="新建标签" size="400px" type="primary">
  <wd-data-form
    mode="create"
    submit-api="/api/tags/save"
    :head-close-drawer="true"
    :head-refresh-datagrid="true"
  >
    <wd-form-item label="标签名称" prop="name" required>
      <el-input v-model="form.name" placeholder="请输入标签名称" />
    </wd-form-item>
    <wd-form-item label="标签颜色" prop="color">
      <el-color-picker v-model="form.color" />
    </wd-form-item>
    <wd-form-item label="标签描述" prop="desc">
      <el-input type="textarea" v-model="form.desc" />
    </wd-form-item>
  </wd-data-form>
</wd-dialog-button>
```

#### 选型边界与常见误区

| 误区                                                  | 正确做法                                                                                                                              |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| "需要二次确认，所以用 ConfirmButton"                          | 先看场景：DataGrid **行操作列内**用 PopconfirmButton（气泡更轻、不打断上下文）；**工具栏** / **批量 / 不可恢复操作** 用 ConfirmButton（强打断明确告知风险）                       |
| "点击后打开表单，所以用 DialogButton"                          | 4-15 字段的新增/编辑**优先 DrawerButton**（Drawer 保留列表上下文，从右侧滑出符合主流后台管理习惯）；Dialog 只用于 3 字段以内的轻量录入                                           |
| "需要跳转，所以用 DrawerButton 打开 iframe"                   | 先判断：**目标是已有路由的业务页面**（用户需要独立 URL / 刷新保留状态 / 浏览器前进后退）→ RouteButton；目标是**独立的、仅做一件事的小页面**（导入、选择器）→ DrawerButton/DialogButton + iframe |
| "ApiButton 和 ConfirmButton 有什么区别？"                  | ApiButton = 点击即发请求（无前置交互）；ConfirmButton = MessageBox 确认后才发请求（有前置确认）。两者底层都是 `useApiAction`，只是前置环节不同                                |
| "给按钮加 tooltip 一定要用 el-tooltip 手动包？"                 | 直接用 TipsButton——内置 tooltip，`tips` 属性设文案即可，其他按钮组件（ApiButton/ConfirmButton 等）**全部继承 TipsButton**，也自带 `tips` 属性                      |
| "ConfirmButton 和 PromptButton 都是 MessageBox，有什么区别？" | ConfirmButton = confirm（二选一：确定或取消）；PromptButton = prompt（先输入一个值再确定）。PromptButton 适合"重置密码需输入新密码"、"重命名需输入新名称"这类场景                   |

***

