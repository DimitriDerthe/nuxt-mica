<template>
  <section class="rc mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="rc-title">
    <header class="rc__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="rc-title" variant="title3" as="h2" weight="semibold">Release 4.2 checklist</MiText>
        <MiText variant="footnote" tone="label2" tabular aria-live="polite">{{ doneCount }} of {{ total }} done · store submission Thursday</MiText>
      </div>
      <MiSegmented v-model="scope" label="Show" :options="scopes" />
    </header>

    <!-- One segment per group, each filling with its own progress: the release reads like a fuel gauge. -->
    <div class="rc__gauge mi:flex mi:gap-1 mi:h-2" role="img" :aria-label="`${doneCount} of ${total} tasks done`">
      <span v-for="g in groups" :key="g.id" class="rc__gauge-seg mi:basis-0 mi:rounded-[4px] mi:bg-fill3 mi:overflow-hidden" :style="{ flexGrow: g.items.length }">
        <i class="mi:[.rc__gauge-seg_&]:block mi:[.rc__gauge-seg_&]:h-full mi:[.rc__gauge-seg_&]:bg-p mi:[.rc__gauge-seg_&]:origin-left mi:[.rc__gauge-seg_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${ratio(g)})` }" :class="{ 'is-full': ratio(g) === 1 }" />
      </span>
    </div>

    <div class="rc__groups mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-y-1 mi:gap-x-4 mi:items-start mi:@[760px]:grid-cols-2">
      <MiList v-for="g in visibleGroups" :key="g.id" class="rc__group" :label="g.title">
        <template #header>
          <span class="rc__group-head mi:flex mi:items-center mi:justify-between mi:gap-2 mi:w-full">
            <span>{{ g.title }}</span>
            <span class="rc__count mi:py-px mi:px-[7px] mi:rounded-[99px] mi:tabular-nums mi:tracking-[0] mi:bg-fill2 mi:[&.is-full]:text-green-t mi:[&.is-full]:[background:color-mix(in_srgb,_var(--mi-green)_14%,_transparent)]" :class="{ 'is-full': ratio(g) === 1 }">{{ g.items.filter(i => i.done).length }}/{{ g.items.length }}</span>
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
            <template #title><span class="rc__task mi:[.is-done_&]:text-label2">{{ item.title }}</span></template>
            <template #leading>
              <MiCheckbox v-model="item.done"><span class="rc__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ item.title }}</span></MiCheckbox>
            </template>
            <template #subtitle>
              <span class="rc__meta mi:inline-flex mi:flex-wrap mi:gap-1">
                <span>{{ item.owner === ME ? 'You' : item.owner }}</span>
                <span v-if="!item.done" :class="{ 'rc__late mi:text-orange-t mi:font-semibold': item.due === 'Today' }">· {{ item.due }}</span>
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
.rc__gauge-seg i.is-full { background: var(--mi-green); }
.rc__group { min-width: 0; }
.is-done .rc__task { text-decoration: line-through; text-decoration-color: var(--mi-label3); }
</style>
