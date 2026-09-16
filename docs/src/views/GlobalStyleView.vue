<template>
  <div class="theme-page">
    <!-- 页头：说明全站换肤入口在左上角 -->
    <PageHeader eyebrow="DESIGN TOKENS" icon="Brush" title="全局样式 / 主题定制">
      组件库以「语义令牌 → ElementPlus 变量映射 → 组件引用」三层驱动全局外观。切换皮肤：
      点击<b>左上角 WorkDesktop 旁的画刷按钮</b>，选择皮肤后覆盖令牌写入
      <code>:root</code>，<b>整个示例站点</b>（含 Element 组件）即整体换肤——本页即当前的实时演示。
    </PageHeader>

    <!-- 1. 机制说明 -->
    <section class="theme__section">
      <h2>一、样式机制</h2>
      <div class="theme__cards">
        <div class="theme__card">
          <h3>① 定义令牌 tokens.css</h3>
          <p>语义令牌统一声明在 <code>:root</code>，如 <code>--wd-color-primary</code>、<code>--wd-bg-color-page</code>、<code>--wd-radius-base</code>。</p>
        </div>
        <div class="theme__card">
          <h3>② 映射 ElementPlus theme.css</h3>
          <p>将 <code>--wd-*</code> 映射为 ElementPlus 的 <code>--el-*</code>，Element 组件随令牌同步换肤。</p>
        </div>
        <div class="theme__card">
          <h3>③ 组件引用 var(--wd-*)</h3>
          <p>Wd 组件样式只引用令牌（带兜底值），不硬编码色值。覆盖令牌即覆盖全部组件。</p>
        </div>
      </div>
      <p class="theme__note">
        令牌清单见 <code>src/styles/tokens.css</code>，映射见 <code>src/styles/theme.css</code>。
        样式经 <code>index.css</code> 汇总，随 <code>workdesktop-ai/style.css</code> 一并引入。
      </p>
    </section>

    <!-- 2. 使用示例：全站换肤入口 -->
    <section class="theme__section">
      <h2>二、本站演示：如何体验全站换肤</h2>
      <p>
        现在你可以用本站右上角按钮立即体验：
        <ol>
          <li>点击左侧栏顶部「WorkDesktop」文字右侧的<b>画刷圆形按钮</b>，从抽屉中选择一个你喜欢的皮肤</li>
          <li>选择后整个文档站全站实时换肤，包括 ElementPlus 组件和 WorkDesktop 组件都会跟随主题色变化</li>
          <li>打开这个「全局样式 / 主题定制」页面，右侧会自动展示对应皮肤的完整 CSS 代码，你可以复制到你的项目中使用</li>
          <li>刷新页面会自动恢复默认皮肤，你可以再次体验其他皮肤</li>
        </ol>
      </p>
    </section>

    <!-- 3. 核心令牌速查 -->
    <section class="theme__section">
      <h2>三、核心令牌速查</h2>
      <el-table :data="tokenRows" class="theme__table">
        <el-table-column prop="name" label="令牌" width="230" />
        <el-table-column prop="default" label="默认值" width="130" />
        <el-table-column prop="desc" label="作用" />
      </el-table>
    </section>

    <!-- 4. 全站换肤演示 -->
    <section class="theme__section">
      <h2>四、全站换肤演示</h2>
      <p class="theme__note">
        当前站点皮肤为「{{ currentSkinLabel }}」。下方预览跟随全站皮肤实时变化；右侧代码即当前
        注入 <code>:root</code> 的同一份 CSS——把它放进你的项目即可复刻该皮肤，无需改动任何组件。
      </p>

      <div class="theme__stage-grid">
        <!-- 左：令牌化组件预览（全站皮肤驱动） -->
        <div class="theme__preview">
          <div class="theme__preview-head">
            <span class="theme__preview-badge">当前站点皮肤：{{ currentSkinLabel }}</span>
          </div>

          <div class="theme__row">
            <el-button type="primary" size="small">主按钮</el-button>
            <el-button type="success" size="small">成功</el-button>
            <el-button type="warning" size="small">警告</el-button>
            <el-button type="danger" size="small">危险</el-button>
          </div>

          <wd-panel title="信息总览" description="标题、描述、标识条、边框随令牌" shadow="always">
            <template #extra>
              <span class="theme__action">刷新</span>
            </template>
            <div class="theme__row">
              <span class="theme__chip is-primary"><i class="theme__dot" />主色</span>
              <span class="theme__chip is-success"><i class="theme__dot" />成功</span>
              <span class="theme__chip is-warning"><i class="theme__dot" />警告</span>
              <span class="theme__chip is-danger"><i class="theme__dot" />危险</span>
            </div>
            <p class="theme__text">正文跟随 --wd-text-color-* 令牌，footer 底色使用 --wd-bg-color-page。</p>
            <template #footer>
              <span class="theme__action">查看详情</span>
            </template>
          </wd-panel>

          <wd-panel
            collapsible
            title="可折叠面板"
            description="悬停底色 / 箭头悬停色跟随令牌"
            style="margin-bottom: 0"
          >
            <p class="theme__text">折叠展开过渡、footer 底色均引用令牌。</p>
          </wd-panel>
        </div>

        <!-- 右：当前皮肤 CSS（与全站注入同源） -->
        <div class="theme__code">
          <CodeBlock lang="css" :code="currentSkinCss" />
        </div>
      </div>
    </section>

    <!-- 5. 接入方式 -->
    <section class="theme__section">
      <h2>五、接入方式</h2>

      <div class="theme__sub">
        <h3>方式 A：纯 CSS 覆盖</h3>
        <p>不引入 JS。在全局样式或任意容器中覆盖变量，适合固定品牌与局部容器换肤。</p>
        <CodeBlock lang="css" :code="cssMethodCode" />
      </div>

      <div class="theme__sub">
        <h3>方式 B：插件初始化注入</h3>
        <p>npm 场景在 <code>app.use(WorkDesktop, config)</code> 传入 <code>theme</code>，安装时经 <code>applyTheme</code> 写入 :root。</p>
        <CodeBlock lang="ts" :code="npmMethodCode" />
      </div>

      <div class="theme__sub">
        <h3>方式 C：运行时动态切换</h3>
        <p>UMD / HTML 场景通过 <code>window.workDesktopConfig</code> 注入；也可随时调用 <code>setGlobalConfig</code> 运行时换肤。</p>
        <CodeBlock lang="ts" :code="runtimeMethodCode" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { activeSkin, skinCssOf, currentSkinKey } from '../skins'

