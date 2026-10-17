> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# 自定义皮肤

10 套预设皮肤一键切换（theme.skin），并可在皮肤基础上用 colors 语义令牌 / cssVars CSS 变量继续覆盖（优先级 cssVars > colors > skin）；listSkins() / getSkinPreset() 查询皮肤清单

### 概述

WorkDesktop 内置 10 套预设皮肤（默认 / 时尚 / 商务 / 科技 / 赛博朋克 / 中国风 / 扁平 / 酷炫 / 政务 / 苹果），通过 `theme.skin` 一键套用整套主题；每套皮肤是一组 `colors`（语义令牌）+ `cssVars`（CSS 变量）的组合，切换时由 applyTheme 统一写入 `:root` 上的 `--wd-*` 与 `--el-*` 变量，Element Plus 组件与库组件同步换肤。在皮肤基础上还可以用 `theme.colors`（语义令牌覆盖）与 `theme.cssVars`（CSS 变量覆盖）继续微调，优先级 **cssVars > colors > 皮肤预设**。

### 何时使用

- 项目初始化时统一确定整体视觉风格（app.use 注入 `theme: { skin }`）。
- 运行中提供「换肤」功能，让用户在不同预设皮肤间切换（setGlobalConfig 动态修改 theme.skin）。
- 品牌定制：在某套皮肤基础上覆盖主色等少量语义令牌（`theme.colors`）。
- 精细定制：直接覆盖具体 CSS 变量如菜单背景、边框圆角（`theme.cssVars`）。
- 不建议：只改单个组件的一次样式——直接用 class / style 局部覆盖即可，无需动全局主题。

### 注意事项

- **切换即全站生效**：`setGlobalConfig({ theme: { skin } })` 触发 applyTheme，立即重写 `style[data-workdesktop-theme]` 内的 `:root` 变量，无需刷新页面。
- **覆盖优先级**：`cssVars` > `colors` > 皮肤预设。同一令牌在多处定义时，高优先级覆盖低优先级。
- **恢复默认皮肤**：`resetConfig()` 恢复出厂配置（含主题），或 `setGlobalConfig({ theme: { skin: 'default' } })`。
- **colors 是语义令牌**：key 为 `primary / success / warning / danger / info` 等，库会按 EP 混色公式自动派生整套色阶（light-3/5/7/8/9、dark-2）。
- **cssVars 是裸 CSS 变量**：key 需带 `--` 前缀（如 `--el-color-primary`、`--wd-menu-bg`），原样写入 `:root`，不做派生处理。
- **示例页面离开时应恢复现场**：动态换肤的页面建议在 onUnmounted 中 `resetConfig()`，避免影响其他页面（官方示例做法）。

### 常见问题

**问：有哪些预设皮肤可用？**

共 10 套：default（默认）、fashion（时尚）、business（商务）、tech（科技）、cyberpunk（赛博朋克）、chinese（中国风）、flat（扁平）、cool（酷炫）、governance（政务）、apple（苹果）。调用 `listSkins()` 可拿到含中文名与风格描述的完整清单。

**问：如何在皮肤基础上只改主色？**

`setGlobalConfig({ theme: { skin: 'tech', colors: { primary: '#ff6600' } } })`——colors 在皮肤预设之上覆盖，主色及其派生色阶会替换为指定值。

**问：colors 和 cssVars 改同一个变量，谁生效？**

cssVars 生效。优先级 cssVars > colors > 皮肤预设；cssVars 是最终写入 `:root` 的值。

**问：切换皮肤后部分 Element Plus 组件没变化？**

皮肤通过 `:root` 上的 `--el-*` 变量驱动，Element Plus 组件需使用库默认的主题变量链路（未自行写死颜色）。自定义组件若写死了色值，需改用 `var(--el-color-primary)` 等变量引用。

### API（import 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| listSkins() | — | SkinPreset[] | 获取全部预设皮肤清单（11 套，含中文名与风格描述） |
| getSkinPreset(key?) | key?: string | SkinPreset \| undefined | 按 key 查询单个皮肤预设；未传或未知 key 返回 undefined |
| setGlobalConfig({ theme }) | DeepPartial<WorkDesktopConfig> | WorkDesktopConfig | 运行中切换皮肤 / 覆盖 colors / cssVars，立即全站生效 |
| resetConfig() | — | WorkDesktopConfig | 恢复出厂配置（含主题），即回到默认皮肤 |
| SKIN_PRESETS | — | Record<SkinName, SkinPreset> | 预设皮肤注册表（常量），key 为皮肤名 |

### 数据类型

#### ThemeConfig（主题配置）

引用：`setGlobalConfig({ theme })` / `app.use(WorkDesktop, { theme })` 的 theme 分支

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| skin | SkinName | 否 | 'default' | 预设皮肤名，一键套用整套皮肤；colors/cssVars 可在皮肤基础上继续覆盖 |
| colors | Record<string, string> | 否 | — | 语义令牌覆盖（primary / success / warning / danger / info），自动派生色阶 |
| cssVars | Record<string, string> | 否 | — | CSS 变量覆盖（key 带 -- 前缀，如 --el-color-primary / --wd-menu-bg），优先级高于 colors |

#### SkinPreset（预设皮肤）

引用：`listSkins()` 的数组项 / `getSkinPreset()` 的返回值

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| key | SkinName | 是 | — | 皮肤唯一标识（theme.skin 取值） |
| label | string | 是 | — | 中文名（如「科技」「赛博朋克」） |
| desc | string | 是 | — | 风格描述 |
| theme | ThemeConfig | 是 | — | 皮肤携带的主题配置（colors/cssVars） |

#### SkinName（皮肤名）

引用：`theme.skin` / `SkinPreset.key` 的取值类型

10 个联合字面量，与 SKIN_PRESETS 一一对应：

```ts
type SkinName = 'default' | 'fashion' | 'business' | 'tech' | 'cyberpunk' | 'chinese' | 'flat' | 'cool' | 'governance' | 'apple'
```
