<script setup lang="ts">
/** Single-date calendar grid with day and month views; use it inline or as the MiDatePicker popup. v-model is a Date or null. */
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import {
  miAddDays, miAddMonths, miClampDate, miDateKey, miDay, miDaysInMonth, miFirstWeekday, miSameDay
} from '../../utils/miInputs'

const props = withDefaults(defineProps<{
  /** BCP 47 locale used for month names, weekday labels and the default first weekday. */
  locale?: string
  /** Earliest selectable day, inclusive. Earlier days are disabled. */
  min?: Date | null
  /** Latest selectable day, inclusive. Later days are disabled. */
  max?: Date | null
  /** Return true for dates that cannot be picked. */
  isDisabled?: (d: Date) => boolean
  /** 0 = Sunday ... 6 = Saturday. Defaults to the locale's first weekday. */
  firstDay?: number
  /** Override "today" (useful for tests and fixed demos). */
  today?: Date
  /** Always reserve six week rows so the height never jumps between months. */
  fixedRows?: boolean
}>(), { locale: 'en-US', min: null, max: null, fixedRows: false })

/** Selected date, or null when none is. */

const model = defineModel<Date | null>({ default: null })
const emit = defineEmits<{ 'month-change': [year: number, month: number] }>()

const uid = useId()
const root = ref<HTMLElement | null>(null)
const nowRef = ref<Date>(props.today ? miDay(props.today) : miDay(new Date()))
const focus = ref<Date>(miClampDate(model.value ? miDay(model.value) : nowRef.value, props.min, props.max))
const view = ref<'days' | 'months'>('days')
const dir = ref<'next' | 'prev'>('next')

onMounted(() => { if (!props.today) nowRef.value = miDay(new Date()) })
watch(() => props.today, t => { if (t) nowRef.value = miDay(t) })
watch(model, v => { if (v && !miSameDay(v, focus.value)) focus.value = miDay(v) })
watch(() => [focus.value.getFullYear(), focus.value.getMonth()] as const, ([y, m]) => emit('month-change', y, m))

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(props.locale, o)
const first = computed(() => (props.firstDay ?? miFirstWeekday(props.locale)) % 7)
const year = computed(() => focus.value.getFullYear())
const month = computed(() => focus.value.getMonth())

const title = computed(() => fmt({ month: 'long', year: 'numeric' }).format(focus.value))
const weekdays = computed(() => Array.from({ length: 7 }, (_, i) => {
  const d = new Date(2023, 0, 1 + ((first.value + i) % 7)) // 2023-01-01 is a Sunday
  return { short: fmt({ weekday: 'short' }).format(d), long: fmt({ weekday: 'long' }).format(d) }
}))
const monthNames = computed(() => Array.from({ length: 12 }, (_, m) => ({
  m, short: fmt({ month: 'short' }).format(new Date(2023, m, 1)), long: fmt({ month: 'long' }).format(new Date(2023, m, 1))
})))

const blocked = (d: Date) => !!((props.min && miDay(d) < miDay(props.min)) || (props.max && miDay(d) > miDay(props.max)) || props.isDisabled?.(d))

const weeks = computed(() => {
  const y = year.value
  const m = month.value
  const lead = (new Date(y, m, 1).getDay() - first.value + 7) % 7
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null)
  for (let d = 1; d <= miDaysInMonth(y, m); d++) cells.push(new Date(y, m, d))
  while (cells.length % 7) cells.push(null)
  if (props.fixedRows) while (cells.length < 42) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))
})

const label = (d: Date) => fmt({ dateStyle: 'full' }).format(d)
const canPrev = computed(() => !props.min || (view.value === 'days'
  ? new Date(year.value, month.value, 1) > miDay(props.min)
  : year.value > props.min.getFullYear()))
const canNext = computed(() => !props.max || (view.value === 'days'
  ? new Date(year.value, month.value + 1, 1) <= miDay(props.max)
  : year.value < props.max.getFullYear()))

function go(n: number) {
  dir.value = n > 0 ? 'next' : 'prev'
  focus.value = miClampDate(miAddMonths(focus.value, view.value === 'days' ? n : n * 12), props.min, props.max)
}

function pick(d: Date) {
  if (blocked(d)) return
  const prev = model.value
  const next = prev ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), prev.getHours(), prev.getMinutes()) : d
  focus.value = miDay(d)
  model.value = next
}

