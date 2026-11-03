<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="scl-title">
    <div v-if="paused" class="mi:grid mi:place-items-center mi:min-h-full mi:py-6 mi:px-0">
      <div class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-y-3.5 mi:gap-x-4 mi:w-full mi:max-w-130 mi:py-4.5 mi:px-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)] mi:@[560px]:grid-cols-[auto_minmax(0,_1fr)_auto]">
        <MiProgressRing :value="pct" :size="52" :stroke="5" label="Setup progress"><span class="mi:text-[12px] mi:font-bold mi:tabular-nums">{{ doneCount }}/{{ tasks.length }}</span></MiProgressRing>
        <div class="mi:grid mi:gap-0.5">
          <MiText id="scl-title" as="h2" variant="headline" weight="semibold">Setup paused</MiText>
          <MiText variant="footnote" tone="label2">
            <span class="mi:tabular-nums">{{ doneCount }} of {{ tasks.length }}</span> done. Pick it up any time from the Help menu.
          </MiText>
        </div>
        <MiButton variant="tinted" class="mi:col-span-full mi:justify-self-start mi:@[560px]:[grid-column:auto]" @click="paused = false">Resume setup</MiButton>
      </div>
    </div>

    <div v-else class="mi:grid mi:gap-6 mi:@[900px]:grid-cols-[300px_minmax(0,_1fr)] mi:@[900px]:gap-8 mi:@[900px]:items-start mi:@[1100px]:grid-cols-[340px_minmax(0,_1fr)] mi:@[1100px]:gap-12">
      <!-- Summary: time left, not a percentage, is what people decide on. -->
      <div class="mi:relative mi:grid mi:gap-4.5 mi:content-start mi:p-5.5 mi:overflow-hidden mi:isolate mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh1)] mi:before:content-[''] mi:before:absolute mi:before:top-[-30%] mi:before:right-[-20%] mi:before:bottom-auto mi:before:left-auto mi:before:w-[80%] mi:before:aspect-[1] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_var(--mi-p-tint),_transparent)] mi:@[560px]:grid-cols-[auto_minmax(0,_1fr)] mi:@[560px]:items-center mi:@[560px]:gap-x-6 mi:@[560px]:py-6 mi:@[560px]:px-7 mi:@[900px]:grid-cols-[minmax(0,_1fr)] mi:@[900px]:p-7 mi:@[900px]:gap-5.5">
        <div class="mi:flex">
          <MiProgressRing :value="pct" :size="128" :stroke="9" label="Setup progress">
            <span class="mi:grid mi:justify-items-center mi:leading-none">
              <span class="mi:text-[22px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ allDone ? 'Done' : minutesLeft + ' min' }}</span>
              <span class="mi:mt-1 mi:text-[11px] mi:font-medium mi:text-label2">{{ allDone ? 'all set' : 'left' }}</span>
            </span>
          </MiProgressRing>
        </div>
        <div class="mi:grid mi:gap-1.5">
          <MiText variant="caption" weight="semibold" tone="primary" class="mi:tracking-[.02em]!">Oakridge Labs · first run</MiText>
          <MiText id="scl-title" as="h2" variant="title2" weight="bold" balance>
            {{ allDone ? 'Kiln is ready for your team' : 'Get Kiln ready for your team' }}
          </MiText>
          <MiText variant="subheadline" tone="label2">
            {{ allDone ? 'Your first preview deploy will start on the next push to main.' : 'A few short tasks. Each one runs right here, and all of it can change later in Settings.' }}
          </MiText>
        </div>
        <div class="mi:flex mi:flex-wrap mi:gap-2 mi:@[560px]:col-span-full mi:@[900px]:grid mi:@[900px]:justify-items-start">
          <MiButton v-if="next" @click="toggle(next.id, true)">
            {{ next.id === openId ? 'Finish' : 'Next' }}: {{ next.short }}
            <template #trailing><MiIcon name="arrow-right" :size="15" /></template>
          </MiButton>
          <MiButton v-else>Open the dashboard</MiButton>
          <MiButton v-if="!allDone" variant="plain" @click="paused = true">Skip for now</MiButton>
        </div>
      </div>

      <div class="mi:grid mi:content-start mi:gap-3">
        <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-3 mi:py-0 mi:px-1">
          <MiText as="h3" variant="headline" weight="semibold">Setup checklist</MiText>
          <MiText as="span" variant="footnote" tone="label2" class="mi:tabular-nums" aria-live="polite">{{ doneCount }} of {{ tasks.length }} done</MiText>
        </div>

        <TransitionGroup tag="ol" enter-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(-6px)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:absolute mi:left-0 mi:right-0" leave-to-class="mi:opacity-0 mi:transform-[translateY(10px)_scale(.98)]" move-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" class="mi:relative mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="t in openTasks" :key="t.id" class="mi:rounded-lg mi:[background:var(--mi-card)] " :class="openId === t.id ? 'mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)]' : 'mi:shadow-[0_0_0_1px_var(--mi-sep)]'">
            <button
              :id="'scl-h-' + t.id" type="button" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto_auto] mi:items-center mi:gap-3 mi:w-full mi:py-3.5 mi:px-4 mi:[border:0] mi:rounded-[inherit] mi:text-start mi:cursor-pointer mi:[font:inherit] mi:text-inherit mi:[background:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :aria-expanded="openId === t.id" :aria-controls="'scl-p-' + t.id"
              @click="toggle(t.id)"
            >
              <span class="mi:relative mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:flex-[none] mi:rounded-[50%] mi:text-[color:var(--mi-p-on,_var(--mi-card))] mi:shadow-[inset_0_0_0_1.5px_var(--mi-fill)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[50%] mi:before:[background:var(--mi-p)] mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_420ms_var(--mi-spring)]" :class="finishing === t.id ? 'mi:before:opacity-100 mi:before:transform-[scale(1)]' : 'mi:before:opacity-0 mi:before:transform-[scale(.3)]'" aria-hidden="true"><MiIcon name="check" :size="13" :weight="3" class="mi:relative mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)_80ms,_transform_460ms_var(--mi-spring)_80ms]" :class="finishing === t.id ? 'mi:opacity-100 mi:[transform:none]' : 'mi:opacity-0 mi:transform-[scale(.4)_rotate(-20deg)]'" /></span>
              <span class="mi:grid mi:gap-0.5 mi:min-w-0">
                <span class="mi:text-[15px] mi:font-semibold mi:tracking-[-.01em]" :class="finishing === t.id ? 'mi:text-label2' : ''">{{ t.title }}</span>
                <span class="mi:text-[13px] mi:leading-[1.35] mi:text-label2">{{ t.sub }}</span>
              </span>
              <span class="mi:py-[3px] mi:px-2 mi:rounded-[999px] mi:text-[12px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill4)] mi:tabular-nums mi:whitespace-nowrap mi:@max-[459px]:hidden">{{ t.mins }} min</span>
              <MiIcon name="chevron-down" :size="16" class="mi:text-label3 mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="openId === t.id ? 'mi:transform-[rotate(180deg)]' : ''" />
            </button>

            <Transition enter-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(-6px)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease)]" leave-to-class="mi:opacity-0 mi:transform-[translateY(-6px)]">
              <div v-if="openId === t.id" :id="'scl-p-' + t.id" class="mi:pt-0.5 mi:pr-4 mi:pb-4.5 mi:pl-12.5 mi:@max-[459px]:pl-4" role="region" :aria-labelledby="'scl-h-' + t.id">
                <!-- Invite -->
                <form v-if="t.id === 'invite'" class="mi:grid mi:gap-3.5" novalidate @submit.prevent="complete('invite')">
                  <MiField label="Teammates' emails" hint="Press Return or comma after each address." :error="inviteError">
                    <template #default="{ id, describedBy }">
                      <MiTagInput :id="id" v-model="invites" :aria-describedby="describedBy" placeholder="name@oakridge.dev" :validate="isEmail" @reject="inviteError = 'That does not look like an email address.'" @add="inviteError = ''" />
                    </template>
                  </MiField>
                  <div class="mi:justify-between mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
                    <MiSegmented v-model="inviteRole" label="Role for invitees" :options="roles" />
                    <MiButton type="submit" :disabled="!invites.length">Send {{ invites.length || '' }} {{ invites.length === 1 ? 'invite' : 'invites' }}</MiButton>
                  </div>
                </form>

                <!-- Repository -->
                <div v-else-if="t.id === 'repo'" class="mi:grid mi:gap-3.5">
                  <MiRadioGroup v-model="repo" label="Repository to connect" :options="repos" />
                  <div class="mi:[justify-content:flex-end] mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
                    <MiButton :loading="connecting" @click="connectRepo">Connect {{ repo }}</MiButton>
                  </div>
                </div>

                <!-- Theme -->
                <div v-else-if="t.id === 'theme'" class="mi:grid mi:gap-3.5 mi:@[560px]:grid-cols-[minmax(0,_1fr)_200px] mi:@[560px]:items-start">
                  <div class="mi:grid mi:gap-3.5">
                    <MiSegmented v-model="appearance" label="Appearance" :options="appearances" />
                    <MiSwatch v-model="accent" label="Accent" :options="accents" />
                  </div>
                  <div class="mi:grid mi:grid-cols-[44px_minmax(0,_1fr)] mi:gap-2 mi:h-21 mi:p-2 mi:rounded-[12px] mi:[background:var(--bg)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] " :class="inversePreview ? 'mi:[--bg:var(--mi-label)] mi:[--fg:color-mix(in_srgb,_var(--mi-label)_86%,_var(--mi-page))] mi:[--ln:color-mix(in_srgb,_var(--mi-page)_22%,_transparent)]' : 'mi:[--bg:var(--mi-page)] mi:[--fg:var(--mi-card)] mi:[--ln:var(--mi-fill3)]'" :style="{ '--scl-accent': accent ?? 'var(--mi-p)' }" aria-hidden="true">
                    <span class="mi:grid mi:content-start mi:gap-1.5 mi:p-2 mi:rounded-[7px] mi:[background:var(--fg)]"><i class="mi:block mi:h-[5px] mi:rounded-[3px] mi:[background:var(--ln)] mi:[&:first-child]:[background:var(--scl-accent)]" /><i class="mi:block mi:h-[5px] mi:rounded-[3px] mi:[background:var(--ln)] mi:[&:first-child]:[background:var(--scl-accent)]" /><i class="mi:block mi:h-[5px] mi:rounded-[3px] mi:[background:var(--ln)] mi:[&:first-child]:[background:var(--scl-accent)]" /></span>
                    <span class="mi:grid mi:content-start mi:gap-1.5 mi:p-2 mi:rounded-[7px] mi:[background:var(--fg)]"><b class="mi:block mi:w-[46%] mi:h-[7px] mi:rounded-[3px] mi:[background:var(--ln)]" /><i class="mi:block mi:h-[5px] mi:rounded-[3px] mi:[background:var(--ln)] mi:[&:nth-of-type(2)]:w-[70%]" /><i class="mi:block mi:h-[5px] mi:rounded-[3px] mi:[background:var(--ln)] mi:[&:nth-of-type(2)]:w-[70%]" /><em class="mi:justify-self-start mi:w-13 mi:h-3.5 mi:mt-0.5 mi:rounded-[5px] mi:[background:var(--scl-accent)]" /></span>
                  </div>
                  <div class="mi:[justify-content:flex-end] mi:@[560px]:col-span-full mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
                    <MiButton @click="complete('theme')">Save theme</MiButton>
                  </div>
                </div>
              </div>
            </Transition>
          </li>
        </TransitionGroup>

        <div v-if="doneTasks.length" class="mi:grid mi:gap-1.5 mi:mt-1.5 mi:py-3 mi:px-4 mi:rounded-lg mi:[background:var(--mi-fill4)]">
          <MiText as="h4" variant="caption" weight="semibold" tone="label2" class="mi:m-0 mi:uppercase mi:tracking-[.06em]! mi:text-[11px]!">Completed</MiText>
          <TransitionGroup tag="ul" enter-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(-6px)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:absolute mi:left-0 mi:right-0" leave-to-class="mi:opacity-0 mi:transform-[translateY(10px)_scale(.98)]" move-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" class="mi:relative mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]">
            <li v-for="t in doneTasks" :key="t.id" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-2.5 mi:py-[5px] mi:px-0 mi:text-[14px]">
              <span class="mi:relative mi:grid mi:place-items-center mi:w-4.5 mi:h-4.5 mi:flex-[none] mi:rounded-[50%] mi:text-[color:var(--mi-p-on,_var(--mi-card))] mi:shadow-[inset_0_0_0_1.5px_var(--mi-fill)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[50%] mi:before:[background:var(--mi-p)] mi:before:opacity-100 mi:before:transform-[scale(1)] mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_420ms_var(--mi-spring)]" aria-hidden="true"><MiIcon name="check" :size="11" :weight="3" class="mi:relative mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)_80ms,_transform_460ms_var(--mi-spring)_80ms] mi:opacity-100 mi:[transform:none]" /></span>
              <span class="mi:text-label2">{{ t.title }}</span>
              <span class="mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[12px] mi:text-label3 mi:max-w-40">{{ t.doneNote }}</span>
            </li>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

