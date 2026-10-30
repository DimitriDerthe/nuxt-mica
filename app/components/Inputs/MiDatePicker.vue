<script setup lang="ts">
/** Date field that opens an MiCalendar popup, with an optional time picker (time prop); v-model is a Date or null. */
import { computed, inject, nextTick, ref, useAttrs, useId, watch } from 'vue'
import MiCalendar from './MiCalendar.vue'
import { useMiInputPopup } from '../../composables/useMiInputPopup'
import { MI_FIELD } from '../../utils/miInputs'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** BCP 47 locale used for the displayed date, month names and 12/24-hour time format. */
  locale?: string
  /** Earliest selectable day, inclusive. Earlier days are disabled. */
  min?: Date | null
  /** Latest selectable day, inclusive. Later days are disabled. */
  max?: Date | null
  /** Return true for dates that cannot be picked. */
  isDisabled?: (d: Date) => boolean
  /** First weekday of the calendar, 0 = Sunday ... 6 = Saturday. Defaults to the locale's. */
  firstDay?: number
  /** Also show a time button with hour / minute (and AM/PM when the locale uses it). */
  time?: boolean
  /** Minutes between options in the time list. */
  minuteStep?: number
  /** Intl.DateTimeFormat dateStyle for the displayed date. */
  dateStyle?: 'short' | 'medium' | 'long'
  /** Text shown on the date button while no date is chosen. */
  placeholder?: string
  /** Text shown on the time button while no time is chosen. */
  timePlaceholder?: string
  /** Overrides the surrounding MiField or MiFormRow disabled state when set. */
  disabled?: boolean
  /** Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. */
  invalid?: boolean
}>(), {
  locale: 'en-US', min: null, max: null, minuteStep: 5, dateStyle: 'medium', placeholder: 'Select date',
  timePlaceholder: 'Select time', invalid: undefined, disabled: undefined
})

/** Selected date (with time when `time` is set), or null when empty. */

const model = defineModel<Date | null>({ default: null })
const attrs = useAttrs()
const field = inject(MI_FIELD, null)
const auto = useId()

const dateBtn = ref<HTMLElement | null>(null)
const timeBtn = ref<HTMLElement | null>(null)
const datePanel = ref<HTMLElement | null>(null)
const timePanel = ref<HTMLElement | null>(null)
const calendar = ref<InstanceType<typeof MiCalendar> | null>(null)

const dateId = computed(() => (attrs.id as string | undefined) ?? field?.id ?? `mi-dp-${auto}`)
const off = computed(() => props.disabled ?? field?.disabled.value ?? false)
const isInvalid = computed(() => props.invalid ?? field?.invalid.value ?? false)
const describedBy = computed(() => [attrs['aria-describedby'], field?.describedBy.value].filter(Boolean).join(' ') || undefined)
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))

const datePopup = useMiInputPopup({ trigger: () => dateBtn.value, panel: datePanel })
const timePopup = useMiInputPopup({ trigger: () => timeBtn.value, panel: timePanel })

const dateText = computed(() => model.value
  ? new Intl.DateTimeFormat(props.locale, { dateStyle: props.dateStyle }).format(model.value)
  : props.placeholder)
const timeText = computed(() => model.value
  ? new Intl.DateTimeFormat(props.locale, { timeStyle: 'short' }).format(model.value)
  : props.timePlaceholder)

/* ---- time columns ---- */
const hour12 = computed(() => !!new Intl.DateTimeFormat(props.locale, { hour: 'numeric' }).resolvedOptions().hour12)
const periods = computed(() => {
  const f = new Intl.DateTimeFormat(props.locale, { hour: 'numeric', hour12: true })
  const part = (h: number) => f.formatToParts(new Date(2000, 0, 1, h)).find(p => p.type === 'dayPeriod')?.value ?? (h < 12 ? 'AM' : 'PM')
  return [part(1), part(13)]
})
const hours = computed(() => hour12.value ? Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i)) : Array.from({ length: 24 }, (_, i) => i))
const minutes = computed(() => Array.from({ length: Math.ceil(60 / Math.max(1, props.minuteStep)) }, (_, i) => i * Math.max(1, props.minuteStep)))
const curH = computed(() => model.value?.getHours() ?? -1)
const curM = computed(() => model.value?.getMinutes() ?? -1)
const curPm = computed(() => curH.value >= 12)
const shownHour = (h: number) => (hour12.value ? (curH.value === -1 ? -1 : (curH.value % 12 === 0 ? 12 : curH.value % 12)) : curH.value) === h
const pad = (n: number) => String(n).padStart(2, '0')

