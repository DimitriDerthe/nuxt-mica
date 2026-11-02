<template>
  <section class="kb" aria-labelledby="release-board-title">
    <header class="kb__bar">
      <div class="kb__title">
        <span class="kb__logo" aria-hidden="true">4.2</span>
        <div>
          <MiText id="release-board-title" variant="headline" as="h2">Mobile app · Release 4.2</MiText>
          <MiText variant="caption" tone="label2">Ships Thursday, November 19</MiText>
        </div>
      </div>
      <div class="kb__burn">
        <div class="kb__burn-top">
          <MiText variant="caption" weight="semibold">{{ donePts }} of {{ totalPts }} points done</MiText>
          <MiText variant="caption" tone="label2">{{ Math.round(donePts / totalPts * 100) }}%</MiText>
        </div>
        <div class="kb__burn-bar" role="meter" aria-label="Release progress" aria-valuemin="0" :aria-valuemax="totalPts" :aria-valuenow="donePts">
          <span :style="{ transform: `scaleX(${donePts / totalPts})` }" />
        </div>
      </div>
      <div class="kb__tools">
        <MiSearch v-model="query" size="compact" placeholder="Filter cards" aria-label="Filter cards" class="kb__search" />
        <MiChip v-model="mine" selectable size="small" tone="neutral" label="Assigned to me" />
        <MiAvatarGroup :items="team" :max="4" :size="28" />
      </div>
    </header>

    <div class="kb__scroll" tabindex="0" role="region" aria-label="Board columns">
      <div class="kb__cols">
        <section v-for="(col, ci) in columns" :key="col.id" class="kb__col" :class="{ 'is-over': col.limit && col.items.length > col.limit }" :aria-labelledby="'release-board-col-' + col.id">
          <header class="kb__col-head">
            <span class="kb__col-dot" :style="{ '--c': col.color }" aria-hidden="true" />
            <MiText :id="'release-board-col-' + col.id" variant="subheadline" weight="semibold" as="h3">{{ col.name }}</MiText>
            <span class="kb__count" :title="col.limit ? 'Work-in-progress limit' : undefined">
              {{ col.items.length }}<template v-if="col.limit">/{{ col.limit }}</template>
            </span>
            <span class="kb__pts">{{ col.items.reduce((s, c) => s + c.points, 0) }} pts</span>
            <MiIconButton :label="'Add card to ' + col.name" variant="plain" size="small" class="kb__add" @click="composing = composing === col.id ? null : col.id">
              <MiIcon name="plus" :size="16" />
            </MiIconButton>
          </header>
          <p v-if="col.limit && col.items.length > col.limit" class="kb__warn" role="status">
            Over the limit by {{ col.items.length - col.limit }}. Finish something before pulling more.
          </p>
          <form v-if="composing === col.id" class="kb__compose" @submit.prevent="addCard(col)">
            <MiInput v-model="draft" size="sm" placeholder="What needs doing?" aria-label="New card title" />
            <MiButton type="submit" size="small" :disabled="!draft.trim()">Add</MiButton>
          </form>

          <MiSortable
            handle :model-value="col.items" :gap="8" :aria-label="col.name + ' cards'" :item-label="(c) => c.key + ' ' + c.title" class="kb__list" @update:model-value="setItems(col, $event)"
          >
            <template #default="{ item }">
              <article class="kb__card" :class="{ 'is-dim': !matches(item) }">
                <div class="kb__card-top">
                  <span class="kb__type" :class="'is-' + item.type">{{ item.type }}</span>
                  <span class="kb__key">{{ item.key }}</span>
                  <span v-if="item.age >= 4 && col.id !== 'done'" class="kb__stale" :title="'In this column for ' + item.age + ' days'">
                    <MiIcon :svg="clock" :size="12" />{{ item.age }}d
                  </span>
                </div>
                <p class="kb__card-title">{{ item.title }}</p>
                <div class="kb__card-foot">
                  <MiAvatar :name="item.owner" tone="auto" :size="22" />
                  <span class="kb__card-pts">{{ item.points }} pts</span>
                  <span class="kb__moves">
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
          <p v-if="!col.items.length" class="kb__empty">Nothing here yet.</p>
        </section>
      </div>
    </div>
    <p class="kb__sr" role="status">{{ announce }}</p>
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
.kb { container-type: inline-size; display: flex; flex-direction: column; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }

.kb__bar { display: grid; gap: 14px; padding: 16px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-card); }
@container (min-width: 900px) { .kb__bar { grid-template-columns: auto minmax(180px, 1fr) auto; align-items: center; gap: 24px; padding: 16px 22px; } }
.kb__title { display: flex; align-items: center; gap: 12px; min-width: 0; }
.kb__logo {
  display: grid; place-items: center; flex: none; width: 40px; height: 40px; border-radius: 12px; font-size: 13px; font-weight: 800; letter-spacing: -.02em;
  background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); color: var(--mi-p-on);
}
.kb__burn { display: grid; gap: 6px; }
.kb__burn-top { display: flex; justify-content: space-between; gap: 8px; }
.kb__burn-bar { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.kb__burn-bar span { display: block; height: 100%; background: var(--mi-green); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.kb__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.kb__search { flex: 1 1 160px; min-width: 0; }

.kb__scroll { flex: 1; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scroll-padding-inline: 16px; }
.kb__scroll:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.kb__cols { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(260px, 86%); gap: 12px; align-items: start; padding: 16px; }
@container (min-width: 600px) { .kb__cols { grid-auto-columns: 290px; } }
@container (min-width: 1160px) { .kb__cols { grid-auto-columns: minmax(0, 1fr); padding: 20px 22px; } }

.kb__col { display: grid; gap: 10px; padding: 12px; border-radius: var(--mi-radius-xl); background: var(--mi-fill4); scroll-snap-align: start; min-width: 0; }
.kb__col.is-over { background: color-mix(in srgb, var(--mi-orange) 10%, var(--mi-fill4)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-orange) 45%, transparent); }
.kb__col-head { display: flex; align-items: center; gap: 8px; min-width: 0; padding-inline: 2px; }
.kb__col-head h3 { margin: 0; white-space: nowrap; }
.kb__col-dot { width: 8px; height: 8px; flex: none; border-radius: 50%; background: var(--c); }
.kb__count { padding: 1px 7px; border-radius: 999px; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; background: var(--mi-fill3); color: var(--mi-label2); }
.is-over .kb__count { background: var(--mi-orange); color: var(--mi-p-on); }
.kb__pts { font-size: 12px; color: var(--mi-label3); white-space: nowrap; }
.kb__add { margin-inline-start: auto; }
.kb__warn { margin: 0; font-size: 12px; line-height: 1.35; color: var(--mi-orange-t); }
.kb__compose { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px; }
.kb__list { min-width: 0; }
.kb__empty { margin: 0; padding: 18px 0; text-align: center; font-size: 13px; color: var(--mi-label3); border: 1.5px dashed var(--mi-sep); border-radius: var(--mi-radius-l); }

/* The sortable row is already the card shell; the card only lays out its content. */
.kb__card { display: grid; gap: 8px; padding: 2px 0; transition: opacity var(--mi-dur-2) var(--mi-ease); min-width: 0; }
.kb__card.is-dim { opacity: .35; }
.kb__card-top { display: flex; align-items: center; gap: 8px; }
.kb__type { padding: 1px 7px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.kb__type.is-feature { background: var(--mi-p-tint); color: var(--mi-p-text); }
.kb__type.is-bug { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.kb__type.is-chore { background: var(--mi-fill3); color: var(--mi-label2); }
.kb__key { font-size: 11px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.kb__stale { display: inline-flex; align-items: center; gap: 3px; margin-inline-start: auto; font-size: 11px; font-weight: 600; color: var(--mi-orange-t); }
.kb__card-title { margin: 0; font-size: 14px; line-height: 1.35; font-weight: 500; }
.kb__card-foot { display: flex; align-items: center; gap: 8px; }
.kb__card-pts { font-size: 12px; font-weight: 600; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.kb__moves { display: inline-flex; gap: 4px; margin-inline-start: auto; }
.kb__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; margin: 0; }
</style>
