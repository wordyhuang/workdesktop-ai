# 场景二：数据维护表单页面（DataForm 标准场景）

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-10-14\
> **当前版本**：V\_1.0\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：新增/编辑表单的结构、分组与提交规范\
> **文档简略描述**：本文件是「编码场景指导」的子路由，由 `document/scenarios_v1.0.md`（V\_1.17）拆分而来。小节编号（§x.y）与主文档一致；跨场景引用（如"见 §1.7"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。内容修改请先改主文档，再同步本文件。


### 2.1 场景描述

DataForm 通常不独立成页，而是嵌在 Drawer / Dialog 中，由 DataGrid 的操作按钮触发打开。完整流程是：DataGrid 行操作 → 打开弹出层 → DataForm 加载/提交 → 关闭 → 刷新表格。

### 2.2 页面结构图

```
DataGrid 页面
├── [操作按钮组]
│   └── 添加按钮（DrawerButton / DialogButton）
│       → 点击打开 Drawer/Dialog
│
├── Table 行内操作列
│   ├── 编辑按钮（DrawerButton）   → 打开 Drawer，DataForm 回填详情
│   └── 查看按钮（DialogButton）   → 打开 Dialog，独立详情页（见场景三）
│
└── Drawer / Dialog（弹出层）
    ┌─────────────────────────────────┐
    │  标题：新增数据 / 编辑数据          │
    │  返回按钮（Drawer 特有）            │
    ├─────────────────────────────────┤
    │                                 │
    │  ┌─ 基本信息 ─────────────────┐  │
    │  │ [名称]    [输入框]          │  │
    │  │ [编码]    [输入框]          │  │
    │  │ [分类]    [下拉选择]        │  │
    │  └─────────────────────────────┘  │
    │  ┌─ 扩展信息 ─────────────────┐  │
    │  │ [状态]    [开关]           │  │
    │  │ [描述]    [文本域]         │  │
    │  └─────────────────────────────┘  │
    │                                 │
    ├─────────────────────────────────┤
    │  [关闭]  [重置]  [保存]  [保存并继续] │
    │  （连续操作模式时显示"保存并继续"）    │
    └─────────────────────────────────┘
```

### 2.3 表单项分组

当表单项较多时，应按**逻辑关联性**和**重要性**对字段进行分组，避免一大片字段堆在一起。

#### 分组原则

| 原则     | 说明                  | 示例                          |
| ------ | ------------------- | --------------------------- |
| 按逻辑分组  | 业务上关联的字段放一组         | 基本信息（名称/编码/分类）+ 扩展信息（状态/描述） |
| 按重要性排序 | 重要字段在前，辅助字段在后       | 必填字段在前，选填字段在后               |
| 分组数量适中 | 建议每组 3-6 个字段，超过考虑再拆 | 一组超过 8 个字段时拆分               |

#### 代码示例

```html
<wd-data-form mode="edit" api="/api/detail" :active="true" submit-api="/api/save">
  <!-- 第一组：基本信息 -->
  <wd-panel title="基本信息">
    <wd-form-item label="名称" prop="name">
      <el-input v-model="form.name" />
    </wd-form-item>
    <wd-form-item label="编码" prop="code">
      <el-input v-model="form.code" />
    </wd-form-item>
    <wd-form-item label="分类" prop="categoryId">
      <wd-select v-model="form.categoryId" api="/api/categories" />
    </wd-form-item>
    <!-- 关键字段：wd-form-item 内置 :tip prop 自动在 label 右侧挂问号图标 + tooltip -->
    <wd-form-item
      label="信用额度"
      prop="creditLimit"
      tip="系统按客户等级自动核定；A级=10万，B级=5万，C级=1万，可手动上调（需上级审批）">
      <el-input-number v-model="form.creditLimit" :min="0" :step="10000" />
    </wd-form-item>
  </wd-panel>

  <!-- 第二组：扩展信息 -->
  <wd-panel title="扩展信息">
    <!-- 选项少：用按钮形态列表替代 select，开 buttonStyle -->
    <wd-form-item label="优先级" prop="priority">
      <wd-radio-list v-model="form.priority" :button-style="true" :data-source="[
        { value: 'low', text: '低' },
        { value: 'normal', text: '中' },
        { value: 'high', text: '高' }
      ]" />
    </wd-form-item>
    <wd-form-item label="标签" prop="tags">
      <wd-checkbox-list v-model="form.tags" :button-style="true" :data-source="[
        { value: 'frontend', text: '前端' },
        { value: 'backend', text: '后端' },
        { value: 'testing', text: '测试' },
        { value: 'ops', text: '运维' }
      ]" />
    </wd-form-item>
    <wd-form-item label="状态" prop="status">
      <wd-switch v-model="form.status" />
    </wd-form-item>
    <wd-form-item label="描述" prop="remark">
      <el-input type="textarea" v-model="form.remark" />
    </wd-form-item>
  </wd-panel>
</wd-data-form>
```

