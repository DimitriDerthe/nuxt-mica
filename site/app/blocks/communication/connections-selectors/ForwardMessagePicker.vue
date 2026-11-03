<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="fw-title">
    <div class="mi:grid mi:gap-3.5 mi:max-w-130 mi:mx-auto mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-2">
      <header class="mi:grid mi:gap-0.5">
        <MiText id="fw-title" as="h2" variant="title3" weight="semibold">Forward message</MiText>
        <MiText variant="footnote" tone="label2">Send to up to {{ limit }} conversations at once.</MiText>
      </header>

      <figure class="mi:flex mi:gap-2.5 mi:m-0 mi:py-3 mi:px-3.5 mi:rounded-lg mi:bg-fill4 mi:border-l-3 mi:border-l-p">
        <MiAvatar name="Rania Aziz" size="xs" tone="teal" decorative />
        <div class="mi:grid mi:gap-1 mi:min-w-0">
          <figcaption class="mi:text-[12px] mi:font-semibold mi:text-label2">Rania Aziz · #ops-berlin · 08:41</figcaption>
          <blockquote class="mi:m-0 mi:text-[14px] mi:leading-[1.45] mi:[display:-webkit-box] mi:[-webkit-line-clamp:3] mi:[-webkit-box-orient:vertical] mi:overflow-hidden">Loading dock B is closed Thursday for resurfacing. All inbound pallets go to dock D from 06:00, drivers check in at gate 3.</blockquote>
        </div>
      </figure>

      <MiSearch v-model="query" placeholder="Search people and channels" :cancelable="false" aria-label="Search conversations" />

      <div v-if="picked.length" class="mi:flex mi:flex-wrap mi:gap-1.5" aria-label="Selected conversations">
        <MiChip
          v-for="c in picked" :key="c.id" :label="c.name" removable size="small"
          :remove-label="'Remove ' + c.name" @remove="toggle(c.id)"
        />
      </div>

      <div class="mi:grid mi:gap-0.5 mi:max-h-67.5 mi:overflow-y-auto mi:-mx-2 mi:px-2" role="group" aria-labelledby="fw-recent">
        <h3 id="fw-recent" class="mi:mt-0 mi:mx-0 mi:mb-1 mi:text-[11px] mi:font-semibold mi:tracking-[.06em] mi:uppercase mi:text-label3">Recent</h3>
        <MiCheckbox
          v-for="c in shown" :key="c.id" class="mi:py-1.5! mi:px-1! mi:rounded-md!" :model-value="selected.includes(c.id)"
          :disabled="full && !selected.includes(c.id)" @update:model-value="toggle(c.id)"
        >
          <span class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
            <MiAvatar :name="c.name" :initials="c.channel ? '#' : undefined" size="sm" :shape="c.channel ? 'square' : 'circle'" :tone="c.channel ? 'neutral' : 'auto'" decorative />
            <span class="mi:grid mi:min-w-0">
              <span class="mi:text-[14.5px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ c.name }}</span>
              <span class="mi:text-[12.5px] mi:text-label3 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ c.meta }}</span>
            </span>
          </span>
        </MiCheckbox>
        <p v-if="!shown.length" class="mi:m-0 mi:py-3 mi:px-1 mi:text-[13px] mi:text-label2">No conversation matches “{{ query }}”.</p>
      </div>

      <form class="mi:grid mi:gap-2.5 mi:grid-cols-[minmax(0,_1fr)] mi:pt-3.5 mi:border-t mi:border-t-sep mi:@[440px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[440px]:items-center" @submit.prevent="send">
        <MiInput v-model="note" aria-label="Add a note" placeholder="Add a note (optional)" />
        <MiButton type="submit" :disabled="!selected.length">{{ selected.length ? 'Send to ' + selected.length : 'Send' }}</MiButton>
      </form>
      <p class="mi:-mt-1 mi:mx-0 mi:mb-0 mi:min-h-4.5 mi:text-[13px] mi:text-green-t" role="status">{{ status }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Conversation { id: string, name: string, meta: string, channel?: boolean }

const limit = 5

// Sample recent conversations; swap for your directory API.
const conversations: Conversation[] = [
  { id: 'logistics', name: 'logistics-eu', meta: '48 members · active now', channel: true },
  { id: 'jonas', name: 'Jonas Weber', meta: 'Warehouse lead · Berlin' },
  { id: 'drivers', name: 'drivers-north', meta: '112 members', channel: true },
  { id: 'aiko', name: 'Aiko Mori', meta: 'Carrier relations' },
  { id: 'felipe', name: 'Felipe Santos', meta: 'Night shift supervisor' },
  { id: 'facilities', name: 'facilities', meta: '17 members', channel: true },
  { id: 'greta', name: 'Greta Nilsson', meta: 'Inbound planning · away' }
]

const query = ref('')
const note = ref('')
const selected = ref<string[]>(['jonas'])
const status = ref('')

const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? conversations.filter(c => c.name.toLowerCase().includes(q) || c.meta.toLowerCase().includes(q)) : conversations
})
const picked = computed(() => conversations.filter(c => selected.value.includes(c.id)))
const full = computed(() => selected.value.length >= limit)

function toggle(id: string) {
  status.value = ''
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : full.value ? selected.value : [...selected.value, id]
}

function send() {
  if (!selected.value.length) return
  const names = picked.value.map(c => (c.channel ? '#' : '') + c.name).join(', ')
  status.value = `Forwarded to ${names}${note.value.trim() ? ' with your note' : ''}.`
  selected.value = []
  note.value = ''
}
</script>
