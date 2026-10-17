> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdGuide Guide 指引

新手操作指引：全屏蒙版 + 指定元素/区域高亮挖洞 + 指引面板（自动避让翻转、步骤导航）

### 概述

WdGuide 是分步式操作指引（新手引导）组件。激活后覆盖一层全屏蒙版，对每一步指定的元素/区域进行高亮「挖洞」，并在其旁展示指引面板（标题、描述、步骤导航按钮与进度圆点）。面板位置可配置为 `top` / `bottom` / `left` / `right` / `center`，当指定方向空间不足时会自动翻转到放得下的一侧，四边都放不下时回退为屏幕居中；切换步骤时默认把目标元素平滑滚动到可视区中央。

### 何时使用

- 新用户首次进入系统，需要分步介绍页面关键区域（如搜索、菜单、新建按钮）。
- 功能改版后，需要引导用户注意新入口或新流程。
- 需要把用户注意力聚焦到某个元素/区域并给出文字说明的场景。
- 不建议：需要用户在引导过程中实际操作目标元素的复杂教学（当前版本高亮区域虽可点击，但组件不跟踪操作结果、不会自动推进）。

### 注意事项

- 步骤通过 `steps` 配置，每项的 `target` 支持 CSS 选择器字符串或元素引用；元素在文档中找不到时，该步面板回退为屏幕居中。
- 高亮样式 `highlight`：`rect` 矩形（默认）/ `circle` 圆形（适合头像、圆形按钮）/ `none` 不挖洞（面板默认居中，可做开场介绍）。
- `padding` 控制高亮区域相对目标元素的外扩间距；步骤项内可单独设置覆盖全局值。
- 支持键盘：`ESC` 关闭、`←/↑` 上一步、`→/↓` 下一步（可通过 `keyboard=false` 关闭）。
- 组件监听窗口尺寸变化与页面滚动并实时重算位置；若目标元素位置/尺寸由代码动态改变，可通过 ref 调用 `refresh()` 手动刷新。
- 需要完全自定义面板时使用 `#panel` 插槽，插槽参数包含 `step`、`index/current`、`total`、`prev`、`next`、`close`。

### 常见问题

**问：为什么面板没有出现在目标元素旁边，而是居中显示？**

说明该方向（及翻转后的方向）空间都不足以容纳面板，组件回退为居中。可尝试给目标区域留出更多空间，或将该步 placement 显式设为 center。

**问：打开指引时提示找不到目标元素？**

target 选择器对应的元素必须已经渲染在页面中。若是 v-if / 异步加载的元素，应在其渲染完成后再把 v-model 置为 true。

**问：能否在最后一步之前不让用户跳过？**

设置 :show-skip="false" 隐藏跳过按钮，:show-close="false" 隐藏右上角关闭按钮，:close-on-click-modal 控制点击蒙版关闭（默认 false）。

### Element Plus 透传

- 透传目标：`—（不透传）`
- 说明：组件通过 Teleport 渲染自研遮罩与高亮层，内部仅使用 el-icon，外部属性/事件不会透传到任何 Element Plus 组件。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `boolean` | false | 显隐（v-model） |
| steps | `GuideStep[]` | [] | 指引步骤配置 |
| maskColor | `string` | 'rgba(0,0,0,0.6)' | 蒙版颜色（任意 CSS 颜色，支持 rgba） |
| padding | `number` | 8 | 高亮区域相对目标元素的外扩间距 px |
| showPanel | `boolean` | true | 是否显示面板（false 时仅高亮，纯聚焦场景） |
| showSkip | `boolean` | true | 是否显示「跳过」按钮 |
| showDots | `boolean` | true | 是否显示步骤圆点（可点击跳转） |
| showClose | `boolean` | true | 是否显示右上角关闭按钮 |
| closeOnClickModal | `boolean` | false | 点击蒙版是否关闭 |
| keyboard | `boolean` | true | 是否启用 ESC 关闭、方向键切换 |
| scrollIntoView | `boolean` | true | 激活时自动滚动目标到可视区 |
| appendTo | `string` | 'body' | 挂载位置：body / CSS 选择器 / none（不 teleport） |
| skipText | `string` | '跳过' | 跳过按钮文案 |
| prevText | `string` | '上一步' | 上一步按钮文案 |
| nextText | `string` | '下一步' | 下一步按钮文案 |
| finishText | `string` | '完成' | 最后一步按钮文案 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:modelValue | value | 显隐变化（v-model） |
| change | index | 当前步骤变化（点击圆点 / 上下步） |
| finish | index | 最后一步点击「完成」 |
| skip | index | 点击「跳过」或关闭按钮跳过 |
| close | — | 通过关闭按钮 / ESC / 蒙版关闭 |

### Slots

| 插槽 | 插槽参数 | 说明 |
| --- | --- | --- |
| panel | { step, index, current, total, prev, next, close } | 完全自定义指引面板内容 |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| open() | — | void | 打开指引（从第 0 步开始） |
| close() | — | void | 关闭指引 |
| next() | — | void | 下一步（最后一步触发 finish） |
| prev() | — | void | 上一步 |
| goTo(index) | index: number | void | 跳转到指定步骤 |
| refresh() | — | void | 重新计算目标元素位置与面板位置 |

### 数据类型

#### GuideStep（指引步骤）

引用：`steps` prop（`GuideStep[]`）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| target | string \| HTMLElement | 是 | — | 目标元素：CSS 选择器或元素引用 |
| title | string | 否 | — | 面板标题 |
| description | string | 否 | — | 面板描述文字 |
| placement | 'top' \| 'bottom' \| 'left' \| 'right' \| 'center' | 否 | 'bottom' | 面板优先位置（空间不足自动翻转） |
| highlight | 'rect' \| 'circle' \| 'none' | 否 | 'rect' | 高亮样式：矩形 / 圆形 / 不挖洞 |
| padding | number | 否 | — | 本步高亮区域外扩 px（覆盖全局 padding） |
| scrollIntoView | boolean | 否 | true | 激活时是否滚动目标到可视区 |
