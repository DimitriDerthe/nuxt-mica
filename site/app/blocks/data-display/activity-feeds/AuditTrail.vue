<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="aud-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="aud-title" variant="title3" as="h2" weight="semibold">Audit log</MiText>
        <MiText variant="footnote" tone="label2">Northwind workspace · kept for 400 days</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
        <MiSegmented v-model="scope" label="Risk level" :options="SCOPES" />
        <MiNativeSelect v-model="actor" size="sm" aria-label="Actor" :options="actors" />
      </div>
    </header>

    <MiText variant="caption" tone="label2" aria-live="polite">
      {{ shown.length }} of {{ ENTRIES.length }} events{{ sensitive ? ' · ' + sensitive + ' sensitive' : '' }}
    </MiText>

    <ol v-if="shown.length" class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-hidden">
      <li v-for="e in shown" :key="e.id" class="mi:relative mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-3 mi:py-3.5 mi:px-4 mi:not-first:border-t mi:not-first:border-t-sep mi:@[620px]:grid-cols-[auto_minmax(0,_1fr)_auto] mi:@[620px]:items-start" :class="e.risk === 'high' ? HIGH_RAIL : ''">
        <MiAvatar :name="e.actor" size="sm" tone="auto" decorative />
        <div class="mi:grid mi:gap-1.5 mi:min-w-0">
          <p class="mi:m-0 mi:text-[14px] mi:leading-[1.45]"><b class="mi:font-semibold">{{ e.actor }}</b> {{ e.verb }} <b class="mi:font-semibold">{{ e.target }}</b></p>
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:text-[12px] mi:text-label2">
            <MiBadge variant="outline" :tone="KIND_TONE[e.kind]" :label="e.kind" />
            <span>{{ e.time }} · {{ e.place }} · <code class="mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[11px]">{{ e.ip }}</code></span>
          </div>

          <!-- Before/after values: the part an auditor actually needs, folded by default. -->
          <button
            v-if="e.changes.length" type="button" class="mi:[font:inherit] mi:text-[12px] mi:font-semibold mi:inline-flex mi:items-center mi:gap-1 mi:justify-self-start mi:py-0.5 mi:px-0 mi:[border:0] mi:[background:none] mi:text-p-text mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]" :aria-expanded="openId === e.id"
            :aria-controls="'aud-diff-' + e.id" @click="openId = openId === e.id ? null : e.id"
          >
            <MiIcon name="chevron-right" :size="12" class="mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="openId === e.id ? 'mi:transform-[rotate(90deg)]' : ''" />
            {{ e.changes.length }} {{ e.changes.length > 1 ? 'changes' : 'change' }}
          </button>
          <dl v-if="openId === e.id" :id="'aud-diff-' + e.id" class="mi:grid mi:gap-1.5 mi:mt-0.5 mi:mx-0 mi:mb-0 mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:var(--mi-fill4)] mi:text-[12px]">
            <div v-for="c in e.changes" :key="c.field" class="mi:grid mi:gap-0.5 mi:@[620px]:grid-cols-[120px_minmax(0,_1fr)]">
              <dt class="mi:text-label2 mi:font-semibold">{{ c.field }}</dt>
              <dd class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:m-0"><del class="mi:text-red-t mi:[text-decoration:line-through]">{{ c.before }}</del><MiIcon name="arrow-right" :size="12" /><ins class="mi:text-green-t mi:[text-decoration:none] mi:font-semibold">{{ c.after }}</ins></dd>
            </div>
          </dl>
        </div>
        <MiBadge v-if="e.risk === 'high'" tone="danger" label="Sensitive" dot class="mi:col-start-2 mi:justify-self-start mi:@[620px]:[grid-column:auto]" />
      </li>
    </ol>
    <MiText v-else variant="footnote" tone="label2" class="mi:p-7 mi:text-center mi:rounded-lg mi:[background:var(--mi-card)]">No events match these filters.</MiText>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const HIGH_RAIL = "mi:before:content-[''] mi:before:absolute mi:before:top-2.5 mi:before:right-auto mi:before:bottom-2.5 mi:before:left-0 mi:before:w-[3px] mi:before:rounded-[0_2px_2px_0] mi:before:[background:var(--mi-red)]"

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
