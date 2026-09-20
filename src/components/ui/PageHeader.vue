<script setup>
// 页头：标题 + 副标题 + 右侧操作区
defineProps({
  title: { type: String, required: true },
  sub: { type: String, default: '' },
})
</script>

<template>
  <div class="mb-4 flex flex-wrap items-start justify-between gap-3 md:mb-6">
    <div>
      <h1 class="text-xl font-black md:text-2xl">{{ title }}</h1>
      <p v-if="sub" class="mt-1 text-xs tracking-wide text-muted md:text-sm">{{ sub }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2.5">
      <slot />
    </div>
  </div>
</template>
