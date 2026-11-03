<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" :class="density === 'compact' ? 'mi:[--pad:9px]' : 'mi:[--pad:14px]'" aria-labelledby="vm-title">
    <header>
      <div>
        <MiText id="vm-title" variant="title3" as="h2" weight="semibold">Launch week tasks</MiText>
        <MiText variant="footnote" tone="label2">Spring release · {{ tasks.length }} open items across 5 people</MiText>
      </div>
    </header>

    <!-- Three segmented controls, three jobs: layout, density, ordering. -->
    <div class="mi:grid mi:gap-3 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:@[560px]:grid-cols-[auto_auto] mi:@[560px]:justify-between mi:@[880px]:grid-cols-[auto_auto_1fr]">
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:@[560px]:[justify-content:flex-start]">
        <MiText as="span" variant="caption" tone="label2" weight="medium">View</MiText>
        <MiSegmented v-model="view" label="Layout" :options="views" />
      </div>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:@[560px]:[justify-content:flex-start]">
        <MiText as="span" variant="caption" tone="label2" weight="medium">Density</MiText>
        <MiSegmented v-model="density" label="Density" :options="densities" />
      </div>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:@[560px]:[justify-content:flex-start] mi:@[560px]:col-span-full mi:@[880px]:col-[auto] mi:@[880px]:justify-self-end">
        <MiText as="span" variant="caption" tone="label2" weight="medium">Sort by</MiText>
        <MiSegmented v-model="sort" variant="tinted" label="Sort by" :options="sorts" />
      </div>
    </div>

    <div v-if="view !== 'board'">
      <TransitionGroup tag="ul" move-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]" :class="[view === 'grid' ? 'mi:@[560px]:grid-cols-[repeat(2,_minmax(0,_1fr))] mi:@[880px]:grid-cols-[repeat(3,_minmax(0,_1fr))]' : '']" aria-label="Tasks">
        <li v-for="t in sorted" :key="t.id" class="mi:gap-y-1.5 mi:gap-x-3 mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:py-(--pad) mi:px-3.5 mi:rounded-md mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)]" :class="view === 'grid' ? 'mi:items-start mi:content-start' : 'mi:items-center mi:@[560px]:grid-cols-[auto_minmax(0,_1fr)_auto]'">
          <span class="mi:inline-block mi:flex-[none] mi:w-[9px] mi:h-[9px] mi:rounded-[50%] mi:[background:var(--c)] mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--c)_18%,_transparent)]" :style="{ '--c': statusColor[t.status] }" :title="t.status" />
          <div class="mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText variant="subheadline" weight="semibold" :lines="view === 'grid' ? 2 : 1">{{ t.title }}</MiText>
            <MiText v-if="density === 'cozy'" variant="caption" tone="label2">{{ t.status }} · {{ t.area }}</MiText>
          </div>
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5" :class="view === 'grid' ? 'mi:col-[1_/_-1] mi:pt-1' : 'mi:col-[2] mi:@[560px]:col-[auto] mi:@[560px]:flex-nowrap'">
            <span class="mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1.5 mi:rounded-[7px] mi:text-[12px] mi:font-medium" :class="sort === 'priority' ? 'mi:text-p-text mi:[background:var(--mi-p-tint)]' : 'mi:text-label2 mi:[background:var(--mi-fill4)]'">
              <span class="mi:inline-flex mi:[align-items:flex-end] mi:gap-0.5 mi:h-[11px]" aria-hidden="true"><i v-for="k in 3" :key="k" class="mi:w-[3px] mi:rounded-[1px]" :class="[k === 1 ? 'mi:h-[5px]' : k === 2 ? 'mi:h-2' : 'mi:h-[11px]', k <= t.priority ? 'mi:[background:currentColor]' : 'mi:[background:var(--mi-fill)]']" /></span>
              {{ prioLabel[t.priority] }}
            </span>
            <span class="mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1.5 mi:rounded-[7px] mi:text-[12px] mi:font-medium" :class="sort === 'due' ? 'mi:text-p-text mi:[background:var(--mi-p-tint)]' : 'mi:text-label2 mi:[background:var(--mi-fill4)]'">
              <MiIcon name="calendar" :size="14" /> {{ t.due }}
            </span>
            <span class="mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1.5 mi:rounded-[7px] mi:text-[12px] mi:font-medium" :class="sort === 'owner' ? 'mi:text-p-text mi:[background:var(--mi-p-tint)]' : 'mi:text-label2 mi:[background:var(--mi-fill4)]'">
              <MiAvatar :name="t.owner" size="xs" tone="auto" decorative /> <span class="mi:whitespace-nowrap">{{ t.owner.split(' ')[0] }}</span>
            </span>
          </div>
        </li>
      </TransitionGroup>
    </div>

    <div v-else class="mi:grid mi:grid-flow-col mi:auto-cols-[minmax(220px,_78%)] mi:gap-2.5 mi:overflow-x-auto mi:[scroll-snap-type:x_mandatory] mi:pb-1.5 mi:@[880px]:grid-flow-row mi:@[880px]:grid-cols-4 mi:@[880px]:overflow-visible" role="list" aria-label="Tasks by status">
      <section v-for="col in board" :key="col.status" class="mi:grid mi:content-start mi:gap-2 mi:p-2.5 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:snap-start" role="listitem" :aria-labelledby="'vm-col-' + col.key">
        <h3 :id="'vm-col-' + col.key" class="mi:flex mi:items-center mi:gap-2 mi:m-0 mi:py-0.5 mi:px-1 mi:text-[13px] mi:font-semibold">
          <span class="mi:inline-block mi:flex-[none] mi:w-[9px] mi:h-[9px] mi:rounded-[50%] mi:[background:var(--c)] mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--c)_18%,_transparent)]" :style="{ '--c': statusColor[col.status] }" />{{ col.status }}
          <span class="mi:ml-auto mi:text-[12px] mi:font-medium mi:text-label3 mi:tabular-nums">{{ col.items.length }}</span>
        </h3>
        <TransitionGroup tag="ul" move-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:min-h-10">
          <li v-for="t in col.items" :key="t.id" class="mi:gap-2 mi:grid mi:items-center mi:py-(--pad) mi:px-3.5 mi:rounded-md mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:grid-cols-[minmax(0,_1fr)]">
            <MiText variant="footnote" weight="semibold" :lines="2">{{ t.title }}</MiText>
            <div class="mi:col-[1] mi:flex mi:flex-wrap mi:items-center mi:gap-1.5">
              <span class="mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1.5 mi:rounded-[7px] mi:text-[12px] mi:font-medium" :class="sort === 'due' ? 'mi:text-p-text mi:[background:var(--mi-p-tint)]' : 'mi:text-label2 mi:[background:var(--mi-fill4)]'">{{ t.due }}</span>
              <span class="mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1.5 mi:rounded-[7px] mi:text-[12px] mi:font-medium" :class="sort === 'priority' ? 'mi:text-p-text mi:[background:var(--mi-p-tint)]' : 'mi:text-label2 mi:[background:var(--mi-fill4)]'">{{ prioLabel[t.priority] }}</span>
              <MiAvatar :name="t.owner" size="xs" tone="auto" class="mi:ml-auto" />
            </div>
          </li>
        </TransitionGroup>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Status = 'To do' | 'In progress' | 'In review' | 'Done'
