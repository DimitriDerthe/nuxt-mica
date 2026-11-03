<template>
  <div class="rsn mi:@container mi:grid mi:grid-rows-[auto_1fr] mi:min-h-full mi:font-mi mi:text-label mi:bg-page">
    <header class="rsn__head mi:grid mi:gap-3 mi:pt-4 mi:px-3.5 mi:pb-3 mi:bg-card mi:shadow-[inset_0_-1px_0_var(--mi-sep)] mi:@[640px]:pt-5 mi:@[640px]:px-6 mi:@[640px]:pb-3">
      <div class="rsn__title-row mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
        <div class="rsn__title mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1 mi:gap-x-2 mi:min-w-0">
          <MiText as="span" variant="footnote" tone="label2">northwind-labs /</MiText>
          <MiText id="rsn-title" variant="title3" as="h2" weight="bold">ledger-api</MiText>
          <MiBadge label="Private" tone="neutral" variant="outline" />
        </div>
        <div class="rsn__acts mi:flex mi:gap-1.5">
          <MiButton variant="gray" size="small" :pressed="watching" @click="watching = !watching">
            <template #leading><MiIcon name="eye" :size="14" /></template>{{ watching ? 'Watching' : 'Watch' }}
          </MiButton>
          <MiButton variant="gray" size="small" :pressed="starred" :aria-label="`Star, ${stars} stars`" @click="starred = !starred">
            <template #leading><MiIcon name="star" :size="14" :filled="starred" /></template>{{ stars }}
          </MiButton>
        </div>
      </div>

      <!-- Wide: underline tabs with counts and a CI status dot. Narrow: one select with the same entries. -->
      <nav class="rsn__tabs mi:hidden mi:gap-0.5 mi:-mb-3 mi:overflow-x-auto mi:[scrollbar-width:none] mi:@[640px]:flex" aria-label="Repository">
        <a
          v-for="t in tabs" :key="t.id" href="#" class="rsn__tab mi:relative mi:inline-flex mi:items-center mi:gap-[7px] mi:flex-[none] mi:pt-2.5 mi:px-3 mi:pb-3.5 mi:rounded-[8px_8px_0_0] mi:text-[14px] mi:font-medium mi:text-label2 mi:[text-decoration:none] mi:whitespace-nowrap mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:after:content-[''] mi:after:absolute mi:after:top-auto mi:after:right-2 mi:after:bottom-0 mi:after:left-2 mi:after:h-0.5 mi:after:rounded-[2px] mi:after:bg-p mi:after:transform-[scaleX(0)] mi:after:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[&[aria-current='page']]:font-semibold mi:[&[aria-current='page']]:after:transform-[scaleX(1)]" :aria-current="t.id === current ? 'page' : undefined"
          @click.prevent="current = t.id"
        >
          <MiIcon :name="t.icon" :size="15" />{{ t.label }}
          <span v-if="t.count" class="rsn__count mi:min-w-5 mi:py-px mi:px-[7px] mi:rounded-[999px] mi:text-[12px] mi:font-semibold mi:text-center mi:bg-fill3 mi:tabular-nums">{{ t.count }}</span>
          <span v-if="t.status" class="rsn__status mi:w-2 mi:h-2 mi:rounded-[50%] mi:[&.is-fail]:bg-red mi:[&.is-pass]:bg-green" :class="'is-' + t.status" role="img" :aria-label="statusLabel[t.status]" />
        </a>
      </nav>
      <div class="rsn__select mi:grid mi:@[640px]:hidden">
        <MiNativeSelect v-model="current" :options="selectOptions" aria-label="Repository section" />
      </div>
    </header>

    <main class="rsn__panel mi:grid mi:content-start mi:gap-1 mi:w-full mi:max-w-205 mi:my-0 mi:mx-auto mi:pt-5.5 mi:px-3.5 mi:pb-8 mi:@[640px]:pt-7 mi:@[640px]:px-6 mi:@[640px]:pb-10" aria-labelledby="rsn-panel">
      <MiText id="rsn-panel" variant="headline" as="h3">{{ tab.label }}</MiText>
      <MiText variant="footnote" tone="label2">{{ tab.summary }}</MiText>
      <ul class="rsn__rows mi:grid mi:mt-3 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:bg-card mi:shadow-1">
        <li v-for="r in tab.rows" :key="r.title" class="rsn__row mi:flex mi:items-center mi:gap-3 mi:py-3 mi:px-3.5 mi:[.rsn__row+&]:shadow-[inset_0_1px_0_var(--mi-sep)]">
          <MiIcon :name="r.icon" :size="16" class="rsn__row-icon mi:text-label3" :class="'is-' + r.tone" />
          <span class="rsn__row-text mi:grid mi:flex-1 mi:min-w-0">
            <MiText as="span" variant="subheadline" weight="medium" :lines="1">{{ r.title }}</MiText>
            <MiText as="span" variant="caption" tone="label2">{{ r.meta }}</MiText>
          </span>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type TabId = 'code' | 'issues' | 'pulls' | 'actions' | 'wiki' | 'settings'
