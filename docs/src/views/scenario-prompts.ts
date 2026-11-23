/**
 * 场景示例 · AI 生成提示词
 *
 * 每个场景页对应一段「可直接交给 AI 编码助手」的完整提示词，
 * 由页面头部的「AI 提示词」按钮（ScenarioPromptButton）展示与复制。
 * 页面实现变更时需同步维护对应提示词。
 */

/** 工作台（/scenario/workbench） */
export const WORKBENCH_PROMPT = `# 需求：生成「工作台」首页（Vue3 单文件组件）

## 规范体系（生成前必读）
- 包根 = node_modules/workdesktop-ai/（在本仓库内即 code/）。生成前先读包根 scenarios/00-common.md（通用规范）与 scenarios/09-workbench.md（工作台场景）。
- 遵守包根 skills/workdesktop-page/SKILL.md 的 14 条硬约束（容器结构 / 弹层选型 / 操作反馈 / 按钮选型 / 表格规范）。
- 组件 props / emits / slots 以包根 ai-api/wd-*.md 为准，不凭记忆猜参数。

## 目标
为一个基于 workdesktop-ai 组件库的后台系统生成「工作台」首页：信息密度高、分区清晰，覆盖审批、流程、协作的一站式处理场景。页面由外层系统提供导航框架，只需生成页面内容本身。

## 技术栈与硬约束
- Vue3 <script setup lang="ts"> 单文件组件，TypeScript，静态演示数据写死在脚本中并用 interface 定义类型。
- 组件库：workdesktop-ai（wd-panel / wd-tag / wd-tips / wd-radio-list），基础组件用 Element Plus，图标用 @element-plus/icons-vue。
- 不使用任何图表库：折线图、迷你趋势图一律用原生 SVG 手绘。
- 容器结构（§0.3）：业务区块（今日核心工作 / 数据总览 / 异常提醒 / 销售趋势 / 目标达成 / 待办审批 / 我的流程 / 今日任务 / 快捷功能）一律各自独立 wd-panel；页面顶条与欢迎横幅是通栏元素，直接用 header / section 实现，不包 wd-panel；页面根容器只做限宽居中与纵向节奏，不得自带背景色、边框、额外内边距；通过 :deep() 把面板 header 内边距压成 8px 14px、body 压成 10px 14px 12px 的紧凑风格，并去掉面板自带下边距（§9.3 紧凑化）。
- 按钮、标签类交互统一用 ElMessage 给出反馈；页面上所有链接按钮必须有行为——演示页统一 ElMessage.info('打开「xx」（演示入口）')，不留死链接。
- 金额类指标统一 ¥ + 千分位 + 保留 2 位小数。

## 页面结构（自上而下）
1. 页面顶部 wd-tips type="box"：说明工作台用途（聚合审批 / 流程 / 协作待办）与注意事项（如「数据每 5 分钟刷新一次，以各业务模块为准」）。
2. 顶条（通栏 header，非面板，flex 三段式）：
   - 左：38px 圆角方块 logo（主色浅底 + OfficeBuilding 图标）+ 标题「工作台」+ 副标题「审批 · 流程 · 协作 一站式处理」。
   - 中：「今日完成度 72%」+「已完成 8 / 11 项任务」+ el-progress 细进度条。
   - 右：今天日期与星期，数字用 font-variant-numeric: tabular-nums。
3. 欢迎横幅（通栏 section，浅蓝渐变单行细条）：按时段变化的问候语 +「提交 → 审批 → 归档 → 复盘」图标流程行；右侧四项特性（一站式审批 / 流程可视化 / 数据驱动 / 消息提醒）。
4. wd-panel「今日核心工作」，description「建议按顺序优先处理」，extra 放「全部任务」链接按钮（点击 ElMessage.info 演示入口）：
   - 内容为 6 条任务、一行 3 张卡片的轮播，卡片间 10px 间距，整条轨道按页 translateX 滑动过渡。
   - 每张卡片：两位序号 + 28px 主色浅底图标 + 单行省略标题；底部进度条（进行中才显示）、截止时间、百分比数字 + 状态 wd-tag。
   - 两侧半悬浮 26px 圆形白底箭头翻页，到边界禁用。
5. 左右两栏行（grid：1fr + 340px，align-items: stretch 令左右面板同高，面板内容 flex 撑满）：
   - 左「今日数据总览」，description「截至 09:00」：6 张统计卡（昨日销售额 / 新增客户 / 在途订单 / 本月回款 / 待审报销单 / 会议室使用）。每卡：label、大数值 + 单位、「较昨日」涨跌 wd-tag（涨 success 带 TopRight 图标、跌 danger 带 BottomRight 图标）、底部 24px 高的近 7 日迷你趋势折线 SVG（数据按 min-max 归一化，面积填充主色浅底）；金额类数值保留 2 位小数。
   - 右「异常提醒」：顶部 wd-tips 红色警示盒（type="box"）「共 2 条异常需要处理…」；下方 2 条异常列表：单行省略标题 + 元信息行 + 右侧「去处理」链接按钮（点击 ElMessage.info 演示入口），条目间细分隔线；警示盒文案与列表条数保持口径一致。
6. 左右两栏行（左列内部再分上下两个面板）：
   - 「销售趋势」面板，description「近 12 个月（万元）」，extra 为自绘图例（今年=主色实线、去年=灰色虚线）：
     640×190 viewBox 折线图，手绘网格线与 y 轴刻度（0/40/80/120/160）；今年数据实线主色 + 下方线性渐变面积 + 数据点（hover title 显示「月份：数值 万元」）；去年数据灰色虚线；x 轴 1-12 月标签。
   - 「本月目标达成」面板 flex:1 填满图表下方剩余高度，3 行目标（销售额 860/1000 万、回款 620/800 万、新客户 42/50 家）：
     行内左右分布——左侧目标名，右侧 20px 加粗主色百分比大数字；下行「当前值 / 目标值」与「还差 X」；底部 8px 渐变进度条带从 0 展开的填充动画。
   - 右列上「待办审批」，extra「全部」链接按钮（点击 ElMessage.info 演示入口）：5 条审批（类型 wd-tag + 单行省略标题 +「申请人 · 时间」元信息 + 右侧「通过」「拒绝」小按钮）。点击后条目右移淡出删除并 ElMessage 提示；全部处理完显示 el-empty「审批已全部处理完」。
   - 右列下「我的流程」：4 条流程，每条：标题 + 状态 wd-tag（进行中 warning / 已通过 success / 已驳回 danger）+「当前节点：xxx」+ 进行中显示细进度条（轨道用 --el-fill-color-light）。
7. 左右两栏行：
   - 左「今日任务」，extra 为 wd-radio-list（开 :button-style，§0.6 少选项按钮形态）四态筛选（全部 / 进行中 / 待开始 / 已完成）：12 条时间线列表（44px 宽时间 + 8px 状态彩点 + 单行省略标题 + 状态 wd-tag），前端分页每页 5 条（el-pagination prev, pager, next），切换筛选重置页码，空态显示 el-empty。
   - 右「快捷功能」：3×3 九宫格（请假申请 / 报销申请 / 会议室预订 / 用章申请 / 采购申请 / 差旅申请 / 考勤打卡 / 我的工资条 / 公司公告），图标在上文字在下，hover 时边框与底色变主色浅色，点击 ElMessage 提示「打开「xx」（演示入口）」。

## 状态色映射（全局复用）
已完成 / 已通过 = success；已驳回 = danger；进行中 = warning；待开始 = info；其余 = primary。

## 视觉与响应式
- 颜色全部跟随 Element Plus CSS 变量（--el-color-primary 系列），卡片 1px 边框（--el-border-color-extra-light）+ 8px 圆角。
- 数字统一 tabular-nums；长文本单行省略号 + :title 悬浮看全文；间距节奏 10px。
- 响应式：≤1100px 两栏变单列、统计卡 3 列；≤640px 统计卡 2 列、九宫格 2 列。`

