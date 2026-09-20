<script setup>
// 统计卡片：数值 + 标签 + 彩色图标块
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Number, String], default: 0 },
  label: { type: String, default: '' },
  sub: { type: String, default: '' },
  icon: { type: [Object, Function], required: true },
  tone: { type: String, default: 'green' }, // green / blue / orange / purple
})

const TONES = {
  green: 'bg-brand-light text-brand-dark',
  blue: 'bg-[#e8eef8] text-[#4a6fa5]',
  orange: 'bg-[#fdf0e3] text-[#b06a35]',
  purple: 'bg-[#f0eaf8] text-[#7a5ea6]',
}

const toneCls = computed(() => TONES[props.tone] || TONES.green)
</script>

<template>
  <div class="card card-pad flex items-center justify-between gap-2">
    <div class="min-w-0">
      <div class="text-2xl font-black leading-none md:text-[28px]">{{ value }}</div>
      <div class="mt-1.5 text-xs leading-snug text-muted md:text-[12.5px]">
        {{ label }}<template v-if="sub"><br />{{ sub }}</template>
      </div>
    </div>
    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl md:h-[46px] md:w-[46px]" :class="toneCls">
      <component :is="icon" class="h-5 w-5 md:h-6 md:w-6" />
    </div>
  </div>
</template>
