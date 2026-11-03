<template>
  <section class="mt mi:@container mi:font-mi mi:text-label" aria-labelledby="mt-title">
    <div class="mt__card mi:max-w-190 mi:mx-auto mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:overflow-hidden">
      <!-- One toolbar, three modes: it morphs instead of stacking extra bars. -->
      <div class="mt__bar mi:relative mi:min-h-16 mi:pt-0 mi:pr-2.5 mi:pb-0 mi:pl-3.5 mi:border-b mi:border-b-sep mi:grid mi:items-center mi:after:content-[''] mi:after:absolute mi:after:top-auto mi:after:right-0 mi:after:-bottom-px mi:after:left-0 mi:after:h-0.5 mi:after:[background:var(--mi-p)] mi:after:transform-[scaleX(0)] mi:after:origin-left mi:after:[transition:transform_var(--mi-dur-3)_var(--mi-ease)]" :data-mode="mode">
        <Transition name="mt-swap" mode="out-in">
          <div v-if="mode === 'default'" key="default" class="mt__row mi:flex mi:items-center mi:gap-2.5 mi:min-w-0 mi:py-2.5" role="toolbar" aria-label="Conversation">
            <MiAvatarGroup :items="members" :max="3" :size="32" class="mt__stack mi:flex-[none]" />
            <div class="mt__title mi:flex-1 mi:min-w-0">
              <MiText id="mt-title" as="h2" variant="headline" weight="semibold" :lines="1">Q3 pricing review</MiText>
              <MiText variant="caption" tone="label2" :lines="1"><span class="mt__live mi:inline-block mi:w-[7px] mi:h-[7px] mi:mr-1.5 mi:rounded-[50%] mi:[background:var(--mi-green)] mi:[vertical-align:1px]" aria-hidden="true" />3 of 5 online</MiText>
            </div>
            <div class="mt__actions mi:flex mi:items-center mi:gap-0.5 mi:flex-[none] mi:[.mt__row--select_&]:gap-1.5">
              <MiIconButton label="Search in conversation" variant="plain" size="toolbar" @click="enter('search')"><MiIcon name="search" /></MiIconButton>
              <MiIconButton class="mt__wide" label="Start voice call" variant="plain" size="toolbar"><MiIcon :svg="icons.phone" /></MiIconButton>
              <MiIconButton label="Start video call" variant="plain" size="toolbar"><MiIcon :svg="icons.video" /></MiIconButton>
              <MiIconButton class="mt__wide" label="Pin conversation" variant="plain" size="toolbar" :pressed="pinned" @click="pinned = !pinned"><MiIcon :svg="icons.pin" :filled="pinned" /></MiIconButton>
              <MiIconButton label="Select messages" variant="plain" size="toolbar" @click="enter('select')"><MiIcon name="check-circle" /></MiIconButton>
            </div>
          </div>

          <div v-else-if="mode === 'search'" key="search" class="mt__row mi:flex mi:items-center mi:gap-2.5 mi:min-w-0 mi:py-2.5" role="toolbar" aria-label="Search in conversation">
            <MiSearch v-model="query" size="compact" class="mt__search" placeholder="Search this chat" aria-label="Search this chat" :cancelable="false" />
            <span class="mt__count mi:flex-[none] mi:min-w-13 mi:text-[12px] mi:font-medium mi:text-label2 mi:text-end mi:tabular-nums" aria-live="polite">{{ total ? (current + 1) + ' of ' + total : 'No matches' }}</span>
            <MiIconButton label="Previous match" variant="gray" size="small" :disabled="!total" @click="step(-1)"><MiIcon name="chevron-up" :size="16" /></MiIconButton>
            <MiIconButton label="Next match" variant="gray" size="small" :disabled="!total" @click="step(1)"><MiIcon name="chevron-down" :size="16" /></MiIconButton>
            <MiButton variant="plain" size="small" @click="enter('default')">Done</MiButton>
          </div>

          <div v-else key="select" class="mt__row mt__row--select mi:flex mi:items-center mi:gap-2.5 mi:min-w-0 mi:py-2.5" role="toolbar" aria-label="Selected messages">
            <MiButton variant="plain" size="small" @click="enter('default')">Cancel</MiButton>
            <MiText variant="headline" weight="semibold" class="mt__sel mi:flex-1 mi:min-w-0" aria-live="polite">{{ selected.length }} selected</MiText>
            <div class="mt__actions mi:flex mi:items-center mi:gap-0.5 mi:flex-[none] mi:[.mt__row--select_&]:gap-1.5">
              <MiIconButton label="Reply" variant="gray" size="small" :disabled="selected.length !== 1"><MiIcon :svg="icons.reply" :size="16" /></MiIconButton>
              <MiIconButton label="Forward" variant="gray" size="small" :disabled="!selected.length"><MiIcon :svg="icons.forward" :size="16" /></MiIconButton>
              <MiIconButton label="Copy" variant="gray" size="small" :disabled="!selected.length"><MiIcon name="copy" :size="16" /></MiIconButton>
              <MiIconButton label="Delete" variant="gray" size="small" :disabled="!selected.length" @click="remove"><MiIcon name="trash" :size="16" /></MiIconButton>
            </div>
          </div>
        </Transition>
      </div>

      <div class="mt__msgs mi:flex mi:flex-col mi:gap-2.5 mi:p-4 mi:[background:var(--mi-page)]" :class="{ 'is-selecting': mode === 'select' }">
        <MiMarker variant="separator">Today</MiMarker>
        <MiMessage
          v-for="m in rendered" :key="m.id" :align="m.me ? 'end' : 'start'" :label="m.who"
          class="mt__msg mi:[&.is-end]:ms-auto mi:relative mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[.mt__msgs.is-selecting_&:not(.is-end)]:transform-[translateX(28px)] mi:before:content-[''] mi:before:absolute mi:before:top-1/2 mi:before:w-4.5 mi:before:h-4.5 mi:before:mt-[-9px] mi:before:rounded-[50%] mi:before:border-2 mi:before:border-fill mi:before:box-border mi:before:opacity-0 mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[.mt__msgs.is-selecting_&]:before:opacity-100 mi:[&.is-picked]:before:border-p mi:[&.is-picked]:before:[background:radial-gradient(circle,_var(--mi-p)_0_4px,_transparent_5px)]" :class="{ 'is-end': m.me, 'is-picked': selected.includes(m.id) }"
        >
          <template #avatar><MiAvatar :name="m.who" size="xs" :tone="m.me ? 'primary' : 'auto'" decorative /></template>
          <MiBubble
            as="button" :align="m.me ? 'end' : 'start'" :variant="m.me ? 'default' : 'secondary'" class="mt__bub"
            :aria-pressed="mode === 'select' ? selected.includes(m.id) : undefined" @click="pick(m.id)"
          ><template v-for="(p, i) in m.parts" :key="i"><mark class="mi:[.mt__bub_&]:rounded-[4px] mi:[.mt__bub_&]:py-0 mi:[.mt__bub_&]:px-0.5 mi:[.mt__bub_&]:[background:color-mix(in_srgb,_var(--mi-yellow)_32%,_transparent)] mi:[.mt__bub_&]:text-inherit" v-if="p.match >= 0" :class="{ 'is-current mi:[.mt__bub_&]:[background:color-mix(in_srgb,_var(--mi-yellow)_55%,_transparent)] mi:[.mt__bub_&]:shadow-[0_0_0_1.5px_currentColor]': p.match === current }">{{ p.text }}</mark><template v-else>{{ p.text }}</template></template></MiBubble>
          <template v-if="!m.me" #header>{{ m.who }}</template>
        </MiMessage>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Mode = 'default' | 'search' | 'select'
