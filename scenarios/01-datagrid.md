# 场景一：分页数据展示页面（DataGrid 标准场景）

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-10-14\
> **当前版本**：V\_1.0\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：搜索 + 分页表格的标准结构与交互规范\
> **文档简略描述**：本文件是「编码场景指导」的子路由，由 `document/scenarios_v1.0.md`（V\_1.17）拆分而来。小节编号（§x.y）与主文档一致；跨场景引用（如"见 §1.7"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。内容修改请先改主文档，再同步本文件。


### 1.1 场景描述

分页数据展示是企业后台最常见的页面类型。一个完整的列表页包含搜索、操作、展示、分页四个区域，用户从搜索触发查询、在操作区维护数据、在表格中浏览、通过分页切换页码。

### 1.2 页面结构图

```
┌─────────────────────────────────────────────────┐
│  SearchPanel（搜索面板）                            │
│  [搜索表单字段...]  [重置] [搜索]                    │
│  （条件多时可折叠/展开）                             │
├─────────────────────────────────────────────────┤
│  [操作按钮组]              [刷新][列设置][模式切换]      │
│  添加 | 批量删除 | 设为可用 | ...                    │
├─────────────────────────────────────────────────┤
│                                                 │
│            Table（撑满剩余高度）                     │
│                                                 │
├─────────────────────────────────────────────────┤
│                Pagination（分页）                   │
└─────────────────────────────────────────────────┘
```

### 1.3 区域拆解

#### A. 搜索面板（SearchPanel）

| 需求   | 说明                   |
| ---- | -------------------- |
| 搜索表单 | 用户输入查询条件             |
| 重置按钮 | 清空所有搜索条件，恢复默认        |
| 搜索按钮 | 触发 DataGrid 重新请求     |
| 折叠功能 | 搜索条件多时，默认只显示一行，展开看全部 |

#### B. 操作按钮组（左侧 toolbar）

| 需求       | 说明                              |
| -------- | ------------------------------- |
| 添加数据     | 打开 Drawer/Dialog 嵌入 DataForm 新增 |
| 批量删除选中   | 取表格选中行，批量删除（ConfirmButton）      |
| 设为可用/不可用 | 取表格选中行，批量修改状态（ApiButton）        |
| 其他维护操作   | 按业务需要放置                         |

> 操作按钮组不内置具体按钮，通过插槽让用户自行放置 ApiButton / ConfirmButton 等。

#### C. 表格功能按钮（右侧 tools）

| 需求        | 说明                                |
| --------- | --------------------------------- |
| 数据刷新      | 刷新当前页数据                           |
| 列设置       | 动态显示/隐藏列、拖拽排序，状态持久化到 localStorage |
| 表格/列表模式切换 | 表格模式（行列）↔ 列表模式（卡片），模式切换           |

#### D. 表格主体

| 需求     | 说明                              |
| ------ | ------------------------------- |
| 撑满剩余高度 | 表格高度自动填充父容器去掉搜索区和操作区后的剩余空间      |
| 固定表头   | 表头固定，内容区滚动                      |
| 多选     | checkbox 多选，selection-change 事件 |
| 排序     | 列排序支持                           |
| 行合并    | rowspan 支持                      |
| 行操作列   | 每行末尾的编辑/查看/删除等操作按钮              |

#### E. 分页（Pagination）

| 需求     | 说明                                                |
| ------ | ------------------------------------------------- |
| 分页样式档位 | simple（只有上下页）/ normal（页码+跳转）/ full（总数+页码+跳转+条数选择） |
| 可调节    | 通过属性切换样式档位                                        |

### 1.4 交互流程

```
页面加载
  ↓
DataGrid active=true → 自动请求第一页数据
  ↓
用户输入搜索条件 → 点搜索
  ↓
SearchPanel 触发 DataGrid.refresh() → 重置到第一页，带搜索参数请求
  ↓
用户点列设置 → 调整列显示/排序 → 状态持久化
  ↓
用户点模式切换 → 表格 ↔ 列表（卡片）模式
  ↓
用户切分页 → Pagination 触发 page-change → DataGrid 请求对应页
  ↓
用户选中行 → selection-change 事件 → 父组件拿到选中行 → 操作按钮可用
  ↓
用户点批量删除 → ConfirmButton 二次确认 → ApiButton 请求 → 成功后刷新表格
```

