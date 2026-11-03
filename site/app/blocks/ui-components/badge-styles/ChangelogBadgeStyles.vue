<template>
  <div class="cl-cq mi:@container">
    <section class="cl mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:font-mi mi:text-label mi:bg-card mi:shadow-1 mi:@[600px]:py-6 mi:@[600px]:px-7" aria-labelledby="cl-title">
      <header class="cl__head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
        <div>
          <MiText id="cl-title" variant="title3" as="h2" weight="semibold">What's new in Fieldnote</MiText>
          <MiText variant="footnote" tone="label2">Releases for the inspection app, newest first</MiText>
        </div>
        <MiButton variant="plain" size="small" :disabled="!unread.size" @click="unread.clear()">
          Mark all as read
        </MiButton>
      </header>

      <!-- Filters carry count badges; the strip scrolls on its own when narrow. -->
      <div class="cl__filters mi:flex mi:gap-1.5 mi:-mx-5 mi:pt-0.5 mi:px-5 mi:pb-1.5 mi:overflow-x-auto mi:[scrollbar-width:none] mi:[mask-image:linear-gradient(90deg,_transparent,_black_20px,_black_calc(100%_-_20px),_transparent)] mi:@[600px]:mx-0 mi:@[600px]:px-0 mi:@[600px]:[mask-image:none] mi:@[600px]:flex-wrap mi:@[600px]:overflow-visible" role="group" aria-label="Filter by type">
        <button
          v-for="f in filters" :key="f.id" type="button" class="cl__filter mi:inline-flex mi:flex-[none] mi:items-center mi:gap-2 mi:h-8 mi:pt-0 mi:pr-1.5 mi:pb-0 mi:pl-3 mi:[border:0] mi:rounded-[999px] mi:text-label2 mi:bg-fill4 mi:cursor-pointer mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:aria-pressed:text-label mi:aria-pressed:bg-card mi:aria-pressed:shadow-[inset_0_0_0_1.5px_var(--mi-p)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-pressed="filter === f.id" @click="filter = f.id"
        >
          {{ f.label }}
          <MiBadge :count="f.count" :tone="filter === f.id ? 'primary' : 'neutral'" variant="tint" show-zero :count-noun="f.label.toLowerCase() + ' entries'" />
        </button>
      </div>

      <TransitionGroup tag="ol" name="cl" class="cl__list mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
        <li v-for="e in shown" :key="e.id" class="cl__item mi:grid mi:gap-2 mi:py-4 mi:px-0 mi:border-t mi:border-t-sep mi:@[600px]:grid-cols-[120px_minmax(0,_1fr)] mi:@[600px]:gap-5 mi:@[600px]:py-4.5 mi:@[600px]:px-0">
          <div class="cl__when mi:flex mi:items-center mi:gap-2.5 mi:@[600px]:flex-col mi:@[600px]:[align-items:flex-start] mi:@[600px]:gap-1.5">
            <MiBadge v-if="unread.has(e.id)" dot-only :dot-size="8" tone="primary" placement="top-right" :offset="2" aria-label="Unread">
              <template #target><span class="cl__ver mi:inline-grid mi:place-items-center mi:min-w-11 mi:h-6 mi:py-0 mi:px-2 mi:rounded-[7px] mi:[font:600_12px/1_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-label mi:bg-fill3">{{ e.version }}</span></template>
            </MiBadge>
            <span v-else class="cl__ver mi:inline-grid mi:place-items-center mi:min-w-11 mi:h-6 mi:py-0 mi:px-2 mi:rounded-[7px] mi:[font:600_12px/1_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-label mi:bg-fill3">{{ e.version }}</span>
            <MiText variant="caption" tone="label3">{{ e.date }}</MiText>
          </div>
          <div class="cl__text mi:grid mi:gap-1 mi:min-w-0">
            <div class="cl__badges mi:flex mi:flex-wrap mi:gap-1.5 mi:mb-1">
              <MiBadge v-for="b in e.badges" :key="b.label" v-bind="styles[b.kind]" :label="b.label" />
            </div>
            <MiText as="h3" variant="subheadline" weight="semibold">{{ e.title }}</MiText>
            <MiText variant="footnote" tone="label2">{{ e.body }}</MiText>
          </div>
        </li>
      </TransitionGroup>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Kind = 'new' | 'improved' | 'fixed' | 'security' | 'deprecated' | 'beta' | 'plan'
