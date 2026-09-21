import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, EffectScatterChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  GeoComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import App from './App.vue'
import router from './router'
import { initStores } from './stores'
import './style.css'

// 按需注册 ECharts 能力（体积更小）
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  EffectScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GeoComponent,
])

const app = createApp(App)
app.use(createPinia())
app.use(router)
// 图表组件全局可用：autoresize 内部基于 ResizeObserver，容器变化自动重绘
app.component('VChart', VChart)

// 本地数据初始化完成后再挂载，避免首屏闪烁
initStores()
  .catch((e) => console.error('[init] 本地数据初始化失败', e))
  .finally(() => {
    // 手机分享面板（Android PWA share_target）会把文案放在 search 参数上：
    // 暂存后跳到愿望清单的导入抽屉，并清掉 URL 参数防止刷新重复弹出
    const params = new URLSearchParams(window.location.search)
    const shared = params.get('text') || params.get('share') || params.get('title') || ''
    if (shared) {
      sessionStorage.setItem('shared-text', shared)
      const url = new URL(window.location.href)
      ;['text', 'share', 'title', 'url'].forEach((k) => url.searchParams.delete(k))
      window.history.replaceState(null, '', url)
      router.replace('/wishlist')
    }
    app.mount('#app')
    document.getElementById('boot-splash')?.remove()
  })
