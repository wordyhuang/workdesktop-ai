> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdStationTabButton StationTabButton 标签页按钮

点击按 filter 联动打开并激活 WdStation 的一个标签页；只给 path 时由 Station 反查菜单补齐 key / 标题 / 图标

### 概述

WdStationTabButton 用于从页面任意位置驱动 WdStation 的标签页：点击后按 `filter` 找到同组的 Station 实例，调用其 `openTab` 能力打开并激活一个标签页。标签入参来源有两种：①只给 `path`，Station 按路径反查菜单项，自动补齐标签 key、标题与图标；②给 `tabKey` / `tabTitle` / `tabIcon`，打开不依赖菜单的独立标签。`affix` 可让该标签打开后不可关闭。组件继承 TipsButton 的悬停提示能力（`tips` / `tipsType` / `placement`）与 el-button 的全部属性（经 `$attrs` 透传）。

### 何时使用

- 工作台 / 首页的快捷入口：点击「任务列表」「用户管理」等卡片按钮，直接打开 Station 中对应标签页。
- 弹窗、表单、消息通知里的跳转动作：需要切换到主框架某个标签页而非浏览器新页面时。
- 需要打开非菜单来源的独立标签（如「数据统计」「公告通知」）时，用 `tabKey` + `tabTitle` 自定义。
- 不建议：仅需路由跳转（不需要 Station 标签页）时使用 WdRouteButton；打开弹层用 WdDrawerButton。

### 注意事项

- **filter 定位目标 Station**：`filter` 为空串时按钮按「空 filter 组」联动（与同为默认 filter 的 Station 匹配）；填了值时只作用于同 filter 组的 Station 实例；同组存在多个 Station 时按注册顺序尝试，首个成功即返回。
- **只给 path 的联动**：Station 内部 `findMenuByPath` 反查菜单，标签 key 取菜单项 key、标题取菜单标题、图标取菜单图标，并自动切到该菜单所属分组；router 模式下同时 `router.push(path)` 同步路由。
- **自定义标签 key 建议带命名空间**（如 `custom:stats`），避免与菜单项 key（`分组key:菜单名/路径/标题`）冲突。
- `tabTitle` 缺省规则：只给 `path`（未给 `tabKey`）时不透传按钮 `label`，由 Station 反查菜单标题；给了 `tabKey` 时回退按钮 `label`，再回退 `tabKey` 本身。
- `tabIcon` 与 el-button 的 `icon` 是两回事：前者是标签页图标（支持 EP 图标名 / 图标字体 class / 组件），后者是按钮自身的图标。
- `key` 与 `path` 都未提供时不做任何打开动作，`open` 事件载荷中 `opened` 为 `0`；`opened` 为成功打开的 Station 实例数量（0 或 1）。
- 只有 Station 处于 `content-mode="tabs"` 时标签页才可见；其它内容模式下 `openTab` 仍会记录标签并激活菜单。

### 常见问题

**问：按钮和 Station 必须写同一个 filter 吗？**

是的。按钮的 `filter` 决定它去哪个分组找 Station，只有同 filter 的 Station 才会响应；两者都不写则都落在默认空分组，也能联动。

**问：只写 path 为什么也能打开？**

Station 侧会用 path 反查菜单树，自动取到菜单项 key、标题与图标；无需知道内部 key 生成规则。

**问：打开后用 `router.push` 了吗？**

`router-mode` 下会同步跳转该标签的 path，保证内容区真正切到对应页面；html 模式下只切换标签与激活菜单。

**问：如何打开一个不在菜单里的标签？**

用 `tab-key` + `tab-title`（可选 `tab-icon`）自定义标签，例如 `tab-key="custom:stats" tab-title="数据统计"`。

**问：标签可以不允许关闭吗？**

加 `affix` 属性，打开的标签即为固定标签，Station 的关闭/批量关闭都会跳过它。

### Element Plus 透传

- 透传目标：`el-button`
- 截获事件：`click`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：$attrs 全部透传给 el-button（悬停提示由组件内部 el-tooltip 承载）；点击事件被组件接管，打开结果经 `open` 事件抛出（载荷 `{ tab, opened }`）。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| label | `string` | '' | 按钮文案（未用默认插槽 / #button 插槽时显示） |
| type | `'primary' \| 'success' \| 'warning' \| 'info' \| 'danger'` | '' | 按钮类型（继承自 el-button） |
| size | `'large' \| 'default' \| 'small'` | 'default' | 按钮尺寸（继承自 el-button） |
| plain | `boolean` | false | 朴素按钮（继承自 el-button） |
| round | `boolean` | false | 圆角按钮（继承自 el-button） |
| circle | `boolean` | false | 圆形按钮（继承自 el-button） |
| link | `boolean` | false | 链接按钮（继承自 el-button） |
| text | `boolean` | false | 文字按钮样式（继承自 el-button；与按钮文案 label 相互独立） |
| bg | `boolean` | false | 文字按钮背景色（与 text 搭配，继承自 el-button） |
| disabled | `boolean` | false | 禁用（继承自 el-button） |
| icon | `string \| Component` | — | 图标组件（继承自 el-button） |
| native-type | `'button' \| 'submit' \| 'reset'` | 'button' | 原生 button 类型（继承自 el-button） |
| autofocus | `boolean` | false | 自动聚焦（继承自 el-button） |
| tag | `string` | 'button' | 渲染标签（继承自 el-button） |
| color | `string` | — | 自定义按钮颜色（继承自 el-button） |
| dark | `boolean` | false | 暗色模式（继承自 el-button） |
| loading | `boolean` | false | 加载中（继承自 el-button） |
| tips | `string` | '' | 悬停提示内容（非空时自动显示 tooltip） |
| tipsType | `'dark' \| 'light'` | 'dark' | tooltip 主题（继承自 TipsButton） |
| placement | `'top' \| 'bottom' \| 'left' \| 'right'` | 'top' | 弹出位置（继承自 TipsButton） |
| filter | `string` | '' | 联动分组标识（定位同组的 WdStation） |
| tabKey | `string` | '' | 标签唯一标识（与 Station 菜单项 key 一致；缺省时按 path 反查） |
| tabTitle | `string` | '' | 标签标题（只给 path 时由 Station 反查菜单标题；自定义 tabKey 时回退按钮 label） |
| path | `string` | '' | 标签对应路由路径（Station 据此反查菜单补齐 key / 标题 / 图标） |
| tabIcon | `string \| Component` | '' | 标签图标（EP 图标名 / 图标字体 class / 组件；缺省取菜单项图标） |
| affix | `boolean` | false | 固定标签（打开后不可关闭） |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| click | event | 按钮点击 |
| open | { tab, opened } | 尝试打开标签后触发；tab 为换算后的标签入参，opened 为成功打开的 Station 实例数量（0 未打开 / 1 已打开） |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | 按钮内容（未设 label 时） |
