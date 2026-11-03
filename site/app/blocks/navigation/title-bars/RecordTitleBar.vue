<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="rtb-title">
    <header class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3.5 mi:pt-4.5 mi:px-4.5 mi:pb-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[620px]:pt-5.5 mi:@[620px]:px-6 mi:@[620px]:pb-0">
      <MiBreadcrumb :items="[{ label: 'Projects', href: '#' }, { label: 'Civic', href: '#' }, { label: 'Brick Lane Library' }]" />

      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-3 mi:gap-x-4">
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-2.5 mi:min-w-0 mi:flex-[1_1_min(320px,_100%)]">
          <span class="mi:flex-[none] mi:grid mi:place-items-center mi:w-10.5 mi:h-10.5 mi:rounded-[12px] mi:text-p-text mi:[background:var(--mi-p-tint)]" aria-hidden="true"><MiIcon :svg="glyph.building" :size="22" /></span>
          <form v-if="editing" class="mi:flex-[1_1_240px] mi:min-w-0" @submit.prevent="save">
            <MiInput ref="field" v-model="draft" aria-label="Project name" size="sm" @keydown.esc="editing = false" @blur="save" />
          </form>
          <template v-else>
            <MiText id="rtb-title" variant="title2" as="h2" weight="bold" class="mi:tracking-[-.02em]! mi:min-w-0">{{ name }}</MiText>
            <MiIconButton label="Rename project" variant="plain" size="small" @click="startEdit"><MiIcon name="pencil" :size="15" /></MiIconButton>
          </template>
          <MiMenu v-model="status" variant="popup" :items="statusItems" aria-label="Project status">
            <template #trigger="{ props: t }">
              <button type="button" class="mi:inline-flex mi:items-center mi:gap-1.5 mi:h-7 mi:py-0 mi:px-2.5 mi:[border:0] mi:rounded-[99px] mi:[background:var(--mi-fill4)] mi:[font:600_12px/1_var(--mi-font)] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="[({ track: 'mi:bg-green/14 mi:text-green-t', risk: 'mi:bg-orange/16 mi:text-orange-t', blocked: 'mi:bg-red/14 mi:text-red-t' } as Record<string, string>)[String(status)] ?? 'mi:text-label']" v-bind="t">
                <i class="mi:w-2 mi:h-2 mi:rounded-[50%]" :class="({ track: 'mi:bg-green', risk: 'mi:bg-orange', blocked: 'mi:bg-red' } as Record<string, string>)[String(status)] ?? 'mi:bg-ctl'" aria-hidden="true" />{{ statusLabel }}<MiIcon name="chevron-down" :size="12" />
              </button>
            </template>
          </MiMenu>
        </div>

        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
          <MiButton variant="gray" size="small" :pressed="following" @click="following = !following">
            <template #leading><MiIcon name="bell" :size="15" :filled="following" /></template>
            {{ following ? 'Following' : 'Follow' }}<span class="mi:ml-1.5 mi:py-px mi:px-1.5 mi:rounded-[99px] mi:[background:var(--mi-fill3)] mi:text-[11px] mi:tabular-nums">{{ followers }}</span>
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

      <dl class="mi:grid mi:grid-cols-2 mi:gap-y-3 mi:gap-x-5 mi:m-0 mi:@[620px]:grid-cols-[repeat(4,_minmax(0,_auto))] mi:@[620px]:justify-start mi:@[620px]:gap-y-3 mi:@[620px]:gap-x-9">
        <div class="mi:grid mi:gap-1 mi:min-w-0"><dt class="mi:text-[11px] mi:font-semibold mi:text-label2 mi:tracking-[.06em] mi:uppercase">Team</dt><dd class="mi:m-0 mi:text-[14px] mi:font-medium mi:overflow-visible mi:whitespace-nowrap mi:text-ellipsis"><MiAvatarGroup class="" :items="team" :max="4" size="xs" /></dd></div>
        <div class="mi:grid mi:gap-1 mi:min-w-0"><dt class="mi:text-[11px] mi:font-semibold mi:text-label2 mi:tracking-[.06em] mi:uppercase">Client</dt><dd class="mi:m-0 mi:text-[14px] mi:font-medium mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">Tower Hamlets Council</dd></div>
        <div class="mi:grid mi:gap-1 mi:min-w-0"><dt class="mi:text-[11px] mi:font-semibold mi:text-label2 mi:tracking-[.06em] mi:uppercase">Budget</dt><dd class="mi:m-0 mi:text-[14px] mi:font-medium mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">€1.82M · <span :class="spent > 60 ? 'mi:text-orange-t' : ''">{{ spent }}% spent</span></dd></div>
        <div class="mi:grid mi:gap-1 mi:min-w-0"><dt class="mi:text-[11px] mi:font-semibold mi:text-label2 mi:tracking-[.06em] mi:uppercase">Handover</dt><dd class="mi:m-0 mi:text-[14px] mi:font-medium mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">14 Mar 2027</dd></div>
      </dl>

      <!-- Phase ribbon: the project's whole timeline in one line, with today marked. -->
      <div class="mi:relative mi:h-13.5 mi:mt-0.5 mi:mx-2.5 mi:mb-0" role="img" :aria-label="`Timeline: ${done} of ${phases.length} phases done, currently in ${phases[done]?.label}`">
        <div class="mi:absolute mi:left-0 mi:right-0 mi:top-5.5 mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden"><span class="mi:block mi:h-full mi:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${today})` }" /></div>
        <span class="mi:absolute mi:top-0 mi:transform-[translateX(-50%)] mi:grid mi:justify-items-center mi:after:content-[''] mi:after:w-0.5 mi:after:h-3.5 mi:after:[background:var(--mi-label)]" :style="{ left: today * 100 + '%' }"><b class="mi:py-px mi:px-1.5 mi:rounded-[4px] mi:bg-label mi:text-card mi:text-[10px] mi:font-bold">Today</b></span>
        <ol class="mi:m-0 mi:p-0 mi:[list-style:none]">
          <li class="mi:text-[11px] mi:whitespace-nowrap mi:absolute mi:top-4.5 mi:grid mi:justify-items-center mi:gap-1.5 mi:transform-[translateX(-50%)] mi:[&:first-child]:justify-items-start mi:[&:first-child]:transform-[translateX(-6px)] mi:[&:last-child]:justify-items-end mi:[&:last-child]:transform-[translateX(calc(-100%_+_6px))]" v-for="(p, i) in phases" :key="p.label" :class="i === done ? 'mi:text-label mi:font-semibold' : i < done ? 'mi:text-label2' : 'mi:text-label2'" :style="{ left: p.at * 100 + '%' }">
            <i class="mi:w-3 mi:h-3 mi:rounded-[50%] mi:border-2 mi:box-border" :class="i < done ? 'mi:bg-p mi:border-p' : i === done ? 'mi:bg-card mi:border-p' : 'mi:bg-card mi:border-fill'" aria-hidden="true" /><span :class="i > 0 && i < phases.length - 1 && i !== done ? 'mi:opacity-0 mi:@[620px]:opacity-100' : ''">{{ p.label }}</span>
          </li>
        </ol>
      </div>

      <MiTabs v-model="tab" class="mi:py-0 mi:px-4.5 mi:border-t mi:border-t-sep mi:[&_.mi-tabs__list]:max-w-full mi:[&_.mi-tabs__list]:overflow-x-auto mi:[&_.mi-tabs__list]:[scrollbar-width:none] mi:[&_.mi-tabs__tab]:flex-[none] mi:my-0 mi:-mx-4.5 mi:@[620px]:my-0 mi:@[620px]:-mx-6 mi:@[620px]:px-6">
        <MiTabsList aria-label="Project sections">
          <MiTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}<span v-if="t.count" class="mi:ml-1.5 mi:text-[11px] mi:text-label2 mi:tabular-nums">{{ t.count }}</span>
          </MiTabsTrigger>
        </MiTabsList>
        <MiTabsContent v-for="t in tabs" :key="t.value" :value="t.value">
          <MiText variant="footnote" tone="label2" class="mi:pt-3 mi:px-0 mi:pb-4">{{ t.note }}</MiText>
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
