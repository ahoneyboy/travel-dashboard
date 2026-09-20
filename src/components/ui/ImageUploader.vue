<script setup>
// 单图上传：选择 → 本地压缩（≤2MB）→ dataURL
import { computed, ref } from 'vue'
import { ImagePlus, Trash2 } from 'lucide-vue-next'
import { compressImage } from '../../utils/image'
import { useUiStore } from '../../stores/ui'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
const ui = useUiStore()

const inputRef = ref(null)
const busy = ref(false)

const preview = computed(() => props.modelValue)

function pick() {
  inputRef.value?.click()
}

async function onChange(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  busy.value = true
  try {
    const url = await compressImage(file)
    emit('update:modelValue', url)
  } catch (err) {
    ui.toast(err.message || '图片处理失败', 'error')
  } finally {
    busy.value = false
  }
}

function remove() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div>
    <input ref="inputRef" type="file" accept="image/*" class="hidden" @change="onChange" />
    <!-- 已有图：预览 + 替换 / 移除 -->
    <div v-if="preview" class="relative w-fit">
      <img
        :src="preview"
        alt="预览"
        class="h-32 w-full max-w-xs rounded-xl border border-line object-cover"
      />
      <div class="absolute right-2 top-2 flex gap-2">
        <button class="btn-icon bg-white/90 shadow-card" title="更换图片" @click="pick">
          <ImagePlus class="h-4 w-4" />
        </button>
        <button class="btn-icon-danger bg-white/90 shadow-card" title="移除图片" @click="remove">
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
      <div v-if="busy" class="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 text-xs text-muted">
        压缩中…
      </div>
    </div>
    <!-- 无图：上传框 -->
    <button
      v-else
      type="button"
      class="flex h-32 w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-brand-soft text-muted transition-colors hover:border-brand/50 hover:text-brand-dark"
      :disabled="busy"
      @click="pick"
    >
      <ImagePlus class="h-6 w-6" />
      <span class="text-xs font-bold">{{ busy ? '压缩中…' : '上传图片' }}</span>
      <span class="text-[11px]">本地自动压缩，单张不超过 2MB</span>
    </button>
  </div>
</template>
