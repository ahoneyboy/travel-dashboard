import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages 项目页部署在 <user>.github.io/<repo>/ 子路径下：
// 生产构建使用仓库同名子路径，本地 dev / preview 保持在根路径
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/travel-dashboard/' : '/',
  plugins: [vue()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // echarts 体积大，单独分包利于缓存
        manualChunks: { echarts: ['echarts', 'vue-echarts'] },
      },
    },
  },
}))
