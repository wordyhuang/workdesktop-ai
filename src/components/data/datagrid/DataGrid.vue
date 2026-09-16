<template>
  <div
    ref="rootRef"
    class="wd-datagrid"
    :class="{
      'wd-datagrid--auto-height': autoHeight,
      'wd-datagrid--fixed-height': isFixedHeightMode
    }"
    :style="rootStyle"
  >
    <!-- 顶部工具栏：自定义组与内置工具组按各自 position 渲染到左/右 -->
    <div v-if="showTopToolbar" class="wd-datagrid__toolbar">
      <!-- 自定义工具栏组：toolbar 插槽 + 新增/导出 -->
      <div
        v-if="actionsAtTop"
        class="wd-datagrid__toolbar-left wd-datagrid__toolbar-group"
        :class="toolbarPosition === 'right' ? 'at-right' : 'at-left'"
      >
        <!-- 补充按钮（开发者）始终位于最左；以下为内置业务按钮 -->
        <slot name="toolbar" :selection="selection" :list="list" />
        <el-button v-if="toolsConf.add" type="primary" :size="toolBtnSize" @click="emit('add')">
          <el-icon><Plus /></el-icon>新增
        </el-button>
        <el-button v-if="toolsConf.export" :size="toolBtnSize" @click="emit('export')">
          <el-icon><Download /></el-icon>导出
        </el-button>
      </div>
      <!-- 内置工具按钮组：刷新 / 大小 / 模式切换 / 列设置 / 购物车 -->
      <div
        v-if="toolsAtTop"
        class="wd-datagrid__toolbar-right wd-datagrid__toolbar-group"
        :class="[`is-${toolBtnMode}`, toolsPosition === 'left' ? 'at-left' : 'at-right']"
      >
        <el-tooltip v-if="toolsConf.refresh" content="刷新" placement="top">
          <el-button :circle="toolBtnMode === 'round'" :size="toolBtnSize" @click="refresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="toolsConf.size" content="调整大小" placement="top">
          <el-dropdown trigger="click" @command="onSizeChange">
            <el-button :circle="toolBtnMode === 'round'" :size="toolBtnSize">
              <el-icon><ScaleToOriginal /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="large" :disabled="innerSize === 'large'">大</el-dropdown-item>
                <el-dropdown-item command="default" :disabled="innerSize === 'default'">默认</el-dropdown-item>
                <el-dropdown-item command="small" :disabled="innerSize === 'small'">小</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip v-if="(toolsConf.modeSwitch || modeSwitch) && $slots['card-item']" content="表格/列表切换" placement="top">
          <el-button :circle="toolBtnMode === 'round'" :size="toolBtnSize" @click="toggleMode">
            <el-icon><Grid v-if="viewMode === 'card'" /><Menu v-else /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="toolsConf.columnSetting || dynamicColumn" content="列设置" placement="top">
          <el-button :circle="toolBtnMode === 'round'" :size="toolBtnSize" @click="colSettingVisible = true">
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="withSelectionCart" :content="cartConfig.buttonText || '已选数据'" placement="top">
          <el-badge :value="cartList.length" :hidden="cartList.length === 0" :max="999">
            <el-button
              :circle="toolBtnMode === 'round' && !cartConfig.buttonText"
              :size="toolBtnSize"
              class="wd-datagrid__cart-btn"
              :class="{ 'wd-datagrid__cart-btn--text': !!cartConfig.buttonText }"
              @click="openCart"
            >
              <el-icon><ShoppingCart /></el-icon>
              <span v-if="cartConfig.buttonText" class="wd-datagrid__cart-text">{{ cartConfig.buttonText }}</span>
            </el-button>
          </el-badge>
        </el-tooltip>
      </div>
    </div>

    <!-- 表格主体 -->
    <el-table
      v-if="viewMode === 'table'"
      ref="tableRef"
      v-loading="loading"
      :data="list"
      :size="innerSize"
      :border="border"
      :stripe="stripe"
      :height="tableHeight"
      :row-key="rowKey || undefined"
      :tree-props="treeProps"
      :default-expand-all="defaultExpandAll"
      :span-method="rowspanMethod"
      class="wd-datagrid__table"
      @selection-change="onSelectionChange"
      @sort-change="grid.changeSort"
    >
      <el-table-column v-if="withSelection" type="selection" width="60" align="center" reserve-selection />
      <el-table-column v-if="withIndex" type="index" label="序号" width="60" align="center" :index="indexMethod" />

      <!-- 业务列：默认插槽内容（el-table-column），过滤隐藏列 -->
      <ColumnRenderer :vnodes="columnVnodes" />

      <!-- 内置操作列（rowActions） -->
      <el-table-column
        v-if="rowActions.length"
        label="操作"
        :width="actionColumnWidth"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-for="act in rowActions"
            :key="act.command || act.text"
            link
            size="small"
            :type="(act.type as any) || 'primary'"
            @click="onRowAction(row, act)"
          >{{ act.text }}</el-button>
        </template>
      </el-table-column>

      <template #empty>
        <slot name="empty">
          <el-empty :description="loading ? '加载中...' : '暂无数据'" :image-size="80" />
        </slot>
      </template>
    </el-table>

    <!-- 列表（卡片）模式 -->
    <div v-else class="wd-datagrid__cards" v-loading="loading">
      <el-empty v-if="!list.length" description="暂无数据" :image-size="80" />
      <div v-for="(row, idx) in list" :key="row[rowKey || 'id'] ?? idx" class="wd-datagrid__card">
        <slot name="card-item" :row="row" :index="idx">
          <div class="wd-datagrid__card-title">{{ row.name || row.title || `第 ${idx + 1} 项` }}</div>
          <div class="wd-datagrid__card-body">
            <div v-for="(val, k) in row" :key="k" class="wd-datagrid__card-line">
              <span class="wd-datagrid__card-label">{{ k }}</span>
              <span class="wd-datagrid__card-value">{{ val }}</span>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- 底部栏：置于底部的工具组/自定义组与分页合并同一行 -->
    <div
      v-if="showBottomBar"
      class="wd-datagrid__pager wd-datagrid__bottom-bar"
      :class="`pager-at-${pagerPos}`"
    >
      <!-- 自定义工具栏组（底部）：toolbar 插槽 + 新增/导出 -->
      <div v-if="actionsAtBottom" class="wd-datagrid__bottom-group wd-datagrid__bottom-actions">
        <slot name="toolbar" :selection="selection" :list="list" />
        <el-button v-if="toolsConf.add" type="primary" :size="toolBtnSize" @click="emit('add')">
          <el-icon><Plus /></el-icon>新增
        </el-button>
        <el-button v-if="toolsConf.export" :size="toolBtnSize" @click="emit('export')">
          <el-icon><Download /></el-icon>导出
        </el-button>
      </div>
      <!-- 内置工具按钮组（底部）：刷新 / 大小 / 模式切换 / 列设置 / 购物车 -->
      <div
        v-if="toolsAtBottom"
        class="wd-datagrid__bottom-group wd-datagrid__bottom-tools wd-datagrid__toolbar-group"
        :class="`is-${toolBtnMode}`"
      >
        <el-tooltip v-if="toolsConf.refresh" content="刷新" placement="top">
          <el-button :circle="toolBtnMode === 'round'" :size="toolBtnSize" @click="refresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="toolsConf.size" content="调整大小" placement="top">
          <el-dropdown trigger="click" @command="onSizeChange">
            <el-button :circle="toolBtnMode === 'round'" :size="toolBtnSize">
              <el-icon><ScaleToOriginal /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="large" :disabled="innerSize === 'large'">大</el-dropdown-item>
                <el-dropdown-item command="default" :disabled="innerSize === 'default'">默认</el-dropdown-item>
                <el-dropdown-item command="small" :disabled="innerSize === 'small'">小</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip v-if="(toolsConf.modeSwitch || modeSwitch) && $slots.list" content="表格/列表切换" placement="top">
          <el-button :circle="toolBtnMode === 'round'" :size="toolBtnSize" @click="toggleMode">
            <el-icon><Grid v-if="viewMode === 'card'" /><Menu v-else /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="toolsConf.columnSetting || dynamicColumn" content="列设置" placement="top">
          <el-button :circle="toolBtnMode === 'round'" :size="toolBtnSize" @click="colSettingVisible = true">
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="withSelectionCart" :content="cartConfig.buttonText || '已选数据'" placement="top">
          <el-badge :value="cartList.length" :hidden="cartList.length === 0" :max="999">
            <el-button
              :circle="toolBtnMode === 'round' && !cartConfig.buttonText"
              :size="toolBtnSize"
              class="wd-datagrid__cart-btn"
              :class="{ 'wd-datagrid__cart-btn--text': !!cartConfig.buttonText }"
              @click="openCart"
            >
              <el-icon><ShoppingCart /></el-icon>
              <span v-if="cartConfig.buttonText" class="wd-datagrid__cart-text">{{ cartConfig.buttonText }}</span>
            </el-button>
          </el-badge>
        </el-tooltip>
      </div>
      <!-- 分页 -->
      <el-pagination
        v-if="withPager && viewMode === 'table'"
        class="wd-datagrid__pager-main"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="pagerPageSizes"
        :layout="pagerLayout"
        :small="pagerStyle === 'simple'"
        :hide-on-single-page="hideOnSinglePage"
        :background="true"
        @current-change="onChangeCurrentpage"
        @size-change="onChangePagesize"
      />
    </div>

    <!-- 列设置弹层 -->
    <el-dialog v-model="colSettingVisible" title="列设置" width="360px" append-to-body>
      <div class="wd-datagrid__col-tip">勾选控制列的显示 / 隐藏，拖拽手柄可调整列顺序</div>
      <div class="wd-datagrid__col-setting">
        <div
          v-for="col in controllableColumns"
          :key="col.key"
          class="wd-datagrid__col-item"
          :class="{
            'is-dragging': draggingColKey === col.key,
            'drag-over--before': dragOverKey === col.key && dragOverPosition === 'before',
            'drag-over--after': dragOverKey === col.key && dragOverPosition === 'after'
          }"
          @dragover.prevent="onColDragOver($event, col.key)"
          @dragleave="onColDragLeave(col.key)"
          @drop.prevent="onColDrop(col.key)"
        >
          <el-checkbox
            class="wd-datagrid__col-checkbox"
            :model-value="col.visible"
            @update:model-value="(v: boolean) => setColumnVisible(col.key, v)"
          >
            {{ col.label }}
          </el-checkbox>
          <span
            class="wd-datagrid__col-handle"
            draggable="true"
            title="拖拽调整顺序"
            @dragstart="onColDragStart($event, col.key)"
            @dragend="onColDragEnd"
          >
            <el-icon><Rank /></el-icon>
          </span>
        </div>
      </div>
      <template #footer>
        <el-button @click="resetColumns()">恢复默认</el-button>
        <el-button type="primary" @click="colSettingVisible = false">完成</el-button>
      </template>
    </el-dialog>

    <!-- 跨页选择「购物车」查看面板 -->
    <component
      :is="cartConfig.type === 'drawer' ? 'el-drawer' : 'el-dialog'"
      v-model="cartVisible"
      :title="String(cartConfig.title || '已选数据').replace('{count}', String(cartList.length))"
      :width="cartConfig.size"
      append-to-body
    >
      <slot name="cart-content" :list="cartList" :remove="removeCartRow" :clear="clearCart">
        <el-empty v-if="!cartList.length" description="暂无已选数据" :image-size="80" />
        <div v-else class="wd-datagrid__cart-list">
          <div v-for="(row, idx) in cartList" :key="idx" class="wd-datagrid__cart-item">
            <span class="wd-datagrid__cart-name">{{ row.name || row.title || cartKeyLabel(row) }}</span>
            <el-button v-if="cartConfig.showRemove !== false" link type="danger" size="small" @click="removeCartRow(row)">
              移除
            </el-button>
          </div>
        </div>
      </slot>
      <template v-if="cartConfig.showClear !== false" #footer>
        <el-button type="danger" @click="clearCart">清空</el-button>
      </template>
    </component>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, useSlots, watch, nextTick, defineComponent, type VNode, type PropType } from 'vue'
