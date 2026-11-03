<template>
  <section class="cmc" aria-labelledby="cmc-title">
    <header class="cmc__head">
      <MiText id="cmc-title" as="h2" variant="headline" weight="semibold"># launch-week</MiText>
      <MiText variant="caption" tone="label2">{{ members.length }} members · Type @ to mention, Enter to send</MiText>
    </header>

    <ol class="cmc__feed" aria-label="Recent messages">
      <li v-for="m in feed" :key="m.id" class="cmc__msg">
        <MiAvatar :name="m.author" size="sm" tone="auto" decorative />
        <div class="cmc__msg-body">
          <p class="cmc__meta"><strong>{{ m.author }}</strong> <span>{{ m.time }}</span></p>
          <p class="cmc__text">
            <template v-for="(part, i) in m.parts" :key="i">
              <mark v-if="part.mention" class="cmc__mention">{{ part.text }}</mark><template v-else>{{ part.text }}</template>
            </template>
          </p>
        </div>
      </li>
    </ol>

    <div v-if="scheduled" class="cmc__scheduled" role="status">
      <MiIcon name="calendar" :size="16" />
      <MiText variant="footnote" class="cmc__scheduled-text">Scheduled for {{ scheduled.when }}: “{{ scheduled.text }}”</MiText>
      <MiButton variant="plain" size="small" @click="scheduled = null">Cancel</MiButton>
    </div>

    <div class="cmc__composer">
      <!-- Mention suggestions: a listbox above the field while the text ends with @query. -->
      <ul v-if="suggestions.length" id="cmc-suggest" class="cmc__suggest" role="listbox" aria-label="Mention a member">
        <li v-for="(p, i) in suggestions" :key="p.handle" role="option" :aria-selected="i === active">
          <button type="button" class="cmc__option" :class="{ 'is-active': i === active }" tabindex="-1" @mousedown.prevent="insert(p)">
            <MiAvatar :name="p.name" size="xs" tone="auto" decorative />
            <span class="cmc__option-name">{{ p.name }}</span>
            <span class="cmc__option-role">{{ p.role }}</span>
          </button>
        </li>
      </ul>

      <div class="cmc__field" @keydown="onKey">
        <MiTextarea
          v-model="draft" :rows="2" :max-rows="6" :maxlength="2000" aria-label="Message #launch-week"
          placeholder="Message #launch-week" :aria-controls="suggestions.length ? 'cmc-suggest' : undefined"
        />
      </div>

      <div class="cmc__bar">
        <MiText variant="caption" tone="label3">Shift + Enter for a new line</MiText>
        <div class="cmc__send">
          <MiMenu :items="laterSlots" aria-label="Schedule message" placement="top-end" :disabled="!canSend" @select="schedule">
            <template #trigger="{ props }">
              <MiIconButton v-bind="props" label="Schedule message" variant="gray" size="regular" :disabled="!canSend">
                <MiIcon name="calendar" :size="18" />
              </MiIconButton>
            </template>
          </MiMenu>
          <MiButton :disabled="!canSend" @click="send">
            <template #trailing><MiIcon name="arrow-up" :size="16" /></template>
            Send
          </MiButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Member { handle: string, name: string, role: string }
interface Part { text: string, mention: boolean }
interface Message { id: number, author: string, time: string, parts: Part[] }
interface Slot { value?: string | number, label?: string }

const members: Member[] = [
  { handle: 'amara', name: 'Amara Osei', role: 'Design lead' },
  { handle: 'ben', name: 'Ben Hartley', role: 'iOS' },
  { handle: 'chloe', name: 'Chloé Martin', role: 'Marketing' },
  { handle: 'diego', name: 'Diego Ramos', role: 'Backend' },
  { handle: 'hana', name: 'Hana Sato', role: 'Support' }
]
const names = members.map(m => m.name)

// Split a message so @mentions of known members render highlighted as plain text nodes.
function toParts(text: string): Part[] {
  const re = new RegExp(`(@(?:${names.join('|')}))`, 'g')
  return text.split(re).filter(Boolean).map(t => ({ text: t, mention: t.startsWith('@') && names.includes(t.slice(1)) }))
}

