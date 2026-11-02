<template>
  <section class="vm" :class="'vm--' + density" aria-labelledby="vm-title">
    <header class="vm__head">
      <div>
        <MiText id="vm-title" variant="title3" as="h2" weight="semibold">Launch week tasks</MiText>
        <MiText variant="footnote" tone="label2">Spring release · {{ tasks.length }} open items across 5 people</MiText>
      </div>
    </header>

    <!-- Three segmented controls, three jobs: layout, density, ordering. -->
    <div class="vm__controls">
      <div class="vm__control">
        <MiText as="span" variant="caption" tone="label2" weight="medium">View</MiText>
        <MiSegmented v-model="view" label="Layout" :options="views" />
      </div>
      <div class="vm__control">
        <MiText as="span" variant="caption" tone="label2" weight="medium">Density</MiText>
        <MiSegmented v-model="density" label="Density" :options="densities" />
      </div>
      <div class="vm__control vm__control--sort">
        <MiText as="span" variant="caption" tone="label2" weight="medium">Sort by</MiText>
        <MiSegmented v-model="sort" variant="tinted" label="Sort by" :options="sorts" />
      </div>
    </div>

    <div v-if="view !== 'board'" class="vm__stage">
      <TransitionGroup tag="ul" name="vm" class="vm__items" :class="'vm__items--' + view" aria-label="Tasks">
        <li v-for="t in sorted" :key="t.id" class="vm__card">
          <span class="vm__status" :style="{ '--c': statusColor[t.status] }" :title="t.status" />
          <div class="vm__main">
            <MiText variant="subheadline" weight="semibold" :lines="view === 'grid' ? 2 : 1">{{ t.title }}</MiText>
            <MiText v-if="density === 'cozy'" variant="caption" tone="label2">{{ t.status }} · {{ t.area }}</MiText>
          </div>
          <div class="vm__fields">
            <span class="vm__field" :class="{ 'is-key': sort === 'priority' }">
              <span class="vm__prio" :data-level="t.priority" aria-hidden="true"><i /><i /><i /></span>
              {{ prioLabel[t.priority] }}
            </span>
            <span class="vm__field" :class="{ 'is-key': sort === 'due' }">
              <MiIcon name="calendar" :size="14" /> {{ t.due }}
            </span>
            <span class="vm__field" :class="{ 'is-key': sort === 'owner' }">
              <MiAvatar :name="t.owner" size="xs" tone="auto" decorative /> <span class="vm__owner">{{ t.owner.split(' ')[0] }}</span>
            </span>
          </div>
        </li>
      </TransitionGroup>
    </div>

    <div v-else class="vm__board" role="list" aria-label="Tasks by status">
      <section v-for="col in board" :key="col.status" class="vm__col" role="listitem" :aria-labelledby="'vm-col-' + col.key">
        <h3 :id="'vm-col-' + col.key" class="vm__col-title">
          <span class="vm__status" :style="{ '--c': statusColor[col.status] }" />{{ col.status }}
          <span class="vm__count">{{ col.items.length }}</span>
        </h3>
        <TransitionGroup tag="ul" name="vm" class="vm__col-list">
          <li v-for="t in col.items" :key="t.id" class="vm__card vm__card--mini">
            <MiText variant="footnote" weight="semibold" :lines="2">{{ t.title }}</MiText>
            <div class="vm__fields">
              <span class="vm__field" :class="{ 'is-key': sort === 'due' }">{{ t.due }}</span>
              <span class="vm__field" :class="{ 'is-key': sort === 'priority' }">{{ prioLabel[t.priority] }}</span>
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
.vm { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); --pad: 14px; }
.vm--compact { --pad: 9px; }

.vm__controls {
  display: grid; gap: 12px; padding: 14px; border-radius: var(--mi-radius-l);
  background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.vm__control { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }

.vm__items { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.vm__card {
  display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px 12px; align-items: center; padding: var(--pad) 14px;
  border-radius: var(--mi-radius-m); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep);
}
.vm__main { display: grid; gap: 2px; min-width: 0; }
.vm__fields { grid-column: 2; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.vm__field {
  display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 8px 0 6px; border-radius: 7px;
  font-size: 12px; font-weight: 500; color: var(--mi-label2); background: var(--mi-fill4);
}
.vm__field.is-key { color: var(--mi-p-text); background: var(--mi-p-tint); }
.vm__owner { white-space: nowrap; }
.vm__status { display: inline-block; flex: none; width: 9px; height: 9px; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent); }

.vm__prio { display: inline-flex; align-items: flex-end; gap: 2px; height: 11px; }
.vm__prio i { width: 3px; border-radius: 1px; background: var(--mi-fill); }
.vm__prio i:nth-child(1) { height: 5px; } .vm__prio i:nth-child(2) { height: 8px; } .vm__prio i:nth-child(3) { height: 11px; }
.vm__prio[data-level="1"] i:nth-child(1), .vm__prio[data-level="2"] i:nth-child(-n+2), .vm__prio[data-level="3"] i { background: currentColor; }

/* Grid view: cards stack their fields under the title. */
.vm__items--grid .vm__card { align-items: start; align-content: start; }
.vm__items--grid .vm__fields { grid-column: 1 / -1; padding-top: 4px; }

/* Board: fixed-width columns that scroll sideways inside their own strip on narrow widths. */
.vm__board { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(220px, 78%); gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; }
.vm__col { display: grid; align-content: start; gap: 8px; padding: 10px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); scroll-snap-align: start; }
.vm__col-title { display: flex; align-items: center; gap: 8px; margin: 0; padding: 2px 4px; font-size: 13px; font-weight: 600; }
.vm__count { margin-left: auto; font-size: 12px; font-weight: 500; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.vm__col-list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; min-height: 40px; }
.vm__card--mini { grid-template-columns: minmax(0, 1fr); gap: 8px; }
.vm__card--mini .vm__fields { grid-column: 1; }
.vm__card--mini .vm__fields > :last-child { margin-left: auto; }

.vm-move { transition: transform var(--mi-dur-3) var(--mi-spring); }

@container (min-width: 560px) {
  .vm__controls { grid-template-columns: auto auto; justify-content: space-between; }
  .vm__control { justify-content: flex-start; }
  .vm__control--sort { grid-column: 1 / -1; }
  .vm__items--grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .vm__items--list .vm__card { grid-template-columns: auto minmax(0, 1fr) auto; }
  .vm__items--list .vm__fields { grid-column: auto; flex-wrap: nowrap; }
}
@container (min-width: 880px) {
  .vm__controls { grid-template-columns: auto auto 1fr; }
  .vm__control--sort { grid-column: auto; justify-self: end; }
  .vm__items--grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .vm__board { grid-auto-flow: row; grid-template-columns: repeat(4, minmax(0, 1fr)); overflow: visible; }
}
</style>