import { Plus, Download, Refresh, Setting, ScaleToOriginal, Grid, Menu, ShoppingCart, Rank } from '@element-plus/icons-vue'
import { useDataGrid } from '../../../lib/composables/useDataGrid'
import { registerDataGrid } from '../../../lib/core/linkage'
import { getGlobalConfig } from '../../../lib/core/config'
import { safeJsonParse } from '../../../lib/core/utils'
import { useColumnSettings, orderColumnVnodes } from './useColumnSettings'

defineOptions({ name: 'WdDataGrid' })

/**
 * 列渲染器：把默认插槽里的 el-table-column vnode 渲染进 el-table。
 * 用函数式组件透传 vnode，保留插槽上下文（{ row, column, $index }）。
 */
const ColumnRenderer = defineComponent({
  name: 'WdColumnRenderer',
  props: {
    vnodes: { type: Array as PropType<VNode[]>, default: () => [] }
  },
  render() {
    return this.vnodes
  }
})

const props = defineProps({
  // 数据源
  api: { type: String, default: '' },
  apiMethod: { type: String as PropType<'get' | 'post' | 'put' | 'delete'>, default: 'post' },
  apiParam: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  active: { type: Boolean, default: false },
  /** 静态数据（数组） */
  dataSource: { type: [Array, Object] as PropType<any[] | any>, default: undefined },
  // 分页 / 搜索 / 模式
  withPager: { type: Boolean, default: true },
  withSearch: { type: Boolean, default: false },
  modeSwitch: { type: Boolean, default: false },
  dynamicColumn: { type: Boolean, default: false },
  columnStorageKey: { type: String, default: '' },
  // 表格展示
  fix: { type: Boolean, default: true },
  border: { type: Boolean, default: false },
  stripe: { type: Boolean, default: false },
  /**
   * 高度模式：缺省内容自适应（数据多少就多高）；
   * 'fix' —— 贴合最近一个有确定高度 / 可滚动的祖先容器（顶部取自身位置、底部贴其内容区底），
   *          数据超出在行区内滚动、表头固定；祖先无定高 / 滚动约束时退化为内容自适应；
   * 数字 / CSS 长度（如 '520px'）—— 表格固定高度，行区内滚动。
   */
  height: { type: [String, Number] as PropType<string | number>, default: undefined },
  autoHeight: { type: Boolean, default: false },
  rowKey: { type: String, default: '' },
  tableSize: { type: String as PropType<'large' | 'default' | 'small'>, default: 'default' },
  pagerStyle: { type: String as PropType<'simple' | 'normal' | 'full'>, default: 'normal' },
  /** 分页在底栏的水平位置：left/center/right；缺省走全局配置 page.pager.position（默认 right） */
  pagerPosition: { type: String as PropType<'left' | 'center' | 'right'>, default: '' },
  withIndex: { type: Boolean, default: true },
  withSelection: { type: Boolean, default: false },
  // 行合并
  rowspanKey: { type: String, default: '' },
  rowspanColumn: { type: Array as PropType<string[]>, default: () => [] },
  // 树形
  treeProps: { type: Object, default: () => ({ children: 'children', hasChildren: 'hasChildren' }) },
  defaultExpandAll: { type: Boolean, default: false },
  // selection v-model
  modelValue: { type: Array as PropType<any[]>, default: () => [] },
  /**
   * 选中项返回：默认返回完整行对象数组；如果设置 selectionKey，则返回对应字段值数组
   */
  selectionKey: { type: String, default: '' },
  // tools
  tools: {
    type: Object as PropType<{
      refresh?: boolean
      columnSetting?: boolean
      modeSwitch?: boolean
      size?: boolean
      /** 显示内置「新增」按钮（点击 emit add） */
      add?: boolean
      /** 显示内置「导出」按钮（点击 emit export） */
      export?: boolean
      /** 右侧工具按钮形态：round 圆角（默认）/ square 方角 / group 按钮组 */
      mode?: 'round' | 'square' | 'group'
      /** 工具按钮尺寸：large / default（默认）/ small，与 el-button 一致 */
      buttonSize?: 'large' | 'default' | 'small'
    }>,
    default: () => ({})
  },
  /**
   * 内置工具按钮组（刷新 / 大小 / 模式切换 / 列设置 / 购物车）位置：
   * left 右上左区 / right 右上右区（默认）/ bottom 底栏（与分页同一行）
   */
  toolsPosition: {
    type: String as PropType<'left' | 'right' | 'bottom'>,
    default: 'right'
  },
  /**
   * 自定义工具栏（toolbar 插槽 + 新增/导出按钮）位置：
   * left 左上左区（默认）/ right 左上右区 / bottom 底栏（与分页同一行）
   */
  toolbarPosition: {
    type: String as PropType<'left' | 'right' | 'bottom'>,
    default: 'left'
  },
  /** 内置操作列配置（渲染行操作按钮，点击 emit row-action） */
  rowActions: {
    type: Array as PropType<Array<{ text: string; command?: string; type?: string }>>,
    default: () => []
  },
  // 跨页选择「购物车」
  withSelectionCart: { type: Boolean, default: false },
  /** 购物车去重/自动回勾的唯一键字段，缺省复用 rowKey，均未配置时退化为按行对象引用比较 */
  cartRowKey: { type: String, default: '' },
  /** 购物车按钮与查看面板配置 */
  cartConfig: {
    type: Object as PropType<{
      type?: 'dialog' | 'drawer'
      title?: string
      buttonText?: string
      size?: number | string
      showClear?: boolean
      showRemove?: boolean
    }>,
    default: () => ({
      type: 'dialog',
      title: '已选数据',
      buttonText: '',
      size: 560,
      showClear: true,
      showRemove: true
    })
  },
  // 联动
  filter: { type: String, default: '' }
})

