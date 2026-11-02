<template>
  <section class="smr" aria-labelledby="smr-title">
    <header class="smr__head">
      <MiText id="smr-title" variant="title3" as="h2" weight="semibold">Sidebar modules</MiText>
      <MiText variant="footnote" tone="label2">Shown in place, inside the sidebar strip they belong to.</MiText>
    </header>

    <div class="smr__grid">
      <!-- Strip 1: workspace switcher on top, onboarding at the bottom. -->
      <div class="smr__strip">
        <MiText variant="caption2" tone="label3" weight="semibold" class="smr__tag">Sidebar top &amp; bottom</MiText>
        <div class="smr__switch">
          <button type="button" class="smr__ws" :aria-expanded="switcherOpen" aria-controls="smr-ws-list" @click="switcherOpen = !switcherOpen">
            <span class="smr__ws-mark" :style="{ background: `var(--mi-${workspace.color})` }" aria-hidden="true">{{ workspace.initials }}</span>
            <span class="smr__ws-text">
              <span class="smr__ws-name">{{ workspace.name }}</span>
              <span class="smr__ws-plan">{{ workspace.plan }} · {{ workspace.members }} members</span>
            </span>
            <MiIcon name="chevron-up-down" :size="16" class="smr__muted" />
          </button>
          <Transition name="smr-pop">
            <div v-if="switcherOpen" id="smr-ws-list" class="smr__menu" role="listbox" aria-label="Workspaces">
              <button
                v-for="w in workspaces" :key="w.id" type="button" role="option" class="smr__menu-row"
                :aria-selected="w.id === workspaceId" @click="pickWorkspace(w.id)"
              >
                <span class="smr__ws-mark is-sm" :style="{ background: `var(--mi-${w.color})` }" aria-hidden="true">{{ w.initials }}</span>
                <span class="smr__menu-name">{{ w.name }}</span>
                <MiIcon v-if="w.id === workspaceId" name="check" :size="14" class="smr__check" />
              </button>
              <MiSeparator />
              <button type="button" class="smr__menu-row is-quiet">
                <MiIcon name="plus" :size="14" />
                <span class="smr__menu-name">Create workspace</span>
                <MiKbd>⇧N</MiKbd>
              </button>
            </div>
          </Transition>
        </div>
        <div class="smr__faux" aria-hidden="true"><span v-for="n in 3" :key="n" /></div>

        <article class="smr__mod" aria-labelledby="smr-setup-title">
          <div v-if="doneCount < tasks.length" class="smr__setup">
            <div class="smr__setup-head">
              <div>
                <MiText id="smr-setup-title" variant="subheadline" as="h3" weight="semibold">Get set up</MiText>
                <MiText variant="caption" tone="label2">{{ doneCount }} of {{ tasks.length }} done</MiText>
              </div>
              <MiProgressRing :value="doneCount" :max="tasks.length" :size="36" label="Setup progress" />
            </div>
            <div class="smr__tasks">
              <MiCheckbox v-for="t in tasks" :key="t.id" v-model="t.done" :label="t.label" />
            </div>
          </div>
          <div v-else class="smr__done" role="status">
            <span class="smr__done-mark" aria-hidden="true"><MiIcon name="check" :size="18" /></span>
            <MiText id="smr-setup-title" variant="subheadline" as="h3" weight="semibold">You're all set</MiText>
            <MiText variant="caption" tone="label2">Your workspace is ready for its first study.</MiText>
            <MiButton variant="plain" size="small" @click="resetTasks">Show checklist again</MiButton>
          </div>
        </article>
      </div>

      <!-- Strip 2: plan and usage. -->
      <div class="smr__strip">
        <MiText variant="caption2" tone="label3" weight="semibold" class="smr__tag">Sidebar bottom</MiText>
        <div class="smr__faux" aria-hidden="true"><span v-for="n in 5" :key="n" /></div>
        <article class="smr__mod" aria-labelledby="smr-plan-title">
          <div class="smr__plan-head">
            <MiText id="smr-plan-title" variant="subheadline" as="h3" weight="semibold">Team plan</MiText>
            <MiBadge :label="'Renews ' + workspace.renews" variant="outline" tone="neutral" />
          </div>
          <MiMeter
            v-for="m in usage" :key="m.label" :label="m.label" :value="m.used" :max="m.max" size="sm"
            :caption="`${m.used} of ${m.max} ${m.unit}`" :hint="m.used / m.max >= 0.9 ? 'Almost full' : ''"
            :color="m.used / m.max >= 0.9 ? 'var(--mi-orange)' : undefined"
          />
          <MiButton block size="small" @click="upgraded = !upgraded">{{ upgraded ? 'Scale trial started · 14 days' : 'Upgrade to Scale' }}</MiButton>
          <MiTextLink href="#" class="smr__link">Compare plans</MiTextLink>
        </article>
      </div>

      <!-- Strip 3: changelog note and presence. -->
      <div class="smr__strip">
        <MiText variant="caption2" tone="label3" weight="semibold" class="smr__tag">Sidebar bottom</MiText>
        <div class="smr__faux" aria-hidden="true"><span v-for="n in 2" :key="n" /></div>
        <Transition name="smr-pop">
          <article v-if="!newsHidden" class="smr__mod smr__news" aria-labelledby="smr-news-title">
            <div class="smr__news-art" aria-hidden="true"><span /><span /><span /></div>
            <MiBadge label="New" tone="primary" variant="solid" shape="pill" />
            <MiText id="smr-news-title" variant="subheadline" as="h3" weight="semibold">Highlight reels export to MP4</MiText>
            <MiText variant="caption" tone="label2">Burned-in captions, speaker names and your logo, ready for the all-hands deck.</MiText>
            <MiIconButton class="smr__news-x" label="Dismiss announcement" variant="plain" size="small" @click="newsHidden = true">
              <MiIcon name="close" :size="13" />
            </MiIconButton>
          </article>
        </Transition>

        <article class="smr__mod" aria-labelledby="smr-me-title">
          <div class="smr__me">
            <MiBadge dot-only :dot-size="11" :tone="presence.tone" placement="bottom-right" ring-color="var(--mi-card)" :aria-label="presence.label">
              <template #target><MiAvatar name="Priya Raman" size="sm" tone="auto" decorative /></template>
            </MiBadge>
            <div class="smr__me-text">
              <MiText id="smr-me-title" variant="footnote" as="h3" weight="semibold">Priya Raman</MiText>
              <MiText variant="caption2" tone="label2" aria-live="polite">{{ presence.note }}</MiText>
            </div>
          </div>
          <div class="smr__presence" role="radiogroup" aria-label="Status">
            <button
              v-for="p in presences" :key="p.id" type="button" role="radio" class="smr__chip" :aria-checked="p.id === presenceId"
              @click="presenceId = p.id"
            >
              <i :class="'is-' + p.tone" aria-hidden="true" />{{ p.label }}
            </button>
          </div>
          <div class="smr__dnd">
            <MiText id="smr-dnd" variant="caption" weight="medium">Pause notifications</MiText>
            <MiSwitch v-model="paused" size="compact" aria-labelledby="smr-dnd" />
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const workspaces = [
  { id: 'fieldnote', name: 'Fieldnote Research', initials: 'FR', color: 'indigo', plan: 'Team plan', members: 14, renews: '1 Mar' },
  { id: 'ostra', name: 'Ostra Health UX', initials: 'OH', color: 'teal', plan: 'Scale plan', members: 38, renews: '19 Jun' },
  { id: 'bruni', name: 'Atelier Bruni', initials: 'AB', color: 'orange', plan: 'Free plan', members: 3, renews: 'never' }
]
const workspaceId = ref('fieldnote')
const switcherOpen = ref(true)
const workspace = computed(() => workspaces.find(w => w.id === workspaceId.value) ?? workspaces[0]!)
function pickWorkspace(id: string) {
  workspaceId.value = id
  switcherOpen.value = false
}

