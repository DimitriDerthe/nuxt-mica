<template>
  <section class="ts" aria-labelledby="ts-title">
    <article class="ts__card">
      <header class="ts__head">
        <div class="ts__labels">
          <MiBadge tone="secondary" label="Events" />
          <MiBadge tone="neutral" variant="outline" label="Contract" />
        </div>
        <MiText id="ts-title" as="h2" variant="title2" weight="bold" balance>Venue contract for the Lisbon offsite</MiText>
        <div class="ts__people">
          <MiAvatarGroup :items="people" :max="4" :size="28" />
          <MiText variant="footnote" tone="label2">{{ people.length }} people · {{ mails.length }} messages</MiText>
        </div>
      </header>

      <!-- Pinned key points: the outcome of the thread, readable without opening it. -->
      <aside class="ts__keys" aria-labelledby="ts-keys-title">
        <MiText id="ts-keys-title" as="h3" variant="footnote" weight="semibold">Where this landed</MiText>
        <ul>
          <li>Palácio Verde holds 14 to 16 May for 42 people, deposit due 30 November.</li>
          <li>Catering moves to their in-house team; dietary list due 1 May.</li>
          <li>Open: cancellation clause 9.1, Joana is checking with legal.</li>
        </ul>
      </aside>

      <ol class="ts__mails" aria-label="Messages">
        <template v-for="(m, i) in mails" :key="m.id">
          <li v-if="i === 1 && stacked && hidden > 0" class="ts__stack-li">
            <button type="button" class="ts__stack" :aria-expanded="false" @click="stacked = false">
              <MiAvatarGroup :items="hiddenPeople" :max="3" :size="22" />
              <span>{{ hidden }} earlier {{ hidden === 1 ? 'reply' : 'replies' }}</span>
            </button>
          </li>
          <li v-if="!isHidden(i)" class="ts__mail" :class="{ 'is-open': open.has(m.id) }">
            <button type="button" class="ts__mail-head" :aria-expanded="open.has(m.id)" @click="toggle(m.id)">
              <MiAvatar :name="m.from" size="sm" :tone="m.from === me ? 'primary' : 'auto'" decorative />
              <span class="ts__mail-meta">
                <span class="ts__mail-top">
                  <span class="ts__from">{{ m.from === me ? 'You' : m.from }}</span>
                  <time class="ts__time">{{ m.time }}</time>
                </span>
                <span v-if="!open.has(m.id)" class="ts__snip">{{ m.body[0] }}</span>
                <span v-else class="ts__to">to {{ m.to }}</span>
              </span>
            </button>
            <div v-if="open.has(m.id)" class="ts__body">
              <p v-for="(p, j) in m.body" :key="j">{{ p }}</p>
              <MiAttachment v-if="m.file" class="ts__file" :name="m.file.name" :file-size="m.file.size" type="application/pdf" :removable="false" />
            </div>
          </li>
        </template>
      </ol>

      <form class="ts__reply" @submit.prevent="send">
        <MiInputGroup v-model="draft" multiline :rows="2" aria-label="Reply" :placeholder="mode === 'all' ? 'Reply to all 4…' : 'Reply to Joana…'">
          <template #block-start>
            <MiSegmented v-model="mode" label="Recipients" :options="[{ value: 'one', label: 'Reply' }, { value: 'all', label: 'Reply all' }]" />
          </template>
          <template #block-end>
            <div class="ts__reply-bar">
              <MiButton type="submit" size="small" :disabled="!draft.trim()">Send</MiButton>
            </div>
          </template>
        </MiInputGroup>
      </form>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Mail { id: string, from: string, to: string, time: string, body: string[], file?: { name: string, size: number } }

const me = 'Daniel Osei'
const people = [{ name: 'Joana Pires' }, { name: me }, { name: 'Akira Sato' }, { name: 'Rachel Klein' }]

