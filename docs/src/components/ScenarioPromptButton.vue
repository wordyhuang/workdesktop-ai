<template>
  <!-- 场景页「AI 生成提示词」入口：轻量胶囊按钮 + 提示词抽屉 -->
  <el-tooltip content="查看让 AI 生成当前页面的提示词" placement="bottom" :show-after="200">
    <button class="scenario-prompt-btn" type="button" aria-label="查看 AI 生成提示词" @click="visible = true">
      <el-icon :size="14"><MagicStick /></el-icon>
      <span>AI 提示词</span>
    </button>
  </el-tooltip>

  <el-drawer v-model="visible" size="660px" append-to-body class="scenario-prompt-drawer">
    <template #header>
      <div class="sp-head">
        <span class="sp-head__icon"><el-icon :size="18"><MagicStick /></el-icon></span>
        <div class="sp-head__text">
          <h3>AI 生成提示词 · {{ title }}</h3>
          <p>把提示词交给 AI 编码助手，即可从零生成本页面</p>
        </div>
      </div>
    </template>

    <ol class="sp-steps">
      <li>点击代码块右上角按钮复制完整提示词；</li>
      <li>粘贴给任意 AI 编码助手（Trae、Cursor 等）；</li>
      <li>生成后按需替换静态数据与接口地址。</li>
    </ol>

    <CodeBlock :code="prompt" lang="md" file="prompt.md" />
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { MagicStick } from '@element-plus/icons-vue'
import CodeBlock from './CodeBlock.vue'
import { SCENARIO_PROMPTS, type ScenarioPromptKey } from '../views/scenario-prompts'

const props = defineProps<{
  /** 场景标识，对应 scenario-prompts 中的键 */
  scene: ScenarioPromptKey
  /** 场景名称，用于抽屉标题 */
  title: string
}>()

const visible = ref(false)
const prompt = computed(() => SCENARIO_PROMPTS[props.scene])
</script>

<style scoped>
.scenario-prompt-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 999px;
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  font-size: 12px;
  line-height: 1.4;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.scenario-prompt-btn:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

/* 抽屉头部 */
.sp-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sp-head__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  flex: none;
}
.sp-head__text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sp-head__text p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 使用步骤 */
.sp-steps {
  margin: 0 0 14px;
  padding: 10px 14px 10px 30px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
  font-size: 13px;
  line-height: 1.9;
  color: var(--el-text-color-regular);
}
.sp-steps li::marker {
  color: var(--el-color-primary);
  font-weight: 600;
}
</style>

<style>
/* 抽屉主体留白收敛（非 scoped：作用于 teleport 到 body 的抽屉） */
.scenario-prompt-drawer .el-drawer__body {
  padding-top: 0;
}
</style>
