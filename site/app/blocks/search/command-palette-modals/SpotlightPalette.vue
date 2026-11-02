<template>
  <section class="spot" aria-labelledby="spot-title">
    <h2 id="spot-title" class="spot__sr">Quick search with instant answers</h2>

    <div class="spot__stage">
      <!-- Wallpaper: two brand glows and a faint dock, drawn from tokens. -->
      <div class="spot__wall" aria-hidden="true"><i /><i /><div class="spot__dock"><b v-for="n in 6" :key="n" /></div></div>

      <div class="spot__palette" role="dialog" aria-modal="false" aria-labelledby="spot-title">
        <div class="spot__search">
          <MiIcon name="search" :size="22" :weight="2.2" class="spot__glass" />
          <input
            v-model="query" class="spot__input" type="text" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="spot-list"
            :aria-activedescendant="activeId" aria-label="Search, calculate or convert" placeholder="Search, calculate, convert…" autocomplete="off" spellcheck="false"
            @keydown="onKey"
          >
        </div>

        <div v-if="query.trim()" id="spot-list" class="spot__list" role="listbox" aria-label="Results">
          <!-- Instant answer: the result set large, with the working shown underneath like a receipt. -->
          <div
            v-if="answer" id="spot-opt-answer" role="option" class="spot__answer" :class="{ 'is-active': activeId === 'spot-opt-answer' }"
            :aria-selected="activeId === 'spot-opt-answer'" :aria-label="`${answer.kind}: ${answer.value}. ${answer.working}`" @mousemove="active = 0" @click="copy"
          >
            <span class="spot__kind"><MiIcon :svg="kindIcon[answer.kind]" :size="13" />{{ answer.kind }}</span>
            <div class="spot__result">
              <span class="spot__value">{{ answer.value }}<small v-if="answer.unit">{{ answer.unit }}</small></span>
              <span class="spot__copy">{{ copied ? 'Copied' : '↵ Copy' }}</span>
            </div>
            <div class="spot__working">
              <span>{{ answer.working }}</span>
              <span v-if="answer.note" class="spot__note">{{ answer.note }}</span>
            </div>
            <div v-if="answer.clocks" class="spot__clocks" aria-hidden="true">
              <span v-for="(c, i) in answer.clocks" :key="i" class="spot__clock"><b>{{ c.time }}</b>{{ c.zone }}</span>
            </div>
          </div>

          <div v-if="results.length" role="group" aria-labelledby="spot-g-top">
            <div id="spot-g-top" class="spot__group">{{ answer ? 'Related' : 'Top hits' }}</div>
            <div
              v-for="r in results" :id="`spot-opt-${r.id}`" :key="r.id" role="option" class="spot__opt"
              :class="{ 'is-active': activeId === `spot-opt-${r.id}` }" :aria-selected="activeId === `spot-opt-${r.id}`"
              @mousemove="active = options.indexOf(`spot-opt-${r.id}`)" @click="openItem(r)"
            >
              <span class="spot__app" :data-tint="r.tint"><MiIcon :name="r.icon" :size="16" /></span>
              <span class="spot__opt-title">{{ r.title }}</span>
              <span class="spot__opt-sub">{{ r.sub }}</span>
            </div>
          </div>

          <p v-if="!answer && !results.length" class="spot__none">No answer for “{{ query.trim() }}”. Try a sum, a percentage, a unit or a time zone.</p>
        </div>

        <div class="spot__try" :class="{ 'is-empty': !query.trim() }">
          <span class="spot__try-label">Try</span>
          <button v-for="ex in examples" :key="ex" type="button" class="spot__ex" :aria-pressed="query === ex" @click="query = ex">{{ ex }}</button>
        </div>

        <footer class="spot__foot">
          <span class="spot__key"><MiKbdGroup><MiKbd>↑</MiKbd><MiKbd>↓</MiKbd></MiKbdGroup> select</span>
          <span class="spot__key"><MiKbd>↵</MiKbd> {{ activeId === 'spot-opt-answer' ? 'copy answer' : 'open' }}</span>
          <span class="spot__key"><MiKbd>esc</MiKbd> {{ query ? 'clear' : 'close' }}</span>
          <span class="spot__status" role="status" aria-live="polite">{{ status }}</span>
        </footer>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Kind = 'Calculator' | 'Units' | 'Time zones'