### 1.5 代码示例（纯 HTML 引入）

```html
<wd-datagrid
  api="/api/users"
  api-method="post"
  :active="true"
  :with-pager="true"
  :with-search="true"
  :auto-height="true"
  :tools="{ refresh: true, columnSetting: true, modeSwitch: true }"
  pager-style="full">
  
  <!-- 左侧操作按钮组 -->
  <template #toolbar>
    <wd-drawer-button label="新增" title="新增" type="primary" />
    <wd-confirm-button
      api="/api/users/batch-delete"
      api-method="post"
      confirm-text="确认删除选中的数据？"
      type="danger"
      :head-refresh-datagrid="true">
      批量删除
    </wd-confirm-button>
  </template>

  <!-- 表格列 -->
  <el-table-column type="selection" width="60" align="center" />
  <el-table-column prop="name" label="名称" sortable />
  <el-table-column prop="code" label="编码" />
  <el-table-column prop="status" label="状态">
    <template #default="{ row }">
      <wd-tips :tips="row.status === 1 ? '可用' : '不可用'"
        :color="row.status === 1 ? '#67c23a' : '#f56c6c'" />
    </template>
  </el-table-column>
  <el-table-column label="操作" width="180">
    <template #default="{ row }">
      <wd-drawer-button label="编辑" title="编辑" size="50%" :data="row" />
      <wd-confirm-button
        api="/api/users/delete"
        :api-param="{ id: row.id }"
        type="danger"
        :head-refresh-datagrid="true">
        删除
      </wd-confirm-button>
    </template>
  </el-table-column>
</wd-datagrid>
```

### 1.6 该场景对组件规格的补充需求

| 组件          | 补充项             | 说明                                                          |
| ----------- | --------------- | ----------------------------------------------------------- |
| DataGrid    | `toolbar` 插槽    | 左侧操作按钮区，用户自定义内容                                             |
| DataGrid    | `tools` 配置对象    | 右侧功能按钮，每项可开关：`{ refresh, columnSetting, modeSwitch, size }` |
| DataGrid    | `autoHeight`    | 撑满父容器剩余高度                                                   |
| DataGrid    | `pagerStyle`    | 分页样式档位：`'simple' \| 'normal' \| 'full'`                     |
| DataGrid    | `tableSize`     | 表格尺寸档位：`'large' \| 'default' \| 'small'`                    |
| DataGrid    | `withIndex`     | 是否显示序号列，默认 true，宽 60 居中                                     |
| DataGrid    | `withSelection` | 是否显示多选列，默认 false，宽 60 居中                                    |
| SearchPanel | `withActions`   | 内置查询/重置按钮，默认 true                                           |
| SearchPanel | 查询联动            | 搜索时触发 DataGrid 刷新（重置到第一页）                                   |

> 分页样式档位 `pagerStyle` 已包含在 DataGrid 属性中，不单独出 Pagination 组件。

### 1.7 表格行渲染规范

表格行的列内容应遵循以下渲染规范，保证数据清晰、操作安全、信息密度合理。

#### 列布局原则

```
| 列1   | 列2   | 列3   | ... | 操作列              |
| 数据  | 数据  | 数据  |     | [编辑][删除]▾        |
```

- **左侧为数据列**：展示业务字段（名称、编码、状态等）
- **右侧为功能按钮列**：操作列固定在末尾，宽度适中

#### 列内容渲染规范

