<template>
  <div class="rv-cq mi:@container">
    <section class="rv mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:font-mi mi:text-label mi:bg-card mi:shadow-1 mi:@[620px]:p-6" aria-labelledby="rv-title">
      <header class="rv__head mi:grid mi:gap-2.5 mi:@[620px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[620px]:items-end">
        <div class="rv__title mi:grid mi:gap-0.5">
          <MiText variant="caption" tone="label2" weight="medium">Pull request #1482 · relay-service</MiText>
          <MiText id="rv-title" variant="title3" as="h2" weight="semibold" balance>Retry inbound webhooks with jittered backoff</MiText>
        </div>
        <div class="rv__who mi:flex mi:items-center mi:gap-2">
          <MiAvatar class="mi:[.rv__who_code&]:py-px mi:[.rv__who_code&]:px-[5px]" name="Amara Okafor" size="xs" tone="auto" decorative />
          <MiText class="mi:[.rv__who_code&]:py-px mi:[.rv__who_code&]:px-[5px]" variant="footnote" tone="label2"><strong>Amara Okafor</strong> wants to merge 3 commits into <code class="mi:[.rv__who_code&]:py-px mi:[.rv__who_code&]:px-[5px]">main</code></MiText>
        </div>
      </header>

      <!-- Toolbar of three groups: a pager, a view switch and per-file actions. -->
      <div class="rv__bar mi:grid mi:gap-2.5 mi:p-2.5 mi:rounded-lg mi:bg-fill4 mi:@[620px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[620px]:items-center">
        <div class="rv__pager mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
          <MiButtonGroup label="Changed files">
            <MiIconButton size="toolbar" variant="gray" label="Previous file" :disabled="index === 0" @click="index--">
              <MiIcon name="chevron-left" />
            </MiIconButton>
            <MiIconButton size="toolbar" variant="gray" label="Next file" :disabled="index === files.length - 1" @click="index++">
              <MiIcon name="chevron-right" />
            </MiIconButton>
          </MiButtonGroup>
          <div class="rv__file mi:grid mi:min-w-0">
            <MiText variant="caption2" tone="label3" weight="semibold" tabular>FILE {{ index + 1 }} OF {{ files.length }}</MiText>
            <span class="rv__path mi:overflow-hidden mi:[font:500_13px/1.3_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:whitespace-nowrap mi:text-ellipsis">{{ file.path }}</span>
          </div>
        </div>

        <div class="rv__tools mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
          <MiButtonGroup v-model="layout" variant="segmented" label="Diff layout" :options="layouts" />
          <MiButtonGroup label="File actions">
            <MiIconButton size="toolbar" variant="gray" :label="viewed.has(file.path) ? 'Mark as not viewed' : 'Mark as viewed'" :pressed="viewed.has(file.path)" @click="toggleViewed">
              <MiIcon name="eye" />
            </MiIconButton>
            <MiIconButton size="toolbar" variant="gray" label="Add a comment on this file">
              <MiIcon name="chat" />
            </MiIconButton>
            <MiIconButton size="toolbar" variant="gray" label="Open in editor">
              <MiIcon :svg="icons.code" />
            </MiIconButton>
          </MiButtonGroup>
        </div>
      </div>

      <div class="rv__diff mi:grid mi:overflow-hidden mi:rounded-md mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:[font:12.5px/1.65_ui-monospace,_'SF_Mono',_Menlo,_monospace]" :class="'rv__diff--' + layout" role="group" :aria-label="'Diff of ' + file.path">
        <div v-for="side in sides" :key="side.key" class="rv__col mi:min-w-0 mi:overflow-x-auto mi:py-1.5 mi:px-0 mi:[.rv__diff--split_.rv__col+&]:border-t mi:[.rv__diff--split_.rv__col+&]:border-t-sep mi:@[620px]:[.rv__diff--split_.rv__col+&]:[border-top:0] mi:@[620px]:[.rv__diff--split_.rv__col+&]:border-l mi:@[620px]:[.rv__diff--split_.rv__col+&]:border-l-sep">
          <div
            v-for="(l, i) in side.lines" :key="side.key + i" class="rv__line mi:grid mi:grid-cols-[40px_16px_max-content] mi:pr-3 mi:[&.is-add]:[background:color-mix(in_srgb,_var(--mi-green)_12%,_transparent)] mi:[&.is-del]:[background:color-mix(in_srgb,_var(--mi-red)_11%,_transparent)]"
            :class="{ 'is-add': l.t === '+', 'is-del': l.t === '-' }"
          >
            <span class="rv__ln mi:pr-2 mi:text-right mi:text-label3 mi:select-none">{{ l.n }}</span><span class="rv__sign mi:text-center mi:text-label3 mi:[.rv__line.is-add_&]:text-green-t mi:[.rv__line.is-del_&]:text-red-t">{{ l.t === ' ' ? '' : l.t }}</span><span class="rv__code mi:whitespace-pre">{{ l.text }}</span>
          </div>
        </div>
      </div>

      <footer class="rv__foot mi:grid mi:gap-3.5 mi:pt-3.5 mi:border-t mi:border-t-sep mi:@[620px]:grid-cols-[auto_auto] mi:@[620px]:justify-between mi:@[620px]:items-end">
        <div class="rv__verdict mi:grid mi:gap-1.5 mi:justify-items-start">
          <MiText variant="footnote" tone="label2" weight="medium" id="rv-verdict">Your review</MiText>
          <MiButtonGroup label="Review verdict" aria-describedby="rv-verdict">
            <MiButton
              v-for="v in verdicts" :key="v.value" size="small" :variant="verdict === v.value ? 'tinted' : 'gray'"
              :pressed="verdict === v.value" @click="verdict = v.value"
            >
              {{ v.label }}
            </MiButton>
          </MiButtonGroup>
        </div>

        <div class="rv__merge mi:grid mi:gap-1.5 mi:justify-items-start mi:@[620px]:justify-items-end">
          <MiText variant="caption" :tone="verdict === 'approve' ? 'green' : 'label3'" weight="medium">
            {{ merged ? 'Merged into main' : verdict === 'approve' ? '2 of 2 approvals · checks passing' : 'Needs your approval' }}
          </MiText>
          <MiButtonGroup variant="split" label="Merge pull request">
            <MiButton :disabled="verdict !== 'approve' || merged" @click="merged = true">
              {{ merged ? 'Merged' : strategyLabel }}
            </MiButton>
            <MiMenu v-model="strategy" variant="popup" :items="strategies" aria-label="Merge strategy" placement="top-end" :disabled="merged">
              <template #trigger="{ props }">
                <MiButton v-bind="props" :disabled="merged" aria-label="Choose merge strategy">
                  <MiIcon name="chevron-down" :size="16" />
                </MiButton>
              </template>
            </MiMenu>
          </MiButtonGroup>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Line = { t: ' ' | '+' | '-', o?: number, n?: number, text: string }

