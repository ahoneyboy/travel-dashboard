<script setup>
// 行程抽屉 = BaseDrawer + TripForm，供仪表盘 / 行程列表复用
import BaseDrawer from './ui/BaseDrawer.vue'
import TripForm from './TripForm.vue'

defineProps({
  open: { type: Boolean, default: false },
  trip: { type: Object, default: null },
  title: { type: String, default: '新建旅行计划' },
})
const emit = defineEmits(['close'])
</script>

<template>
  <BaseDrawer :open="open" :title="title" wide @close="emit('close')">
    <TripForm v-if="open" :key="trip?.id || 'new'" :trip="trip" @close="emit('close')" />
  </BaseDrawer>
</template>
