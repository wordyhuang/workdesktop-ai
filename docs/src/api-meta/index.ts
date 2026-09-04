import type { ComponentMeta, NavGroup } from './types'
import { coreData } from './data-core'
import { buttonData } from './data-buttons'
import { containerData, inputData } from './data-containers'
import { uploadData, miscData } from './data-upload'

export * from './types'

/** 导航分组（侧边栏顺序） */
export const componentNav: NavGroup[] = [
  { label: '数据组件', items: [coreData[0], coreData[1]] },
  { label: '表单组件', items: [coreData[2]] },
  { label: '按钮组件', items: buttonData },
  { label: '容器组件', items: containerData },
  { label: '输入选择组件', items: inputData },
  { label: '上传组件', items: uploadData },
  { label: '样式组件', items: [miscData[0], miscData[1]] },
  { label: '工具组件', items: [miscData[2]] }
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
