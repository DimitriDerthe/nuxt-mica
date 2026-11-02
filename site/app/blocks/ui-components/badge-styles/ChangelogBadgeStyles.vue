<template>
  <div class="cl-cq">
    <section class="cl" aria-labelledby="cl-title">
      <header class="cl__head">
        <div>
          <MiText id="cl-title" variant="title3" as="h2" weight="semibold">What's new in Fieldnote</MiText>
          <MiText variant="footnote" tone="label2">Releases for the inspection app, newest first</MiText>
        </div>
        <MiButton variant="plain" size="small" :disabled="!unread.size" @click="unread.clear()">
          Mark all as read
        </MiButton>
      </header>

      <!-- Filters carry count badges; the strip scrolls on its own when narrow. -->
      <div class="cl__filters" role="group" aria-label="Filter by type">
        <button
          v-for="f in filters" :key="f.id" type="button" class="cl__filter" :aria-pressed="filter === f.id" @click="filter = f.id"
        >
          {{ f.label }}
          <MiBadge :count="f.count" :tone="filter === f.id ? 'primary' : 'neutral'" variant="tint" show-zero :count-noun="f.label.toLowerCase() + ' entries'" />
        </button>
      </div>

      <TransitionGroup tag="ol" name="cl" class="cl__list">
        <li v-for="e in shown" :key="e.id" class="cl__item">
          <div class="cl__when">
            <MiBadge v-if="unread.has(e.id)" dot-only :dot-size="8" tone="primary" placement="top-right" :offset="2" aria-label="Unread">
              <template #target><span class="cl__ver">{{ e.version }}</span></template>
            </MiBadge>
            <span v-else class="cl__ver">{{ e.version }}</span>
            <MiText variant="caption" tone="label3">{{ e.date }}</MiText>
          </div>
          <div class="cl__text">
            <div class="cl__badges">
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
.cl-cq { container-type: inline-size; }
.cl {
  display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl);
  font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.cl__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 8px 16px; }

.cl__filters {
  display: flex; gap: 6px; margin-inline: -20px; padding: 2px 20px 6px; overflow-x: auto; scrollbar-width: none;
  mask-image: linear-gradient(90deg, transparent, black 20px, black calc(100% - 20px), transparent);
}
.cl__filter {
  display: inline-flex; flex: none; align-items: center; gap: 8px; height: 32px; padding: 0 6px 0 12px; border: 0; border-radius: 999px;
  font: inherit; font-size: 13px; font-weight: 500; color: var(--mi-label2); background: var(--mi-fill4); cursor: pointer;
  box-shadow: inset 0 0 0 1px var(--mi-sep);
}
.cl__filter[aria-pressed="true"] { color: var(--mi-label); background: var(--mi-card); box-shadow: inset 0 0 0 1.5px var(--mi-p); }
.cl__filter:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.cl__list { display: grid; margin: 0; padding: 0; list-style: none; }
.cl__item { display: grid; gap: 8px; padding: 16px 0; border-top: 1px solid var(--mi-sep); }
.cl__when { display: flex; align-items: center; gap: 10px; }
.cl__ver {
  display: inline-grid; place-items: center; min-width: 44px; height: 24px; padding: 0 8px; border-radius: 7px;
  font: 600 12px/1 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label); background: var(--mi-fill3);
}
.cl__text { display: grid; gap: 4px; min-width: 0; }
.cl__badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }

.cl-move { transition: transform var(--mi-dur-3) var(--mi-spring); }
.cl-enter-active, .cl-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease); }
.cl-enter-from, .cl-leave-to { opacity: 0; }
.cl-leave-active { position: absolute; visibility: hidden; }

@container (min-width: 600px) {
  .cl { padding: 24px 28px; }
  .cl__filters { margin-inline: 0; padding-inline: 0; mask-image: none; flex-wrap: wrap; overflow: visible; }
  .cl__item { grid-template-columns: 120px minmax(0, 1fr); gap: 20px; padding: 18px 0; }
  .cl__when { flex-direction: column; align-items: flex-start; gap: 6px; }
}
</style>
