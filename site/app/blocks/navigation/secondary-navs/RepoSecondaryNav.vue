<template>
  <div class="rsn">
    <header class="rsn__head">
      <div class="rsn__title-row">
        <div class="rsn__title">
          <MiText as="span" variant="footnote" tone="label2">northwind-labs /</MiText>
          <MiText id="rsn-title" variant="title3" as="h2" weight="bold">ledger-api</MiText>
          <MiBadge label="Private" tone="neutral" variant="outline" />
        </div>
        <div class="rsn__acts">
          <MiButton variant="gray" size="small" :pressed="watching" @click="watching = !watching">
            <template #leading><MiIcon name="eye" :size="14" /></template>{{ watching ? 'Watching' : 'Watch' }}
          </MiButton>
          <MiButton variant="gray" size="small" :pressed="starred" :aria-label="`Star, ${stars} stars`" @click="starred = !starred">
            <template #leading><MiIcon name="star" :size="14" :filled="starred" /></template>{{ stars }}
          </MiButton>
        </div>
      </div>

      <!-- Wide: underline tabs with counts and a CI status dot. Narrow: one select with the same entries. -->
      <nav class="rsn__tabs" aria-label="Repository">
        <a
          v-for="t in tabs" :key="t.id" href="#" class="rsn__tab" :aria-current="t.id === current ? 'page' : undefined"
          @click.prevent="current = t.id"
        >
          <MiIcon :name="t.icon" :size="15" />{{ t.label }}
          <span v-if="t.count" class="rsn__count">{{ t.count }}</span>
          <span v-if="t.status" class="rsn__status" :class="'is-' + t.status" role="img" :aria-label="statusLabel[t.status]" />
        </a>
      </nav>
      <div class="rsn__select">
        <MiNativeSelect v-model="current" :options="selectOptions" aria-label="Repository section" />
      </div>
    </header>

    <main class="rsn__panel" aria-labelledby="rsn-panel">
      <MiText id="rsn-panel" variant="headline" as="h3">{{ tab.label }}</MiText>
      <MiText variant="footnote" tone="label2">{{ tab.summary }}</MiText>
      <ul class="rsn__rows">
        <li v-for="r in tab.rows" :key="r.title" class="rsn__row">
          <MiIcon :name="r.icon" :size="16" class="rsn__row-icon" :class="'is-' + r.tone" />
          <span class="rsn__row-text">
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
.rsn { container-type: inline-size; display: grid; grid-template-rows: auto 1fr; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.rsn__head { display: grid; gap: 12px; padding: 16px 14px 12px; background: var(--mi-card); box-shadow: inset 0 -1px 0 var(--mi-sep); }
.rsn__title-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.rsn__title { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; min-width: 0; }
.rsn__acts { display: flex; gap: 6px; }

.rsn__tabs { display: none; gap: 2px; margin-bottom: -12px; overflow-x: auto; scrollbar-width: none; }
.rsn__tab {
  position: relative; display: inline-flex; align-items: center; gap: 7px; flex: none; padding: 10px 12px 14px; border-radius: 8px 8px 0 0;
  font-size: 14px; font-weight: 500; color: var(--mi-label2); text-decoration: none; white-space: nowrap;
}
.rsn__tab:hover { color: var(--mi-label); }
.rsn__tab:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
/* Each tab owns its underline and scales it in, so nothing is measured. */
.rsn__tab::after { content: ""; position: absolute; inset: auto 8px 0; height: 2px; border-radius: 2px; background: var(--mi-p); transform: scaleX(0); transition: transform var(--mi-dur-3) var(--mi-spring); }
.rsn__tab[aria-current="page"] { color: var(--mi-label); font-weight: 600; }
.rsn__tab[aria-current="page"]::after { transform: scaleX(1); }
.rsn__count { min-width: 20px; padding: 1px 7px; border-radius: 999px; font-size: 12px; font-weight: 600; text-align: center; background: var(--mi-fill3); font-variant-numeric: tabular-nums; }
.rsn__status { width: 8px; height: 8px; border-radius: 50%; }
.rsn__status.is-fail { background: var(--mi-red); }
.rsn__status.is-pass { background: var(--mi-green); }
.rsn__select { display: grid; }

.rsn__panel { display: grid; align-content: start; gap: 4px; width: 100%; max-width: 820px; margin: 0 auto; padding: 22px 14px 32px; }
.rsn__rows { display: grid; margin: 12px 0 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.rsn__row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; }
.rsn__row + .rsn__row { box-shadow: inset 0 1px 0 var(--mi-sep); }
.rsn__row-text { display: grid; flex: 1; min-width: 0; }
.rsn__row-icon { flex: none; color: var(--mi-label3); }
.rsn__row-icon.is-good { color: var(--mi-green); }
.rsn__row-icon.is-bad { color: var(--mi-red); }
.rsn__row-icon.is-open { color: var(--mi-p); }

@container (min-width: 640px) {
  .rsn__head { padding: 20px 24px 12px; }
  .rsn__tabs { display: flex; }
  .rsn__select { display: none; }
  .rsn__panel { padding: 28px 24px 40px; }
}
</style>
