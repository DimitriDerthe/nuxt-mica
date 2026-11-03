<template>
  <section class="saf mi:@container mi:font-mi mi:text-label" aria-labelledby="saf-title">
    <div class="saf__wrap mi:grid mi:gap-4">
      <header class="saf__head mi:grid mi:gap-3 mi:@[620px]:grid-cols-[1fr_220px] mi:@[620px]:items-end">
        <div>
          <MiText id="saf-title" variant="title3" as="h2" weight="semibold">Needs your attention</MiText>
          <MiText variant="footnote" tone="label2">Suggested from what changed in Harbor Analytics since Friday</MiText>
        </div>
        <div class="saf__score mi:grid mi:gap-1.5">
          <MiText variant="caption" tone="label2" weight="medium">{{ handled }} of {{ ITEMS.length }} handled</MiText>
          <div class="saf__bar mi:h-1.5 mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden" role="meter" aria-label="Suggestions handled" :aria-valuenow="handled" aria-valuemin="0" :aria-valuemax="ITEMS.length">
            <span class="mi:[.saf__bar_&]:block mi:[.saf__bar_&]:h-full mi:[.saf__bar_&]:rounded-[inherit] mi:[.saf__bar_&]:origin-left mi:[.saf__bar_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${handled / ITEMS.length})` }" />
          </div>
        </div>
      </header>

      <div class="saf__chips mi:flex mi:flex-wrap mi:gap-2" role="group" aria-label="Filter by area">
        <MiChip v-for="a in AREAS" :key="a.id" selectable size="small" :label="`${a.label} · ${openIn(a.id)}`" :model-value="area === a.id" @update:model-value="area = a.id" />
      </div>

      <ul class="saf__grid mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:grid-cols-2 mi:@[900px]:grid-cols-3">
        <li v-for="s in shown" :key="s.id" class="saf__card mi:grid mi:content-start mi:gap-1.5 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&[data-state='snoozed']]:opacity-62" :data-state="state[s.id]">
          <div class="saf__top mi:flex mi:items-center mi:justify-between mi:gap-2 mi:mb-1">
            <span class="saf__tile mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:rounded-md mi:bg-fill4 mi:text-label2" :data-tone="s.tone"><MiIcon :name="s.icon" :size="18" /></span>
            <MiBadge :tone="s.tone === 'risk' ? 'danger' : s.tone === 'money' ? 'warning' : 'neutral'" :label="s.impact" />
          </div>
          <MiText variant="subheadline" as="h3" weight="semibold">{{ s.title }}</MiText>
          <MiText variant="footnote" tone="label2">{{ s.detail }}</MiText>

          <div v-if="state[s.id] === 'open'" class="saf__acts mi:flex mi:flex-wrap mi:gap-1.5 mi:mt-2">
            <MiButton size="small" @click="set(s, 'done')">{{ s.action }}</MiButton>
            <MiButton size="small" variant="plain" @click="set(s, 'snoozed')">Remind me Monday</MiButton>
          </div>
          <div v-else class="saf__done mi:flex mi:items-center mi:gap-2 mi:mt-2 mi:pt-1.5 mi:pr-1 mi:pb-1.5 mi:pl-2.5 mi:rounded-md mi:bg-fill4">
            <MiIcon :name="state[s.id] === 'done' ? 'check-circle-fill' : 'calendar'" :size="16" />
            <MiText variant="footnote" weight="medium">{{ state[s.id] === 'done' ? s.result : 'Back on Monday, 9:00' }}</MiText>
            <MiButton size="small" variant="plain" @click="set(s, 'open')">Undo</MiButton>
          </div>
        </li>
      </ul>

      <p class="saf__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:m-0" aria-live="polite">{{ announce }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Area = 'all' | 'billing' | 'team' | 'security'
type State = 'open' | 'done' | 'snoozed'
interface Suggestion {
  id: string, area: Exclude<Area, 'all'>, icon: 'billing' | 'people' | 'lock' | 'warning' | 'person' | 'document'
  tone: 'risk' | 'money' | 'calm', title: string, detail: string, impact: string, action: string, result: string
}

const AREAS: { id: Area, label: string }[] = [
  { id: 'all', label: 'All' }, { id: 'billing', label: 'Billing' }, { id: 'team', label: 'Team' }, { id: 'security', label: 'Security' }
]

// Sample signals; each one comes from a rule on your data.
const ITEMS: Suggestion[] = [
  { id: 'overdue', area: 'billing', icon: 'billing', tone: 'money', title: '3 invoices are 14+ days overdue', detail: 'Lumen Freight, Okapi Labs and Brightwater owe $8,420 together.', impact: '$8,420', action: 'Send reminders', result: 'Reminders sent to 3 clients' },
  { id: 'mfa', area: 'security', icon: 'lock', tone: 'risk', title: '2 admins have no two-step login', detail: 'Admins can export every dashboard. Ask them to add an authenticator.', impact: 'High risk', action: 'Require it now', result: 'Required at next sign-in' },
  { id: 'seats', area: 'team', icon: 'people', tone: 'money', title: '4 seats unused for 30 days', detail: 'Freeing them lowers the next invoice on 1 December.', impact: '−$96 / mo', action: 'Review seats', result: '4 seats freed' },
  { id: 'invites', area: 'team', icon: 'person', tone: 'calm', title: '5 invitations never accepted', detail: 'Sent between 2 and 3 weeks ago to the design team.', impact: '5 people', action: 'Resend invites', result: 'Invitations resent' },
  { id: 'keys', area: 'security', icon: 'warning', tone: 'risk', title: 'API key unused since August', detail: '“Zapier sync” still has write access to reports.', impact: 'Stale key', action: 'Revoke key', result: 'Key revoked' },
  { id: 'tax', area: 'billing', icon: 'document', tone: 'calm', title: 'VAT number missing', detail: 'Add it so invoices from December show 0% reverse charge.', impact: 'Next invoice', action: 'Add VAT number', result: 'Saved to billing profile' }
]

const area = ref<Area>('all')
const state = reactive<Record<string, State>>(Object.fromEntries(ITEMS.map(i => [i.id, 'open'])))
const announce = ref('')

const shown = computed(() => ITEMS.filter(i => area.value === 'all' || i.area === area.value))
const handled = computed(() => ITEMS.filter(i => state[i.id] !== 'open').length)
const openIn = (a: Area) => ITEMS.filter(i => (a === 'all' || i.area === a) && state[i.id] === 'open').length

function set(s: Suggestion, to: State) {
  state[s.id] = to
  announce.value = to === 'done' ? s.result : to === 'snoozed' ? `${s.title}: snoozed until Monday` : `${s.title}: back in your list`
}
</script>

<style scoped>
.saf__bar span { background: var(--mi-green); }
.saf__tile[data-tone="risk"] { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.saf__tile[data-tone="money"] { background: var(--mi-p-tint); color: var(--mi-p-text); }
.saf__done :deep(svg) { flex: none; color: var(--mi-green); }
.saf__done > :nth-child(2) { flex: 1; min-width: 0; }
.saf__card[data-state="snoozed"] .saf__done :deep(svg) { color: var(--mi-label2); }
</style>
