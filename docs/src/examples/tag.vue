<template>
  <div class="example-page">
    <demo-block
      title="12 种预设颜色"
      desc="primary / success / warning / danger / info（EP 语义色）+ purple / cyan / orange / pink / geekblue / magenta / lime（扩展色）"
      :code="code1"
      layout="column"
    >
      <div class="tag-row">
        <wd-tag type="primary">主蓝 primary</wd-tag>
        <wd-tag type="success">成功绿 success</wd-tag>
        <wd-tag type="warning">警告黄 warning</wd-tag>
        <wd-tag type="danger">危险红 danger</wd-tag>
        <wd-tag type="info">信息灰 info</wd-tag>
        <wd-tag type="purple">紫 purple</wd-tag>
      </div>
      <div class="tag-row">
        <wd-tag type="cyan">青 cyan</wd-tag>
        <wd-tag type="orange">橙 orange</wd-tag>
        <wd-tag type="pink">品红 pink</wd-tag>
        <wd-tag type="geekblue">靛蓝 geekblue</wd-tag>
        <wd-tag type="magenta">洋红 magenta</wd-tag>
        <wd-tag type="lime">黄绿 lime</wd-tag>
      </div>
    </demo-block>

    <demo-block
      title="三种 effect 风格"
      desc="light=浅色（默认）/ plain=朴素 / dark=深色；同色板在三种风格下自动派生"
      :code="code2"
      layout="row"
    >
      <wd-tag type="success" effect="light">浅色 light</wd-tag>
      <wd-tag type="success" effect="plain">朴素 plain</wd-tag>
      <wd-tag type="success" effect="dark">深色 dark</wd-tag>
      <wd-tag type="cyan" effect="light">浅色 light</wd-tag>
      <wd-tag type="cyan" effect="plain">朴素 plain</wd-tag>
      <wd-tag type="cyan" effect="dark">深色 dark</wd-tag>
    </demo-block>

    <demo-block
      title="auto 自动配色"
      desc="type=&quot;auto&quot;：语义关键词命中对应颜色（如「已完成」→绿、「失败」→红、「测试」→青）；未命中时对内容做稳定 hash——同一文本永远同一颜色"
      :code="code3"
      layout="column"
    >
      <div class="tag-row">
        <wd-tag type="auto">已完成</wd-tag>
        <wd-tag type="auto">部署失败</wd-tag>
        <wd-tag type="auto">待审核</wd-tag>
        <wd-tag type="auto">测试环境</wd-tag>
        <wd-tag type="auto">VIP 会员</wd-tag>
        <wd-tag type="auto">已归档</wd-tag>
        <wd-tag type="auto">促销</wd-tag>
        <wd-tag type="auto">新鲜直达</wd-tag>
      </div>
      <div class="tag-row">
        <span class="tag-label">稳定 hash（同文本刷新后颜色不变）：</span>
        <wd-tag type="auto">环境A</wd-tag>
        <wd-tag type="auto">环境B</wd-tag>
        <wd-tag type="auto">环境C</wd-tag>
        <wd-tag type="auto">环境D</wd-tag>
        <wd-tag type="auto">环境E</wd-tag>
      </div>
    </demo-block>

    <demo-block
      title="icon 与 tips"
      desc="提供 icon 后标签默认只显示该 icon；icon 颜色始终跟随标签文字色，因此与 type / effect / color / closable / round / size 等属性自由搭配时自动联动；同时提供 #default 插槽时，插槽内容转为悬停 tooltip 展示"
      :code="code4"
      layout="column"
    >
      <div class="tag-row">
        <span class="tag-label">基础：</span>
        <wd-tag icon="InfoFilled" type="primary" />
        <wd-tag icon="WarningFilled" type="auto" />
        <wd-tag icon="fa-solid fa-user" type="purple" />
        <wd-tag icon="InfoFilled" type="auto">这是 tips：服务运行正常</wd-tag>
        <wd-tag icon="WarningFilled" type="auto">这是 tips：存在异常告警</wd-tag>
      </div>
      <div class="tag-row">
        <span class="tag-label">搭配 effect：</span>
        <wd-tag icon="SuccessFilled" type="success" effect="light" />
        <wd-tag icon="SuccessFilled" type="success" effect="plain" />
        <wd-tag icon="SuccessFilled" type="success" effect="dark" />
        <wd-tag icon="CirclePlusFilled" type="geekblue" effect="dark">tip：dark 下图标为白色</wd-tag>
      </div>
      <div class="tag-row">
        <span class="tag-label">搭配透传能力：</span>
        <wd-tag icon="Plus" type="cyan" closable @close="onClose" />
        <wd-tag icon="CircleCheckFilled" type="success" round size="large" />
        <wd-tag icon="PriceTag" color="#7c3aed" />
        <wd-tag icon="BellFilled" type="warning" effect="plain" closable>tip：库存告警检查中</wd-tag>
      </div>
    </demo-block>

    <demo-block
      title="el-tag 能力透传"
      desc="继承 el-tag 全部能力：closable / round / size / 自定义 color 等"
      :code="code5"
      layout="row"
    >
      <wd-tag closable @close="onClose">可关闭标签</wd-tag>
      <wd-tag type="geekblue" round size="large">圆角大号</wd-tag>
      <wd-tag color="#7c3aed" effect="plain">自定义 color</wd-tag>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const code1 = `<wd-tag type="primary">主蓝 primary</wd-tag>
<wd-tag type="success">成功绿 success</wd-tag>
<wd-tag type="warning">警告黄 warning</wd-tag>
<wd-tag type="danger">危险红 danger</wd-tag>
<wd-tag type="info">信息灰 info</wd-tag>
<wd-tag type="purple">紫 purple</wd-tag>
<wd-tag type="cyan">青 cyan</wd-tag>
<wd-tag type="orange">橙 orange</wd-tag>
<wd-tag type="pink">品红 pink</wd-tag>
<wd-tag type="geekblue">靛蓝 geekblue</wd-tag>
<wd-tag type="magenta">洋红 magenta</wd-tag>
<wd-tag type="lime">黄绿 lime</wd-tag>`