const emit = defineEmits([
  'add',
  'export',
  'row-action',
  'page-change',
  'selection-change',
  'mode-change',
  'loaded',
  'apiBefore',
  'apiAfter',
  'update:modelValue',
  'cart-change'
])

const slots = useSlots()
const tableRef = ref<any>(null)
const viewMode = ref<'table' | 'card'>('table')

// tools 配置合并默认值
const toolsConf = computed(() => ({
  refresh: props.tools.refresh !== false, // 默认 true
  columnSetting: props.tools.columnSetting === true, // 默认 false
  modeSwitch: props.tools.modeSwitch !== false, // 默认 true（需配合 card-item 插槽才渲染）
  size: props.tools.size !== false, // 默认 true
  add: props.tools.add === true, // 默认 false
  export: props.tools.export === true // 默认 false
}))

// 工具按钮形态：round 圆角（默认）/ square 方角 / group 按钮组
const toolBtnMode = computed(() => props.tools.mode || 'round')
// 工具按钮尺寸：large / default / small（不传时跟随表格尺寸）
const toolBtnSize = computed<'large' | 'default' | 'small' | undefined>(() => props.tools.buttonSize || undefined)

const hasToolbar = computed(() => !!slots.toolbar)
// 自定义工具栏组（toolbar 插槽 + 新增/导出业务按钮）
const hasActions = computed(() => hasToolbar.value || toolsConf.value.add || toolsConf.value.export)
// 内置工具按钮组（刷新/大小/模式切换/列设置/购物车）；modeSwitch 还需 card-item 插槽才渲染
const hasToolsGroup = computed(
  () =>
    toolsConf.value.refresh ||
    toolsConf.value.size ||
    ((toolsConf.value.modeSwitch || props.modeSwitch) && !!slots['card-item']) ||
    toolsConf.value.columnSetting ||
    props.dynamicColumn ||
    props.withSelectionCart
)

