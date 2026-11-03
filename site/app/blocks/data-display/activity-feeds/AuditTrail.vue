<template>
  <section class="aud" aria-labelledby="aud-title">
    <header class="aud__head">
      <div>
        <MiText id="aud-title" variant="title3" as="h2" weight="semibold">Audit log</MiText>
        <MiText variant="footnote" tone="label2">Northwind workspace · kept for 400 days</MiText>
      </div>
      <div class="aud__filters">
        <MiSegmented v-model="scope" label="Risk level" :options="SCOPES" />
        <MiNativeSelect v-model="actor" size="sm" aria-label="Actor" :options="actors" />
      </div>
    </header>

    <MiText variant="caption" tone="label2" aria-live="polite">
      {{ shown.length }} of {{ ENTRIES.length }} events{{ sensitive ? ' · ' + sensitive + ' sensitive' : '' }}
    </MiText>

    <ol v-if="shown.length" class="aud__list">
      <li v-for="e in shown" :key="e.id" class="aud__row" :class="{ 'is-high': e.risk === 'high' }">
        <MiAvatar :name="e.actor" size="sm" tone="auto" decorative />
        <div class="aud__main">
          <p class="aud__line"><b>{{ e.actor }}</b> {{ e.verb }} <b>{{ e.target }}</b></p>
          <div class="aud__meta">
            <MiBadge variant="outline" :tone="KIND_TONE[e.kind]" :label="e.kind" />
            <span>{{ e.time }} · {{ e.place }} · <code>{{ e.ip }}</code></span>
          </div>

          <!-- Before/after values: the part an auditor actually needs, folded by default. -->
          <button
            v-if="e.changes.length" type="button" class="aud__toggle" :aria-expanded="openId === e.id"
            :aria-controls="'aud-diff-' + e.id" @click="openId = openId === e.id ? null : e.id"
          >
            <MiIcon name="chevron-right" :size="12" class="aud__chev" />
            {{ e.changes.length }} {{ e.changes.length > 1 ? 'changes' : 'change' }}
          </button>
          <dl v-if="openId === e.id" :id="'aud-diff-' + e.id" class="aud__diff">
            <div v-for="c in e.changes" :key="c.field" class="aud__diff-row">
              <dt>{{ c.field }}</dt>
              <dd><del>{{ c.before }}</del><MiIcon name="arrow-right" :size="12" /><ins>{{ c.after }}</ins></dd>
            </div>
          </dl>
        </div>
        <MiBadge v-if="e.risk === 'high'" tone="danger" label="Sensitive" dot class="aud__risk" />
      </li>
    </ol>
    <MiText v-else variant="footnote" tone="label2" class="aud__empty">No events match these filters.</MiText>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Kind = 'access' | 'security' | 'billing' | 'content'
interface Change { field: string, before: string, after: string }
interface Entry { id: string, actor: string, verb: string, target: string, kind: Kind, risk: 'low' | 'high', time: string, place: string, ip: string, changes: Change[] }

const KIND_TONE: Record<Kind, 'primary' | 'danger' | 'warning' | 'neutral'> = { access: 'primary', security: 'danger', billing: 'warning', content: 'neutral' }
const SCOPES = [{ value: 'all', label: 'All' }, { value: 'high', label: 'Sensitive' }]

