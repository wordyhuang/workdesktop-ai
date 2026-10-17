> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdPanel Panel 面板

带标题/描述的内容面板，作为表单分组与详情分区容器；支持折叠、标题右侧操作区与阴影策略

### 概述

WdPanel 是一个带标题/描述的内容面板，用作表单分组与详情分区的容器。标题左侧带品牌色标识条，支持点击标题区折叠/展开主体内容、在标题右侧放置操作区（extra 插槽），并提供 always / hover / never 三种阴影策略以适应不同层级的视觉分区需求。

### 何时使用

- 详情页需要按「基本信息 / 联系信息 / 其他」等分区组织内容时。
- 表单较长，需要分组展示并允许用户收起暂不关注的分组时（`collapsible`）。
- 分区标题旁需要放置「刷新 / 更多」等轻量操作入口时（`extra` 插槽）。
- 不建议：需要弹出式承载内容（应使用 WdDrawer 抽屉/对话框容器）。
- 不建议：页面最外层整体布局（应使用 WdStation 中后台外框架）。

### 注意事项

- 标题区仅在传了 `title` 或使用了 `title` 插槽时才渲染；两者都不传时整个头部（含 description、extra）不显示。`description` 需配合 `title` 属性使用——使用 `title` 插槽自定义标题时，`description` 不再渲染，请把描述写进插槽内容里。
- `opened` 只在 `collapsible` 开启后生效；未开启折叠时面板始终展开。
- `extra` 插槽区域的点击事件已被拦截（`@click.stop`），点击里面的按钮不会误触面板的折叠/展开。
- 折叠时主体（default）与底部（footer）会一并收起，展开带高度过渡动画；不要把需要常驻的操作只放在 footer 里。
- 阴影选择建议：`hover`（默认）适合常规分区；`always` 适合需要突出的核心分区；`never` 仅保留描边，适合密集排列的次级分区。
- `border="false"` 去掉外框描边，适合嵌在卡片、抽屉、灰色底区块等已有容器内；此时建议搭配 `shadow="never"` 避免悬停浮起。
- 标题区支持键盘操作（Enter / Space 切换折叠），并带有 `aria-expanded` 等无障碍属性。

### 常见问题

**问：不传 `title` 只传 `description` 为什么不显示？**

标题区（header）的渲染条件是 `title` 或 `title` 插槽存在，`description` 是标题的附属内容，不能单独触发标题区渲染。

**问：`change` 和 `update:opened` 有什么区别？**

两者都在折叠状态切换时触发且参数相同。`update:opened` 用于配合 `v-model:opened` 做双向绑定；`change` 用于业务侧监听（如收起时暂存草稿、展开时懒加载数据）。

**问：extra 插槽里的按钮点击会把面板折叠了？**

不会。extra 区域的点击事件已做 `.stop` 处理，不会冒泡到标题区的折叠切换逻辑。

**问：想让面板默认收起怎么写？**

设置 `collapsible` 并传 `:opened="false"`（或 `v-model:opened` 绑定初始为 `false` 的变量）即可。

### Element Plus 透传

- 透传目标：`—（不透传）`
- 说明：纯自研卡片容器（根节点 div.wd-panel，内部仅使用 el-icon），没有可透传的 Element Plus 组件。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | `string` | '' | 面板标题 |
| description | `string` | '' | 描述 |
| collapsible | `boolean` | false | 是否可折叠（点击标题区收起/展开主体与底部） |
| opened | `boolean` | true | 展开状态（配合 collapsible，支持 v-model:opened） |
| shadow | `'always' \| 'hover' \| 'never'` | 'hover' | 阴影策略：常驻 / 悬停显示 / 无阴影 |
| border | `boolean` | true | 是否显示外边框（嵌套在卡片/弹层等容器内时可关闭） |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:opened | value: boolean | 展开状态变化（v-model:opened） |
| change | value: boolean | 折叠/展开切换时触发 |

### Slots

| 插槽 | 插槽参数 | 说明 |
| --- | --- | --- |
| title | — | 自定义标题区 |
| extra | — | 标题右侧操作区 |
| default | — | 主体内容 |
| footer | — | 底部 |