// 各组当前是否处于顶部 / 底部
const actionsAtTop = computed(() => hasActions.value && props.toolbarPosition !== 'bottom')
const toolsAtTop = computed(() => hasToolsGroup.value && props.toolsPosition !== 'bottom')
const actionsAtBottom = computed(() => hasActions.value && props.toolbarPosition === 'bottom')
const toolsAtBottom = computed(() => hasToolsGroup.value && props.toolsPosition === 'bottom')

// 顶部工具栏：任一组位于顶部即渲染
const showTopToolbar = computed(() => actionsAtTop.value || toolsAtTop.value)
// 底栏：底部分组存在时始终渲染；否则有分页时渲染（保持原有底栏）
const showBottomBar = computed(
  () => actionsAtBottom.value || toolsAtBottom.value || (props.withPager && viewMode.value === 'table')
)

// 兼容旧逻辑（高度计算等场景仍按 hasTools 判断）
const hasTools = computed(() => hasActions.value || hasToolsGroup.value)

// ---------- 跨页选择「购物车」 ----------
/** 程序化回显勾选中（购物车回勾 / modelValue 回显），屏蔽 selection-change 对外触发，避免循环 */
let syncingSelection = false

/** 购物车暂存（跨页累计、已去重） */
const cartList = ref<any[]>([])
/** 购物车查看面板开关 */
const cartVisible = ref(false)

/** 购物车唯一键：cartRowKey 优先，缺省复用 rowKey，均未配置时退化为行对象引用（Map/数组比较均按引用） */
function cartKeyOf(row: any): unknown {
  const k = props.cartRowKey || props.rowKey
  return k ? row?.[k] : row
}

/** 面板默认展示文案：name/title 优先，否则取唯一键字段值（对象引用时返回「第 N 项」） */
function cartKeyLabel(row: any): string {
  const k = props.cartRowKey || props.rowKey
  if (!k) return '已选项'
  const v = row?.[k]
  return v == null ? '' : String(v)
}

/** 把当前页勾选同步进购物车：当前页未勾选的行从购物车移除，勾选行按唯一键去重并入（同 key 以后入者为准） */
function syncCartFromSelection(rows: any[]) {
  const pageKeys = new Set(list.value.map((r: any) => cartKeyOf(r)))
  const kept = cartList.value.filter((c: any) => !pageKeys.has(cartKeyOf(c)))
  const merged = [...kept]
  rows.forEach((r) => {
    const k = cartKeyOf(r)
    const idx = merged.findIndex((c) => cartKeyOf(c) === k)
    if (idx >= 0) merged[idx] = r
    else merged.push(r)
  })
  const changed =
    merged.length !== cartList.value.length ||
    merged.some((c, i) => cartKeyOf(c) !== cartKeyOf(cartList.value[i]) || c !== cartList.value[i])
  if (changed) {
    cartList.value = merged
    emit('cart-change', cartList.value)
  }
}

/** 打开购物车查看面板 */
function openCart() {
  cartVisible.value = true
}

/** 移除购物车中某行；若该行在当前页，同时取消勾选（经 selection 同步移除） */
function removeCartRow(row: any) {
  const k = cartKeyOf(row)
  cartList.value = cartList.value.filter((c) => cartKeyOf(c) !== k)
  emit('cart-change', cartList.value)
  const table = tableRef.value
  if (table && list.value.includes(row)) table.toggleRowSelection(row, false)
}

/** 清空购物车（计数归零，面板同步；当前页勾选一并清空） */
function clearCart() {
  cartList.value = []
  emit('cart-change', cartList.value)
  tableRef.value?.clearSelection?.()
}

/** 获取购物车暂存数组（跨页累计、已去重） */
function getCartList() {
  return cartList.value
}

