import type { ComponentMeta, NavGroup } from './types'
import { coreData } from './data-core'
import { buttonData } from './data-buttons'
import { containerData, formData, inputData } from './data-containers'
import { uploadData } from './data-upload'
import { pageElementData } from './data-page-element'
import { layoutData } from './data-layout'

/**
 * 导航分组（侧边栏顺序）
 * coreData 内部顺序可能被并行调整，这里一律按 path 显式引用，避免数组索引错位。
 */
const byPath = (p: string) => coreData.find((c) => c.path === p)!

export const componentNav: NavGroup[] = [
  { label: '核心基础设施', items: [byPath('use-config'), byPath('use-request'), byPath('custom-skin')] },
  { label: '数据组件', items: [byPath('datagrid'), byPath('editable-grid'), byPath('viewer'), byPath('requester')] },
  { label: '表单组件', items: [byPath('dataform'), ...formData] },
  { label: '按钮组件', items: buttonData },
  { label: '容器组件', items: containerData },
  { label: '表单元素', items: [...inputData, ...uploadData] },
  { label: '页面元素', items: pageElementData },
  { label: '布局组件', items: layoutData }
]

/** 全部组件平铺 */
export const allComponents: ComponentMeta[] = componentNav.flatMap((g) => g.items)

/** path → meta 查询 */
export const componentMap: Record<string, ComponentMeta> = allComponents.reduce(
  (acc, c) => {
    acc[c.path] = c
    return acc
  },
  {} as Record<string, ComponentMeta>
)