// Sample thread; swap for your mail API.
const mails = ref<Mail[]>([
  { id: 'm1', from: 'Joana Pires', to: 'Daniel, Akira, Rachel', time: 'Oct 21, 10:14', body: ['Palácio Verde came back with a quote for 14 to 16 May: 42 people, two meeting rooms and the garden for the Thursday dinner.', 'Contract attached. They want a 30% deposit to hold the dates.'], file: { name: 'Palacio Verde contract draft.pdf', size: 884736 } },
  { id: 'm2', from: 'Akira Sato', to: 'Joana, Daniel, Rachel', time: 'Oct 21, 11:02', body: ['Budget-wise this fits if catering is included. Is it?'] },
  { id: 'm3', from: 'Joana Pires', to: 'Akira, Daniel, Rachel', time: 'Oct 21, 14:40', body: ['Only breakfast. Their in-house team quoted 48 € per person per day for lunch and dinner, which is still under our external caterer.'] },
  { id: 'm4', from: 'Rachel Klein', to: 'everyone', time: 'Oct 22, 09:15', body: ['Fine by finance. Please make sure the cancellation terms let us move the dates once without penalty.'] },
  { id: 'm5', from: me, to: 'everyone', time: 'Oct 22, 09:31', body: ['Agreed on in-house catering. Joana, can you push back on clause 9.1? It forfeits the full deposit inside 60 days.'] },
  { id: 'm6', from: 'Joana Pires', to: 'Daniel, Akira, Rachel', time: 'Yesterday, 17:52', body: ['They will hold the dates until 30 November while legal reviews 9.1. I will have an answer by Friday.', 'If anyone has dietary needs already, send them over and I will start the list.'] }
])

const open = ref(new Set<string>(['m1', 'm6']))
const stacked = ref(true)
const draft = ref('')
const mode = ref<string | number | null>('all')

// Everything between the first and the last message folds into the stack.
const hidden = computed(() => Math.max(0, mails.value.length - 2))
const hiddenPeople = computed(() => [...new Set(mails.value.slice(1, -1).map(m => m.from))].map(name => ({ name })))
const isHidden = (i: number) => stacked.value && i > 0 && i < mails.value.length - 1

function toggle(id: string) {
  const next = new Set(open.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  open.value = next
}

let seq = 0
function send() {
  const text = draft.value.trim()
  if (!text) return
  const id = 'r' + ++seq
  mails.value.push({ id, from: me, to: mode.value === 'all' ? 'everyone' : 'Joana', time: 'Just now', body: text.split(/\n{2,}/) })
  open.value = new Set([...open.value].filter((x): x is string => x === 'm1').concat(id))
  draft.value = ''
}
</script>

<style scoped>
.ts { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ts__card { display: grid; gap: 16px; max-width: 760px; margin-inline: auto; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); }
@container (min-width: 600px) { .ts__card { padding: 24px 28px; gap: 20px; } }
.ts__head { display: grid; gap: 10px; }
.ts__labels { display: flex; flex-wrap: wrap; gap: 6px; }
.ts__people { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }

.ts__keys { padding: 12px 16px; border-radius: var(--mi-radius-l); background: var(--mi-p-tint); color: var(--mi-p-text); }
.ts__keys ul { margin: 6px 0 0; padding-left: 18px; display: grid; gap: 4px; font-size: 13.5px; line-height: 1.45; color: var(--mi-label); }
.ts__keys li::marker { color: var(--mi-p); }

.ts__mails { list-style: none; margin: 0; padding: 0; display: grid; }
.ts__mail { border-top: 1px solid var(--mi-sep); }
.ts__mail-head { display: flex; align-items: flex-start; gap: 12px; width: 100%; padding: 12px 4px; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.ts__mail-head:focus-visible, .ts__stack:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; border-radius: var(--mi-radius-m); }
.ts__mail-meta { display: grid; gap: 2px; flex: 1; min-width: 0; }
.ts__mail-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.ts__from { font-size: 14.5px; font-weight: 600; }
.ts__time { flex: none; font-size: 12px; color: var(--mi-label3); }
.ts__snip { font-size: 13.5px; color: var(--mi-label2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ts__to { font-size: 12.5px; color: var(--mi-label3); }
.ts__body { display: grid; gap: 10px; padding: 0 4px 16px 56px; }
@container (max-width: 480px) { .ts__body { padding-left: 4px; } }
.ts__body p { margin: 0; font-size: 14.5px; line-height: 1.6; overflow-wrap: anywhere; }
.ts__file { max-width: 320px; }

/* Folded replies drawn as a little stack of paper edges. */
.ts__stack-li { position: relative; padding: 6px 0 14px; border-top: 1px solid var(--mi-sep); }
.ts__stack { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 44px; border: 1px solid var(--mi-sep2); border-radius: var(--mi-radius-m); background: var(--mi-card); color: var(--mi-label2); font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-ease); }
.ts__stack:hover { transform: translateY(-1px); color: var(--mi-label); }
.ts__stack-li::before, .ts__stack-li::after { content: ""; position: absolute; left: 0; right: 0; height: 44px; border: 1px solid var(--mi-sep2); border-radius: var(--mi-radius-m); background: var(--mi-page); }
.ts__stack-li::before { top: 14px; transform: scaleX(.93); opacity: .7; }
.ts__stack-li::after { top: 10px; transform: scaleX(.97); }

.ts__reply-bar { display: flex; justify-content: flex-end; width: 100%; }
</style>
