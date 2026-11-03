<template>
  <section class="mi:@container mi:flex mi:flex-col mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label mi:overflow-hidden" aria-labelledby="mat-title">
    <header class="mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
      <MiText id="mat-title" as="h2" variant="headline" weight="semibold"># release-train</MiText>
      <MiText variant="caption" tone="label2">Hover or focus a message for its actions</MiText>
    </header>

    <div v-if="pinned" class="mi:flex mi:items-center mi:gap-2 mi:pt-1.5 mi:pr-2 mi:pb-1.5 mi:pl-4 mi:text-p-text mi:[background:var(--mi-p-tint)]" role="status">
      <MiIcon name="bookmark" :size="15" filled />
      <MiText variant="footnote" :lines="1" class="mi:text-label! mi:flex-1 mi:min-w-0"><strong>{{ pinned.author }}:</strong> {{ pinned.text }}</MiText>
      <MiIconButton label="Unpin message" variant="plain" size="small" @click="pinnedId = ''"><MiIcon name="close" :size="14" /></MiIconButton>
    </div>

    <ol class="mi:grid mi:m-0 mi:py-2 mi:px-0 mi:[list-style:none]" aria-label="Messages">
      <li v-for="m in messages" :key="m.id" class="mi:group mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-1.5 mi:py-2.5 mi:px-4 mi:@[640px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[640px]:items-start" :class="active === m.id ? 'mi:[background:var(--mi-fill4)]' : ''" :data-active="active === m.id || undefined" @mouseenter="active = m.id" @focusin="active = m.id">
        <MiMessage :label="m.author">
          <template #avatar><MiAvatar :name="m.author" size="sm" tone="auto" decorative /></template>
          <template #header><span class="mi:text-[12px] mi:text-label2"><strong class="mi:text-label mi:mr-1 mi:font-semibold">{{ m.author }}</strong> {{ m.time }}</span></template>
          <MiBubble variant="muted">{{ m.text }}</MiBubble>
          <template v-if="m.reactions.length" #footer>
            <div class="mi:flex mi:flex-wrap mi:gap-1.5">
              <button
                v-for="r in m.reactions" :key="r.emoji" type="button" class="mi:[font:inherit] mi:text-[13px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:inline-flex mi:items-center mi:gap-1 mi:py-0.5 mi:px-2 mi:[border:0] mi:rounded-[999px] mi:cursor-pointer" :class="r.mine ? 'mi:[background:var(--mi-p-tint)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:text-p-text' : 'mi:[background:var(--mi-fill3)] mi:shadow-[inset_0_0_0_1px_transparent] mi:text-label'" :aria-pressed="r.mine"
                :aria-label="`${r.emoji} ${r.count}, ${r.mine ? 'remove' : 'add'} your reaction`" @click="react(m, r.emoji)"
              >
                {{ r.emoji }} <span class="mi:tabular-nums mi:font-semibold">{{ r.count }}</span>
              </button>
            </div>
          </template>
        </MiMessage>

        <!-- The toolbar itself: quick reactions, then message actions. Shown with opacity only, its space is always reserved. -->
        <div class="mi:hidden mi:group-data-[active]:flex mi:group-focus-within:flex mi:@[640px]:flex mi:group-data-[active]:opacity-100 mi:group-data-[active]:transform-[none] mi:group-focus-within:opacity-100 mi:group-focus-within:transform-[none] mi:flex-wrap mi:items-center mi:justify-self-end mi:gap-0.5 mi:p-[3px] mi:rounded-[12px] mi:[background:var(--mi-card)] mi:shadow-2 mi:opacity-0 mi:transform-[translateY(4px)] mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" role="toolbar" :aria-label="'Actions for message from ' + m.author">
          <button v-for="e in quick" :key="e" type="button" class="mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:p-0 mi:[border:0] mi:rounded-[8px] mi:[background:none] mi:text-[16px] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:hover:transform-[scale(1.18)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :aria-label="'React with ' + e" @click="react(m, e)">{{ e }}</button>
          <span class="mi:w-px mi:h-4.5 mi:mx-[3px] mi:[background:var(--mi-sep)]" aria-hidden="true" />
          <MiIconButton label="Reply" variant="plain" size="small" @click="replyTo = m.id"><MiIcon name="chat" :size="16" /></MiIconButton>
          <MiIconButton :label="pinnedId === m.id ? 'Unpin' : 'Pin to channel'" variant="plain" size="small" :pressed="pinnedId === m.id" @click="pinnedId = pinnedId === m.id ? '' : m.id">
            <MiIcon name="bookmark" :size="16" :filled="pinnedId === m.id" />
          </MiIconButton>
          <MiCopyButton :value="m.text" icon-only variant="ghost" label="Copy text" />
          <MiMenu :items="moreItems" aria-label="More actions" placement="bottom-end" @select="more(m.id, $event.value)">
            <template #trigger="{ props }">
              <MiIconButton v-bind="props" label="More actions" variant="plain" size="small"><MiIcon name="more" :size="16" /></MiIconButton>
            </template>
          </MiMenu>
        </div>
      </li>
    </ol>

    <form class="mi:grid mi:gap-1.5 mi:pt-3 mi:px-4 mi:pb-3.5 mi:border-t mi:border-t-sep" @submit.prevent="send">
      <div v-if="replying" class="mi:flex mi:items-center mi:gap-2 mi:pt-1 mi:pr-1 mi:pb-1 mi:pl-2.5 mi:border-l-3 mi:border-l-p mi:rounded-[4px] mi:[background:var(--mi-fill4)]">
        <MiText variant="caption" tone="label2" :lines="1" class="mi:flex-1 mi:min-w-0">Replying to <strong>{{ replying.author }}</strong>: {{ replying.text }}</MiText>
        <MiIconButton label="Cancel reply" variant="plain" size="small" @click="replyTo = ''"><MiIcon name="close" :size="14" /></MiIconButton>
      </div>
      <MiInputGroup v-model="draft" aria-label="Message #release-train" placeholder="Message #release-train">
        <template #inline-end>
          <MiIconButton type="submit" label="Send" size="small" :disabled="!draft.trim()"><MiIcon name="arrow-up" :size="16" /></MiIconButton>
        </template>
      </MiInputGroup>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Reaction { emoji: string, count: number, mine: boolean }
