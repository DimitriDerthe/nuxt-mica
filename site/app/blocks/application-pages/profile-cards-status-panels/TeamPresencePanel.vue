<template>
  <section class="tpp mi:@container mi:font-mi mi:text-label" aria-labelledby="tpp-title">
    <div class="tpp__in mi:grid mi:gap-3.5 mi:@[900px]:grid-cols-[320px_minmax(0,_1fr)] mi:@[900px]:items-start">
    <!-- Your own status, editable; the card on the right previews what teammates see. -->
    <article class="tpp__me mi:grid mi:gap-3.5 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
      <div class="tpp__me-head mi:grid mi:gap-0.5">
        <MiText id="tpp-title" as="h2" variant="headline" weight="semibold">Your status</MiText>
        <MiText variant="caption" tone="label2">Visible to the Lighthouse team</MiText>
      </div>
      <MiSegmented v-model="presence" label="Presence" :options="presenceOptions" class="tpp__seg mi:max-w-full" />
      <MiField label="What are you up to?">
        <template #default="{ id }">
          <MiInput :id="id" v-model="note" clearable placeholder="Add a short status" />
        </template>
      </MiField>
      <div class="tpp__presets mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Suggestions">
        <MiChip v-for="p in presets" :key="p" size="small" tone="neutral" :label="p" selectable :model-value="note === p" @update:model-value="note = $event ? p : ''" />
      </div>
      <MiField label="Clear after">
        <template #default="{ id }">
          <MiNativeSelect :id="id" v-model="clearAfter" size="sm" :options="clearOptions" />
        </template>
      </MiField>
      <div class="tpp__preview mi:flex mi:items-center mi:gap-3 mi:p-3 mi:rounded-lg mi:[background:linear-gradient(120deg,_var(--mi-p-tint),_transparent_80%),_var(--mi-fill4)] mi:min-w-0" aria-live="polite">
        <MiBadge dot-only :tone="tones[String(presence)]" :dot-size="12" placement="bottom-right">
          <template #target><MiAvatar name="Nadia Haddad" size="md" tone="auto" decorative /></template>
        </MiBadge>
        <div class="tpp__preview-text mi:min-w-0">
          <MiText variant="subheadline" weight="semibold">Nadia Haddad <MiText as="span" variant="caption" tone="label2" weight="regular">· you</MiText></MiText>
          <MiText variant="footnote" tone="label2" :lines="1">{{ presenceLabel }}{{ note ? ' · ' + note : '' }}</MiText>
        </div>
      </div>
    </article>

    <!-- Teammates, each with a 24-hour strip showing when your working days overlap. -->
    <ul class="tpp__team mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Teammates">
      <li v-for="p in people" :key="p.name" class="tpp__card mi:[@container_(min-width:_600px)_and_(max-width:_899px)]:last:col-[span_2] mi:grid mi:content-start mi:gap-3 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
        <div class="tpp__who mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3">
          <MiBadge dot-only :tone="tones[p.presence]" :dot-size="12" placement="bottom-right" :aria-label="p.presence">
            <template #target><MiAvatar :name="p.name" size="md" tone="auto" decorative /></template>
          </MiBadge>
          <div class="tpp__who-text mi:min-w-0">
            <MiText as="h3" variant="subheadline" weight="semibold" :lines="1">{{ p.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ p.role }}</MiText>
          </div>
          <div class="tpp__clock mi:grid mi:justify-items-end">
            <MiText as="span" variant="subheadline" weight="semibold" tabular>{{ p.local }}</MiText>
            <MiText as="span" variant="caption2" tone="label2">{{ p.city }}</MiText>
          </div>
        </div>
        <MiText variant="footnote" :lines="2" class="tpp__status mi:min-h-[2.6em]">{{ p.status }}</MiText>

        <div class="tpp__strip-wrap mi:grid mi:gap-1">
          <div class="tpp__strip mi:grid mi:grid-cols-24 mi:gap-0.5 mi:h-5.5" role="img" :aria-label="p.overlapText">
            <span
              v-for="(c, h) in p.cells" :key="h" class="tpp__cell mi:relative mi:rounded-[3px] mi:[background:var(--mi-fill4)] mi:[&.is-now]:after:content-[''] mi:[&.is-now]:after:absolute mi:[&.is-now]:after:left-1/2 mi:[&.is-now]:after:-top-1 mi:[&.is-now]:after:-bottom-1 mi:[&.is-now]:after:w-0.5 mi:[&.is-now]:after:-ml-px mi:[&.is-now]:after:rounded-[1px] mi:[&.is-now]:after:[background:var(--mi-label)]"
              :class="{ 'is-them': c.them, 'is-me': c.me, 'is-both': c.them && c.me, 'is-now': h === nowMine }"
            />
          </div>
          <div class="tpp__axis mi:flex mi:justify-between mi:text-[10px] mi:text-label3 mi:tabular-nums" aria-hidden="true"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
        </div>
        <div class="tpp__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2 mi:pt-2.5 mi:border-t mi:border-t-sep">
          <MiText variant="caption" :tone="p.overlap ? 'label' : 'orange'" weight="medium">{{ p.overlapText }}</MiText>
          <MiButton variant="gray" size="small">{{ p.presence === 'focus' ? 'Leave a note' : 'Message' }}</MiButton>
        </div>
      </li>
    </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Presence = 'available' | 'focus' | 'away'
