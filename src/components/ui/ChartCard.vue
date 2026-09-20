<script setup>
// 图表卡片：标题 + 右侧操作 + 图表容器
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <div class="card card-pad">
    <div class="mb-3.5 flex items-center justify-between gap-2">
      <h3 class="text-base font-bold">{{ title }}</h3>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>
