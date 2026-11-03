<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="smr-title">
    <header class="mi:grid mi:gap-0.5">
      <MiText id="smr-title" variant="title3" as="h2" weight="semibold">Sidebar modules</MiText>
      <MiText variant="footnote" tone="label2">Shown in place, inside the sidebar strip they belong to.</MiText>
    </header>

    <div class="mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:items-stretch mi:@[620px]:grid-cols-2 mi:@[940px]:grid-cols-3">
      <!-- Strip 1: workspace switcher on top, onboarding at the bottom. -->
      <div class="mi:flex mi:flex-col mi:gap-3 mi:min-w-0 mi:p-3 mi:rounded-xl mi:[background:var(--mi-side)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
        <MiText variant="caption2" tone="label3" weight="semibold" class="mi:tracking-[.08em]! mi:uppercase! mi:py-0 mi:px-1">Sidebar top &amp; bottom</MiText>
        <div class="mi:grid mi:gap-1.5">
          <button type="button" class="mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:p-2 mi:[border:0] mi:rounded-md mi:[background:var(--mi-card)] mi:shadow-1 mi:text-inherit mi:[font:inherit] mi:text-left mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-expanded="switcherOpen" aria-controls="smr-ws-list" @click="switcherOpen = !switcherOpen">
            <span class="mi:flex-[none] mi:grid mi:place-items-center mi:w-8 mi:h-8 mi:rounded-[9px] mi:text-p-on mi:text-[12px] mi:font-bold mi:tracking-[-.02em]" :style="{ background: `var(--mi-${workspace.color})` }" aria-hidden="true">{{ workspace.initials }}</span>
            <span class="mi:grid mi:flex-1 mi:min-w-0">
              <span class="mi:text-[14px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ workspace.name }}</span>
              <span class="mi:text-[12px] mi:text-label2">{{ workspace.plan }} · {{ workspace.members }} members</span>
            </span>
            <MiIcon name="chevron-up-down" :size="16" class="mi:text-label2" />
          </button>
          <Transition enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(-4px)_scale(.98)]" leave-to-class="mi:opacity-0 mi:transform-[translateY(-4px)_scale(.98)]">
            <div v-if="switcherOpen" id="smr-ws-list" class="mi:grid mi:gap-0.5 mi:p-1.5 mi:rounded-md mi:[background:var(--mi-elev)] mi:shadow-2 mi:origin-[top_center]" role="listbox" aria-label="Workspaces">
              <button
                v-for="w in workspaces" :key="w.id" type="button" role="option" class="mi:[font:inherit] mi:text-[13px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:py-[7px] mi:px-2 mi:[border:0] mi:rounded-sm mi:[background:none] mi:text-label mi:text-left mi:cursor-pointer mi:hover:[background:var(--mi-fill4)]"
                :aria-selected="w.id === workspaceId" @click="pickWorkspace(w.id)"
              >
                <span class="mi:flex-[none] mi:grid mi:place-items-center mi:w-[22px] mi:h-[22px] mi:rounded-[6px] mi:text-p-on mi:text-[9px] mi:font-bold mi:tracking-[-.02em]" :style="{ background: `var(--mi-${w.color})` }" aria-hidden="true">{{ w.initials }}</span>
                <span class="mi:flex-1 mi:min-w-0">{{ w.name }}</span>
                <MiIcon v-if="w.id === workspaceId" name="check" :size="14" class="mi:text-p-text" />
              </button>
              <MiSeparator />
              <button type="button" class="mi:[font:inherit] mi:text-[13px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:py-[7px] mi:px-2 mi:[border:0] mi:rounded-sm mi:[background:none] mi:text-label2 mi:text-left mi:cursor-pointer mi:hover:[background:var(--mi-fill4)]">
                <MiIcon name="plus" :size="14" />
                <span class="mi:flex-1 mi:min-w-0">Create workspace</span>
                <MiKbd>⇧N</MiKbd>
              </button>
            </div>
          </Transition>
        </div>
        <div class="mi:flex-1 mi:grid mi:content-start mi:gap-2.5 mi:py-1.5 mi:px-2 mi:min-h-10" aria-hidden="true"><span class="mi:h-2.5 mi:rounded-[5px] mi:block mi:[background:var(--mi-fill4)] mi:[&:nth-child(2n)]:transform-[scaleX(.7)] mi:[&:nth-child(2n)]:origin-left" v-for="n in 3" :key="n" /></div>

        <article class="mi:gap-3 mi:relative mi:grid mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="smr-setup-title">
          <div v-if="doneCount < tasks.length" class="mi:grid mi:gap-3">
            <div class="mi:flex mi:items-center mi:justify-between mi:gap-2.5">
              <div>
                <MiText id="smr-setup-title" variant="subheadline" as="h3" weight="semibold">Get set up</MiText>
                <MiText variant="caption" tone="label2">{{ doneCount }} of {{ tasks.length }} done</MiText>
              </div>
              <MiProgressRing :value="doneCount" :max="tasks.length" :size="36" label="Setup progress" />
            </div>
            <div class="mi:grid mi:gap-2">
              <MiCheckbox v-for="t in tasks" :key="t.id" v-model="t.done" :label="t.label" />
            </div>
          </div>
          <div v-else class="mi:grid mi:justify-items-start mi:gap-1" role="status">
            <span class="mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:mb-1 mi:rounded-[50%] mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)]" aria-hidden="true"><MiIcon name="check" :size="18" /></span>
            <MiText id="smr-setup-title" variant="subheadline" as="h3" weight="semibold">You're all set</MiText>
            <MiText variant="caption" tone="label2">Your workspace is ready for its first study.</MiText>
            <MiButton variant="plain" size="small" @click="resetTasks">Show checklist again</MiButton>
          </div>
        </article>
      </div>

      <!-- Strip 2: plan and usage. -->
      <div class="mi:flex mi:flex-col mi:gap-3 mi:min-w-0 mi:p-3 mi:rounded-xl mi:[background:var(--mi-side)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
        <MiText variant="caption2" tone="label3" weight="semibold" class="mi:tracking-[.08em]! mi:uppercase! mi:py-0 mi:px-1">Sidebar bottom</MiText>
        <div class="mi:flex-1 mi:grid mi:content-start mi:gap-2.5 mi:py-1.5 mi:px-2 mi:min-h-10" aria-hidden="true"><span class="mi:h-2.5 mi:rounded-[5px] mi:block mi:[background:var(--mi-fill4)] mi:[&:nth-child(2n)]:transform-[scaleX(.7)] mi:[&:nth-child(2n)]:origin-left" v-for="n in 5" :key="n" /></div>
        <article class="mi:gap-3 mi:relative mi:grid mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="smr-plan-title">
          <div class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:flex-wrap">
            <MiText id="smr-plan-title" variant="subheadline" as="h3" weight="semibold">Team plan</MiText>
            <MiBadge :label="'Renews ' + workspace.renews" variant="outline" tone="neutral" />
          </div>
          <MiMeter
            v-for="m in usage" :key="m.label" :label="m.label" :value="m.used" :max="m.max" size="sm"
            :caption="`${m.used} of ${m.max} ${m.unit}`" :hint="m.used / m.max >= 0.9 ? 'Almost full' : ''"
            :color="m.used / m.max >= 0.9 ? 'var(--mi-orange)' : undefined"
          />
          <MiButton block size="small" @click="upgraded = !upgraded">{{ upgraded ? 'Scale trial started · 14 days' : 'Upgrade to Scale' }}</MiButton>
          <MiTextLink href="#" class="mi:text-[13px]! mi:justify-self-center">Compare plans</MiTextLink>
        </article>
      </div>

      <!-- Strip 3: changelog note and presence. -->
      <div class="mi:flex mi:flex-col mi:gap-3 mi:min-w-0 mi:p-3 mi:rounded-xl mi:[background:var(--mi-side)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
        <MiText variant="caption2" tone="label3" weight="semibold" class="mi:tracking-[.08em]! mi:uppercase! mi:py-0 mi:px-1">Sidebar bottom</MiText>
        <div class="mi:flex-1 mi:grid mi:content-start mi:gap-2.5 mi:py-1.5 mi:px-2 mi:min-h-10" aria-hidden="true"><span class="mi:h-2.5 mi:rounded-[5px] mi:block mi:[background:var(--mi-fill4)] mi:[&:nth-child(2n)]:transform-[scaleX(.7)] mi:[&:nth-child(2n)]:origin-left" v-for="n in 2" :key="n" /></div>
        <Transition enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(-4px)_scale(.98)]" leave-to-class="mi:opacity-0 mi:transform-[translateY(-4px)_scale(.98)]">
          <article v-if="!newsHidden" class="mi:gap-1.5 mi:relative mi:grid mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:justify-items-start mi:overflow-hidden" aria-labelledby="smr-news-title">
            <div class="mi:relative mi:w-full mi:h-16 mi:mb-1.5 mi:rounded-md mi:overflow-hidden mi:[background:linear-gradient(120deg,_var(--mi-p-tint),_var(--mi-s-tint))]" aria-hidden="true"><span class="mi:absolute mi:w-[26%] mi:h-7 mi:rounded-[6px] mi:bottom-3 mi:[background:var(--mi-card)] mi:shadow-1 mi:[&:nth-child(1)]:left-[10%] mi:[&:nth-child(1)]:transform-[rotate(-6deg)] mi:[&:nth-child(2)]:left-[37%] mi:[&:nth-child(2)]:transform-[translateY(-8px)] mi:[&:nth-child(3)]:left-[64%] mi:[&:nth-child(3)]:transform-[rotate(5deg)]" /><span class="mi:absolute mi:w-[26%] mi:h-7 mi:rounded-[6px] mi:bottom-3 mi:[background:var(--mi-card)] mi:shadow-1 mi:[&:nth-child(1)]:left-[10%] mi:[&:nth-child(1)]:transform-[rotate(-6deg)] mi:[&:nth-child(2)]:left-[37%] mi:[&:nth-child(2)]:transform-[translateY(-8px)] mi:[&:nth-child(3)]:left-[64%] mi:[&:nth-child(3)]:transform-[rotate(5deg)]" /><span class="mi:absolute mi:w-[26%] mi:h-7 mi:rounded-[6px] mi:bottom-3 mi:[background:var(--mi-card)] mi:shadow-1 mi:[&:nth-child(1)]:left-[10%] mi:[&:nth-child(1)]:transform-[rotate(-6deg)] mi:[&:nth-child(2)]:left-[37%] mi:[&:nth-child(2)]:transform-[translateY(-8px)] mi:[&:nth-child(3)]:left-[64%] mi:[&:nth-child(3)]:transform-[rotate(5deg)]" /></div>
            <MiBadge label="New" tone="primary" variant="solid" shape="pill" />
            <MiText id="smr-news-title" variant="subheadline" as="h3" weight="semibold">Highlight reels export to MP4</MiText>
            <MiText variant="caption" tone="label2">Burned-in captions, speaker names and your logo, ready for the all-hands deck.</MiText>
            <MiIconButton class="mi:absolute! mi:top-2 mi:right-2" label="Dismiss announcement" variant="plain" size="small" @click="newsHidden = true">
              <MiIcon name="close" :size="13" />
            </MiIconButton>
          </article>
        </Transition>

        <article class="mi:gap-3 mi:relative mi:grid mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="smr-me-title">
          <div class="mi:flex mi:items-center mi:gap-2.5">
            <MiBadge dot-only :dot-size="11" :tone="presence.tone" placement="bottom-right" ring-color="var(--mi-card)" :aria-label="presence.label">
              <template #target><MiAvatar name="Priya Raman" size="sm" tone="auto" decorative /></template>
            </MiBadge>
            <div class="mi:grid mi:min-w-0">
              <MiText id="smr-me-title" variant="footnote" as="h3" weight="semibold">Priya Raman</MiText>
              <MiText variant="caption2" tone="label2" aria-live="polite">{{ presence.note }}</MiText>
            </div>
          </div>
          <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="radiogroup" aria-label="Status">
            <button
              v-for="p in presences" :key="p.id" type="button" role="radio" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:inline-flex mi:items-center mi:gap-1.5 mi:py-[5px] mi:px-2.5 mi:[border:0] mi:rounded-[99px] mi:[background:var(--mi-fill4)] mi:text-label2 mi:[font:500_12px/1.2_var(--mi-font)] mi:cursor-pointer mi:aria-checked:[background:var(--mi-p-tint)] mi:aria-checked:text-p-text" :aria-checked="p.id === presenceId"
              @click="presenceId = p.id"
            >
              <i class="mi:w-[7px] mi:h-[7px] mi:rounded-[50%]" :class="{ success: 'mi:bg-green', warning: 'mi:bg-orange', danger: 'mi:bg-red', neutral: 'mi:bg-ctl' }[p.tone]" aria-hidden="true" />{{ p.label }}
            </button>
          </div>
          <div class="mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:pt-2.5 mi:border-t mi:border-t-sep">
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