interface Answer { kind: Kind, value: string, unit?: string, working: string, note?: string, clocks?: { time: string, zone: string }[] }
interface Item { id: string, title: string, sub: string, icon: 'grid' | 'calendar' | 'globe' | 'document' | 'settings' | 'folder', tint: 'p' | 's' | 'orange' | 'green' | 'n', keys: string, for?: Kind }

const kindIcon: Record<Kind, string> = {
  'Calculator': '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01"/>',
  'Units': '<path d="M3 15.5 15.5 3 21 8.5 8.5 21z"/><path d="m7 11.5 2 2M10 8.5l1.5 1.5M13 5.5l2 2"/>',
  'Time zones': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'
}

// Sample index of apps, files and settings; swap for your own search.
const items: Item[] = [
  { id: 'calc', title: 'Calculator', sub: 'Application', icon: 'grid', tint: 'orange', keys: 'calculator math sum', for: 'Calculator' },
  { id: 'pricing', title: 'Q4 pricing model.xlsx', sub: 'Documents › Finance', icon: 'document', tint: 'green', keys: 'pricing price discount percent q4 4800', for: 'Calculator' },
  { id: 'clock', title: 'World Clock', sub: 'Application', icon: 'globe', tint: 'n', keys: 'clock time zone world', for: 'Time zones' },
  { id: 'offsite', title: 'Paris offsite agenda.pdf', sub: 'Documents › Events', icon: 'document', tint: 'p', keys: 'paris offsite agenda trip' },
  { id: 'cal', title: 'Calendar', sub: 'Application', icon: 'calendar', tint: 'p', keys: 'calendar meeting schedule pst' , for: 'Time zones' },
  { id: 'region', title: 'Language & Region', sub: 'System Settings', icon: 'settings', tint: 'n', keys: 'region units metric imperial celsius fahrenheit time zone', for: 'Units' },
  { id: 'trips', title: 'Trips', sub: 'Folder › Personal', icon: 'folder', tint: 's', keys: 'trip travel paris tokyo miles km' }
]

const examples = ['12% of 4,800', '3pm PST in Paris', '72°F in °C', '(1,280 − 96) / 4', '5 km in miles']
const query = ref('12% of 4,800')
const active = ref(0)
const status = ref('')
const copied = ref(false)

const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })
const toNum = (s: string) => Number(s.replace(/,/g, ''))

// Arithmetic without eval: a tiny recursive-descent parser for + − × ÷ ^ and parentheses.
function calc(src: string): number | null {
  const s = src.replace(/,/g, '').replace(/[×x]/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s+/g, '')
  if (!/^[\d.+\-*/^()]+$/.test(s) || !/[+\-*/^]/.test(s.replace(/^-/, ''))) return null
  let i = 0
  const peek = () => s[i]
  const num = (): number => {
    if (peek() === '(') { i++; const v = expr(); if (s[i++] !== ')') throw new Error('paren'); return v }
    if (peek() === '-') { i++; return -num() }
    const m = /^\d*\.?\d+/.exec(s.slice(i))
    if (!m) throw new Error('number')
    i += m[0].length
    return Number(m[0])
  }
  const pow = (): number => { const b = num(); if (peek() === '^') { i++; return b ** pow() } return b }
  const term = (): number => { let v = pow(); while (peek() === '*' || peek() === '/') { const op = s[i++]; const r = pow(); v = op === '*' ? v * r : v / r } return v }
  const expr = (): number => { let v = term(); while (peek() === '+' || peek() === '-') { const op = s[i++]; const r = term(); v = op === '+' ? v + r : v - r } return v }
  try { const v = expr(); return i === s.length && Number.isFinite(v) ? v : null }
  catch { return null }
}