interface Task { id: string, title: string, short: string, sub: string, mins: number, done: boolean, doneNote: string }

const tasks = ref<Task[]>([
  { id: 'workspace', title: 'Create the workspace', short: 'Workspace', sub: '', mins: 1, done: true, doneNote: 'oakridge.kiln.dev' },
  { id: 'verify', title: 'Verify your email', short: 'Verify email', sub: '', mins: 1, done: true, doneNote: 'Yesterday' },
  { id: 'invite', title: 'Invite your team', short: 'Invite your team', sub: 'Reviews go faster with two people on every deploy.', mins: 2, done: false, doneNote: '' },
  { id: 'repo', title: 'Connect a repository', short: 'Connect a repo', sub: 'Kiln builds a preview for every pull request.', mins: 3, done: false, doneNote: '' },
  { id: 'theme', title: 'Pick a theme', short: 'Pick a theme', sub: 'Appearance and accent for everyone in Oakridge Labs.', mins: 1, done: false, doneNote: '' }
])

const roles = [{ value: 'member', label: 'Member' }, { value: 'admin', label: 'Admin' }]
const repos = [
  { value: 'oakridge/web', label: 'oakridge/web', description: 'Next.js · pushed 2 hours ago' },
  { value: 'oakridge/api', label: 'oakridge/api', description: 'Go · pushed yesterday' },
  { value: 'oakridge/docs', label: 'oakridge/docs', description: 'Astro · pushed 6 days ago' }
]
const appearances = [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]
const accents = [
  { value: 'var(--mi-p)', name: 'Brand', color: 'var(--mi-p)' },
  { value: 'var(--mi-teal)', name: 'Teal', color: 'var(--mi-teal)' },
  { value: 'var(--mi-indigo)', name: 'Indigo', color: 'var(--mi-indigo)' },
  { value: 'var(--mi-orange)', name: 'Ember', color: 'var(--mi-orange)' },
  { value: 'var(--mi-pink)', name: 'Rose', color: 'var(--mi-pink)' }
]

