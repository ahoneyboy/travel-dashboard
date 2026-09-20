<script setup>
// 星级评分：可编辑（表单）或纯展示
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  editable: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const stars = computed(() => [1, 2, 3, 4, 5])

function set(v) {
  if (props.editable) emit('update:modelValue', props.modelValue === v ? 0 : v)
}
</script>

<template>
  <div class="flex items-center gap-0.5" :class="editable ? 'cursor-pointer' : ''">
    <Star
      v-for="s in stars"
      :key="s"
      class="h-4 w-4 transition-colors"
      :class="s <= modelValue ? 'text-gold' : 'text-line'"
      :fill="s <= modelValue ? 'currentColor' : 'none'"
      @click="set(s)"
    />
  </div>
</template>