interface Msg { id: string, who: string, text: string, me?: boolean }

const icons = {
  phone: '<path d="M6.5 3.5h3l1.5 4-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
  video: '<rect x="3" y="6" width="12.5" height="12" rx="2.5"/><path d="M15.5 10.2 21 7v10l-5.5-3.2"/>',
  pin: '<path d="M9 3.5h6l-.8 5.2 3.3 3.3h-11l3.3-3.3L9 3.5zM12 12v8.5"/>',
  reply: '<path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 6 6"/>',
  forward: '<path d="m15 7 5 5-5 5"/><path d="M20 12H10a6 6 0 0 0-6 6"/>'
}

const members = [
  { name: 'Amara Diallo', tone: 'teal' as const },
  { name: 'Jonas Weber', tone: 'indigo' as const },
  { name: 'Priya Raman', tone: 'pink' as const },
  { name: 'Tomás Ruiz' },
  { name: 'Léa Fontaine' }
]

// Sample conversation; swap for your messages API.
const messages = ref<Msg[]>([
  { id: 'm1', who: 'Jonas Weber', text: 'Draft pricing is in the deck: Starter 12 €, Team 29 €, Scale on request.' },
  { id: 'm2', who: 'Priya Raman', text: 'Support volume says Team should include priority email. Scale customers ask for SLAs, not features.' },
  { id: 'm3', who: 'Léa Fontaine', me: true, text: 'Agree on priority email. Can we test 34 € for Team in two regions first?' },
  { id: 'm4', who: 'Amara Diallo', text: 'Netherlands and Portugal are the cleanest test regions for pricing. Low overlap with ads.' },
  { id: 'm5', who: 'Jonas Weber', text: 'OK: Team at 34 € in NL and PT for six weeks, everywhere else 29 €.' },
  { id: 'm6', who: 'Léa Fontaine', me: true, text: 'Perfect. I will brief finance on the pricing test tomorrow.' }
])