| 数据类型         | 渲染方式                   | 示例                                           |
| ------------ | ---------------------- | -------------------------------------------- |
| 普通文本         | 直接显示                   | `<el-table-column prop="name" label="名称" />` |
| 分类/类型/状态标签   | 用 Tag 标签显示，带语义色        | 见下方代码                                        |
| 时间/日期        | 图标 + 时间文本，减帧显示         | 见下方代码                                        |
| 备注等长文本（不常关注） | Tips 组件，只显示感叹号图标，悬停看全文 | 见下方代码                                        |
| 布尔/开关        | 直接显示状态文案或 Tag          | 同分类处理                                        |

#### 操作列规范

| 场景            | 规范                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------- |
| 删除等抹除操作       | **必须**用 ConfirmButton 或 Popconfirm 二次确认                                                       |
| 常用操作（编辑/查看）   | 直接显示按钮                                                                                        |
| 按状态不可用的操作     | **不渲染**，不要显示成灰色禁用按钮——禁用按钮既挤占操作列空间，又让用户反复尝试点不动的入口。例：单据状态=完成/已作废时不显示「编辑」；已审核的不显示「提交审核」          |
| 仅临时不可用        | 才使用 `disabled`（无权限、后台处理中、数据未就绪），并通过 tips 说明原因                                                 |
| 操作较多 / 列数较多   | 1–2 个最高频操作外露为按钮，辅助/不常用操作收纳到「更多」下拉；操作列建议 `fixed="right"`，避免横向滚动后找不到操作入口                        |
| 操作按钮优先 icon 化 | 能不用文字就不显示文字——用 `wd-tips-button` 只设 `icon`、**不设** **`label`** 展示（悬停仍会通过 `tips` 提示操作内容），节省操作列宽度 |
| 细粒度控制尺寸       | 操作列内按钮、Tag 等控件能小则小，统一用 `size="mini"` 展示，避免挤占行高                                                |

**「隐藏」与「禁用」的判定口径**：看该操作在当前行的生命周期内是否还有机会可用——

- 状态流转不可逆（已完成、已作废、已结案）→ 该操作对这一行**永久不可用** → `v-if` 不渲染；
- 只是此刻不能点（无权限、审批处理中、依赖数据加载中），后续条件满足后可以点 → `disabled` + 原因提示。

#### 代码示例

```html
<!-- 分类/类型列：用 Tag 显示 -->
<el-table-column prop="category" label="分类" width="120">
  <template #default="{ row }">
    <el-tag :type="row.categoryType">{{ row.categoryName }}</el-tag>
  </template>
</el-table-column>

<!-- 时间日期列：图标 + 时间文本 -->
<el-table-column prop="createTime" label="创建时间" width="180">
  <template #default="{ row }">
    <span style="display:inline-flex;align-items:center;gap:4px">
      <el-icon><Calendar /></el-icon>
      <span>{{ formatDate(row.createTime) }}</span>
    </span>
  </template>
</el-table-column>

<!-- 备注列：Tips 感叹号图标，悬停显示 -->
<el-table-column prop="remark" label="备注" width="80" align="center">
  <template #default="{ row }">
    <wd-tips
      v-if="row.remark"
      type="word"
      icon="WarningFilled"
      color="#909399"
      :tips="row.remark" />
    <span v-else>-</span>
  </template>
</el-table-column>

<!-- 操作列：按状态渲染高频按钮 + 下拉收纳低频操作 -->
<el-table-column label="操作" width="160" fixed="right">
  <template #default="{ row }">
    <!-- 已完成/已作废的单据不渲染编辑、删除：永久不可用的操作不占位 -->
    <wd-drawer-button
      v-if="row.status !== 'completed' && row.status !== 'void'"
      label="编辑"
      title="编辑"
      :data="row"
      link />
    <!-- 审批处理中只是临时不可用：禁用 + tips 说明原因 -->
    <el-tooltip
      v-if="row.status !== 'void'"
      :content="row.status === 'approving' ? '审批处理中，暂不能删除' : '删除后数据无法恢复'"
      :disabled="row.status !== 'approving'">
      <!-- el-tooltip 只有一个子元素，外层包 span 避免与 v-if 注释节点冲突 -->
      <span>
        <wd-confirm-button
          api="/api/users/delete"
          :api-param="{ id: row.id }"
          :disabled="row.status === 'approving'"
          type="danger"
          link
          :head-refresh-datagrid="true">
          删除
        </wd-confirm-button>
      </span>
    </el-tooltip>
    <!-- 低频操作收纳到下拉；“查看日志”对所有状态可用 -->
    <el-dropdown @command="(cmd) => handleMoreCommand(cmd, row)">
      <el-button link type="primary">更多<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="enable" :disabled="!canEnable(row)">设为可用</el-dropdown-item>
          <el-dropdown-item command="disable">设为不可用</el-dropdown-item>
          <el-dropdown-item command="logs" divided>查看日志</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </template>
</el-table-column>
```

