<template>
  <section class="vm mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label mi:[--pad:14px]" :class="'vm--' + density" aria-labelledby="vm-title">
    <header class="vm__head">
      <div>
        <MiText id="vm-title" variant="title3" as="h2" weight="semibold">Launch week tasks</MiText>
        <MiText variant="footnote" tone="label2">Spring release · {{ tasks.length }} open items across 5 people</MiText>
      </div>
    </header>

    <!-- Three segmented controls, three jobs: layout, density, ordering. -->
    <div class="vm__controls mi:grid mi:gap-3 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:@[560px]:grid-cols-[auto_auto] mi:@[560px]:justify-between mi:@[880px]:grid-cols-[auto_auto_1fr]">
      <div class="vm__control mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:@[560px]:[justify-content:flex-start]">
        <MiText as="span" variant="caption" tone="label2" weight="medium">View</MiText>
        <MiSegmented v-model="view" label="Layout" :options="views" />
      </div>
      <div class="vm__control mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:@[560px]:[justify-content:flex-start]">
        <MiText as="span" variant="caption" tone="label2" weight="medium">Density</MiText>
        <MiSegmented v-model="density" label="Density" :options="densities" />
      </div>
      <div class="vm__control vm__control--sort mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:@[560px]:[justify-content:flex-start] mi:@[560px]:col-span-full mi:@[880px]:col-[auto] mi:@[880px]:justify-self-end">
        <MiText as="span" variant="caption" tone="label2" weight="medium">Sort by</MiText>
        <MiSegmented v-model="sort" variant="tinted" label="Sort by" :options="sorts" />
      </div>
    </div>

    <div v-if="view !== 'board'" class="vm__stage">
      <TransitionGroup tag="ul" name="vm" class="vm__items mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]" :class="'vm__items--' + view" aria-label="Tasks">
        <li v-for="t in sorted" :key="t.id" class="vm__card mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:py-(--pad) mi:px-3.5 mi:rounded-md mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:[.vm__items--grid_&]:items-start mi:[.vm__items--grid_&]:content-start mi:@[560px]:[.vm__items--list_&]:grid-cols-[auto_minmax(0,_1fr)_auto]">
          <span class="vm__status mi:inline-block mi:flex-[none] mi:w-[9px] mi:h-[9px] mi:rounded-[50%] mi:[background:var(--c)] mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--c)_18%,_transparent)]" :style="{ '--c': statusColor[t.status] }" :title="t.status" />
          <div class="vm__main mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText variant="subheadline" weight="semibold" :lines="view === 'grid' ? 2 : 1">{{ t.title }}</MiText>
            <MiText v-if="density === 'cozy'" variant="caption" tone="label2">{{ t.status }} · {{ t.area }}</MiText>
          </div>
          <div class="vm__fields mi:col-[2] mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:[.vm__items--grid_&]:pt-1 mi:@[560px]:[.vm__items--list_&]:flex-nowrap">
            <span class="vm__field mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1.5 mi:rounded-[7px] mi:text-[12px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill4)] mi:[&.is-key]:text-p-text mi:[&.is-key]:[background:var(--mi-p-tint)]" :class="{ 'is-key': sort === 'priority' }">
              <span class="vm__prio mi:inline-flex mi:[align-items:flex-end] mi:gap-0.5 mi:h-[11px]" :data-level="t.priority" aria-hidden="true"><i class="mi:[.vm__prio_&]:w-[3px] mi:[.vm__prio_&]:rounded-[1px] mi:[.vm__prio_&]:[background:var(--mi-fill)] mi:[.vm__prio_&:nth-child(1)]:h-[5px] mi:[.vm__prio_&:nth-child(2)]:h-2 mi:[.vm__prio_&:nth-child(3)]:h-[11px] mi:[.vm__prio[data-level='3']_&]:[background:currentColor]" /><i class="mi:[.vm__prio_&]:w-[3px] mi:[.vm__prio_&]:rounded-[1px] mi:[.vm__prio_&]:[background:var(--mi-fill)] mi:[.vm__prio_&:nth-child(1)]:h-[5px] mi:[.vm__prio_&:nth-child(2)]:h-2 mi:[.vm__prio_&:nth-child(3)]:h-[11px] mi:[.vm__prio[data-level='3']_&]:[background:currentColor]" /><i class="mi:[.vm__prio_&]:w-[3px] mi:[.vm__prio_&]:rounded-[1px] mi:[.vm__prio_&]:[background:var(--mi-fill)] mi:[.vm__prio_&:nth-child(1)]:h-[5px] mi:[.vm__prio_&:nth-child(2)]:h-2 mi:[.vm__prio_&:nth-child(3)]:h-[11px] mi:[.vm__prio[data-level='3']_&]:[background:currentColor]" /></span>
              {{ prioLabel[t.priority] }}
            </span>
            <span class="vm__field mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1.5 mi:rounded-[7px] mi:text-[12px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill4)] mi:[&.is-key]:text-p-text mi:[&.is-key]:[background:var(--mi-p-tint)]" :class="{ 'is-key': sort === 'due' }">
              <MiIcon name="calendar" :size="14" /> {{ t.due }}
            </span>
            <span class="vm__field mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1.5 mi:rounded-[7px] mi:text-[12px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill4)] mi:[&.is-key]:text-p-text mi:[&.is-key]:[background:var(--mi-p-tint)]" :class="{ 'is-key': sort === 'owner' }">
              <MiAvatar :name="t.owner" size="xs" tone="auto" decorative /> <span class="vm__owner mi:whitespace-nowrap">{{ t.owner.split(' ')[0] }}</span>
            </span>
          </div>
        </li>
      </TransitionGroup>
    </div>

    <div v-else class="vm__board mi:grid mi:grid-flow-col mi:auto-cols-[minmax(220px,_78%)] mi:gap-2.5 mi:overflow-x-auto mi:[scroll-snap-type:x_mandatory] mi:pb-1.5 mi:@[880px]:grid-flow-row mi:@[880px]:grid-cols-4 mi:@[880px]:overflow-visible" role="list" aria-label="Tasks by status">
      <section v-for="col in board" :key="col.status" class="vm__col mi:grid mi:content-start mi:gap-2 mi:p-2.5 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:snap-start" role="listitem" :aria-labelledby="'vm-col-' + col.key">
        <h3 :id="'vm-col-' + col.key" class="vm__col-title mi:flex mi:items-center mi:gap-2 mi:m-0 mi:py-0.5 mi:px-1 mi:text-[13px] mi:font-semibold">
          <span class="vm__status mi:inline-block mi:flex-[none] mi:w-[9px] mi:h-[9px] mi:rounded-[50%] mi:[background:var(--c)] mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--c)_18%,_transparent)]" :style="{ '--c': statusColor[col.status] }" />{{ col.status }}
          <span class="vm__count mi:ml-auto mi:text-[12px] mi:font-medium mi:text-label3 mi:tabular-nums">{{ col.items.length }}</span>
        </h3>
        <TransitionGroup tag="ul" name="vm" class="vm__col-list mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:min-h-10">
          <li v-for="t in col.items" :key="t.id" class="vm__card vm__card--mini mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:py-(--pad) mi:px-3.5 mi:rounded-md mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:[.vm__items--grid_&]:items-start mi:[.vm__items--grid_&]:content-start mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:[.vm__items--list_&]:grid-cols-[auto_minmax(0,_1fr)_auto]">
            <MiText variant="footnote" weight="semibold" :lines="2">{{ t.title }}</MiText>
            <div class="vm__fields mi:col-[2] mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:[.vm__items--grid_&]:pt-1 mi:@[560px]:[.vm__items--list_&]:flex-nowrap">
              <span class="vm__field mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1.5 mi:rounded-[7px] mi:text-[12px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill4)] mi:[&.is-key]:text-p-text mi:[&.is-key]:[background:var(--mi-p-tint)]" :class="{ 'is-key': sort === 'due' }">{{ t.due }}</span>
              <span class="vm__field mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1.5 mi:rounded-[7px] mi:text-[12px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill4)] mi:[&.is-key]:text-p-text mi:[&.is-key]:[background:var(--mi-p-tint)]" :class="{ 'is-key': sort === 'priority' }">{{ prioLabel[t.priority] }}</span>
              <MiAvatar :name="t.owner" size="xs" tone="auto" />
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

<style scoped>
.vm--compact { --pad: 9px; }
.vm__card { gap: 6px 12px;
}
.vm__prio[data-level="1"] i:nth-child(1), .vm__prio[data-level="2"] i:nth-child(-n+2) { background: currentColor; }
.vm__items--grid .vm__fields { grid-column: 1 / -1; }
.vm__card--mini { gap: 8px; }
.vm__card--mini .vm__fields { grid-column: 1; }
.vm__card--mini .vm__fields > :last-child { margin-left: auto; }

.vm-move { transition: transform var(--mi-dur-3) var(--mi-spring); }

@container (min-width: 560px) {
  .vm__items--grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .vm__items--list .vm__fields { grid-column: auto; }
}
@container (min-width: 880px) {
  .vm__items--grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
