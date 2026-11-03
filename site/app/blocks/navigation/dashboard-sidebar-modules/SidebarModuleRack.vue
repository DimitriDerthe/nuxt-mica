<template>
  <section class="smr mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="smr-title">
    <header class="smr__head mi:grid mi:gap-0.5">
      <MiText id="smr-title" variant="title3" as="h2" weight="semibold">Sidebar modules</MiText>
      <MiText variant="footnote" tone="label2">Shown in place, inside the sidebar strip they belong to.</MiText>
    </header>

    <div class="smr__grid mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:items-stretch mi:@[620px]:grid-cols-2 mi:@[940px]:grid-cols-3">
      <!-- Strip 1: workspace switcher on top, onboarding at the bottom. -->
      <div class="smr__strip mi:flex mi:flex-col mi:gap-3 mi:min-w-0 mi:p-3 mi:rounded-xl mi:[background:var(--mi-side)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
        <MiText variant="caption2" tone="label3" weight="semibold" class="smr__tag mi:py-0 mi:px-1">Sidebar top &amp; bottom</MiText>
        <div class="smr__switch mi:grid mi:gap-1.5">
          <button type="button" class="smr__ws mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:p-2 mi:[border:0] mi:rounded-md mi:[background:var(--mi-card)] mi:shadow-1 mi:text-inherit mi:[font:inherit] mi:text-left mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-expanded="switcherOpen" aria-controls="smr-ws-list" @click="switcherOpen = !switcherOpen">
            <span class="smr__ws-mark mi:flex-[none] mi:grid mi:place-items-center mi:w-8 mi:h-8 mi:rounded-[9px] mi:text-p-on mi:text-[12px] mi:font-bold mi:tracking-[-.02em] mi:[&.is-sm]:text-[9px]" :style="{ background: `var(--mi-${workspace.color})` }" aria-hidden="true">{{ workspace.initials }}</span>
            <span class="smr__ws-text mi:grid mi:flex-1 mi:min-w-0">
              <span class="smr__ws-name mi:text-[14px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ workspace.name }}</span>
              <span class="smr__ws-plan mi:text-[12px] mi:text-label2">{{ workspace.plan }} · {{ workspace.members }} members</span>
            </span>
            <MiIcon name="chevron-up-down" :size="16" class="smr__muted mi:text-label2" />
          </button>
          <Transition name="smr-pop">
            <div v-if="switcherOpen" id="smr-ws-list" class="smr__menu mi:grid mi:gap-0.5 mi:p-1.5 mi:rounded-md mi:[background:var(--mi-elev)] mi:shadow-2 mi:origin-[top_center]" role="listbox" aria-label="Workspaces">
              <button
                v-for="w in workspaces" :key="w.id" type="button" role="option" class="smr__menu-row mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:py-[7px] mi:px-2 mi:[border:0] mi:rounded-sm mi:[background:none] mi:text-label mi:text-left mi:cursor-pointer mi:hover:[background:var(--mi-fill4)] mi:[&.is-quiet]:text-label2"
                :aria-selected="w.id === workspaceId" @click="pickWorkspace(w.id)"
              >
                <span class="smr__ws-mark is-sm mi:flex-[none] mi:grid mi:place-items-center mi:w-8 mi:h-8 mi:rounded-[9px] mi:text-p-on mi:text-[12px] mi:font-bold mi:tracking-[-.02em] mi:[&.is-sm]:text-[9px]" :style="{ background: `var(--mi-${w.color})` }" aria-hidden="true">{{ w.initials }}</span>
                <span class="smr__menu-name mi:flex-1 mi:min-w-0">{{ w.name }}</span>
                <MiIcon v-if="w.id === workspaceId" name="check" :size="14" class="smr__check mi:text-p-text" />
              </button>
              <MiSeparator />
              <button type="button" class="smr__menu-row is-quiet mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:py-[7px] mi:px-2 mi:[border:0] mi:rounded-sm mi:[background:none] mi:text-label mi:text-left mi:cursor-pointer mi:hover:[background:var(--mi-fill4)] mi:[&.is-quiet]:text-label2">
                <MiIcon name="plus" :size="14" />
                <span class="smr__menu-name mi:flex-1 mi:min-w-0">Create workspace</span>
                <MiKbd>⇧N</MiKbd>
              </button>
            </div>
          </Transition>
        </div>
        <div class="smr__faux mi:flex-1 mi:grid mi:content-start mi:gap-2.5 mi:py-1.5 mi:px-2 mi:min-h-10" aria-hidden="true"><span class="mi:[.smr__faux_&]:block mi:[.smr__faux_&]:[background:var(--mi-fill4)] mi:[.smr__faux_&:nth-child(2n)]:transform-[scaleX(.7)] mi:[.smr__faux_&:nth-child(2n)]:origin-left" v-for="n in 3" :key="n" /></div>

        <article class="smr__mod mi:relative mi:grid mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="smr-setup-title">
          <div v-if="doneCount < tasks.length" class="smr__setup mi:grid mi:gap-3">
            <div class="smr__setup-head mi:flex mi:items-center mi:justify-between mi:gap-2.5">
              <div>
                <MiText id="smr-setup-title" variant="subheadline" as="h3" weight="semibold">Get set up</MiText>
                <MiText variant="caption" tone="label2">{{ doneCount }} of {{ tasks.length }} done</MiText>
              </div>
              <MiProgressRing :value="doneCount" :max="tasks.length" :size="36" label="Setup progress" />
            </div>
            <div class="smr__tasks mi:grid mi:gap-2">
              <MiCheckbox v-for="t in tasks" :key="t.id" v-model="t.done" :label="t.label" />
            </div>
          </div>
          <div v-else class="smr__done mi:grid mi:justify-items-start mi:gap-1" role="status">
            <span class="smr__done-mark mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:mb-1 mi:rounded-[50%] mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)]" aria-hidden="true"><MiIcon name="check" :size="18" /></span>
            <MiText id="smr-setup-title" variant="subheadline" as="h3" weight="semibold">You're all set</MiText>
            <MiText variant="caption" tone="label2">Your workspace is ready for its first study.</MiText>
            <MiButton variant="plain" size="small" @click="resetTasks">Show checklist again</MiButton>
          </div>
        </article>
      </div>

      <!-- Strip 2: plan and usage. -->
      <div class="smr__strip mi:flex mi:flex-col mi:gap-3 mi:min-w-0 mi:p-3 mi:rounded-xl mi:[background:var(--mi-side)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
        <MiText variant="caption2" tone="label3" weight="semibold" class="smr__tag mi:py-0 mi:px-1">Sidebar bottom</MiText>
        <div class="smr__faux mi:flex-1 mi:grid mi:content-start mi:gap-2.5 mi:py-1.5 mi:px-2 mi:min-h-10" aria-hidden="true"><span class="mi:[.smr__faux_&]:block mi:[.smr__faux_&]:[background:var(--mi-fill4)] mi:[.smr__faux_&:nth-child(2n)]:transform-[scaleX(.7)] mi:[.smr__faux_&:nth-child(2n)]:origin-left" v-for="n in 5" :key="n" /></div>
        <article class="smr__mod mi:relative mi:grid mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="smr-plan-title">
          <div class="smr__plan-head mi:flex mi:items-center mi:justify-between mi:gap-2 mi:flex-wrap">
            <MiText id="smr-plan-title" variant="subheadline" as="h3" weight="semibold">Team plan</MiText>
            <MiBadge :label="'Renews ' + workspace.renews" variant="outline" tone="neutral" />
          </div>
          <MiMeter
            v-for="m in usage" :key="m.label" :label="m.label" :value="m.used" :max="m.max" size="sm"
            :caption="`${m.used} of ${m.max} ${m.unit}`" :hint="m.used / m.max >= 0.9 ? 'Almost full' : ''"
            :color="m.used / m.max >= 0.9 ? 'var(--mi-orange)' : undefined"
          />
          <MiButton block size="small" @click="upgraded = !upgraded">{{ upgraded ? 'Scale trial started · 14 days' : 'Upgrade to Scale' }}</MiButton>
          <MiTextLink href="#" class="smr__link mi:justify-self-center">Compare plans</MiTextLink>
        </article>
      </div>

      <!-- Strip 3: changelog note and presence. -->
      <div class="smr__strip mi:flex mi:flex-col mi:gap-3 mi:min-w-0 mi:p-3 mi:rounded-xl mi:[background:var(--mi-side)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
        <MiText variant="caption2" tone="label3" weight="semibold" class="smr__tag mi:py-0 mi:px-1">Sidebar bottom</MiText>
        <div class="smr__faux mi:flex-1 mi:grid mi:content-start mi:gap-2.5 mi:py-1.5 mi:px-2 mi:min-h-10" aria-hidden="true"><span class="mi:[.smr__faux_&]:block mi:[.smr__faux_&]:[background:var(--mi-fill4)] mi:[.smr__faux_&:nth-child(2n)]:transform-[scaleX(.7)] mi:[.smr__faux_&:nth-child(2n)]:origin-left" v-for="n in 2" :key="n" /></div>
        <Transition name="smr-pop">
          <article v-if="!newsHidden" class="smr__mod smr__news mi:relative mi:grid mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:justify-items-start mi:overflow-hidden" aria-labelledby="smr-news-title">
            <div class="smr__news-art mi:relative mi:w-full mi:h-16 mi:mb-1.5 mi:rounded-md mi:overflow-hidden mi:[background:linear-gradient(120deg,_var(--mi-p-tint),_var(--mi-s-tint))]" aria-hidden="true"><span class="mi:[.smr__news-art_&]:bottom-3 mi:[.smr__news-art_&]:[background:var(--mi-card)] mi:[.smr__news-art_&]:shadow-1 mi:[.smr__news-art_&:nth-child(1)]:left-[10%] mi:[.smr__news-art_&:nth-child(1)]:transform-[rotate(-6deg)] mi:[.smr__news-art_&:nth-child(2)]:left-[37%] mi:[.smr__news-art_&:nth-child(2)]:transform-[translateY(-8px)] mi:[.smr__news-art_&:nth-child(3)]:left-[64%] mi:[.smr__news-art_&:nth-child(3)]:transform-[rotate(5deg)]" /><span class="mi:[.smr__news-art_&]:bottom-3 mi:[.smr__news-art_&]:[background:var(--mi-card)] mi:[.smr__news-art_&]:shadow-1 mi:[.smr__news-art_&:nth-child(1)]:left-[10%] mi:[.smr__news-art_&:nth-child(1)]:transform-[rotate(-6deg)] mi:[.smr__news-art_&:nth-child(2)]:left-[37%] mi:[.smr__news-art_&:nth-child(2)]:transform-[translateY(-8px)] mi:[.smr__news-art_&:nth-child(3)]:left-[64%] mi:[.smr__news-art_&:nth-child(3)]:transform-[rotate(5deg)]" /><span class="mi:[.smr__news-art_&]:bottom-3 mi:[.smr__news-art_&]:[background:var(--mi-card)] mi:[.smr__news-art_&]:shadow-1 mi:[.smr__news-art_&:nth-child(1)]:left-[10%] mi:[.smr__news-art_&:nth-child(1)]:transform-[rotate(-6deg)] mi:[.smr__news-art_&:nth-child(2)]:left-[37%] mi:[.smr__news-art_&:nth-child(2)]:transform-[translateY(-8px)] mi:[.smr__news-art_&:nth-child(3)]:left-[64%] mi:[.smr__news-art_&:nth-child(3)]:transform-[rotate(5deg)]" /></div>
            <MiBadge label="New" tone="primary" variant="solid" shape="pill" />
            <MiText id="smr-news-title" variant="subheadline" as="h3" weight="semibold">Highlight reels export to MP4</MiText>
            <MiText variant="caption" tone="label2">Burned-in captions, speaker names and your logo, ready for the all-hands deck.</MiText>
            <MiIconButton class="smr__news-x" label="Dismiss announcement" variant="plain" size="small" @click="newsHidden = true">
              <MiIcon name="close" :size="13" />
            </MiIconButton>
          </article>
        </Transition>

        <article class="smr__mod mi:relative mi:grid mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="smr-me-title">
          <div class="smr__me mi:flex mi:items-center mi:gap-2.5">
            <MiBadge dot-only :dot-size="11" :tone="presence.tone" placement="bottom-right" ring-color="var(--mi-card)" :aria-label="presence.label">
              <template #target><MiAvatar name="Priya Raman" size="sm" tone="auto" decorative /></template>
            </MiBadge>
            <div class="smr__me-text mi:grid mi:min-w-0">
              <MiText id="smr-me-title" variant="footnote" as="h3" weight="semibold">Priya Raman</MiText>
              <MiText variant="caption2" tone="label2" aria-live="polite">{{ presence.note }}</MiText>
            </div>
          </div>
          <div class="smr__presence mi:flex mi:flex-wrap mi:gap-1.5" role="radiogroup" aria-label="Status">
            <button
              v-for="p in presences" :key="p.id" type="button" role="radio" class="smr__chip mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:inline-flex mi:items-center mi:gap-1.5 mi:py-[5px] mi:px-2.5 mi:[border:0] mi:rounded-[99px] mi:[background:var(--mi-fill4)] mi:text-label2 mi:[font:500_12px/1.2_var(--mi-font)] mi:cursor-pointer mi:aria-checked:[background:var(--mi-p-tint)] mi:aria-checked:text-p-text" :aria-checked="p.id === presenceId"
              @click="presenceId = p.id"
            >
              <i :class="'is-' + p.tone" aria-hidden="true" />{{ p.label }}
            </button>
          </div>
          <div class="smr__dnd mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:pt-2.5 mi:border-t mi:border-t-sep">
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
.smr__tag { letter-spacing: .08em; text-transform: uppercase; }
.smr__faux span { height: 10px; border-radius: 5px; }

.smr__mod { gap: 12px; }
.smr__ws-mark.is-sm { width: 22px; height: 22px; border-radius: 6px; }
.smr__menu-row { font: inherit; font-size: 13px; }
.smr__link { font-size: 13px; }

/* What's new */
.smr__news { gap: 6px; }
.smr__news-art span { position: absolute; width: 26%; height: 28px; border-radius: 6px; }
.smr__news-x { position: absolute; top: 8px; right: 8px; }
.smr__chip i { width: 7px; height: 7px; border-radius: 50%; }
.smr__chip i.is-success { background: var(--mi-green); }
.smr__chip i.is-warning { background: var(--mi-orange); }
.smr__chip i.is-danger { background: var(--mi-red); }
.smr__chip i.is-neutral { background: var(--mi-ctl); }

.smr-pop-enter-active, .smr-pop-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.smr-pop-enter-from, .smr-pop-leave-to { opacity: 0; transform: translateY(-4px) scale(.98); }
</style>