const units: Record<string, { dim: string, k: number, label: string }> = {
  km: { dim: 'len', k: 1000, label: 'km' }, m: { dim: 'len', k: 1, label: 'm' }, cm: { dim: 'len', k: 0.01, label: 'cm' },
  mi: { dim: 'len', k: 1609.344, label: 'mi' }, mile: { dim: 'len', k: 1609.344, label: 'mi' }, miles: { dim: 'len', k: 1609.344, label: 'mi' },
  ft: { dim: 'len', k: 0.3048, label: 'ft' }, feet: { dim: 'len', k: 0.3048, label: 'ft' }, in: { dim: 'len', k: 0.0254, label: 'in' }, inches: { dim: 'len', k: 0.0254, label: 'in' },
  kg: { dim: 'mass', k: 1, label: 'kg' }, g: { dim: 'mass', k: 0.001, label: 'g' }, lb: { dim: 'mass', k: 0.45359237, label: 'lb' }, lbs: { dim: 'mass', k: 0.45359237, label: 'lb' }, oz: { dim: 'mass', k: 0.028349523, label: 'oz' },
  l: { dim: 'vol', k: 1, label: 'L' }, ml: { dim: 'vol', k: 0.001, label: 'mL' }, gal: { dim: 'vol', k: 3.785411784, label: 'gal' }
}
const temp = (u: string) => (/^°?c(elsius)?$/i.test(u) ? 'C' : /^°?f(ahrenheit)?$/i.test(u) ? 'F' : null)

// Fixed abbreviations as UTC offsets in minutes; cities resolve to IANA zones so daylight saving is right.
const abbr: Record<string, [number, string]> = { pst: [-480, 'PST'], pdt: [-420, 'PDT'], est: [-300, 'EST'], edt: [-240, 'EDT'], cst: [-360, 'CST'], utc: [0, 'UTC'], gmt: [0, 'GMT'], cet: [60, 'CET'], jst: [540, 'JST'], ist: [330, 'IST'], aest: [600, 'AEST'] }
const cities: Record<string, string> = { paris: 'Europe/Paris', london: 'Europe/London', berlin: 'Europe/Berlin', tokyo: 'Asia/Tokyo', 'new york': 'America/New_York', nyc: 'America/New_York', 'san francisco': 'America/Los_Angeles', sydney: 'Australia/Sydney', singapore: 'Asia/Singapore', lisbon: 'Europe/Lisbon', dubai: 'Asia/Dubai', bengaluru: 'Asia/Kolkata', utc: 'UTC' }
const cap = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase())
const pad = (n: number) => String(n).padStart(2, '0')

