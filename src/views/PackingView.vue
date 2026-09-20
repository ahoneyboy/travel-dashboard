<script setup>
// 旅行清单：按行程勾选（应用模板）+ 可复用清单模板管理
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Check, ListChecks, Pencil, Plus, Trash2, X } from 'lucide-vue-next'
import PageHeader from '../components/ui/PageHeader.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import BaseDrawer from '../components/ui/BaseDrawer.vue'
import { useTripsStore } from '../stores/trips'
import { usePackingStore } from '../stores/packing'
import { useUiStore } from '../stores/ui'

const route = useRoute()
const trips = useTripsStore()
const packing = usePackingStore()
const ui = useUiStore()

const tab = ref('trip') // trip | template
const selectedTripId = ref(route.query.trip || trips.planned[0]?.id || trips.sorted[0]?.id || '')
watch(
  () => route.query.trip,
  (v) => {
    if (v) {
      selectedTripId.value = v
      tab.value = 'trip'
    }
  }
)

const selectedTrip = computed(() => trips.byId(selectedTripId.value))
const tripItems = computed(() => (selectedTripId.value ? packing.tripItems(selectedTripId.value) : []))
const progress = computed(() => packing.tripProgress(selectedTripId.value))

const newItemName = ref('')
function addTripItem() {
  if (!selectedTripId.value) {
    ui.toast('请先选择行程', 'info')
    return
  }
  if (!newItemName.value.trim()) return
  packing.addTripItem(selectedTripId.value, newItemName.value)
  newItemName.value = ''
}

async function toggleItem(item) {
  packing.toggleItem(item.id)
  // 全部勾完给个正反馈
  if (!item.checked) {
    const p = packing.tripProgress(selectedTripId.value)
    if (p.total > 0 && p.done === p.total) ui.toast('行李全部备齐，可以出发啦')
  }
}

async function removeItem(item) {
  const ok = await ui.confirm({ title: '删除清单项', message: `确定删除「${item.name}」吗？` })
  if (ok) packing.removeItem(item.id)
}

async function clearDone() {
  if (!tripItems.value.some((i) => i.checked)) return
  const ok = await ui.confirm({ title: '清除已勾选项', message: '将移除所有已勾选的清单项，确定吗？' })
  if (ok) {
    packing.clearDoneForTrip(selectedTripId.value)
    ui.toast('已清除勾选项')
  }
}

// 应用模板到行程
function applyTemplate(tplId) {
  if (!tplId || !selectedTripId.value) return
  const added = packing.applyTemplate(tplId, selectedTripId.value)
  ui.toast(added ? `已添加 ${added} 项到清单` : '清单里已有这些项目，没有新增')
}

// ---- 模板管理 ----
const tplDrawer = ref(false)
const editingTplId = ref(null)
const tplForm = ref({ name: '' })
const tplErrors = ref({})
const tplItemInputs = ref({})

function openCreateTpl() {
  editingTplId.value = null
  tplForm.value = { name: '' }
  tplErrors.value = {}
  tplDrawer.value = true
}
function openEditTpl(tpl) {
  editingTplId.value = tpl.id
  tplForm.value = { name: tpl.name }
  tplErrors.value = {}
  tplDrawer.value = true
}
function saveTpl() {
  tplErrors.value.name = tplForm.value.name.trim() ? '' : '请输入模板名称'
  if (tplErrors.value.name) return
  if (editingTplId.value) {
    packing.renameTemplate(editingTplId.value, tplForm.value.name.trim())
    ui.toast('模板已更新')
  } else {
    packing.addTemplate(tplForm.value.name.trim())
    ui.toast('模板已创建，去添加条目吧')
  }
  tplDrawer.value = false
}
function addTplItem(tplId) {
  const v = (tplItemInputs.value[tplId] || '').trim()
  if (!v) return
  packing.addTemplateItem(tplId, v)
  tplItemInputs.value[tplId] = ''
}
async function removeTpl(tpl) {
  const ok = await ui.confirm({
    title: '删除模板',
    message: `确定删除模板「${tpl.name}」吗？\n已应用到行程的清单不受影响。`,
  })
  if (ok) {
    packing.removeTemplate(tpl.id)
    ui.toast('模板已删除')
  }
}
</script>

