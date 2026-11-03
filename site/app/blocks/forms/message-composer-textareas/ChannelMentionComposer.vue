<template>
  <section class="cmc mi:@container/cmc mi:grid mi:content-start mi:gap-3 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="cmc-title">
    <header class="cmc__head mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-3 mi:pb-3 mi:border-b mi:border-b-sep">
      <MiText id="cmc-title" as="h2" variant="headline" weight="semibold"># launch-week</MiText>
      <MiText variant="caption" tone="label2">{{ members.length }} members · Type @ to mention, Enter to send</MiText>
    </header>

    <ol class="cmc__feed mi:grid mi:gap-3.5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Recent messages">
      <li v-for="m in feed" :key="m.id" class="cmc__msg mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-2.5">
        <MiAvatar :name="m.author" size="sm" tone="auto" decorative />
        <div class="cmc__msg-body mi:min-w-0">
          <p class="cmc__meta mi:mt-0 mi:mx-0 mi:mb-0.5 mi:text-[13px]"><strong>{{ m.author }}</strong> <span class="mi:[.cmc__meta_&]:text-[12px] mi:[.cmc__meta_&]:text-label3">{{ m.time }}</span></p>
          <p class="cmc__text mi:m-0 mi:text-[14.5px] mi:leading-[1.45] mi:wrap-anywhere">
            <template v-for="(part, i) in m.parts" :key="i">
              <mark v-if="part.mention" class="cmc__mention mi:py-0 mi:px-[3px] mi:rounded-[4px] mi:font-semibold mi:text-p-text mi:[background:var(--mi-p-tint)]">{{ part.text }}</mark><template v-else>{{ part.text }}</template>
            </template>
          </p>
        </div>
      </li>
    </ol>

    <div v-if="scheduled" class="cmc__scheduled mi:flex mi:items-center mi:gap-2 mi:py-2 mi:px-3 mi:rounded-md mi:text-label2 mi:[background:var(--mi-fill4)]" role="status">
      <MiIcon name="calendar" :size="16" />
      <MiText variant="footnote" class="cmc__scheduled-text mi:flex-1 mi:min-w-0">Scheduled for {{ scheduled.when }}: “{{ scheduled.text }}”</MiText>
      <MiButton variant="plain" size="small" @click="scheduled = null">Cancel</MiButton>
    </div>

    <div class="cmc__composer mi:relative mi:grid mi:gap-2">
      <!-- Mention suggestions: a listbox above the field while the text ends with @query. -->
      <ul v-if="suggestions.length" id="cmc-suggest" class="cmc__suggest mi:absolute mi:top-auto mi:right-0 mi:bottom-[calc(100%_+_6px)] mi:left-0 mi:z-2 mi:grid mi:gap-0.5 mi:m-0 mi:p-1.5 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-elev)] mi:shadow-2 mi:@[560px]/cmc:right-auto mi:@[560px]/cmc:w-80" role="listbox" aria-label="Mention a member">
        <li v-for="(p, i) in suggestions" :key="p.handle" role="option" :aria-selected="i === active">
          <button type="button" class="cmc__option mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:py-[7px] mi:px-2.5 mi:[border:0] mi:rounded-sm mi:[font:inherit] mi:text-start mi:text-inherit mi:[background:none] mi:cursor-pointer" :class="{ 'is-active': i === active }" tabindex="-1" @mousedown.prevent="insert(p)">
            <MiAvatar :name="p.name" size="xs" tone="auto" decorative />
            <span class="cmc__option-name mi:text-[14px] mi:font-semibold">{{ p.name }}</span>
            <span class="cmc__option-role mi:ms-auto mi:text-[12px] mi:text-label3">{{ p.role }}</span>
          </button>
        </li>
      </ul>

      <div class="cmc__field" @keydown="onKey">
        <MiTextarea
          v-model="draft" :rows="2" :max-rows="6" :maxlength="2000" aria-label="Message #launch-week"
          placeholder="Message #launch-week" :aria-controls="suggestions.length ? 'cmc-suggest' : undefined"
        />
      </div>

      <div class="cmc__bar mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
        <MiText variant="caption" tone="label3">Shift + Enter for a new line</MiText>
        <div class="cmc__send mi:flex mi:items-center mi:gap-2 mi:ms-auto">
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
.cmc__scheduled-text { overflow-wrap: anywhere; }
.cmc__suggest { animation: cmc-in var(--mi-dur-2) var(--mi-ease);
}
.cmc__option.is-active, .cmc__option:hover { background: var(--mi-p-tint); }
@keyframes cmc-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .cmc__suggest { animation: none; } }
</style>
