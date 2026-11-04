> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdTag Tag 标签

继承 el-tag 的彩色标签：12 种预设颜色、type=auto 按内容自动配色、icon 展示与悬停 tips

### 概述

WdTag 是继承 el-tag 的彩色标签组件，在原生 5 种语义色基础上扩展为 **12 种预设颜色**（primary / success / warning / danger / info / purple / cyan / orange / pink / geekblue / magenta / lime），每种颜色在 light / plain / dark 三种 effect 下自动派生。提供 `type="auto"` 自动配色模式：优先按内容文本命中语义关键词表（中英文，如「已完成」→绿、「失败」→红、「测试」→青），未命中时对文本做**稳定 hash**——同一内容永远映射到同一颜色。支持 `icon` 属性：设置后标签默认只显示该 icon（颜色跟随标签色，auto 模式下随之自动联动）；若同时提供 `#default` 插槽，插槽内容会转为 tooltip 悬停展示（tips）。

### 何时使用

- 需要用颜色区分状态/分类的标签：直接从 12 色色板选，或在三种 effect 下搭配使用。
- 内容由接口返回、希望同一类内容颜色稳定一致时：`type="auto"` 按文本自动配色，无需维护映射表。
- 紧凑空间里只用一个彩色图标做标记，详情悬停可见：`icon` + `#default`（#default 转为 tips）。
- 不建议：承载大量文字或复杂交互的内容（标签适合短文本标注；长内容应使用提示类或面板类组件）。

### 注意事项

- 12 种预设色：primary `#409eff` / success `#67c23a` / warning `#e6a23c` / danger `#f56c6c` / info `#909399` / purple `#9254de` / cyan `#13c2c2` / orange `#fa8c16` / pink `#eb2f96` / geekblue `#2f54eb` / magenta `#c41d7f` / lime `#7cb305`；颜色通过 el-tag 的 CSS 变量注入，light=12% 浅底+彩字、plain=透明底+彩字、dark=实底白字。
- `color` 传任意 CSS 颜色值时优先级最高，覆盖色板。
- auto 匹配源：普通标签取内容文本；icon + #default 时取 tips 文本；仅 icon 时取 icon 名。空内容回退 primary。
- auto 关键词按「状态语义 → 业务扩展语义」顺序命中：success（成功/完成/通过/在线…）→ danger（失败/错误/禁用/紧急…）→ warning（待处理/进行中/待审核…）→ info（未知/草稿/已取消…）→ primary（新增/创建…）→ purple（热门/会员/推荐…）→ cyan（测试/开发/灰度…）→ orange（提醒/延期…）→ pink（收藏/关注…）→ geekblue（归档/已上线…）→ magenta（促销/爆款…）→ lime（新鲜/生态/成长…）；中英文、大小写不敏感。
- auto 未命中关键词时走稳定 hash（对文本做确定性哈希映射到 12 色），同一文本刷新后颜色不变。
- `icon` 三种形态：@element-plus/icons-vue 图标名（如 `InfoFilled`）/ 图标字体 class（如 `fa-solid fa-user`，需自行引入字体 CSS）/ 组件对象；icon 颜色跟随标签文字色。
- icon-only（icon 无 #default）标签自动收敛内边距为近方形。
- unknown 的 type 值回退 primary；closable 关闭交互由 el-tag 原生提供。

### 常见问题

**问：auto 模式怎么保证同一内容颜色不变？**

关键词未命中时对文本做确定性 hash（同文本永远同色）；关键词命中的文本颜色也由固定关键词表决定。两次渲染结果必然一致。

**问：为什么我的内容配了个意想不到的颜色？**

auto 的关键词是「包含」匹配（如内容同时含「通过」会命中 success）。想精确控制颜色时改用 12 种预设 type，或用 `color` 直接指定色值。

**问：icon 标签里的 #default 为什么不直接显示？**

设计约定：提供 icon 后标签内只显示 icon；若同时提供 #default，插槽内容转为 tooltip 悬停展示（tips），起到「图标标记 + 悬停详情」的作用。

**问：能像 el-tag 一样关闭吗？**

可以。WdTag 继承 el-tag 能力，`closable` 显示关闭按钮、`close` 事件可监听；其余原生属性（round / size / hit / disable-transitions 等）同样可用。

**问：深色皮肤下标签颜色会乱吗？**

light/plain 的浅底用半透明 color-mix 派生，dark 为实色底白字，均通过 el-tag 的 CSS 变量注入；基准色可由 `color` 覆盖。

### Element Plus 透传

- 透传目标：`基于 el-tag 透传`
- 说明：el-tag 原生属性与事件（closable、effect、round、size、hit、disable-transitions、close/click 等）均可直接使用；外部 class 合并到标签根元素。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'purple' \| 'cyan' \| 'orange' \| 'pink' \| 'geekblue' \| 'magenta' \| 'lime' \| 'auto'` | 'primary' | 颜色类型：12 种预设色；auto=按展示内容自动匹配（语义关键词 → 稳定 hash） |
| color | `string` | '' | 自定义颜色（任意 CSS 颜色值，如 '#7c3aed'），优先级高于 type 色板 |
| effect | `'light' \| 'plain' \| 'dark'` | 'light' | 标签风格（透传 el-tag）：light=浅色 / plain=朴素 / dark=深色 |
| icon | `string \| Component` | '' | 标签图标（EP 图标名 / 图标字体 class / 组件对象）；设置后默认只显示 icon，#default 转 tooltip；颜色跟随标签色 |
| closable | `boolean` | false | 是否可关闭（透传 el-tag） |
| round | `boolean` | false | 是否圆角胶囊形（透传 el-tag） |
| size | `'large' \| 'default' \| 'small'` | 'default' | 尺寸（透传 el-tag） |
| hit | `boolean` | false | 边框描边态（透传 el-tag） |
| disableTransitions | `boolean` | false | 禁用渐变动画（透传 el-tag） |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| click | event | 点击标签（el-tag 原生事件透传） |
| close | event | 关闭标签（closable 时点击关闭按钮触发，透传 el-tag） |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | 标签内容；提供 icon 时转为 tooltip 悬停展示（tips） |
