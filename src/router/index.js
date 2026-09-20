import { createRouter, createWebHashHistory } from 'vue-router'
// 页面组件体量小，直接同步引入：切换零延迟，也避免 dev 下 chunk 首载闪烁
import DashboardView from '../views/DashboardView.vue'
import TripsView from '../views/TripsView.vue'
import TripDetailView from '../views/TripDetailView.vue'
import DestinationsView from '../views/DestinationsView.vue'
import BudgetView from '../views/BudgetView.vue'
import PackingView from '../views/PackingView.vue'
import MemoriesView from '../views/MemoriesView.vue'
import MapView from '../views/MapView.vue'
import StatsView from '../views/StatsView.vue'
import WishlistView from '../views/WishlistView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  { path: '/', name: 'dashboard', component: DashboardView, meta: { title: '首页概览' } },
  { path: '/trips', name: 'trips', component: TripsView, meta: { title: '行程计划' } },
  { path: '/trips/:id', name: 'trip-detail', component: TripDetailView, meta: { title: '行程详情' } },
  { path: '/destinations', name: 'destinations', component: DestinationsView, meta: { title: '目的地库' } },
  { path: '/budget', name: 'budget', component: BudgetView, meta: { title: '预算管理' } },
  { path: '/packing', name: 'packing', component: PackingView, meta: { title: '旅行清单' } },
  { path: '/memories', name: 'memories', component: MemoriesView, meta: { title: '回忆相册' } },
  { path: '/map', name: 'map', component: MapView, meta: { title: '足迹地图' } },
  { path: '/stats', name: 'stats', component: StatsView, meta: { title: '数据统计' } },
  { path: '/wishlist', name: 'wishlist', component: WishlistView, meta: { title: '愿望清单' } },
  { path: '/settings', name: 'settings', component: SettingsView, meta: { title: '设置中心' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  // hash 路由：GitHub Pages 为纯静态托管，history 模式刷新深链接会 404
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 旅行规划与回忆工作台` : '旅行规划与回忆工作台'
})

export default router