function zoneAnswer(q: string): Answer | null {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s+([a-z]{2,4})\s+(?:in|to)\s+([a-z ]+)$/i.exec(q)
  if (!m) return null
  const from = abbr[m[4]!.toLowerCase()]
  const city = m[5]!.trim().toLowerCase()
  const zone = cities[city] ?? (abbr[city] ? null : undefined)
  if (!from || zone === undefined) return null
  let h = Number(m[1]) % 12 + (m[3]?.toLowerCase() === 'pm' ? 12 : 0)
  if (!m[3]) h = Number(m[1])
  const min = Number(m[2] ?? 0)
  if (h > 23 || min > 59) return null
  const today = new Date()
  const utc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), h, min) - from[0] * 60_000
  const at = new Date(utc)
  let time: string, day: string, label: string, delta: number
  if (zone) {
    const f = new Intl.DateTimeFormat('en-GB', { timeZone: zone, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'long', timeZoneName: 'short' })
    const p: Record<string, string> = {}
    for (const x of f.formatToParts(at)) p[x.type] = x.value
    time = `${p.hour}:${p.minute}`
    day = p.weekday ?? ''
    label = `${cap(city)} (${p.timeZoneName})`
    // Calendar days between the source date and the date on the target wall clock.
    delta = Math.round((Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)) - Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) / 86_400_000)
  }
  else {
    const to = abbr[city]!
    const t = h * 60 + min + to[0] - from[0]
    time = `${pad(((Math.floor(t / 60) % 24) + 24) % 24)}:${pad(((t % 60) + 60) % 60)}`
    delta = Math.floor(t / 1440)
    day = ''
    label = to[1]
  }
  const shift = delta > 0 ? 'next day' : delta < 0 ? 'previous day' : 'same day'
  return {
    kind: 'Time zones', value: time, working: `${m[1]}${m[2] ? `:${m[2]}` : ''}${m[3] ? ` ${m[3].toUpperCase()}` : ''} ${from[1]} in ${label}`,
    note: day ? `${day}, ${shift}` : shift,
    clocks: [{ time: `${pad(h)}:${pad(min)}`, zone: from[1] }, { time, zone: label.replace(/ \(.*/, '') }]
  }
}

const answer = computed<Answer | null>(() => {
  const q = query.value.trim()
  if (!q) return null
  const pct = /^([\d.,]+)\s*%\s*(of|off|on top of|on)\s*\$?([\d.,]+)$/i.exec(q)
  if (pct) {
    const a = toNum(pct[1]!), b = toNum(pct[3]!), op = pct[2]!.toLowerCase()
    const v = op === 'of' ? (a / 100) * b : op === 'off' ? b * (1 - a / 100) : b * (1 + a / 100)
    const working = op === 'of' ? `${num.format(b)} × ${num.format(a / 100)}` : `${num.format(b)} ${op === 'off' ? '−' : '+'} ${num.format(a)}%`
    return { kind: 'Calculator', value: num.format(v), working, note: op === 'of' ? `${num.format(b - v)} remains` : `${op === 'off' ? 'saves' : 'adds'} ${num.format(Math.abs(v - b))}` }
  }
  const conv = /^(-?[\d.,]+)\s*(°?[a-z]+)\s+(?:in|to)\s+(°?[a-z]+)$/i.exec(q)
  if (conv) {
    const v = toNum(conv[1]!), a = conv[2]!.toLowerCase(), b = conv[3]!.toLowerCase()
    const ta = temp(a), tb = temp(b)
    if (ta && tb && ta !== tb) {
      const r = ta === 'F' ? ((v - 32) * 5) / 9 : (v * 9) / 5 + 32
      return { kind: 'Units', value: new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(r), unit: `°${tb}`, working: ta === 'F' ? `(${num.format(v)} − 32) × 5⁄9` : `${num.format(v)} × 9⁄5 + 32` }
    }
    const ua = units[a], ub = units[b]
    if (ua && ub && ua.dim === ub.dim) {
      const r = (v * ua.k) / ub.k
      return { kind: 'Units', value: new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(r), unit: ` ${ub.label}`, working: `${num.format(v)} ${ua.label} × ${num.format(ua.k / ub.k)}` }
    }
  }
  const zone = zoneAnswer(q)
  if (zone) return zone
  const v = calc(q)
  return v === null ? null : { kind: 'Calculator', value: num.format(v), working: q.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−') }
})

const results = computed(() => {
  const words = query.value.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2)
  return items.filter(it => (answer.value && it.for === answer.value.kind) || words.some(w => it.keys.includes(w) || it.title.toLowerCase().includes(w))).slice(0, 4)
})

const options = computed(() => [...(answer.value ? ['spot-opt-answer'] : []), ...results.value.map(r => `spot-opt-${r.id}`)])
const activeId = computed(() => (query.value.trim() ? options.value[Math.min(active.value, options.value.length - 1)] : undefined))
watch(query, () => { active.value = 0; copied.value = false; status.value = '' })