const code2 = `<wd-tag type="success" effect="light">浅色 light</wd-tag>
<wd-tag type="success" effect="plain">朴素 plain</wd-tag>
<wd-tag type="success" effect="dark">深色 dark</wd-tag>`

const code3 = `<!-- 语义关键词命中：已完成→success / 部署失败→danger / 测试环境→cyan / 促销→magenta / 新鲜→lime -->
<wd-tag type="auto">已完成</wd-tag>
<wd-tag type="auto">部署失败</wd-tag>
<wd-tag type="auto">测试环境</wd-tag>
<wd-tag type="auto">促销</wd-tag>
<wd-tag type="auto">新鲜直达</wd-tag>

<!-- 未命中关键词：按内容稳定 hash 配色，同一文本永远同一颜色 -->
<wd-tag type="auto">环境A</wd-tag>
<wd-tag type="auto">环境B</wd-tag>`

const code4 = `<!-- 只显示 icon（颜色跟随标签色） -->
<wd-tag icon="InfoFilled" type="primary" />

<!-- icon + #default：插槽内容转为悬停 tooltip -->
<wd-tag icon="InfoFilled" type="auto">这是 tips：服务运行正常</wd-tag>

<!-- icon 与其他属性搭配：icon 颜色跟随标签文字色，全部自动联动 -->
<wd-tag icon="SuccessFilled" type="success" effect="dark" />
<wd-tag icon="Plus" type="cyan" closable @close="onClose" />
<wd-tag icon="CircleCheckFilled" type="success" round size="large" />
<wd-tag icon="PriceTag" color="#7c3aed" />
<wd-tag icon="BellFilled" type="warning" effect="plain" closable>tip：库存告警检查中</wd-tag>`

const code5 = `<wd-tag closable @close="onClose">可关闭标签</wd-tag>
<wd-tag type="geekblue" round size="large">圆角大号</wd-tag>
<wd-tag color="#7c3aed" effect="plain">自定义 color</wd-tag>`

function onClose() {
  ElMessage.info('标签已关闭')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}

.tag-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.tag-row:last-child {
  margin-bottom: 0;
}

.tag-label {
  font-size: 12px;
  color: var(--wd-text-color-secondary, #909399);
}
</style>
