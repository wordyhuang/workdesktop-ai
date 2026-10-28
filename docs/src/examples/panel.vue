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
      desc="descriptionAlign 控制 description 在标题右侧空白区的对齐：默认 left 紧跟标题；right 时吸收剩余空白贴到面板头部右端"
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
.example-page p {
  margin: 0;
  color: var(--wd-text-color-regular, #606266);
  font-size: var(--wd-font-size-base, 14px);
  line-height: 22px;
}
</style>
