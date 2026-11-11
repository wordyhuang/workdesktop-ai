# 场景六：弹窗选择器

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-11-10\
> **当前版本**：V\_1.2\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：表单内选择关联数据的弹窗规范\
> **文档简略描述**：本文件是「编码场景指导」的子路由，由 `document/scenarios_v1.0.md`（V\_1.17）拆分而来。小节编号（§x.y）与主文档一致；跨场景引用（如"见 §1.7"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。内容修改请先改主文档，再同步本文件。


### 6.1 场景描述

在表单中需要选择关联数据（如选择用户、部门、商品、订单），点击输入框弹出 Dialog/Drawer，内嵌 DataGrid 供用户选择，确认后回填到表单。

> **选型原则——业务关联数据用弹窗选择页，不用裸 select**：
>
> | 数据特征 | 选用控件 | 说明 |
> | --- | --- | --- |
> | 固定枚举（状态、类型等，选项少且字段自明） | Select / RadioList / CheckboxList | 下拉或平铺即可，无需弹窗（见 §0.6；选项少的多选优先按钮形态平铺，见 §6.4） |
> | **业务关联数据（用户/订单/商品/部门等业务实体）** | **弹窗选择器（本场景）** | 数据量未知或较大、需搜索筛选与分页定位、需多字段辅助辨认（名称相似时靠部门/规格/状态等列判断）、可能多选——这些诉求 select 承载不了；**单纯给一个 select 是偷懒且不友好的行为**，一律弹出选择页选择后回填 |

### 6.2 结构示意

```
表单中：
┌───────────────────────────────┐
│ 关联用户：[张三          ] [选择] │  ← 点击"选择"弹出
└───────────────────────────────┘
         ↓ 弹出
┌──────────────────────────────────────┐
│  Dialog：选择用户                      │
├──────────────────────────────────────┤
│  [搜索：xxx          ] [搜索]          │
├──────────────────────────────────────┤
│ □ 姓名     部门      职位    状态      │
│ ☑ 张三     技术部    工程师   启用      │
│ □ 李四     产品部    产品经理 启用      │
├──────────────────────────────────────┤
│                        [取消] [确认]   │
└──────────────────────────────────────┘
```

### 6.3 代码示例

```html
<wd-data-form api="/api/detail" :active="true" submit-api="/api/save">
  <wd-form-item label="关联用户" prop="userId">
    <div style="display:flex;gap:8px;align-items:center">
      <el-input v-model="form.userName" readonly placeholder="请选择用户" />
      <wd-dialog-button label="选择" title="选择用户" link @confirm="handleUserSelect" />
    </div>
  </wd-form-item>

  <!-- Dialog 内嵌选择表格 -->
  <wd-datagrid
    slot="dialog-content"
    api="/api/users"
    :active="true"
    :with-selection="true"
    :with-pager="true"
    :auto-height="true"
    @selection-change="handleSelectChange">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="dept" label="部门" />
    <el-table-column prop="position" label="职位" />
  </wd-datagrid>
</wd-data-form>
```

### 6.4 规范要点

| 项     | 规范                                     |
| ----- | -------------------------------------- |
| 单选/多选 | 选择器支持单选（`single-select`）和多选模式          |
| 搜索    | 弹窗内 DataGrid 带搜索面板                     |
| 分页    | 数据量大时带分页                               |
| 确认回填  | 点击"确认"后将选中数据回填到表单                      |
| 已选回显  | 再次打开时回显已选项（高亮选中）                       |
| 回填展示 | 回填到表单后**显示名称而非 ID**（多选以 tag 列表逐项展示），支持单个移除与一键清空后重选，便于用户核对所选内容 |
| 穿梭框替代 | 选项固定且少时，可用 CheckboxList/RadioList 替代弹窗 |

***