type Tone = 'primary' | 'secondary' | 'warning' | 'neutral' | 'danger' | 'success'

// One badge style per meaning, so the style itself carries information.
const styles: Record<Kind, { tone: Tone, variant: 'solid' | 'tint' | 'outline', shape?: 'pill' | 'rounded', dot?: boolean }> = {
  new: { tone: 'primary', variant: 'solid', shape: 'pill' },
  improved: { tone: 'secondary', variant: 'tint', shape: 'pill' },
  fixed: { tone: 'success', variant: 'tint', shape: 'pill', dot: true },
  security: { tone: 'danger', variant: 'solid', shape: 'rounded' },
  deprecated: { tone: 'warning', variant: 'outline' },
  beta: { tone: 'neutral', variant: 'outline', shape: 'pill' },
  plan: { tone: 'secondary', variant: 'outline' }
}

const entries: { id: number, version: string, date: string, title: string, body: string, badges: { kind: Kind, label: string }[] }[] = [
  { id: 1, version: '5.8', date: 'Oct 28', title: 'Offline mode for inspection forms', body: 'Fill and sign forms with no signal; they sync the moment you are back online.', badges: [{ kind: 'new', label: 'New' }, { kind: 'beta', label: 'Beta' }] },
  { id: 2, version: '5.8', date: 'Oct 28', title: 'Bulk assign inspections', body: 'Select up to 200 sites on the map and assign them to a crew in one step.', badges: [{ kind: 'new', label: 'New' }, { kind: 'plan', label: 'Pro plan' }] },
  { id: 3, version: '5.8', date: 'Oct 28', title: 'Signature capture is three times faster', body: 'Strokes render on the GPU, so long signatures no longer lag on older tablets.', badges: [{ kind: 'improved', label: 'Improved' }] },
  { id: 4, version: '5.7.2', date: 'Oct 14', title: 'Photos keep their orientation on Android 15', body: 'Pictures taken in landscape are no longer rotated when attached to a report.', badges: [{ kind: 'fixed', label: 'Fixed' }] },
  { id: 5, version: '5.7.2', date: 'Oct 14', title: 'Sessions follow your SSO timeout policy', body: 'Idle sessions now end when your identity provider says so, not after 30 days.', badges: [{ kind: 'security', label: 'Security' }, { kind: 'fixed', label: 'Fixed' }] },
  { id: 6, version: '5.7', date: 'Sep 30', title: 'Legacy CSV export', body: 'Use the new Excel and JSON exports instead. The CSV option is removed in May.', badges: [{ kind: 'deprecated', label: 'Deprecated' }] }
]

const unread = reactive(new Set([1, 2, 3]))
const filter = ref<'all' | Kind>('all')

const countOf = (k: Kind) => entries.filter(e => e.badges.some(b => b.kind === k)).length
const filters = computed(() => [
  { id: 'all' as const, label: 'All', count: entries.length },
  ...(['new', 'improved', 'fixed', 'security', 'deprecated'] as Kind[]).map(k => ({ id: k, label: k[0]!.toUpperCase() + k.slice(1), count: countOf(k) }))
])
const shown = computed(() => (filter.value === 'all' ? entries : entries.filter(e => e.badges.some(b => b.kind === filter.value))))
</script>

<style scoped>
.cl__filter {
  font: inherit; font-size: 13px; font-weight: 500;
}

.cl-move { transition: transform var(--mi-dur-3) var(--mi-spring); }
.cl-enter-active, .cl-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease); }
.cl-enter-from, .cl-leave-to { opacity: 0; }
.cl-leave-active { position: absolute; visibility: hidden; }
</style>
