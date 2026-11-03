<template>
  <section class="rtb mi:@container mi:font-mi mi:text-label" aria-labelledby="rtb-title">
    <header class="rtb__bar mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3.5 mi:pt-4.5 mi:px-4.5 mi:pb-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[620px]:pt-5.5 mi:@[620px]:px-6 mi:@[620px]:pb-0">
      <MiBreadcrumb :items="[{ label: 'Projects', href: '#' }, { label: 'Civic', href: '#' }, { label: 'Brick Lane Library' }]" />

      <div class="rtb__row mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-3 mi:gap-x-4">
        <div class="rtb__name mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-2.5 mi:min-w-0 mi:flex-[1_1_min(320px,_100%)]">
          <span class="rtb__tile mi:flex-[none] mi:grid mi:place-items-center mi:w-10.5 mi:h-10.5 mi:rounded-[12px] mi:text-p-text mi:[background:var(--mi-p-tint)]" aria-hidden="true"><MiIcon :svg="glyph.building" :size="22" /></span>
          <form v-if="editing" class="rtb__edit mi:flex-[1_1_240px] mi:min-w-0" @submit.prevent="save">
            <MiInput ref="field" v-model="draft" aria-label="Project name" size="sm" @keydown.esc="editing = false" @blur="save" />
          </form>
          <template v-else>
            <MiText id="rtb-title" variant="title2" as="h2" weight="bold" class="rtb__title mi:min-w-0">{{ name }}</MiText>
            <MiIconButton label="Rename project" variant="plain" size="small" @click="startEdit"><MiIcon name="pencil" :size="15" /></MiIconButton>
          </template>
          <MiMenu v-model="status" variant="popup" :items="statusItems" aria-label="Project status">
            <template #trigger="{ props: t }">
              <button type="button" class="rtb__status mi:inline-flex mi:items-center mi:gap-1.5 mi:h-7 mi:py-0 mi:px-2.5 mi:[border:0] mi:rounded-[99px] mi:[background:var(--mi-fill4)] mi:text-label mi:[font:600_12px/1_var(--mi-font)] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="'is-' + status" v-bind="t">
                <i class="mi:[.rtb__phases_.is-done_i&]:border-p mi:[.rtb__phases_.is-now_i&]:border-p" aria-hidden="true" />{{ statusLabel }}<MiIcon class="mi:[.rtb__phases_.is-done_i&]:border-p mi:[.rtb__phases_.is-now_i&]:border-p" name="chevron-down" :size="12" />
              </button>
            </template>
          </MiMenu>
        </div>

        <div class="rtb__actions mi:flex mi:flex-wrap mi:items-center mi:gap-2">
          <MiButton variant="gray" size="small" :pressed="following" @click="following = !following">
            <template #leading><MiIcon name="bell" :size="15" :filled="following" /></template>
            {{ following ? 'Following' : 'Follow' }}<span class="rtb__count mi:ml-1.5 mi:py-px mi:px-1.5 mi:rounded-[99px] mi:[background:var(--mi-fill3)] mi:text-[11px] mi:tabular-nums">{{ followers }}</span>
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

      <dl class="rtb__meta mi:grid mi:grid-cols-2 mi:gap-y-3 mi:gap-x-5 mi:m-0 mi:@[620px]:grid-cols-[repeat(4,_minmax(0,_auto))] mi:@[620px]:justify-start mi:@[620px]:gap-y-3 mi:@[620px]:gap-x-9">
        <div class="mi:[.rtb__meta>&]:grid mi:[.rtb__meta>&]:gap-1 mi:[.rtb__meta>&]:min-w-0"><dt class="mi:[.rtb__meta_dt&]:tracking-[.06em] mi:[.rtb__meta_dt&]:uppercase">Team</dt><dd class="rtb__team mi:[.rtb__meta_dd&]:text-ellipsis"><MiAvatarGroup class="mi:[.rtb__meta_dt&]:tracking-[.06em] mi:[.rtb__meta_dt&]:uppercase mi:[.rtb__meta_dd&]:text-ellipsis" :items="team" :max="4" size="xs" /></dd></div>
        <div class="mi:[.rtb__meta>&]:grid mi:[.rtb__meta>&]:gap-1 mi:[.rtb__meta>&]:min-w-0"><dt class="mi:[.rtb__meta_dt&]:tracking-[.06em] mi:[.rtb__meta_dt&]:uppercase">Client</dt><dd class="mi:[.rtb__meta_dd&]:text-ellipsis">Tower Hamlets Council</dd></div>
        <div class="mi:[.rtb__meta>&]:grid mi:[.rtb__meta>&]:gap-1 mi:[.rtb__meta>&]:min-w-0"><dt class="mi:[.rtb__meta_dt&]:tracking-[.06em] mi:[.rtb__meta_dt&]:uppercase">Budget</dt><dd class="mi:[.rtb__meta_dd&]:text-ellipsis">€1.82M · <span :class="{ 'is-warn': spent > 60 }">{{ spent }}% spent</span></dd></div>
        <div class="mi:[.rtb__meta>&]:grid mi:[.rtb__meta>&]:gap-1 mi:[.rtb__meta>&]:min-w-0"><dt class="mi:[.rtb__meta_dt&]:tracking-[.06em] mi:[.rtb__meta_dt&]:uppercase">Handover</dt><dd class="mi:[.rtb__meta_dd&]:text-ellipsis">14 Mar 2027</dd></div>
      </dl>

      <!-- Phase ribbon: the project's whole timeline in one line, with today marked. -->
      <div class="rtb__ribbon mi:relative mi:h-13.5 mi:mt-0.5 mi:mx-2.5 mi:mb-0" role="img" :aria-label="`Timeline: ${done} of ${phases.length} phases done, currently in ${phases[done]?.label}`">
        <div class="rtb__track mi:absolute mi:left-0 mi:right-0 mi:top-5.5 mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden"><span class="rtb__fill mi:block mi:h-full mi:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${today})` }" /></div>
        <span class="rtb__today mi:absolute mi:top-0 mi:transform-[translateX(-50%)] mi:grid mi:justify-items-center mi:after:content-[''] mi:after:w-0.5 mi:after:h-3.5 mi:after:[background:var(--mi-label)]" :style="{ left: today * 100 + '%' }"><b>Today</b></span>
        <ol class="rtb__phases mi:m-0 mi:p-0 mi:[list-style:none]">
          <li class="mi:[.rtb__phases_&]:absolute mi:[.rtb__phases_&]:top-4.5 mi:[.rtb__phases_&]:grid mi:[.rtb__phases_&]:justify-items-center mi:[.rtb__phases_&]:gap-1.5 mi:[.rtb__phases_&]:transform-[translateX(-50%)] mi:[.rtb__phases_&:first-child]:justify-items-start mi:[.rtb__phases_&:first-child]:transform-[translateX(-6px)] mi:[.rtb__phases_&:last-child]:justify-items-end mi:[.rtb__phases_&:last-child]:transform-[translateX(calc(-100%_+_6px))]" v-for="(p, i) in phases" :key="p.label" :class="{ 'is-done': i < done, 'is-now': i === done }" :style="{ left: p.at * 100 + '%' }">
            <i class="mi:[.rtb__phases_&]:box-border mi:[.rtb__phases_.is-done_i&]:border-p mi:[.rtb__phases_.is-now_i&]:border-p" aria-hidden="true" /><span>{{ p.label }}</span>
          </li>
        </ol>
      </div>

      <MiTabs v-model="tab" class="rtb__tabs mi:my-0 mi:-mx-4.5 mi:@[620px]:my-0 mi:@[620px]:-mx-6">
        <MiTabsList aria-label="Project sections">
          <MiTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}<span v-if="t.count" class="rtb__tab-count mi:ml-1.5 mi:text-[11px] mi:text-label2 mi:tabular-nums">{{ t.count }}</span>
          </MiTabsTrigger>
        </MiTabsList>
        <MiTabsContent v-for="t in tabs" :key="t.value" :value="t.value">
          <MiText variant="footnote" tone="label2" class="rtb__panel mi:pt-3 mi:px-0 mi:pb-4">{{ t.note }}</MiText>
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
.rtb__title { letter-spacing: -.02em; }
.rtb__status i { width: 8px; height: 8px; border-radius: 50%; background: var(--mi-ctl); }
.rtb__status.is-track { background: color-mix(in srgb, var(--mi-green) 14%, transparent); color: var(--mi-green-t); }
.rtb__status.is-track i { background: var(--mi-green); }
.rtb__status.is-risk { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.rtb__status.is-risk i { background: var(--mi-orange); }
.rtb__status.is-blocked { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.rtb__status.is-blocked i { background: var(--mi-red); }
.rtb__meta dt { font-size: 11px; font-weight: 600; color: var(--mi-label2); }
.rtb__meta dd { margin: 0; font-size: 14px; font-weight: 500; overflow: hidden; white-space: nowrap; }
/* The avatar rings sit outside the avatars: clipping this cell would cut them. */
.rtb__meta .rtb__team { overflow: visible; }
.rtb__meta .is-warn { color: var(--mi-orange-t); }
.rtb__today b { padding: 1px 6px; border-radius: 4px; background: var(--mi-label); color: var(--mi-card); font-size: 10px; font-weight: 700; }
.rtb__phases li { font-size: 11px; color: var(--mi-label2); white-space: nowrap; }
.rtb__phases i { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--mi-fill); background: var(--mi-card); }
.rtb__phases .is-done i { background: var(--mi-p); }
.rtb__phases .is-now { color: var(--mi-label); font-weight: 600; }
/* Middle labels hide on small widths; the dots and the aria-label still tell the story. */
.rtb__phases li:not(:first-child):not(:last-child):not(.is-now) span { opacity: 0; }

.rtb__tabs { padding: 0 18px; border-top: 1px solid var(--mi-sep); }
/* On narrow widths the tab list scrolls sideways instead of pushing the bar wider. */
.rtb__tabs :deep(.mi-tabs__list) { max-width: 100%; overflow-x: auto; scrollbar-width: none; }
.rtb__tabs :deep(.mi-tabs__tab) { flex: none; }

@container (min-width: 620px) {
  .rtb__tabs { padding: 0 24px; }
  .rtb__phases li span { opacity: 1 !important; }
}
</style>
