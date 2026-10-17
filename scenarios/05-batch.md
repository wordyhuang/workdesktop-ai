# 场景五：批量操作场景

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-10-14\
> **当前版本**：V\_1.0\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：表格多选与批量操作规范\
> **文档简略描述**：本文件是「编码场景指导」的子路由，由 `document/scenarios_v1.0.md`（V\_1.17）拆分而来。小节编号（§x.y）与主文档一致；跨场景引用（如"见 §1.7"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。内容修改请先改主文档，再同步本文件。


### 5.1 场景描述

用户在表格中多选行后，对选中的数据批量执行操作（批量删除、批量启用/禁用、批量导出等）。

### 5.2 交互流程

```
1. 用户勾选多行数据
       ↓
2. 表格上方显示选中数量 + 批量操作按钮
   "已选 3 项 [批量删除] [批量启用] [批量禁用]"
       ↓
3a. 抹除类操作（删除） → ConfirmButton 二次确认
3b. 普通操作（启用/禁用） → ApiButton 直接请求
       ↓
4. 请求成功 → 刷新表格 + 清空选中 + 提示成功
```

### 5.3 代码示例

```html
<wd-datagrid
  ref="datagridRef"
  api="/api/users"
  :active="true"
  :with-selection="true"
  @selection-change="handleSelectionChange">

  <!-- 左侧操作按钮区 -->
  <template #toolbar>
    <span v-if="selectedRows.length" style="margin-right: 12px; color: var(--el-color-primary)">
      已选 {{ selectedRows.length }} 项
    </span>
    <wd-confirm-button
      v-if="selectedRows.length"
      api="/api/users/batch-delete"
      :api-param="{ ids: selectedIds }"
      type="danger"
      :head-refresh-datagrid="true"
      @success="clearSelection">
      批量删除
    </wd-confirm-button>
    <wd-api-button
      v-if="selectedRows.length"
      api="/api/users/batch-enable"
      :api-param="{ ids: selectedIds }"
      :head-refresh-datagrid="true"
      @success="clearSelection">
      批量启用
    </wd-api-button>
  </template>

  <!-- 数据列 -->
  <el-table-column prop="name" label="名称" />
</wd-datagrid>
```

### 5.4 规范要点

| 项      | 规范                                                   |
| ------ | ---------------------------------------------------- |
| 选中数量提示 | 有选中行时，toolbar 显示"已选 N 项"                             |
| 按钮显隐   | 无选中时批量按钮隐藏，避免误操作                                     |
| 抹除操作   | 批量删除**必须**二次确认                                       |
| 操作后清空  | 批量操作成功后清空选中行                                         |
| 全选     | 表头多选框为全选/取消全选                                        |
| 跨页选中   | 需要跨页保留选中时，DataGrid 用 `reserve-selection` + `row-key` |

***
