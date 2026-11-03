<template>
  <section class="fw" aria-labelledby="fw-title">
    <div class="fw__card">
      <header class="fw__head">
        <MiText id="fw-title" as="h2" variant="title3" weight="semibold">Forward message</MiText>
        <MiText variant="footnote" tone="label2">Send to up to {{ limit }} conversations at once.</MiText>
      </header>

      <figure class="fw__quote">
        <MiAvatar name="Rania Aziz" size="xs" tone="teal" decorative />
        <div class="fw__quote-body">
          <figcaption class="fw__quote-who">Rania Aziz · #ops-berlin · 08:41</figcaption>
          <blockquote class="fw__quote-text">Loading dock B is closed Thursday for resurfacing. All inbound pallets go to dock D from 06:00, drivers check in at gate 3.</blockquote>
        </div>
      </figure>

      <MiSearch v-model="query" placeholder="Search people and channels" :cancelable="false" aria-label="Search conversations" />

      <div v-if="picked.length" class="fw__picked" aria-label="Selected conversations">
        <MiChip
          v-for="c in picked" :key="c.id" :label="c.name" removable size="small"
          :remove-label="'Remove ' + c.name" @remove="toggle(c.id)"
        />
      </div>

      <div class="fw__list" role="group" aria-labelledby="fw-recent">
        <h3 id="fw-recent" class="fw__sec">Recent</h3>
        <MiCheckbox
          v-for="c in shown" :key="c.id" class="fw__row" :model-value="selected.includes(c.id)"
          :disabled="full && !selected.includes(c.id)" @update:model-value="toggle(c.id)"
        >
          <span class="fw__who">
            <MiAvatar :name="c.name" :initials="c.channel ? '#' : undefined" size="sm" :shape="c.channel ? 'square' : 'circle'" :tone="c.channel ? 'neutral' : 'auto'" decorative />
            <span class="fw__who-text">
              <span class="fw__name">{{ c.name }}</span>
              <span class="fw__meta">{{ c.meta }}</span>
            </span>
          </span>
        </MiCheckbox>
        <p v-if="!shown.length" class="fw__empty">No conversation matches “{{ query }}”.</p>
      </div>

      <form class="fw__foot" @submit.prevent="send">
        <MiInput v-model="note" aria-label="Add a note" placeholder="Add a note (optional)" />
        <MiButton type="submit" :disabled="!selected.length">{{ selected.length ? 'Send to ' + selected.length : 'Send' }}</MiButton>
      </form>
      <p class="fw__status" role="status">{{ status }}</p>
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

<style scoped>
.fw { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.fw__card { display: grid; gap: 14px; max-width: 520px; margin-inline: auto; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); }
.fw__head { display: grid; gap: 2px; }

.fw__quote { display: flex; gap: 10px; margin: 0; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); border-left: 3px solid var(--mi-p); }
.fw__quote-body { display: grid; gap: 4px; min-width: 0; }
.fw__quote-who { font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.fw__quote-text { margin: 0; font-size: 14px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.fw__picked { display: flex; flex-wrap: wrap; gap: 6px; }
.fw__list { display: grid; gap: 2px; max-height: 270px; overflow-y: auto; margin-inline: -8px; padding-inline: 8px; }
.fw__sec { margin: 0 0 4px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-label3); }
.fw__row { padding: 6px 4px; border-radius: var(--mi-radius-m); }
.fw__who { display: flex; align-items: center; gap: 10px; min-width: 0; }
.fw__who-text { display: grid; min-width: 0; }
.fw__name { font-size: 14.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw__meta { font-size: 12.5px; color: var(--mi-label3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw__empty { margin: 0; padding: 12px 4px; font-size: 13px; color: var(--mi-label2); }

.fw__foot { display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr); padding-top: 14px; border-top: 1px solid var(--mi-sep); }
@container (min-width: 440px) { .fw__foot { grid-template-columns: minmax(0, 1fr) auto; align-items: center; } }
.fw__status { margin: -4px 0 0; min-height: 18px; font-size: 13px; color: var(--mi-green-t); }
</style>
