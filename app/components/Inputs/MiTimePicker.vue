<script lang="ts">
export type MiTimeSegment = 'hour' | 'minute' | 'second'

export interface MiTimeParts { h: number, m: number, s: number }

/** Parses `HH:mm` or `HH:mm:ss`; returns null when the text is not a valid time. */
export function miParseTime(v: string | null | undefined): MiTimeParts | null {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec((v ?? '').trim())
  if (!m) return null
  const p = { h: Number(m[1]), m: Number(m[2]), s: Number(m[3] ?? 0) }
  return p.h > 23 || p.m > 59 || p.s > 59 ? null : p
}

const pad = (n: number) => String(n).padStart(2, '0')

export function miFormatTime(p: MiTimeParts, seconds: boolean): string {
  return `${pad(p.h)}:${pad(p.m)}${seconds ? `:${pad(p.s)}` : ''}`
}
</script>

<script setup lang="ts">
/** Standalone time field with hour, minute and optional second spinbuttons, 12 or 24 hour display, step, min and max, and an AM/PM toggle. */
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  /** Use a 12 hour clock with an AM/PM toggle instead of 24 hours. */
  hour12?: boolean
  /** Increment of the minute segment; typed values snap to it. */
  minuteStep?: number
  /** Earliest allowed time as `HH:mm` or `HH:mm:ss`; values below are raised to it. */
  min?: string
  /** Latest allowed time as `HH:mm` or `HH:mm:ss`; values above are lowered to it. */
  max?: string
  /** Adds a seconds segment and emits `HH:mm:ss`. */
  seconds?: boolean
  /** Accessible name of the group. */
  label?: string
  /** Name of a hidden input carrying the value for native form posts. */
  name?: string
  /** Blocks interaction and dims the field. */
  disabled?: boolean
  /** Draws the error border. */
  invalid?: boolean
}>(), {
  minuteStep: 1,
  label: 'Time'
})

/** Selected time as `HH:mm` (`HH:mm:ss` with `seconds`), or null when empty. */

const model = defineModel<string | null>({ default: null })

const refs = ref<Record<string, HTMLElement | null>>({})
let buffer = ''
let bufferTimer: ReturnType<typeof setTimeout> | undefined

const parts = computed(() => miParseTime(model.value))
const order = computed<MiTimeSegment[]>(() => (props.seconds ? ['hour', 'minute', 'second'] : ['hour', 'minute']))
const lo = computed(() => miParseTime(props.min))
const hi = computed(() => miParseTime(props.max))
const stepM = computed(() => Math.max(1, Math.floor(props.minuteStep)))
const toSec = (p: MiTimeParts) => p.h * 3600 + p.m * 60 + p.s
const pm = computed(() => (parts.value ? parts.value.h >= 12 : false))

function shown(seg: MiTimeSegment): number | null {
  const p = parts.value
  if (!p) return null
  if (seg === 'minute') return p.m
  if (seg === 'second') return p.s
  return props.hour12 ? (p.h % 12 === 0 ? 12 : p.h % 12) : p.h
}
const text = (seg: MiTimeSegment) => {
  const v = shown(seg)
  return v === null ? '--' : pad(v)
}
const bounds = (seg: MiTimeSegment): [number, number] => {
  if (seg === 'hour') return props.hour12 ? [1, 12] : [0, 23]
  return [0, 59]
}

function commit(p: MiTimeParts) {
  let t = p
  if (lo.value && toSec(t) < toSec(lo.value)) t = { ...lo.value }
  if (hi.value && toSec(t) > toSec(hi.value)) t = { ...hi.value }
  const next = miFormatTime(t, props.seconds)
  if (next !== model.value) model.value = next
}

const base = (): MiTimeParts => parts.value ?? lo.value ?? { h: 0, m: 0, s: 0 }
const mod = (n: number, m: number) => ((n % m) + m) % m

