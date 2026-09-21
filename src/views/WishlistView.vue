<script setup>
// 愿望清单：想去 / 已去 / 放弃 的状态流转 + CRUD + 分享文案粘贴导入
// 支持从手机分享面板 / iOS 快捷指令 / 手动粘贴三种方式带入文案，自动识别地点入库
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  CircleCheckBig,
  CircleX,
  ClipboardPaste,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-vue-next'
import PageHeader from '../components/ui/PageHeader.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import BaseDrawer from '../components/ui/BaseDrawer.vue'
import ImageUploader from '../components/ui/ImageUploader.vue'
import ShareImportDrawer from '../components/ShareImportDrawer.vue'
import { useWishlistStore, WISH_STATUS, WISH_STATUS_STYLE } from '../stores/wishlist'
import { useUiStore } from '../stores/ui'

const route = useRoute()
const wishlist = useWishlistStore()
const ui = useUiStore()

const filter = ref('all')
const drawerOpen = ref(false)
const editingId = ref(null)
const errors = ref({})
const form = ref({})

// 分享导入
const importOpen = ref(false)
const importText = ref('')

onMounted(() => {
  // 手机分享面板（Android PWA）会把文案放在页面 search 参数上
  const shared = sessionStorage.getItem('shared-text')
  // iOS 快捷指令走 hash 内 query：#/wishlist?share=xxx
  const fromQuery = route.query.share
  if (shared) {
    sessionStorage.removeItem('shared-text')
    importText.value = shared
    importOpen.value = true
  } else if (fromQuery) {
    importText.value = String(fromQuery)
    importOpen.value = true
  }
})

// 应用已打开时，快捷指令通过 hash 导航带入分享文案也能触发
watch(
  () => route.query.share,
  (v) => {
    if (v) {
      importText.value = String(v)
      importOpen.value = true
    }
  }
)

/** 批量导入（重名的自动跳过） */
function handleImport(items) {
  let added = 0
  items.forEach((it) => {
    if (wishlist.wishlist.some((w) => w.name === it.name)) return
    wishlist.addItem(it)
    added++
  })
  importOpen.value = false
  ui.toast(added ? `已导入 ${added} 个想去的地方` : '这些地方已经在愿望清单里啦', added ? 'success' : 'info')
}

const counts = computed(() => ({
  want: wishlist.wishlist.filter((w) => w.status === 'want').length,
  done: wishlist.wishlist.filter((w) => w.status === 'done').length,
  dropped: wishlist.wishlist.filter((w) => w.status === 'dropped').length,
}))

const filtered = computed(() =>
  filter.value === 'all' ? wishlist.wishlist : wishlist.wishlist.filter((w) => w.status === filter.value)
)

function openCreate() {
  editingId.value = null
  form.value = { name: '', location: '', bestSeason: '', status: 'want', imageUrl: '', note: '' }
  errors.value = {}
  drawerOpen.value = true
}
function openEdit(w) {
  editingId.value = w.id
  form.value = { ...w }
  errors.value = {}
  drawerOpen.value = true
}

function save() {
  errors.value.name = form.value.name.trim() ? '' : '请输入愿望名称'
  if (errors.value.name) return
  const payload = { ...form.value, name: form.value.name.trim(), location: form.value.location.trim() }
  if (editingId.value) {
    wishlist.updateItem(editingId.value, payload)
    ui.toast('愿望已更新')
  } else {
    wishlist.addItem(payload)
    ui.toast('愿望已加入清单')
  }
  drawerOpen.value = false
}

async function remove(w) {
  const ok = await ui.confirm({ title: '删除愿望', message: `确定删除「${w.name}」吗？` })
  if (ok) {
    wishlist.removeItem(w.id)
    ui.toast('已删除')
  }
}

// 状态快捷切换
function setStatus(w, status) {
  wishlist.updateItem(w.id, { status })
  const label = WISH_STATUS.find((s) => s.value === status)?.label
  ui.toast(status === 'done' ? `恭喜，「${w.name}」已打卡` : `已标记为「${label}」`)
}
</script>

