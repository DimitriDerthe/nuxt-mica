<template>
  <section class="mi:@container mi:grid mi:content-start mi:font-mi mi:text-label" aria-labelledby="spot-title">
    <h2 id="spot-title" class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Quick search with instant answers</h2>

    <div class="mi:relative mi:grid mi:[place-items:start_center] mi:min-h-130 mi:pt-10 mi:px-3 mi:pb-24 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-page)] mi:@[560px]:pt-18 mi:@[560px]:px-8 mi:@[560px]:pb-27.5">
      <!-- Wallpaper: two brand glows and a faint dock, drawn from tokens. -->
      <div class="mi:absolute mi:inset-0 mi:-z-1" aria-hidden="true"><i class="mi:absolute mi:aspect-[1] mi:[filter:blur(60px)] mi:opacity-50 mi:w-[70%] mi:rounded-[50%] mi:left-[-18%] mi:top-[-30%] mi:[background:radial-gradient(closest-side,_color-mix(in_srgb,_var(--mi-p)_60%,_transparent),_transparent)]" /><i class="mi:absolute mi:aspect-[1] mi:[filter:blur(60px)] mi:opacity-50 mi:w-[70%] mi:rounded-[50%] mi:right-[-20%] mi:bottom-[-40%] mi:[background:radial-gradient(closest-side,_color-mix(in_srgb,_var(--mi-s)_55%,_transparent),_transparent)]" /><div class="mi:absolute mi:left-1/2 mi:bottom-4 mi:flex mi:gap-2.5 mi:py-2 mi:px-2.5 mi:rounded-[20px] mi:transform-[translateX(-50%)] mi:[background:var(--mi-mat)] mi:border mi:border-mat-b"><b class="mi:h-8.5 mi:w-8.5 mi:rounded-[9px] mi:bg-fill2 mi:[&:nth-child(2)]:bg-p/55 mi:[&:nth-child(5)]:bg-orange/55" v-for="n in 6" :key="n" /></div></div>

      <div class="mi:[-webkit-backdrop-filter:blur(28px)_saturate(1.6)] mi:[backdrop-filter:blur(28px)_saturate(1.6)] mi:grid mi:w-full mi:max-w-150 mi:rounded-[22px] mi:overflow-hidden mi:[background:var(--mi-mat)] mi:border mi:border-mat-b mi:shadow-3" role="dialog" aria-modal="false" aria-labelledby="spot-title">
        <div class="mi:flex mi:items-center mi:gap-3 mi:py-4 mi:px-5 mi:@[560px]:py-4.5 mi:@[560px]:px-5.5">
          <MiIcon name="search" :size="22" :weight="2.2" class="mi:text-label2" />
          <input
            v-model="query" class="mi:[font:inherit] mi:text-[22px] mi:font-normal mi:flex-1 mi:min-w-0 mi:h-9 mi:p-0 mi:[border:0] mi:[outline:none] mi:[background:none] mi:tracking-[-.01em] mi:text-label mi:placeholder:text-label2 mi:placeholder:opacity-70" type="text" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="spot-list"
            :aria-activedescendant="activeId" aria-label="Search, calculate or convert" placeholder="Search, calculate, convert…" autocomplete="off" spellcheck="false"
            @keydown="onKey"
          >
        </div>

        <div v-if="query.trim()" id="spot-list" class="mi:max-h-82.5 mi:overflow-y-auto mi:overscroll-contain mi:pt-0 mi:px-2 mi:pb-2 mi:border-t mi:border-t-mat-b" role="listbox" aria-label="Results">
          <!-- Instant answer: the result set large, with the working shown underneath like a receipt. -->
          <div
            v-if="answer" id="spot-opt-answer" role="option" class="mi:group mi:grid mi:gap-1.5 mi:mt-2 mi:pt-3.5 mi:px-4 mi:pb-4 mi:rounded-[14px] mi:cursor-pointer mi:aria-selected:[background:color-mix(in_srgb,_var(--mi-p)_10%,_transparent)]"
            :aria-selected="activeId === 'spot-opt-answer'" :aria-label="`${answer.kind}: ${answer.value}. ${answer.working}`" @mousemove="active = 0" @click="copy"
          >
            <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[11px] mi:font-semibold mi:tracking-[.05em] mi:uppercase mi:text-label2"><MiIcon :svg="kindIcon[answer.kind]" :size="13" />{{ answer.kind }}</span>
            <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-3 mi:min-w-0">
              <span class="mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[40px] mi:font-semibold mi:leading-[1.1] mi:tracking-[-.025em] mi:tabular-nums mi:@[560px]:text-[48px]">{{ answer.value }}<small class="mi:text-[22px] mi:font-medium mi:text-label2 mi:tracking-[0]" v-if="answer.unit">{{ answer.unit }}</small></span>
              <span class="mi:flex-[none] mi:text-[12px] mi:font-medium mi:text-label2 mi:opacity-0 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:group-aria-selected:opacity-100 mi:group-aria-selected:text-p-text">{{ copied ? 'Copied' : '↵ Copy' }}</span>
            </div>
            <div class="mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1 mi:gap-x-3 mi:pt-2 mi:[border-top:1px_dashed_var(--mi-sep)] mi:text-[13px] mi:text-label2 mi:tabular-nums">
              <span class="mi:font-[ui-monospace,SFMono-Regular,Menlo,monospace] mi:text-[12.5px]">{{ answer.working }}</span>
              <span v-if="answer.note" class="mi:text-label mi:font-medium">{{ answer.note }}</span>
            </div>
            <div v-if="answer.clocks" class="mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:pt-1" aria-hidden="true">
              <span v-for="(c, i) in answer.clocks" :key="i" class="mi:inline-flex mi:items-baseline mi:gap-1.5 mi:py-1 mi:px-2.5 mi:rounded-[8px] mi:text-[12px] mi:text-label2 mi:[background:var(--mi-fill4)] mi:[span+&]:before:content-['→'] mi:[span+&]:before:mx-[-4px_6px] mi:[span+&]:before:text-label2"><b class="mi:text-[13px] mi:font-semibold mi:text-label mi:tabular-nums">{{ c.time }}</b>{{ c.zone }}</span>
            </div>
          </div>

          <div v-if="results.length" role="group" aria-labelledby="spot-g-top">
            <div id="spot-g-top" class="mi:pt-3 mi:px-3 mi:pb-1.5 mi:text-[11px] mi:font-semibold mi:tracking-[.05em] mi:uppercase mi:text-label2">{{ answer ? 'Related' : 'Top hits' }}</div>
            <div
              v-for="r in results" :id="`spot-opt-${r.id}`" :key="r.id" role="option" class="mi:group mi:flex mi:items-center mi:gap-3 mi:min-h-10 mi:py-1.5 mi:px-3 mi:rounded-[10px] mi:cursor-pointer mi:aria-selected:[background:var(--mi-p)] mi:aria-selected:text-p-on"
              :aria-selected="activeId === `spot-opt-${r.id}`"
              @mousemove="active = options.indexOf(`spot-opt-${r.id}`)" @click="openItem(r)"
            >
              <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-6.5 mi:h-6.5 mi:rounded-[7px] mi:text-p-on mi:[background:var(--mi-p)] mi:group-aria-selected:shadow-[0_0_0_1.5px_color-mix(in_srgb,_var(--mi-p-on)_70%,_transparent)] mi:data-[tint=s]:bg-s mi:data-[tint=s]:text-s-on mi:data-[tint=orange]:bg-orange mi:data-[tint=orange]:text-p-on mi:data-[tint=green]:bg-green mi:data-[tint=green]:text-p-on mi:data-[tint=n]:bg-ctl mi:data-[tint=n]:text-p-on" :data-tint="r.tint"><MiIcon :name="r.icon" :size="16" /></span>
              <span class="mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[14px] mi:font-medium">{{ r.title }}</span>
              <span class="mi:hidden mi:ml-auto mi:flex-[none] mi:text-[12px] mi:text-label2 mi:group-aria-selected:text-p-on/80 mi:@[560px]:inline">{{ r.sub }}</span>
            </div>
          </div>

          <p v-if="!answer && !results.length" class="mi:m-0 mi:pt-5.5 mi:px-3 mi:pb-3 mi:text-[13px] mi:text-label2">No answer for “{{ query.trim() }}”. Try a sum, a percentage, a unit or a time zone.</p>
        </div>

        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1 mi:py-2.5 mi:px-3.5 mi:border-t mi:border-t-mat-b">
          <span class="mi:me-1 mi:text-[12px] mi:font-semibold mi:text-label2">Try</span>
          <button v-for="ex in examples" :key="ex" type="button" class="mi:[font:inherit] mi:text-[12.5px] mi:tabular-nums mi:hover:[background:var(--mi-fill3)] mi:hover:text-label mi:aria-pressed:text-p-text! mi:aria-pressed:[background:var(--mi-p-tint)]! mi:h-6.5 mi:py-0 mi:px-[9px] mi:[border:0] mi:rounded-[7px] mi:[background:none] mi:cursor-pointer mi:text-label2 mi:whitespace-nowrap mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.96)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :aria-pressed="query === ex" @click="query = ex">{{ ex }}</button>
        </div>

        <footer class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-3.5 mi:py-[9px] mi:px-4 mi:border-t mi:border-t-mat-b mi:text-[12px] mi:text-label2">
          <span class="mi:inline-flex mi:items-center mi:gap-1.5"><MiKbdGroup><MiKbd>↑</MiKbd><MiKbd>↓</MiKbd></MiKbdGroup> select</span>
          <span class="mi:inline-flex mi:items-center mi:gap-1.5"><MiKbd>↵</MiKbd> {{ activeId === 'spot-opt-answer' ? 'copy answer' : 'open' }}</span>
          <span class="mi:inline-flex mi:items-center mi:gap-1.5"><MiKbd>esc</MiKbd> {{ query ? 'clear' : 'close' }}</span>
          <span class="mi:ml-auto mi:font-medium mi:text-p-text" role="status" aria-live="polite">{{ status }}</span>
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
