<template>
  <section class="mi:relative mi:@container mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label mi:rounded-xl mi:overflow-hidden mi:isolate" aria-labelledby="book-slot-heading">
    <MiText id="book-slot-heading" variant="title3" as="h2" weight="semibold" class="mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)] mi:overflow-hidden! mi:whitespace-nowrap!">Schedule a meeting</MiText>

    <!-- Faux page and scrim behind the dialog; decorative only. -->
    <div class="mi:absolute mi:inset-0 mi:-z-1 mi:grid mi:content-start mi:gap-3.5 mi:p-5 mi:bg-page mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:bg-scrim" aria-hidden="true">
      <div class="mi:rounded-md mi:bg-card mi:shadow-1 mi:h-11" />
      <div class="mi:rounded-md mi:bg-card mi:shadow-1 mi:w-[40%] mi:h-5.5 mi:bg-fill3 mi:shadow-none" />
      <div class="mi:grid mi:grid-cols-3 mi:gap-3"><div class="mi:rounded-md mi:bg-card mi:shadow-1 mi:h-30" /><div class="mi:rounded-md mi:bg-card mi:shadow-1 mi:h-30" /><div class="mi:rounded-md mi:bg-card mi:shadow-1 mi:h-30" /></div>
      <div class="mi:rounded-md mi:bg-card mi:shadow-1 mi:h-55" />
    </div>

    <div class="mi:grid mi:place-items-center mi:py-7 mi:px-3 mi:@[600px]:py-10 mi:@[600px]:px-6">
      <MiDialog :model-value="true" inline variant="dialog" icon="calendar" title="Design review: onboarding v3" :close-on-action="false">
        <div v-if="!booked" class="mi:grid mi:gap-3.5 mi:text-start mi:text-label">
          <div class="mi:flex mi:items-center mi:gap-2.5">
            <MiAvatarGroup :items="people.map(p => ({ name: p.name, tone: p.tone }))" :size="26" :max="3" />
            <MiText variant="footnote" tone="label2">With Ines and Tomás · Paris time</MiText>
          </div>

          <MiSegmented v-model="duration" label="Duration" :options="durations" />

          <div class="mi:-mx-1.5">
            <MiCalendar v-model="date" :today="today" :min="today" :max="lastDay" :is-disabled="isWeekend" :first-day="1" fixed-rows @update:model-value="slot = null" />
          </div>

          <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
            <MiText variant="footnote" weight="semibold" as="h3" class="mi:m-0!">{{ dayLabel }}</MiText>
            <MiButton variant="plain" size="mini" @click="suggest">First time all free</MiButton>
          </div>

          <div v-if="slots.length" class="mi:grid mi:grid-cols-3 mi:gap-1.5 mi:max-h-49 mi:overflow-y-auto mi:p-0.5 mi:overscroll-contain" role="radiogroup" aria-label="Start time">
            <button
              v-for="s in slots" :key="s.start" type="button" role="radio" class="mi:grid mi:justify-items-center mi:gap-1 mi:pt-2 mi:px-1 mi:pb-[7px] mi:border mi:rounded-[10px] mi:[font:inherit] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[&:hover:not(:disabled)]:border-p mi:[&:active:not(:disabled)]:transform-[scale(.95)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:disabled:opacity-40 mi:disabled:cursor-not-allowed mi:disabled:[text-decoration:line-through]"
              :class="slot === s.start ? 'mi:border-p mi:bg-p mi:text-p-on' : s.free === people.length ? 'mi:border-green/55 mi:[background:color-mix(in_srgb,_var(--mi-green)_8%,_var(--mi-card))] mi:text-label' : 'mi:border-sep mi:bg-card mi:text-label'" :aria-checked="slot === s.start" :disabled="!s.youFree"
              :aria-label="`${fmt(s.start)}, ${s.youFree ? s.free + ' of ' + people.length + ' free' : 'you are busy'}`"
              @click="slot = s.start"
            >
              <span class="mi:text-[14px] mi:font-semibold mi:tabular-nums">{{ fmt(s.start) }}</span>
              <span class="mi:inline-flex mi:gap-[3px] mi:align-middle" aria-hidden="true">
                <i class="mi:w-1.5 mi:h-1.5 mi:rounded-[50%]" v-for="(f, i) in s.each" :key="i" :class="slot === s.start ? (f ? 'mi:bg-p-on' : 'mi:[background:color-mix(in_srgb,_var(--mi-p-on)_40%,_transparent)]') : (f ? 'mi:bg-green' : 'mi:bg-fill')" />
              </span>
            </button>
          </div>
          <MiText v-else variant="footnote" tone="label2">No openings that day.</MiText>
          <MiText variant="caption" tone="label2" class="mi:block!">
            <span class="mi:inline-flex mi:gap-[3px] mi:align-middle" aria-hidden="true"><i class="mi:w-1.5 mi:h-1.5 mi:rounded-[50%] mi:bg-green" /></span> free ·
            <span class="mi:inline-flex mi:gap-[3px] mi:align-middle" aria-hidden="true"><i class="mi:w-1.5 mi:h-1.5 mi:rounded-[50%] mi:bg-fill" /></span> busy, in the order you, Ines, Tomás
          </MiText>
        </div>

        <div v-else class="mi:grid mi:justify-items-center mi:gap-2 mi:pt-3 mi:px-0 mi:pb-1 mi:text-center" role="status">
          <span class="mi:grid mi:place-items-center mi:w-13 mi:h-13 mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)] mi:text-green-t"><MiIcon name="check" :size="22" :weight="2.6" /></span>
          <MiText variant="headline" as="h3" class="mi:m-0!">Booked for {{ summary }}</MiText>
          <MiText variant="footnote" tone="label2">Invites sent to Ines Duarte and Tomás Ruiz. The room Méliès is held for you.</MiText>
        </div>

        <template #actions>
          <div class="mi:grid mi:gap-2.5 mi:w-full">
            <MiText v-if="!booked" variant="footnote" :tone="slot === null ? 'label3' : 'label'" weight="medium" class="mi:text-center mi:tabular-nums!">
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
