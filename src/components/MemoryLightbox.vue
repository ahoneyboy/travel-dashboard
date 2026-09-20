<script setup>
// 大图灯箱：左右切换、说明文字/日期编辑、键盘操作
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { ChevronLeft, ChevronRight, Check, Pencil, X } from 'lucide-vue-next'
import { fmtCN } from '../utils/date'
import { useUiStore } from '../stores/ui'

const props = defineProps({
  photos: { type: Array, required: true }, // [{ id, imageUrl, caption, date, tripName }]
  index: { type: Number, default: -1 }, // -1 = 关闭
})
const emit = defineEmits(['close', 'save'])

const ui = useUiStore()
const editing = ref(false)
const caption = ref('')
const date = ref('')

const current = () => props.photos[props.index] || null

watch(
  () => props.index,
  () => {
    editing.value = false
    const m = current()
    caption.value = m?.caption || ''
    date.value = m?.date || ''
  }
)

function prev() {
  if (props.index > 0) emit('update', props.index - 1)
  else emit('update', props.photos.length - 1)
}
function next() {
  if (props.index < props.photos.length - 1) emit('update', props.index + 1)
  else emit('update', 0)
}

function save() {
  const m = current()
  if (!m) return
  emit('save', { id: m.id, caption: caption.value.trim(), date: date.value })
  ui.toast('说明已更新')
  editing.value = false
}

function onKey(e) {
  if (props.index < 0) return
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="index >= 0 && current()" class="fixed inset-0 z-50 flex flex-col bg-black/90">
        <!-- 顶栏 -->
        <div class="flex items-center justify-between p-4 text-white">
          <span class="text-sm text-white/80">{{ index + 1 }} / {{ photos.length }}</span>
          <button class="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/10" @click="emit('close')">
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- 大图 -->
        <div class="relative flex flex-1 items-center justify-center overflow-hidden px-2 md:px-16">
          <button
            class="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-4"
            @click="prev"
          >
            <ChevronLeft class="h-6 w-6" />
          </button>
          <img :src="current().imageUrl" :alt="current().caption" class="max-h-[62vh] max-w-full rounded-xl object-contain shadow-pop" />
          <button
            class="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-4"
            @click="next"
          >
            <ChevronRight class="h-6 w-6" />
          </button>
        </div>

        <!-- 底部信息 -->
        <div class="p-4 pb-8 text-center md:p-6">
          <template v-if="!editing">
            <p class="text-base font-bold text-white">{{ current().caption || '未命名瞬间' }}</p>
            <p class="mt-1 text-xs text-white/70">
              {{ current().date ? fmtCN(current().date) : '' }}
              <template v-if="current().tripName"> · {{ current().tripName }}</template>
            </p>
            <button class="mx-auto mt-3 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:bg-white/20" @click="editing = true">
              <Pencil class="h-3.5 w-3.5" /> 编辑说明
            </button>
          </template>
          <form v-else class="mx-auto flex max-w-md flex-col gap-2.5 sm:flex-row" @submit.prevent="save">
            <input v-model="caption" class="input" placeholder="说明文字" />
            <input v-model="date" type="date" class="input sm:w-40" />
            <button type="submit" class="btn-primary shrink-0 !px-4"><Check class="h-4 w-4" /> 保存</button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
