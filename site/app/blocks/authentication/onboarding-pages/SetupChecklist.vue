<template>
  <section class="scl" aria-labelledby="scl-title">
    <div v-if="paused" class="scl__paused">
      <div class="scl__paused-card">
        <MiProgressRing :value="pct" :size="52" :stroke="5" label="Setup progress"><span class="scl__mini-count">{{ doneCount }}/{{ tasks.length }}</span></MiProgressRing>
        <div class="scl__paused-copy">
          <MiText id="scl-title" as="h2" variant="headline" weight="semibold">Setup paused</MiText>
          <MiText variant="footnote" tone="label2">
            <span class="scl__num">{{ doneCount }} of {{ tasks.length }}</span> done. Pick it up any time from the Help menu.
          </MiText>
        </div>
        <MiButton variant="tinted" @click="paused = false">Resume setup</MiButton>
      </div>
    </div>

    <div v-else class="scl__in">
      <!-- Summary: time left, not a percentage, is what people decide on. -->
      <div class="scl__summary">
        <div class="scl__ring">
          <MiProgressRing :value="pct" :size="128" :stroke="9" label="Setup progress">
            <span class="scl__ring-copy">
              <span class="scl__ring-big">{{ allDone ? 'Done' : minutesLeft + ' min' }}</span>
              <span class="scl__ring-sub">{{ allDone ? 'all set' : 'left' }}</span>
            </span>
          </MiProgressRing>
        </div>
        <div class="scl__intro">
          <MiText variant="caption" weight="semibold" tone="primary" class="scl__kicker">Oakridge Labs · first run</MiText>
          <MiText id="scl-title" as="h2" variant="title2" weight="bold" balance>
            {{ allDone ? 'Kiln is ready for your team' : 'Get Kiln ready for your team' }}
          </MiText>
          <MiText variant="subheadline" tone="label2">
            {{ allDone ? 'Your first preview deploy will start on the next push to main.' : 'A few short tasks. Each one runs right here, and all of it can change later in Settings.' }}
          </MiText>
        </div>
        <div class="scl__cta">
          <MiButton v-if="next" @click="toggle(next.id, true)">
            {{ next.id === openId ? 'Finish' : 'Next' }}: {{ next.short }}
            <template #trailing><MiIcon name="arrow-right" :size="15" /></template>
          </MiButton>
          <MiButton v-else>Open the dashboard</MiButton>
          <MiButton v-if="!allDone" variant="plain" @click="paused = true">Skip for now</MiButton>
        </div>
      </div>

      <div class="scl__list">
        <div class="scl__list-head">
          <MiText as="h3" variant="headline" weight="semibold">Setup checklist</MiText>
          <MiText as="span" variant="footnote" tone="label2" class="scl__num" aria-live="polite">{{ doneCount }} of {{ tasks.length }} done</MiText>
        </div>

        <TransitionGroup name="scl-row" tag="ol" class="scl__tasks">
          <li v-for="t in openTasks" :key="t.id" class="scl__task" :class="{ 'is-open': openId === t.id, 'is-finishing': finishing === t.id }">
            <button
              :id="'scl-h-' + t.id" type="button" class="scl__task-head" :aria-expanded="openId === t.id" :aria-controls="'scl-p-' + t.id"
              @click="toggle(t.id)"
            >
              <span class="scl__state" aria-hidden="true"><MiIcon name="check" :size="13" :weight="3" /></span>
              <span class="scl__task-copy">
                <span class="scl__task-title">{{ t.title }}</span>
                <span class="scl__task-sub">{{ t.sub }}</span>
              </span>
              <span class="scl__mins">{{ t.mins }} min</span>
              <MiIcon name="chevron-down" :size="16" class="scl__chev" />
            </button>

            <Transition name="scl-panel">
              <div v-if="openId === t.id" :id="'scl-p-' + t.id" class="scl__panel" role="region" :aria-labelledby="'scl-h-' + t.id">
                <!-- Invite -->
                <form v-if="t.id === 'invite'" class="scl__action" novalidate @submit.prevent="complete('invite')">
                  <MiField label="Teammates' emails" hint="Press Return or comma after each address." :error="inviteError">
                    <template #default="{ id, describedBy }">
                      <MiTagInput :id="id" v-model="invites" :aria-describedby="describedBy" placeholder="name@oakridge.dev" :validate="isEmail" @reject="inviteError = 'That does not look like an email address.'" @add="inviteError = ''" />
                    </template>
                  </MiField>
                  <div class="scl__row">
                    <MiSegmented v-model="inviteRole" label="Role for invitees" :options="roles" />
                    <MiButton type="submit" :disabled="!invites.length">Send {{ invites.length || '' }} {{ invites.length === 1 ? 'invite' : 'invites' }}</MiButton>
                  </div>
                </form>

                <!-- Repository -->
                <div v-else-if="t.id === 'repo'" class="scl__action">
                  <MiRadioGroup v-model="repo" label="Repository to connect" :options="repos" />
                  <div class="scl__row scl__row--end">
                    <MiButton :loading="connecting" @click="connectRepo">Connect {{ repo }}</MiButton>
                  </div>
                </div>

                <!-- Theme -->
                <div v-else-if="t.id === 'theme'" class="scl__action scl__theme">
                  <div class="scl__theme-controls">
                    <MiSegmented v-model="appearance" label="Appearance" :options="appearances" />
                    <MiSwatch v-model="accent" label="Accent" :options="accents" />
                  </div>
                  <div class="scl__mini" :class="{ 'is-inverse': inversePreview }" :style="{ '--scl-accent': accent ?? 'var(--mi-p)' }" aria-hidden="true">
                    <span class="scl__mini-side"><i /><i /><i /></span>
                    <span class="scl__mini-main"><b /><i /><i /><em /></span>
                  </div>
                  <div class="scl__row scl__row--end">
                    <MiButton @click="complete('theme')">Save theme</MiButton>
                  </div>
                </div>
              </div>
            </Transition>
          </li>
        </TransitionGroup>

        <div v-if="doneTasks.length" class="scl__done">
          <MiText as="h4" variant="caption" weight="semibold" tone="label2" class="scl__done-title">Completed</MiText>
          <TransitionGroup name="scl-row" tag="ul" class="scl__done-list">
            <li v-for="t in doneTasks" :key="t.id" class="scl__done-row">
              <span class="scl__state is-done" aria-hidden="true"><MiIcon name="check" :size="11" :weight="3" /></span>
              <span class="scl__done-name">{{ t.title }}</span>
              <span class="scl__done-note">{{ t.doneNote }}</span>
            </li>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

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
  setTimeout(() => {
    t.done = true
    finishing.value = null
    const following = openTasks.value[0]
    openId.value = following ? following.id : null
  }, 620)
}
function connectRepo() {
  connecting.value = true
  // UI demo only: nothing is sent anywhere.
  setTimeout(() => { connecting.value = false; complete('repo') }, 800)
}
</script>

