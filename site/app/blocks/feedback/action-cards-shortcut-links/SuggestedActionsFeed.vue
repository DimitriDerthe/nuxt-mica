<template>
  <section class="saf" aria-labelledby="saf-title">
    <div class="saf__wrap">
      <header class="saf__head">
        <div>
          <MiText id="saf-title" variant="title3" as="h2" weight="semibold">Needs your attention</MiText>
          <MiText variant="footnote" tone="label2">Suggested from what changed in Harbor Analytics since Friday</MiText>
        </div>
        <div class="saf__score">
          <MiText variant="caption" tone="label2" weight="medium">{{ handled }} of {{ ITEMS.length }} handled</MiText>
          <div class="saf__bar" role="meter" aria-label="Suggestions handled" :aria-valuenow="handled" aria-valuemin="0" :aria-valuemax="ITEMS.length">
            <span :style="{ transform: `scaleX(${handled / ITEMS.length})` }" />
          </div>
        </div>
      </header>

      <div class="saf__chips" role="group" aria-label="Filter by area">
        <MiChip v-for="a in AREAS" :key="a.id" selectable size="small" :label="`${a.label} · ${openIn(a.id)}`" :model-value="area === a.id" @update:model-value="area = a.id" />
      </div>

      <ul class="saf__grid">
        <li v-for="s in shown" :key="s.id" class="saf__card" :data-state="state[s.id]">
          <div class="saf__top">
            <span class="saf__tile" :data-tone="s.tone"><MiIcon :name="s.icon" :size="18" /></span>
            <MiBadge :tone="s.tone === 'risk' ? 'danger' : s.tone === 'money' ? 'warning' : 'neutral'" :label="s.impact" />
          </div>
          <MiText variant="subheadline" as="h3" weight="semibold">{{ s.title }}</MiText>
          <MiText variant="footnote" tone="label2">{{ s.detail }}</MiText>

          <div v-if="state[s.id] === 'open'" class="saf__acts">
            <MiButton size="small" @click="set(s, 'done')">{{ s.action }}</MiButton>
            <MiButton size="small" variant="plain" @click="set(s, 'snoozed')">Remind me Monday</MiButton>
          </div>
          <div v-else class="saf__done">
            <MiIcon :name="state[s.id] === 'done' ? 'check-circle-fill' : 'calendar'" :size="16" />
            <MiText variant="footnote" weight="medium">{{ state[s.id] === 'done' ? s.result : 'Back on Monday, 9:00' }}</MiText>
            <MiButton size="small" variant="plain" @click="set(s, 'open')">Undo</MiButton>
          </div>
        </li>
      </ul>

      <p class="saf__sr" aria-live="polite">{{ announce }}</p>
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
.saf { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.saf__wrap { display: grid; gap: 16px; }
.saf__head { display: grid; gap: 12px; }
@container (min-width: 620px) { .saf__head { grid-template-columns: 1fr 220px; align-items: end; } }
.saf__score { display: grid; gap: 6px; }
.saf__bar { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.saf__bar span { display: block; height: 100%; border-radius: inherit; background: var(--mi-green); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.saf__chips { display: flex; flex-wrap: wrap; gap: 8px; }

.saf__grid { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 560px) { .saf__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 900px) { .saf__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.saf__card {
  display: grid; align-content: start; gap: 6px; padding: 16px; border-radius: var(--mi-radius-l);
  background: var(--mi-card); box-shadow: var(--mi-sh1); transition: opacity var(--mi-dur-3) var(--mi-ease);
}
.saf__card[data-state="snoozed"] { opacity: .62; }
.saf__top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.saf__tile { display: grid; place-items: center; width: 34px; height: 34px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); color: var(--mi-label2); }
.saf__tile[data-tone="risk"] { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.saf__tile[data-tone="money"] { background: var(--mi-p-tint); color: var(--mi-p-text); }
.saf__acts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.saf__done { display: flex; align-items: center; gap: 8px; margin-top: 8px; padding: 6px 4px 6px 10px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.saf__done :deep(svg) { flex: none; color: var(--mi-green); }
.saf__done > :nth-child(2) { flex: 1; min-width: 0; }
.saf__card[data-state="snoozed"] .saf__done :deep(svg) { color: var(--mi-label2); }
.saf__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); margin: 0; }
</style>