/** 专注工作台（/scenario/focus） */
export const FOCUS_PROMPT = `# 需求：生成「专注工作台」页面（Vue3 单文件组件）

## 规范体系（生成前必读）
- 包根 = node_modules/workdesktop-ai/（在本仓库内即 code/）。生成前先读包根 scenarios/00-common.md（通用规范）与 scenarios/09-workbench.md（工作台场景，本页为其极简变体）。
- 遵守包根 skills/workdesktop-page/SKILL.md 的 14 条硬约束（容器结构 / 弹层选型 / 操作反馈 / 按钮选型 / 表格规范）。
- 组件 props / emits / slots 以包根 ai-api/wd-*.md 为准，不凭记忆猜参数；wd-tips 的 icon 仅支持 InfoFilled / WarningFilled / QuestionFilled。

## 目标
生成一个「一次只做一件事」的极简专注工作页：单列窄栏居中布局，默认只呈现当前任务，其余信息收进折叠面板按需披露，内置番茄钟与键盘快捷键；审批等涉及权限的操作必须等接口返回成功后再更新界面。

## 技术栈与硬约束
- Vue3 <script setup lang="ts"> 单文件组件，TypeScript；mock 接口用 Promise + 延迟（300–600ms）模拟。
- 组件库：workdesktop-ai（wd-panel / wd-tag / wd-tips / wd-drawer），基础组件用 Element Plus（el-button / el-checkbox / el-icon / ElMessage），图标用 @element-plus/icons-vue。
- 不使用图表库：番茄钟环进度用原生 SVG circle + stroke-dasharray 实现。
- 容器结构（§0.3）：当前任务聚焦卡、任务队列、待办审批、今日引导各为**独立 wd-panel**（需要弱化标题时用无 title 模式，可通过 :deep 收敛内边距保持极简视觉）；页面根容器 .focus-page 只做居中限宽（子元素统一 width: min(760px, 100%)），不得自带背景色、边框、额外内边距；本站无全局 border-box reset，需对页面及其子元素统一收敛盒模型。
- 涉及权限 / 资金 / 删除的操作（如审批通过、驳回）**必须等接口返回成功后再更新界面**（§0.8），禁止乐观更新。
- 静态演示数据写死在脚本里并用 interface 定义类型。

## 页面结构
1. 页面顶部 wd-tips type="box"（icon 用 InfoFilled）：说明页面用途（一次只聚焦一件事）与快捷键提示。
2. 极简顶条（两段式）：
   - 左：按时段问候语 +「今天只做一件事」大标题；副标题「X月X日 · 周X · 已完成 N 件事 · M 个番茄」。
   - 右：「?」快捷键帮助图标按钮（el-tooltip 提示「键盘快捷键（?）」）+「专注模式」切换按钮（带 View/Hide 图标与 kbd 键帽 F，激活态高亮）。
3. 当前任务聚焦卡（独立 wd-panel，无 title，主任务区只呈现这一件）：
   - 元信息行：优先级 wd-tag（高=danger 中=warning 低=info）+「预计 40 分钟」+ 来源（如「来自项目群」）。
   - 标题与一句话摘要。
   - 渐进披露 L1——「展开详情」按钮（el-button link，带旋转箭头、待办子项计数、kbd E）：展开后显示子任务 el-checkbox 清单（全部勾完 ElMessage 提示可提交）与备注文字，高度过渡动画。
   - 番茄钟：120 viewBox SVG 双圆环（底轨 + 主色进度弧，stroke-dashoffset 计算），中心 25:00 倒计时数字 + 阶段文案（专注中 / 休息中 / 已暂停 / 待开始）；操作区用 el-button：「开始专注 / 暂停」（kbd Space）+ 重置圆钮（el-button circle，kbd R）。25 分钟专注与 5 分钟休息自动切换：专注完成时番茄数 +1、引导自动勾选、ElMessage 提示休息；休息结束 ElMessage 提示开始下一个。
   - 操作行用 el-button：「完成它」（type=primary 主按钮，kbd C）与「先放一放」（默认次按钮）。完成后已完成数 +1、队列下一条顶上为当前任务；「先放一放」把当前任务移到队尾并顶上下一条，均 ElMessage 提示。
4. 空状态：全部任务完成后显示奖杯图标庆祝视图「今日任务已清空」+ 完成数与番茄数统计 + 行动按钮（el-button「开始新的一天」点击 ElMessage.info 演示入口，§0.10 空态给下一步行动）。
5. 折叠区（三个独立 wd-panel，默认全部收起；专注模式开启时整体隐藏，保持视野干净）：
   - 「任务队列」：面板标题行显示「还有 N 件」；展开后逐条列出（优先级色条 + 标题 +「优先级 · 预计时长」+ el-button「设为当前」）；点击「设为当前」把该任务顶上、旧任务退回队尾；空队列显示「队列已空，专注当前就好」。
   - 「待办审批」：面板标题行显示「N 条待处理」（有待办时警示色）；展开后逐条（类别 tag + 标题 + 说明 +「通过」「驳回」el-button）。点击后先调 mock 接口（POST /focus/approve，延迟 300–600ms），**返回成功后才移除条目**（transition-group 动画）并弹出撤销条「已通过/已驳回 + 撤销按钮 + 5 秒倒计时进度条」，超时自动消失；撤销调恢复 mock 接口原位还原并 ElMessage 提示；接口失败不移除条目并 ElMessage.error。审批清空自动勾选今日引导第三项。
   - 「今日引导」：3 步 checklist（认领一个任务并开始专注 / 完成一个番茄钟 / 清空待办审批），相关事件自动勾选，也可手动勾选，面板标题行显示「n/3」。
6. 快捷键帮助抽屉：wd-drawer（预设档位 size="500px"），键位表（Space 开始暂停番茄钟 / E 展开收起详情 / C 完成当前任务 / F 切换专注模式 / R 重置番茄钟 / ? 打开帮助 / Esc 收起详情关闭浮层），注明输入框聚焦时快捷键自动失效。

## 键盘快捷键实现
window keydown 监听：目标是 INPUT / TEXTAREA / contentEditable 或帮助抽屉打开时直接返回；Space 需 preventDefault 防止页面滚动；组件卸载时移除监听、清理计时器。

## 视觉与节奏
- 大量留白、弱边框、低饱和底色；kbd 键帽样式（1px 边框、底部 2px、圆角 4px）。
- 折叠面板展开 / 收起、详情高度、撤销条进出均有过渡动画；倒计时进度条用 transform: scaleX 实现。
- 长文本单行省略号 + :title 悬浮看全文。`

