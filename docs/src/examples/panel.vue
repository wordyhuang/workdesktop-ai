<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="带标题/描述的面板，作为表单分组与详情分区容器；标题左侧带品牌色标识条，悬停呈现浮起阴影"
      :code="code1"
    >
      <wd-panel title="基本信息" description="用户基础资料">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">张三</el-descriptions-item>
          <el-descriptions-item label="部门">技术部</el-descriptions-item>
          <el-descriptions-item label="邮箱">zhangsan@example.com</el-descriptions-item>
        </el-descriptions>
      </wd-panel>

      <wd-panel title="自定义插槽" description="title 与 footer 插槽">
        <template #title>
          <span style="color: #409eff">自定义标题</span>
          <el-tag size="small" style="margin-left: 8px">标签</el-tag>
        </template>
        <p>面板主体内容。</p>
        <template #footer>
          <el-button size="small" type="primary">操作按钮</el-button>
        </template>
      </wd-panel>
    </demo-block>

    <demo-block
      title="作为容器"
      desc="Panel 作为表单分组容器：把一组相关表单项收进一个分区，footer 统一放置表单操作按钮"
      :code="code4"
    >
      <wd-panel title="基本信息" description="表单分组容器">
        <el-form label-width="80px">
          <el-form-item label="姓名">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="部门">
            <el-select v-model="form.dept" placeholder="请选择部门" style="width: 100%">
              <el-option label="技术部" value="tech" />
              <el-option label="产品部" value="product" />
            </el-select>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button size="small">取消</el-button>
          <el-button size="small" type="primary">保存</el-button>
        </template>
      </wd-panel>
    </demo-block>

    <demo-block
      title="可折叠"
      desc="collapsible 开启折叠，点击标题或箭头收起/展开，支持 v-model:opened 受控与 change 事件"
      :code="code2"
    >
      <wd-panel
        v-model:opened="opened"
        collapsible
        title="可折叠面板"
        description="点击标题区域切换"
        @change="onChange"
      >
        <p>折叠时主体与底部一并隐藏，展开时带有平滑的高度过渡动画。</p>
        <template #footer>
          <el-button size="small" type="primary">保存</el-button>
        </template>
      </wd-panel>
    </demo-block>

    <demo-block
      title="右侧操作区与阴影"
      desc="extra 插槽放置标题右侧操作；shadow 支持 always / hover（默认）/ never"
      :code="code3"
    >
      <wd-panel title="常驻阴影" shadow="always">
        <template #extra>
          <el-button link type="primary" size="small">刷新</el-button>
          <el-button link type="primary" size="small">更多</el-button>
        </template>
        <p>shadow="always" 时常驻轻阴影，适合需要突出的核心分区。</p>
      </wd-panel>

      <wd-panel title="无阴影" shadow="never" style="margin-bottom: 0">
        <p>shadow="never" 时仅保留描边，适合密集排列的次级分区。</p>
      </wd-panel>
    </demo-block>

    <demo-block
      title="边框与标题"
      desc="border 控制是否显示外边框（默认 true）；标题栏根据是否传入 title（或 title 插槽）自动添加，不传则不渲染标题区"
      :code="code5"
    >
      <wd-panel title="带边框（默认）" description="border=true">
        <p>默认带 1px 描边，适合独立分区。</p>
      </wd-panel>

      <div class="demo-gray-bg">
        <wd-panel :border="false" shadow="never" title="无边框" description="border=false" style="margin-bottom: 0">
          <p>去掉描边，适合嵌在已有容器（卡片 / 弹层 / 灰色底区块）内。</p>
        </wd-panel>
      </div>

      <wd-panel style="margin-bottom: 0">
        <p>不传 title（也不使用 title 插槽）时不渲染标题栏，主体直接从面板边缘开始。</p>
      </wd-panel>
    </demo-block>

    <demo-block
      title="描述折叠展示"
      desc="descriptionExpandable 控制描述展示：默认显示展示（描述直接显示在标题旁）；设为 true 时标题下出现虚线，鼠标悬停标题才以淡入动效显示描述"
      :code="code6"
    >
      <wd-panel title="显示展示（默认）" description="description 直接显示在标题旁">
        <p>descriptionExpandable 未设（false）：描述常驻显示，保持默认表现。</p>
      </wd-panel>

      <wd-panel
        title="折叠展示"
        description="鼠标悬停标题才显示这段描述"
        description-expandable
        style="margin-bottom: 0"
      >
        <p>descriptionExpandable=true：描述默认隐藏，标题下出现虚线下划线，鼠标移到标题上时才显示描述。</p>
      </wd-panel>
    </demo-block>

    <demo-block
      title="描述对齐方式"
      desc="descriptionAlign 控制 description 对齐：默认 left 紧跟标题；right 时贴到面板头部右端。card 模式下 left=描述换行显示在标题下方，right=描述与标题同行、垂直居中"
      :code="code8"
    >
      <wd-panel title="居左（默认）" description="紧跟标题显示">
        <p>descriptionAlign 未设（left）：描述紧跟标题，保持默认表现。</p>
      </wd-panel>

      <wd-panel
        title="居右"
        description="贴到面板头部右端"
        description-align="right"
        style="margin-bottom: 0"
      >
        <p>descriptionAlign="right"：描述吸收标题右侧剩余空白，贴到面板右端。</p>
      </wd-panel>

      <wd-panel
        mode="card"
        title="卡片 · 左侧对齐"
        description="card 模式下描述换行显示在标题下方"
        description-align="left"
        style="margin-bottom: 0"
      >
        <p>card + left：描述独占一行，显示在标题下方。</p>
      </wd-panel>

      <wd-panel
        mode="card"
        title="卡片 · 右侧对齐"
        description="card 模式下与标题同行、垂直居中"
        description-align="right"
        style="margin-bottom: 0"
      >
        <p>card + right：描述不换行，与标题同行贴右端并垂直居中。</p>
      </wd-panel>
    </demo-block>

    <demo-block
      title="标题图标"
      desc="icon 设置标题图标：支持 EP 图标名、图标字体 class、直接传组件三种形态；设置后标题前显示图标，左侧品牌色标识条自动隐藏"
      :code="code9"
    >
      <wd-panel title="EP 图标名" description="icon='Setting'" icon="Setting">
        <p>icon 传 @element-plus/icons-vue 的图标名字符串（如 Setting），组件查表解析渲染。</p>
      </wd-panel>

      <wd-panel
        title="直接传组件"
        description="icon 也可传组件或图标字体 class"
        :icon="User"
        style="margin-bottom: 0"
      >
        <p>icon 支持直接传图标组件；图标字体 class（如 'fa-solid fa-user'）同样支持。</p>
      </wd-panel>
    </demo-block>

    <demo-block
      title="标识条形态"
      desc="titleBar 控制标题左侧品牌色竖条高度：long 与头部同高、贴边（默认）；short 与标题行同高、顶部对齐标题行且与边框留有间距，描述换行显示在标题下方"
      :code="code11"
    >
      <wd-panel title="长条（默认）" description="与头部同高">
        <p>titleBar 未设（long）：竖条与头部同高，保持默认表现。</p>
      </wd-panel>

      <wd-panel title="短条" description="与标题行同高" title-bar="short" style="margin-bottom: 0">
        <p>titleBar="short"：竖条与标题行同高、顶部对齐标题行、与边框留有间距；描述换行显示在标题下方。</p>
      </wd-panel>
    </demo-block>

    <demo-block
      title="卡片模式"
      desc="mode='card' 切换为信息卡片：白底大圆角、头部整体带浅色背景、description 显示在标题下方；配合 flex 容器可一行并行多卡"
      :code="code10"
    >
      <div class="demo-card-row">
        <wd-panel mode="card" title="账号信息" description="用户基础资料">
          <template #extra>
            <el-button link type="primary" size="small">编辑资料</el-button>
          </template>
          <p>姓名：张三</p>
          <p>部门：技术部</p>
        </wd-panel>

        <wd-panel mode="card" title="通知设置" description="选择你希望接收的通知方式和内容">
          <p>任务变更通知：已开启</p>
          <p>项目动态通知：已开启</p>
        </wd-panel>
      </div>
    </demo-block>

    <demo-block
      title="卡片模式 · 描述右对齐"
      desc="card 模式下 description-align='right'：描述不换行、与标题同行并垂直居中，贴到卡片头部右端；配合 flex 容器多卡并行时各自的描述右对齐"
      :code="code12"
    >
      <div class="demo-card-row">
        <wd-panel mode="card" title="账号信息" description="用户基础资料" description-align="right">
          <p>姓名：张三</p>
          <p>部门：技术部</p>
        </wd-panel>

        <wd-panel mode="card" title="月度销售" description="数据截至今日" description-align="right">
          <p>累计 $128,400</p>
          <p>环比 +12.6%</p>
        </wd-panel>
      </div>
    </demo-block>

    <demo-block
      title="内容超限自动折叠"
      desc="collapseHeight 指定内容高度阈值（px）：开启 collapsible 且内容实际高度超过该值时，渲染完成后自动收起，可点击标题重新展开；默认 0 表示不折叠、完全撑开"
      :code="code7"
    >
      <wd-panel
        title="自动折叠面板"
        description="内容超过 80px，渲染完成后自动收起"
        collapsible
        :collapse-height="80"
      >
        <p v-for="i in 6" :key="i">第 {{ i }} 行内容，用于撑高面板验证超限自动折叠。</p>
      </wd-panel>

      <wd-panel
        title="未超限面板（保持展开）"
        description="内容未超过 80px，保持展开"
        collapsible
        :collapse-height="80"
        style="margin-bottom: 0"
      >
        <p>内容不足阈值时不会被折叠。</p>
      </wd-panel>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'