/** 列表数据刷新后：当前页数据中已在购物车的行自动回勾（增量，不清空其他勾选） */
function applyCartRestore() {
  if (!props.withSelectionCart || !props.withSelection || !list.value.length || !cartList.value.length) return
  const table = tableRef.value
  if (!table) return
  syncingSelection = true
  list.value.forEach((row: any) => {
    if (cartList.value.some((c) => cartKeyOf(c) === cartKeyOf(row))) {
      table.toggleRowSelection(row, true)
    }
  })
  nextTick(() => {
    syncingSelection = false
  })
}

// 表格尺寸持久化
const sizeStorageKey = props.columnStorageKey ? `wd:tablesize:${props.columnStorageKey}` : ''
const storedSize = sizeStorageKey ? safeJsonParse(localStorage.getItem(sizeStorageKey), null) : null
const innerSize = ref<'large' | 'default' | 'small'>(storedSize || props.tableSize)
watch(
  () => props.tableSize,
  (v) => {
    if (!storedSize) innerSize.value = v
  }
)
function onSizeChange(cmd: 'large' | 'default' | 'small') {
  innerSize.value = cmd
  if (sizeStorageKey) localStorage.setItem(sizeStorageKey, JSON.stringify(cmd))
}

// ---------- 高度模式：height='fix'（贴合最近可约束祖先，而非视口） ----------
const rootRef = ref<HTMLElement | null>(null)
/** fix 模式：可占用高度（祖先内容区剩余；无约束祖先时为 0 → 内容自适应） */
const availFixHeight = ref(0)
/** fix 模式：表格主体高（可占用高度扣除工具栏与分页占用，行区内滚动） */
const fixTableHeight = ref(0)
const isFixMode = computed(() => props.height === 'fix')

/**
 * 固定高度模式：height 传数字 / CSS 长度（非 'fix'）。
 * 此时 el-table 自身取固定高度，根容器不再以 height:100% 被内容撑高，
 * 表格也不能 flex:1 拉伸覆盖其显式高度。
 */
const isFixedHeightMode = computed(() => {
  if (props.autoHeight) return false
  const h = props.height
  return h != null && h !== '' && h !== 'fix'
})

/** 根容器内联高：fix 且测得可占用高度时钉死为可用高度，否则内容自适应 */
const rootStyle = computed(() =>
  isFixMode.value && availFixHeight.value > 0 ? { height: `${availFixHeight.value}px` } : undefined
)

/** el-table height：fix → 计算表体像素高（无约束祖先时 undefined = 内容自适应）；autoHeight → '100%'；显式数字/CSS 长度 → 固定高 */
const tableHeight = computed(() => {
  if (isFixMode.value) return fixTableHeight.value > 0 ? fixTableHeight.value : undefined
  if (props.autoHeight) return '100%'
  const h = props.height
  if (h == null || h === '') return undefined
  return h as string | number
})

/**
 * 找限制高度的祖先（fix 边界）：向上取最近一个有确定高度 / 最大高度 / 纵向可滚动的容器。
 * body 与 html 不视作边界（避免退回「视口口径」），找不到则返回 null（fix 退化为内容自适应）。
 */
function findFixBoundary(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement
  while (node && node !== document.body && node !== document.documentElement) {
    const style = getComputedStyle(node)
    const h = parseFloat(style.height)
    const maxH = style.maxHeight === 'none' ? 0 : parseFloat(style.maxHeight)
    const overflowY = style.overflowY
    const isScroll = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'
    const hasBoundedHeight = (Number.isFinite(h) && h > 0) || (Number.isFinite(maxH) && maxH > 0)
    // 可滚动容器即边界；overflow:hidden 仅在自身定高/有最大高时算边界（避免包住自动高内容层）
    if (isScroll || hasBoundedHeight) return node
    node = node.parentElement
  }
  return null
}

let fixBoundaryEl: HTMLElement | null = null
let fixObserver: ResizeObserver | null = null

/** fix 测量：以最近可约束祖先的内容区底为下界，网格顶到该界的距离即可用高度 */
function measureFixHeight() {
  const el = rootRef.value
  if (!el || !isFixMode.value) return
  const boundary = findFixBoundary(el)
  // 祖先变化时重新挂载观察器：容器尺寸变化（含弹层出现/折叠展开）自动重算
  if (fixBoundaryEl !== boundary) {
    fixObserver?.disconnect()
    fixBoundaryEl = boundary
    if (boundary && typeof ResizeObserver !== 'undefined') {
      fixObserver = new ResizeObserver(() => measureFixHeight())
      fixObserver.observe(boundary)
    }
  }
  if (!boundary) {
    // 无约束祖先：内容自适应（不撑高）
    availFixHeight.value = 0
    fixTableHeight.value = 0
    return
  }
  const style = getComputedStyle(boundary)
  const padB = parseFloat(style.paddingBottom) || 0
  const rect = boundary.getBoundingClientRect()
  const gridTop = el.getBoundingClientRect().top
  // 内容坐标口径：内容底 = clientHeight - 下内边距（+边框顶偏移），再减网格距内容顶的偏移（祖先纵向滚动用 scrollTop 补偿）
  const avail = Math.floor(boundary.clientHeight - padB + rect.top + boundary.clientTop - gridTop - boundary.scrollTop)
  if (avail <= 0) {
    availFixHeight.value = 0
    fixTableHeight.value = 0
    return
  }
  availFixHeight.value = avail
  const toolbar = el.querySelector('.wd-datagrid__toolbar') as HTMLElement | null
  const pager = el.querySelector('.wd-datagrid__pager') as HTMLElement | null
  fixTableHeight.value = Math.max(40, avail - (toolbar?.offsetHeight ?? 0) - (pager?.offsetHeight ?? 0))
}
function onViewportResize() {
  measureFixHeight()
}

