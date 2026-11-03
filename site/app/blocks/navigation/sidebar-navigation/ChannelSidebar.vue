<template>
  <div class="chs mi:@container mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <div class="chs__shell mi:grid mi:min-h-full mi:@[640px]:grid-cols-[280px_minmax(0,_1fr)]">
      <aside class="chs__side mi:flex mi:flex-col mi:gap-2.5 mi:py-3 mi:px-2.5 mi:[background:var(--mi-side,_var(--mi-card))] mi:@[640px]:shadow-[inset_-1px_0_0_var(--mi-sep)]" aria-label="Riverbend Clinic chat">
        <div class="chs__ws mi:flex mi:items-center mi:gap-2.5 mi:py-1 mi:px-1.5">
          <span class="chs__ws-mark mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:flex-[none] mi:rounded-[10px] mi:font-extrabold mi:text-p-on mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true">R</span>
          <div class="chs__ws-text mi:flex-1 mi:min-w-0">
            <MiText variant="subheadline" weight="bold" :lines="1">Riverbend Clinic</MiText>
            <MiText variant="caption2" tone="label2">Day shift · 42 online</MiText>
          </div>
          <MiIconButton label="New message" variant="gray" size="small"><MiIcon name="pencil" :size="14" /></MiIconButton>
        </div>

        <div class="chs__tools mi:flex mi:items-center mi:gap-2 mi:py-2 mi:px-2 mi:rounded-[10px] mi:[background:var(--mi-fill4)]">
          <MiSwitch v-model="unreadOnly" size="compact" label="Show unread only" />
          <MiText as="span" variant="caption" tone="label2" aria-hidden="true">Unread only</MiText>
          <MiButton variant="plain" size="mini" class="chs__readall mi:ms-auto" :disabled="!totalUnread" @click="markAll">Mark all read</MiButton>
        </div>

        <nav class="chs__nav mi:grid mi:content-start mi:gap-2" aria-label="Conversations">
          <section v-for="s in shown" :key="s.id" class="chs__sec">
            <h2 class="chs__sec-head mi:flex mi:items-center mi:justify-between mi:gap-2 mi:m-0 mi:py-0 mi:px-1.5">
              <button type="button" :aria-expanded="!folded[s.id]" :aria-controls="'chs-' + s.id" @click="folded[s.id] = !folded[s.id]">
                <MiIcon name="chevron-down" :size="11" class="chs__chev mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="{ 'is-folded': folded[s.id] }" />{{ s.label }}
              </button>
              <MiBadge v-if="folded[s.id] && s.unread" :count="s.unread" tone="neutral" :count-noun="`unread in ${s.label}`" />
            </h2>
            <ul v-show="!folded[s.id]" :id="'chs-' + s.id" class="chs__list mi:grid mi:gap-px mi:m-0 mi:p-0 mi:[list-style:none]">
              <li v-for="c in s.rows" :key="c.id">
                <button
                  type="button" class="chs__row mi:flex mi:items-center mi:gap-[9px] mi:w-full mi:min-h-8.5 mi:py-1.5 mi:px-2.5 mi:[border:0] mi:rounded-[8px] mi:text-start mi:text-label2 mi:[background:transparent] mi:cursor-pointer mi:[&.is-muted]:opacity-55 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="{ 'is-unread': c.unread, 'is-muted': c.muted }"
                  :aria-current="c.id === current ? 'page' : undefined" @click="open(c)"
                >
                  <span v-if="c.kind === 'dm'" class="chs__dm mi:relative mi:grid mi:flex-[none]">
                    <MiAvatar :name="c.label" size="xs" tone="auto" decorative />
                    <i class="chs__presence mi:absolute mi:-right-0.5 mi:-bottom-0.5 mi:w-[9px] mi:h-[9px] mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-side,_var(--mi-card))]" :class="'is-' + c.presence" />
                  </span>
                  <MiIcon v-else-if="c.kind === 'private'" name="lock" :size="13" class="chs__hash mi:w-5 mi:text-center mi:text-[13px] mi:opacity-70" />
                  <span v-else class="chs__hash mi:w-5 mi:text-center mi:text-[13px] mi:opacity-70" aria-hidden="true">#</span>
                  <span class="chs__label mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ c.label }}</span>
                  <span v-if="c.mentions" class="chs__mention mi:py-px mi:px-[7px] mi:rounded-[999px] mi:text-[11px] mi:font-bold mi:text-card mi:[background:var(--mi-red)]" :aria-label="`${c.mentions} mentions`">@{{ c.mentions }}</span>
                  <span v-else-if="c.unread && !c.muted" class="chs__dot mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[background:currentColor]" aria-label="Unread" role="img" />
                </button>
              </li>
            </ul>
          </section>
          <MiText v-if="!shown.length" variant="footnote" tone="label2" class="chs__empty mi:py-2 mi:px-2.5">You are all caught up.</MiText>
        </nav>
      </aside>

      <main class="chs__main mi:hidden mi:content-start mi:gap-1 mi:py-5 mi:px-6 mi:@[640px]:grid" aria-labelledby="chs-title">
        <MiText id="chs-title" variant="headline" as="h2">{{ active.kind === 'dm' ? active.label : '# ' + active.label }}</MiText>
        <MiText variant="footnote" tone="label2">{{ active.topic }}</MiText>
        <div class="chs__ghosts mi:grid mi:gap-3 mi:mt-4" aria-hidden="true"><span class="mi:[.chs__ghosts_&]:h-14 mi:[.chs__ghosts_&]:shadow-1 mi:[.chs__ghosts_&:nth-child(even)]:w-[70%] mi:[.chs__ghosts_&:nth-child(even)]:justify-self-end mi:[.chs__ghosts_&:nth-child(even)]:[background:var(--mi-p-tint)] mi:[.chs__ghosts_&:nth-child(even)]:shadow-none" v-for="n in 4" :key="n" /></div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Presence = 'on' | 'away' | 'off'