/** Sets one segment from its displayed value, keeping the AM/PM period on a 12 hour clock. */
function setSeg(seg: MiTimeSegment, v: number) {
  const p = { ...base() }
  if (seg === 'hour') p.h = props.hour12 ? mod(v, 12) + (parts.value && pm.value ? 12 : 0) : v
  else if (seg === 'minute') p.m = v
  else p.s = v
  commit(p)
}

const lastMinute = () => Math.floor(59 / stepM.value) * stepM.value

/** Next minute on the step grid, wrapping at the hour. */
function nextMinute(m: number, dir: 1 | -1): number {
  const step = stepM.value
  if (dir === 1) {
    const n = (Math.floor(m / step) + 1) * step
    return n > 59 ? 0 : n
  }
  const n = (Math.ceil(m / step) - 1) * step
  return n < 0 ? lastMinute() : n
}

function bump(seg: MiTimeSegment, dir: 1 | -1, factor = 1) {
  const p = { ...base() }
  if (!parts.value) { commit(p); return }
  if (seg === 'hour') {
    if (props.hour12) p.h = (p.h >= 12 ? 12 : 0) + mod(p.h + dir * factor, 12)
    else p.h = mod(p.h + dir * factor, 24)
  } else if (seg === 'minute') {
    for (let k = 0; k < factor; k++) p.m = nextMinute(p.m, dir)
  } else {
    p.s = mod(p.s + dir * factor, 60)
  }
  commit(p)
}

function togglePeriod(force?: boolean) {
  if (props.disabled) return
  const p = { ...base() }
  const toPm = force ?? !(p.h >= 12)
  p.h = (p.h % 12) + (toPm ? 12 : 0)
  commit(p)
}

function focusSeg(seg: MiTimeSegment) {
  refs.value[seg]?.focus()
}

function resetBuffer() {
  buffer = ''
  clearTimeout(bufferTimer)
}

function typeDigit(seg: MiTimeSegment, d: string) {
  const [min, max] = bounds(seg)
  let next = buffer + d
  let n = Number(next)
  if (n > max) { next = d; n = Number(d) }
  buffer = next
  clearTimeout(bufferTimer)
  bufferTimer = setTimeout(resetBuffer, 1500)
  const done = n * 10 > max || next.length >= 2
  if (n >= min || done) {
    if (n >= min) setSeg(seg, seg === 'minute' && stepM.value > 1 ? Math.min(59, Math.round(n / stepM.value) * stepM.value) : n)
  }
  if (done) {
    resetBuffer()
    const i = order.value.indexOf(seg)
    const nextSeg = order.value[i + 1]
    if (nextSeg) focusSeg(nextSeg)
  }
}

function onKey(seg: MiTimeSegment, e: KeyboardEvent) {
  if (props.disabled || e.ctrlKey || e.metaKey || e.altKey) return
  const k = e.key
  const big = seg === 'hour' ? 3 : 10
  if (k === 'ArrowUp') bump(seg, 1)
  else if (k === 'ArrowDown') bump(seg, -1)
  else if (k === 'PageUp') bump(seg, 1, big)
  else if (k === 'PageDown') bump(seg, -1, big)
  else if (k === 'Home') setSeg(seg, bounds(seg)[0])
  else if (k === 'End') setSeg(seg, seg === 'minute' ? lastMinute() : bounds(seg)[1])
  else if (k === 'Backspace' || k === 'Delete') { model.value = null; resetBuffer() }
  else if (k === 'ArrowRight' || k === 'ArrowLeft') {
    const n = order.value[order.value.indexOf(seg) + (k === 'ArrowRight' ? 1 : -1)]
    if (n) focusSeg(n)
    else if (k === 'ArrowRight' && props.hour12) (refs.value.period as HTMLElement | null)?.focus()
    else return
  } else if (/^\d$/.test(k)) typeDigit(seg, k)
  else return
  e.preventDefault()
}

function onPeriodKey(e: KeyboardEvent) {
  const k = e.key.toLowerCase()
  if (k === 'arrowup' || k === 'arrowdown') togglePeriod()
  else if (k === 'a') togglePeriod(false)
  else if (k === 'p') togglePeriod(true)
  else if (k === 'arrowleft') focusSeg(order.value[order.value.length - 1]!)
  else return
  e.preventDefault()
}

