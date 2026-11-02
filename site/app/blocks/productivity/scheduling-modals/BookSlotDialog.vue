<template>
  <section class="bk" aria-labelledby="book-slot-heading">
    <MiText id="book-slot-heading" variant="title3" as="h2" weight="semibold" class="bk__sr">Schedule a meeting</MiText>

    <!-- Faux page and scrim behind the dialog; decorative only. -->
    <div class="bk__backdrop" aria-hidden="true">
      <div class="bk__ghost bk__ghost--bar" />
      <div class="bk__ghost bk__ghost--title" />
      <div class="bk__ghost-row"><div class="bk__ghost bk__ghost--card" /><div class="bk__ghost bk__ghost--card" /><div class="bk__ghost bk__ghost--card" /></div>
      <div class="bk__ghost bk__ghost--wide" />
    </div>

    <div class="bk__center">
      <MiDialog :model-value="true" inline variant="dialog" icon="calendar" title="Design review: onboarding v3" :close-on-action="false">
        <div v-if="!booked" class="bk__body">
          <div class="bk__who">
            <MiAvatarGroup :items="people.map(p => ({ name: p.name, tone: p.tone }))" :size="26" :max="3" />
            <MiText variant="footnote" tone="label2">With Ines and Tomás · Paris time</MiText>
          </div>

          <MiSegmented v-model="duration" label="Duration" :options="durations" />

          <div class="bk__cal">
            <MiCalendar v-model="date" :today="today" :min="today" :max="lastDay" :is-disabled="isWeekend" :first-day="1" fixed-rows @update:model-value="slot = null" />
          </div>

          <div class="bk__slots-head">
            <MiText variant="footnote" weight="semibold" as="h3">{{ dayLabel }}</MiText>
            <MiButton variant="plain" size="mini" @click="suggest">First time all free</MiButton>
          </div>

          <div v-if="slots.length" class="bk__slots" role="radiogroup" aria-label="Start time">
            <button
              v-for="s in slots" :key="s.start" type="button" role="radio" class="bk__slot"
              :class="{ 'is-on': slot === s.start, 'is-best': s.free === people.length }" :aria-checked="slot === s.start" :disabled="!s.youFree"
              :aria-label="`${fmt(s.start)}, ${s.youFree ? s.free + ' of ' + people.length + ' free' : 'you are busy'}`"
              @click="slot = s.start"
            >
              <span class="bk__slot-time">{{ fmt(s.start) }}</span>
              <span class="bk__dots" aria-hidden="true">
                <i v-for="(f, i) in s.each" :key="i" :class="{ 'is-free': f }" />
              </span>
            </button>
          </div>
          <MiText v-else variant="footnote" tone="label2">No openings that day.</MiText>
          <MiText variant="caption" tone="label2" class="bk__legend">
            <span class="bk__dots" aria-hidden="true"><i class="is-free" /></span> free ·
            <span class="bk__dots" aria-hidden="true"><i /></span> busy, in the order you, Ines, Tomás
          </MiText>
        </div>

        <div v-else class="bk__done" role="status">
          <span class="bk__check"><MiIcon name="check" :size="22" :weight="2.6" /></span>
          <MiText variant="headline" as="h3">Booked for {{ summary }}</MiText>
          <MiText variant="footnote" tone="label2">Invites sent to Ines Duarte and Tomás Ruiz. The room Méliès is held for you.</MiText>
        </div>

        <template #actions>
          <div class="bk__actions">
            <MiText v-if="!booked" variant="footnote" :tone="slot === null ? 'label3' : 'label'" weight="medium" class="bk__summary">
              {{ slot === null ? 'Pick a start time' : summary }}
            </MiText>
            <MiButton v-if="!booked" block :disabled="slot === null" @click="booked = true">Send invites</MiButton>
            <MiButton v-else block variant="gray" @click="booked = false">Change time</MiButton>
          </div>
        </template>
      </MiDialog>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const today = new Date(2026, 10, 2)
const lastDay = new Date(2026, 11, 18)
const people = [
  { name: 'You', tone: 'primary' as const },
  { name: 'Ines Duarte', tone: 'secondary' as const },
  { name: 'Tomás Ruiz', tone: 'teal' as const }
]

const durations = [{ value: 30, label: '30 min' }, { value: 45, label: '45 min' }, { value: 60, label: '1 hour' }]
const duration = ref<string | number | null>(45)
const date = ref<Date | null>(new Date(2026, 10, 5))
const slot = ref<number | null>(null)
const booked = ref(false)

const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6

/**
 * Sample availability: a stable pattern per person and quarter hour so the demo is the same for everyone.
 * Swap for a free/busy query to your calendar provider.
 */
