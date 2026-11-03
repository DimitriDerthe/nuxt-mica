<template>
  <div class="chs">
    <div class="chs__shell">
      <aside class="chs__side" aria-label="Riverbend Clinic chat">
        <div class="chs__ws">
          <span class="chs__ws-mark" aria-hidden="true">R</span>
          <div class="chs__ws-text">
            <MiText variant="subheadline" weight="bold" :lines="1">Riverbend Clinic</MiText>
            <MiText variant="caption2" tone="label2">Day shift · 42 online</MiText>
          </div>
          <MiIconButton label="New message" variant="gray" size="small"><MiIcon name="pencil" :size="14" /></MiIconButton>
        </div>

        <div class="chs__tools">
          <MiSwitch v-model="unreadOnly" size="compact" label="Show unread only" />
          <MiText as="span" variant="caption" tone="label2" aria-hidden="true">Unread only</MiText>
          <MiButton variant="plain" size="mini" class="chs__readall" :disabled="!totalUnread" @click="markAll">Mark all read</MiButton>
        </div>

        <nav class="chs__nav" aria-label="Conversations">
          <section v-for="s in shown" :key="s.id" class="chs__sec">
            <h2 class="chs__sec-head">
              <button type="button" :aria-expanded="!folded[s.id]" :aria-controls="'chs-' + s.id" @click="folded[s.id] = !folded[s.id]">
                <MiIcon name="chevron-down" :size="11" class="chs__chev" :class="{ 'is-folded': folded[s.id] }" />{{ s.label }}
              </button>
              <MiBadge v-if="folded[s.id] && s.unread" :count="s.unread" tone="neutral" :count-noun="`unread in ${s.label}`" />
            </h2>
            <ul v-show="!folded[s.id]" :id="'chs-' + s.id" class="chs__list">
              <li v-for="c in s.rows" :key="c.id">
                <button
                  type="button" class="chs__row" :class="{ 'is-unread': c.unread, 'is-muted': c.muted }"
                  :aria-current="c.id === current ? 'page' : undefined" @click="open(c)"
                >
                  <span v-if="c.kind === 'dm'" class="chs__dm">
                    <MiAvatar :name="c.label" size="xs" tone="auto" decorative />
                    <i class="chs__presence" :class="'is-' + c.presence" />
                  </span>
                  <MiIcon v-else-if="c.kind === 'private'" name="lock" :size="13" class="chs__hash" />
                  <span v-else class="chs__hash" aria-hidden="true">#</span>
                  <span class="chs__label">{{ c.label }}</span>
                  <span v-if="c.mentions" class="chs__mention" :aria-label="`${c.mentions} mentions`">@{{ c.mentions }}</span>
                  <span v-else-if="c.unread && !c.muted" class="chs__dot" aria-label="Unread" role="img" />
                </button>
              </li>
            </ul>
          </section>
          <MiText v-if="!shown.length" variant="footnote" tone="label2" class="chs__empty">You are all caught up.</MiText>
        </nav>
      </aside>

      <main class="chs__main" aria-labelledby="chs-title">
        <MiText id="chs-title" variant="headline" as="h2">{{ active.kind === 'dm' ? active.label : '# ' + active.label }}</MiText>
        <MiText variant="footnote" tone="label2">{{ active.topic }}</MiText>
        <div class="chs__ghosts" aria-hidden="true"><span v-for="n in 4" :key="n" /></div>
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
.chs { container-type: inline-size; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.chs__shell { display: grid; min-height: 100%; }

.chs__side { display: flex; flex-direction: column; gap: 10px; padding: 12px 10px; background: var(--mi-side, var(--mi-card)); }
.chs__ws { display: flex; align-items: center; gap: 10px; padding: 4px 6px; }
.chs__ws-mark { display: grid; place-items: center; width: 34px; height: 34px; flex: none; border-radius: 10px; font-weight: 800; color: var(--mi-p-on); background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }
.chs__ws-text { flex: 1; min-width: 0; }
.chs__tools { display: flex; align-items: center; gap: 8px; padding: 8px 8px; border-radius: 10px; background: var(--mi-fill4); }
.chs__readall { margin-inline-start: auto; }

.chs__nav { display: grid; align-content: start; gap: 8px; }
.chs__sec-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0; padding: 0 6px; }
.chs__sec-head button { display: inline-flex; align-items: center; gap: 6px; padding: 6px 4px; border: 0; border-radius: 6px; font: inherit; font-size: 12px; font-weight: 600; color: var(--mi-label2); background: none; cursor: pointer; }
.chs__chev { transition: transform var(--mi-dur-2) var(--mi-ease); }
.chs__chev.is-folded { transform: rotate(-90deg); }
.chs__list { display: grid; gap: 1px; margin: 0; padding: 0; list-style: none; }

.chs__row { display: flex; align-items: center; gap: 9px; width: 100%; min-height: 34px; padding: 6px 10px; border: 0; border-radius: 8px; font: inherit; font-size: 14px; text-align: start; color: var(--mi-label2); background: transparent; cursor: pointer; }
.chs__row:hover { background: var(--mi-fill4); }
.chs__row.is-unread { color: var(--mi-label); font-weight: 600; }
.chs__row.is-muted { opacity: .55; }
.chs__row[aria-current="page"] { color: var(--mi-p-on); background: var(--mi-p); }
.chs__row:focus-visible, .chs__sec-head button:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.chs__hash { width: 20px; flex: none; text-align: center; font-size: 13px; opacity: .7; }
.chs__dm { position: relative; display: grid; flex: none; }
.chs__presence { position: absolute; right: -2px; bottom: -2px; width: 9px; height: 9px; border-radius: 50%; box-shadow: 0 0 0 2px var(--mi-side, var(--mi-card)); }
.chs__presence.is-on { background: var(--mi-green); }
.chs__presence.is-away { background: var(--mi-orange); }
.chs__presence.is-off { background: var(--mi-fill2); }
.chs__label { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.chs__mention { padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; color: var(--mi-card); background: var(--mi-red); }
.chs__dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.chs__empty { padding: 8px 10px; }

.chs__main { display: none; align-content: start; gap: 4px; padding: 20px 24px; }
.chs__ghosts { display: grid; gap: 12px; margin-top: 16px; }
.chs__ghosts span { height: 56px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.chs__ghosts span:nth-child(even) { width: 70%; justify-self: end; background: var(--mi-p-tint); box-shadow: none; }

@container (min-width: 640px) {
  .chs__shell { grid-template-columns: 280px minmax(0, 1fr); }
  .chs__side { box-shadow: inset -1px 0 0 var(--mi-sep); }
  .chs__main { display: grid; }
}
</style>