let nextId = 3
const feed = ref<Message[]>([
  { id: 1, author: 'Amara Osei', time: '9:12', parts: toParts('Final App Store screenshots are in the shared folder. @Ben Hartley can you check the 6.7" set?') },
  { id: 2, author: 'Ben Hartley', time: '9:20', parts: toParts('On it. Build 4.18 goes to review at noon.') }
])
const draft = ref('')
const active = ref(0)
const scheduled = ref<{ when: string, text: string } | null>(null)
const laterSlots: Slot[] = [
  { value: 'Today, 2:00 PM', label: 'Today, 2:00 PM' },
  { value: 'Tomorrow, 9:00 AM', label: 'Tomorrow, 9:00 AM' },
  { value: 'Monday, 9:00 AM', label: 'Monday, 9:00 AM' }
]

const query = computed(() => draft.value.match(/(?:^|\s)@(\w*)$/)?.[1]?.toLowerCase() ?? null)
const suggestions = computed(() => query.value === null
  ? []
  : members.filter(m => m.handle.startsWith(query.value ?? '') || m.name.toLowerCase().includes(query.value ?? '')).slice(0, 4))
const canSend = computed(() => draft.value.trim().length > 0)

function insert(p: Member) {
  draft.value = draft.value.replace(/@\w*$/, `@${p.name} `)
  active.value = 0
}
function onKey(e: KeyboardEvent) {
  const n = suggestions.value.length
  if (n && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault()
    active.value = (active.value + (e.key === 'ArrowDown' ? 1 : n - 1)) % n
  } else if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    const pick = suggestions.value[Math.min(active.value, n - 1)]
    if (pick) insert(pick)
    else send()
  }
}
function send() {
  if (!canSend.value) return
  feed.value.push({ id: nextId++, author: 'Chloé Martin', time: 'now', parts: toParts(draft.value.trim()) })
  draft.value = ''
}
function schedule(item: Slot) {
  scheduled.value = { when: String(item.label), text: draft.value.trim() }
  draft.value = ''
}
</script>

<style scoped>
.cmc { container: cmc / inline-size; display: grid; align-content: start; gap: 12px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.cmc__head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; padding-bottom: 12px; border-bottom: 1px solid var(--mi-sep); }

.cmc__feed { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
.cmc__msg { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; }
.cmc__msg-body { min-width: 0; }
.cmc__meta { margin: 0 0 2px; font-size: 13px; }
.cmc__meta span { font-size: 12px; color: var(--mi-label3); }
.cmc__text { margin: 0; font-size: 14.5px; line-height: 1.45; overflow-wrap: anywhere; }
.cmc__mention { padding: 0 3px; border-radius: 4px; font-weight: 600; color: var(--mi-p-text); background: var(--mi-p-tint); }

.cmc__scheduled { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--mi-radius-m); color: var(--mi-label2); background: var(--mi-fill4); }
.cmc__scheduled-text { flex: 1; min-width: 0; overflow-wrap: anywhere; }

.cmc__composer { position: relative; display: grid; gap: 8px; }
.cmc__suggest {
  position: absolute; inset: auto 0 calc(100% + 6px) 0; z-index: 2; display: grid; gap: 2px; margin: 0; padding: 6px; list-style: none;
  border-radius: var(--mi-radius-l); background: var(--mi-elev); box-shadow: var(--mi-sh2); animation: cmc-in var(--mi-dur-2) var(--mi-ease);
}
@container cmc (min-width: 560px) { .cmc__suggest { right: auto; width: 320px; } }
.cmc__option { display: flex; align-items: center; gap: 10px; width: 100%; padding: 7px 10px; border: 0; border-radius: var(--mi-radius-s); font: inherit; text-align: start; color: inherit; background: none; cursor: pointer; }
.cmc__option.is-active, .cmc__option:hover { background: var(--mi-p-tint); }
.cmc__option-name { font-size: 14px; font-weight: 600; }
.cmc__option-role { margin-inline-start: auto; font-size: 12px; color: var(--mi-label3); }

.cmc__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.cmc__send { display: flex; align-items: center; gap: 8px; margin-inline-start: auto; }
@keyframes cmc-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .cmc__suggest { animation: none; } }
</style>
