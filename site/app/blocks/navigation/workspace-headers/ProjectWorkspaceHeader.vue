<template>
  <div class="pw">
    <MiTabs v-model="tab" aria-label="Project sections">
      <header class="pw__header">
        <div class="pw__top">
          <MiBreadcrumb class="pw__crumbs" :items="crumbs" />
          <div class="pw__tools">
            <MiIconButton size="toolbar" variant="plain" :label="starred ? 'Remove from favorites' : 'Add to favorites'" :pressed="starred" @click="starred = !starred">
              <MiIcon name="star" :filled="starred" :class="{ 'pw__star': starred }" />
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

        <div class="pw__id">
          <span class="pw__glyph" aria-hidden="true">
            <svg viewBox="0 0 32 32"><path d="M16 4 28 26H4L16 4Z" /><path d="M16 13l6 11H10l6-11Z" /></svg>
          </span>
          <div class="pw__name">
            <MiText id="pw-title" variant="title2" as="h2" weight="bold">Atlas Mobile 3.0</MiText>
            <MiText variant="footnote" tone="label2" :lines="1">Offline-first rewrite of the field app for iOS and Android</MiText>
          </div>
        </div>

        <!-- Properties strip: each fact is a small labelled cell. -->
        <dl class="pw__props">
          <div class="pw__prop">
            <dt>Status</dt>
            <dd>
              <MiMenu v-model="status" variant="popup" :items="statuses" aria-label="Project status">
                <template #trigger="{ props }">
                  <button v-bind="props" type="button" class="pw__status" :class="'is-' + status">
                    <i aria-hidden="true" />{{ statusLabel }}<MiIcon name="chevron-down" :size="12" :weight="2.4" />
                  </button>
                </template>
              </MiMenu>
            </dd>
          </div>
          <div class="pw__prop">
            <dt>Lead</dt>
            <dd class="pw__inline"><MiAvatar name="Yusuf Demir" size="xs" tone="auto" decorative /> Yusuf Demir</dd>
          </div>
          <div class="pw__prop">
            <dt>Team</dt>
            <dd><MiAvatarGroup :items="members" :max="4" :size="24" /></dd>
          </div>
          <div class="pw__prop">
            <dt>Target</dt>
            <dd class="pw__inline"><MiIcon name="calendar" :size="14" /> Mar 28 · 5 weeks left</dd>
          </div>
          <div class="pw__prop">
            <dt>Progress</dt>
            <dd class="pw__inline"><MiProgressRing :value="64" :size="18" :stroke="3" label="Project progress" /> 64%</dd>
          </div>
        </dl>

        <div class="pw__tabs">
          <MiTabsList aria-label="Project sections">
            <MiTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
              {{ t.label }}<span v-if="t.count" class="pw__count">{{ t.count }}</span>
            </MiTabsTrigger>
          </MiTabsList>
        </div>
      </header>

      <main class="pw__body" aria-labelledby="pw-title">
        <MiTabsContent value="overview">
          <div class="pw__grid">
            <article v-for="m in milestones" :key="m.name" class="pw__card">
              <MiText variant="caption" tone="label3" weight="semibold">{{ m.when }}</MiText>
              <MiText as="h3" variant="subheadline" weight="semibold">{{ m.name }}</MiText>
              <MiProgress :value="m.done" size="sm" :label="m.done + '% done'" :show-value="false" />
              <MiText variant="caption" tone="label2">{{ m.done }}% · {{ m.issues }} issues</MiText>
            </article>
          </div>
        </MiTabsContent>
        <MiTabsContent value="issues">
          <ul class="pw__issues">
            <li v-for="i in issues" :key="i.id" class="pw__issue">
              <span class="pw__issue-id">{{ i.id }}</span>
              <MiText as="span" variant="subheadline" :lines="1">{{ i.title }}</MiText>
              <MiAvatar :name="i.owner" size="xs" tone="auto" />
            </li>
          </ul>
        </MiTabsContent>
        <MiTabsContent value="updates">
          <article class="pw__card pw__update">
            <div class="pw__inline"><MiAvatar name="Yusuf Demir" size="xs" tone="auto" decorative /><MiText as="span" variant="footnote" weight="semibold">Yusuf Demir</MiText><MiText as="span" variant="caption" tone="label3">Monday</MiText></div>
            <MiText variant="subheadline">Sync engine passed the 10k-record soak test on Android. iOS background fetch is the last blocker before beta; we keep the Mar 28 target.</MiText>
          </article>
        </MiTabsContent>
        <MiTabsContent v-for="t in quiet" :key="t" :value="t">
          <div class="pw__card"><MiSkeleton variant="text" :lines="['40%', '92%', '76%', '84%']" :animated="false" /></div>
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
.pw { container-type: inline-size; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.pw__header { display: grid; gap: 16px; padding: 12px 16px 0; background: var(--mi-card); box-shadow: 0 1px 0 var(--mi-sep); }
.pw__top { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; }
.pw__crumbs { min-width: 0; overflow: hidden; }
.pw__tools { display: flex; align-items: center; gap: 4px; flex: none; }
.pw__star { color: var(--mi-yellow); }

.pw__id { display: flex; align-items: center; gap: 14px; min-width: 0; }
.pw__glyph { display: grid; place-items: center; flex: none; width: 48px; height: 48px; border-radius: 14px; background: var(--mi-p-tint); }
.pw__glyph svg { width: 26px; height: 26px; }
.pw__glyph path:first-child { fill: color-mix(in srgb, var(--mi-p) 35%, transparent); }
.pw__glyph path:last-child { fill: var(--mi-p); }
.pw__name { display: grid; gap: 2px; min-width: 0; }

.pw__props { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; margin: 0; }
.pw__prop { display: grid; gap: 4px; min-width: 0; }
.pw__prop dt { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--mi-label3); }
.pw__prop dd { margin: 0; font-size: 13px; font-weight: 500; }
.pw__inline { display: flex; align-items: center; gap: 6px; min-width: 0; }
.pw__status {
  display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 8px 0 10px; border: 0; border-radius: 999px;
  font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; --c: var(--mi-green);
  color: color-mix(in srgb, var(--c) 70%, var(--mi-label)); background: color-mix(in srgb, var(--c) 14%, transparent);
}
.pw__status.is-risk { --c: var(--mi-orange); } .pw__status.is-off { --c: var(--mi-red); }
.pw__status i { width: 7px; height: 7px; border-radius: 50%; background: var(--c); }
.pw__status:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.pw__tabs { margin-inline: -16px; padding-inline: 12px; overflow-x: auto; scrollbar-width: none; }
.pw__count { margin-left: 6px; padding: 1px 6px; border-radius: 999px; font-size: 11px; font-weight: 600; color: var(--mi-label2); background: var(--mi-fill3); font-variant-numeric: tabular-nums; }

.pw__body { padding: 16px; }
.pw__grid { display: grid; gap: 12px; }
.pw__card { display: grid; gap: 6px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); }
.pw__update { gap: 10px; max-width: 640px; }
.pw__issues { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); }
.pw__issue { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px 14px; }
.pw__issue + .pw__issue { border-top: 1px solid var(--mi-sep); }
.pw__issue-id { font: 500 12px ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label3); }

@container (min-width: 620px) {
  .pw__header { padding: 14px 24px 0; }
  .pw__tabs { margin-inline: -24px; padding-inline: 20px; }
  .pw__props { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .pw__body { padding: 20px 24px; }
  .pw__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@container (min-width: 960px) {
  .pw__props { display: flex; flex-wrap: wrap; gap: 0; }
  .pw__prop { padding: 0 20px; }
  .pw__prop:first-child { padding-left: 0; }
  .pw__prop + .pw__prop { border-left: 1px solid var(--mi-sep); }
}
</style>
