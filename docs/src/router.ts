import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ComponentDocView from './views/ComponentDocView.vue'
import PlaygroundView from './views/PlaygroundView.vue'
import LinkageView from './views/LinkageView.vue'
import GlobalStyleView from './views/GlobalStyleView.vue'
import ScenarioGuideView from './views/ScenarioGuideView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/components/:path', name: 'ComponentDoc', component: ComponentDocView },
  { path: '/playground', name: 'Playground', component: PlaygroundView },
  { path: '/linkage', name: 'Linkage', component: LinkageView },
  { path: '/theme', name: 'GlobalStyle', component: GlobalStyleView },
  { path: '/scenario-guide', name: 'ScenarioGuide', component: ScenarioGuideView },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
