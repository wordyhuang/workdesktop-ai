<template>
  <template v-for="item in items" :key="item._key">
    <el-sub-menu v-if="item.children && item.children.length" :index="item._key">
      <template #title>
        <el-icon v-if="resolveIcon(item.icon)"><component :is="resolveIcon(item.icon)" /></el-icon>
        <span>{{ item.title }}</span>
      </template>
      <station-menu-node :items="item.children" @select="forwardSelect" />
    </el-sub-menu>
    <el-menu-item v-else :index="item._key" :disabled="item.disabled" @click="onClick(item)">
      <el-icon v-if="resolveIcon(item.icon)"><component :is="resolveIcon(item.icon)" /></el-icon>
      <span>{{ item.title }}</span>
      <el-badge v-if="item.badge !== undefined && item.badge !== ''" :value="item.badge" class="wd-station__menu-badge" />
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import * as ElIcons from '@element-plus/icons-vue'

defineOptions({ name: 'StationMenuNode' })

defineProps({
  /** 归一化后的菜单项（带 _key） */
  items: { type: Array as () => any[], default: () => [] }
})

const emit = defineEmits<{
  (e: 'select', item: any): void
}>()

/** 图标归一：字符串按 @element-plus/icons-vue 名称解析，组件直接用 */
function resolveIcon(icon: any) {
  if (!icon) return null
  if (typeof icon === 'string') return (ElIcons as any)[icon] || null
  return icon
}

function onClick(item: any) {
  if (item.disabled) return
  emit('select', item)
}

function forwardSelect(item: any) {
  emit('select', item)
}
</script>

<style scoped>
/* 菜单徽章：靠右显示、垂直居中（el-menu-item 为 flex 容器，badge 为末位子元素） */
.wd-station__menu-badge {
  /* 转 inline-flex：消除继承自 el-menu-item 的 56px line-height 行盒撑高（否则圆点沉底） */
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  align-self: center;
  flex-shrink: 0;
}
/* 菜单折叠成窄条时隐藏徽章，避免溢出 */
.el-menu--collapse .wd-station__menu-badge {
  display: none;
}
</style>
