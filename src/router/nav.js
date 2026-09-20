// 导航配置：PC 侧边栏 / Pad 图标条 / 手机底部 TabBar 共用
import {
  Camera,
  ChartColumn,
  Compass,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  Route,
  Settings,
  Star,
  Wallet,
} from 'lucide-vue-next'

export const NAV_ITEMS = [
  { path: '/', label: '首页', icon: LayoutDashboard },
  { path: '/trips', label: '行程计划', icon: Route },
  { path: '/destinations', label: '目的地库', icon: Compass },
  { path: '/budget', label: '预算管理', icon: Wallet },
  { path: '/packing', label: '旅行清单', icon: ListChecks },
  { path: '/memories', label: '回忆相册', icon: Camera },
  { path: '/map', label: '足迹地图', icon: MapPinned },
  { path: '/stats', label: '数据统计', icon: ChartColumn },
  { path: '/wishlist', label: '愿望清单', icon: Star },
  { path: '/settings', label: '设置中心', icon: Settings },
]

// 手机 TabBar：4 个高频入口 + 「更多」
export const TAB_ITEMS = [
  { path: '/', label: '首页', icon: LayoutDashboard },
  { path: '/trips', label: '行程', icon: Route },
  { path: '/memories', label: '相册', icon: Camera },
  { path: '/stats', label: '统计', icon: ChartColumn },
]

/** 判断某导航项是否处于激活状态（行程详情页也点亮「行程计划」） */
export function isNavActive(currentPath, itemPath) {
  if (itemPath === '/') return currentPath === '/'
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/')
}
