<template>
  <section class="mi:@container mi:relative mi:grid mi:min-h-160 mi:rounded-xl mi:overflow-hidden mi:[background:var(--mi-page)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:font-mi mi:text-label" aria-labelledby="ddd-title">
    <!-- Deployments list behind; any row opens its details in the bottom drawer. -->
    <div class="mi:[grid-area:1_/_1] mi:grid mi:content-start mi:gap-3.5 mi:p-5" :inert="open || undefined">
      <div class="mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-3">
        <MiText id="ddd-title" variant="title3" as="h2" weight="semibold">Deployments</MiText>
        <MiText variant="footnote" tone="label2">storefront · production</MiText>
      </div>
      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-hidden">
        <li v-for="d in deploys" :key="d.id" class="mi:not-first:border-t mi:not-first:border-t-sep">
          <button type="button" class="mi:flex mi:items-center mi:gap-3 mi:w-full mi:py-3 mi:px-3.5 mi:[border:0] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="d.id === currentId ? 'mi:[background:var(--mi-fill4)]' : 'mi:[background:none]'" @click="show(d.id)">
            <span class="mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:rounded-[50%]" :class="[d.state === 'ready' ? 'mi:[background:var(--mi-green)]' : d.state === 'failed' ? 'mi:[background:var(--mi-red)]' : 'mi:[background:var(--mi-label3)]']" aria-hidden="true" />
            <span class="mi:grid mi:flex-1 mi:min-w-0 mi:text-[14px]">
              <b class="mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ d.message }}</b>
              <span class="mi:text-[12px] mi:text-label2">{{ d.sha }} · {{ d.author }} · {{ d.when }}</span>
            </span>
            <MiBadge v-if="d.live" tone="success" label="Live" />
            <MiText v-else variant="caption" tone="label2">{{ STATE_LABEL[d.state] }}</MiText>
          </button>
        </li>
      </ul>
    </div>

    <div class="mi:[grid-area:1_/_1] mi:[background:var(--mi-scrim)] mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" :class="open ? 'mi:opacity-100 mi:pointer-events-auto' : 'mi:opacity-0 mi:pointer-events-none'" aria-hidden="true" @click="open = false" />

    <div class="mi:[grid-area:1_/_1] mi:self-end mi:p-2.5 mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:@[640px]:justify-self-center mi:@[640px]:w-[min(680px,_100%)]" :class="!open ? 'mi:transform-[translateY(105%)]' : ''" :inert="!open || undefined">
      <MiDrawer :model-value="true" inline show-swipe-handle :title="cur.message" :description="cur.branch + ' · ' + cur.when">
        <div class="mi:grid mi:gap-4">
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-2.5">
            <MiAvatar :name="cur.author" size="sm" tone="auto" decorative />
            <MiText variant="footnote" tone="label2">{{ cur.author }} · {{ totalSec }}s build</MiText>
            <MiCopyButton :value="cur.sha" :label="cur.sha" copied-label="Commit copied" variant="outline" />
            <MiBadge :tone="STATE_TONE[cur.state]" :label="cur.live ? 'Live' : STATE_LABEL[cur.state]" dot />
          </div>

          <!-- Steps: bar length is the step's share of the slowest one. -->
          <ol class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Build steps">
            <li v-for="s in cur.steps" :key="s.name" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_52px] mi:items-center mi:gap-y-1 mi:gap-x-2.5 mi:text-[14px] mi:@[640px]:grid-cols-[auto_140px_minmax(0,_1fr)_60px]" :class="s.state === 'skipped' ? 'mi:text-label3' : ''">
              <MiIcon :name="s.state === 'failed' ? 'x-circle-fill' : s.state === 'skipped' ? 'dash' : 'check-circle-fill'" :size="16" :class="s.state === 'failed' ? 'mi:text-red' : s.state === 'skipped' ? 'mi:text-label3' : 'mi:text-green'" />
              <span >{{ s.name }}</span>
              <span class="mi:col-[2] mi:row-[2] mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden mi:@[640px]:col-[auto] mi:@[640px]:row-[auto]" aria-hidden="true"><i class="mi:block mi:h-full mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="s.state === 'failed' ? 'mi:[background:var(--mi-red)]' : 'mi:[background:var(--mi-p)]'" :style="{ transform: `scaleX(${s.sec / slowest})` }" /></span>
              <MiText variant="caption" tone="label2" tabular class="mi:text-end">{{ s.state === 'skipped' ? 'skipped' : s.sec + 's' }}</MiText>
            </li>
          </ol>

          <pre v-if="cur.error" class="mi:m-0 mi:py-3 mi:px-3.5 mi:rounded-md mi:[background:color-mix(in_srgb,_var(--mi-red)_8%,_var(--mi-fill4))] mi:text-label mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[12px] mi:leading-normal mi:whitespace-pre-wrap mi:wrap-anywhere" aria-label="Error output">{{ cur.error }}</pre>
        </div>

        <template #footer>
          <div class="mi:flex mi:flex-wrap mi:items-center mi:[justify-content:flex-end] mi:gap-2">
            <MiText v-if="note" variant="footnote" tone="green" role="status" class="mi:me-auto!">{{ note }}</MiText>
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