const code1 = `<wd-panel title="基本信息" description="用户基础资料">
  <el-descriptions :column="2" border>
    <el-descriptions-item label="姓名">张三</el-descriptions-item>
  </el-descriptions>
</wd-panel>`

const code2 = `<wd-panel v-model:opened="opened" collapsible title="可折叠面板" description="点击标题区域切换">
  <p>主体内容</p>
</wd-panel>`

const code3 = `<wd-panel title="常驻阴影" shadow="always">
  <template #extra>
    <el-button link type="primary" size="small">刷新</el-button>
  </template>
  <p>主体内容</p>
</wd-panel>`

const code4 = `<wd-panel title="基本信息" description="表单分组容器">
  <el-form label-width="80px">
    <el-form-item label="姓名">
      <el-input v-model="form.name" placeholder="请输入姓名" />
    </el-form-item>
    <el-form-item label="部门">
      <el-select v-model="form.dept" placeholder="请选择部门" style="width: 100%">
        <el-option label="技术部" value="tech" />
        <el-option label="产品部" value="product" />
      </el-select>
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model="form.email" placeholder="请输入邮箱" />
    </el-form-item>
  </el-form>
  <template #footer>
    <el-button size="small">取消</el-button>
    <el-button size="small" type="primary">保存</el-button>
  </template>
</wd-panel>`

