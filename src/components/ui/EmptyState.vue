<script setup>
// 空状态：插画图标 + 文案 + 行动按钮
import { Sparkles } from 'lucide-vue-next'

defineProps({
  icon: { type: [Object, Function], default: () => Sparkles },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  actionText: { type: String, default: '' },
})
const emit = defineEmits(['action'])
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-12 text-center md:py-16">
    <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand-dark md:h-20 md:w-20">
      <div class="absolute inset-0 -z-10 scale-125 rounded-full border border-dashed border-brand/30"></div>
      <component :is="icon" class="h-7 w-7 md:h-8 md:w-8" />
    </div>
    <p class="mt-4 text-sm font-bold text-ink md:text-base">{{ title }}</p>
    <p v-if="desc" class="mt-1 max-w-xs text-xs leading-relaxed text-muted md:text-sm">{{ desc }}</p>
    <button v-if="actionText" class="btn-primary mt-5" @click="emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>