// 动态切换 height='fix' 时挂/卸 resize 监听并重算
watch(
  () => props.height,
  (v) => {
    if (v === 'fix') {
      window.addEventListener('resize', onViewportResize)
      nextTick(measureFixHeight)
    } else {
      window.removeEventListener('resize', onViewportResize)
      fixObserver?.disconnect()
      fixObserver = null
      fixBoundaryEl = null
    }
  }
)

// 分页档位
const globalCfg = getGlobalConfig()
const pagerPageSizes = globalCfg.page.pager.pageSizes
const hideOnSinglePage = globalCfg.page.pager.hideOnSinglePage
const pagerLayout = computed(() => {
  if (props.pagerStyle === 'simple') return 'prev, pager, next'
  if (props.pagerStyle === 'full') return 'total, sizes, prev, pager, next, jumper'
  return globalCfg.page.pager.layout
})
// 分页位置：prop 优先，缺省走全局配置 page.pager.position（默认 right）
const pagerPos = computed(() => props.pagerPosition || globalCfg.page.pager.position || 'right')

// 数据控制
const isStatic = computed(() => Array.isArray(props.dataSource))
const grid = useDataGrid({
  api: isStatic.value ? '' : props.api,
  apiMethod: props.apiMethod,
  apiParam: props.apiParam,
  pageSize: globalCfg.page.pager.pageSize,
  immediate: false
})

const { list, total, loading, currentPage, pageSize, selection } = grid

// 静态数据直接渲染
watch(
  () => props.dataSource,
  (val) => {
    if (isStatic.value) {
      list.value = val as any[]
      total.value = (val as any[]).length
    }
  },
  { immediate: true }
)

// 动态列
const {
  columns: colColumns,
  controllableColumns,
  hiddenKeys,
  columnOrderMap,
  settingVisible: colSettingVisible,
  init: initColumns,
  setVisible: setColumnVisible,
  reorder: reorderColumns,
  reset: resetColumns
} = useColumnSettings(props.columnStorageKey || undefined)

// ---------- 列设置：拖拽排序 ----------
const draggingColKey = ref('')
const dragOverKey = ref('')
const dragOverPosition = ref<'before' | 'after'>('before')

function onColDragStart(e: DragEvent, key: string) {
  draggingColKey.value = key
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    // Firefox 需要 setData 才会触发拖拽
    e.dataTransfer.setData('text/plain', key)
  }
}