function focusCell() {
  void nextTick(() => root.value?.querySelector<HTMLElement>(`[data-key="${miDateKey(focus.value)}"]`)?.focus())
}

function moveTo(d: Date) {
  const target = miClampDate(d, props.min, props.max)
  dir.value = target > focus.value ? 'next' : 'prev'
  focus.value = target
  focusCell()
}

function onGridKey(e: KeyboardEvent) {
  const f = focus.value
  let t: Date | null = null
  switch (e.key) {
    case 'ArrowLeft': t = miAddDays(f, -1); break
    case 'ArrowRight': t = miAddDays(f, 1); break
    case 'ArrowUp': t = miAddDays(f, -7); break
    case 'ArrowDown': t = miAddDays(f, 7); break
    case 'Home': t = miAddDays(f, -((f.getDay() - first.value + 7) % 7)); break
    case 'End': t = miAddDays(f, 6 - ((f.getDay() - first.value + 7) % 7)); break
    case 'PageUp': t = miAddMonths(f, e.shiftKey ? -12 : -1); break
    case 'PageDown': t = miAddMonths(f, e.shiftKey ? 12 : 1); break
    default: return
  }
  e.preventDefault()
  moveTo(t)
}

function pickMonth(m: number) {
  focus.value = miClampDate(new Date(year.value, m, Math.min(focus.value.getDate(), miDaysInMonth(year.value, m))), props.min, props.max)
  view.value = 'days'
}

function monthBlocked(m: number) {
  return !!((props.min && new Date(year.value, m + 1, 0) < miDay(props.min)) || (props.max && new Date(year.value, m, 1) > miDay(props.max)))
}

const tabbable = (d: Date) => miSameDay(d, focus.value)
defineExpose({ focusDate: () => focusCell() })
</script>