function base(): Date {
  const d = model.value ?? new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), model.value ? d.getHours() : 12, model.value ? d.getMinutes() : 0)
}
function setTime(h: number, m: number) {
  const b = base()
  model.value = new Date(b.getFullYear(), b.getMonth(), b.getDate(), h, m)
}
function pickHour(h: number) {
  const pm = model.value ? curPm.value : false
  setTime(hour12.value ? (h % 12) + (pm ? 12 : 0) : h, curM.value === -1 ? 0 : curM.value)
}
function pickMinute(m: number) { setTime(curH.value === -1 ? 12 : curH.value, m) }
function pickPeriod(pm: boolean) {
  const h = curH.value === -1 ? 12 : curH.value
  setTime((h % 12) + (pm ? 12 : 0), curM.value === -1 ? 0 : curM.value)
}

function onColKey(e: KeyboardEvent) {
  const dirn = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
  const edge = e.key === 'Home' ? 0 : e.key === 'End' ? -1 : null
  if (!dirn && edge === null) return
  e.preventDefault()
  const col = e.currentTarget as HTMLElement
  const items = [...col.querySelectorAll<HTMLElement>('[role="option"]')]
  const i = items.indexOf(document.activeElement as HTMLElement)
  const t = edge !== null ? (edge === 0 ? items[0] : items[items.length - 1]) : items[Math.max(0, Math.min(items.length - 1, i + dirn))]
  t?.focus()
}

watch(() => timePopup.open.value, async v => {
  if (!v) return
  await nextTick()
  timePanel.value?.querySelectorAll<HTMLElement>('[aria-selected="true"]').forEach(el => {
    const col = el.parentElement as HTMLElement
    col.scrollTop = el.offsetTop - col.clientHeight / 2 + el.offsetHeight / 2
  })
  const first = timePanel.value?.querySelector<HTMLElement>('[role="option"][tabindex="0"]')
  first?.focus()
})
watch(() => datePopup.open.value, async v => { if (v) { await nextTick(); calendar.value?.focusDate() } })

function onDate(v: Date | null) {
  model.value = v
  datePopup.hide(true)
}
</script>