function onColDragOver(e: DragEvent, key: string) {
  if (!draggingColKey.value || draggingColKey.value === key) return
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  dragOverKey.value = key
  dragOverPosition.value = e.clientY - rect.top < rect.height / 2 ? 'before' : 'after'
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onColDragLeave(key: string) {
  if (dragOverKey.value === key) dragOverKey.value = ''
}

function onColDrop(key: string) {
  reorderColumns(draggingColKey.value, key, dragOverPosition.value)
  onColDragEnd()
}

function onColDragEnd() {
  draggingColKey.value = ''
  dragOverKey.value = ''
}

const columnVnodes = computed<VNode[]>(() => {
  const defaultSlot = slots.default
  if (!defaultSlot) return []
  const vn = defaultSlot()
  // 首次初始化列元信息
  if (!colColumns.value.length) {
    initColumns(vn)
  }
  // 先按显隐过滤，再按列设置中的顺序重排
  return orderColumnVnodes(filterColumnVnodes(vn, hiddenKeys.value), columnOrderMap.value)
})

/** 根据隐藏列 key 过滤插槽 vnode（隐藏的列不渲染） */
function filterColumnVnodes(vnodes: VNode[], hidden: Set<string>): VNode[] {
  const result: VNode[] = []
  vnodes.forEach((vnode) => {
    if (!vnode || typeof vnode !== 'object') {
      if (vnode) result.push(vnode)
      return
    }
    const p = (vnode.props || {}) as Record<string, any>
    const key = String(p.prop || p.columnKey || '')
    // selection/index 列已由组件自身渲染，跳过插槽里用户重复声明的
    if (p.type === 'selection' || p.type === 'index') return
    if (key && hidden.has(key)) return
    result.push(vnode)
  })
  return result
}

// 序号
function indexMethod(index: number) {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

// 行合并
function rowspanMethod({ row, column, rowIndex, columnIndex }: any) {
  if (!props.rowspanKey || !props.rowspanColumn.length) return { rowspan: 1, colspan: 1 }
  const prop = column.property
  if (!props.rowspanColumn.includes(prop)) return { rowspan: 1, colspan: 1 }
  const data = list.value
  const keyVal = row[props.rowspanKey]
  // 该分组第一行计算 span
  const firstIdx = data.findIndex((r) => r[props.rowspanKey] === keyVal)
  if (rowIndex === firstIdx) {
    const span = data.filter((r) => r[props.rowspanKey] === keyVal).length
    return { rowspan: span, colspan: 1 }
  }
  return { rowspan: 0, colspan: 0 }
}

// ---------- 选中项（v-model:modelValue 双向绑定，支持 selectionKey） ----------
/** 内部选中行（完整行对象）→ 对外值：默认行数组；设置 selectionKey 时返回该字段值数组 */
function selectionValue(rows: any[]): any[] {
  if (!props.selectionKey) return rows
  return rows.map((r) => r?.[props.selectionKey])
}

/** 依据 props.modelValue 回显勾选对应行（从非空→空时清空勾选；初始/未使用 v-model 时不干预） */
function applySelectionFromModel(mv?: any[], ov?: any[]) {
  if (mv === undefined) mv = props.modelValue
  // 空 → 空：跳过（未使用 v-model 或初始未设置选中，不干预用户选择）
  if ((!mv || mv.length === 0) && (!ov || ov.length === 0)) return
  const table = tableRef.value
  if (!table) return
  // 与当前内部选择一致则跳过，避免用户勾选→父回传→再次触发造成抖动
  const current = selectionValue(grid.getSelection())
  if (current.length === mv.length && mv.every((v) => current.includes(v))) return

  syncingSelection = true
  table.clearSelection()
  if (mv && mv.length) {
    const targets = props.selectionKey
      ? list.value.filter((r: any) => mv.includes(r?.[props.selectionKey]))
      : list.value.filter((r: any) => mv.includes(r))
    targets.forEach((r: any) => table.toggleRowSelection(r, true))
  }
  nextTick(() => {
    syncingSelection = false
  })
}

// modelValue 变化或数据刷新后，回显勾选
watch(
  () => props.modelValue,
  (nv, ov) => {
    applySelectionFromModel(nv as any[], ov as any[])
  },
  { deep: true }
)
watch(
  () => list.value,
  () => {
    if (!syncingSelection) applySelectionFromModel()
    // 购物车：数据刷新/翻页后回勾当前页中已暂存的行
    if (props.withSelectionCart) applyCartRestore()
  }
)

// 事件
function onSelectionChange(rows: any[]) {
  grid.setSelection(rows)
  if (syncingSelection) return
  // 购物车：用户勾选变化同步进暂存（跨页累计、去重；当前页未勾选的行移出）
  if (props.withSelectionCart) syncCartFromSelection(rows)
  const value = selectionValue(rows)
  emit('selection-change', value)
  emit('update:modelValue', value)
}

function onChangeCurrentpage(val: number) {
  grid.onChangeCurrentpage(val)
  emit('page-change', { currentPage: val, pageSize: pageSize.value })
}
function onChangePagesize(val: number) {
  grid.onChangePagesize(val)
  emit('page-change', { currentPage: currentPage.value, pageSize: val })
}

function toggleMode() {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table'
  emit('mode-change', viewMode.value)
}

/** 操作列宽度：按按钮数量估算 */
const actionColumnWidth = computed(() => {
  const w = props.rowActions.reduce((sum, act) => sum + act.text.length * 14 + 16, 20)
  return Math.max(w, 90)
})

/** 内置操作列点击：emit row-action { row, command, text } */
function onRowAction(row: any, act: { text: string; command?: string; type?: string }) {
  emit('row-action', { row, command: act.command ?? act.text, text: act.text })
}

// 对外方法
function requestApi(options?: { apiParam?: Record<string, any> }) {
  if (isStatic.value) return Promise.resolve()
  return grid.fetchData(options?.apiParam).then((res) => {
    emit('loaded', res)
  })
}
function refresh() {
  if (isStatic.value) return Promise.resolve()
  return grid.fetchData().then((res) => emit('loaded', res))
}
function getSelection() {
  return selectionValue(grid.getSelection())
}
function clearSelection() {
  tableRef.value?.clearSelection?.()
  grid.clearSelection()
}
/** 搜索面板联动：带搜索参数查询（重置到第一页） */
function search(params?: Record<string, any>) {
  if (isStatic.value) return Promise.resolve()
  currentPage.value = 1
  return grid.fetchData(params).then((res) => emit('loaded', res))
}
/** 重置搜索并刷新 */
function resetSearch() {
  return grid.reset()
}

defineExpose({
  requestApi,
  refresh,
  onChangePagesize,
  onChangeCurrentpage,
  getSelection,
  clearSelection,
  search,
  resetSearch,
  getCartList,
  clearCart,
  tableRef
})

// 注册到联动中心
let unregister: (() => void) | null = null
onMounted(() => {
  unregister = registerDataGrid({
    filter: props.filter,
    refresh: () => refresh(),
    search: (params?: Record<string, any>) => search(params),
    resetSearch: () => resetSearch()
  })
  if (props.active && !isStatic.value) {
    requestApi()
  }
  if (isFixMode.value) {
    window.addEventListener('resize', onViewportResize)
    measureFixHeight()
  }
  // 静态数据在 setup 阶段已就绪，挂载后补一次选中回显
  applySelectionFromModel()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewportResize)
  fixObserver?.disconnect()
  fixObserver = null
  fixBoundaryEl = null
  unregister?.()
})

// api 变化自动重载
watch(
  () => [props.api, props.apiMethod],
  () => {
    if (props.active && !isStatic.value) requestApi()
  }
)
</script>

<style scoped>
.wd-datagrid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--wd-bg-color, #fff);
}
.wd-datagrid--auto-height {
  height: 100%;
}
/*
 * 固定高度模式（height 传数字 / CSS 长度）：
 * 根容器高度由「工具栏 + 固定高表格 + 分页」自然拼成，不能保持 height:100%
 * （父级无定高时 height:100% 退化为 auto，会被 flex:1 的表格反向撑高）。
 */
.wd-datagrid--fixed-height {
  height: auto;
}
.wd-datagrid__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--wd-spacing-base, 12px);
  padding: 0 0 var(--wd-spacing-base, 12px);
  flex-wrap: wrap;
}
/* 功能区与左区按钮紧凑排布：按钮自身间距交由容器 gap 控制 */
.wd-datagrid__toolbar :deep(.el-button + .el-button) {
  margin-left: 0;
}
.wd-datagrid__toolbar :deep(.el-button .el-icon) {
  font-size: 16px;
}
.wd-datagrid__toolbar-group,
.wd-datagrid__bottom-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.wd-datagrid__toolbar-left {
  gap: 8px;
}
.wd-datagrid__toolbar-right {
  gap: 6px;
  margin-left: auto;
}
/* 顶栏分组对齐：order 决定左/右视觉次序；置右组用 margin-left:auto 右推。
   多个置右组相邻时仅首个右推，后续组 margin 归零紧贴，避免两个 auto 平分剩余空间把第一组停在中间 */
