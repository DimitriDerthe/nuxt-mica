<template>
  <section class="kb mi:@container mi:flex mi:flex-col mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="release-board-title">
    <header class="kb__bar mi:grid mi:gap-3.5 mi:p-4 mi:border-b mi:border-b-sep mi:[background:var(--mi-card)] mi:@[900px]:grid-cols-[auto_minmax(180px,_1fr)_auto] mi:@[900px]:items-center mi:@[900px]:gap-6 mi:@[900px]:py-4 mi:@[900px]:px-5.5">
      <div class="kb__title mi:flex mi:items-center mi:gap-3 mi:min-w-0">
        <span class="kb__logo mi:grid mi:place-items-center mi:flex-[none] mi:w-10 mi:h-10 mi:rounded-[12px] mi:text-[13px] mi:font-extrabold mi:tracking-[-.02em] mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))] mi:text-p-on" aria-hidden="true">4.2</span>
        <div>
          <MiText id="release-board-title" variant="headline" as="h2">Mobile app · Release 4.2</MiText>
          <MiText variant="caption" tone="label2">Ships Thursday, November 19</MiText>
        </div>
      </div>
      <div class="kb__burn mi:grid mi:gap-1.5">
        <div class="kb__burn-top mi:flex mi:justify-between mi:gap-2">
          <MiText variant="caption" weight="semibold">{{ donePts }} of {{ totalPts }} points done</MiText>
          <MiText variant="caption" tone="label2">{{ Math.round(donePts / totalPts * 100) }}%</MiText>
        </div>
        <div class="kb__burn-bar mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Release progress" aria-valuemin="0" :aria-valuemax="totalPts" :aria-valuenow="donePts">
          <span class="mi:[.kb__burn-bar_&]:block mi:[.kb__burn-bar_&]:h-full mi:[.kb__burn-bar_&]:origin-left mi:[.kb__burn-bar_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${donePts / totalPts})` }" />
        </div>
      </div>
      <div class="kb__tools mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
        <MiSearch v-model="query" size="compact" placeholder="Filter cards" aria-label="Filter cards" class="kb__search" />
        <MiChip v-model="mine" selectable size="small" tone="neutral" label="Assigned to me" />
        <MiAvatarGroup :items="team" :max="4" :size="28" />
      </div>
    </header>

    <div class="kb__scroll mi:flex-1 mi:overflow-x-auto mi:overscroll-x-contain mi:[scroll-snap-type:x_mandatory] mi:[scroll-padding-inline:16px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" tabindex="0" role="region" aria-label="Board columns">
      <div class="kb__cols mi:grid mi:grid-flow-col mi:auto-cols-[minmax(260px,_86%)] mi:gap-3 mi:items-start mi:p-4 mi:@[600px]:auto-cols-[290px] mi:@[1160px]:auto-cols-[minmax(0,_1fr)] mi:@[1160px]:py-5 mi:@[1160px]:px-5.5">
        <section v-for="(col, ci) in columns" :key="col.id" class="kb__col mi:grid mi:gap-2.5 mi:p-3 mi:rounded-xl mi:[background:var(--mi-fill4)] mi:snap-start mi:min-w-0 mi:[&.is-over]:[background:color-mix(in_srgb,_var(--mi-orange)_10%,_var(--mi-fill4))] mi:[&.is-over]:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-orange)_45%,_transparent)]" :class="{ 'is-over': col.limit && col.items.length > col.limit }" :aria-labelledby="'release-board-col-' + col.id">
          <header class="kb__col-head mi:flex mi:items-center mi:gap-2 mi:min-w-0 mi:px-0.5">
            <span class="kb__col-dot mi:w-2 mi:h-2 mi:flex-[none] mi:rounded-[50%] mi:[background:var(--c)]" :style="{ '--c': col.color }" aria-hidden="true" />
            <MiText :id="'release-board-col-' + col.id" variant="subheadline" weight="semibold" as="h3">{{ col.name }}</MiText>
            <span class="kb__count mi:py-px mi:px-[7px] mi:rounded-[999px] mi:text-[12px] mi:font-semibold mi:tabular-nums mi:[background:var(--mi-fill3)] mi:text-label2 mi:[.is-over_&]:text-p-on" :title="col.limit ? 'Work-in-progress limit' : undefined">
              {{ col.items.length }}<template v-if="col.limit">/{{ col.limit }}</template>
            </span>
            <span class="kb__pts mi:text-[12px] mi:text-label3 mi:whitespace-nowrap">{{ col.items.reduce((s, c) => s + c.points, 0) }} pts</span>
            <MiIconButton :label="'Add card to ' + col.name" variant="plain" size="small" class="kb__add mi:ms-auto" @click="composing = composing === col.id ? null : col.id">
              <MiIcon name="plus" :size="16" />
            </MiIconButton>
          </header>
          <p v-if="col.limit && col.items.length > col.limit" class="kb__warn mi:m-0 mi:text-[12px] mi:leading-[1.35] mi:text-orange-t" role="status">
            Over the limit by {{ col.items.length - col.limit }}. Finish something before pulling more.
          </p>
          <form v-if="composing === col.id" class="kb__compose mi:grid mi:grid-cols-[minmax(0,_1fr)_auto] mi:gap-1.5" @submit.prevent="addCard(col)">
            <MiInput v-model="draft" size="sm" placeholder="What needs doing?" aria-label="New card title" />
            <MiButton type="submit" size="small" :disabled="!draft.trim()">Add</MiButton>
          </form>

          <MiSortable
            handle :model-value="col.items" :gap="8" :aria-label="col.name + ' cards'" :item-label="(c) => c.key + ' ' + c.title" class="kb__list" @update:model-value="setItems(col, $event)"
          >
            <template #default="{ item }">
              <article class="kb__card mi:grid mi:gap-2 mi:py-0.5 mi:px-0 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:min-w-0 mi:[&.is-dim]:opacity-35" :class="{ 'is-dim': !matches(item) }">
                <div class="kb__card-top mi:flex mi:items-center mi:gap-2">
                  <span class="kb__type mi:py-px mi:px-[7px] mi:rounded-[6px] mi:text-[11px] mi:font-semibold mi:capitalize" :class="'is-' + item.type">{{ item.type }}</span>
                  <span class="kb__key mi:text-[11px] mi:font-semibold mi:text-label3 mi:tabular-nums">{{ item.key }}</span>
                  <span v-if="item.age >= 4 && col.id !== 'done'" class="kb__stale mi:inline-flex mi:items-center mi:gap-[3px] mi:ms-auto mi:text-[11px] mi:font-semibold mi:text-orange-t" :title="'In this column for ' + item.age + ' days'">
                    <MiIcon :svg="clock" :size="12" />{{ item.age }}d
                  </span>
                </div>
                <p class="kb__card-title mi:m-0 mi:text-[14px] mi:leading-[1.35] mi:font-medium">{{ item.title }}</p>
                <div class="kb__card-foot mi:flex mi:items-center mi:gap-2">
                  <MiAvatar :name="item.owner" tone="auto" :size="22" />
                  <span class="kb__card-pts mi:text-[12px] mi:font-semibold mi:text-label2 mi:tabular-nums">{{ item.points }} pts</span>
                  <span class="kb__moves mi:inline-flex mi:gap-1 mi:ms-auto">
                    <MiIconButton :label="'Move ' + item.key + ' to ' + (columns[ci - 1]?.name ?? '')" variant="gray" size="small" :disabled="ci === 0" @click="move(ci, item.id, -1)">
                      <MiIcon name="chevron-left" :size="14" />
                    </MiIconButton>
                    <MiIconButton :label="'Move ' + item.key + ' to ' + (columns[ci + 1]?.name ?? '')" variant="gray" size="small" :disabled="ci === columns.length - 1" @click="move(ci, item.id, 1)">
                      <MiIcon name="chevron-right" :size="14" />
                    </MiIconButton>
                  </span>
                </div>
              </article>
            </template>
          </MiSortable>
          <p v-if="!col.items.length" class="kb__empty mi:m-0 mi:py-4.5 mi:px-0 mi:text-center mi:text-[13px] mi:text-label3 mi:[border:1.5px_dashed_var(--mi-sep)] mi:rounded-lg">Nothing here yet.</p>
        </section>
      </div>
    </div>
    <p class="kb__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap mi:m-0" role="status">{{ announce }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Card = { id: string, key: string, title: string, type: 'bug' | 'feature' | 'chore', points: number, owner: string, age: number }
interface Column { id: string, name: string, color: string, limit?: number, items: Card[] }

const me = 'Hana Kobayashi'
const team = [{ name: 'Hana Kobayashi' }, { name: 'Tomás Ruiz' }, { name: 'Ines Duarte' }, { name: 'Malik Osei' }, { name: 'Rosa Lind' }]
const clock = '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'

// Sample board; swap for your tracker API.
const columns = reactive<Column[]>([
  {
    id: 'backlog', name: 'Backlog', color: 'var(--mi-label3)', items: [
      { id: 'c1', key: 'MOB-431', title: 'Offline banner when sync stalls over 30 s', type: 'feature', points: 3, owner: 'Tomás Ruiz', age: 6 },
      { id: 'c2', key: 'MOB-428', title: 'Crash on Android 12 when sharing a PDF receipt', type: 'bug', points: 2, owner: 'Hana Kobayashi', age: 1 },
      { id: 'c3', key: 'MOB-419', title: 'Bump React Native to 0.79', type: 'chore', points: 5, owner: 'Malik Osei', age: 9 }
    ]
  },
  {
    id: 'doing', name: 'In progress', color: 'var(--mi-p)', limit: 3, items: [
      { id: 'c4', key: 'MOB-402', title: 'Split payments between two cards', type: 'feature', points: 8, owner: 'Ines Duarte', age: 3 },
      { id: 'c5', key: 'MOB-417', title: 'Face ID prompt shows twice after cold start', type: 'bug', points: 2, owner: 'Hana Kobayashi', age: 5 },
      { id: 'c6', key: 'MOB-410', title: 'Haptics on swipe-to-archive', type: 'feature', points: 1, owner: 'Rosa Lind', age: 1 }
    ]
  },
  {
    id: 'review', name: 'Review', color: 'var(--mi-orange)', limit: 2, items: [
      { id: 'c7', key: 'MOB-396', title: 'New onboarding carousel copy, EN and FR', type: 'feature', points: 2, owner: 'Ines Duarte', age: 2 },
      { id: 'c8', key: 'MOB-405', title: 'Cache avatars to disk with a 7-day TTL', type: 'chore', points: 3, owner: 'Tomás Ruiz', age: 4 }
    ]
  },
  {
    id: 'done', name: 'Done', color: 'var(--mi-green)', items: [
      { id: 'c9', key: 'MOB-388', title: 'Dark mode for the receipts screen', type: 'feature', points: 5, owner: 'Rosa Lind', age: 0 },
      { id: 'c10', key: 'MOB-391', title: 'Wrong currency symbol for CHF', type: 'bug', points: 1, owner: 'Hana Kobayashi', age: 0 },
      { id: 'c11', key: 'MOB-384', title: 'Push token refresh on reinstall', type: 'bug', points: 3, owner: 'Malik Osei', age: 0 }
    ]
  }
])

const query = ref('')
const mine = ref(false)
const composing = ref<string | null>(null)
const draft = ref('')
const announce = ref('')
let seq = 432

const totalPts = computed(() => columns.reduce((s, c) => s + c.items.reduce((a, i) => a + i.points, 0), 0))
const donePts = computed(() => columns.find(c => c.id === 'done')!.items.reduce((a, i) => a + i.points, 0))

/** Filtering dims cards instead of hiding them, so drag order always maps to the real list. */
function matches(c: Record<string, any>) {
  const q = query.value.trim().toLowerCase()
  if (mine.value && c.owner !== me) return false
  return !q || c.title.toLowerCase().includes(q) || c.key.toLowerCase().includes(q)
}

function move(from: number, id: string, dir: -1 | 1) {
  const src = columns[from]!
  const dst = columns[from + dir]
  if (!dst) return
  const i = src.items.findIndex(c => c.id === id)
  const [card] = src.items.splice(i, 1)
  if (!card) return
  card.age = 0
  dst.items.unshift(card)
  const over = dst.limit && dst.items.length > dst.limit ? ` ${dst.name} is now over its limit of ${dst.limit}.` : ''
  announce.value = `${card.key} moved to ${dst.name}.${over}`
}

function setItems(col: Column, items: Record<string, any>[]) { col.items = items as Card[] }

function addCard(col: Column) {
  const title = draft.value.trim()
  if (!title) return
  col.items.unshift({ id: 'n' + seq, key: 'MOB-' + seq++, title, type: 'feature', points: 1, owner: me, age: 0 })
  draft.value = ''
  composing.value = null
  announce.value = `Card added to ${col.name}.`
}
</script>

<style scoped>
.kb__burn-bar span { background: var(--mi-green); }
.kb__search { flex: 1 1 160px; min-width: 0; }
.kb__col-head h3 { margin: 0; white-space: nowrap; }
.is-over .kb__count { background: var(--mi-orange); }
.kb__list { min-width: 0; }
.kb__type.is-feature { background: var(--mi-p-tint); color: var(--mi-p-text); }
.kb__type.is-bug { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.kb__type.is-chore { background: var(--mi-fill3); color: var(--mi-label2); }
</style>
