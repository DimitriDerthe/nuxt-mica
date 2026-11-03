<template>
  <div class="pw mi:@container mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <MiTabs v-model="tab" aria-label="Project sections">
      <header class="pw__header mi:grid mi:gap-4 mi:pt-3 mi:px-4 mi:pb-0 mi:[background:var(--mi-card)] mi:shadow-[0_1px_0_var(--mi-sep)] mi:@[620px]:pt-3.5 mi:@[620px]:px-6 mi:@[620px]:pb-0">
        <div class="pw__top mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:min-w-0">
          <MiBreadcrumb class="pw__crumbs" :items="crumbs" />
          <div class="pw__tools mi:flex mi:items-center mi:gap-1 mi:flex-[none]">
            <MiIconButton size="toolbar" variant="plain" :label="starred ? 'Remove from favorites' : 'Add to favorites'" :pressed="starred" @click="starred = !starred">
              <MiIcon name="star" :filled="starred" :class="{ 'pw__star mi:text-yellow': starred }" />
            </MiIconButton>
            <MiButton variant="bordered" size="small">
              <template #leading><MiIcon name="share" :size="16" /></template>
              Share
            </MiButton>
            <MiMenu :items="more" aria-label="Project actions" placement="bottom-end">
              <template #trigger="{ props }">
                <MiIconButton v-bind="props" size="toolbar" variant="plain" label="More project actions"><MiIcon name="more" /></MiIconButton>
              </template>
            </MiMenu>
          </div>
        </div>

        <div class="pw__id mi:flex mi:items-center mi:gap-3.5 mi:min-w-0">
          <span class="pw__glyph mi:grid mi:place-items-center mi:flex-[none] mi:w-12 mi:h-12 mi:rounded-[14px] mi:[background:var(--mi-p-tint)]" aria-hidden="true">
            <svg class="mi:[.pw__glyph_&]:w-6.5 mi:[.pw__glyph_&]:h-6.5" viewBox="0 0 32 32"><path class="mi:[.pw__glyph_&:first-child]:fill-p/35 mi:[.pw__glyph_&:last-child]:fill-p" d="M16 4 28 26H4L16 4Z" /><path class="mi:[.pw__glyph_&:first-child]:fill-p/35 mi:[.pw__glyph_&:last-child]:fill-p" d="M16 13l6 11H10l6-11Z" /></svg>
          </span>
          <div class="pw__name mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText id="pw-title" variant="title2" as="h2" weight="bold">Atlas Mobile 3.0</MiText>
            <MiText variant="footnote" tone="label2" :lines="1">Offline-first rewrite of the field app for iOS and Android</MiText>
          </div>
        </div>

        <!-- Properties strip: each fact is a small labelled cell. -->
        <dl class="pw__props mi:grid mi:grid-cols-2 mi:gap-y-3 mi:gap-x-4 mi:m-0 mi:@[620px]:grid-cols-3 mi:@[960px]:flex mi:@[960px]:flex-wrap mi:@[960px]:gap-0">
          <div class="pw__prop mi:grid mi:gap-1 mi:min-w-0 mi:@[960px]:py-0 mi:@[960px]:px-5 mi:@[960px]:first:pl-0 mi:@[960px]:[.pw__prop+&]:border-l mi:@[960px]:[.pw__prop+&]:border-l-sep">
            <dt class="mi:[.pw__prop_dt&]:uppercase">Status</dt>
            <dd>
              <MiMenu class="mi:[.pw__prop_dt&]:uppercase" v-model="status" variant="popup" :items="statuses" aria-label="Project status">
                <template #trigger="{ props }">
                  <button v-bind="props" type="button" class="pw__status mi:inline-flex mi:items-center mi:gap-1.5 mi:h-6.5 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-2.5 mi:[border:0] mi:rounded-[999px] mi:cursor-pointer mi:[--c:var(--mi-green)] mi:text-[color:color-mix(in_srgb,_var(--c)_70%,_var(--mi-label))] mi:[background:color-mix(in_srgb,_var(--c)_14%,_transparent)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="'is-' + status">
                    <i class="mi:[.pw__status_i&]:w-[7px] mi:[.pw__status_i&]:h-[7px] mi:[.pw__status_i&]:rounded-[50%] mi:[.pw__status_i&]:[background:var(--c)]" aria-hidden="true" />{{ statusLabel }}<MiIcon class="mi:[.pw__prop_dt&]:uppercase mi:[.pw__status_i&]:w-[7px] mi:[.pw__status_i&]:h-[7px] mi:[.pw__status_i&]:rounded-[50%] mi:[.pw__status_i&]:[background:var(--c)]" name="chevron-down" :size="12" :weight="2.4" />
                  </button>
                </template>
              </MiMenu>
            </dd>
          </div>
          <div class="pw__prop mi:grid mi:gap-1 mi:min-w-0 mi:@[960px]:py-0 mi:@[960px]:px-5 mi:@[960px]:first:pl-0 mi:@[960px]:[.pw__prop+&]:border-l mi:@[960px]:[.pw__prop+&]:border-l-sep">
            <dt class="mi:[.pw__prop_dt&]:uppercase">Lead</dt>
            <dd class="pw__inline mi:flex mi:items-center mi:gap-1.5 mi:min-w-0"><MiAvatar class="mi:[.pw__prop_dt&]:uppercase" name="Yusuf Demir" size="xs" tone="auto" decorative /> Yusuf Demir</dd>
          </div>
          <div class="pw__prop mi:grid mi:gap-1 mi:min-w-0 mi:@[960px]:py-0 mi:@[960px]:px-5 mi:@[960px]:first:pl-0 mi:@[960px]:[.pw__prop+&]:border-l mi:@[960px]:[.pw__prop+&]:border-l-sep">
            <dt class="mi:[.pw__prop_dt&]:uppercase">Team</dt>
            <dd><MiAvatarGroup class="mi:[.pw__prop_dt&]:uppercase" :items="members" :max="4" :size="24" /></dd>
          </div>
          <div class="pw__prop mi:grid mi:gap-1 mi:min-w-0 mi:@[960px]:py-0 mi:@[960px]:px-5 mi:@[960px]:first:pl-0 mi:@[960px]:[.pw__prop+&]:border-l mi:@[960px]:[.pw__prop+&]:border-l-sep">
            <dt class="mi:[.pw__prop_dt&]:uppercase">Target</dt>
            <dd class="pw__inline mi:flex mi:items-center mi:gap-1.5 mi:min-w-0"><MiIcon class="mi:[.pw__prop_dt&]:uppercase" name="calendar" :size="14" /> Mar 28 · 5 weeks left</dd>
          </div>
          <div class="pw__prop mi:grid mi:gap-1 mi:min-w-0 mi:@[960px]:py-0 mi:@[960px]:px-5 mi:@[960px]:first:pl-0 mi:@[960px]:[.pw__prop+&]:border-l mi:@[960px]:[.pw__prop+&]:border-l-sep">
            <dt class="mi:[.pw__prop_dt&]:uppercase">Progress</dt>
            <dd class="pw__inline mi:flex mi:items-center mi:gap-1.5 mi:min-w-0"><MiProgressRing class="mi:[.pw__prop_dt&]:uppercase" :value="64" :size="18" :stroke="3" label="Project progress" /> 64%</dd>
          </div>
        </dl>

        <div class="pw__tabs mi:-mx-4 mi:px-3 mi:overflow-x-auto mi:[scrollbar-width:none] mi:@[620px]:-mx-6 mi:@[620px]:px-5">
          <MiTabsList aria-label="Project sections">
            <MiTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
              {{ t.label }}<span v-if="t.count" class="pw__count mi:ml-1.5 mi:py-px mi:px-1.5 mi:rounded-[999px] mi:text-[11px] mi:font-semibold mi:text-label2 mi:[background:var(--mi-fill3)] mi:tabular-nums">{{ t.count }}</span>
            </MiTabsTrigger>
          </MiTabsList>
        </div>
      </header>

      <main class="pw__body mi:p-4 mi:@[620px]:py-5 mi:@[620px]:px-6" aria-labelledby="pw-title">
        <MiTabsContent value="overview">
          <div class="pw__grid mi:grid mi:gap-3 mi:@[620px]:grid-cols-3">
            <article v-for="m in milestones" :key="m.name" class="pw__card mi:grid mi:gap-1.5 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)]">
              <MiText variant="caption" tone="label3" weight="semibold">{{ m.when }}</MiText>
              <MiText as="h3" variant="subheadline" weight="semibold">{{ m.name }}</MiText>
              <MiProgress :value="m.done" size="sm" :label="m.done + '% done'" :show-value="false" />
              <MiText variant="caption" tone="label2">{{ m.done }}% · {{ m.issues }} issues</MiText>
            </article>
          </div>
        </MiTabsContent>
        <MiTabsContent value="issues">
          <ul class="pw__issues mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)]">
            <li v-for="i in issues" :key="i.id" class="pw__issue mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-3 mi:px-3.5 mi:[.pw__issue+&]:border-t mi:[.pw__issue+&]:border-t-sep">
              <span class="pw__issue-id mi:[font:500_12px_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-label3">{{ i.id }}</span>
              <MiText as="span" variant="subheadline" :lines="1">{{ i.title }}</MiText>
              <MiAvatar :name="i.owner" size="xs" tone="auto" />
            </li>
          </ul>
        </MiTabsContent>
        <MiTabsContent value="updates">
          <article class="pw__card pw__update mi:grid mi:gap-1.5 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:gap-2.5 mi:max-w-160">
            <div class="pw__inline mi:flex mi:items-center mi:gap-1.5 mi:min-w-0"><MiAvatar name="Yusuf Demir" size="xs" tone="auto" decorative /><MiText as="span" variant="footnote" weight="semibold">Yusuf Demir</MiText><MiText as="span" variant="caption" tone="label3">Monday</MiText></div>
            <MiText variant="subheadline">Sync engine passed the 10k-record soak test on Android. iOS background fetch is the last blocker before beta; we keep the Mar 28 target.</MiText>
          </article>
        </MiTabsContent>
        <MiTabsContent v-for="t in quiet" :key="t" :value="t">
          <div class="pw__card mi:grid mi:gap-1.5 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)]"><MiSkeleton variant="text" :lines="['40%', '92%', '76%', '84%']" :animated="false" /></div>
        </MiTabsContent>
      </main>
    </MiTabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const crumbs = [{ label: 'Mobile', href: '#' }, { label: 'Projects', href: '#' }, { label: 'Atlas Mobile 3.0' }]
