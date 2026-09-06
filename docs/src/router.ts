import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ComponentDocView from './views/ComponentDocView.vue'
import PlaygroundView from './views/PlaygroundView.vue'
import LinkageView from './views/LinkageView.vue'

const scenarioRoutes = [
  { path: 'pagination', name: 'S1Pagination', label: '分页数据展示' },
  { path: 'data-maintain', name: 'S2DataMaintain', label: '数据维护表单' },
  { path: 'detail', name: 'S3DetailView', label: '详情查看' },
  { path: 'tree', name: 'S4TreeData', label: '树形数据' },
  { path: 'batch', name: 'S5BatchOps', label: '批量操作' },
  { path: 'selector', name: 'S6DialogSelector', label: '弹窗选择器' },
  { path: 'import-export', name: 'S7ImportExport', label: '数据导入导出' }
]

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/components/:path', name: 'ComponentDoc', component: ComponentDocView },
  { path: '/playground', name: 'Playground', component: PlaygroundView },
  { path: '/linkage', name: 'Linkage', component: LinkageView },
  ...scenarioRoutes.map((s) => ({
    path: `/scenarios/${s.path}`,
    name: s.name,
    component: () => import(`./views/scenarios/${s.name}.vue`)
  })),
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})

export { scenarioRoutes }
