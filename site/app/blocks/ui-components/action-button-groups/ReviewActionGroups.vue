<template>
  <div class="rv-cq">
    <section class="rv" aria-labelledby="rv-title">
      <header class="rv__head">
        <div class="rv__title">
          <MiText variant="caption" tone="label2" weight="medium">Pull request #1482 · relay-service</MiText>
          <MiText id="rv-title" variant="title3" as="h2" weight="semibold" balance>Retry inbound webhooks with jittered backoff</MiText>
        </div>
        <div class="rv__who">
          <MiAvatar name="Amara Okafor" size="xs" tone="auto" decorative />
          <MiText variant="footnote" tone="label2"><strong>Amara Okafor</strong> wants to merge 3 commits into <code>main</code></MiText>
        </div>
      </header>

      <!-- Toolbar of three groups: a pager, a view switch and per-file actions. -->
      <div class="rv__bar">
        <div class="rv__pager">
          <MiButtonGroup label="Changed files">
            <MiIconButton size="toolbar" variant="gray" label="Previous file" :disabled="index === 0" @click="index--">
              <MiIcon name="chevron-left" />
            </MiIconButton>
            <MiIconButton size="toolbar" variant="gray" label="Next file" :disabled="index === files.length - 1" @click="index++">
              <MiIcon name="chevron-right" />
            </MiIconButton>
          </MiButtonGroup>
          <div class="rv__file">
            <MiText variant="caption2" tone="label3" weight="semibold" tabular>FILE {{ index + 1 }} OF {{ files.length }}</MiText>
            <span class="rv__path">{{ file.path }}</span>
          </div>
        </div>

        <div class="rv__tools">
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

      <div class="rv__diff" :class="'rv__diff--' + layout" role="group" :aria-label="'Diff of ' + file.path">
        <div v-for="side in sides" :key="side.key" class="rv__col">
          <div
            v-for="(l, i) in side.lines" :key="side.key + i" class="rv__line"
            :class="{ 'is-add': l.t === '+', 'is-del': l.t === '-' }"
          >
            <span class="rv__ln">{{ l.n }}</span><span class="rv__sign">{{ l.t === ' ' ? '' : l.t }}</span><span class="rv__code">{{ l.text }}</span>
          </div>
        </div>
      </div>

      <footer class="rv__foot">
        <div class="rv__verdict">
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

        <div class="rv__merge">
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
.rv-cq { container-type: inline-size; }
.rv {
  display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl);
  font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.rv__head { display: grid; gap: 10px; }
.rv__title { display: grid; gap: 2px; }
.rv__who { display: flex; align-items: center; gap: 8px; }
.rv__who code { padding: 1px 5px; border-radius: 5px; font: 500 12px ui-monospace, "SF Mono", Menlo, monospace; background: var(--mi-fill3); }

.rv__bar { display: grid; gap: 10px; padding: 10px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.rv__pager { display: flex; align-items: center; gap: 10px; min-width: 0; }
.rv__file { display: grid; min-width: 0; }
.rv__path { overflow: hidden; font: 500 13px/1.3 ui-monospace, "SF Mono", Menlo, monospace; white-space: nowrap; text-overflow: ellipsis; }
.rv__tools { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }

.rv__diff {
  display: grid; overflow: hidden; border-radius: var(--mi-radius-m); box-shadow: 0 0 0 1px var(--mi-sep);
  font: 12.5px/1.65 ui-monospace, "SF Mono", Menlo, monospace;
}
.rv__col { min-width: 0; overflow-x: auto; padding: 6px 0; }
.rv__diff--split .rv__col + .rv__col { border-top: 1px solid var(--mi-sep); }
.rv__line { display: grid; grid-template-columns: 40px 16px max-content; padding-right: 12px; }
.rv__ln { padding-right: 8px; text-align: right; color: var(--mi-label3); user-select: none; }
.rv__sign { text-align: center; color: var(--mi-label3); }
.rv__code { white-space: pre; }
.rv__line.is-add { background: color-mix(in srgb, var(--mi-green) 12%, transparent); }
.rv__line.is-add .rv__sign { color: var(--mi-green-t); }
.rv__line.is-del { background: color-mix(in srgb, var(--mi-red) 11%, transparent); }
.rv__line.is-del .rv__sign { color: var(--mi-red-t); }

.rv__foot { display: grid; gap: 14px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.rv__verdict, .rv__merge { display: grid; gap: 6px; justify-items: start; }

@container (min-width: 620px) {
  .rv { padding: 24px; }
  .rv__head { grid-template-columns: minmax(0, 1fr) auto; align-items: end; }
  .rv__bar { grid-template-columns: minmax(0, 1fr) auto; align-items: center; }
  .rv__diff--split { grid-template-columns: 1fr 1fr; }
  .rv__diff--split .rv__col + .rv__col { border-top: 0; border-left: 1px solid var(--mi-sep); }
  .rv__foot { grid-template-columns: auto auto; justify-content: space-between; align-items: end; }
  .rv__merge { justify-items: end; }
}
</style>
