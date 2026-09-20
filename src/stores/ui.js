// 全局 UI 状态：Toast 提示 / 确认弹窗 / 移动端「更多」面板
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { uid } from '../utils/id'

export const useUiStore = defineStore('ui', () => {
  // ---- Toast ----
  const toasts = ref([])
  function toast(message, type = 'success') {
    const id = uid('toast')
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 2600)
  }

  // ---- 确认弹窗（Promise 风格）----
  const confirmState = ref({
    open: false,
    title: '',
    message: '',
    confirmText: '删除',
    danger: true,
    _resolve: null,
  })

  /** 用法：if (await ui.confirm({ title, message })) { ... } */
  function confirm({ title = '确认操作', message = '', confirmText = '删除', danger = true }) {
    return new Promise((resolve) => {
      confirmState.value = { open: true, title, message, confirmText, danger, _resolve: resolve }
    })
  }

  function resolveConfirm(val) {
    confirmState.value._resolve?.(val)
    confirmState.value.open = false
  }

  // ---- 移动端「更多」抽屉 ----
  const moreOpen = ref(false)

  return { toasts, toast, confirmState, confirm, resolveConfirm, moreOpen }
})