**icon 化 + 小尺寸示范**（操作列宽度紧张时的推荐写法）：高频按钮不显示文字，只放 icon，悬停用 `tips` 说明；行内按钮/Tag 统一 `size="mini"`。

```html
<el-table-column label="操作" width="120" fixed="right" align="center">
  <template #default="{ row }">
    <!-- 只设 icon 不设 label：悬停仍通过 tips 说明操作；统一 size="mini" -->
    <wd-tips-button
      v-if="row.status !== 'completed' && row.status !== 'void'"
      icon="Edit"
      tips="编辑"
      size="mini"
      link
      @click="openEdit(row)" />
    <el-tooltip :content="row.status === 'approving' ? '审批中，暂不能删除' : '删除'" :disabled="row.status !== 'approving'">
      <span>
        <wd-confirm-button
          v-if="row.status !== 'void'"
          api="/api/users/delete"
          :api-param="{ id: row.id }"
          :disabled="row.status === 'approving'"
          icon="Delete"
          type="danger"
          size="mini"
          link
          :head-refresh-datagrid="true" />
      </span>
    </el-tooltip>
    <!-- 状态/分类等 Tag 同样用 size="mini" -->
    <el-tag v-if="row.status === 'enabled'" type="success" size="mini">启用</el-tag>
  </template>
</el-table-column>
```

> `wd-tips-button` 透传 el-button 属性，故 `icon / size / type / link` 均可直接使用；`label` 留空即只有 icon，`tips` 提供悬停语义说明。

### 1.8 表格 Size 功能

表格右上角功能按钮区增加 Size 调整功能（中文"调整大小"），用于调整表格的内边距与字号。

| 预置档位      | padding | font-size | 适用          |
| --------- | ------- | --------- | ----------- |
| `large`   | 16px    | 16px      | 信息少，强调可读性   |
| `default` | 12px    | 14px      | 常规默认        |
| `small`   | 8px     | 13px      | 信息密集，一屏看更多行 |

- 对齐 ElementPlus 的 `size` 体系（large/default/small）
- 用户选择后可持久化到 localStorage
- 通过 DataGrid `tools.size` 开关控制是否显示

### 1.9 列较多时的显示优化

当数据表显示的列较多（超出可视区域宽度）时，应开启以下显示优化，避免横向大幅滚动、提升一屏信息密度与可读性。

**总原则**：列多时优先**降列数**（合并/收纳/藏详情），再谈**省宽度**（固定宽 + 悬停看全文）+ **提可读**（border/stripe/固定操作列）。能少一列就少一列，比压窄每一列更有效。

#### 策略一：唯一标识列固定宽度 + 悬停看全文

ID、单号、编码等唯一标识属于低频精确值，不必全量展示。用**固定窄列宽 +** **`show-overflow-tooltip`**，超出一行省略为 `…`，鼠标悬停显示完整内容。

```html
<el-table-column prop="code" label="单号" width="140" show-overflow-tooltip />
```

#### 策略二：短状态/分类用 Tag 与名称等合并为一列

状态、分类这类**短字段不单独占一列**，以 Tag 形式与主列（名称/型号）放在同一列内，紧跟主文本之后。既保留语义色，又省一列宽度。

