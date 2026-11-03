<template>
  <section class="pf mi:@container mi:font-mi mi:text-label" aria-labelledby="pf-title">
    <div class="pf__card mi:grid mi:gap-3.5 mi:max-w-190 mi:mx-auto mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-2">
      <header class="pf__head mi:grid mi:gap-0.5">
        <MiText id="pf-title" as="h2" variant="title3" weight="semibold">Venue shortlist for the June offsite</MiText>
        <MiText variant="footnote" tone="label2">{{ messages.length }} messages · {{ people.length }} people · started May 2</MiText>
      </header>

      <div class="pf__filters mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4">
        <div class="pf__people mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Show messages from">
          <MiChip
            v-for="p in people" :key="p.name" v-model="p.on" selectable size="small" tone="neutral"
          >
            <span class="pf__chip mi:inline-flex mi:items-center mi:gap-1.5"><MiAvatar :name="p.name" size="xs" tone="auto" decorative />{{ first(p.name) }} · {{ countBy(p.name) }}</span>
          </MiChip>
        </div>
        <div class="pf__mention mi:inline-flex mi:items-center mi:gap-2 mi:text-[13.5px] mi:text-label2">
          <MiSwitch v-model="mentionsOnly" size="compact" aria-labelledby="pf-mention-label" />
          <span id="pf-mention-label">Mentions me</span>
        </div>
      </div>

      <div class="pf__bar mi:flex mi:items-center mi:justify-between mi:gap-2 mi:pb-1 mi:border-b mi:border-b-sep">
        <MiText variant="caption" tone="label2">Showing {{ shown.length }} of {{ messages.length }}</MiText>
        <MiButton variant="plain" size="small" @click="toggleAll">{{ allOpen ? 'Collapse all' : 'Expand all' }}</MiButton>
      </div>

      <ol class="pf__list mi:[list-style:none] mi:m-0 mi:p-0 mi:grid">
        <li v-for="m in shown" :key="m.id" class="pf__msg mi:[.pf__msg+&]:border-t mi:[.pf__msg+&]:border-t-sep" :class="{ 'is-open': open.has(m.id) }">
          <button type="button" class="pf__row mi:flex mi:items-center mi:gap-3 mi:w-full mi:py-3 mi:px-1 mi:[border:0] mi:bg-transparent mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:hover:bg-fill4 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:focus-visible:rounded-md" :aria-expanded="open.has(m.id)" :aria-controls="'pf-body-' + m.id" @click="toggle(m.id)">
            <MiAvatar :name="m.from" size="sm" :tone="m.from === me ? 'primary' : 'auto'" decorative />
            <span class="pf__row-text mi:grid mi:flex-1 mi:min-w-0 mi:gap-0.5">
              <span class="pf__from mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:text-[14.5px] mi:font-semibold">{{ m.from === me ? 'You' : m.from }}<MiBadge v-if="m.mentionsMe" tone="primary" label="Mentions you" /></span>
              <span v-if="!open.has(m.id)" class="pf__preview mi:text-[13px] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ m.body[0] }}</span>
              <span v-else class="pf__to mi:text-[13px] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">to {{ m.to }}</span>
            </span>
            <time class="pf__time mi:flex-[none] mi:text-[12.5px] mi:text-label3">{{ m.time }}</time>
          </button>
          <div v-if="open.has(m.id)" :id="'pf-body-' + m.id" class="pf__body mi:grid mi:gap-2 mi:pt-0 mi:px-1 mi:pb-4 mi:@[480px]:pl-14">
            <p class="mi:[.pf__body_&]:m-0 mi:[.pf__body_&]:text-[14.5px] mi:[.pf__body_&]:leading-[1.6]" v-for="(line, i) in m.body" :key="i">{{ line }}</p>
          </div>
        </li>
      </ol>
      <p v-if="!shown.length" class="pf__empty mi:m-0 mi:py-3 mi:px-1 mi:text-[13px] mi:text-label2">No messages match these filters.</p>

      <form class="pf__reply mi:pt-1" @submit.prevent="send">
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
.pf__body { animation: pf-in var(--mi-dur-3) var(--mi-ease); }
@keyframes pf-in { from { opacity: 0; transform: translateY(-4px); } }
@media (prefers-reduced-motion: reduce) { .pf__body { animation: none; } }
</style>
