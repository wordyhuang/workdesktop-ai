<template>
  <div class="example-page">
    <demo-block
      title="预设皮肤一键切换 theme.skin"
      desc="theme.skin 一键套用预设皮肤（10 款）；setGlobalConfig({ theme: { skin } }) 即时切换并写入 :root CSS 变量，resetConfig() 恢复默认。下方预览区的按钮 / 标签 / 背景均随皮肤联动"
      :code="code1"
    >
      <div>
        <div class="demo-toolbar">
          <el-radio-group v-model="currentSkin" size="small" @change="onSkinChange">
            <el-radio-button v-for="s in skinList" :key="s.key" :value="s.key">
              {{ s.label }}
            </el-radio-button>
          </el-radio-group>
          <el-button size="small" @click="resetSkin">恢复默认</el-button>
        </div>
        <p class="skin-current" style="margin-top: 8px">
          当前皮肤：<b>{{ currentSkinMeta.label }}</b>（{{ currentSkin }}）—— {{ currentSkinMeta.desc }}
        </p>
        <div class="skin-preview">
          <div class="skin-preview-row">
            <el-button type="primary" size="small">主要</el-button>
            <el-button type="success" size="small">成功</el-button>
            <el-button type="warning" size="small">警告</el-button>
            <el-button type="danger" size="small">危险</el-button>
            <el-button size="small">默认</el-button>
          </div>
          <div class="skin-preview-row" style="margin-top: 10px">
            <el-tag type="primary">primary</el-tag>
            <el-tag type="success">success</el-tag>
            <el-tag type="warning">warning</el-tag>
            <el-tag type="danger">danger</el-tag>
            <el-tag type="info">info</el-tag>
          </div>
        </div>
      </div>
    </demo-block>

    <demo-block
      title="皮肤基础上覆盖 colors（theme.colors）"
      desc="colors 语义令牌在皮肤预设之上覆盖（优先级 colors > skin）；key 为 primary/success/warning/danger/info，库按 EP 混色公式自动派生 light-3/5/7/8/9、dark-2 色阶。演示：选择基底皮肤 + 自定义主色"
      :code="code2"
    >
      <div>
        <div class="demo-toolbar">
          <span class="demo-label">基底皮肤：</span>
          <el-radio-group v-model="colorBaseSkin" size="small" @change="applyColorDemo">
            <el-radio-button value="default">默认</el-radio-button>
            <el-radio-button value="tech">科技</el-radio-button>
            <el-radio-button value="business">商务</el-radio-button>
          </el-radio-group>
          <span class="demo-label" style="margin-left: 8px">主色：</span>
          <el-color-picker v-model="customPrimary" size="small" @change="applyColorDemo" />
          <el-button size="small" @click="resetColorDemo">重置</el-button>
        </div>
        <p class="color-current" style="margin-top: 8px">
          当前：皮肤 <b>{{ colorBaseSkinMeta.label }}</b>（{{ colorBaseSkin }}）+ colors.primary =
          <b>{{ customPrimary || '(未覆盖)' }}</b>
        </p>
        <div class="skin-preview">
          <div class="skin-preview-row">
            <el-button type="primary" size="small">主要按钮</el-button>
            <el-button type="primary" size="small" plain>朴素按钮</el-button>
            <el-tag type="primary">primary 标签</el-tag>
            <el-link type="primary" href="javascript:void(0)">primary 链接</el-link>
          </div>
        </div>
      </div>
    </demo-block>

    <demo-block
      title="cssVars 精细覆盖（theme.cssVars）"
      desc="cssVars 直接覆盖 :root CSS 变量（优先级最高 cssVars > colors > skin）；key 需带 -- 前缀。演示：科技皮肤 + 覆盖圆角变量 --el-border-radius-base，按钮 / 输入框 / 标签圆角同步变化"
      :code="code3"
    >
      <div>
        <div class="demo-toolbar">
          <span class="demo-label">--el-border-radius-base：</span>
          <el-radio-group v-model="radiusValue" size="small" @change="applyRadiusDemo">
            <el-radio-button value="0px">0px 直角</el-radio-button>
            <el-radio-button value="4px">4px 默认</el-radio-button>
            <el-radio-button value="12px">12px 大圆角</el-radio-button>
          </el-radio-group>
          <el-button size="small" @click="resetRadiusDemo">重置</el-button>
        </div>
        <p class="radius-current" style="margin-top: 8px">
          当前：皮肤 <b>科技</b>（tech）+ cssVars['--el-border-radius-base'] = <b>{{ radiusValue }}</b>
        </p>
        <div class="skin-preview">
          <div class="skin-preview-row">
            <el-button type="primary" size="small">主要按钮</el-button>
            <el-input size="small" placeholder="输入框圆角同步变化" style="width: 220px" />
            <el-tag type="success">success 标签</el-tag>
          </div>
        </div>
      </div>
    </demo-block>

    <demo-block
      title="全站换肤演示"
      desc="预览跟随全站皮肤实时变化（先用右上角画刷按钮或上方 demo 切换皮肤）；右侧为套用当前预设皮肤的接入代码——在你的项目里经 theme.skin 一键套用即可复刻，无需改动任何组件"
    >
      <div class="stage-grid">
        <!-- 左：令牌化组件预览（全站皮肤驱动） -->
        <div class="stage-preview">
          <div class="stage-preview-head">
            <span class="stage-preview-badge">当前站点皮肤：{{ currentSkinLabel }}</span>
          </div>

          <div class="stage-row">
            <el-button type="primary" size="small">主按钮</el-button>
            <el-button type="success" size="small">成功</el-button>
            <el-button type="warning" size="small">警告</el-button>
            <el-button type="danger" size="small">危险</el-button>
          </div>

          <wd-panel title="信息总览" description="标题、描述、标识条、边框随令牌" shadow="always">
            <template #extra>
              <span class="stage-action">刷新</span>
            </template>
            <div class="stage-row">
              <span class="stage-chip is-primary"><i class="stage-dot" />主色</span>
              <span class="stage-chip is-success"><i class="stage-dot" />成功</span>
              <span class="stage-chip is-warning"><i class="stage-dot" />警告</span>
              <span class="stage-chip is-danger"><i class="stage-dot" />危险</span>
            </div>
            <p class="stage-text">正文跟随 --wd-text-color-* 令牌，footer 底色使用 --wd-bg-color-page。</p>
            <template #footer>
              <span class="stage-action">查看详情</span>
            </template>
          </wd-panel>

          <wd-panel
            collapsible
            title="可折叠面板"
            description="悬停底色 / 箭头悬停色跟随令牌"
            style="margin-bottom: 0"
          >
            <p class="stage-text">折叠展开过渡、footer 底色均引用令牌。</p>
          </wd-panel>
        </div>

        <!-- 右：当前皮肤接入代码（theme.skin 一键套用） -->
        <div class="stage-code">
          <CodeBlock lang="ts" :code="currentSkinCode" />
        </div>
      </div>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { setGlobalConfig, listSkins } from '../../../src'