> DataForm 支持内嵌 Panel 组件实现分组，Panel 的 `title` 即分组标题。分组标题应简洁，能概括组内字段的核心含义。

### 2.4 两种模式

| 模式           | 触发方式      | DataForm 行为           |
| ------------ | --------- | --------------------- |
| `create`（新增） | 点击"添加"按钮  | 不请求 api，空白表单，保存后可连续操作 |
| `edit`（编辑）   | 点击行"编辑"按钮 | 用 api 请求详情回填，保存后关闭    |

> **注意**：数据详情查看**不使用 DataForm**，详情应单独实现，见场景三。

### 2.5 交互流程

```
1. 用户点击「添加」或「编辑」
       ↓
2. DrawerButton / DialogButton 打开弹出层
       ↓
3a. create 模式：DataForm 不请求 api，空白表单等待输入
3b. edit 模式：DataForm 用 api 请求详情数据，自动回填表单
       ↓
4. 用户填写/修改字段
       ↓
4a. 如果有未保存修改，用户尝试关闭/离开
    → confirmLeave 触发确认提示"有未保存的修改，确认离开？"
       ↓
5. 用户点击「保存」
       ↓
6. DataForm 自动校验
       ├─ 校验失败 → 阻止提交，标红错误字段
       └─ 校验通过
              ↓
7. DataForm 调用 submitApi 提交（仅提交 submitKeys 白名单内的字段）
       ├─ 提交成功
       │    ├─ 成功提示
       │    ├─ headRefreshDatagrid → DataGrid 刷新
       │    ├─ headCloseDrawer → 关闭弹出层（edit 模式）
       │    └─ keepFormButton → 显示「保存并继续」，不关闭（create 模式）
       └─ 提交失败
            └─ 失败提示，表单保持不关闭
```

### 2.6 底部操作区按钮规则

| 按钮    | create 模式           | edit 模式   |
| ----- | ------------------- | --------- |
| 关闭    | ✅                   | ✅         |
| 重置    | ✅（清空表单）             | ✅（回填原始数据） |
| 保存    | ✅                   | ✅         |
| 保存并继续 | ✅（keepFormButton 时） | ❌         |

> 详情查看不使用 DataForm，无底部操作按钮（见场景三）。

### 2.7 代码示例（纯 HTML 引入）

> **动态按钮规则**：「关闭」按钮和「保存并继续」按钮为**动态显示**。
>
> - 仅当 DataForm 处于 `WdDrawer/WdDialog` 容器内，或被放在 `iframe` 子页面中时，才会显示这两个按钮。
> - 独立成页使用时，这两个按钮自动隐藏，只保留「重置」和「保存」。

```html
<!-- 新增（容器内会自动显示关闭 / 保存并继续） -->
<wd-drawer-button label="新增数据" title="新增数据" size="50%" type="primary">
  <wd-data-form
    mode="create"
    submit-api="/api/users/save"
    submit-method="post"
    :head-close-drawer="true"
    :head-refresh-datagrid="true"
    :keep-form-button="true"
    :confirm-leave="true">
    <wd-form-item label="名称" prop="name" required>
      <el-input v-model="model.name" placeholder="请输入名称" />
    </wd-form-item>
    <wd-form-item label="编码" prop="code" required>
      <el-input v-model="model.code" placeholder="请输入编码" />
    </wd-form-item>
    <wd-form-item label="分类" prop="categoryId">
      <wd-select api="/api/categories/list" text-prop="name" value-prop="id" />
    </wd-form-item>
    <wd-form-item label="状态" prop="status">
      <wd-switch :active-value="1" :inactive-value="0" />
    </wd-form-item>
    <wd-form-item label="描述" prop="description">
      <el-input type="textarea" v-model="model.description" />
    </wd-form-item>
  </wd-data-form>
</wd-drawer-button>
```

