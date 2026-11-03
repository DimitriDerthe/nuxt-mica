<template>
  <section class="ddd" aria-labelledby="ddd-title">
    <!-- Deployments list behind; any row opens its details in the bottom drawer. -->
    <div class="ddd__page" :inert="open || undefined">
      <div class="ddd__page-head">
        <MiText id="ddd-title" variant="title3" as="h2" weight="semibold">Deployments</MiText>
        <MiText variant="footnote" tone="label2">storefront · production</MiText>
      </div>
      <ul class="ddd__list">
        <li v-for="d in deploys" :key="d.id">
          <button type="button" class="ddd__row" :class="{ 'is-on': d.id === currentId }" @click="show(d.id)">
            <span class="ddd__state" :class="'is-' + d.state" aria-hidden="true" />
            <span class="ddd__row-text">
              <b>{{ d.message }}</b>
              <span>{{ d.sha }} · {{ d.author }} · {{ d.when }}</span>
            </span>
            <MiBadge v-if="d.live" tone="success" label="Live" />
            <MiText v-else variant="caption" tone="label2">{{ STATE_LABEL[d.state] }}</MiText>
          </button>
        </li>
      </ul>
    </div>

    <div class="ddd__scrim" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

    <div class="ddd__drawer" :class="{ 'is-closed': !open }" :inert="!open || undefined">
      <MiDrawer :model-value="true" inline show-swipe-handle :title="cur.message" :description="cur.branch + ' · ' + cur.when">
        <div class="ddd__body">
          <div class="ddd__meta">
            <MiAvatar :name="cur.author" size="sm" tone="auto" decorative />
            <MiText variant="footnote" tone="label2">{{ cur.author }} · {{ totalSec }}s build</MiText>
            <MiCopyButton :value="cur.sha" :label="cur.sha" copied-label="Commit copied" variant="outline" />
            <MiBadge :tone="STATE_TONE[cur.state]" :label="cur.live ? 'Live' : STATE_LABEL[cur.state]" dot />
          </div>

          <!-- Steps: bar length is the step's share of the slowest one. -->
          <ol class="ddd__steps" aria-label="Build steps">
            <li v-for="s in cur.steps" :key="s.name" class="ddd__step" :class="'is-' + s.state">
              <MiIcon :name="s.state === 'failed' ? 'x-circle-fill' : s.state === 'skipped' ? 'dash' : 'check-circle-fill'" :size="16" class="ddd__icon" />
              <span class="ddd__step-name">{{ s.name }}</span>
              <span class="ddd__dur" aria-hidden="true"><i :style="{ transform: `scaleX(${s.sec / slowest})` }" /></span>
              <MiText variant="caption" tone="label2" tabular class="ddd__sec">{{ s.state === 'skipped' ? 'skipped' : s.sec + 's' }}</MiText>
            </li>
          </ol>

          <pre v-if="cur.error" class="ddd__log" aria-label="Error output">{{ cur.error }}</pre>
        </div>

        <template #footer>
          <div class="ddd__foot">
            <MiText v-if="note" variant="footnote" tone="green" role="status">{{ note }}</MiText>
            <MiButton variant="gray" size="small" @click="open = false">Close</MiButton>
            <MiButton v-if="cur.state === 'failed'" size="small" @click="redeploy">Retry build</MiButton>
            <!-- Rollback asks twice: the first click arms it, the second confirms. -->
            <MiButton
              v-else-if="!cur.live" :variant="armed ? 'destructive' : 'tinted'" size="small"
              @click="armed ? rollback() : (armed = true)"
            >{{ armed ? 'Confirm rollback to ' + cur.sha : 'Roll back to this' }}</MiButton>
          </div>
        </template>
      </MiDrawer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type State = 'ready' | 'failed' | 'superseded'
interface Step { name: string, sec: number, state: 'ok' | 'failed' | 'skipped' }
interface Deploy { id: number, message: string, sha: string, author: string, branch: string, when: string, state: State, live: boolean, steps: Step[], error?: string }

const STATE_LABEL: Record<State, string> = { ready: 'Ready', failed: 'Failed', superseded: 'Previous' }
const STATE_TONE: Record<State, 'success' | 'danger' | 'neutral'> = { ready: 'success', failed: 'danger', superseded: 'neutral' }

