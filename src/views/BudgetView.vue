<script setup>
// 预算管理：按行程记账，环图 + 明细列表 + 预算 vs 实际对比
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { CalendarDays, Pencil, Plus, Tag, Trash2, TriangleAlert, Wallet } from 'lucide-vue-next'
import PageHeader from '../components/ui/PageHeader.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import BaseDrawer from '../components/ui/BaseDrawer.vue'
import StatCard from '../components/ui/StatCard.vue'
import { useTripsStore } from '../stores/trips'
import { useExpensesStore, EXPENSE_CATEGORIES, CATEGORY_COLORS } from '../stores/expenses'
import { useUiStore } from '../stores/ui'
import { fmtSlash, today } from '../utils/date'
import { fmtMoney } from '../utils/format'
import { donutOption, C } from '../utils/charts'

const route = useRoute()
const trips = useTripsStore()
const expenses = useExpensesStore()
const ui = useUiStore()

// 当前选中的行程：'all' = 全部
const selected = ref(route.query.trip || 'all')
watch(
  () => route.query.trip,
  (v) => {
    if (v) selected.value = v
  }
)

const tripOptions = computed(() => trips.sorted)
const currentTrip = computed(() => (selected.value === 'all' ? null : trips.byId(selected.value)))

// 汇总数据（全部行程 = 各行程预算求和）
const totalSpent = computed(() =>
  currentTrip.value ? expenses.totalFor(currentTrip.value.id) : expenses.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
)
const budget = computed(() =>
  currentTrip.value ? currentTrip.value.budget || 0 : trips.trips.reduce((s, t) => s + (Number(t.budget) || 0), 0)
)
const remain = computed(() => budget.value - totalSpent.value)
const overBudget = computed(() => remain.value < 0)
const usedPct = computed(() => (budget.value ? Math.min(100, Math.round((totalSpent.value / budget.value) * 100)) : 0))

const catStats = computed(() => {
  const map = {}
  const list = currentTrip.value
    ? expenses.forTrip(currentTrip.value.id)
    : expenses.expenses
  list.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0)
  })
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
})

const donut = computed(() =>
  donutOption({
    data: catStats.value.map((c) => ({ name: c.category, value: c.amount, color: CATEGORY_COLORS[c.category] || C.muted })),
    centerTitle: '总花费',
    centerValue: fmtMoney(totalSpent.value),
  })
)

// 明细列表
const details = computed(() => {
  const list = currentTrip.value
    ? expenses.forTrip(currentTrip.value.id)
    : [...expenses.expenses].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  return list.map((e) => ({ ...e, tripName: trips.byId(e.tripId)?.name || '未知行程' }))
})

// 新增 / 编辑花费
const drawerOpen = ref(false)
const editingId = ref(null)
const errors = ref({})
const form = ref({})

function openCreate() {
  if (!tripOptions.value.length) {
    ui.toast('请先创建一个旅行计划', 'info')
    return
  }
  editingId.value = null
  form.value = {
    tripId: currentTrip.value?.id || tripOptions.value[0].id,
    category: '交通',
    amount: null,
    date: today(),
    note: '',
  }
  errors.value = {}
  drawerOpen.value = true
}
function openEdit(e) {
  editingId.value = e.id
  form.value = { tripId: e.tripId, category: e.category, amount: e.amount, date: e.date, note: e.note }
  errors.value = {}
  drawerOpen.value = true
}

function save() {
  errors.value.amount = Number(form.value.amount) >= 0 && form.value.amount !== null && form.value.amount !== '' ? '' : '请输入不小于 0 的金额'
  errors.value.date = form.value.date ? '' : '请选择日期'
  if (errors.value.amount || errors.value.date) return
  const payload = {
    tripId: form.value.tripId,
    category: form.value.category,
    amount: Math.max(0, Number(form.value.amount)),
    date: form.value.date,
    note: form.value.note.trim(),
  }
  if (editingId.value) {
    expenses.updateExpense(editingId.value, payload)
    ui.toast('花费已更新')
  } else {
    expenses.addExpense(payload)
    ui.toast('已记一笔')
  }
  drawerOpen.value = false
}

async function remove(e) {
  const ok = await ui.confirm({ title: '删除花费', message: `确定删除「${e.category} ${fmtMoney(e.amount)}」这笔记录吗？` })
  if (ok) {
    expenses.removeExpense(e.id)
    ui.toast('已删除')
  }
}
</script>

