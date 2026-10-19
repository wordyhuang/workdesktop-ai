> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdAnchor Anchor 快速导航（锚点）

悬浮跟随的多级标题导航：自动解析容器内 H1~H4 标题列表，滚动高亮当前章节，点击平滑跳转；默认视口右侧中部悬浮

### 概述

WdAnchor 是一个悬浮跟随的快速导航（锚点）组件。自动扫描指定容器内的 H1~H4 标题，按层级缩进渲染成垂直列表；页面/容器滚动时自动高亮当前可视范围内的第一个标题，点击列表项平滑滚动到对应章节。默认以 `fixed` 定位悬浮在视口右侧中部，不占用文档流；也可切 `absolute` 嵌入容器内部。支持**手动指定菜单**（`items` prop）、**跨组件联动**（`filter` 分组 + `setAnchorItems` / `notifyAnchorChange` / `getAnchorItems`）、**位置可调**（`placement`）、**可收缩**（`collapsible`）和**圆点模式**（`dot`）。

### 何时使用

- 长文档/详情类页面（如帮助中心、协议、产品介绍）需要快速跳转章节。
- 希望右侧悬浮一个目录，跟随滚动高亮当前位置，无需手动维护锚点。
- Station 内容区为独立滚动容器时，用 `container` 指向内容区，让导航吸附在内容区右侧。
- 菜单结构由业务代码动态决定（非页面标题）：用 `items` 直接传入菜单数组。
- 多个 Anchor 实例需要保持菜单内容同步：用相同 `filter` 分组，由联动 API 跨组件/跨页面驱动。
- 不建议：标题少于 2 个的短页面（悬浮目录会显得多余）；内容结构频繁动态增删且无稳定层级的页面。

### 注意事项

- 标题扫描范围：`container` 指定（CSS 选择器或元素引用）；默认取最近祖先 `.wd-station__content`（组件放在 Station 内容区时自动生效），无则扫描整页。
- `position="fixed"`（默认）相对视口右侧中部悬浮；切 `absolute` 时相对最近的定位祖先容器定位，适合嵌入示例舞台或卡片内部。
- `max-level` 控制收录的最大标题层级（1~4，默认 4），超出层级的标题不进入列表但滚动定位仍按全部标题计算。
- 滚动高亮跟随当前可视范围内的第一个标题；点击跳转使用平滑滚动，并保留 `offset`（默认 16px）的顶部留白，避免标题贴住视口上沿。
- 组件自身的列表渲染位于被观察容器内部时，MutationObserver 会自动忽略落在 `.wd-anchor` 子树内的变动，不会引发自激循环。
- 容器 DOM 动态变化（如异步渲染完标题）后自动重扫；也可用 ref 调用 `refresh()` 手动刷新。
- 手动模式：传入 `items` 后跳过容器标题扫描，列表直接渲染手动项；点击时不自动滚动（无对应 DOM 节点），只抛 `item-click` 由调用方处理导航。
- 联动模式：同 `filter` 的所有 Anchor 实例组成一组，业务代码调用 `setAnchorItems(filter, items)` 即可批量注入菜单；`notifyAnchorChange(filter)` 触发同组刷新；`getAnchorItems(filter)` 读取最近一次注入的菜单快照。
- `placement` 控制悬浮位置（right=右侧 / left=左侧 / top=顶部 / bottom=底部），与 `position` 叠加生效。
- `collapsible` 开启后默认收起，仅显示触发圆点按钮，点击展开/收起列表。
- `dot` 圆点模式只显示圆点、隐藏文字；鼠标悬停在导航上时可通过 CSS 展开为文字（默认 v-if 隐藏 span，可按需切换为 v-show + hover 样式）。

### 常见问题

**问：导航为什么是空的？**

说明扫描范围内没有 h1~h4 标题，或所有标题层级都超过了 `max-level`。检查：1) `container` 作用域是否覆盖到了内容区；2) 内容区是否真的渲染了标题标签；3) `max-level` 是否被调小。

**问：默认悬浮在视口右侧中部，会不会被 Station 侧栏挡住？**

默认 `position: fixed` 以视口为基准；在 Station 布局中建议把组件放进 Station 内容区并用 `container` 指向内容区，或直接切 `position="absolute"` 内嵌在卡片里。也可用 `placement="left"` 让导航贴左侧。

**问：点击跳转后标题贴在视口最顶、被吸顶栏挡住怎么办？**

调大 `offset`（如 64）预留吸顶栏高度，跳转后标题会停在吸顶栏下方。

**问：滚动到某个标题时高亮不跟着变？**

滚动事件绑定在被观察容器上：页面级滚动（container 缺省为整页）绑 window；元素级滚动绑容器自身。确认实际产生滚动的元素就是 `container`。

**问：如何跨组件 / 跨页面统一控制多个 Anchor 的菜单？**

给这些 Anchor 设置相同的 `filter` 分组，然后在业务代码任意位置调用 `setAnchorItems(filter, items)`——所有同组实例会被切换为手动菜单模式；`notifyAnchorChange(filter)` 触发刷新；`getAnchorItems(filter)` 读取最近一次注入的菜单快照。

**问：传入 `items` 后为什么点击不自动滚动？**

手动模式下菜单项没有对应 DOM 节点（业务代码自定义的菜单，非页面标题），组件只抛 `item-click` 事件，由调用方根据需要自行做路由跳转或滚动定位。

**问：`items` 支持 JSON 字符串吗？**

支持，与 WdPath 的 items 心智一致：传入合法 JSON 数组字符串时自动 `JSON.parse`，解析失败时打印 warn 并回退为空列表。

**问：collapsible 收起时列表去哪了？**

`collapsible` 为 true 时默认 `collapsed=true`，列表不渲染；仅显示触发按钮（一个小圆点），点击切换展开/收起。

### Element Plus 透传

- 透传目标：`—（不透传）`
- 说明：内部为原生 nav/ul/li 列表，属性与事件以本文档为准；外部 class 会透传到根 nav 元素。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| container | `string \| HTMLElement` | — | 标题扫描范围：CSS 选择器或元素；默认最近 Station 内容区（.wd-station__content），无则整页 |
| position | `'fixed' \| 'absolute'` | 'fixed' | 悬浮定位：fixed=视口右侧中部 / absolute=相对最近定位祖先容器 |
| maxLevel | `number` | 4 | 收录的最大标题层级（1~4），超出层级的标题不进入列表 |
| offset | `number` | 16 | 点击跳转时距离视口顶部的留白偏移（px） |
| items | `AnchorItemLike[] \| string` | — | 手动指定菜单内容（数组或 JSON 字符串）；传入后跳过容器标题扫描，点击不自动滚动 |
| filter | `string` | '' | 联动分组标识：同 filter 的多个 Anchor 实例可被 setAnchorItems / notifyAnchorChange 跨组件驱动 |
| placement | `'right' \| 'left' \| 'top' \| 'bottom'` | 'right' | 菜单位置（与 position 叠加生效） |
| collapsible | `boolean` | false | 可收缩：默认收起只显示触发按钮，点击展开列表 |
| dot | `boolean` | false | 圆点模式：只显示圆点、隐藏文字（悬停时可展开为文字） |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| change | item | 当前高亮章节变化（AnchorItem \| null） |
| item-click | item | 点击任意导航项（AnchorItem） |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| refresh() | — | void | 手动刷新：重新扫描标题并定位当前章节 |

### 数据类型

#### AnchorItem（导航项）

引用：`change` / `item-click` 事件回调

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| title | string | 是 | — | 标题文字 |
| level | number | 是 | — | 标题层级 1~4 |