<template>
  <div>
    <PageHeader title="旅行清单" sub="模板复用，再也不怕丢三落四">
      <button class="btn-primary" @click="openCreateTpl"><Plus class="h-4 w-4" /> 新建模板</button>
    </PageHeader>

    <div class="mb-4 flex gap-2">
      <button class="chip" :class="tab === 'trip' && 'chip-active'" @click="tab = 'trip'">按行程</button>
      <button class="chip" :class="tab === 'template' && 'chip-active'" @click="tab = 'template'">清单模板</button>
    </div>

    <!-- 按行程 -->
    <template v-if="tab === 'trip'">
      <div class="scroll-x mb-4 flex gap-2">
        <button
          v-for="t in trips.sorted"
          :key="t.id"
          class="chip"
          :class="selectedTripId === t.id && 'chip-active'"
          @click="selectedTripId = t.id"
        >
          {{ t.name }}
        </button>
        <button v-if="!trips.sorted.length" class="chip opacity-60" @click="$router.push('/trips')">
          先去创建行程 →
        </button>
      </div>

      <div v-if="selectedTrip" class="card card-pad">
        <!-- 完成度 -->
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-4">
            <div class="relative flex h-16 w-16 items-center justify-center">
              <svg class="absolute inset-0 h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#eef2ee" stroke-width="6" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#4a9e6e"
                  stroke-width="6"
                  stroke-linecap="round"
                  :stroke-dasharray="`${(progress.pct / 100) * 175.9} 175.9`"
                />
              </svg>
              <b class="text-sm font-black text-brand-dark">{{ progress.pct }}%</b>
            </div>
            <div>
              <h3 class="text-base font-bold">{{ selectedTrip.name }}</h3>
              <p class="mt-0.5 text-xs text-muted">
                已备齐 <b class="text-brand">{{ progress.done }}</b> / {{ progress.total }} 项
              </p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select class="input !h-9 !w-auto max-w-40 text-xs" @change="applyTemplate($event.target.value); $event.target.value = ''">
              <option value="">应用模板…</option>
              <option v-for="tpl in packing.templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}（{{ packing.templateItems(tpl.id).length }} 项）</option>
            </select>
            <button class="btn-ghost !px-4 text-xs" @click="clearDone">清除已勾选</button>
          </div>
        </div>

        <!-- 清单项 -->
        <div v-if="tripItems.length" class="space-y-1">
          <div
            v-for="item in tripItems"
            :key="item.id"
            class="group flex items-center gap-3 border-b border-dashed border-line py-2 last:border-none"
          >
            <button
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors"
              :class="item.checked ? 'border-brand bg-brand text-white' : 'border-[#cfd8d2] bg-white hover:border-brand'"
              :aria-label="item.checked ? '取消勾选' : '勾选'"
              @click="toggleItem(item)"
            >
              <Check v-if="item.checked" class="h-3.5 w-3.5" />
            </button>
            <span class="flex-1 text-sm" :class="item.checked ? 'text-muted line-through' : ''">{{ item.name }}</span>
            <button class="btn-icon-danger !h-9 !w-9 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100" title="删除" @click="removeItem(item)">
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>
        <EmptyState
          v-else
          :icon="ListChecks"
          title="清单还是空的"
          desc="从模板一键导入，或手动添加"
        />

        <!-- 快速添加 -->
        <div class="mt-4 flex gap-2">
          <input
            v-model="newItemName"
            class="input"
            placeholder="添加清单项，回车确认"
            @keydown.enter="addTripItem"
          />
          <button class="btn-primary shrink-0 !px-5" @click="addTripItem"><Plus class="h-4 w-4" /> 添加</button>
        </div>
      </div>

      <div v-else class="card">
        <EmptyState
          :icon="ListChecks"
          title="还没有旅行计划"
          desc="先创建行程，再为它准备行李"
          action-text="去行程计划"
          @action="$router.push('/trips')"
        />
      </div>
    </template>

    <!-- 清单模板 -->
    <template v-else>
      <div v-if="packing.templates.length" class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="tpl in packing.templates" :key="tpl.id" class="card card-pad">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-base font-bold">{{ tpl.name }}</h3>
            <div class="flex">
              <button class="btn-icon !h-9 !w-9" title="重命名" @click="openEditTpl(tpl)">
                <Pencil class="h-4 w-4" />
              </button>
              <button class="btn-icon-danger !h-9 !w-9" title="删除模板" @click="removeTpl(tpl)">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
          <p class="mb-2 text-xs text-muted">{{ packing.templateItems(tpl.id).length }} 个条目</p>
          <div class="space-y-1">
            <div
              v-for="item in packing.templateItems(tpl.id)"
              :key="item.id"
              class="group flex items-center justify-between border-b border-dashed border-line py-1.5 text-sm last:border-none"
            >
              <span>{{ item.name }}</span>
              <button class="btn-icon-danger !h-8 !w-8 opacity-0 group-hover:opacity-100" title="删除" @click="packing.removeItem(item.id)">
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div class="mt-2 flex gap-1.5">
            <input
              v-model="tplItemInputs[tpl.id]"
              class="input !py-2 text-xs"
              placeholder="加一条…"
              @keydown.enter="addTplItem(tpl.id)"
            />
          </div>
        </div>
      </div>
      <div v-else class="card">
        <EmptyState
          :icon="ListChecks"
          title="还没有清单模板"
          desc="把每次都要带的东西存成模板，下次一键导入"
          action-text="新建模板"
          @action="openCreateTpl"
        />
      </div>
    </template>

    <!-- 模板抽屉 -->
    <BaseDrawer :open="tplDrawer" :title="editingTplId ? '重命名模板' : '新建模板'" @close="tplDrawer = false">
      <form class="space-y-4" @submit.prevent="saveTpl">
        <div>
          <label class="field-label">模板名称 *</label>
          <input v-model="tplForm.name" class="input" placeholder="如：海岛游 / 亲子出行" />
          <p v-if="tplErrors.name" class="field-error">{{ tplErrors.name }}</p>
        </div>
        <div class="grid grid-cols-2 gap-3 pt-1">
          <button type="button" class="btn-ghost" @click="tplDrawer = false">取消</button>
          <button type="submit" class="btn-primary">{{ editingTplId ? '保存' : '创建' }}</button>
        </div>
      </form>
    </BaseDrawer>
  </div>
</template>