async function copy() {
  if (!answer.value) return
  const text = `${answer.value.value}${answer.value.unit ?? ''}`.trim()
  copied.value = true
  status.value = `Copied ${text}`
  // Clipboard access can be blocked in embedded previews; the status line still confirms the value.
  await navigator.clipboard?.writeText(text).catch(() => undefined)
}
function openItem(r: Item) { status.value = `Opening ${r.title}` }

function onKey(e: KeyboardEvent) {
  const n = options.value.length
  if (e.key === 'ArrowDown' && n) { e.preventDefault(); active.value = (active.value + 1) % n }
  else if (e.key === 'ArrowUp' && n) { e.preventDefault(); active.value = (active.value - 1 + n) % n }
  else if (e.key === 'Enter') {
    e.preventDefault()
    if (activeId.value === 'spot-opt-answer') copy()
    else { const r = results.value.find(x => `spot-opt-${x.id}` === activeId.value); if (r) openItem(r) }
  }
  else if (e.key === 'Escape' && query.value) { e.preventDefault(); query.value = '' }
}
</script>

<style scoped>
.spot { container-type: inline-size; display: grid; font-family: var(--mi-font); color: var(--mi-label); }
.spot__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.spot__stage { position: relative; display: grid; place-items: start center; min-height: 520px; padding: 40px 12px 96px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate; background: var(--mi-page); }
.spot__wall { position: absolute; inset: 0; z-index: -1; }
.spot__wall > i { position: absolute; width: 70%; aspect-ratio: 1; border-radius: 50%; filter: blur(60px); opacity: .5; }
.spot__wall > i:first-child { left: -18%; top: -30%; background: radial-gradient(closest-side, color-mix(in srgb, var(--mi-p) 60%, transparent), transparent); }
.spot__wall > i:nth-child(2) { right: -20%; bottom: -40%; background: radial-gradient(closest-side, color-mix(in srgb, var(--mi-s) 55%, transparent), transparent); }
.spot__dock { position: absolute; left: 50%; bottom: 16px; display: flex; gap: 10px; padding: 8px 10px; border-radius: 20px; transform: translateX(-50%); background: var(--mi-mat); border: 1px solid var(--mi-mat-b); }
.spot__dock b { width: 34px; height: 34px; border-radius: 9px; background: var(--mi-fill2); }
.spot__dock b:nth-child(2) { background: color-mix(in srgb, var(--mi-p) 55%, transparent); }
.spot__dock b:nth-child(5) { background: color-mix(in srgb, var(--mi-orange) 55%, transparent); }

.spot__palette {
  display: grid; width: 100%; max-width: 600px; border-radius: 22px; overflow: hidden;
  background: var(--mi-mat); border: 1px solid var(--mi-mat-b); box-shadow: var(--mi-sh3);
  -webkit-backdrop-filter: blur(28px) saturate(1.6); backdrop-filter: blur(28px) saturate(1.6);
}

.spot__search { display: flex; align-items: center; gap: 12px; padding: 16px 20px; }
.spot__glass { flex: none; color: var(--mi-label2); }
.spot__input { flex: 1; min-width: 0; height: 36px; padding: 0; border: 0; outline: none; background: none; font: inherit; font-size: 22px; font-weight: 400; letter-spacing: -.01em; color: var(--mi-label); }
.spot__input::placeholder { color: var(--mi-label2); opacity: .7; }

.spot__list { max-height: 330px; overflow-y: auto; overscroll-behavior: contain; padding: 0 8px 8px; border-top: 1px solid var(--mi-mat-b); }