/** 统计中心（/scenario/stats） */
export const STATS_PROMPT = `# 需求：生成「统计中心」页面（Vue3 单文件组件）

## 规范体系（生成前必读）
- 包根 = node_modules/workdesktop-ai/（在本仓库内即 code/）。生成前先读包根 scenarios/00-common.md（通用规范）与 scenarios/09-workbench.md（工作台场景，本页属其「数据分析页」变体，区块套用 §9.4 ⑦ KPI 指标卡 / ⑧ 榜单卡 / ⑨ 占比环卡 模式）。
- 遵守包根 skills/workdesktop-page/SKILL.md 的 14 条硬约束（容器结构 / 弹层选型 / 操作反馈 / 按钮选型 / 表格规范）。
- 组件 props / emits / slots 以包根 ai-api/wd-*.md 为准，不凭记忆猜参数。

## 目标
生成一个数据分析页：KPI 指标卡点击联动主趋势图，趋势图支持悬浮查看与点击下钻明细，渠道占比用环形图呈现，三个时间范围可切换。

## 技术栈与硬约束
- Vue3 <script setup lang="ts"> 单文件组件，TypeScript。
- 组件库：workdesktop-ai（wd-panel / wd-tag / wd-tips / wd-radio-list / wd-drawer），不使用 Element Plus 弹层与任何图表库——折线图、环形图、悬浮提示全部用原生 SVG 与绝对定位元素手绘。
- 容器结构（§0.3）：页面根节点 .stats-page 只做 flex 列布局、gap 14px、max-width 1280px 居中——**不加背景色、边框与额外内边距**（布局容器豁免规则）；业务区块（KPI 行 / 主区双列 / 下钻明细）一律 wd-panel；本站无全局 border-box reset，需对页面及子元素统一收敛盒模型；可通过 CSS 变量覆写 wd-panel 圆角与边框色。
- 页面顶部用 wd-tips type="box" 说明页面用途与注意事项（§0.1，数据分析页不豁免）。
- 少选项切换（时间范围 3 档）用 wd-radio-list 开 :button-style（§0.6），不自绘分段按钮。
- 颜色一律走 --el-color-* CSS 变量，不写死十六进制色值。
- 静态演示数据写死在脚本里并用 interface 定义类型：6 个指标（访问量 / 转化率 / 客单价 / 订单量 / 新增用户 / 退款率），每个指标含近 7 天、近 30 天、近 12 个月三档本期数据与上期对比数据。

## 页面结构
1. 页面顶部 wd-tips type="box"（icon 用 InfoFilled）：说明统计中心的用途（核心指标 / 渠道结构 / 明细下钻）与数据口径注意事项。
2. 顶条（通栏 header，非面板）：标题「统计中心」+ 副标题「核心指标 · 渠道结构 · 明细下钻 一屏掌握」；右侧 wd-radio-list（:button-style，近 7 天 / 近 30 天 / 近 12 个月）+「更新于 今日 09:00」。
3. KPI 行（独立 wd-panel，套 §9.4⑦ 模式）：6 张指标卡（各自浅色 tint 背景），每卡：指标名、加粗大数值 + 单位、「较上期 ±x%」涨跌 wd-tag（icon TopRight/BottomRight，正 success 负 danger；「退款率」为逆指标，下降为好，涨跌好坏判断需取反）+ 近 7 期迷你 sparkline SVG（面积填充主色浅底）。点击卡片切换 activeKey 联动主趋势图，激活卡主色描边高亮。
4. 主区双列（grid 3fr 2fr）：
   - 左上「XX趋势」面板（标题随选中指标变化，description 显示当前时间范围），extra 图例（本期=主色实线、上期=--el-color-warning-light-3 细线）+ 提示「点击数据点查看明细」：
     640×240 viewBox 折线图，上期线 + 本期主色粗线 + 白描边数据点；鼠标移动按 x 坐标换算最近数据点：显示竖向虚线参考线、数据点放大、上方悬浮 tooltip（日期 + 本期值 + 上期值，按视口百分比定位防溢出）；点击数据点进入下钻。
   - 左下「数据速览」面板，description「各板块贡献 Top 5」（套 §9.4⑧ 榜单卡模式）：5 行排名列表（序号徽标前 3 名高亮色 + 名称单行省略 + :title + 占比条形 + 百分比，条形宽度按第一名归一化，色走 --el-color-primary 系）。
   - 右「渠道占比」面板（套 §9.4⑨ 占比环卡模式）：140 viewBox SVG 环形图，3 个渠道（直接访问 / 线上投放 / 自然流量）按占比分段 stroke-dasharray 绘制，-90deg 起始旋转，段间留 2px 缝隙；hover 某段时其他段降透明度，中心显示总量（过万显示 x.xw 格式）；下方图例（彩点 + 名称 + 百分比）与扇区 hover 联动。
5. 下钻明细面板：点击趋势图数据点后 v-show 出现（带淡入过渡），标题「指标 · 日期 明细」，description「点击数据点生成 · 共 5 条」，extra「收起明细」链接按钮；5 条明细行（时间 + 事件 + 渠道 wd-tag + 数值加粗右对齐）。
6. 切换时间范围时重置悬浮与下钻状态。

## 视觉与交互
- 数值格式化：大于等于 100 取整千分位，小数保留两位；金额 ¥ + 千分位。
- 涨跌判断只看 delta 字符串是否以 - 开头，结合逆指标标记决定绿/红；涨跌色统一 --el-color-success / --el-color-danger。
- 图表几何统一封装 chartX / chartY / linePoints / chartDots 等小函数，hover 索引用 Math.min/max 收敛到有效区间。
- 卡片与面板圆角 12px、细边框；悬浮 tooltip 白底带阴影圆角。
- 数字统一 tabular-nums；长文本单行省略 + :title 悬浮。`

