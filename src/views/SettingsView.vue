<script setup>
// 设置中心：个人资料 + 数据导出/导入/清空 + 关于
import { ref } from 'vue'
import { DatabaseBackup, Download, Info, RotateCcw, Save, Upload, UserRound } from 'lucide-vue-next'
import PageHeader from '../components/ui/PageHeader.vue'
import ImageUploader from '../components/ui/ImageUploader.vue'
import { useSettingsStore } from '../stores/settings'
import { useUiStore } from '../stores/ui'
import { buildExportPayload, clearAllStores, importPayload } from '../stores'
import { fmtCN, today } from '../utils/date'
import { useTripsStore } from '../stores/trips'
import { useMemoriesStore } from '../stores/memories'
import { useDestinationsStore } from '../stores/destinations'

const settings = useSettingsStore()
const ui = useUiStore()
const trips = useTripsStore()
const memories = useMemoriesStore()
const destinations = useDestinationsStore()

const profile = ref({ ...settings.settings })

function saveProfile() {
  if (!profile.value.nickname.trim()) {
    ui.toast('昵称不能为空', 'error')
    return
  }
  settings.updateProfile({
    nickname: profile.value.nickname.trim(),
    tag: profile.value.tag.trim(),
    bio: profile.value.bio.trim(),
    avatar: profile.value.avatar,
  })
  ui.toast('个人资料已保存')
}

// ---- 数据管理 ----
function exportData() {
  const payload = buildExportPayload()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `travel-workbench-${today().replaceAll('-', '')}.json`
  a.click()
  URL.revokeObjectURL(url)
  ui.toast('已导出 JSON 文件')
}

const importInput = ref(null)
const importing = ref(false)

async function onImportFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  const ok = await ui.confirm({
    title: '导入数据',
    message: '导入会覆盖当前的全部数据（行程、回忆、设置等），确定继续吗？',
    confirmText: '覆盖导入',
    danger: true,
  })
  if (!ok) return
  importing.value = true
  try {
    const text = await file.text()
    await importPayload(text)
    profile.value = { ...settings.settings }
    ui.toast('数据导入成功')
  } catch (err) {
    ui.toast(err.message || '导入失败', 'error')
  } finally {
    importing.value = false
  }
}

async function clearAll() {
  const ok = await ui.confirm({
    title: '清空全部数据',
    message: '将删除本地保存的所有数据（行程、日程、回忆、清单等），\n此操作不可恢复，建议先导出备份。确定清空吗？',
    confirmText: '清空',
    danger: true,
  })
  if (!ok) return
  await clearAllStores()
  profile.value = { ...settings.settings }
  ui.toast('已清空全部数据')
}
</script>

<template>
  <div>
    <PageHeader title="设置中心" sub="个人资料与数据管理" />

    <div class="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
      <!-- 个人资料 -->
      <div class="card card-pad">
        <div class="mb-4 flex items-center gap-2">
          <UserRound class="h-4 w-4 text-brand" />
          <h3 class="text-base font-bold">个人资料</h3>
        </div>
        <form class="space-y-4" @submit.prevent="saveProfile">
          <div>
            <label class="field-label">头像</label>
            <ImageUploader v-model="profile.avatar" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">昵称 *</label>
              <input v-model="profile.nickname" class="input" placeholder="怎么称呼你" />
            </div>
            <div>
              <label class="field-label">标签</label>
              <input v-model="profile.tag" class="input" placeholder="如：旅行探索者" />
            </div>
          </div>
          <div>
            <label class="field-label">个性签名</label>
            <textarea v-model="profile.bio" rows="2" class="input resize-none" placeholder="一句话介绍自己"></textarea>
          </div>
          <button type="submit" class="btn-primary"><Save class="h-4 w-4" /> 保存资料</button>
        </form>
      </div>

      <div class="space-y-3.5">
        <!-- 数据管理 -->
        <div class="card card-pad">
          <div class="mb-4 flex items-center gap-2">
            <DatabaseBackup class="h-4 w-4 text-brand" />
            <h3 class="text-base font-bold">数据管理</h3>
          </div>
          <p class="mb-4 rounded-xl bg-brand-soft p-3 text-xs leading-relaxed text-[#4a5a52]">
            所有数据仅保存在本机浏览器的 IndexedDB 中。当前：
            <b>{{ trips.trips.length }}</b> 个行程 ·
            <b>{{ destinations.destinations.length }}</b> 个目的地 ·
            <b>{{ memories.memories.length }}</b> 张回忆照片。
            换设备或清理浏览器前，记得先导出备份。
          </p>
          <div class="flex flex-wrap gap-2.5">
            <button class="btn-ghost" @click="exportData">
              <Download class="h-4 w-4" /> 导出 JSON
            </button>
            <button class="btn-ghost" :disabled="importing" @click="importInput?.click()">
              <Upload class="h-4 w-4" /> {{ importing ? '导入中…' : '导入 JSON' }}
            </button>
            <button class="btn-ghost !border-[#f4c7c7] !text-danger hover:!bg-[#fdecec]" @click="clearAll">
              <RotateCcw class="h-4 w-4" /> 清空数据
            </button>
            <input ref="importInput" type="file" accept="application/json,.json" class="hidden" @change="onImportFile" />
          </div>
        </div>

        <!-- 关于 -->
        <div class="card card-pad">
          <div class="mb-3 flex items-center gap-2">
            <Info class="h-4 w-4 text-brand" />
            <h3 class="text-base font-bold">关于</h3>
          </div>
          <ul class="space-y-1.5 text-xs leading-relaxed text-muted">
            <li>· 旅行规划与回忆工作台 v1.0（{{ fmtCN(today()) }}）</li>
            <li>· 技术栈：Vue 3 · Vite · Tailwind CSS · Pinia · Vue Router · ECharts · localforage</li>
            <li>· 纯前端应用，无后端、无账号，数据 100% 存在本地</li>
            <li>· 照片上传后本地压缩（单张 ≤ 2MB），随数据一起导出</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