```html
<!-- 编辑 + 删除（在 DataGrid 行操作列中，演示多按钮场景） -->
<el-table-column label="操作" width="200">
  <template #default="{ row }">
    <!-- 编辑：打开 Drawer 编辑 DataForm -->
    <wd-drawer-button 
      label="编辑"
      type="primary" 
      title="编辑数据" 
      size="50%" 
      :data="row"
    >
      <wd-data-form
        mode="edit"
        api="/api/users/detail"
        :api-param="{ id: row.id }"
        :active="true"
        submit-api="/api/users/update"
        submit-method="put"
        :head-close-drawer="true"
        :head-refresh-datagrid="true"
        :confirm-leave="true">
        <!-- 同样的表单项 -->
      </wd-data-form>
    </wd-drawer-button>

    <!-- 删除：二次确认后删除接口请求，成功后刷新表格 -->
    <wd-confirm-button
      type="danger" 
      api="/api/users/delete" 
      :api-param="{ id: row.id }"
      :head-refresh-datagrid="true"
      confirm-text="确认删除该记录吗？"
    >
      删除
    </wd-confirm-button>
  </template>
</el-table-column>
```

> 查看详情不使用 DataForm，使用 Panel + el-descriptions 独立布局，见场景三。

### 2.7.1 WdFormItem / WdSearchItem 使用说明

**WdFormItem 是什么？**

`WdFormItem` 是对 `ElFormItem` 的轻量封装，针对 WorkDesktop 开发场景做了标签宽度、布局对齐、必填标记的规范化处理，保持与原生 `ElFormItem` 一致的 API，用法如下：

```html
<wd-data-form
  mode="create"
  submit-api="/api/users/save"
  :head-close-drawer="true"
  :head-refresh-datagrid="true"
>
  <wd-form-item label="名称" prop="name" required>
    <el-input v-model="model.name" placeholder="请输入名称" />
  </wd-form-item>
  <wd-form-item label="编码" prop="code" required>
    <el-input v-model="model.code" placeholder="请输入编码" />
  </wd-form-item>
  <wd-form-item label="分类" prop="categoryId">
    <wd-select api="/api/categories/list" text-prop="name" value-prop="id" />
  </wd-form-item>
  <wd-form-item label="状态" prop="status">
    <wd-switch :active-value="1" :inactive-value="0" />
  </wd-form-item>
  <wd-form-item label="描述" prop="description">
    <el-input type="textarea" v-model="model.description" />
  </wd-form-item>
</wd-data-form>
```

**WdSearchItem 是什么？**

`WdSearchItem` 是搜索面板（`WdSearchPanel`）中专属的表单项包装，和 `WdFormItem` 功能类似，但针对搜索场景优化了标签宽度和行内对齐：

```html
<wd-search-panel :head-refresh-datagrid="main">
  <wd-search-item label="名称" prop="name">
    <el-input v-model="model.name" placeholder="请输入名称" />
  </wd-search-item>
  <wd-search-item label="分类" prop="categoryId">
    <wd-select api="/api/categories/list" text-prop="name" value-prop="id" />
  </wd-search-item>
  <wd-search-item label="状态" prop="status">
    <el-select v-model="model.status" placeholder="请选择状态">
      <el-option label="全部" value="" />
      <el-option label="启用" value="1" />
      <el-option label="禁用" value="0" />
    </el-select>
  </wd-search-item>
</wd-search-panel>
```

### WdFormItem / WdSearchItem 与原生 ElFormItem 的主要差别