interface Task { id: number, title: string, area: string, owner: string, priority: 1 | 2 | 3, due: string, day: number, status: Status }

const views = [
  { value: 'list', icon: 'list' as const, ariaLabel: 'List' },
  { value: 'grid', icon: 'grid' as const, ariaLabel: 'Grid' },
  { value: 'board', icon: 'columns' as const, ariaLabel: 'Board' }
]
const densities = [{ value: 'cozy', label: 'Cozy' }, { value: 'compact', label: 'Compact' }]
const sorts = [{ value: 'due', label: 'Due date' }, { value: 'priority', label: 'Priority' }, { value: 'owner', label: 'Owner' }]

const view = ref<string | number | null>('list')
const density = ref<string | number | null>('cozy')
const sort = ref<string | number | null>('due')

const tasks: Task[] = [
  { id: 1, title: 'Finalize pricing page copy', area: 'Marketing site', owner: 'Léa Martin', priority: 3, due: 'Mar 4', day: 4, status: 'In progress' },
  { id: 2, title: 'QA checkout on Safari 18 and iOS', area: 'Web app', owner: 'Tomás Rivera', priority: 3, due: 'Mar 3', day: 3, status: 'In review' },
  { id: 3, title: 'Record the onboarding walkthrough', area: 'Product education', owner: 'Hana Sato', priority: 2, due: 'Mar 7', day: 7, status: 'To do' },
  { id: 4, title: 'Ship the status page redesign', area: 'Platform', owner: 'Omar Haddad', priority: 2, due: 'Mar 6', day: 6, status: 'In progress' },
  { id: 5, title: 'Draft the launch email for 48k subscribers', area: 'Lifecycle', owner: 'Léa Martin', priority: 1, due: 'Mar 9', day: 9, status: 'To do' },
  { id: 6, title: 'Update API rate limit docs', area: 'Developer docs', owner: 'Kwame Asante', priority: 2, due: 'Mar 5', day: 5, status: 'Done' }
]

const prioLabel = { 1: 'Low', 2: 'Medium', 3: 'High' } as const
const statusColor: Record<Status, string> = {
  'To do': 'var(--mi-label3)', 'In progress': 'var(--mi-p)', 'In review': 'var(--mi-orange)', 'Done': 'var(--mi-green)'
}

const sorted = computed(() => [...tasks].sort((a, b) => {
  if (sort.value === 'priority') return b.priority - a.priority || a.day - b.day
  if (sort.value === 'owner') return a.owner.localeCompare(b.owner) || a.day - b.day
  return a.day - b.day
}))

const board = computed(() => (['To do', 'In progress', 'In review', 'Done'] as Status[]).map(status => ({
  status, key: status.toLowerCase().replace(/\s/g, '-'), items: sorted.value.filter(t => t.status === status)
})))
</script>