const tasks = reactive([
  { id: 'invite', label: 'Invite your team', done: true },
  { id: 'import', label: 'Import 10 interviews', done: true },
  { id: 'tag', label: 'Tag your first insight', done: false },
  { id: 'slack', label: 'Connect Slack', done: false },
  { id: 'reel', label: 'Share a highlight reel', done: false }
])
const doneCount = computed(() => tasks.filter(t => t.done).length)
function resetTasks() { tasks.forEach((t, i) => { t.done = i < 2 }) }

const usage = [
  { label: 'Seats', used: 14, max: 15, unit: 'seats' },
  { label: 'Transcription', used: 38, max: 50, unit: 'hours' },
  { label: 'Storage', used: 61, max: 100, unit: 'GB' }
]
const upgraded = ref(false)
const newsHidden = ref(false)

type Presence = { id: string, label: string, note: string, tone: 'success' | 'warning' | 'danger' | 'neutral' }
const presences: Presence[] = [
  { id: 'active', label: 'Active', note: 'Available', tone: 'success' },
  { id: 'focus', label: 'Focusing', note: 'Focusing until 15:00', tone: 'warning' },
  { id: 'session', label: 'In a session', note: 'Running a user interview', tone: 'danger' },
  { id: 'away', label: 'Away', note: 'Back tomorrow', tone: 'neutral' }
]
const presenceId = ref('focus')
const paused = ref(true)
const presence = computed(() => {
  const p = presences.find(x => x.id === presenceId.value) ?? presences[0]!
  return { ...p, note: paused.value ? p.note + ' · muted' : p.note }
})
</script>