function busy(person: number, d: Date, min: number) {
  if (min >= 12 * 60 && min < 13 * 60) return person !== 2
  const block = Math.floor(min / 30)
  const seed = d.getDate() * 13 + block * 7 + person * 11
  return seed % 5 === 0 || (person === 1 && seed % 7 === 0)
}

const slots = computed(() => {
  const d = date.value
  if (!d || isWeekend(d)) return []
  const len = Number(duration.value ?? 30)
  const out: { start: number, each: boolean[], free: number, youFree: boolean }[] = []
  for (let start = 9 * 60; start + len <= 18 * 60; start += 30) {
    const each = people.map((_, p) => {
      for (let m = start; m < start + len; m += 15) if (busy(p, d, m)) return false
      return true
    })
    out.push({ start, each, free: each.filter(Boolean).length, youFree: each[0]! })
  }
  return out
})

function suggest() {
  const d = new Date(date.value ?? today)
  for (let i = 0; i < 30; i++) {
    if (!isWeekend(d) && d >= today) {
      date.value = new Date(d)
      const hit = slots.value.find(s => s.free === people.length)
      if (hit) { slot.value = hit.start; return }
    }
    d.setDate(d.getDate() + 1)
  }
}

const fmt = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
const dayLabel = computed(() => date.value ? date.value.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Pick a day')
const summary = computed(() => {
  if (!date.value || slot.value === null) return ''
  const day = date.value.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  return `${day}, ${fmt(slot.value)}–${fmt(slot.value + Number(duration.value ?? 30))}`
})
</script>

<style scoped>
.bk { position: relative; container-type: inline-size; display: grid; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate; }
.bk__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.bk__backdrop { position: absolute; inset: 0; z-index: -1; display: grid; align-content: start; gap: 14px; padding: 20px; background: var(--mi-page); }
.bk__backdrop::after { content: ""; position: absolute; inset: 0; background: var(--mi-scrim); }
.bk__ghost { border-radius: var(--mi-radius-m); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.bk__ghost--bar { height: 44px; }
.bk__ghost--title { width: 40%; height: 22px; background: var(--mi-fill3); box-shadow: none; }
.bk__ghost-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.bk__ghost--card { height: 120px; }
.bk__ghost--wide { height: 220px; }

.bk__center { display: grid; place-items: center; padding: 28px 12px; }
@container (min-width: 600px) { .bk__center { padding: 40px 24px; } }

.bk__body { display: grid; gap: 14px; text-align: start; color: var(--mi-label); }
.bk__who { display: flex; align-items: center; gap: 10px; }
.bk__cal { margin-inline: -6px; }
.bk__slots-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.bk__slots-head h3 { margin: 0; }
.bk__slots { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; max-height: 196px; overflow-y: auto; padding: 2px; overscroll-behavior: contain; }
.bk__slot {
  display: grid; justify-items: center; gap: 4px; padding: 8px 4px 7px; border: 1px solid var(--mi-sep); border-radius: 10px;
  background: var(--mi-card); font: inherit; color: var(--mi-label); cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-spring);
}
.bk__slot:hover:not(:disabled) { border-color: var(--mi-p); }
.bk__slot:active:not(:disabled) { transform: scale(.95); }
.bk__slot:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.bk__slot.is-best { border-color: color-mix(in srgb, var(--mi-green) 55%, transparent); background: color-mix(in srgb, var(--mi-green) 8%, var(--mi-card)); }
.bk__slot.is-on { border-color: var(--mi-p); background: var(--mi-p); color: var(--mi-p-on); }
.bk__slot:disabled { opacity: .4; cursor: not-allowed; text-decoration: line-through; }
.bk__slot-time { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.bk__dots { display: inline-flex; gap: 3px; vertical-align: middle; }
.bk__dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--mi-fill); }
.bk__dots i.is-free { background: var(--mi-green); }
.bk__slot.is-on .bk__dots i { background: color-mix(in srgb, var(--mi-p-on) 40%, transparent); }
.bk__slot.is-on .bk__dots i.is-free { background: var(--mi-p-on); }
.bk__legend { display: block; }

.bk__actions { display: grid; gap: 10px; width: 100%; }
.bk__summary { text-align: center; font-variant-numeric: tabular-nums; }

.bk__done { display: grid; justify-items: center; gap: 8px; padding: 12px 0 4px; text-align: center; }
.bk__check { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: color-mix(in srgb, var(--mi-green) 16%, transparent); color: var(--mi-green-t); }
.bk__done h3 { margin: 0; }
</style>
