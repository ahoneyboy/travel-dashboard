// 设置 store：个人资料 + 数据导出/导入/清空（聚合所有模块）
import { defineStore } from 'pinia'
import { usePersisted } from './persist'
import { DB_KEYS } from '../utils/storage'

export const DEFAULT_SETTINGS = {
  nickname: '旅行者',
  tag: '旅行探索者',
  avatar: '',
  bio: '',
}

export const useSettingsStore = defineStore('settings', () => {
  const { data: settings, load, replaceAll } = usePersisted(DB_KEYS.settings, { ...DEFAULT_SETTINGS })

  async function loadProfile() {
    await load()
    // 补齐可能缺失的字段
    Object.keys(DEFAULT_SETTINGS).forEach((k) => {
      if (settings.value[k] === undefined) settings.value[k] = DEFAULT_SETTINGS[k]
    })
  }

  function updateProfile(patch) {
    Object.assign(settings.value, patch)
  }

  return { settings, load: loadProfile, replaceAll, updateProfile }
})