| 对比项      | WdFormItem                                                                                | WdSearchItem               | ElFormItem (ElementPlus)       |
| -------- | ----------------------------------------------------------------------------------------- | -------------------------- | ------------------------------ |
| **标签宽度** | 继承全局配置，可通过 `label-width` 覆盖；默认为 100px，对齐一致                                                | 固定为 70px（搜索场景标签更紧凑）        | 必须手动指定 `label-width`，否则继承表单级配置 |
| **必填标记** | 自动识别 `required` prop，自动添加红色\*标记（符合规范统一）                                                   | 同 WdFormItem               | 必须手动加 `required` 属性才会显示\*标记    |
| **帮助说明** | 内置 `tip` prop：传字符串后 label 右侧自动挂 QuestionFilled 问号 + el-tooltip 悬停说明；`tipPlacement` 控制弹出位置 | 同 WdFormItem               | 无内置 prop；需自己嵌 tooltip          |
| **错误提示** | 保持 ElementPlus 原生校验逻辑，仅对齐布局                                                               | 保持 ElementPlus 原生校验逻辑      | 默认显示错误提示在标签下方                  |
| **布局适配** | 针对 DataForm 分组场景优化间距                                                                      | 针对 SearchPanel 双栏流式布局优化间距  | 需要手动调间距                        |
| **属性兼容** | 完全兼容 `ElFormItem` 所有属性（透传）                                                                | 完全兼容 `ElFormItem` 所有属性（透传） | 原生 ElementPlus 实现              |

> **关键字段帮助说明（tip prop）**：`WdFormItem` 内置帮助说明能力，`tip` 字符串自动渲染为 label 右侧的问号图标 + el-tooltip。适用于含义不直观的字段（如"信用额度""核定数量""抵扣比例"），说明取值规则、来源、上限等。`tipPlacement` 支持 `top/left/right/bottom` 八方向，默认 `top`。
>
> ```html
> <!-- tip 用法：label 右侧自动挂问号图标，hover 显示说明 -->
> <wd-form-item
>   label="信用额度"
>   prop="creditLimit"
>   tip="系统按客户等级自动核定；A级=10万，B级=5万，C级=1万，可手动上调（需上级审批）">
>   <el-input-number v-model="form.creditLimit" :min="0" :step="10000" />
> </wd-form-item>
> ```

**使用建议：**

- DataForm 中所有表单项都包裹 `WdFormItem`，确保布局对齐和必填标记一致
- SearchPanel 中所有搜索项都包裹 `WdSearchItem`，确保搜索栏布局对齐一致
- 如果需要完全自定义布局（比如特殊联动/跨行），可直接用原生 `ElFormItem`
- 数据绑定规则：表单 model 始终绑定到原始字段，`prop` 名称必须和 model 字段**完全一致**（避免校验和提交字段不一致问题）

### 2.8 该场景对组件规格的补充需求

| 组件       | 补充项               | 说明                                                                   |
| -------- | ----------------- | -------------------------------------------------------------------- |
| DataForm | `mode` 属性         | `'create' \| 'edit'`，默认 `create`                                     |
| DataForm | `confirmLeave` 属性 | 有未保存修改时离开确认，默认 true                                                  |
| DataForm | `withActions` 属性  | 是否显示底部操作按钮区，默认 true                                                  |
| DataForm | `actionConfig` 配置 | 底部按钮文案/显示控制：resetText/submitText/continueText/showReset/showContinue |
| DataForm | 底部操作区             | 按模式自动显示/隐藏对应按钮                                                       |

### 2.9 Dialog/Drawer 内嵌 DataForm 自动联动规则

当 Dialog 或 Drawer 内嵌 DataForm 时，需要遵循以下自动联动规则：

| 场景                        | 联动行为                   |
| ------------------------- | ---------------------- |
| DataForm 保存成功             | 自动关闭 Dialog/Drawer 窗口  |
| DataForm 保存成功，但选择了"保存并继续" | 保留当前窗口，不清空表单（供连续新增使用）  |
| 用户手动关闭窗口，表单已修改            | 弹出确认提示："有未保存的修改，确认离开？" |
| 用户手动关闭窗口，表单未修改            | 直接关闭，不提示               |
| 程序触发关闭（保存成功自动关闭）          | 不提示，直接关闭               |

联动机制通过 `headCloseDrawer` / `headCloseDialog` 声明式属性实现，DataForm 保存成功后会自动查找目标容器并关闭。

***