<style scoped>
.smr { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.smr__head { display: grid; gap: 2px; }
.smr__grid { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); align-items: stretch; }
@container (min-width: 620px) { .smr__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 940px) { .smr__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

/* A strip mimics a slice of sidebar so each module is seen where it lives. */
.smr__strip { display: flex; flex-direction: column; gap: 12px; min-width: 0; padding: 12px; border-radius: var(--mi-radius-xl); background: var(--mi-side); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.smr__tag { letter-spacing: .08em; text-transform: uppercase; padding: 0 4px; }
.smr__faux { flex: 1; display: grid; align-content: start; gap: 10px; padding: 6px 8px; min-height: 40px; }
.smr__faux span { display: block; height: 10px; border-radius: 5px; background: var(--mi-fill4); }
.smr__faux span:nth-child(2n) { transform: scaleX(.7); transform-origin: left; }

.smr__mod { position: relative; display: grid; gap: 12px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.smr__muted { color: var(--mi-label2); }

/* Workspace switcher */
.smr__switch { display: grid; gap: 6px; }
.smr__ws { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px; border: 0; border-radius: var(--mi-radius-m); background: var(--mi-card); box-shadow: var(--mi-sh1); color: inherit; font: inherit; text-align: left; cursor: pointer; }
.smr__ws:focus-visible, .smr__menu-row:focus-visible, .smr__chip:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.smr__ws-mark { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; color: var(--mi-p-on); font-size: 12px; font-weight: 700; letter-spacing: -.02em; }
.smr__ws-mark.is-sm { width: 22px; height: 22px; border-radius: 6px; font-size: 9px; }
.smr__ws-text { display: grid; flex: 1; min-width: 0; }
.smr__ws-name { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.smr__ws-plan { font-size: 12px; color: var(--mi-label2); }
.smr__menu { display: grid; gap: 2px; padding: 6px; border-radius: var(--mi-radius-m); background: var(--mi-elev); box-shadow: var(--mi-sh2); transform-origin: top center; }
.smr__menu-row { display: flex; align-items: center; gap: 10px; width: 100%; padding: 7px 8px; border: 0; border-radius: var(--mi-radius-s); background: none; color: var(--mi-label); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
.smr__menu-row:hover { background: var(--mi-fill4); }
.smr__menu-row.is-quiet { color: var(--mi-label2); }
.smr__menu-name { flex: 1; min-width: 0; }
.smr__check { color: var(--mi-p-text); }

/* Setup checklist */
.smr__setup { display: grid; gap: 12px; }
.smr__setup-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.smr__tasks { display: grid; gap: 8px; }
.smr__done { display: grid; justify-items: start; gap: 4px; }
.smr__done-mark { display: grid; place-items: center; width: 34px; height: 34px; margin-bottom: 4px; border-radius: 50%; color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 16%, transparent); }

/* Plan */
.smr__plan-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.smr__link { justify-self: center; font-size: 13px; }

/* What's new */
.smr__news { gap: 6px; justify-items: start; overflow: hidden; }
.smr__news-art { position: relative; width: 100%; height: 64px; margin-bottom: 6px; border-radius: var(--mi-radius-m); overflow: hidden; background: linear-gradient(120deg, var(--mi-p-tint), var(--mi-s-tint)); }
.smr__news-art span { position: absolute; bottom: 12px; width: 26%; height: 28px; border-radius: 6px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.smr__news-art span:nth-child(1) { left: 10%; transform: rotate(-6deg); }
.smr__news-art span:nth-child(2) { left: 37%; transform: translateY(-8px); }
.smr__news-art span:nth-child(3) { left: 64%; transform: rotate(5deg); }
.smr__news-x { position: absolute; top: 8px; right: 8px; }

/* Presence */
.smr__me { display: flex; align-items: center; gap: 10px; }
.smr__me-text { display: grid; min-width: 0; }
.smr__presence { display: flex; flex-wrap: wrap; gap: 6px; }
.smr__chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border: 0; border-radius: 99px; background: var(--mi-fill4); color: var(--mi-label2); font: 500 12px/1.2 var(--mi-font); cursor: pointer; }
.smr__chip[aria-checked="true"] { background: var(--mi-p-tint); color: var(--mi-p-text); }
.smr__chip i { width: 7px; height: 7px; border-radius: 50%; }
.smr__chip i.is-success { background: var(--mi-green); }
.smr__chip i.is-warning { background: var(--mi-orange); }
.smr__chip i.is-danger { background: var(--mi-red); }
.smr__chip i.is-neutral { background: var(--mi-ctl); }
.smr__dnd { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 10px; border-top: 1px solid var(--mi-sep); }

.smr-pop-enter-active, .smr-pop-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.smr-pop-enter-from, .smr-pop-leave-to { opacity: 0; transform: translateY(-4px) scale(.98); }
</style>