<template>
  <div>
    <PageHeader title="预算管理" sub="每一笔花费都花得明明白白">
      <button class="btn-primary" @click="openCreate"><Plus class="h-4 w-4" /> 记一笔</button>
    </PageHeader>

    <!-- 行程选择 -->
    <div class="scroll-x mb-4 flex gap-2">
      <button class="chip" :class="selected === 'all' && 'chip-active'" @click="selected = 'all'">全部行程</button>
      <button
        v-for="t in tripOptions"
        :key="t.id"
        class="chip"
        :class="selected === t.id && 'chip-active'"
        @click="selected = t.id"
      >
        {{ t.name }}
      </button>
      <button v-if="!tripOptions.length" class="chip opacity-60">先去「行程计划」创建行程</button>
    </div>

    <template v-if="tripOptions.length">
      <!-- 汇总卡片 -->
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-3.5">
        <StatCard :value="fmtMoney(budget)" label="总预算" :sub="currentTrip ? currentTrip.name : '全部行程合计'" :icon="Wallet" tone="blue" />
        <StatCard :value="fmtMoney(totalSpent)" label="已花费" :icon="Tag" tone="green" />
        <StatCard
          :value="fmtMoney(Math.abs(remain))"
          :label="overBudget ? '已超支' : '剩余预算'"
          :icon="overBudget ? TriangleAlert : Wallet"
          :tone="overBudget ? 'orange' : 'purple'"
        />
        <StatCard :value="usedPct + '%'" label="预算使用率" :sub="budget ? undefined : '未设置预算'" :icon="Tag" tone="orange" />
      </div>

      <div class="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-5">
        <!-- 环图 + 预算对比 -->
        <div class="card card-pad lg:col-span-2">
          <h3 class="mb-3 text-base font-bold">分类占比</h3>
          <VChart v-if="catStats.length" :option="donut" autoresize class="h-48 md:h-52" />
          <div v-else class="flex h-40 items-center justify-center text-sm text-muted">还没有花费记录</div>
          <!-- 预算 vs 实际 -->
          <div v-if="currentTrip" class="mt-4">
            <div class="mb-1.5 flex items-center justify-between text-xs text-muted">
              <span>预算 vs 实际</span>
              <b :class="overBudget ? 'text-danger' : 'text-brand-dark'">
                {{ usedPct }}%
              </b>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-[#eef2ee]">
              <div class="h-full rounded-full transition-all" :class="overBudget ? 'bg-danger' : 'bg-brand'" :style="{ width: usedPct + '%' }"></div>
            </div>
            <p class="mt-1.5 text-xs" :class="overBudget ? 'text-danger' : 'text-muted'">
              {{
                overBudget
                  ? `已超支 ${fmtMoney(-remain)}，看看哪里花多了`
                  : budget
                    ? `还剩 ${fmtMoney(remain)} 可以花`
                    : '该行程未设置预算'
              }}
            </p>
          </div>
        </div>

        <!-- 明细列表 -->
        <div class="card card-pad lg:col-span-3">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-base font-bold">花费明细</h3>
            <span class="text-xs text-muted">共 {{ details.length }} 笔</span>
          </div>
          <div v-if="details.length" class="space-y-2">
            <div
              v-for="e in details"
              :key="e.id"
              class="flex items-center gap-3 rounded-xl bg-[#f7faf8] p-3"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                :style="{ background: CATEGORY_COLORS[e.category] || C.muted }"
              >
                {{ e.category[0] }}
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <b class="text-sm">{{ e.category }}</b>
                  <span v-if="!currentTrip" class="truncate rounded-full bg-white px-2 py-0.5 text-[11px] text-muted">
                    {{ e.tripName }}
                  </span>
                </div>
                <div class="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <CalendarDays class="h-3 w-3" /> {{ fmtSlash(e.date) }}
                  <template v-if="e.note"> · {{ e.note }}</template>
                </div>
              </div>
              <b class="shrink-0 text-sm">{{ fmtMoney(e.amount) }}</b>
              <div class="flex shrink-0">
                <button class="btn-icon !h-9 !w-9" title="编辑" @click="openEdit(e)"><Pencil class="h-4 w-4" /></button>
                <button class="btn-icon-danger !h-9 !w-9" title="删除" @click="remove(e)"><Trash2 class="h-4 w-4" /></button>
              </div>
            </div>
          </div>
          <EmptyState
            v-else
            :icon="Wallet"
            title="还没有花费记录"
            desc="机票、酒店、一顿大餐，都值得记下来"
            action-text="记一笔"
            @action="openCreate"
          />
        </div>
      </div>
    </template>

    <div v-else class="card">
      <EmptyState
        :icon="Wallet"
        title="还没有旅行计划"
        desc="先创建行程，才能按行程记账"
        action-text="去行程计划"
        @action="$router.push('/trips')"
      />
    </div>

    <BaseDrawer :open="drawerOpen" :title="editingId ? '编辑花费' : '记一笔'" @close="drawerOpen = false">
      <form v-if="drawerOpen" class="space-y-4" @submit.prevent="save">
        <div>
          <label class="field-label">所属行程 *</label>
          <select v-model="form.tripId" class="input">
            <option v-for="t in tripOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label">分类 *</label>
            <select v-model="form.category" class="input">
              <option v-for="c in EXPENSE_CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div>
            <label class="field-label">金额（¥）*</label>
            <input v-model.number="form.amount" type="number" min="0" class="input" placeholder="0" />
            <p v-if="errors.amount" class="field-error">{{ errors.amount }}</p>
          </div>
        </div>
        <div>
          <label class="field-label">日期 *</label>
          <input v-model="form.date" type="date" class="input" />
          <p v-if="errors.date" class="field-error">{{ errors.date }}</p>
        </div>
        <div>
          <label class="field-label">备注</label>
          <input v-model="form.note" class="input" placeholder="如：往返机票（含税）" />
        </div>
        <div class="grid grid-cols-2 gap-3 pt-1">
          <button type="button" class="btn-ghost" @click="drawerOpen = false">取消</button>
          <button type="submit" class="btn-primary">{{ editingId ? '保存' : '添加' }}</button>
        </div>
      </form>
    </BaseDrawer>
  </div>
</template>
