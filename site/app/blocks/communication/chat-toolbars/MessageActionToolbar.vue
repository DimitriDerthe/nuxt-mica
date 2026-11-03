<template>
  <section class="mat" aria-labelledby="mat-title">
    <header class="mat__head">
      <MiText id="mat-title" as="h2" variant="headline" weight="semibold"># release-train</MiText>
      <MiText variant="caption" tone="label2">Hover or focus a message for its actions</MiText>
    </header>

    <div v-if="pinned" class="mat__pin" role="status">
      <MiIcon name="bookmark" :size="15" filled />
      <MiText variant="footnote" :lines="1" class="mat__pin-text"><strong>{{ pinned.author }}:</strong> {{ pinned.text }}</MiText>
      <MiIconButton label="Unpin message" variant="plain" size="small" @click="pinnedId = ''"><MiIcon name="close" :size="14" /></MiIconButton>
    </div>

    <ol class="mat__list" aria-label="Messages">
      <li v-for="m in messages" :key="m.id" class="mat__row" :class="{ 'is-active': active === m.id }" @mouseenter="active = m.id" @focusin="active = m.id">
        <MiMessage :label="m.author">
          <template #avatar><MiAvatar :name="m.author" size="sm" tone="auto" decorative /></template>
          <template #header><span class="mat__meta"><strong>{{ m.author }}</strong> {{ m.time }}</span></template>
          <MiBubble variant="muted">{{ m.text }}</MiBubble>
          <template v-if="m.reactions.length" #footer>
            <div class="mat__reactions">
              <button
                v-for="r in m.reactions" :key="r.emoji" type="button" class="mat__reaction" :class="{ 'is-mine': r.mine }" :aria-pressed="r.mine"
                :aria-label="`${r.emoji} ${r.count}, ${r.mine ? 'remove' : 'add'} your reaction`" @click="react(m, r.emoji)"
              >
                {{ r.emoji }} <span>{{ r.count }}</span>
              </button>
            </div>
          </template>
        </MiMessage>

        <!-- The toolbar itself: quick reactions, then message actions. Shown with opacity only, its space is always reserved. -->
        <div class="mat__bar" role="toolbar" :aria-label="'Actions for message from ' + m.author">
          <button v-for="e in quick" :key="e" type="button" class="mat__emoji" :aria-label="'React with ' + e" @click="react(m, e)">{{ e }}</button>
          <span class="mat__sep" aria-hidden="true" />
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

    <form class="mat__composer" @submit.prevent="send">
      <div v-if="replying" class="mat__reply">
        <MiText variant="caption" tone="label2" :lines="1" class="mat__reply-text">Replying to <strong>{{ replying.author }}</strong>: {{ replying.text }}</MiText>
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

<style scoped>
.mat { container-type: inline-size; display: flex; flex-direction: column; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); overflow: hidden; }
.mat__head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); }
.mat__pin { display: flex; align-items: center; gap: 8px; padding: 6px 8px 6px 16px; color: var(--mi-p-text); background: var(--mi-p-tint); }
.mat__pin-text { flex: 1; min-width: 0; color: var(--mi-label); }

.mat__list { display: grid; margin: 0; padding: 8px 0; list-style: none; }
.mat__row { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; padding: 10px 16px; }
.mat__row.is-active { background: var(--mi-fill4); }
/* Phones: only the active row shows its toolbar, so idle rows keep no empty band. Wider: every bar keeps its slot. */
.mat__row:not(.is-active):not(:focus-within) .mat__bar { display: none; }
@container (min-width: 640px) {
  .mat__row { grid-template-columns: minmax(0, 1fr) auto; align-items: start; }
  .mat__row:not(.is-active):not(:focus-within) .mat__bar { display: flex; }
}
.mat__meta { font-size: 12px; color: var(--mi-label2); }
.mat__meta strong { margin-right: 4px; color: var(--mi-label); font-weight: 600; }

.mat__bar {
  display: flex; flex-wrap: wrap; align-items: center; justify-self: end; gap: 2px; padding: 3px; border-radius: 12px; background: var(--mi-card); box-shadow: var(--mi-sh2);
  opacity: 0; transform: translateY(4px); transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease);
}
.mat__row.is-active .mat__bar, .mat__row:focus-within .mat__bar { opacity: 1; transform: none; }
.mat__emoji { display: grid; place-items: center; width: 30px; height: 30px; padding: 0; border: 0; border-radius: 8px; background: none; font-size: 16px; cursor: pointer; transition: transform var(--mi-dur-1) var(--mi-ease); }
.mat__emoji:hover { transform: scale(1.18); }
.mat__emoji:focus-visible, .mat__reaction:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.mat__sep { width: 1px; height: 18px; margin-inline: 3px; background: var(--mi-sep); }

.mat__reactions { display: flex; flex-wrap: wrap; gap: 6px; }
.mat__reaction { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; background: var(--mi-fill3); color: var(--mi-label); cursor: pointer; box-shadow: inset 0 0 0 1px transparent; }
.mat__reaction.is-mine { background: var(--mi-p-tint); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-p) 45%, transparent); color: var(--mi-p-text); }
.mat__reaction span { font-variant-numeric: tabular-nums; font-weight: 600; }

.mat__composer { display: grid; gap: 6px; padding: 12px 16px 14px; border-top: 1px solid var(--mi-sep); }
.mat__reply { display: flex; align-items: center; gap: 8px; padding: 4px 4px 4px 10px; border-left: 3px solid var(--mi-p); border-radius: 4px; background: var(--mi-fill4); }
.mat__reply-text { flex: 1; min-width: 0; }
</style>
