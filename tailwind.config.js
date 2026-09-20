/** @type {import('tailwindcss').Config} */
// 设计系统：颜色 / 圆角 / 阴影统一收敛到这里，业务代码只用 Tailwind token
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        // 主色（绿）
        brand: {
          DEFAULT: '#4a9e6e',
          dark: '#3a8559',
          light: '#e7f3eb',
          soft: '#f2f6f3',
        },
        // 辅助色
        sky: '#5b8fd6',
        orange: '#e8935a',
        gold: '#e0a85a',
        grape: '#9b7ec4',
        rose: '#d67a9b',
        danger: '#e05a5a',
        // 中性色
        surface: '#f3f6f2',
        ink: '#2b3a32',
        muted: '#829189',
        line: '#e6ede7',
      },
      // 圆角统一 token：卡片 16px，侧栏/弹层 20px
      borderRadius: {
        card: '16px',
        shell: '20px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.03)',
        pop: '0 8px 32px rgba(20,40,30,0.16)',
      },
      // 侧边栏宽度（PC 232px / Pad 64px）收敛为 token
      spacing: {
        sidebar: '232px',
        rail: '64px',
        tabbar: '64px',
      },
      maxWidth: {
        page: '1240px',
      },
      fontFamily: {
        sans: [
          '"Noto Sans SC"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