const icons = { code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>' }

const files: { path: string, lines: Line[] }[] = [
  {
    path: 'src/webhooks/retry.ts',
    lines: [
      { t: ' ', o: 41, n: 41, text: 'export function nextDelay(attempt: number) {' },
      { t: '-', o: 42, text: '  return 1000 * 2 ** attempt' },
      { t: '+', n: 42, text: '  const base = Math.min(1000 * 2 ** attempt, MAX_DELAY)' },
      { t: '+', n: 43, text: '  return base / 2 + Math.random() * base / 2' },
      { t: ' ', o: 43, n: 44, text: '}' }
    ]
  },
  {
    path: 'src/webhooks/config.ts',
    lines: [
      { t: ' ', o: 7, n: 7, text: 'export const MAX_ATTEMPTS = 8' },
      { t: '+', n: 8, text: 'export const MAX_DELAY = 5 * 60 * 1000' },
      { t: ' ', o: 8, n: 9, text: 'export const QUEUE = "inbound-webhooks"' }
    ]
  },
  {
    path: 'test/retry.spec.ts',
    lines: [
      { t: ' ', o: 12, n: 12, text: "it('caps the delay', () => {" },
      { t: '-', o: 13, text: '  expect(nextDelay(3)).toBe(8000)' },
      { t: '+', n: 13, text: '  expect(nextDelay(20)).toBeLessThanOrEqual(MAX_DELAY)' },
      { t: ' ', o: 14, n: 14, text: '})' }
    ]
  }
]

const layouts = [{ value: 'unified', label: 'Unified' }, { value: 'split', label: 'Split' }]
const verdicts = [
  { value: 'comment', label: 'Comment' },
  { value: 'approve', label: 'Approve' },
  { value: 'changes', label: 'Request changes' }
] as const
const strategies = [
  { value: 'squash', label: 'Squash and merge' },
  { value: 'merge', label: 'Create a merge commit' },
  { value: 'rebase', label: 'Rebase and merge' }
]

const index = ref(0)
const layout = ref<string | number | undefined>('unified')
const verdict = ref<typeof verdicts[number]['value']>('comment')
const strategy = ref<string | number | undefined>('squash')
const merged = ref(false)
const viewed = reactive(new Set<string>())

const file = computed(() => files[index.value]!)
const strategyLabel = computed(() => strategies.find(s => s.value === strategy.value)?.label ?? 'Merge')

// Unified shows every line once; split puts removals on the left and additions on the right.
const sides = computed(() => {
  const lines = file.value.lines
  if (layout.value !== 'split') return [{ key: 'u', lines: lines.map(l => ({ ...l, n: l.n ?? l.o })) }]
  return [
    { key: 'old', lines: lines.filter(l => l.t !== '+').map(l => ({ ...l, n: l.o })) },
    { key: 'new', lines: lines.filter(l => l.t !== '-') }
  ]
})

function toggleViewed() {
  const p = file.value.path
  if (viewed.has(p)) viewed.delete(p)
  else viewed.add(p)
}
</script>

<style scoped>
.rv__who code { border-radius: 5px; font: 500 12px ui-monospace, "SF Mono", Menlo, monospace; background: var(--mi-fill3); }

@container (min-width: 620px) {
  .rv__diff--split { grid-template-columns: 1fr 1fr; }
}
</style>