const code5 = `<!-- 默认带边框 -->
<wd-panel title="带边框（默认）" description="border=true">
  <p>默认带 1px 描边，适合独立分区。</p>
</wd-panel>

<!-- 无边框：适合嵌在已有容器内，建议搭配 shadow="never" -->
<wd-panel :border="false" shadow="never" title="无边框" description="border=false">
  <p>去掉描边，适合嵌在卡片 / 弹层 / 灰色底区块内。</p>
</wd-panel>

<!-- 不传 title：不渲染标题栏 -->
<wd-panel>
  <p>不传 title（也不使用 title 插槽）时不渲染标题栏。</p>
</wd-panel>`

const code6 = `<!-- 默认：描述直接显示 -->
<wd-panel title="显示展示（默认）" description="description 直接显示在标题旁">
  <p>主体内容</p>
</wd-panel>

<!-- 折叠展示：标题下虚线，悬停标题才显示 -->
<wd-panel title="折叠展示" description="鼠标悬停标题才显示这段描述" description-expandable>
  <p>主体内容</p>
</wd-panel>`

const code7 = `<!-- collapsible 开启且内容实际高度超过 80px 时，渲染完成后自动收起；可点击标题重新展开 -->
<wd-panel title="自动折叠面板" collapsible :collapse-height="80">
  <p v-for="i in 6" :key="i">第 {{ i }} 行内容</p>
</wd-panel>

<!-- 内容不足阈值：保持展开 -->
<wd-panel title="未超限面板" collapsible :collapse-height="80">
  <p>内容不足阈值时不会被折叠。</p>
</wd-panel>`