interface Convo { id: string, label: string, kind: 'channel' | 'private' | 'dm', topic: string, unread: boolean, mentions?: number, muted?: boolean, presence?: Presence }
interface Section { id: string, label: string, rows: Convo[] }

const sections = reactive<Section[]>([
  { id: 'starred', label: 'Starred', rows: [
    { id: 'ward3', label: 'ward-3-handover', kind: 'channel', topic: 'Shift notes for Ward 3, posted at 07:00 and 19:00', unread: true, mentions: 2 },
    { id: 'rota', label: 'rota-swaps', kind: 'private', topic: 'Swap requests need a lead nurse sign-off', unread: false }
  ] },
  { id: 'channels', label: 'Channels', rows: [
    { id: 'general', label: 'general', kind: 'channel', topic: 'Clinic-wide announcements', unread: true },
    { id: 'pharmacy', label: 'pharmacy', kind: 'channel', topic: 'Stock, recalls and prescriptions questions', unread: true },
    { id: 'it', label: 'it-help', kind: 'channel', topic: 'Printer on floor 2 is being replaced Thursday', unread: false },
    { id: 'social', label: 'social', kind: 'channel', topic: 'Bake sale Friday in the atrium', unread: true, muted: true }
  ] },
  { id: 'dms', label: 'Direct messages', rows: [
    { id: 'amara', label: 'Dr Amara Osei', kind: 'dm', topic: 'Consultant, cardiology', unread: true, mentions: 1, presence: 'on' },
    { id: 'pavel', label: 'Pavel Novak', kind: 'dm', topic: 'Charge nurse, Ward 3', unread: false, presence: 'away' },
    { id: 'lucia', label: 'Lucía Ferrer', kind: 'dm', topic: 'Pharmacist', unread: false, presence: 'off' }
  ] }
])

const current = ref('ward3')
const unreadOnly = ref(false)
const folded = reactive<Record<string, boolean>>({})

const all = computed(() => sections.flatMap(s => s.rows))
const active = computed(() => all.value.find(c => c.id === current.value) ?? all.value[0]!)
const totalUnread = computed(() => all.value.filter(c => c.unread && !c.muted).length)
// The filter keeps the open conversation visible so the selection never disappears under you.
const shown = computed(() => sections
  .map(s => ({ ...s, unread: s.rows.filter(c => c.unread && !c.muted).length, rows: unreadOnly.value ? s.rows.filter(c => c.unread || c.id === current.value) : s.rows }))
  .filter(s => s.rows.length))

function open(c: Convo) {
  current.value = c.id
  c.unread = false
  c.mentions = 0
}
function markAll() { for (const c of all.value) { c.unread = false; c.mentions = 0 } }
</script>

<style scoped>
.chs__sec-head button { display: inline-flex; align-items: center; gap: 6px; padding: 6px 4px; border: 0; border-radius: 6px; font: inherit; font-size: 12px; font-weight: 600; color: var(--mi-label2); background: none; cursor: pointer; }
.chs__chev.is-folded { transform: rotate(-90deg); }

.chs__row { font: inherit; font-size: 14px; }
.chs__row:hover { background: var(--mi-fill4); }
.chs__row.is-unread { color: var(--mi-label); font-weight: 600; }
.chs__row[aria-current="page"] { color: var(--mi-p-on); background: var(--mi-p); }
.chs__sec-head button:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.chs__hash { flex: none; }
.chs__presence.is-on { background: var(--mi-green); }
.chs__presence.is-away { background: var(--mi-orange); }
.chs__presence.is-off { background: var(--mi-fill2); }
.chs__ghosts span { border-radius: var(--mi-radius-l); background: var(--mi-card); }
</style>
