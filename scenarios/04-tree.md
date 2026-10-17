# 场景四：树形数据展示

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-10-14\
> **当前版本**：V\_1.0\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：树形数据的展示与选择规范\
> **文档简略描述**：本文件是「编码场景指导」的子路由，由 `document/scenarios_v1.0.md`（V\_1.17）拆分而来。小节编号（§x.y）与主文档一致；跨场景引用（如"见 §1.7"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。内容修改请先改主文档，再同步本文件。


### 4.1 场景描述

组织架构、菜单管理、分类目录等层级数据，用树形表格展示，支持展开/折叠子节点。

### 4.2 结构示意

```
┌──────────────────────────────────────────────┐
│  [新增根级]              [刷新][展开全部][收起]  │
├──────────────────────────────────────────────┤
│ 名称              │ 编码  │ 排序 │ 操作        │
├───────────────────┼──────┼─────┼─────────────┤
│ ▼ 系统管理        │ sys  │ 1   │ [新增][编辑][删除] │
│   ▼ 用户管理      │ user │ 1   │ [新增][编辑][删除] │
│     角色管理      │ role │ 1   │ [编辑][删除]      │
│   ▶ 菜单管理      │ menu │ 2   │ [新增][编辑][删除] │
│ ▶ 商品管理        │ prod │ 2   │ [新增][编辑][删除] │
└──────────────────────────────────────────────┘
```

### 4.3 代码示例

```html
<wd-datagrid
  api="/api/menus/tree"
  :active="true"
  row-key="id"
  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
  default-expand-all
  :with-index="false"
  :with-pager="false"
  border>
  <el-table-column prop="name" label="名称" />
  <el-table-column prop="code" label="编码" width="180" />
  <el-table-column prop="sort" label="排序" width="80" align="center" />
  <el-table-column label="操作" width="240" fixed="right">
    <template #default="{ row }">
      <wd-drawer-button label="新增子级" title="新增子级" :data="{ parentId: row.id }" link />
      <wd-drawer-button label="编辑" title="编辑" :data="row" link />
      <wd-confirm-button api="/api/menus/delete" :api-param="{ id: row.id }" type="danger" link
        :head-refresh-datagrid="true">删除</wd-confirm-button>
    </template>
  </el-table-column>
</wd-datagrid>
```

### 4.4 规范要点

| 项          | 规范                                |
| ---------- | --------------------------------- |
| row-key    | 树形表格**必须**设置 `row-key`，值为节点唯一标识字段 |
| tree-props | 配置 `children` 和 `hasChildren` 字段名 |
| 分页         | 树形表格**不分页**，一次性加载或懒加载             |
| 序号列        | 树形表格建议**不显示**序号列                  |
| 操作列        | 每个节点都应有新增子级的能力（非叶子节点）             |
| 懒加载        | 数据量大时用 `lazy` + `load` 按需加载子节点    |

***