const presenceOptions = [{ value: 'available', label: 'Available' }, { value: 'focus', label: 'Focusing' }, { value: 'away', label: 'Away' }]
const tones: Record<string, 'success' | 'warning' | 'neutral'> = { available: 'success', focus: 'warning', away: 'neutral' }
const presets = ['In a design review', 'Heads down until 15:00', 'On the train, slow replies']
const clearOptions = [{ value: '1h', label: 'In 1 hour' }, { value: 'today', label: 'At the end of today' }, { value: 'never', label: "Don't clear" }]

const presence = ref<string | number | null>('focus')
const note = ref('Heads down until 15:00')
const clearAfter = ref<string | number | null>('today')
const presenceLabel = computed(() => presenceOptions.find(o => o.value === presence.value)?.label ?? '')

// Sample "now" fixed at 13:20 UTC so the preview renders the same everywhere.
const NOW_UTC = 13 + 20 / 60
const ME = { offset: 1, start: 9, end: 18 }
const nowMine = Math.floor(NOW_UTC + ME.offset) % 24

const team = [
  { name: 'Kenji Watanabe', role: 'Platform engineer', city: 'Tokyo', offset: 9, start: 10, end: 19, presence: 'away' as Presence, status: 'Signed off. Back tomorrow at 10:00 JST.' },
  { name: 'Sofia Marquez', role: 'Product designer', city: 'Lisbon', offset: 0, start: 9, end: 18, presence: 'available' as Presence, status: 'Reviewing the onboarding flow, ping me with feedback.' },
  { name: 'Daniel Okoye', role: 'Support lead', city: 'New York', offset: -5, start: 8, end: 17, presence: 'focus' as Presence, status: 'Clearing the weekend queue · 23 tickets left' }
]

const pad = (n: number) => String(((n % 24) + 24) % 24).padStart(2, '0')
const inShift = (h: number, s: number, e: number) => h >= s && h < e

const people = team.map((p) => {
  // One cell per hour of *your* day; each is checked against their shift in their own time.
  const cells = Array.from({ length: 24 }, (_, h) => {
    const theirs = (((h - ME.offset + p.offset) % 24) + 24) % 24
    return { me: inShift(h, ME.start, ME.end), them: inShift(theirs, p.start, p.end) }
  })
  const both = cells.map((c, h) => (c.me && c.them ? h : -1)).filter(h => h >= 0)
  const overlap = both.length
  const t = NOW_UTC + p.offset
  return {
    ...p, cells, overlap,
    local: `${pad(Math.floor(t))}:${String(Math.round((t % 1) * 60)).padStart(2, '0')}`,
    overlapText: overlap ? `${overlap} h overlap · ${pad(both[0]!)}:00–${pad(both[overlap - 1]! + 1)}:00 your time` : 'No overlap with your day'
  }
})
</script>

<style scoped>
@container (min-width: 600px) and (max-width: 899px) { .tpp__team { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 1140px) { .tpp__team { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.tpp__status { color: var(--mi-label2); }
.tpp__cell.is-me { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-p) 45%, transparent); }
.tpp__cell.is-them { background: color-mix(in srgb, var(--mi-s) 30%, transparent); }
.tpp__cell.is-both { background: var(--mi-p); box-shadow: none; }
</style>