const openId = ref<string | null>('invite')
const finishing = ref<string | null>(null)
const paused = ref(false)
const invites = ref<string[]>(['dana@oakridge.dev', 'theo@oakridge.dev'])
const inviteRole = ref<string | number | null>('member')
const inviteError = ref('')
const repo = ref<string | number | boolean | null>('oakridge/web')
const connecting = ref(false)
const appearance = ref<string | number | null>('dark')
const accent = ref<string | null>('var(--mi-p)')

const openTasks = computed(() => tasks.value.filter(t => !t.done))
const doneTasks = computed(() => tasks.value.filter(t => t.done))
const doneCount = computed(() => doneTasks.value.length)
const allDone = computed(() => !openTasks.value.length)
const pct = computed(() => Math.round(doneCount.value / tasks.value.length * 100))
const minutesLeft = computed(() => openTasks.value.reduce((n, t) => n + t.mins, 0))
const next = computed(() => openTasks.value.find(t => t.id !== openId.value) ?? openTasks.value[0])

// Preview the chosen appearance with tokens only: same as the current theme, or its inverse.
const { isDark } = useMiTheme()
const inversePreview = computed(() => appearance.value !== 'system' && (appearance.value === 'dark') !== isDark.value)

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

function toggle(id: string, forceOpen = false) {
  openId.value = forceOpen || openId.value !== id ? id : null
}
// The check draws first, then the row folds into the completed list.
function complete(id: string) {
  const t = tasks.value.find(x => x.id === id)
  if (!t || finishing.value) return
  finishing.value = id
  t.doneNote = id === 'invite'
    ? `${invites.value.length} ${invites.value.length === 1 ? 'invite' : 'invites'} sent`
    : id === 'repo' ? String(repo.value) : `${appearance.value === 'system' ? 'System' : appearance.value === 'dark' ? 'Dark' : 'Light'}, ${accents.find(a => a.value === accent.value)?.name ?? 'Brand'}`
  later(() => {
    t.done = true
    finishing.value = null
    const following = openTasks.value[0]
    openId.value = following ? following.id : null
  }, 620)
}
function connectRepo() {
  connecting.value = true
  // UI demo only: nothing is sent anywhere.
  later(() => { connecting.value = false; complete('repo') }, 800)
}
</script>
