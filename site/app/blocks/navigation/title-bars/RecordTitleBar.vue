<template>
  <section class="rtb" aria-labelledby="rtb-title">
    <header class="rtb__bar">
      <MiBreadcrumb :items="[{ label: 'Projects', href: '#' }, { label: 'Civic', href: '#' }, { label: 'Brick Lane Library' }]" />

      <div class="rtb__row">
        <div class="rtb__name">
          <span class="rtb__tile" aria-hidden="true"><MiIcon :svg="glyph.building" :size="22" /></span>
          <form v-if="editing" class="rtb__edit" @submit.prevent="save">
            <MiInput ref="field" v-model="draft" aria-label="Project name" size="sm" @keydown.esc="editing = false" @blur="save" />
          </form>
          <template v-else>
            <MiText id="rtb-title" variant="title2" as="h2" weight="bold" class="rtb__title">{{ name }}</MiText>
            <MiIconButton label="Rename project" variant="plain" size="small" @click="startEdit"><MiIcon name="pencil" :size="15" /></MiIconButton>
          </template>
          <MiMenu v-model="status" variant="popup" :items="statusItems" aria-label="Project status">
            <template #trigger="{ props: t }">
              <button type="button" class="rtb__status" :class="'is-' + status" v-bind="t">
                <i aria-hidden="true" />{{ statusLabel }}<MiIcon name="chevron-down" :size="12" />
              </button>
            </template>
          </MiMenu>
        </div>

        <div class="rtb__actions">
          <MiButton variant="gray" size="small" :pressed="following" @click="following = !following">
            <template #leading><MiIcon name="bell" :size="15" :filled="following" /></template>
            {{ following ? 'Following' : 'Follow' }}<span class="rtb__count">{{ followers }}</span>
          </MiButton>
          <MiButton size="small">
            <template #leading><MiIcon name="share" :size="15" /></template>
            Share
          </MiButton>
          <MiMenu :items="moreItems" aria-label="More project actions" placement="bottom-end">
            <template #trigger="{ props: t }">
              <MiIconButton v-bind="t" label="More actions" variant="gray" size="small"><MiIcon name="more" :size="16" /></MiIconButton>
            </template>
          </MiMenu>
        </div>
      </div>

      <dl class="rtb__meta">
        <div><dt>Team</dt><dd><MiAvatarGroup :items="team" :max="4" size="xs" /></dd></div>
        <div><dt>Client</dt><dd>Tower Hamlets Council</dd></div>
        <div><dt>Budget</dt><dd>€1.82M · <span :class="{ 'is-warn': spent > 60 }">{{ spent }}% spent</span></dd></div>
        <div><dt>Handover</dt><dd>14 Mar 2027</dd></div>
      </dl>

      <!-- Phase ribbon: the project's whole timeline in one line, with today marked. -->
      <div class="rtb__ribbon" role="img" :aria-label="`Timeline: ${done} of ${phases.length} phases done, currently in ${phases[done]?.label}`">
        <div class="rtb__track"><span class="rtb__fill" :style="{ transform: `scaleX(${today})` }" /></div>
        <span class="rtb__today" :style="{ left: today * 100 + '%' }"><b>Today</b></span>
        <ol class="rtb__phases">
          <li v-for="(p, i) in phases" :key="p.label" :class="{ 'is-done': i < done, 'is-now': i === done }" :style="{ left: p.at * 100 + '%' }">
            <i aria-hidden="true" /><span>{{ p.label }}</span>
          </li>
        </ol>
      </div>

      <MiTabs v-model="tab" class="rtb__tabs">
        <MiTabsList aria-label="Project sections">
          <MiTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}<span v-if="t.count" class="rtb__tab-count">{{ t.count }}</span>
          </MiTabsTrigger>
        </MiTabsList>
        <MiTabsContent v-for="t in tabs" :key="t.value" :value="t.value">
          <MiText variant="footnote" tone="label2" class="rtb__panel">{{ t.note }}</MiText>
        </MiTabsContent>
      </MiTabs>
    </header>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

const glyph = { building: '<path d="M4 20V9l8-5 8 5v11M9 20v-5h6v5M3 20h18M9 11h.01M15 11h.01"/>' }

const name = ref('Brick Lane Library retrofit · Phase 2')
const draft = ref(name.value)
const editing = ref(false)
const field = ref<{ focus: () => void } | null>(null)
async function startEdit() {
  draft.value = name.value
  editing.value = true
  await nextTick()
  field.value?.focus()
}
function save() {
  if (!editing.value) return
  if (draft.value.trim()) name.value = draft.value.trim()
  editing.value = false
}

const statusItems = [
  { value: 'track', label: 'On track' },
  { value: 'risk', label: 'At risk' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'paused', label: 'Paused' }
]
const status = ref<string | number | undefined>('risk')
const statusLabel = computed(() => statusItems.find(s => s.value === status.value)?.label ?? 'Set status')

const following = ref(true)
const followers = computed(() => (following.value ? 9 : 8))
const moreItems = [
  { value: 'dup', label: 'Duplicate project', shortcut: '⌘D' },
  { value: 'tpl', label: 'Save as template' },
  { separator: true },
  { value: 'archive', label: 'Archive', destructive: true }
]

const team = [{ name: 'Nadia Rahman' }, { name: 'Callum Reid' }, { name: 'Yuki Saito' }, { name: 'Ellis Grant' }, { name: 'Bea Costa' }, { name: 'Omar Haddad' }]
const spent = 64