const ENTRIES: Entry[] = [
  { id: 'e9', actor: 'Priya Raman', verb: 'changed the role of', target: 'Leo Marsh', kind: 'access', risk: 'high', time: '10:42', place: 'London, UK', ip: '81.2.69.142', changes: [{ field: 'Role', before: 'Member', after: 'Admin' }, { field: 'Billing access', before: 'No', after: 'Yes' }] },
  { id: 'e8', actor: 'Leo Marsh', verb: 'created the API key', target: 'ci-deploy', kind: 'security', risk: 'high', time: '10:15', place: 'Bristol, UK', ip: '86.14.2.201', changes: [{ field: 'Scopes', before: '—', after: 'deploy:write, logs:read' }, { field: 'Expires', before: '—', after: 'Never' }] },
  { id: 'e7', actor: 'Ana Sousa', verb: 'exported', target: 'Customers (2,418 rows)', kind: 'content', risk: 'low', time: '09:58', place: 'Lisbon, PT', ip: '94.63.11.7', changes: [] },
  { id: 'e6', actor: 'Priya Raman', verb: 'updated the plan to', target: 'Business annual', kind: 'billing', risk: 'low', time: '09:31', place: 'London, UK', ip: '81.2.69.142', changes: [{ field: 'Seats', before: '24', after: '32' }, { field: 'Amount', before: '$5,760', after: '$7,680' }] },
  { id: 'e5', actor: 'Kenji Mori', verb: 'turned off', target: 'two-factor enforcement', kind: 'security', risk: 'high', time: 'Yesterday', place: 'Osaka, JP', ip: '126.75.3.90', changes: [{ field: 'Require 2FA', before: 'All members', after: 'Admins only' }] },
  { id: 'e4', actor: 'Ana Sousa', verb: 'archived the project', target: 'Spring launch', kind: 'content', risk: 'low', time: 'Yesterday', place: 'Lisbon, PT', ip: '94.63.11.7', changes: [] },
  { id: 'e3', actor: 'Kenji Mori', verb: 'invited', target: 'ruth@finchwell.io', kind: 'access', risk: 'low', time: 'Mon', place: 'Osaka, JP', ip: '126.75.3.90', changes: [{ field: 'Role', before: '—', after: 'Guest' }] }
]

const scope = ref<string | number | null>('all')
const actor = ref<string | number | null>('all')
const openId = ref<string | null>('e9')

const actors = [{ value: 'all', label: 'Everyone' }, ...[...new Set(ENTRIES.map(e => e.actor))].map(a => ({ value: a, label: a }))]
const shown = computed(() => ENTRIES.filter(e => (scope.value !== 'high' || e.risk === 'high') && (actor.value === 'all' || e.actor === actor.value)))
const sensitive = computed(() => shown.value.filter(e => e.risk === 'high').length)
</script>

<style scoped>
.aud { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.aud__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.aud__filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.aud__list { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.aud__row { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px; padding: 14px 16px; }
.aud__row + .aud__row { border-top: 1px solid var(--mi-sep); }
.aud__row.is-high::before { content: ""; position: absolute; inset: 10px auto 10px 0; width: 3px; border-radius: 0 2px 2px 0; background: var(--mi-red); }
.aud__main { display: grid; gap: 6px; min-width: 0; }
.aud__line { margin: 0; font-size: 14px; line-height: 1.45; }
.aud__line b { font-weight: 600; }
.aud__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 12px; color: var(--mi-label2); }
.aud__meta code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }
.aud__risk { grid-column: 2; justify-self: start; }
.aud__toggle { display: inline-flex; align-items: center; gap: 4px; justify-self: start; padding: 2px 0; border: 0; background: none; color: var(--mi-p-text); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.aud__toggle:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 4px; }
.aud__chev { transition: transform var(--mi-dur-2) var(--mi-ease); }
.aud__toggle[aria-expanded="true"] .aud__chev { transform: rotate(90deg); }
.aud__diff { display: grid; gap: 6px; margin: 2px 0 0; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); font-size: 12px; }
.aud__diff-row { display: grid; gap: 2px; }
.aud__diff dt { color: var(--mi-label2); font-weight: 600; }
.aud__diff dd { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0; }
.aud__diff del { color: var(--mi-red-t); text-decoration: line-through; }
.aud__diff ins { color: var(--mi-green-t); text-decoration: none; font-weight: 600; }
.aud__empty { padding: 28px; text-align: center; border-radius: var(--mi-radius-l); background: var(--mi-card); }

@container (min-width: 620px) {
  .aud__row { grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; }
  .aud__risk { grid-column: auto; }
  .aud__diff-row { grid-template-columns: 120px minmax(0, 1fr); }
}
</style>