const mode = ref<Mode>('default')
const query = ref('pricing')
const current = ref(0)
const selected = ref<string[]>([])
const pinned = ref(true)

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Split every message around the query and number the matches across the whole chat.
const rendered = computed(() => {
  const q = mode.value === 'search' ? query.value.trim() : ''
  const re = q ? new RegExp('(' + escape(q) + ')', 'gi') : null
  let n = 0
  return messages.value.map(m => ({
    ...m,
    parts: (re ? m.text.split(re) : [m.text]).filter(Boolean).map(text => ({ text, match: re && text.toLowerCase() === q.toLowerCase() ? n++ : -1 }))
  }))
})
const total = computed(() => rendered.value.reduce((sum, m) => sum + m.parts.filter(p => p.match >= 0).length, 0))
watch(query, () => { current.value = 0 })

function step(dir: 1 | -1) {
  if (total.value) current.value = (current.value + dir + total.value) % total.value
}

function enter(next: Mode) {
  mode.value = next
  if (next !== 'select') selected.value = []
}

function pick(id: string) {
  if (mode.value !== 'select') mode.value = 'select'
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}

function remove() {
  messages.value = messages.value.filter(m => !selected.value.includes(m.id))
  enter('default')
}
</script>

<style scoped>
.mt__bar[data-mode="search"]::after, .mt__bar[data-mode="select"]::after { transform: scaleX(1); }
.mt__stack { display: none; }
@container (min-width: 420px) { .mt__stack { display: flex; } }
.mt__wide { display: none; }
@container (min-width: 480px) { .mt__wide { display: inline-flex; } }
.mt__search { flex: 1; min-width: 0; }

.mt-swap-enter-active, .mt-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.mt-swap-enter-from { opacity: 0; transform: translateY(6px); }
.mt-swap-leave-to { opacity: 0; transform: translateY(-6px); }
.mt__msg { max-width: min(86%, 30rem); }
.mt .mt__bub { max-width: 100%; }
.mt__msg:not(.is-end)::before { left: -22px; }
.mt__msg.is-end::before { left: -26px; }
</style>