const phases = [
  { label: 'Survey', at: 0 },
  { label: 'Planning', at: 0.22 },
  { label: 'Strip-out', at: 0.48 },
  { label: 'Fit-out', at: 0.72 },
  { label: 'Handover', at: 1 }
]
const today = 0.58
const done = 2

const tabs = [
  { value: 'overview', label: 'Overview', note: 'Strip-out of the east reading room finishes Friday; asbestos survey came back clear.' },
  { value: 'tasks', label: 'Tasks', count: 24, note: '24 open tasks, 5 due this week. Callum owns the scaffold permit renewal.' },
  { value: 'drawings', label: 'Drawings', count: 118, note: 'Revision F of the ground-floor plan is out for comment until Thursday.' },
  { value: 'budget', label: 'Budget', note: 'Contingency is down to 6% after the roof-light change order.' },
  { value: 'activity', label: 'Activity', note: 'Yuki uploaded 14 site photos two hours ago.' }
]
const tab = ref<string | undefined>('overview')
</script>

<style scoped>
.rtb { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.rtb__bar { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; padding: 18px 18px 0; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }

.rtb__row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 16px; }
.rtb__name { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; min-width: 0; flex: 1 1 min(320px, 100%); }
.rtb__tile { flex: none; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; color: var(--mi-p-text); background: var(--mi-p-tint); }
.rtb__title { min-width: 0; letter-spacing: -.02em; }
.rtb__edit { flex: 1 1 240px; min-width: 0; }

.rtb__status { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 0; border-radius: 99px; background: var(--mi-fill4); color: var(--mi-label); font: 600 12px/1 var(--mi-font); cursor: pointer; }
.rtb__status:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.rtb__status i { width: 8px; height: 8px; border-radius: 50%; background: var(--mi-ctl); }
.rtb__status.is-track { background: color-mix(in srgb, var(--mi-green) 14%, transparent); color: var(--mi-green-t); }
.rtb__status.is-track i { background: var(--mi-green); }
.rtb__status.is-risk { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.rtb__status.is-risk i { background: var(--mi-orange); }
.rtb__status.is-blocked { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.rtb__status.is-blocked i { background: var(--mi-red); }

.rtb__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.rtb__count { margin-left: 6px; padding: 1px 6px; border-radius: 99px; background: var(--mi-fill3); font-size: 11px; font-variant-numeric: tabular-nums; }

.rtb__meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 20px; margin: 0; }
.rtb__meta > div { display: grid; gap: 4px; min-width: 0; }
.rtb__meta dt { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-label2); }
.rtb__meta dd { margin: 0; font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rtb__meta .is-warn { color: var(--mi-orange-t); }

.rtb__ribbon { position: relative; height: 54px; margin: 2px 10px 0; }
.rtb__track { position: absolute; left: 0; right: 0; top: 22px; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.rtb__fill { display: block; height: 100%; background: linear-gradient(90deg, var(--mi-p), var(--mi-s)); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.rtb__today { position: absolute; top: 0; transform: translateX(-50%); display: grid; justify-items: center; }
.rtb__today b { padding: 1px 6px; border-radius: 4px; background: var(--mi-label); color: var(--mi-card); font-size: 10px; font-weight: 700; }
.rtb__today::after { content: ""; width: 2px; height: 14px; background: var(--mi-label); }
.rtb__phases { margin: 0; padding: 0; list-style: none; }
.rtb__phases li { position: absolute; top: 18px; display: grid; justify-items: center; gap: 6px; transform: translateX(-50%); font-size: 11px; color: var(--mi-label2); white-space: nowrap; }
.rtb__phases li:first-child { justify-items: start; transform: translateX(-6px); }
.rtb__phases li:last-child { justify-items: end; transform: translateX(calc(-100% + 6px)); }
.rtb__phases i { width: 12px; height: 12px; box-sizing: border-box; border-radius: 50%; border: 2px solid var(--mi-fill); background: var(--mi-card); }
.rtb__phases .is-done i { border-color: var(--mi-p); background: var(--mi-p); }
.rtb__phases .is-now { color: var(--mi-label); font-weight: 600; }
.rtb__phases .is-now i { border-color: var(--mi-p); }
/* Middle labels hide on small widths; the dots and the aria-label still tell the story. */
.rtb__phases li:not(:first-child):not(:last-child):not(.is-now) span { opacity: 0; }

.rtb__tabs { margin: 0 -18px; padding: 0 18px; border-top: 1px solid var(--mi-sep); }
/* On narrow widths the tab list scrolls sideways instead of pushing the bar wider. */
.rtb__tabs :deep(.mi-tabs__list) { max-width: 100%; overflow-x: auto; scrollbar-width: none; }
.rtb__tabs :deep(.mi-tabs__tab) { flex: none; }
.rtb__tab-count { margin-left: 6px; font-size: 11px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.rtb__panel { padding: 12px 0 16px; }

@container (min-width: 620px) {
  .rtb__bar { padding: 22px 24px 0; }
  .rtb__tabs { margin: 0 -24px; padding: 0 24px; }
  .rtb__meta { grid-template-columns: repeat(4, minmax(0, auto)); justify-content: start; gap: 12px 36px; }
  .rtb__phases li span { opacity: 1 !important; }
}
</style>
