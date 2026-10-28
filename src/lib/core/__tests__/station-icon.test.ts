import { describe, it, expect } from 'vitest'
import { isIconFontClass, resolveStationIcon } from '../station-icon'
import { Setting } from '@element-plus/icons-vue'

describe('isIconFontClass', () => {
  it('Font Awesome class（fa- 前缀或含空格多 class）识别为图标字体', () => {
    expect(isIconFontClass('fa-solid fa-user')).toBe(true)
    expect(isIconFontClass('fa-brands fa-github')).toBe(true)
    expect(isIconFontClass('fa-gauge-high')).toBe(true)
  })

  it('其他图标字体前缀（bi- / ri- / iconfont）识别为图标字体', () => {
    expect(isIconFontClass('bi-person')).toBe(true)
    expect(isIconFontClass('ri-home-line')).toBe(true)
    expect(isIconFontClass('iconfont icon-add')).toBe(true)
  })

  it('ElementPlus 图标名与空值不识别为图标字体', () => {
    expect(isIconFontClass('Setting')).toBe(false)
    expect(isIconFontClass('')).toBe(false)
    expect(isIconFontClass(null)).toBe(false)
    expect(isIconFontClass(undefined)).toBe(false)
  })
})

describe('resolveStationIcon', () => {
  it('空值返回 null', () => {
    expect(resolveStationIcon(null)).toBeNull()
    expect(resolveStationIcon(undefined)).toBeNull()
    expect(resolveStationIcon('')).toBeNull()
  })

  it('ElementPlus 图标名解析为对应组件，未知名称返回 null', () => {
    expect(resolveStationIcon('Setting')).toBe(Setting)
    expect(resolveStationIcon('NoSuchIconName')).toBeNull()
  })

  it('图标字体 class 返回 null（由模板按 <i :class> 渲染，不走组件表）', () => {
    expect(resolveStationIcon('fa-solid fa-user')).toBeNull()
  })

  it('组件对象直接返回', () => {
    expect(resolveStationIcon(Setting)).toBe(Setting)
  })
})