const ok = (name: string, sec: number): Step => ({ name, sec, state: 'ok' })
const deploys = ref<Deploy[]>([
  {
    id: 3, message: 'Add Apple Pay to checkout', sha: '9c41e7a', author: 'Freya Lindholm', branch: 'main', when: '12 min ago', state: 'failed', live: false,
    steps: [ok('Install', 18), ok('Lint and types', 24), { name: 'Unit tests', sec: 41, state: 'failed' }, { name: 'Build', sec: 0, state: 'skipped' }, { name: 'Upload to edge', sec: 0, state: 'skipped' }],
    error: 'FAIL  checkout/applePay.spec.ts\n  ✕ falls back to card when session is cancelled (212 ms)\n  Expected: "card"\n  Received: undefined'
  },
  { id: 2, message: 'Fix currency rounding on invoices', sha: '51b0d2c', author: 'Omar Benali', branch: 'main', when: '2 h ago', state: 'ready', live: true, steps: [ok('Install', 17), ok('Lint and types', 22), ok('Unit tests', 38), ok('Build', 64), ok('Upload to edge', 9)] },
  { id: 1, message: 'Lazy-load product reviews', sha: 'e83fa19', author: 'Freya Lindholm', branch: 'main', when: 'Yesterday', state: 'superseded', live: false, steps: [ok('Install', 19), ok('Lint and types', 23), ok('Unit tests', 36), ok('Build', 61), ok('Upload to edge', 8)] }
])

const open = ref(true)
const currentId = ref(3)
const armed = ref(false)
const note = ref('')

const cur = computed(() => deploys.value.find(d => d.id === currentId.value) ?? deploys.value[0]!)
const slowest = computed(() => Math.max(1, ...cur.value.steps.map(s => s.sec)))
const totalSec = computed(() => cur.value.steps.reduce((n, s) => n + s.sec, 0))

function show(id: number) {
  currentId.value = id
  armed.value = false
  note.value = ''
  open.value = true
}
function redeploy() {
  const d = cur.value
  d.steps = d.steps.map(s => ok(s.name, s.sec || 30))
  d.state = 'ready'
  d.error = undefined
  note.value = 'Build passed on retry'
}
function rollback() {
  for (const d of deploys.value) d.live = d.id === currentId.value
  armed.value = false
  note.value = cur.value.sha + ' is live again'
}
</script>

<style scoped>
.ddd { container-type: inline-size; position: relative; display: grid; min-height: 640px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); font-family: var(--mi-font); color: var(--mi-label); }
.ddd__page, .ddd__scrim, .ddd__drawer { grid-area: 1 / 1; }
.ddd__page { display: grid; align-content: start; gap: 14px; padding: 20px; }
.ddd__page-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 12px; }
.ddd__list { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.ddd__list li + li { border-top: 1px solid var(--mi-sep); }
.ddd__row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 14px; border: 0; background: none; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.ddd__row:hover, .ddd__row.is-on { background: var(--mi-fill4); }
.ddd__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.ddd__state { flex: none; width: 10px; height: 10px; border-radius: 50%; background: var(--mi-label3); }
.ddd__state.is-ready { background: var(--mi-green); }
.ddd__state.is-failed { background: var(--mi-red); }
.ddd__row-text { display: grid; flex: 1; min-width: 0; font-size: 14px; }
.ddd__row-text b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ddd__row-text span { font-size: 12px; color: var(--mi-label2); }

.ddd__scrim { background: var(--mi-scrim); opacity: 0; pointer-events: none; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.ddd__scrim.is-on { opacity: 1; pointer-events: auto; }
.ddd__drawer { align-self: end; padding: 10px; transition: transform var(--mi-dur-4) var(--mi-spring); }
.ddd__drawer.is-closed { transform: translateY(105%); }

.ddd__body { display: grid; gap: 16px; }
.ddd__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; }
.ddd__steps { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.ddd__step { display: grid; grid-template-columns: auto minmax(0, 1fr) 52px; align-items: center; gap: 4px 10px; font-size: 14px; }
.ddd__icon { color: var(--mi-green); }
.ddd__step.is-failed .ddd__icon { color: var(--mi-red); }
.ddd__step.is-skipped { color: var(--mi-label3); }
.ddd__step.is-skipped .ddd__icon { color: var(--mi-label3); }
.ddd__dur { grid-column: 2; grid-row: 2; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.ddd__dur i { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.ddd__step.is-failed .ddd__dur i { background: var(--mi-red); }
.ddd__sec { text-align: end; }
.ddd__log { margin: 0; padding: 12px 14px; border-radius: var(--mi-radius-m); background: color-mix(in srgb, var(--mi-red) 8%, var(--mi-fill4)); color: var(--mi-label); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
.ddd__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 8px; }
.ddd__foot > :first-child:not(button) { margin-inline-end: auto; }

@container (min-width: 640px) {
  .ddd__drawer { justify-self: center; width: min(680px, 100%); }
  .ddd__step { grid-template-columns: auto 140px minmax(0, 1fr) 60px; }
  .ddd__dur { grid-column: auto; grid-row: auto; }
}
</style>