const more = [
  { value: 'copy', label: 'Copy project link', shortcut: '⌘L' },
  { value: 'template', label: 'Save as template' },
  { separator: true },
  { value: 'archive', label: 'Archive project', destructive: true }
]
const statuses = [
  { value: 'on', label: 'On track' },
  { value: 'risk', label: 'At risk' },
  { value: 'off', label: 'Off track' }
]
const members = ['Yusuf Demir', 'Clara Jensen', 'Mateo Ruiz', 'Aiko Tanaka', 'Nadia Benali', 'Sam Okoro'].map(name => ({ name, tone: 'auto' as const }))
const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'issues', label: 'Issues', count: 48 },
  { value: 'roadmap', label: 'Roadmap' },
  { value: 'docs', label: 'Docs', count: 6 },
  { value: 'updates', label: 'Updates' }
]
const quiet = ['roadmap', 'docs']
const milestones = [
  { name: 'Sync engine', when: 'Feb 14', done: 100, issues: 21 },
  { name: 'Offline forms', when: 'Mar 7', done: 72, issues: 16 },
  { name: 'Public beta', when: 'Mar 28', done: 18, issues: 11 }
]
const issues = [
  { id: 'ATL-412', title: 'Background fetch stops after 30 s on iOS 18', owner: 'Aiko Tanaka' },
  { id: 'ATL-409', title: 'Conflict banner overlaps the keyboard on small phones', owner: 'Mateo Ruiz' },
  { id: 'ATL-401', title: 'Retry queue loses photos larger than 12 MB', owner: 'Clara Jensen' },
  { id: 'ATL-397', title: 'Signature pad ignores Apple Pencil pressure', owner: 'Sam Okoro' }
]

const tab = ref<string | undefined>('overview')
const starred = ref(true)
const status = ref<string | number | undefined>('risk')
const statusLabel = computed(() => statuses.find(s => s.value === status.value)?.label ?? 'Set status')
</script>

<style scoped>
.pw__crumbs { min-width: 0; overflow: hidden; }
.pw__prop dt { font-size: 11px; font-weight: 600; letter-spacing: .04em; color: var(--mi-label3); }
.pw__prop dd { margin: 0; font-size: 13px; font-weight: 500; }
.pw__status {
  font: inherit; font-size: 13px; font-weight: 600;
}
.pw__status.is-risk { --c: var(--mi-orange); } .pw__status.is-off { --c: var(--mi-red); }
</style>