```html
<el-table-column prop="name" label="名称" min-width="220">
  <template #default="{ row }">
    <div class="name-cell">
      <span>{{ row.name }}</span>
      <el-tag v-if="row.status === 1" type="success" size="small">启用</el-tag>
      <el-tag v-else type="info" size="small">停用</el-tag>
    </div>
  </template>
</el-table-column>
```

#### 策略三：操作按钮低频项收进「更多」下拉

操作较多时，保留 1–2 个最高频按钮，其余**不常用操作折叠进「更多」`el-dropdown`**。规则见 §1.7 操作列规范，操作列建议 `fixed="right"`。

#### 策略四：说明/备注列不列内容，用 wd-tips + 固定窄列宽

说明、备注等长文本**不把内容铺开**，用 `wd-tips type="word"` 只显示感叹号/问号图标，鼠标悬停看全文，固定窄列宽（如 56–80px）。

```html
<el-table-column prop="remark" label="备注" width="80" align="center">
  <template #default="{ row }">
    <wd-tips
      v-if="row.remark"
      type="word"
      icon="WarningFilled"
      color="#909399"
      :tips="row.remark" />
    <span v-else>-</span>
  </template>
</el-table-column>
```

> 说明/备注这类需固定查看的内容用 wd-tips（悬停看全文）；纯长文本字段（一行省略即可）用 `show-overflow-tooltip`。两者取舍见 §1.11。

#### 策略五：维护者信息用「时间 icon + 姓名」，悬停显示时间

有创建人/维护者等记录信息需要展示时，用**时间 icon + 姓名**，鼠标悬停在 icon 上显示具体时间，节省一列时间宽度。

```html
<el-table-column prop="creatorName" label="创建人" width="120">
  <template #default="{ row }">
    <el-tooltip v-if="row.createTime" :content="formatDateTime(row.createTime)" placement="top">
      <el-icon style="vertical-align:-2px;margin-right:4px"><Calendar /></el-icon>
    </el-tooltip>
    <el-tooltip v-else :content="'-'" placement="top">
      <el-icon style="vertical-align:-2px;margin-right:4px"><Calendar /></el-icon>
    </el-tooltip>
    <span>{{ row.creatorName || '-' }}</span>
  </template>
</el-table-column>
```

#### 策略六：较长的内容列固定宽度 + 悬停看全文

除上述特殊列外，其余较长内容列统一 `width` 固定宽度 + `show-overflow-tooltip`，避免宽度忽宽忽窄撑破布局。ID/单号等唯一标识列见策略一。

```html
<el-table-column prop="description" label="描述" width="200" show-overflow-tooltip />
```

#### 策略七：默认 list 卡片展示（可选）

若列确实很多且横向滚动难避免，可考虑**默认以卡片列表（list）形态展示**——每行一张卡片，字段按需排布。DataGrid 通过 `:modeSwitch="true"` + `#card-item` 插槽开启**表格/卡片切换**，但**默认视图仍是表格**（当前 DataGrid 无"初始即卡片"的 prop），需要默认卡片时需页面自控：首屏用卡片插槽渲染，或结合 `mode-change` 事件记忆用户上次选择。

```html
<wd-datagrid api="/api/users" :active="true" :mode-switch="true" withIndex>
  <!-- 表格视图插槽（默认）已支持；卡片视图需提供 card-item 插槽 -->
  <template #card-item="{ row }">
    <div class="card">
      <div class="card-title">{{ row.name }}</div>
      <div>{{ row.code }} · {{ row.categoryName }}</div>
    </div>
  </template>
</wd-datagrid>
```

> 口径：list/卡片是**降列级**手段的兜底——只有上述合并/收纳仍放不下时再用；DataGrid 卡片视图依赖 `card-item` 插槽与 `modeSwitch`，默认初始态仍是表格。

**网格线 + 斑马纹**：列多时建议同时开启 `border` + `stripe` 提升可读性。

```html
<wd-datagrid
  api="/api/users"
  :border="true"
  :stripe="true"
  :active="true">
  <!-- 列数较多时 -->
</wd-datagrid>
```

