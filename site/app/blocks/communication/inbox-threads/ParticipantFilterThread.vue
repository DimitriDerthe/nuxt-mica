<template>
  <section class="pf" aria-labelledby="pf-title">
    <div class="pf__card">
      <header class="pf__head">
        <MiText id="pf-title" as="h2" variant="title3" weight="semibold">Venue shortlist for the June offsite</MiText>
        <MiText variant="footnote" tone="label2">{{ messages.length }} messages · {{ people.length }} people · started May 2</MiText>
      </header>

      <div class="pf__filters">
        <div class="pf__people" role="group" aria-label="Show messages from">
          <MiChip
            v-for="p in people" :key="p.name" v-model="p.on" selectable size="small" tone="neutral"
          >
            <span class="pf__chip"><MiAvatar :name="p.name" size="xs" tone="auto" decorative />{{ first(p.name) }} · {{ countBy(p.name) }}</span>
          </MiChip>
        </div>
        <div class="pf__mention">
          <MiSwitch v-model="mentionsOnly" size="compact" aria-labelledby="pf-mention-label" />
          <span id="pf-mention-label">Mentions me</span>
        </div>
      </div>

      <div class="pf__bar">
        <MiText variant="caption" tone="label2">Showing {{ shown.length }} of {{ messages.length }}</MiText>
        <MiButton variant="plain" size="small" @click="toggleAll">{{ allOpen ? 'Collapse all' : 'Expand all' }}</MiButton>
      </div>

      <ol class="pf__list">
        <li v-for="m in shown" :key="m.id" class="pf__msg" :class="{ 'is-open': open.has(m.id) }">
          <button type="button" class="pf__row" :aria-expanded="open.has(m.id)" :aria-controls="'pf-body-' + m.id" @click="toggle(m.id)">
            <MiAvatar :name="m.from" size="sm" :tone="m.from === me ? 'primary' : 'auto'" decorative />
            <span class="pf__row-text">
              <span class="pf__from">{{ m.from === me ? 'You' : m.from }}<MiBadge v-if="m.mentionsMe" tone="primary" label="Mentions you" /></span>
              <span v-if="!open.has(m.id)" class="pf__preview">{{ m.body[0] }}</span>
              <span v-else class="pf__to">to {{ m.to }}</span>
            </span>
            <time class="pf__time">{{ m.time }}</time>
          </button>
          <div v-if="open.has(m.id)" :id="'pf-body-' + m.id" class="pf__body">
            <p v-for="(line, i) in m.body" :key="i">{{ line }}</p>
          </div>
        </li>
      </ol>
      <p v-if="!shown.length" class="pf__empty">No messages match these filters.</p>

      <form class="pf__reply" @submit.prevent="send">
        <MiInputGroup v-model="draft" aria-label="Reply all" placeholder="Reply all">
          <template #trailing>
            <MiIconButton type="submit" label="Send reply" size="small" :disabled="!draft.trim()"><MiIcon name="arrow-up" :size="16" /></MiIconButton>
          </template>
        </MiInputGroup>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Mail { id: string, from: string, to: string, time: string, body: string[], mentionsMe?: boolean }
interface Person { name: string, on: boolean }

const me = 'Priya Shah'

// Sample thread; swap for your mail API.
const messages = ref<Mail[]>([
  { id: 'a', from: 'Tom Becker', to: 'Offsite crew', time: 'May 2', body: ['Kicking this off: 34 people, June 18 to 20, within two hours of Amsterdam by train.', 'Three places replied with availability. Details below, please add any I missed.'] },
  { id: 'b', from: 'Lena Visser', to: 'Offsite crew', time: 'May 2', body: ['Landgoed Wolfslaar in Breda has the barn for plenary and 18 double rooms. €212 per person per night, full board.'] },
  { id: 'c', from: 'Yusuf Demir', to: 'Offsite crew', time: 'May 3', mentionsMe: true, body: ['Priya, can you check whether the budget stretches to €230? The Veluwe lodge has bikes included and a lake.', 'They hold the dates until May 10.'] },
  { id: 'd', from: 'Tom Becker', to: 'Offsite crew', time: 'May 3', body: ['Lake wins on vibes. Breda wins on train time: 50 minutes vs. 1h40 plus a shuttle.'] },
  { id: 'e', from: me, to: 'Offsite crew', time: 'May 4', body: ['Budget is €7,200 per night all in, so €230 works if we drop the boat dinner. Happy either way.'] },
  { id: 'f', from: 'Lena Visser', to: 'Tom, Priya', time: 'May 6', mentionsMe: true, body: ['Priya, Wolfslaar can match the €212 if we sign by Friday. Want me to request the contract?'] }
])

const people = ref<Person[]>([...new Set(messages.value.map(m => m.from))].map(name => ({ name, on: true })))
const mentionsOnly = ref(false)
const open = ref(new Set<string>(['f']))
const draft = ref('')

const first = (name: string) => (name === me ? 'You' : name.split(' ')[0])
const countBy = (name: string) => messages.value.filter(m => m.from === name).length
const active = computed(() => new Set(people.value.filter(p => p.on).map(p => p.name)))
const shown = computed(() => messages.value.filter(m => active.value.has(m.from) && (!mentionsOnly.value || m.mentionsMe)))
const allOpen = computed(() => shown.value.length > 0 && shown.value.every(m => open.value.has(m.id)))

function toggle(id: string) {
  const next = new Set(open.value)
  if (!next.delete(id)) next.add(id)
  open.value = next
}

function toggleAll() {
  open.value = allOpen.value ? new Set() : new Set(shown.value.map(m => m.id))
}

let seq = 0
function send() {
  const text = draft.value.trim()
  if (!text) return
  const id = 'n' + ++seq
  messages.value.push({ id, from: me, to: 'Offsite crew', time: 'Now', body: [text] })
  open.value = new Set([...open.value, id])
  mentionsOnly.value = false
  draft.value = ''
}
</script>

<style scoped>
.pf { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.pf__card { display: grid; gap: 14px; max-width: 760px; margin-inline: auto; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); }
.pf__head { display: grid; gap: 2px; }
.pf__filters { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; }
.pf__people { display: flex; flex-wrap: wrap; gap: 6px; }
.pf__chip { display: inline-flex; align-items: center; gap: 6px; }
.pf__mention { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--mi-label2); }
.pf__bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-bottom: 4px; border-bottom: 1px solid var(--mi-sep); }

.pf__list { list-style: none; margin: 0; padding: 0; display: grid; }
.pf__msg + .pf__msg { border-top: 1px solid var(--mi-sep); }
.pf__row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 4px; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.pf__row:hover { background: var(--mi-fill4); }
.pf__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; border-radius: var(--mi-radius-m); }
.pf__row-text { display: grid; flex: 1; min-width: 0; gap: 2px; }
.pf__from { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 14.5px; font-weight: 600; }
.pf__preview, .pf__to { font-size: 13px; color: var(--mi-label2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pf__time { flex: none; font-size: 12.5px; color: var(--mi-label3); }
.pf__body { display: grid; gap: 8px; padding: 0 4px 16px; animation: pf-in var(--mi-dur-3) var(--mi-ease); }
.pf__body p { margin: 0; font-size: 14.5px; line-height: 1.6; }
@keyframes pf-in { from { opacity: 0; transform: translateY(-4px); } }
.pf__empty { margin: 0; padding: 12px 4px; font-size: 13px; color: var(--mi-label2); }
.pf__reply { padding-top: 4px; }
@container (min-width: 480px) { .pf__body { padding-left: 56px; } }
@media (prefers-reduced-motion: reduce) { .pf__body { animation: none; } }
</style>