<template>
  <div ref="root" class="mi-cal mi:flex mi:flex-col mi:gap-3.5 mi:min-w-0 mi:font-mi mi:tracking-[-.01em] mi:select-none">
    <div class="mi-cal__head mi:flex mi:items-center mi:justify-between">
      <button
        type="button" class="mi-cal__title mi:inline-flex mi:items-center mi:gap-1 mi:py-1 mi:px-1.5 mi:[border:0] mi:rounded-[8px] mi:bg-transparent mi:text-label mi:cursor-pointer mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[1px]" :aria-expanded="view === 'months'" :aria-controls="`mi-cal-body-${uid}`"
        :aria-label="view === 'months' ? `${year}, choose a month` : `${title}, choose a month`" @click="view = view === 'days' ? 'months' : 'days'"
      >
        <span :id="`mi-cal-title-${uid}`" aria-live="polite">{{ view === 'days' ? title : year }}</span>
        <svg class="mi-cal__chev mi:text-p-text mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[&.is-open]:transform-[rotate(90deg)]" :class="{ 'is-open': view === 'months' }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
      <span class="mi-cal__nav mi:inline-flex mi:gap-1">
        <button type="button" class="mi-cal__arrow mi:flex mi:items-center mi:justify-center mi:w-9 mi:h-9 mi:m-0 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:bg-transparent mi:text-p-text mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease),_opacity_var(--mi-dur-1)] mi:active:transform-[scale(.86)] mi:disabled:opacity-30 mi:disabled:cursor-default mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[1px]" :disabled="!canPrev" :aria-label="view === 'days' ? 'Previous month' : 'Previous year'" @click="go(-1)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" class="mi-cal__arrow mi:flex mi:items-center mi:justify-center mi:w-9 mi:h-9 mi:m-0 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:bg-transparent mi:text-p-text mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease),_opacity_var(--mi-dur-1)] mi:active:transform-[scale(.86)] mi:disabled:opacity-30 mi:disabled:cursor-default mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[1px]" :disabled="!canNext" :aria-label="view === 'days' ? 'Next month' : 'Next year'" @click="go(1)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </span>
    </div>

    <div :id="`mi-cal-body-${uid}`" class="mi-cal__body mi:relative">
      <Transition :name="`mi-cal-${dir}`" mode="out-in">
        <div v-if="view === 'days'" :key="`d-${year}-${month}`" class="mi-cal__grid mi:flex mi:flex-col mi:gap-1" role="grid" :aria-labelledby="`mi-cal-title-${uid}`" @keydown="onGridKey">
          <div class="mi-cal__row mi-cal__row--head mi:grid mi:grid-cols-7 mi:text-center" role="row">
            <span v-for="w in weekdays" :key="w.long" class="mi-cal__dow mi:pb-1 mi:text-[12px] mi:font-semibold mi:text-label2 mi:uppercase" role="columnheader" :aria-label="w.long">{{ w.short }}</span>
          </div>
          <div v-for="(wk, wi) in weeks" :key="wi" class="mi-cal__row mi:grid mi:grid-cols-7 mi:text-center" role="row">
            <span v-for="(d, di) in wk" :key="di" class="mi-cal__cell mi:flex mi:justify-center mi:min-h-11" role="gridcell" :aria-selected="d ? miSameDay(d, model) : undefined">
              <button
                v-if="d" type="button" class="mi-cal__day mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[1px] mi:relative mi:w-11 mi:h-11 mi:m-0 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:bg-transparent mi:text-label mi:cursor-pointer mi:[-webkit-tap-highlight-color:transparent] mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.92)] mi:[&.is-blocked]:cursor-not-allowed mi:[&.is-blocked:active]:transform-none" :data-key="miDateKey(d)" :tabindex="tabbable(d) ? 0 : -1"
                :class="{ 'is-selected': miSameDay(d, model), 'is-today': miSameDay(d, nowRef), 'is-blocked': blocked(d) }"
                :aria-label="label(d)" :aria-current="miSameDay(d, nowRef) ? 'date' : undefined" :aria-disabled="blocked(d) || undefined"
                @click="pick(d)" @focus="focus = miDay(d)"
              ><span class="mi-cal__dot mi:absolute mi:inset-0 mi:rounded-[50%] mi:bg-p mi:opacity-0 mi:transform-[scale(.55)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-1)_var(--mi-ease)] mi:[.mi-cal__day:hover:not(.is-selected):not(.is-blocked)_&]:bg-fill3 mi:[.mi-cal__day:hover:not(.is-selected):not(.is-blocked)_&]:opacity-100 mi:[.mi-cal__day:hover:not(.is-selected):not(.is-blocked)_&]:transform-none mi:[.mi-cal__day.is-selected_&]:bg-p mi:[.mi-cal__day.is-selected_&]:opacity-100 mi:[.mi-cal__day.is-selected_&]:transform-none" /><span class="mi-cal__num mi:relative">{{ d.getDate() }}</span></button>
            </span>
          </div>
        </div>
        <div v-else key="months" class="mi-cal__months mi:grid mi:grid-cols-3 mi:gap-1.5 mi:min-h-68 mi:content-start" role="group" aria-label="Months">
          <button
            v-for="n in monthNames" :key="n.m" type="button" class="mi-cal__month mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[1px] mi:h-14 mi:m-0 mi:p-0 mi:[border:0] mi:rounded-[12px] mi:bg-fill4 mi:text-label mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.95)] mi:[&.is-selected]:bg-p mi:[&.is-selected]:text-p-on mi:disabled:text-label3 mi:disabled:cursor-not-allowed" :class="{ 'is-selected': n.m === month }"
            :aria-pressed="n.m === month" :aria-label="`${n.long} ${year}`" :disabled="monthBlocked(n.m)" @click="pickMonth(n.m)"
          >{{ n.short }}</button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.mi-cal { width: 100%; color: var(--mi-label); }
.mi-cal__title { margin: 0; margin-left: -6px; font: inherit; font-size: 17px; font-weight: 600; }
.mi-cal__day { font: inherit; font-size: 19px; font-variant-numeric: tabular-nums; }
.mi-cal__day.is-selected { color: var(--mi-p-on); font-weight: 600; }
.mi-cal__day.is-today:not(.is-selected) { color: var(--mi-p-text); font-weight: 600; }
.mi-cal__day.is-blocked { color: var(--mi-label3); }
.mi-cal__month { font: inherit; font-size: 17px; font-weight: 500; }
.mi-cal__month.is-selected { font-weight: 600; }
.mi-cal-next-enter-active, .mi-cal-prev-enter-active, .mi-cal-next-leave-active, .mi-cal-prev-leave-active { transition: transform var(--mi-dur-1) var(--mi-ease), opacity var(--mi-dur-1) var(--mi-ease); }
.mi-cal-next-enter-from, .mi-cal-prev-leave-to { opacity: 0; transform: translateX(14px); }
.mi-cal-next-leave-to, .mi-cal-prev-enter-from { opacity: 0; transform: translateX(-14px); }
</style>
