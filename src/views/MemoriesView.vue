<script setup>
// 回忆相册：按行程分组的照片墙 + 批量上传 + 大图灯箱
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Camera, Trash2, Upload } from 'lucide-vue-next'
import PageHeader from '../components/ui/PageHeader.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import BaseDrawer from '../components/ui/BaseDrawer.vue'
import MemoryLightbox from '../components/MemoryLightbox.vue'
import { useMemoriesStore } from '../stores/memories'
import { useTripsStore } from '../stores/trips'
import { useUiStore } from '../stores/ui'
import { compressImages } from '../utils/image'
import { fmtSlash, today } from '../utils/date'

const route = useRoute()
const memories = useMemoriesStore()
const trips = useTripsStore()
const ui = useUiStore()

// 按行程分组（未关联的放最后）
const groups = computed(() => {
  const list = memories.sorted
  const g = trips.sorted.map((t) => ({
    key: t.id,
    title: t.name,
    sub: `${fmtSlash(t.startDate)} – ${fmtSlash(t.endDate)}`,
    items: list.filter((m) => m.tripId === t.id),
  }))
  const orphans = list.filter((m) => !trips.byId(m.tripId))
  if (orphans.length) {
    g.push({ key: '_none', title: '未关联行程', sub: '可以在上传时选择所属行程', items: orphans })
  }
  return g.filter((x) => x.items.length)
})

// 展开后的扁平列表（灯箱导航用）
const flat = computed(() => groups.value.flatMap((g) => g.items))

// 灯箱
const lightboxIndex = ref(-1)
function openLightbox(mem) {
  lightboxIndex.value = flat.value.findIndex((p) => p.id === mem.id)
}
function onLightboxSave({ id, caption, date }) {
  memories.updateMemory(id, { caption, date })
}

// ---- 上传流程 ----
const fileInput = ref(null)
const uploadOpen = ref(false)
const uploading = ref(false)
const uploadTripId = ref(route.query.trip || '')
const pending = ref([]) // [{ url, caption, date }]

function pickFiles() {
  fileInput.value?.click()
}

async function onFilesChange(e) {
  const files = [...(e.target.files || [])]
  e.target.value = ''
  if (!files.length) return
  uploading.value = true
  try {
    const urls = await compressImages(files)
    pending.value = urls.map((url) => ({ url, caption: '', date: today() }))
    uploadOpen.value = true
  } catch (err) {
    ui.toast(err.message || '图片处理失败', 'error')
  } finally {
    uploading.value = false
  }
}

function saveUpload() {
  const tripId = uploadTripId.value || null
  pending.value.forEach((p) => memories.addMemory({ tripId, imageUrl: p.url, caption: p.caption.trim(), date: p.date }))
  ui.toast(`已添加 ${pending.value.length} 张回忆`)
  pending.value = []
  uploadOpen.value = false
}

async function removeMemory(mem) {
  const ok = await ui.confirm({ title: '删除照片', message: `确定删除「${mem.caption || '未命名瞬间'}」吗？` })
  if (ok) {
    memories.removeMemory(mem.id)
    ui.toast('已删除')
  }
}
</script>

<template>
  <div>
    <PageHeader title="回忆相册" sub="每一张照片，都是时间的标本">
      <button class="btn-primary" :disabled="uploading" @click="pickFiles">
        <Upload class="h-4 w-4" /> {{ uploading ? '处理中…' : '上传照片' }}
      </button>
    </PageHeader>

    <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFilesChange" />

    <div v-if="groups.length" class="space-y-6">
      <section v-for="g in groups" :key="g.key">
        <div class="mb-2.5 flex items-baseline justify-between">
          <h3 class="text-base font-bold">{{ g.title }}</h3>
          <span class="text-xs text-muted">{{ g.sub }} · {{ g.items.length }} 张</span>
        </div>
        <!-- 照片墙：手机 2 列 / Pad 3 列 / PC 5 列 -->
        <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 md:gap-3">
          <div
            v-for="mem in g.items"
            :key="mem.id"
            class="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-brand-soft"
            @click="openLightbox(mem)"
          >
            <img
              :src="mem.imageUrl"
              :alt="mem.caption"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-6 text-white">
              <b class="block truncate text-xs">{{ mem.caption || '未命名瞬间' }}</b>
              <span class="text-[10px] opacity-85">{{ fmtSlash(mem.date) }}</span>
            </div>
            <button
              class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity hover:bg-danger group-hover:opacity-100 max-md:opacity-100"
              title="删除"
              @click.stop="removeMemory(mem)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="card">
      <EmptyState
        :icon="Camera"
        title="相册还是空的"
        desc="上传旅途中的照片，配上文字和日期，就是最好的纪念"
        action-text="上传照片"
        @action="pickFiles"
      />
    </div>

    <!-- 上传信息填写 -->
    <BaseDrawer :open="uploadOpen" title="给照片加点记忆" wide @close="uploadOpen = false">
      <div v-if="pending.length" class="space-y-4">
        <div>
          <label class="field-label">关联行程</label>
          <select v-model="uploadTripId" class="input">
            <option value="">不关联</option>
            <option v-for="t in trips.sorted" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div v-for="(p, i) in pending" :key="i" class="flex gap-3 rounded-xl bg-[#f7faf8] p-3">
          <img :src="p.url" class="h-20 w-20 shrink-0 rounded-lg object-cover" alt="" />
          <div class="flex-1 space-y-2">
            <input v-model="p.caption" class="input !py-2 text-sm" placeholder="说明文字（如：京都·清水寺）" />
            <input v-model="p.date" type="date" class="input !py-2 text-sm" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button class="btn-ghost" @click="uploadOpen = false">取消</button>
          <button class="btn-primary" @click="saveUpload">保存 {{ pending.length }} 张</button>
        </div>
      </div>
    </BaseDrawer>

    <MemoryLightbox :photos="flat" :index="lightboxIndex" @close="lightboxIndex = -1" @update="lightboxIndex = $event" @save="onLightboxSave" />
  </div>
</template>
