<template>
  <section class="rc" aria-labelledby="rc-title">
    <header class="rc__head">
      <div>
        <MiText id="rc-title" variant="title3" as="h2" weight="semibold">Release 4.2 checklist</MiText>
        <MiText variant="footnote" tone="label2" tabular aria-live="polite">{{ doneCount }} of {{ total }} done · store submission Thursday</MiText>
      </div>
      <MiSegmented v-model="scope" label="Show" :options="scopes" />
    </header>

    <!-- One segment per group, each filling with its own progress: the release reads like a fuel gauge. -->
    <div class="rc__gauge" role="img" :aria-label="`${doneCount} of ${total} tasks done`">
      <span v-for="g in groups" :key="g.id" class="rc__gauge-seg" :style="{ flexGrow: g.items.length }">
        <i :style="{ transform: `scaleX(${ratio(g)})` }" :class="{ 'is-full': ratio(g) === 1 }" />
      </span>
    </div>

    <div class="rc__groups">
      <MiList v-for="g in visibleGroups" :key="g.id" class="rc__group" :label="g.title">
        <template #header>
          <span class="rc__group-head">
            <span>{{ g.title }}</span>
            <span class="rc__count" :class="{ 'is-full': ratio(g) === 1 }">{{ g.items.filter(i => i.done).length }}/{{ g.items.length }}</span>
          </span>
        </template>

        <!-- A finished group folds to a single line; it can still be reopened. -->
        <MiListItem
          v-if="ratio(g) === 1 && !opened.has(g.id)" button :title="g.items.length === 2 ? `Both tasks done` : `All ${g.items.length} tasks done`" subtitle="Show the finished tasks"
          tile="green" @click="reopen(g.id)"
        >
          <template #leading><MiIcon name="check" :size="16" /></template>
        </MiListItem>
        <template v-else>
          <MiListItem v-for="item in rows(g)" :key="item.id" class="rc__row" :class="{ 'is-done': item.done }">
            <template #title><span class="rc__task">{{ item.title }}</span></template>
            <template #leading>
              <MiCheckbox v-model="item.done"><span class="rc__sr">{{ item.title }}</span></MiCheckbox>
            </template>
            <template #subtitle>
              <span class="rc__meta">
                <span>{{ item.owner === ME ? 'You' : item.owner }}</span>
                <span v-if="!item.done" :class="{ 'rc__late': item.due === 'Today' }">· {{ item.due }}</span>
              </span>
            </template>
            <template #trailing>
              <MiAvatar :name="item.owner" size="xs" tone="auto" decorative />
            </template>
          </MiListItem>
        </template>
      </MiList>
      <MiEmptyState v-if="!visibleGroups.length" title="Nothing left for you" description="Every task assigned to you is done." icon="check" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const ME = 'Inès Moreau'

const groups = reactive([
  {
    id: 'build', title: 'Build', items: [
      { id: 'b1', title: 'Release candidate 4.2 (812) signed', owner: 'Yuki Tanaka', due: 'Done', done: true },
      { id: 'b2', title: 'Crash-free sessions above 99.7% in beta', owner: 'Marta Kowalska', due: 'Done', done: true },
      { id: 'b3', title: 'Remove the debug menu flag', owner: 'Yuki Tanaka', due: 'Today', done: false }
    ]
  },
  {
    id: 'store', title: 'Store listing', items: [
      { id: 's1', title: 'Screenshots for 6.9-inch and 13-inch', owner: 'Saoirse Byrne', due: 'Done', done: true },
      { id: 's2', title: '“What’s new” copy in 9 languages', owner: 'Noor Haddad', due: 'Wed', done: false },
      { id: 's3', title: 'Preview video under 30 seconds', owner: ME, due: 'Wed', done: false }
    ]
  },
  {
    id: 'legal', title: 'Compliance', items: [
      { id: 'l1', title: 'Privacy labels cover precise location', owner: ME, due: 'Done', done: true },
      { id: 'l2', title: 'Export compliance answered', owner: ME, due: 'Done', done: true }
    ]
  },
  {
    id: 'launch', title: 'Launch day', items: [
      { id: 'n1', title: 'Phased release over 7 days', owner: 'Kofi Mensah', due: 'Thu', done: false },
      { id: 'n2', title: 'Support macros for the new checkout', owner: 'Marta Kowalska', due: 'Thu', done: false },
      { id: 'n3', title: 'Status page note scheduled', owner: ME, due: 'Thu', done: false }
    ]
  }
])
type Group = typeof groups[number]

const scopes = [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'mine', label: 'Mine' }]
const scope = ref<string | number | null>('all')

const total = computed(() => groups.reduce((n, g) => n + g.items.length, 0))
const doneCount = computed(() => groups.reduce((n, g) => n + g.items.filter(i => i.done).length, 0))
const ratio = (g: Group) => g.items.filter(i => i.done).length / g.items.length

const rows = (g: Group) => g.items.filter(i => (scope.value !== 'open' || !i.done) && (scope.value !== 'mine' || i.owner === ME))
// Groups with nothing to show under the current scope are hidden, except folded finished groups in "All".
const visibleGroups = computed(() => groups.filter(g => (scope.value === 'all' ? true : rows(g).length > 0)))

const opened = ref(new Set<string>())
const reopen = (id: string) => { opened.value = new Set(opened.value).add(id) }
</script>

<style scoped>
.rc { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.rc__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.rc__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.rc__gauge { display: flex; gap: 4px; height: 8px; }
.rc__gauge-seg { flex-basis: 0; border-radius: 4px; background: var(--mi-fill3); overflow: hidden; }
.rc__gauge-seg i { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.rc__gauge-seg i.is-full { background: var(--mi-green); }

.rc__groups { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px 16px; align-items: start; }
@container (min-width: 760px) { .rc__groups { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.rc__group { min-width: 0; }
.rc__group-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; }
.rc__count { padding: 1px 7px; border-radius: 99px; font-variant-numeric: tabular-nums; letter-spacing: 0; background: var(--mi-fill2); }
.rc__count.is-full { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.is-done .rc__task { color: var(--mi-label2); text-decoration: line-through; text-decoration-color: var(--mi-label3); }
.rc__meta { display: inline-flex; flex-wrap: wrap; gap: 4px; }
.rc__late { color: var(--mi-orange-t); font-weight: 600; }
</style>