> `border` 和 `stripe` 直接透传 ElementPlus 的 `el-table` 同名属性，无额外封装。DataGrid 默认值建议：列数 ≤ 6 时不开启，列数 > 6 或出现横向滚动时建议开启。

### 1.10 序号列与多选列

表格左侧固定区域建议按以下顺序排列：

```
| [多选框列] | 序号列 | 列1   | 列2   | ... | 操作列 |
```

#### 列规范

| 列    | 宽度 | 对齐 | 说明                 |
| ---- | -- | -- | ------------------ |
| 多选框列 | 60 | 居中 | 有单选/多选需求时才显示，放在最左侧 |
| 序号列  | 60 | 居中 | 始终显示，展示行序号         |

#### 代码示例

```html
<wd-datagrid api="/api/users" :active="true">
  <!-- 多选列（有选择需求时） -->
  <el-table-column type="selection" width="60" align="center" />
  <!-- 序号列 -->
  <el-table-column type="index" label="#" width="60" align="center" />
  <!-- 数据列 -->
  <el-table-column prop="name" label="名称" />
  <el-table-column prop="code" label="编码" />
</wd-datagrid>
```

#### DataGrid 内置属性

DataGrid 提供属性快速开启序号列和多选列，无需手动写 `el-table-column`：

```ts
interface DataGridProps {
  // ...原有属性

  /** 是否显示序号列，默认 true */
  withIndex?: boolean

  /** 是否显示多选列，默认 false */
  withSelection?: boolean
}
```

```html
<!-- 快捷开启 -->
<wd-datagrid :with-index="true" :with-selection="true" />
```

### 1.11 长文本省略

当列内容较长但需要直接看到部分内容时，使用省略号 + 悬停 Tooltip 显示完整内容。

| 方式                      | 适用场景               |
| ----------------------- | ------------------ |
| `show-overflow-tooltip` | 通用长文本，一行省略         |
| Tips 组件                 | 备注等不常关注的长文本（仅显示图标） |

```html
<!-- 通用长文本：省略号 + Tooltip -->
<el-table-column prop="description" label="描述" show-overflow-tooltip />

<!-- 备注列：Tips 感叹号图标 -->
<el-table-column prop="remark" label="备注" width="80" align="center">
  <template #default="{ row }">
    <wd-tips v-if="row.remark" icon="WarningFilled" :tips="row.remark" />
    <span v-else>-</span>
  </template>
</el-table-column>
```

### 1.12 数字与金额格式化

金额、数量等数字类型应做格式化，提高可读性。

| 类型   | 格式化方式      | 示例              |
| ---- | ---------- | --------------- |
| 金额   | 千分位 + 货币符号 | `¥12,345.00`    |
| 大数字  | 万/亿单位简化    | `1.2万` / `3.5亿` |
| 百分比  | 保留小数 + %   | `85.5%`         |
| 文件大小 | KB/MB/GB   | `2.4 MB`        |

```html
<el-table-column prop="amount" label="金额" align="right">
  <template #default="{ row }">
    ¥{{ formatNumber(row.amount, { thousands: true, decimals: 2 }) }}
  </template>
</el-table-column>
```

### 1.13 图片与头像列

用户头像、商品图片等，直接在单元格内显示缩略图。

| 场景   | 大小    | 形状   |
| ---- | ----- | ---- |
| 用户头像 | 32×32 | 圆形   |
| 商品图片 | 48×48 | 圆角方形 |

```html
<el-table-column prop="avatar" label="用户" width="120">
  <template #default="{ row }">
    <span style="display:inline-flex;align-items:center;gap:8px">
      <el-avatar :src="row.avatar" :size="32" />
      <span>{{ row.name }}</span>
    </span>
  </template>
</el-table-column>
```

### 1.14 状态点

简单状态（启用/禁用、在线/离线）除了 Tag，也可用彩色圆点 + 文案，更轻量。

```html
<el-table-column prop="status" label="状态" width="100">
  <template #default="{ row }">
    <span style="display:inline-flex;align-items:center;gap:6px">
      <span :style="{ background: statusColor(row.status) }"
            style="width:8px;height:8px;border-radius:50%" />
      {{ statusText(row.status) }}
    </span>
  </template>
</el-table-column>
```

