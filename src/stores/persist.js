// 持久化基础件：一个响应式 ref + IndexedDB 自动读写
// - load()：启动时从本地读一次
// - 之后任何变更（深层）都会防抖写回 IndexedDB
import { ref, watch } from 'vue'
import { dbGet, dbSet } from '../utils/storage'

export function usePersisted(key, fallback) {
  const data = ref(fallback)
  let loaded = false
  let timer = null

  /** 从 IndexedDB 加载（仅应用启动时调用一次） */
  async function load() {
    const saved = await dbGet(key)
    if (saved !== null && saved !== undefined) data.value = saved
    loaded = true
  }

  // 变更防抖落盘；克隆一份避免存入响应式代理
  watch(
    data,
    (v) => {
      if (!loaded) return
      clearTimeout(timer)
      timer = setTimeout(() => dbSet(key, JSON.parse(JSON.stringify(v))), 250)
    },
    { deep: true }
  )

  /** 整体替换（导入数据 / 灌入种子数据时用） */
  function replaceAll(next) {
    data.value = next
    if (loaded) dbSet(key, JSON.parse(JSON.stringify(next)))
  }

  return { data, load, replaceAll }
}