<style scoped>
.scl { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.scl__in { display: grid; gap: 24px; }
.scl__num { font-variant-numeric: tabular-nums; }

/* Summary */
.scl__summary {
  position: relative; display: grid; gap: 18px; align-content: start; padding: 22px; overflow: hidden; isolation: isolate;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh1);
}
.scl__summary::before {
  content: ""; position: absolute; inset: -30% -20% auto auto; width: 80%; aspect-ratio: 1; z-index: -1; border-radius: 50%;
  background: radial-gradient(closest-side, var(--mi-p-tint), transparent);
}
.scl__ring { display: flex; }
.scl__ring-copy { display: grid; justify-items: center; line-height: 1; }
.scl__ring-big { font-size: 22px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.scl__ring-sub { margin-top: 4px; font-size: 11px; font-weight: 500; color: var(--mi-label2); }
.scl__intro { display: grid; gap: 6px; }
.scl__kicker { letter-spacing: .02em; }
.scl__cta { display: flex; flex-wrap: wrap; gap: 8px; }

/* Task list */
.scl__list { display: grid; align-content: start; gap: 12px; }
.scl__list-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 4px; }
.scl__tasks { position: relative; display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.scl__task { border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); }
.scl__task.is-open { box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2); }
.scl__task-head {
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 12px; width: 100%; padding: 14px 16px;
  border: 0; border-radius: inherit; text-align: start; cursor: pointer; font: inherit; color: inherit; background: none;
}
.scl__task-head:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.scl__task-copy { display: grid; gap: 2px; min-width: 0; }
.scl__task-title { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.scl__task-sub { font-size: 13px; line-height: 1.35; color: var(--mi-label2); }
.scl__mins { padding: 3px 8px; border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--mi-label2); background: var(--mi-fill4); font-variant-numeric: tabular-nums; white-space: nowrap; }
.scl__chev { color: var(--mi-label3); transition: transform var(--mi-dur-3) var(--mi-spring); }
.scl__task.is-open .scl__chev { transform: rotate(180deg); }