### 1.15 可复制文本

编码、链接等需要复制的字段，显示复制图标，点击后复制到剪贴板。

```html
<el-table-column prop="code" label="编码" width="180">
  <template #default="{ row }">
    <span style="display:inline-flex;align-items:center;gap:4px">
      <span>{{ row.code }}</span>
      <el-icon style="cursor:pointer;color:var(--el-color-primary)" @click="copyText(row.code)">
        <CopyDocument />
      </el-icon>
    </span>
  </template>
</el-table-column>
```

### 1.16 固定列（冻结）

列较多出现横向滚动时，将关键列固定在左右两侧，方便参照。

| 固定位置 | 列                  |
| ---- | ------------------ |
| 左固定  | 多选框列、序号列、名称列（核心标识） |
| 右固定  | 操作列                |

```html
<el-table-column prop="name" label="名称" fixed="left" width="180" />
<!-- ...中间数据列... -->
<el-table-column label="操作" fixed="right" width="200">
  <template #default="{ row }">...</template>
</el-table-column>
```

### 1.17 空数据状态

表格无数据时，显示统一的空状态占位，而非空白。

```html
<wd-datagrid api="/api/users" :active="true">
  <template #empty>
    <el-empty description="暂无数据" />
  </template>
</wd-datagrid>
```

> DataGrid 默认 `empty-text` 为"暂无数据"，可通过属性覆盖，也可用 `#empty` 插槽完全自定义。

### 1.18 行交互行为

| 交互  | 行为                      | 说明           |
| --- | ----------------------- | ------------ |
| 单击行 | 触发 `row-click` 事件       | 可用于展开行详情或选中行 |
| 双击行 | 触发 `row-dblclick` 事件    | 可用于直接进入编辑    |
| 行高亮 | `highlight-current-row` | 单选场景下标识当前选中行 |

```html
<wd-datagrid
  api="/api/users"
  :active="true"
  highlight-current-row
  @row-click="handleRowClick"
  @row-dblclick="handleRowDblclick" />
```

### 1.19 多 DataGrid 页面的 filter 分组联动

当页面存在多张 DataGrid（如"用户管理 + 角色管理"同屏），搜索/操作联动必须只作用于目标表。通过通用 prop `filter` 分组：**发起组件与目标 DataGrid 的 filter 相同才联动**，默认 `filter=''` 的组件只与空 filter 组件联动。

```html
<!-- 用户表组：搜索面板 + 表格同 filter="user-table" -->
<wd-search-panel filter="user-table" :head-refresh-datagrid="true">
  <wd-search-item label="名称"><el-input v-model="q.name" /></wd-search-item>
</wd-search-panel>

<wd-datagrid filter="user-table" api="/api/users" :active="true">
  <el-table-column prop="name" label="名称" />
</wd-datagrid>

<!-- 角色表组：filter="role-table"，与用户表互不干扰 -->
<wd-search-panel filter="role-table" :head-refresh-datagrid="true">
  <wd-search-item label="角色名"><el-input v-model="q2.name" /></wd-search-item>
</wd-search-panel>

<wd-datagrid filter="role-table" api="/api/roles" :active="true">
  <el-table-column prop="name" label="角色名" />
</wd-datagrid>
```

**规则速查**：

| 场景            | filter 写法                                       | 联动结果                     |
| ------------- | ----------------------------------------------- | ------------------------ |
| 页面上只有一张表      | 全部不写 filter（默认空组）                               | 与旧行为一致，向后兼容              |
| 多张表各自配对       | SearchPanel/DataForm/按钮 与目标 DataGrid 用相同 filter | 点搜索只刷对应表                 |
| 跨组定向刷新        | `head-refresh-datagrid="role-table"`            | 强制刷新指定 filter 的 DataGrid |
| 同 filter 多个目标 | 两张 DataGrid 用同一 filter                          | 同组全部刷新                   |

***
