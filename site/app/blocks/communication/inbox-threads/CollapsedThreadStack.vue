<template>
  <section class="ts mi:@container mi:font-mi mi:text-label" aria-labelledby="ts-title">
    <article class="ts__card mi:grid mi:gap-4 mi:max-w-190 mi:mx-auto mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-2 mi:@[600px]:py-6 mi:@[600px]:px-7 mi:@[600px]:gap-5">
      <header class="ts__head mi:grid mi:gap-2.5">
        <div class="ts__labels mi:flex mi:flex-wrap mi:gap-1.5">
          <MiBadge tone="secondary" label="Events" />
          <MiBadge tone="neutral" variant="outline" label="Contract" />
        </div>
        <MiText id="ts-title" as="h2" variant="title2" weight="bold" balance>Venue contract for the Lisbon offsite</MiText>
        <div class="ts__people mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
          <MiAvatarGroup :items="people" :max="4" :size="28" />
          <MiText variant="footnote" tone="label2">{{ people.length }} people · {{ mails.length }} messages</MiText>
        </div>
      </header>

      <!-- Pinned key points: the outcome of the thread, readable without opening it. -->
      <aside class="ts__keys mi:py-3 mi:px-4 mi:rounded-lg mi:bg-p-tint mi:text-p-text" aria-labelledby="ts-keys-title">
        <MiText class="mi:[.ts__keys_ul&]:pl-4.5 mi:[.ts__keys_ul&]:gap-1" id="ts-keys-title" as="h3" variant="footnote" weight="semibold">Where this landed</MiText>
        <ul class="mi:[.ts__keys_ul&]:pl-4.5 mi:[.ts__keys_ul&]:gap-1">
          <li>Palácio Verde holds 14 to 16 May for 42 people, deposit due 30 November.</li>
          <li>Catering moves to their in-house team; dietary list due 1 May.</li>
          <li>Open: cancellation clause 9.1, Joana is checking with legal.</li>
        </ul>
      </aside>

      <ol class="ts__mails mi:[list-style:none] mi:m-0 mi:p-0 mi:grid" aria-label="Messages">
        <template v-for="(m, i) in mails" :key="m.id">
          <li v-if="i === 1 && stacked && hidden > 0" class="ts__stack-li mi:relative mi:pt-1.5 mi:px-0 mi:pb-3.5 mi:border-t mi:border-t-sep mi:before:content-[''] mi:before:absolute mi:before:left-0 mi:before:right-0 mi:before:h-11 mi:before:border mi:before:border-sep2 mi:before:rounded-md mi:before:bg-page mi:after:content-[''] mi:after:absolute mi:after:left-0 mi:after:right-0 mi:after:h-11 mi:after:border mi:after:border-sep2 mi:after:rounded-md mi:after:bg-page mi:before:top-3.5 mi:before:transform-[scaleX(.93)] mi:before:opacity-70 mi:after:top-2.5 mi:after:transform-[scaleX(.97)]">
            <button type="button" class="ts__stack mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:focus-visible:rounded-md mi:relative mi:z-1 mi:flex mi:items-center mi:justify-center mi:gap-2.5 mi:w-full mi:h-11 mi:border mi:border-sep2 mi:rounded-md mi:bg-card mi:text-label2 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:hover:text-label" :aria-expanded="false" @click="stacked = false">
              <MiAvatarGroup :items="hiddenPeople" :max="3" :size="22" />
              <span>{{ hidden }} earlier {{ hidden === 1 ? 'reply' : 'replies' }}</span>
            </button>
          </li>
          <li v-if="!isHidden(i)" class="ts__mail mi:border-t mi:border-t-sep" :class="{ 'is-open': open.has(m.id) }">
            <button type="button" class="ts__mail-head mi:flex mi:[align-items:flex-start] mi:gap-3 mi:w-full mi:py-3 mi:px-1 mi:[border:0] mi:bg-transparent mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:focus-visible:rounded-md" :aria-expanded="open.has(m.id)" @click="toggle(m.id)">
              <MiAvatar :name="m.from" size="sm" :tone="m.from === me ? 'primary' : 'auto'" decorative />
              <span class="ts__mail-meta mi:grid mi:gap-0.5 mi:flex-1 mi:min-w-0">
                <span class="ts__mail-top mi:flex mi:items-baseline mi:justify-between mi:gap-2">
                  <span class="ts__from mi:text-[14.5px] mi:font-semibold">{{ m.from === me ? 'You' : m.from }}</span>
                  <time class="ts__time mi:flex-[none] mi:text-[12px] mi:text-label3">{{ m.time }}</time>
                </span>
                <span v-if="!open.has(m.id)" class="ts__snip mi:text-[13.5px] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ m.body[0] }}</span>
                <span v-else class="ts__to mi:text-[12.5px] mi:text-label3">to {{ m.to }}</span>
              </span>
            </button>
            <div v-if="open.has(m.id)" class="ts__body mi:grid mi:gap-2.5 mi:pt-0 mi:pr-1 mi:pb-4 mi:pl-14 mi:@max-[480px]:pl-1">
              <p class="mi:[.ts__body_p&]:wrap-anywhere" v-for="(p, j) in m.body" :key="j">{{ p }}</p>
              <MiAttachment v-if="m.file" class="ts__file mi:[.ts__body_p&]:wrap-anywhere" :name="m.file.name" :file-size="m.file.size" type="application/pdf" :removable="false" />
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
            <div class="ts__reply-bar mi:flex mi:[justify-content:flex-end] mi:w-full">
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
.ts__keys ul { margin: 6px 0 0; display: grid; font-size: 13.5px; line-height: 1.45; color: var(--mi-label); }
.ts__keys li::marker { color: var(--mi-p); }
.ts__body p { margin: 0; font-size: 14.5px; line-height: 1.6; }
.ts__file { max-width: 320px; }
.ts__stack { font: inherit; font-size: 13.5px; font-weight: 600; }
</style>