interface Msg { id: string, author: string, time: string, text: string, reactions: Reaction[] }

const quick = ['👍', '🎉', '👀']
const moreItems = [
  { value: 'unread', label: 'Mark as unread' },
  { value: 'thread', label: 'Open in thread' },
  { separator: true },
  { value: 'hide', label: 'Hide message', destructive: true }
]

const messages = ref<Msg[]>([
  { id: 'm1', author: 'Isabel Duarte', time: '09:12', text: 'Release 4.18 is cut. Changelog draft is in the release doc, please add anything I missed by noon.', reactions: [{ emoji: '👍', count: 4, mine: false }] },
  { id: 'm2', author: 'Kwame Asante', time: '09:20', text: 'Migrations ran clean on staging. One slow index on invoices (40 s), fine for the maintenance window.', reactions: [] },
  { id: 'm3', author: 'Yuki Tanaka', time: '09:31', text: 'iOS build is waiting on review. If it is not through by 15:00 we ship web first and follow tomorrow.', reactions: [{ emoji: '👀', count: 2, mine: true }] }
])
const active = ref('m2')
const pinnedId = ref('m1')
const replyTo = ref('')
const draft = ref('')

const pinned = computed(() => messages.value.find(m => m.id === pinnedId.value))
const replying = computed(() => messages.value.find(m => m.id === replyTo.value))

function react(m: Msg, emoji: string) {
  const r = m.reactions.find(x => x.emoji === emoji)
  if (!r) { m.reactions.push({ emoji, count: 1, mine: true }); return }
  r.count += r.mine ? -1 : 1
  r.mine = !r.mine
  if (!r.count) m.reactions = m.reactions.filter(x => x !== r)
}
function more(id: string, action: string | number | undefined) {
  if (action === 'hide') messages.value = messages.value.filter(m => m.id !== id)
}
function send() {
  if (!draft.value.trim()) return
  const id = 'm' + (messages.value.length + 10)
  const prefix = replying.value ? `↪ ${replying.value.author.split(' ')[0]}: ` : ''
  messages.value.push({ id, author: 'You', time: '09:34', text: prefix + draft.value.trim(), reactions: [] })
  draft.value = ''; replyTo.value = ''; active.value = id
}
</script>
