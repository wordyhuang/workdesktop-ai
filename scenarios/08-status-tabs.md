# 场景八：状态分类 Tab 页（审核页 / 结果展示页）

> **创建时间**：2026-10-16\
> **最后修改时间**：2026-10-16\
> **当前版本**：V\_1.0\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：按状态/分类拆分为多个 Tab 的列表页规范（Tab 计数 + 按分类定制列与操作按钮）\
> **文档简略描述**：本文件是「编码场景指导」的子路由，由 `document/scenarios_v1.0.md`（V\_1.18）拆分而来。小节编号（§x.y）与主文档一致；跨场景引用（如"见 §1.7"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。内容修改请先改主文档，再同步本文件。


### 8.1 场景描述

当页面数据有**明确且稳定的分类字段**（审核状态、执行结果、任务状态等），且用户关心"按分类分别查看"时，不建议把所有数据混在一张表里靠列筛选区分，而应**按分类状态拆分为多个 Tab**：

- **审核页**：全部 / 已审核 / 未审核（/ 已驳回）
- **结果展示页**：全部 / 执行中 / 成功 / 失败
- 其他同构场景：任务中心（全部 / 待处理 / 处理中 / 已完成）、消息中心（全部 / 未读 / 已读）等

**三个核心建议**：
1. **Tab 呈现分类**：每个分类一个 Tab，切换即切换列表数据范围（不是前端过滤，而是请求参数带分类字段）。
2. **Tab 后紧跟数据总量**：每个 Tab 标签后显示该分类下的数据条数；「全部」这类常量分类**可以不显示总量**（或显示总数，按业务需要）。
3. **按分类定制列与操作按钮**：不同 Tab 可以展示不同的表格列、不同的行操作按钮——已审核的看"审核人/审核时间"、只有"撤回"；未审核的看"提交人/提交时间"、有"通过/驳回"。

### 8.2 页面结构图

```
┌────────────────────────────────────────────────┐
│  Tab 分类区（el-tabs）                            │
│  [全部]  [已审核 12]  [未审核 3]  [已驳回 2]       │
│  （"全部"常量分类可不显示总量）                     │
├────────────────────────────────────────────────┤
│  [操作按钮组]              [刷新][列设置]          │
│  按当前 Tab 定制（如未审核 Tab 有"批量通过"）       │
├────────────────────────────────────────────────┤
│                                                │
│     Table（列按当前 Tab 定制）                    │
│     - 未审核 Tab：提交人 | 提交时间 | 操作(通过/驳回) │
│     - 已审核 Tab：审核人 | 审核时间 | 操作(撤回/查看) │
│                                                │
├────────────────────────────────────────────────┤
│                 Pagination（分页）                │
└────────────────────────────────────────────────┘
```

### 8.3 交互流程

```
1. 页面加载
     ↓
2. 请求分类计数接口 → 渲染 Tab 及各自总量（getTabCounts）
   [全部] [已审核 12] [未审核 3] [已驳回 2]
     ↓
3. 默认选中「全部」Tab → DataGrid 请求全部数据（不带分类参数）
     ↓
4. 用户点击某个分类 Tab（如「未审核」）
     ↓
5. 更新请求参数：apiParam 携带分类字段 status='pending'
     ↓
6. 手动触发 DataGrid 刷新（requestApi({ apiParam })，重置到第一页）
     ↓
7. 按当前 Tab 切换表格列配置与操作按钮（v-if 控制）
     ↓
8. 用户对某行执行操作（通过/驳回）→ 成功后刷新列表 + 刷新 Tab 计数
```

> **关键机制**：DataGrid 的 `apiParam` **变化不会自动重载**（仅 `api` / `apiMethod` 变化自动重载），Tab 切换必须**手动调用** `gridRef.requestApi({ apiParam: {...} })` 刷新，并重置到第一页。

### 8.4 代码示例