import type { SkinName } from '../../../src'
import { restoreSiteConfig, currentSkinKey, activeSkin, skinCodeOf } from '../skins'

// ---- 预设皮肤一键切换 theme.skin ----
const skinList = listSkins()
// demo1 与全站换肤抽屉同源（读写 skins.ts 模块单例 currentSkinKey）：
// 进页面回显当前全站皮肤，在此切换即改全站，切路由不丢。
const currentSkin = computed<SkinName>({
  get: () => currentSkinKey.value as SkinName,
  set: (v) => { currentSkinKey.value = v }
})
const currentSkinMeta = computed(
  () => skinList.find((s) => s.key === currentSkin.value) || skinList[0]
)

const onSkinChange = () => {
  // 干净换肤：restoreSiteConfig 清掉 demo2/3 可能留下的 colors/cssVars 覆盖，
  // 同时保住站点基础配置（urlPrefix/pageSize）并按 currentSkinKey 补回（新）全站皮肤。
  restoreSiteConfig()
}

const resetSkin = () => {
  currentSkin.value = 'default'
  restoreSiteConfig()
}

// ---- 皮肤基础上覆盖 colors（theme.colors） ----
const colorBaseSkin = ref<SkinName>('tech')
const colorBaseSkinMeta = computed(
  () => skinList.find((s) => s.key === colorBaseSkin.value) || skinList[0]
)
const customPrimary = ref('#ff6600')

const applyColorDemo = () => {
  // 本页局部演示：restoreSiteConfig 清场（保站点配置+全站皮肤）后再叠加本 demo 覆盖，
  // 离开页面时 onUnmounted 再 restoreSiteConfig 即回到全站皮肤。
  restoreSiteConfig()
  setGlobalConfig({
    theme: {
      skin: colorBaseSkin.value,
      colors: customPrimary.value ? { primary: customPrimary.value } : {}
    }
  })
}

const resetColorDemo = () => {
  restoreSiteConfig()
  colorBaseSkin.value = 'tech'
  customPrimary.value = '#ff6600'
}

// ---- cssVars 精细覆盖（theme.cssVars） ----
const radiusValue = ref('12px')

const applyRadiusDemo = () => {
  restoreSiteConfig()
  setGlobalConfig({
    theme: { skin: 'tech', cssVars: { '--el-border-radius-base': radiusValue.value } }
  })
}

const resetRadiusDemo = () => {
  restoreSiteConfig()
  radiusValue.value = '12px'
}

// ---- 全站换肤演示（自全局样式页迁入：左预览随全站皮肤联动，右为当前皮肤接入代码） ----
const currentSkinLabel = computed(() => activeSkin().label)
const currentSkinCode = computed(() => skinCodeOf(currentSkinKey.value))