type Status = 'fail' | 'pass'
type Tone = 'good' | 'bad' | 'open' | 'muted'
type Icon = 'document' | 'exclamation-circle' | 'share' | 'check-circle' | 'x-circle-fill' | 'list-bullet' | 'settings' | 'folder'
interface Row { title: string, meta: string, icon: Icon, tone: Tone }
interface Tab { id: TabId, label: string, icon: Icon, count?: number, status?: Status, summary: string, rows: Row[] }

const statusLabel: Record<Status, string> = { fail: 'Latest run failed', pass: 'Latest run passed' }

const tabs: Tab[] = [
  {
    id: 'code', label: 'Code', icon: 'folder', summary: 'main · 1,284 commits · last push 12 minutes ago by Yara Haddad',
    rows: [
      { title: 'src/ledger/reconcile.ts', meta: 'Batch reconciliation by settlement date', icon: 'document', tone: 'muted' },
      { title: 'src/http/routes.ts', meta: 'Add idempotency keys to POST /entries', icon: 'document', tone: 'muted' }
    ]
  },
  {
    id: 'issues', label: 'Issues', icon: 'exclamation-circle', count: 24, summary: '24 open · 311 closed',
    rows: [
      { title: 'Rounding drift on JPY settlements', meta: '#482 opened 2 days ago by Kenji Mori', icon: 'exclamation-circle', tone: 'open' },
      { title: 'Export to Xero drops VAT lines', meta: '#479 opened last week by Clara Nieto', icon: 'exclamation-circle', tone: 'open' }
    ]
  },
  {
    id: 'pulls', label: 'Pull requests', icon: 'share', count: 6, summary: '6 open · 2 waiting for your review',
    rows: [
      { title: 'Use banker’s rounding for minor units', meta: '#486 by Kenji Mori · 2 approvals', icon: 'share', tone: 'good' },
      { title: 'Stream large exports instead of buffering', meta: '#484 by Yara Haddad · changes requested', icon: 'share', tone: 'bad' }
    ]
  },
  {
    id: 'actions', label: 'Actions', icon: 'check-circle', status: 'fail', summary: 'Latest run on main failed 9 minutes ago',
    rows: [
      { title: 'CI · integration tests', meta: 'main · 4 min 12 s · failed at “settlements-eu”', icon: 'x-circle-fill', tone: 'bad' },
      { title: 'CI · unit tests', meta: 'main · 1 min 48 s', icon: 'check-circle', tone: 'good' }
    ]
  },
  {
    id: 'wiki', label: 'Wiki', icon: 'list-bullet', summary: '14 pages · edited yesterday',
    rows: [{ title: 'Runbook: failed payout batches', meta: 'Edited by Clara Nieto', icon: 'document', tone: 'muted' }]
  },
  {
    id: 'settings', label: 'Settings', icon: 'settings', summary: 'Only maintainers can change these.',
    rows: [{ title: 'Branch protection on main', meta: '2 approvals, status checks required', icon: 'settings', tone: 'muted' }]
  }
]
const selectOptions = tabs.map(t => ({ value: t.id, label: t.count ? `${t.label} (${t.count})` : t.label }))

const current = ref<string | number | null>('pulls')
const watching = ref(true)
const starred = ref(false)

const tab = computed(() => tabs.find(t => t.id === current.value) ?? tabs[0]!)
const stars = computed(() => (starred.value ? 129 : 128).toString())
</script>

<style scoped>
.rsn__tab:hover { color: var(--mi-label); }
.rsn__tab[aria-current="page"] { color: var(--mi-label); }
.rsn__row-icon { flex: none; }
.rsn__row-icon.is-good { color: var(--mi-green); }
.rsn__row-icon.is-bad { color: var(--mi-red); }
.rsn__row-icon.is-open { color: var(--mi-p); }
</style>