```html
<wd-panel :show-header="false">
  <!-- Tab 分类区：label 插槽显示各分类总量；"全部"常量分类不显示总量 -->
  <el-tabs v-model="activeTab" @tab-change="handleTabChange">
    <el-tab-pane name="all" label="全部" />
    <el-tab-pane name="approved">
      <template #label>已审核{{ tabCounts.approved != null ? `（${tabCounts.approved}）` : '' }}</template>
    </el-tab-pane>
    <el-tab-pane name="pending">
      <template #label>未审核{{ tabCounts.pending != null ? `（${tabCounts.pending}）` : '' }}</template>
    </el-tab-pane>
    <el-tab-pane name="rejected">
      <template #label>已驳回{{ tabCounts.rejected != null ? `（${tabCounts.rejected}）` : '' }}</template>
    </el-tab-pane>
  </el-tabs>

  <wd-datagrid
    ref="gridRef"
    api="/api/audits"
    api-method="post"
    :active="true"
    :with-index="true">

    <!-- 工具栏：操作按钮按当前 Tab 定制 -->
    <template #toolbar>
      <!-- 未审核 Tab：批量通过 -->
      <wd-api-button
        v-if="activeTab === 'pending'"
        api="/api/audits/batch-approve"
        :api-param="{ ids: selectedIds }"
        :head-refresh-datagrid="true"
        type="primary">批量通过</wd-api-button>
      <!-- 全部 / 已驳回 Tab：导出 -->
      <el-button v-else @click="handleExport">导出</el-button>
    </template>

    <!-- 通用列：所有 Tab 都显示 -->
    <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
    <el-table-column prop="submitterName" label="提交人" width="120" />

    <!-- 未审核 Tab 独有列：提交时间（待处理看提交信息） -->
    <el-table-column v-if="activeTab === 'pending'" prop="submitTime" label="提交时间" width="170" />

    <!-- 已审核 / 已驳回 Tab 独有列：审核信息 -->
    <el-table-column v-if="activeTab !== 'pending'" prop="auditorName" label="审核人" width="120" />
    <el-table-column v-if="activeTab !== 'pending'" prop="auditTime" label="审核时间" width="170" />
    <el-table-column v-if="activeTab === 'rejected'" prop="rejectReason" label="驳回原因" min-width="160" show-overflow-tooltip />

    <!-- 操作列：按当前 Tab 定制 -->
    <el-table-column label="操作" width="180" fixed="right">
      <template #default="{ row }">
        <!-- 未审核 Tab：通过 / 驳回（审核动作） -->
        <template v-if="activeTab === 'pending'">
          <wd-confirm-button
            api="/api/audits/approve"
            :api-param="{ id: row.id }"
            type="success"
            :head-refresh-datagrid="true">通过</wd-confirm-button>
          <wd-confirm-button
            api="/api/audits/reject"
            :api-param="{ id: row.id }"
            type="danger"
            :head-refresh-datagrid="true">驳回</wd-confirm-button>
        </template>
        <!-- 已审核 Tab：撤回（撤销审核） -->
        <template v-else-if="activeTab === 'approved'">
          <wd-confirm-button
            api="/api/audits/revoke"
            :api-param="{ id: row.id }"
            :head-refresh-datagrid="true">撤回</wd-confirm-button>
        </template>
        <!-- 查看：所有 Tab 通用 -->
        <wd-drawer-button label="查看" title="详情" size="50%" :data="row" link />
      </template>
    </el-table-column>
  </wd-datagrid>
</wd-panel>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { request } from 'workdesktop-ai'

const activeTab = ref('all')
const gridRef = ref()

// 各分类 Tab 的数据总量（来自计数接口；null 表示接口未返回，不显示）
const tabCounts = ref({})

// 当前 Tab 对应的请求参数：带分类字段（"全部"不带，让后端返回全量）
const queryParams = computed(() => {
  const base = {}
  if (activeTab.value !== 'all') base.status = activeTab.value
  return base
})

// Tab 切换：更新参数并手动刷新 DataGrid（apiParam 变化不会自动重载）
function handleTabChange() {
  gridRef.value?.requestApi({ apiParam: queryParams.value })
}

// 页面加载：拉取各分类计数（tabCounts），渲染 Tab 总量
onMounted(async () => {
  const res = await request.post('/api/audits/counts')
  tabCounts.value = res.data ?? {}
})
</script>
```

> **计数接口约定**：`/api/audits/counts` 返回 `{ approved: 12, pending: 3, rejected: 2 }`（不含"全部"，或含 `all` 也忽略）。分类计数与列表的 `status` 字段取值必须一致，否则 Tab 总量与列表数据对不上。

### 8.5 规范要点

| 项 | 规范 |
| --- | --- |
| 适用判定 | 数据有**明确且稳定**的分类/状态字段，且用户有"按分类分别查看"诉求时用 Tab 分类；分类不可枚举或数量会动态增长时不用 Tab，用搜索面板的状态下拉 |
| Tab 数量 | 建议 3–7 个（含"全部"）；超过 7 个时 el-tabs 需开启滚动模式或改搜索下拉 |
| 分类命名 | Tab 文案用状态的标准名词（已审核/未审核/执行中/成功/失败），不加"列表""数据"等冗余词 |
| Tab 总量 | **每个分类 Tab 标签后紧跟该分类数据总量**（如 `已审核（12）`）；「全部」这类**常量分类可不显示总量**；总量来自专用计数接口，与列表口径一致 |
| 切换刷新 | Tab 切换 = 改请求参数 + **手动** `requestApi({ apiParam })`（`apiParam` 变化不会自动重载），并重置到第一页 |
| 计数联动 | 行操作（通过/驳回/撤回）成功后：刷新列表 + **刷新 Tab 计数**（重新请求 counts） |
| 按分类定制列 | 不同 Tab 可展示不同列——待处理看"提交人/提交时间"，已处理看"审核人/审核时间/驳回原因"；用 `v-if="activeTab === 'xxx'"` 控制列渲染 |
| 按分类定制操作 | 不同 Tab 提供不同操作按钮——未审核有"通过/驳回"，已审核只有"撤回/查看"；通用操作（查看）所有 Tab 都显示 |
| 通用列 | 名称/标题、提交人等跨分类都需要的列放前面；分类独有列放中间；操作列固定末尾 `fixed="right"` |
| 批量操作 | 需要批量操作时，批量按钮也按当前 Tab 定制（未审核 Tab 才显示"批量通过"）；`apiParam` 需带上当前分类字段 |
| 与搜索面板关系 | 有 Tab 分类 + 搜索双需求的页面：搜索条件里的"状态"字段**由 Tab 接管**，搜索面板不再放状态下拉，避免两处状态源冲突 |
| 空状态 | 某分类 Tab 下无数据时，空状态文案可区分（如"暂无待审核数据"），行动引导指向其他分类或新增入口 |

### 8.6 该场景对组件规格的补充需求

| 组件 | 补充项 | 说明 |
| --- | --- | --- |
| DataGrid | `requestApi({ apiParam })` | **已支持**（对外暴露方法，L930）。Tab 切换时手动调用，携带分类字段刷新并重置第一页 |
| DataGrid | `apiParam` 变化自动重载 | **无此行为**（仅 api/apiMethod 变化自动重载）——本场景**不需要新增**，Tab 切换走手动 `requestApi` 即可，保持显式可控 |

> 结论：场景八**不新增组件规格**，全部用既有能力（el-tabs + DataGrid `requestApi({ apiParam })` + 操作按钮组件）组合实现。

***
