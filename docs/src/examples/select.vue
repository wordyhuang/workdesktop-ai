<template>
  <div class="example-page">
    <demo-block title="API 加载选项" desc="api 自动加载，active 控制是否挂载即请求" :code="code1" layout="row">
      <wd-select api="/options/roles" placeholder="请选择角色" style="width: 220px" />
    </demo-block>

    <demo-block
      title="静态选项 + 前后追加"
      desc="dataSource 静态数据，addData/appendData 固定插入首尾"
      :code="code2"
      layout="row"
    >
      <wd-select
        :data-source="options"
        :add-data="[{ value: 0, text: '全部角色' }]"
        placeholder="选择角色"
        style="width: 220px"
      />
      <wd-select
        :data-source="options"
        multiple
        collapse-tags
        placeholder="多选角色"
        style="width: 280px"
      />
    </demo-block>

    <demo-block title="远程搜索" desc="remote 开启远程搜索，关键字通过 keyword-key 字段提交" :code="code3">
      <wd-select
        api="/user/list"
        remote
        filterable
        value-prop="id"
        text-prop="name"
        keyword-key="name"
        placeholder="输入姓名远程搜索"
        style="width: 280px"
      >
        <template #default="{ option }">
          <div class="remote-option">
            <span>{{ option.name }}</span>
            <span class="remote-option__sub">{{ option.dept }} · {{ option.email }}</span>
          </div>
        </template>
      </wd-select>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
const code1 = `<wd-select api="/options/roles" placeholder="请选择角色" />`
const code2 = `<wd-select :data-source="options"
  :add-data="[{ value: 0, text: '全部角色' }]" />`
const code3 = `<wd-select api="/user/list" remote filterable
  value-prop="id" text-prop="name"
  keyword-key="name" placeholder="输入姓名远程搜索" />`

const options = [
  { value: 1, text: '管理员' },
  { value: 2, text: '编辑' },
  { value: 3, text: '访客' }
]
</script>

<style scoped>
.example-page {
  width: 100%;
}
.remote-option {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.remote-option__sub {
  color: #909399;
  font-size: 12px;
}
</style>
