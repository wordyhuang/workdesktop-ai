<template>
  <div class="example-page">
    <demo-block
      title="打开 Station 标签页"
      desc="WdStationTabButton 继承 TipsButton（悬停提示 tips / tipsType / placement）与 el-button 全部属性；点击后按 filter 找到同组的 WdStation，打开并激活一个标签页。只给 path 时由 Station 反查菜单补齐 key / 标题 / 图标"
      :code="code1"
    >
      <div class="station-tab-stage">
        <wd-station
          title="WorkDesktop"
          logo="Platform"
          :menu-groups="menuGroups"
          content-mode="tabs"
          filter="station-tab-demo"
          user-name="张管理员"
          copyright="© 2026 WorkDesktop"
          router-mode="html"
        >
          <div class="station-tab-page">
            <h4>内容区</h4>
            <p>点击下方按钮打开对应标签页；只传 path 时标签标题取菜单标题，自定义标签未传 tab-title 时取按钮 label</p>
            <div class="station-tab-actions">
              <wd-station-tab-button
                filter="station-tab-demo"
                label="打开任务列表"
                path="/work/tasks"
                tips="按 path 打开：key / 标题 / 图标自动反查菜单"
              />
              <wd-station-tab-button
                filter="station-tab-demo"
                label="打开用户列表"
                path="/sys/user"
                type="primary"
              />
            </div>
          </div>
        </wd-station>
      </div>
      <div class="station-tab-tip">
        <span>同组其它位置也可以放置按钮：</span>
        <wd-station-tab-button
          filter="station-tab-demo"
          label="打开消息中心"
          path="/work/messages"
          size="small"
          round
        />
      </div>
    </demo-block>

    <demo-block
      title="自定义标签 key / 标题 / 图标 / 固定标签"
      desc="tabKey + tabTitle 可打开不依赖菜单的独立标签；tabIcon 支持 EP 图标名 / 图标字体 class / 组件；affix 打开后标签不可关闭"
      :code="code2"
    >
      <div class="station-tab-stage">
        <wd-station
          title="WorkDesktop"
          logo="Platform"
          :menu-groups="menuGroups"
          content-mode="tabs"
          filter="station-tab-custom"
          user-name="张管理员"
          copyright="© 2026 WorkDesktop"
          router-mode="html"
        >
          <div class="station-tab-page">
            <h4>自定义标签</h4>
            <div class="station-tab-actions">
              <wd-station-tab-button
                filter="station-tab-custom"
                label="打开统计标签"
                tab-key="custom:stats"
                tab-title="数据统计"
                tab-icon="DataLine"
                type="success"
              />
              <wd-station-tab-button
                filter="station-tab-custom"
                label="打开固定标签"
                tab-key="custom:notice"
                tab-title="公告通知"
                affix
                type="warning"
              />
            </div>
          </div>
        </wd-station>
      </div>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import stationData from './station-data.json'

const menuGroups = stationData.menuGroups

const code1 = `<wd-station
  :menu-groups="menuGroups"
  content-mode="tabs"
  filter="station-tab-demo"
  router-mode="html"
>
  <wd-station-tab-button
    filter="station-tab-demo"
    label="打开任务列表"
    path="/work/tasks"
    tips="按 path 打开：key / 标题 / 图标自动反查菜单"
  />
</wd-station>`

const code2 = `<wd-station-tab-button
  filter="station-tab-custom"
  label="打开统计标签"
  tab-key="custom:stats"
  tab-title="数据统计"
  tab-icon="DataLine"
/>
<wd-station-tab-button
  filter="station-tab-custom"
  label="打开固定标签"
  tab-key="custom:notice"
  tab-title="公告通知"
  affix
/>`
</script>

<style scoped>
.example-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.station-tab-stage {
  height: 360px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  overflow: hidden;
}

.station-tab-page {
  padding: 12px;
}

.station-tab-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.station-tab-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