/* Status circle: an empty dashed ring that fills and draws its check when finished. */
.scl__state {
  position: relative; display: grid; place-items: center; width: 22px; height: 22px; flex: none; border-radius: 50%;
  color: var(--mi-p-on, var(--mi-card)); box-shadow: inset 0 0 0 1.5px var(--mi-fill);
}
.scl__state::before { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--mi-p); opacity: 0; transform: scale(.3); transition: opacity var(--mi-dur-2) var(--mi-ease), transform 420ms var(--mi-spring); }
.scl__state :deep(svg) { position: relative; opacity: 0; transform: scale(.4) rotate(-20deg); transition: opacity var(--mi-dur-2) var(--mi-ease) 80ms, transform 460ms var(--mi-spring) 80ms; }
.scl__task.is-finishing .scl__state::before, .scl__state.is-done::before { opacity: 1; transform: scale(1); }
.scl__task.is-finishing .scl__state :deep(svg), .scl__state.is-done :deep(svg) { opacity: 1; transform: none; }
.scl__task.is-finishing .scl__task-title { color: var(--mi-label2); }

.scl__panel { padding: 2px 16px 18px 50px; }
.scl__action { display: grid; gap: 14px; }
.scl__row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.scl__row--end { justify-content: flex-end; }
.scl__theme-controls { display: grid; gap: 14px; }

/* Theme preview tile */
.scl__mini {
  --bg: var(--mi-page); --fg: var(--mi-card); --ln: var(--mi-fill3);
  display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 8px; height: 84px; padding: 8px; border-radius: 12px;
  background: var(--bg); box-shadow: inset 0 0 0 1px var(--mi-sep);
}
/* The opposite appearance is built from the current one: label becomes the surface. */
.scl__mini.is-inverse { --bg: var(--mi-label); --fg: color-mix(in srgb, var(--mi-label) 86%, var(--mi-page)); --ln: color-mix(in srgb, var(--mi-page) 22%, transparent); }
.scl__mini-side, .scl__mini-main { display: grid; align-content: start; gap: 6px; padding: 8px; border-radius: 7px; background: var(--fg); }
.scl__mini i { display: block; height: 5px; border-radius: 3px; background: var(--ln); }
.scl__mini-side i:first-child { background: var(--scl-accent); }
.scl__mini b { display: block; width: 46%; height: 7px; border-radius: 3px; background: var(--ln); }
.scl__mini-main i:nth-of-type(2) { width: 70%; }
.scl__mini em { justify-self: start; width: 52px; height: 14px; margin-top: 2px; border-radius: 5px; background: var(--scl-accent); }

/* Completed group */
.scl__done { display: grid; gap: 6px; margin-top: 6px; padding: 12px 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.scl__done-title { margin: 0; text-transform: uppercase; letter-spacing: .06em; font-size: 11px; }
.scl__done-list { position: relative; display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
.scl__done-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 5px 0; font-size: 14px; }
.scl__done-row .scl__state { width: 18px; height: 18px; }
.scl__done-name { color: var(--mi-label2); }
.scl__done-note { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: var(--mi-label3); max-width: 160px; }

/* Paused */
.scl__paused { display: grid; place-items: center; min-height: 100%; padding: 24px 0; }
.scl__paused-card {
  display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 14px 16px; width: 100%; max-width: 520px; padding: 18px 20px;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2);
}
.scl__paused-card > :last-child { grid-column: 1 / -1; justify-self: start; }
.scl__paused-copy { display: grid; gap: 2px; }
.scl__mini-count { font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }

/* Motion */
.scl-panel-enter-active, .scl-panel-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-ease); }
.scl-panel-enter-from, .scl-panel-leave-to { opacity: 0; transform: translateY(-6px); }
.scl-row-enter-active, .scl-row-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.scl-row-enter-from { opacity: 0; transform: translateY(-6px); }
.scl-row-leave-to { opacity: 0; transform: translateY(10px) scale(.98); }
.scl-row-leave-active { position: absolute; left: 0; right: 0; }
.scl-row-move { transition: transform var(--mi-dur-3) var(--mi-spring); }

@container (max-width: 459px) {
  .scl__mins { display: none; }
  .scl__panel { padding-left: 16px; }
}
@container (min-width: 560px) {
  .scl__summary { grid-template-columns: auto minmax(0, 1fr); align-items: center; column-gap: 24px; padding: 24px 28px; }
  .scl__cta { grid-column: 1 / -1; }
  .scl__theme { grid-template-columns: minmax(0, 1fr) 200px; align-items: start; }
  .scl__theme .scl__row--end { grid-column: 1 / -1; }
  .scl__paused-card { grid-template-columns: auto minmax(0, 1fr) auto; }
  .scl__paused-card > :last-child { grid-column: auto; }
}
@container (min-width: 900px) {
  .scl__in { grid-template-columns: 300px minmax(0, 1fr); gap: 32px; align-items: start; }
  .scl__summary { grid-template-columns: minmax(0, 1fr); padding: 28px; gap: 22px; }
  .scl__cta { display: grid; justify-items: start; }
}
@container (min-width: 1100px) { .scl__in { grid-template-columns: 340px minmax(0, 1fr); gap: 48px; } }
</style>
