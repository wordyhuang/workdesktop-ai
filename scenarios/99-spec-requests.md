# 组件规格补充需求汇总

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-10-14\
> **当前版本**：V\_1.0\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：场景落地中对组件规格的补充诉求（回流 PRD）\
> **文档简略描述**：本文件是「编码场景指导」的子路由，由 `document/scenarios_v1.0.md`（V\_1.17）拆分而来。小节编号（§x.y）与主文档一致；跨场景引用（如"见 §1.7"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。内容修改请先改主文档，再同步本文件。


以下补充需求需同步更新到 PRD 对应组件规格中：

### DataGrid 补充

```ts
interface DataGridProps {
  // 原有属性...
  
  /** 左侧操作按钮区，通过插槽自定义内容 */
  toolbar?: boolean | Slot
  
  /** 右侧功能按钮配置，每项可独立开关 */
  tools?: {
    refresh?: boolean        // 刷新按钮，默认 true
    columnSetting?: boolean   // 列设置按钮，默认 true
    modeSwitch?: boolean      // 表格/列表切换，默认 false
    size?: boolean            // 调整大小按钮，默认 false
  }
  
  /** 撑满父容器剩余高度 */
  autoHeight?: boolean        // 默认 false

  /** 分页样式档位 */
  pagerStyle?: 'simple' | 'normal' | 'full'  // 默认 'normal'

  /** 表格尺寸档位（调整 padding 与 font-size） */
  tableSize?: 'large' | 'default' | 'small'  // 默认 'default'

  /** 是否显示序号列，默认 true，宽 60 居中 */
  withIndex?: boolean

  /** 是否显示多选列，默认 false，宽 60 居中 */
  withSelection?: boolean

  /** 联动分组标识，同 filter 才联动，默认 ''（所有参与联动组件共有） */
  filter?: string
}
```

### DataForm 补充

```ts
interface DataFormProps {
  // 原有属性...

  /** 表单模式（不含 view，详情查看用独立布局） */
  mode?: 'create' | 'edit'  // 默认 'create'

  /** 有未保存修改时离开确认 */
  confirmLeave?: boolean  // 默认 true
  
  /** 是否显示底部操作按钮区 */
  withActions?: boolean  // 默认 true
  
  /** 底部按钮配置 */
  actionConfig?: {
    resetText?: string       // 默认 "重置"
    submitText?: string      // 默认 "保存"
    continueText?: string    // 默认 "保存并继续"
    showReset?: boolean      // 默认 true
    showContinue?: boolean   // 默认 true，仅 create 模式生效
  }
}
```

### SearchPanel 补充

```ts
interface SearchPanelProps {
  // 原有属性...
  
  /** 是否内置查询/重置按钮 */
  withActions?: boolean  // 默认 true
  
  /** 查询按钮文案 */
  searchText?: string    // 默认 "搜索"
  
  /** 重置按钮文案 */
  resetText?: string     // 默认 "重置"
}
```

> 分页样式档位 `pagerStyle` 已包含在 DataGridProps 中，不单独出 Pagination 组件。DataGrid 内部使用 el-pagination 实现，用户通过 DataGrid 的 `pagerStyle` 属性控制样式档位。

***