.wd-datagrid__toolbar-group.at-left {
  order: 1;
  margin-left: 0;
}
.wd-datagrid__toolbar-group.at-right {
  order: 2;
  margin-left: auto;
}
.wd-datagrid__toolbar-group.at-right + .at-right {
  margin-left: 0;
}
/* 方角模式：图标按钮为直角正方形，宽高跟随尺寸切换（带文字的购物车按钮除外） */
.wd-datagrid__toolbar-group.is-square :deep(.el-button) {
  border-radius: 0;
}
.wd-datagrid__toolbar-group.is-square :deep(.el-button:not(.wd-datagrid__cart-btn--text)) {
  padding: 0;
  width: var(--el-button-size, 32px);
}
/* 按钮组模式：按钮粘连成组，仅首尾保留圆角 */
.wd-datagrid__toolbar-group.is-group {
  gap: 0;
}
.wd-datagrid__toolbar-group.is-group > *:not(:first-child) {
  margin-left: -1px;
}
.wd-datagrid__toolbar-group.is-group :deep(.el-button:not(.wd-datagrid__cart-btn--text)) {
  padding: 0;
  width: var(--el-button-size, 32px);
}
/* 中间按钮直角：覆盖「按钮是直接子」与「按钮被 dropdown/badge 包裹」两种结构 */
.wd-datagrid__toolbar-group.is-group > :deep(.el-button:not(:first-child)),
.wd-datagrid__toolbar-group.is-group > *:not(:first-child) :deep(.el-button) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.wd-datagrid__toolbar-group.is-group > :deep(.el-button:not(:last-child)),
.wd-datagrid__toolbar-group.is-group > *:not(:last-child) :deep(.el-button) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
/* hover/focus 时提升层级，显示完整边框 */
.wd-datagrid__toolbar-group.is-group :deep(.el-button:hover),
.wd-datagrid__toolbar-group.is-group :deep(.el-button:focus) {
  position: relative;
  z-index: 1;
}

/* 移除对el-badge的所有自定义样式覆盖，使用Element Plus默认样式 */
.wd-datagrid__toolbar-group :deep(.el-badge) {
  /* 不覆盖任何样式，保留默认 */
}
.wd-datagrid__cart-btn {
  /* 保持默认位置，不干扰badge定位 */
}
.wd-datagrid__table {
  flex: 1;
  min-height: 0;
}
/* 固定高度模式下 el-table 自带显式高度，禁止 flex:1 拉伸覆盖该高度 */
.wd-datagrid--fixed-height .wd-datagrid__table {
  flex: none;
}
.wd-datagrid__pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--wd-spacing-base, 12px);
  /* 底部组与分页合并同一行：不换行，内容过宽时横向滚动 */
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-top: var(--wd-spacing-base, 12px);
}
/* 底部工具组与自定义组：图标按钮紧凑排布、内部不换行 */
.wd-datagrid__bottom-group {
  gap: 6px;
  flex-wrap: nowrap;
  flex-shrink: 0;
}
.wd-datagrid__bottom-actions {
  gap: 8px;
}
.wd-datagrid__bottom-group :deep(.el-button + .el-button) {
  margin-left: 0;
}
.wd-datagrid__bottom-group :deep(.el-button .el-icon) {
  font-size: 16px;
}
/* 分页：默认 right——无任何底部组时单独靠右；有底部组时也保持推到行尾 */
.wd-datagrid__pager-main {
  margin-left: auto;
}
/* 分页位置 left：分页贴左（DOM 在底部组之后，用 order 提前），后续底部组被 margin-right:auto 推到行尾 */
.wd-datagrid__bottom-bar.pager-at-left .wd-datagrid__pager-main {
  order: -1;
  margin-left: 0;
  margin-right: auto;
}
/* 分页位置 center：两侧 auto margin 平分剩余空间居中（flex 中 auto margin 优先于 justify-content）；有底部组时组靠左、分页在剩余空间居中 */
.wd-datagrid__bottom-bar.pager-at-center .wd-datagrid__pager-main {
  margin-right: auto;
}
.wd-datagrid__cards {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.wd-datagrid__card {
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: var(--wd-radius-base, 4px);
  padding: var(--wd-spacing-base, 12px);
  margin-bottom: var(--wd-spacing-base, 12px);
}
.wd-datagrid__card-title {
  font-weight: 600;
  font-size: var(--wd-font-size-large, 16px);
  color: var(--wd-text-color-primary, #303133);
  margin-bottom: 8px;
}
.wd-datagrid__card-line {
  display: flex;
  font-size: var(--wd-font-size-base, 14px);
  line-height: 1.8;
}
.wd-datagrid__card-label {
  width: 110px;
  color: var(--wd-text-color-secondary, #909399);
  flex-shrink: 0;
}
.wd-datagrid__card-value {
  color: var(--wd-text-color-regular, #606266);
  word-break: break-all;
}
.wd-datagrid__col-tip {
  margin-bottom: 8px;
  font-size: var(--wd-font-size-small, 12px);
  color: var(--wd-text-color-secondary, #909399);
}
.wd-datagrid__col-setting {
  max-height: 400px;
  overflow: auto;
}
.wd-datagrid__col-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--wd-border-color-light, #f0f0f0);
  border-radius: 4px;
  transition: background-color 0.15s;
}
.wd-datagrid__col-item:hover {
  background-color: var(--wd-fill-color-light, #f5f7fa);
}
.wd-datagrid__col-handle {
  display: inline-flex;
  align-items: center;
  cursor: grab;
  color: var(--wd-text-color-placeholder, #a8abb2);
  touch-action: none;
}
.wd-datagrid__col-handle:active {
  cursor: grabbing;
}
.wd-datagrid__col-checkbox {
  flex: 1;
}
/* 正在拖拽的源行 */
.wd-datagrid__col-item.is-dragging {
  opacity: 0.45;
}
/* 放置位置指示线 */
.wd-datagrid__col-item.drag-over--before::before,
.wd-datagrid__col-item.drag-over--after::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--el-color-primary, #409eff);
  pointer-events: none;
}
.wd-datagrid__col-item.drag-over--before::before {
  top: -1px;
}
.wd-datagrid__col-item.drag-over--after::after {
  bottom: -1px;
}
</style>
