<script setup>
// 应用外壳：PC 侧边栏 / Pad 图标条 / 手机底部 TabBar + 全局弹层
import { RouterView } from 'vue-router'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppTabBar from './components/layout/AppTabBar.vue'
import MoreSheet from './components/layout/MoreSheet.vue'
import ToastHost from './components/ui/ToastHost.vue'
import ConfirmDialog from './components/ui/ConfirmDialog.vue'
</script>

<template>
  <div class="min-h-screen bg-surface text-ink">
    <AppSidebar />

    <div class="md:pl-rail lg:pl-sidebar">
      <main class="mx-auto max-w-page px-3 pb-28 pt-4 sm:px-5 md:px-6 md:pb-12 md:pt-6 lg:px-8">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <AppTabBar />
    <MoreSheet />
    <ToastHost />
    <ConfirmDialog />
  </div>
</template>