const SEG_NAME: Record<MiTimeSegment, string> = { hour: 'Hours', minute: 'Minutes', second: 'Seconds' }
const valueText = (seg: MiTimeSegment) => (shown(seg) === null ? 'Empty' : text(seg))
</script>

<template>
  <div class="mi-tp mi:inline-flex mi:items-center mi:gap-0.5 mi:min-h-11 mi:py-1 mi:px-2 mi:rounded-[10px] mi:bg-field mi:shadow-[inset_0_0_0_1px_var(--mi-field-b)] mi:font-mi mi:tabular-nums mi:[&.is-disabled]:opacity-45 mi:[&.is-invalid]:shadow-[inset_0_0_0_1.5px_var(--mi-red)] mi:focus-within:shadow-[inset_0_0_0_1.5px_var(--mi-p),_0_0_0_3px_color-mix(in_srgb,_var(--mi-p)_28%,_transparent)]" :class="{ 'is-disabled': disabled, 'is-invalid': invalid }" role="group" :aria-label="label" :aria-disabled="disabled || undefined">
    <template v-for="(seg, i) in order" :key="seg">
      <span v-if="i" class="mi-tp__sep mi:text-label2 mi:font-semibold" aria-hidden="true">:</span>
      <span
        :ref="(el) => (refs[seg] = el as HTMLElement | null)"
        class="mi-tp__seg mi:min-w-8.5 mi:py-1.5 mi:px-1 mi:rounded-[7px] mi:text-center mi:font-semibold mi:[outline:none] mi:caret-transparent mi:select-none mi:touch-manipulation mi:[&.is-empty]:text-label2 mi:focus:bg-p mi:focus:text-p-on"
        :class="{ 'is-empty': shown(seg) === null }"
        role="spinbutton"
        :tabindex="disabled ? -1 : 0"
        :aria-label="SEG_NAME[seg]"
        :aria-valuemin="bounds(seg)[0]"
        :aria-valuemax="bounds(seg)[1]"
        :aria-valuenow="shown(seg) ?? undefined"
        :aria-valuetext="valueText(seg)"
        :aria-disabled="disabled || undefined"
        @keydown="onKey(seg, $event)"
        @blur="resetBuffer"
      >{{ text(seg) }}</span>
    </template>
    <button
      v-if="hour12"
      :ref="(el) => (refs.period = el as HTMLElement | null)"
      type="button"
      class="mi-tp__period mi:relative mi:isolate mi:inline-grid mi:grid-cols-[1fr_1fr] mi:ml-2 mi:p-0.5 mi:[border:0] mi:rounded-[9px] mi:bg-fill3 mi:text-label mi:cursor-pointer mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[2px]"
      :aria-label="`AM or PM, ${pm ? 'PM' : 'AM'}`"
      :disabled="disabled"
      @click="togglePeriod()"
      @keydown="onPeriodKey"
    >
      <span class="mi-tp__thumb mi:absolute mi:-z-1 mi:top-0.5 mi:bottom-0.5 mi:left-0.5 mi:w-[calc(50%_-_2px)] mi:rounded-[7px] mi:bg-seg mi:shadow-1 mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[&.is-pm]:transform-[translate3d(100%,_0,_0)]" :class="{ 'is-pm': pm }" aria-hidden="true" />
      <span class="mi-tp__opt mi:py-1.5 mi:px-[9px] mi:text-center mi:text-label2 mi:[&.is-on]:text-label" :class="{ 'is-on': !pm }">AM</span>
      <span class="mi-tp__opt mi:py-1.5 mi:px-[9px] mi:text-center mi:text-label2 mi:[&.is-on]:text-label" :class="{ 'is-on': pm }">PM</span>
    </button>
    <input v-if="name" type="hidden" :name="name" :value="model ?? ''">
  </div>
</template>

<style scoped>
.mi-tp { font-size: 17px; color: var(--mi-label);
}
.mi-tp__period { font: inherit; font-size: 13px; font-weight: 600;
}
</style>