const code8 = `<!-- 默认 left：描述紧跟标题 -->
<wd-panel title="居左（默认）" description="紧跟标题显示">
  <p>主体内容</p>
</wd-panel>

<!-- right：描述吸收剩余空白，贴到面板头部右端 -->
<wd-panel title="居右" description="贴到面板头部右端" description-align="right">
  <p>主体内容</p>
</wd-panel>

<!-- card 模式：left=描述换行显示在标题下方 -->
<wd-panel mode="card" title="卡片 · 左侧对齐" description="描述换行显示在标题下方" description-align="left">
  <p>主体内容</p>
</wd-panel>

<!-- card 模式：right=描述与标题同行、垂直居中 -->
<wd-panel mode="card" title="卡片 · 右侧对齐" description="与标题同行、垂直居中" description-align="right">
  <p>主体内容</p>
</wd-panel>`

const code9 = `<!-- EP 图标名：@element-plus/icons-vue 组件名字符串，组件查表解析 -->
<wd-panel title="EP 图标名" icon="Setting">
  <p>标题前显示图标，左侧品牌色标识条自动隐藏。</p>
</wd-panel>

<!-- 直接传组件；也支持图标字体 class（如 icon="fa-solid fa-user"，需自行引入对应字体 CSS） -->
<wd-panel title="直接传组件" :icon="User">
  <p>icon 三种形态：EP 图标名 / 图标字体 class / 组件对象。</p>
</wd-panel>`

const code10 = `<!-- card 模式：白底大圆角、头部整体带浅色背景、description 显示在标题下方 -->
<!-- 外层用 flex 容器（gap 控制间距）即可一行并行多个卡片 -->
<div style="display: flex; gap: 12px">
  <wd-panel mode="card" title="账号信息" description="用户基础资料">
    <template #extra>
      <el-button link type="primary" size="small">编辑资料</el-button>
    </template>
    <p>卡片主体内容。</p>
  </wd-panel>

  <wd-panel mode="card" title="通知设置" description="选择你希望接收的通知方式和内容">
    <p>卡片主体内容。</p>
  </wd-panel>
</div>`

const code12 = `<!-- card 模式 + description-align="right"：描述不换行，与标题同行垂直居中，贴到卡片头部右端 -->
<!-- 配合 flex 容器（gap 控制间距）一行并行多卡，各自的描述右对齐 -->
<div style="display: flex; gap: 12px">
  <wd-panel mode="card" title="账号信息" description="用户基础资料" description-align="right">
    <p>卡片主体内容。</p>
  </wd-panel>

  <wd-panel mode="card" title="月度销售" description="数据截至今日" description-align="right">
    <p>卡片主体内容。</p>
  </wd-panel>
</div>`

const code11 = `<!-- 默认 long：竖条与头部同高 -->
<wd-panel title="长条（默认）" description="与头部同高">
  <p>主体内容</p>
</wd-panel>

<!-- short：竖条与标题行同高、顶部对齐标题行且与边框留有间距，描述换行显示在标题下方 -->
<wd-panel title="短条" description="与标题行同高" title-bar="short">
  <p>主体内容</p>
</wd-panel>`

const form = reactive({ name: '', dept: '', email: '' })

const opened = ref(true)

function onChange(v: boolean) {
  ElMessage.info(v ? '面板已展开' : '面板已收起')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
.demo-gray-bg {
  background: var(--wd-bg-color-page, #f5f7fa);
  padding: 12px;
  margin-bottom: 12px;
  border-radius: var(--wd-radius-base, 4px);
}
.demo-card-row {
  display: flex;
  gap: 12px;
}
.demo-card-row .wd-panel {
  margin-bottom: 0;
}
.example-page p {
  margin: 0;
  color: var(--wd-text-color-regular, #606266);
  font-size: var(--wd-font-size-base, 14px);
  line-height: 22px;
}
</style>