onUnmounted(() => {
  // 离开页面只清本页 demo 的临时覆盖，保住站点基础配置与全站皮肤（不还原换肤）。
  restoreSiteConfig()
})

const code1 = `// theme.skin 一键套用预设皮肤（10 款）：
// default / fashion / business / tech / cyberpunk / chinese / flat / cool / governance / apple

// 方式一：install 时传入
createApp(App).use(WorkDesktop, { theme: { skin: 'tech' } })

// 方式二：运行中即时切换（applyTheme 自动写入 :root CSS 变量）
import { setGlobalConfig, resetConfig, listSkins } from 'workdesktop-ai'
setGlobalConfig({ theme: { skin: 'cyberpunk' } })

// 遍历全部皮肤（如设置面板 / 换肤下拉）
const skins = listSkins() // [{ key, label, desc, theme }]

// 恢复默认（清空皮肤与 colors/cssVars 覆盖，回落出厂值）
resetConfig()`

const code2 = `import { setGlobalConfig } from 'workdesktop-ai'

// 科技皮肤基础上把主色改为橙色（colors 优先级高于皮肤预设）
// 库会按 EP 混色公式自动派生 --el-color-primary-light-3/5/7/8/9、dark-2
setGlobalConfig({
  theme: {
    skin: 'tech',
    colors: { primary: '#ff6600' }
  }
})

// colors 支持语义令牌：primary / success / warning / danger / info
// 非语义键会作为 --wd-color-{key} 直接写入 :root`

const code3 = `import { setGlobalConfig } from 'workdesktop-ai'

// cssVars 优先级最高（cssVars > colors > 皮肤预设），key 需带 -- 前缀
setGlobalConfig({
  theme: {
    skin: 'tech',
    cssVars: {
      '--el-border-radius-base': '12px', // 圆角：按钮 / 输入框 / 标签同步生效
      '--wd-menu-bg': '#0b1020'          // 也可覆盖库组件变量
    }
  }
})`
</script>

<style scoped>
.example-page {
  width: 100%;
}
.example-page p {
  margin: 4px 0;
  color: var(--wd-text-color-regular, #606266);
  font-size: 13px;
}
.demo-label {
  font-size: 13px;
  color: var(--wd-text-color-regular, #606266);
}
/* 工具行：label / radio-group / color-picker / 按钮垂直居中对齐 */
.demo-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
/* 皮肤预览区：背景 / 边框 / 圆角随 --wd-* 令牌联动，切换皮肤时直观体现 */
.skin-preview {
  margin-top: 12px;
  padding: 14px;
  background: var(--wd-bg-color-page, #f5f7fa);
  border: 1px solid var(--wd-border-color, #dcdfe6);
  border-radius: var(--wd-radius-base, 4px);
  transition: background-color 0.3s, border-color 0.3s;
}
.skin-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

/* —— 全站换肤演示：左令牌化预览 + 右接入代码（自全局样式页迁入） —— */
.stage-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 14px;
  align-items: start;
}
.stage-preview {
  background: var(--wd-bg-color-page, #f5f7fa);
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 12px;
  padding: 16px;
  transition: background-color 0.25s ease;
}
.stage-preview-head {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
.stage-preview-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--wd-color-primary, #409eff);
  background: var(--wd-bg-color, #fff);
  border: 1px dashed var(--wd-border-color, #dcdfe6);
  border-radius: 999px;
  padding: 3px 14px;
}
.stage-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.stage-row:last-child {
  margin-bottom: 0;
}
.stage-action {
  color: var(--wd-color-primary, #409eff);
  font-size: var(--wd-font-size-small, 12px);
  font-weight: 600;
  cursor: pointer;
}
.stage-action:hover {
  text-decoration: underline;
}
.stage-text {
  margin: 0;
  color: var(--wd-text-color-regular, #606266);
  font-size: 13px;
  line-height: 1.7;
}
.stage-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 5px;
}
.stage-chip {
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
.stage-chip .stage-dot {
  background: currentColor;
}
.stage-chip.is-primary {
  color: var(--wd-color-primary, #409eff);
  border-color: var(--el-color-primary-light-5, #79bbff);
  background: var(--el-color-primary-light-9, #ecf5ff);
}
.stage-chip.is-success {
  color: var(--wd-color-success, #67c23a);
  border-color: var(--el-color-success-light-5, #95d475);
  background: var(--el-color-success-light-9, #f0f9eb);
}
.stage-chip.is-warning {
  color: var(--wd-color-warning, #e6a23c);
  border-color: var(--el-color-warning-light-5, #eebe77);
  background: var(--el-color-warning-light-9, #fdf6ec);
}
.stage-chip.is-danger {
  color: var(--wd-color-danger, #f56c6c);
  border-color: var(--el-color-danger-light-5, #f89898);
  background: var(--el-color-danger-light-9, #fef0f0);
}
.stage-code {
  min-width: 0;
}
@media (max-width: 960px) {
  .stage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