<template>
  <div class="mi-dp" v-bind="rootAttrs">
    <button
      :id="dateId" ref="dateBtn" type="button" class="mi-dp__btn" :class="{ 'is-placeholder': !model, 'is-invalid': isInvalid }"
      :disabled="off" aria-haspopup="dialog" :aria-expanded="datePopup.open.value" :aria-invalid="isInvalid || undefined"
      :aria-describedby="describedBy" @click="timePopup.hide(false); datePopup.toggle()"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
      {{ dateText }}
    </button>
    <button
      v-if="time" ref="timeBtn" type="button" class="mi-dp__btn" :class="{ 'is-placeholder': !model }" :disabled="off"
      aria-haspopup="dialog" :aria-expanded="timePopup.open.value" :aria-label="`Time, ${timeText}`" @click="datePopup.hide(false); timePopup.toggle()"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
      {{ timeText }}
    </button>

    <Teleport to="body">
      <Transition name="mi-dp-pop">
        <div v-if="datePopup.open.value" ref="datePanel" class="mi mi-dp__panel mi-dp__panel--date" :class="datePopup.scope.value" :style="datePopup.style.value" role="dialog" aria-label="Choose date">
          <MiCalendar
            ref="calendar" :model-value="model" :locale="locale" :min="min" :max="max" :is-disabled="props.isDisabled"
            :first-day="firstDay" fixed-rows @update:model-value="onDate"
          />
        </div>
      </Transition>
      <Transition name="mi-dp-pop">
        <div v-if="timePopup.open.value" ref="timePanel" class="mi mi-dp__panel mi-dp__panel--time" :class="timePopup.scope.value" :style="timePopup.style.value" role="dialog" aria-label="Choose time">
          <div class="mi-dp__cols">
            <div class="mi-dp__col" role="listbox" aria-label="Hours" @keydown="onColKey">
              <button v-for="h in hours" :key="h" type="button" role="option" class="mi-dp__opt" :aria-selected="shownHour(h)" :tabindex="shownHour(h) || (curH === -1 && h === hours[0]) ? 0 : -1" @click="pickHour(h)">{{ hour12 ? h : pad(h) }}</button>
            </div>
            <div class="mi-dp__col" role="listbox" aria-label="Minutes" @keydown="onColKey">
              <button v-for="m in minutes" :key="m" type="button" role="option" class="mi-dp__opt" :aria-selected="m === curM" :tabindex="m === curM || (curM === -1 && m === 0) ? 0 : -1" @click="pickMinute(m)">{{ pad(m) }}</button>
            </div>
            <div v-if="hour12" class="mi-dp__col mi-dp__col--period" role="listbox" aria-label="AM or PM" @keydown="onColKey">
              <button v-for="(p, i) in periods" :key="p" type="button" role="option" class="mi-dp__opt" :aria-selected="curH !== -1 && curPm === (i === 1)" :tabindex="(curH !== -1 && curPm === (i === 1)) || (curH === -1 && i === 0) ? 0 : -1" @click="pickPeriod(i === 1)">{{ p }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mi-dp { display: inline-flex; flex-wrap: wrap; gap: 8px; font-family: var(--mi-font); }
.mi-dp__btn {
  position: relative; display: inline-flex; align-items: center; gap: 8px; height: 34px; margin: 0; padding: 0 12px; border: 0; border-radius: 8px;
  background: var(--mi-fill3); color: var(--mi-label); font: inherit; font-size: 15px; font-weight: 500; letter-spacing: -.01em; white-space: nowrap; cursor: pointer;
  transition: transform var(--mi-dur-1) var(--mi-ease);
}
.mi-dp__btn svg { color: var(--mi-p-text); }
.mi-dp__btn:active { transform: scale(.97); }
.mi-dp__btn.is-placeholder { color: var(--mi-label2); }
.mi-dp__btn.is-invalid { box-shadow: inset 0 0 0 1.5px var(--mi-red-t); }
.mi-dp__btn:disabled { opacity: .5; cursor: not-allowed; }
.mi-dp__btn:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 2px; }
</style>

<style>
.mi-dp__panel {
  position: fixed; z-index: 1000; box-sizing: border-box; border-radius: 16px; padding: 16px; background: var(--mi-elev); color: var(--mi-label);
  box-shadow: var(--mi-sh3), inset 0 0 0 .5px var(--mi-mat-b); font-family: var(--mi-font); transform-origin: left var(--mi-origin, top); contain: layout paint;
}
.mi-dp__panel--date { width: 348px; max-width: calc(100vw - 16px); overflow-y: auto; }
.mi-dp__panel--time { padding: 8px; }
.mi-dp__cols { display: flex; gap: 4px; }
.mi-dp__col { display: flex; flex-direction: column; gap: 2px; width: 64px; max-height: 232px; overflow-y: auto; padding: 2px; overscroll-behavior: contain; scrollbar-width: none; }
.mi-dp__col::-webkit-scrollbar { display: none; }
.mi-dp__opt { flex: none; height: 36px; margin: 0; padding: 0; border: 0; border-radius: 8px; background: transparent; color: var(--mi-label); font: inherit; font-size: 17px; font-variant-numeric: tabular-nums; cursor: pointer; }
.mi-dp__opt:hover { background: var(--mi-fill3); }
.mi-dp__opt[aria-selected="true"] { background: var(--mi-p); color: var(--mi-p-on); font-weight: 600; }
.mi-dp__opt:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 0; }
.mi-dp-pop-enter-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); will-change: transform, opacity; }
.mi-dp-pop-leave-active { transition: opacity var(--mi-dur-1) var(--mi-ease-in-out), transform var(--mi-dur-1) var(--mi-ease-in-out); will-change: transform, opacity; }
.mi-dp-pop-enter-from, .mi-dp-pop-leave-to { opacity: 0; transform: scale(.96) translateY(-4px); }
</style>