const currentSkinLabel = computed(() => activeSkin().label)
const currentSkinCss = computed(() => skinCssOf(currentSkinKey.value))

const tokenRows = [
  { name: '--wd-color-primary', default: '#409eff', desc: '品牌主色（按钮 / 标识条 / 链接 / 焦点）' },
  { name: '--wd-color-success', default: '#67c23a', desc: '成功色（成功按钮 / 标签）' },
  { name: '--wd-color-warning', default: '#e6a23c', desc: '警示色' },
  { name: '--wd-color-danger', default: '#f56c6c', desc: '危险 / 错误色' },
  { name: '--wd-text-color-primary', default: '#303133', desc: '主文本（标题）' },
  { name: '--wd-text-color-regular', default: '#606266', desc: '常规文本（正文）' },
  { name: '--wd-text-color-secondary', default: '#909399', desc: '次要文本（描述）' },
  { name: '--wd-bg-color', default: '#ffffff', desc: '组件底色' },
  { name: '--wd-bg-color-page', default: '#f5f7fa', desc: '页面底 / footer / 悬停底' },
  { name: '--wd-border-color', default: '#dcdfe6', desc: '强调描边 / hover 边框' },
  { name: '--wd-border-color-light', default: '#e4e7ed', desc: '常规描边' },
  { name: '--wd-radius-base', default: '4px', desc: '圆角基准' }
]

const cssMethodCode = `/* 全站换肤：写入 :root */
:root {
  --wd-color-primary: #12a866;
  --wd-color-success: #12a866;
  --wd-bg-color-page: #edf7f1;
}

/* 局部换肤：写入某个容器类，仅影响容器内组件 */
.some-section {
  --wd-color-primary: #5b5bd6;
}`

const npmMethodCode = `import { createApp } from 'vue'
import WorkDesktop from 'workdesktop-ai'
import 'workdesktop-ai/style.css'

createApp(App).use(WorkDesktop, {
  theme: {
    colors: { primary: '#e0702a' }, // 语义键快捷覆盖
    cssVars: { '--wd-bg-color-page': '#fbf2e8' } // 精细变量（优先级更高）
  }
}).mount('#app')`

const runtimeMethodCode = `// UMD / HTML：script 注入配置，插件安装时自动 applyTheme
window.workDesktopConfig = {
  theme: {
    colors: { primary: '#5b5bd6' }
  }
}

// 任意时刻运行时换肤
import { setGlobalConfig } from 'workdesktop-ai'
setGlobalConfig({
  theme: {
    cssVars: { '--wd-color-primary': '#12a866' }
  }
})`
</script>