/** 设置中心（/scenario/settings） */
export const SETTINGS_PROMPT = `# 需求：生成「设置中心」页面（Vue3 单文件组件）

## 规范体系（生成前必读）
- 包根 = node_modules/workdesktop-ai/（在本仓库内即 code/）。生成前先读包根 scenarios/00-common.md（通用规范）与 scenarios/02-dataform.md（表单场景，本页以表单开关为主）。
- 遵守包根 skills/workdesktop-page/SKILL.md 的 14 条硬约束（容器结构 / 弹层选型 / 操作反馈 / 按钮选型 / 表格规范）。
- 组件 props / emits / slots 以包根 ai-api/wd-*.md 为准，不凭记忆猜参数。

## 目标
生成一个参照主流大厂设置中心形态的个人配置页：左侧分类导航、右侧单页长滚动分区，点击分类平滑定位并随滚动高亮；顶条唯一「保存更改」一次保存全部分区，经 head-refresh-datagrid 声明式自动刷新变更记录，零手写刷新代码。

## 文档范围（重要）
- 本文档只定义「用哪些元素、如何排布、遵守哪些规范」，不含任何具体数据项：人名、邮箱、设备信息、时间点、选项文案、日志行、提示语正文一律不写进文档。
- 数据由实现者自拟：字段名按元素语义命名（昵称 / 签名 / 设备 / 日志等），演示数据写死在脚本里并用 interface 定义类型；mock 接口只约定路径与返回结构。
- 文案同理：标题、说明、选项文案语义对齐对应元素功能即可，不必照搬。

## 技术栈与硬约束
- Vue3 <script setup lang="ts"> 单文件组件，TypeScript。
- 组件库：workdesktop-ai（wd-panel / wd-switch / wd-radio-list / wd-select / wd-checkbox-list / wd-date-range-picker / wd-api-button / wd-popconfirm-button / wd-prompt-button / wd-data-grid / wd-tips / wd-tag）；基础组件用 Element Plus（el-input / el-icon），图标用 @element-plus/icons-vue。
- Mock 走文档站 /mock/* 内存接口：保存 POST /settings/save、变更记录 GET|POST /settings/logs、登录记录 GET|POST /settings/login-logs、强制下线 POST /settings/sessions/revoke、注销 POST /settings/deactivate。
- 所有区块容器一律使用 wd-panel 且保持原生样式：禁止 :deep() 覆写面板 header / body 的内边距与外边距，换肤令牌全量跟随；页面根容器只做布局（flex 纵向 / 双栏 grid），不得自带背景色、边框、额外内边距（§0.3 布局容器豁免）。
- wd-panel 标题行只保留 title + description，不传 icon prop；图标只出现在分区头色块与左侧导航色块。
- 表格规范（SKILL 约束 7/8）：表格内 tag 一律 size="small"；短状态（登录结果等）不单独占列，与设备名等列合并展示。
- 确认机制分级（§0.9）：强制下线（可逆、中风险）用 wd-popconfirm-button；注销账号（不可恢复）必须用 wd-prompt-button 输入指定文本强确认，确认文案写明后果与不可逆，禁止降级为 popconfirm。
- 声明式联动是核心：顶条唯一「保存更改」按钮（wd-api-button，:api-param 汇总全部分区状态）配 head-refresh-datagrid="settings-logs"，保存后变更记录表格自动刷新。
- 仅设置区滚动：左导航与顶条固定，右侧内容区独立 overflow-y:auto；分类点击用容器 scrollTo 平滑定位，高亮监听该容器 scroll 事件（页面 scrollTop 保持不变）；≤1100px 回退整页滚动；组件卸载时移除监听。

## 页面结构（自上而下，元素级）
1. 顶条（wd-panel，无 title）：
   - 左：h1 页面标题 + 一行副标题，与右侧操作区两端对齐。
   - 右：唯一「保存更改」全局按钮（wd-api-button，type primary，:api-param 汇总全部分区）+ 同排「AI 提示词」按钮（ScenarioPromptButton）。
   - 下方：三步流程胶囊行（圆形序号 + 文案 + ArrowRight 图标衔接），纯说明性元素：分类导航 → 单页滚动 → 保存留痕。
2. 页面级说明：顶条下方 wd-tips type="box"（icon 用 InfoFilled），说明设置中心的保存机制（统一保存、自动留痕）与注意事项（如「离开前记得保存更改」），位置在双栏主体之前（§0.1 所有功能页面统一要求）。
3. 主体两栏（grid 236px 1fr，gap 12px，align-items: start）：
   - 左「分类导航」panel（无 title）：导航项 = 28px tint 圆角图标色块 + 名称 + 一行灰色描述；激活项主色浅底 + 主色文字；导航项与右侧分区一一对应。
   - 右内容区：每个分区 = 分区头 + 若干 wd-panel；分区头 = 30px tint 图标色块 + 17px 标题 + 灰色描述；分区根节点带 id（sec-{key}）供锚点定位。
4. 资料与偏好分区：
   - 身份信息 panel：头像块（首字占位）+ 姓名行（姓名 + 认证状态 wd-tag size="small" success）+ 一行元信息（邮箱 / 部门）+ 右侧文字按钮；下方两列表单网格（两个 el-input 字段）。
   - 偏好 panel：若干开关行（左侧主文案 + 12px 灰色说明，右侧 wd-switch）。
5. 安全与登录分区：
   - 设备 panel：若干设备行（17px 图标 + 设备名 + 当前设备 wd-tag size="small" primary + 地域 / 最后活跃时间元信息）；#footer 右对齐放 wd-popconfirm-button（强制下线其他设备，确认文案写明影响范围）。
   - 登录记录 panel：wd-data-grid（api 指向 login-logs，:active="true"、:tools="{ refresh: true }"、:fix="false"、:with-index="false"、:with-pager="false"），列 = 时间 / 设备 / IP；登录结果**不单独占列**，与设备列合并展示（设备名后跟 wd-tag size="small"，成功 success、失败 danger）。
6. 通知偏好分区：panel：若干渠道开关行 + 一组 wd-checkbox-list（静态 data-source，选项 ≤6 个且文案短时开 :button-style）+ 开关与 wd-date-range-picker 的联动行（开关关闭时日期选择器 disabled）。
7. 外观与语言分区：panel：主题选择用 wd-radio-list 开 :button-style（3 个短文案选项）；界面语言用 wd-radio-list 开 :button-style（3 个短文案选项，不用 select）；时区用 wd-select（选项文案长，§0.6 少选项按钮形态口径）。
8. 操作日志分区：
   - 变更记录 panel：顶部 wd-tips type="box" 说明声明式联动机制；wd-data-grid（api 指向 logs，filter="settings-logs"，:tools="{ refresh: true }"、:fix="false"、:with-index="false"、:with-pager="false"），列 = ID / 变更区块 / 操作说明 / 时间；与顶条保存按钮构成联动关系。
   - 危险操作 panel：顶部 wd-tips type="danger" 警示盒；正文为一行危险操作项（主文案 + 说明 + 右侧 wd-prompt-button type="danger"，输入指定文本后确认提交注销申请，文案写明后果与不可逆）。
9. 页脚：一行 12px 灰色注释，说明本页为演示数据。

## 布局与响应式规范
- 页面根 .settings-page：flex 纵向、height 100%、max-width 1280px 居中，不加背景与内边距；纵向节奏依赖 wd-panel 原生 margin-bottom，分区之间额外留 22px。
- 颜色全部使用 Element Plus / workdesktop CSS 变量；图标色块用 --el-color-primary-light-9 / success-light-9 / warning-light-9 / info-light-9 等 tint 底色。
- 时间、序号等数字统一 tabular-nums；长文本单行省略 + :title。
- 响应式：≤1100px 两栏变单列，此时整页滚动，导航滚动高亮允许降级。`

/** 场景提示词集合 */
export const SCENARIO_PROMPTS = {
  workbench: WORKBENCH_PROMPT,
  focus: FOCUS_PROMPT,
  stats: STATS_PROMPT,
  settings: SETTINGS_PROMPT
} as const

export type ScenarioPromptKey = keyof typeof SCENARIO_PROMPTS