<template>
  <div>
    <PageHeader title="愿望清单" sub="想去的地方，终会抵达">
      <button class="btn-ghost" @click="importOpen = true">
        <ClipboardPaste class="h-4 w-4" /> 粘贴导入
      </button>
      <button class="btn-primary" @click="openCreate"><Plus class="h-4 w-4" /> 新增愿望</button>
    </PageHeader>

    <!-- 状态筛选（带计数） -->
    <div class="scroll-x mb-4 flex gap-2">
      <button class="chip" :class="filter === 'all' && 'chip-active'" @click="filter = 'all'">
        全部 {{ wishlist.wishlist.length }}
      </button>
      <button
        v-for="s in WISH_STATUS"
        :key="s.value"
        class="chip"
        :class="filter === s.value && 'chip-active'"
        @click="filter = s.value"
      >
        {{ s.label }} {{ counts[s.value] }}
      </button>
    </div>

    <div v-if="filtered.length" class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="w in filtered" :key="w.id" class="card row-hover overflow-hidden">
        <div class="relative h-32">
          <img v-if="w.imageUrl" :src="w.imageUrl" :alt="w.name" class="h-full w-full object-cover" />
          <div v-else class="flex h-full items-center justify-center bg-gradient-to-br from-brand-light to-[#f0eaf8]">
            <Sparkles class="h-7 w-7 text-brand/60" />
          </div>
          <div class="absolute left-3 top-3 flex gap-1.5">
            <span
              class="rounded-full px-2.5 py-1 text-xs font-bold"
              :class="WISH_STATUS_STYLE[w.status]"
            >
              {{ WISH_STATUS.find((s) => s.value === w.status)?.label }}
            </span>
            <span v-if="w.level" class="rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
              {{ w.level }}
            </span>
          </div>
          <div class="absolute right-2 top-2 flex gap-1">
            <button class="btn-icon !h-8 !w-8 bg-white/90" title="编辑" @click="openEdit(w)">
              <Pencil class="h-3.5 w-3.5" />
            </button>
            <button class="btn-icon-danger !h-8 !w-8 bg-white/90" title="删除" @click="remove(w)">
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div class="p-4">
          <b class="text-base">{{ w.name }}</b>
          <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span v-if="w.location" class="flex items-center gap-1">
              <MapPin class="h-3.5 w-3.5" /> {{ w.location }}
            </span>
            <span v-if="w.bestSeason" class="flex items-center gap-1">
              <Sun class="h-3.5 w-3.5" /> 最佳 {{ w.bestSeason }}
            </span>
          </div>
          <p v-if="w.note" class="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{{ w.note }}</p>
          <!-- 状态流转 -->
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-if="w.status !== 'done'"
              class="inline-flex min-h-8 items-center gap-1 rounded-full bg-brand-light px-3 text-xs font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white"
              @click="setStatus(w, 'done')"
            >
              <CircleCheckBig class="h-3.5 w-3.5" /> 标记已去
            </button>
            <button
              v-if="w.status !== 'want'"
              class="inline-flex min-h-8 items-center gap-1 rounded-full bg-[#f0f2f0] px-3 text-xs font-bold text-muted transition-colors hover:bg-brand-light hover:text-brand-dark"
              @click="setStatus(w, 'want')"
            >
              <RotateCcw class="h-3.5 w-3.5" /> 恢复想去
            </button>
            <button
              v-if="w.status === 'want'"
              class="inline-flex min-h-8 items-center gap-1 rounded-full bg-[#f0f2f0] px-3 text-xs font-bold text-muted transition-colors hover:bg-[#fdecec] hover:text-danger"
              @click="setStatus(w, 'dropped')"
            >
              <CircleX class="h-3.5 w-3.5" /> 放弃
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <EmptyState
        :icon="Sparkles"
        :title="filter !== 'all' ? '这个状态下还没有愿望' : '愿望清单还是空的'"
        :desc="filter !== 'all' ? '换个筛选看看' : '把心心念念的地方都写下来吧'"
        action-text="新增愿望"
        @action="openCreate"
      />
    </div>

    <BaseDrawer :open="drawerOpen" :title="editingId ? '编辑愿望' : '新增愿望'" @close="drawerOpen = false">
      <form v-if="drawerOpen" class="space-y-4" @submit.prevent="save">
        <div>
          <label class="field-label">愿望名称 *</label>
          <input v-model="form.name" class="input" placeholder="如：新西兰 · 皇后镇" />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label">位置</label>
            <input v-model="form.location" class="input" placeholder="如：新西兰" />
          </div>
          <div>
            <label class="field-label">最佳旅行时间</label>
            <input v-model="form.bestSeason" class="input" placeholder="如：9-11月" />
          </div>
        </div>
        <div>
          <label class="field-label">状态</label>
          <select v-model="form.status" class="input">
            <option v-for="s in WISH_STATUS" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">图片</label>
          <ImageUploader v-model="form.imageUrl" />
        </div>
        <div>
          <label class="field-label">备注</label>
          <textarea v-model="form.note" rows="2" class="input resize-none" placeholder="为什么想去、想做什么…"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3 pt-1">
          <button type="button" class="btn-ghost" @click="drawerOpen = false">取消</button>
          <button type="submit" class="btn-primary">{{ editingId ? '保存' : '添加' }}</button>
        </div>
      </form>
    </BaseDrawer>

    <!-- 分享文案粘贴导入 -->
    <ShareImportDrawer
      :open="importOpen"
      :initial-text="importText"
      @close="importOpen = false"
      @import="handleImport"
    />
  </div>
</template>