<style scoped>
.theme-page {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.theme__section {
  background: var(--wd-bg-color, #fff);
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(13, 18, 30, 0.04);
}
.theme__section h2 {
  position: relative;
  margin: 0 0 14px;
  padding-left: 12px;
  font-size: 17px;
  font-weight: 700;
  color: var(--wd-text-color-primary, #303133);
}
.theme__section h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--wd-color-primary, #409eff), var(--el-color-primary-light-3, #79bbff));
}
.theme__section > p {
  margin: 0;
  font-size: 13.5px;
  color: var(--wd-text-color-regular, #606266);
  line-height: 1.7;
}
.theme__section ol {
  margin: 10px 0 0;
  padding-left: 0;
  list-style: none;
  counter-reset: themestep;
}
.theme__section ol li {
  position: relative;
  counter-increment: themestep;
  padding: 9px 0 9px 38px;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--wd-text-color-regular, #606266);
  border-bottom: 1px dashed var(--wd-border-color-lighter, #ebeef5);
}
.theme__section ol li:last-child {
  border-bottom: none;
}
.theme__section ol li::before {
  content: counter(themestep);
  position: absolute;
  left: 0;
  top: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9, #ecf5ff);
  color: var(--wd-color-primary, #409eff);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme__cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.theme__card {
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 12px;
  padding: 14px 16px;
  background: var(--wd-bg-color-page, #fafbfc);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.theme__card:hover {
  transform: translateY(-2px);
  border-color: var(--el-color-primary-light-7, #a0cfff);
  box-shadow: 0 8px 20px rgba(13, 18, 30, 0.07);
}
.theme__card h3 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--wd-color-primary, #409eff);
}
.theme__card p {
  margin: 0;
  font-size: 13px;
  color: var(--wd-text-color-regular, #606266);
  line-height: 1.7;
}
.theme__card code,
.theme__sub code,
.theme__note code,
.theme__section > p code {
  background: var(--wd-fill-color-light, #f0f2f5);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 12px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  color: var(--wd-color-primary, #476582);
}
.theme__note {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--wd-text-color-secondary, #909399);
  line-height: 1.8;
}

/* 令牌速查表：卡片化、无边框跟随换肤 */
.theme__table {
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 10px;
  overflow: hidden;
}
.theme__table :deep(.el-table__cell) {
  padding: 9px 0;
}
.theme__table :deep(.el-table-column--selection .cell),
.theme__table :deep(td .cell) {
  font-size: 13px;
}
.theme__table :deep(td:first-child .cell) {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12.5px;
  color: var(--wd-color-primary, #409eff);
}
.theme__table :deep(td:nth-child(2) .cell) {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12.5px;
  color: var(--wd-text-color-secondary, #909399);
}

.theme__stage-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 14px;
  align-items: start;
}
.theme__preview {
  background: var(--wd-bg-color-page, #f5f7fa);
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 12px;
  padding: 16px;
  transition: background-color 0.25s ease;
}
.theme__preview-head {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
.theme__preview-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--wd-color-primary, #409eff);
  background: var(--wd-bg-color, #fff);
  border: 1px dashed var(--wd-border-color, #dcdfe6);
  border-radius: 999px;
  padding: 3px 14px;
}
.theme__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.theme__row:last-child {
  margin-bottom: 0;
}
.theme__action {
  color: var(--wd-color-primary, #409eff);
  font-size: var(--wd-font-size-small, 12px);
  font-weight: 600;
  cursor: pointer;
}
.theme__action:hover {
  text-decoration: underline;
}
.theme__text {
  margin: 0;
  color: var(--wd-text-color-regular, #606266);
  font-size: 13px;
  line-height: 1.7;
}
.theme__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 5px;
}
.theme__chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.6;
  background: var(--wd-bg-color, #fff);
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  color: var(--wd-text-color-secondary, #909399);
}
.theme__chip .theme__dot {
  background: currentColor;
}
.theme__chip.is-primary {
  color: var(--wd-color-primary, #409eff);
  border-color: var(--el-color-primary-light-5, #79bbff);
  background: var(--el-color-primary-light-9, #ecf5ff);
}
.theme__chip.is-success {
  color: var(--wd-color-success, #67c23a);
  border-color: var(--el-color-success-light-5, #95d475);
  background: var(--el-color-success-light-9, #f0f9eb);
}
.theme__chip.is-warning {
  color: var(--wd-color-warning, #e6a23c);
  border-color: var(--el-color-warning-light-5, #eebe77);
  background: var(--el-color-warning-light-9, #fdf6ec);
}
.theme__chip.is-danger {
  color: var(--wd-color-danger, #f56c6c);
  border-color: var(--el-color-danger-light-5, #f89898);
  background: var(--el-color-danger-light-9, #fef0f0);
}
.theme__code {
  min-width: 0;
}
.theme__sub {
  padding: 14px 16px;
  margin-bottom: 12px;
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 12px;
  background: var(--wd-bg-color-page, #fafbfc);
}
.theme__sub:last-child {
  margin-bottom: 0;
}
.theme__sub h3 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--wd-text-color-primary, #303133);
}
.theme__sub p {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--wd-text-color-regular, #606266);
  line-height: 1.7;
}
@media (max-width: 960px) {
  .theme__cards,
  .theme__stage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