.spot__answer { display: grid; gap: 6px; margin-top: 8px; padding: 14px 16px 16px; border-radius: 14px; cursor: pointer; }
.spot__answer.is-active { background: color-mix(in srgb, var(--mi-p) 10%, transparent); }
.spot__kind { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--mi-label2); }
.spot__result { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; min-width: 0; }
.spot__value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 40px; font-weight: 600; line-height: 1.1; letter-spacing: -.025em; font-variant-numeric: tabular-nums; }
.spot__value small { font-size: 22px; font-weight: 500; color: var(--mi-label2); letter-spacing: 0; }
.spot__copy { flex: none; font-size: 12px; font-weight: 500; color: var(--mi-label2); opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.spot__answer.is-active .spot__copy { opacity: 1; color: var(--mi-p-text); }
.spot__working { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; padding-top: 8px; border-top: 1px dashed var(--mi-sep); font-size: 13px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.spot__working > :first-child { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; }
.spot__note { color: var(--mi-label); font-weight: 500; }
.spot__clocks { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-top: 4px; }
.spot__clock { display: inline-flex; align-items: baseline; gap: 6px; padding: 4px 10px; border-radius: 8px; font-size: 12px; color: var(--mi-label2); background: var(--mi-fill4); }
.spot__clock b { font-size: 13px; font-weight: 600; color: var(--mi-label); font-variant-numeric: tabular-nums; }
.spot__clock + .spot__clock::before { content: "→"; margin-inline: -4px 6px; color: var(--mi-label2); }

.spot__group { padding: 12px 12px 6px; font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--mi-label2); }
.spot__opt { display: flex; align-items: center; gap: 12px; min-height: 40px; padding: 6px 12px; border-radius: 10px; cursor: pointer; }
.spot__opt.is-active { background: var(--mi-p); color: var(--mi-p-on); }
.spot__app { display: grid; place-items: center; flex: none; width: 26px; height: 26px; border-radius: 7px; color: var(--mi-p-on); background: var(--mi-p); }
.spot__app[data-tint="s"] { background: var(--mi-s); color: var(--mi-s-on); }
.spot__app[data-tint="orange"] { background: var(--mi-orange); color: var(--mi-p-on); }
.spot__app[data-tint="green"] { background: var(--mi-green); color: var(--mi-p-on); }
.spot__app[data-tint="n"] { background: var(--mi-ctl); color: var(--mi-p-on); }
.spot__opt.is-active .spot__app { box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--mi-p-on) 70%, transparent); }
.spot__opt-title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 500; }
.spot__opt-sub { display: none; margin-left: auto; flex: none; font-size: 12px; color: var(--mi-label2); }
.spot__opt.is-active .spot__opt-sub { color: color-mix(in srgb, var(--mi-p-on) 80%, transparent); }
.spot__none { margin: 0; padding: 22px 12px 12px; font-size: 13px; color: var(--mi-label2); }

.spot__try { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 10px 14px; border-top: 1px solid var(--mi-mat-b); }
.spot__try-label { margin-inline-end: 4px; font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.spot__ex {
  height: 26px; padding: 0 9px; border: 0; border-radius: 7px; background: none; cursor: pointer;
  font: inherit; font-size: 12.5px; color: var(--mi-label2); font-variant-numeric: tabular-nums; white-space: nowrap;
  transition: transform var(--mi-dur-1) var(--mi-ease);
}
.spot__ex:hover { background: var(--mi-fill3); color: var(--mi-label); }
.spot__ex:active { transform: scale(.96); }
.spot__ex[aria-pressed="true"] { color: var(--mi-p-text); background: var(--mi-p-tint); }
.spot__ex:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }

.spot__foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 9px 16px; border-top: 1px solid var(--mi-mat-b); font-size: 12px; color: var(--mi-label2); }
.spot__key { display: inline-flex; align-items: center; gap: 6px; }
.spot__status { margin-left: auto; font-weight: 500; color: var(--mi-p-text); }

@container (min-width: 560px) {
  .spot__stage { padding: 72px 32px 110px; }
  .spot__search { padding: 18px 22px; }
  .spot__value { font-size: 48px; }
  .spot__opt-sub { display: inline; }
}
</style>
