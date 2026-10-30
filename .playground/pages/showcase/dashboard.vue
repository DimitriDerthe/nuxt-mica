<script setup lang="ts">
definePageMeta({ layout: false })

type Range = '7d' | '30d' | '90d'
type Status = 'Active' | 'Trial' | 'Past due' | 'Churned'
type Plan = 'Starter' | 'Team' | 'Business' | 'Enterprise'
type NavIcon = 'home' | 'person' | 'grid' | 'inbox' | 'document' | 'list'
type SideColor = 'blue' | 'purple' | 'teal'
type TileIcon = 'people' | 'check-circle'
interface NavItem { id: string, label: string, icon?: NavIcon, color?: SideColor, badge?: number }
interface NavGroup { id: string, label?: string, collapsible?: boolean, items: NavItem[] }
interface MenuPick { value?: string | number, label?: string }
interface Customer { id: string, customer: string, email: string, plan: Plan, status: Status, mrr: number, region: string, last: string, [k: string]: unknown }
interface Tile { label: string, value: string, delta: string, trend: 'up' | 'down', good: boolean, spark: number[], icon?: TileIcon, svg?: string, color: string }
interface RangeData {
  label: string
  period: string
  revenue: { value: string, prev: string, delta: string, max: number, cats: string[], cur: number[], prev2: number[] }
  tiles: Tile[]
  traffic: { cats: string[], cur: number[], prev: number[], sub: string, peak: string }
  avgSession: string
  bounce: string
}

const toast = useMiToast()

// ---------- custom glyphs (MiIcon svg prop, 24x24 grid) ----------
const g = (d: string) => `<g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</g>`
const glyph = {
  revenue: g('<path d="M3 17l5.5-5.5 4 4L20 8"/><path d="M14.5 8H20v5.5"/>'),
  churn: g('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16.5 11.5h5"/>'),
  retention: g('<path d="M17 2.5l3 3-3 3"/><path d="M4 11.5v-2a4 4 0 0 1 4-4h12"/><path d="M7 21.5l-3-3 3-3"/><path d="M20 12.5v2a4 4 0 0 1-4 4H4"/>'),
  upgrade: g('<path d="M12 19V6"/><path d="M6.5 11.5L12 6l5.5 5.5"/>'),
  report: g('<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8.5 15v-3M12 15V9M15.5 15v-5"/>'),
  storage: g('<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6"/><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>'),
  card: g('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h3"/>')
}

// ---------- navigation ----------
const nav = ref('overview')
const drawer = ref(false)
const collapsed = ref(false)
const groups: NavGroup[] = [
  { id: 'analytics', label: 'Analytics', items: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'customers', label: 'Customers', icon: 'people', badge: 4 },
    { id: 'reports', label: 'Reports', icon: 'grid' },
    { id: 'events', label: 'Live events', icon: 'inbox' }
  ] },
  { id: 'workspace', label: 'Workspace', items: [
    { id: 'billing', label: 'Billing', icon: 'billing' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ] },
  { id: 'segments', label: 'Segments', collapsible: true, items: [
    { id: 's-self', label: 'Self-serve', color: 'blue' },
    { id: 's-ent', label: 'Enterprise', color: 'purple' },
    { id: 's-edu', label: 'Education', color: 'teal' }
  ] }
]
const crumbs = [{ label: 'Northwind Labs', href: '#' }, { label: 'Analytics', href: '#' }, { label: 'Overview' }]
const workspaceItems = [
  { heading: 'Workspaces' },
  { value: 'northwind', label: 'Northwind Labs', checked: true },
  { value: 'fieldnote', label: 'Fieldnote' },
  { value: 'harbor', label: 'Harbor Post' },
  { separator: true },
  { value: 'new', label: 'Create workspace' }
]
const accountItems = [
  { heading: 'alex@northwind.dev' },
  { value: 'profile', label: 'Profile' },
  { value: 'invite', label: 'Invite teammate' },
  { value: 'prefs', label: 'Preferences', shortcut: '⌘,' },
  { separator: true },
  { value: 'out', label: 'Sign out', destructive: true }
]
function onNav(item?: { id?: string, label?: string }) {
  drawer.value = false
  if (!item?.id || item.id === 'overview') { nav.value = 'overview'; return }
  toast.info(`${item.label ?? item.id} is not part of this demo`)
  nav.value = 'overview'
}
function onWorkspace(item: MenuPick) {
  if (item.value === 'northwind') return
  toast.info(item.value === 'new' ? 'Workspace creation is disabled in the demo' : `${item.label} is not part of this demo`)
}
function onAccount(item: MenuPick) {
  if (item.value === 'invite') toast.success('Invitation sent', { description: 'Taylor Quinn will get an email shortly' })
  else if (item.value === 'out') toast.warning('Sign out is disabled in the demo')
  else toast.info(String(item.label))
}

// ---------- notifications ----------
const notifOpen = ref(false)
const unread = ref(3)
const notes = [
  { id: 'n1', title: 'Enterprise upgrade', message: 'Kenji Watanabe moved Sora Works to Enterprise.', time: '4m', icon: 'success', tone: 'success' },
  { id: 'n2', title: 'Payment failed: Brisa', message: 'Card declined for $1,320. Next retry on Nov 2.', time: '22m', icon: 'warning', tone: 'warning' },
  { id: 'n3', title: 'Event storage at 91%', message: 'You will hit the plan limit in about 6 days.', time: '5h', icon: 'danger', tone: 'danger' }
] as const
function markRead() { unread.value = 0; notifOpen.value = false; toast.success('All caught up') }

// ---------- range driven data ----------
const range = ref<Range>('30d')
const rangeOptions = [{ value: '7d', label: '7D' }, { value: '30d', label: '30D' }, { value: '90d', label: '90D' }]
const C = { p: 'var(--mi-p)', s: 'var(--mi-s)', green: 'var(--mi-green)', orange: 'var(--mi-orange)' }
const data: Record<Range, RangeData> = {
  '7d': {
    label: 'Oct 24 – Oct 30, 2026', period: '7 days',
    revenue: { value: '$48,210', prev: '$46,310', delta: '4.1%', max: 60, cats: ['Oct 24', 'Oct 25', 'Oct 26', 'Oct 27', 'Oct 28', 'Oct 29', 'Oct 30'], cur: [6.4, 13.5, 20.6, 27.3, 34.6, 41.2, 48.2], prev2: [6.1, 12.7, 19.4, 25.9, 32.8, 39.2, 46.3] },
    tiles: [
      { label: 'Active accounts', value: '2,418', delta: '2.3%', trend: 'up', good: true, icon: 'people', color: C.p, spark: [2310, 2322, 2341, 2338, 2377, 2392, 2405, 2418] },
      { label: 'Trial conversion', value: '18.4%', delta: '1.2 pt', trend: 'up', good: true, icon: 'check-circle', color: C.s, spark: [16.1, 16.8, 17.2, 16.9, 17.6, 18.0, 18.1, 18.4] },
      { label: 'Net retention', value: '113.2%', delta: '0.6 pt', trend: 'up', good: true, svg: glyph.retention, color: C.green, spark: [111.9, 112.1, 112.4, 112.2, 112.7, 112.9, 113.0, 113.2] },
      { label: 'Logo churn', value: '1.9%', delta: '0.3 pt', trend: 'down', good: true, svg: glyph.churn, color: C.orange, spark: [2.4, 2.3, 2.3, 2.2, 2.1, 2.0, 2.0, 1.9] }
    ],
    traffic: { cats: ['Oct 24', 'Oct 25', 'Oct 26', 'Oct 27', 'Oct 28', 'Oct 29', 'Oct 30'], cur: [42.1, 45.8, 47.2, 44.9, 49.6, 38.4, 36.9], prev: [40.2, 41.5, 44.8, 43.1, 45.7, 37.1, 35.2], sub: 'Daily sessions, this week vs last week', peak: 'Oct 28' },
    avgSession: '4m 06s', bounce: '37.4%'
  },
  '30d': {
    label: 'Oct 1 – Oct 30, 2026', period: '30 days',
    revenue: { value: '$191,240', prev: '$174,480', delta: '9.6%', max: 200, cats: ['Oct 3', 'Oct 6', 'Oct 9', 'Oct 12', 'Oct 15', 'Oct 18', 'Oct 21', 'Oct 24', 'Oct 27', 'Oct 30'], cur: [17.9, 37.2, 56.0, 76.4, 95.8, 115.1, 134.9, 153.6, 172.5, 191.2], prev2: [16.8, 34.1, 51.9, 69.8, 87.0, 104.6, 121.8, 139.5, 157.0, 174.5] },
    tiles: [
      { label: 'Active accounts', value: '2,418', delta: '7.4%', trend: 'up', good: true, icon: 'people', color: C.p, spark: [2250, 2268, 2301, 2330, 2342, 2371, 2398, 2418] },
      { label: 'Trial conversion', value: '17.8%', delta: '0.4 pt', trend: 'down', good: false, icon: 'check-circle', color: C.s, spark: [18.9, 18.6, 18.4, 18.5, 18.1, 17.9, 18.0, 17.8] },
      { label: 'Net retention', value: '112.4%', delta: '1.8 pt', trend: 'up', good: true, svg: glyph.retention, color: C.green, spark: [109.8, 110.2, 110.9, 111.0, 111.6, 111.9, 112.1, 112.4] },
      { label: 'Logo churn', value: '2.1%', delta: '0.2 pt', trend: 'down', good: true, svg: glyph.churn, color: C.orange, spark: [2.6, 2.5, 2.5, 2.4, 2.3, 2.3, 2.2, 2.1] }
    ],
    traffic: { cats: ['Oct 3', 'Oct 6', 'Oct 9', 'Oct 12', 'Oct 15', 'Oct 18', 'Oct 21', 'Oct 24', 'Oct 27', 'Oct 30'], cur: [38.2, 40.1, 39.4, 43.8, 45.2, 44.1, 48.7, 50.3, 49.1, 53.6], prev: [35.4, 36.8, 38.9, 37.6, 40.2, 41.5, 40.8, 43.1, 44.6, 45.2], sub: 'Sessions per 3 days, vs previous 30 days', peak: 'Oct 30' },
    avgSession: '4m 12s', bounce: '38.2%'
  },
  '90d': {
    label: 'Aug 2 – Oct 30, 2026', period: '90 days',
    revenue: { value: '$548,630', prev: '$452,290', delta: '21.3%', max: 600, cats: ['Aug 8', 'Aug 15', 'Aug 22', 'Aug 29', 'Sep 5', 'Sep 12', 'Sep 19', 'Sep 26', 'Oct 3', 'Oct 10', 'Oct 17', 'Oct 24'], cur: [39.8, 81.2, 123.9, 167.0, 211.5, 256.1, 301.8, 348.0, 395.6, 444.3, 495.1, 548.6], prev2: [34.0, 68.9, 104.1, 139.9, 176.1, 212.8, 250.2, 288.3, 327.6, 367.9, 409.4, 452.3] },
    tiles: [
      { label: 'Active accounts', value: '2,418', delta: '18.9%', trend: 'up', good: true, icon: 'people', color: C.p, spark: [2034, 2088, 2141, 2190, 2262, 2310, 2371, 2418] },
      { label: 'Trial conversion', value: '17.2%', delta: '2.1 pt', trend: 'up', good: true, icon: 'check-circle', color: C.s, spark: [14.6, 15.1, 15.8, 16.0, 16.4, 16.9, 17.0, 17.2] },
      { label: 'Net retention', value: '110.8%', delta: '3.2 pt', trend: 'up', good: true, svg: glyph.retention, color: C.green, spark: [107.6, 108.1, 108.9, 109.2, 109.8, 110.1, 110.5, 110.8] },
      { label: 'Logo churn', value: '2.4%', delta: '0.1 pt', trend: 'up', good: false, svg: glyph.churn, color: C.orange, spark: [2.1, 2.2, 2.2, 2.3, 2.2, 2.3, 2.4, 2.4] }
    ],
    traffic: { cats: ['Aug 8', 'Aug 15', 'Aug 22', 'Aug 29', 'Sep 5', 'Sep 12', 'Sep 19', 'Sep 26', 'Oct 3', 'Oct 10', 'Oct 17', 'Oct 24'], cur: [31.5, 33.2, 32.8, 35.9, 37.4, 36.1, 40.2, 42.8, 41.9, 45.5, 48.3, 52.1], prev: [29.1, 30.4, 31.7, 30.9, 33.2, 34.8, 33.9, 36.2, 38.1, 37.4, 40.6, 42.3], sub: 'Weekly sessions, vs previous 90 days', peak: 'Week of Oct 24' },
    avgSession: '4m 19s', bounce: '39.0%'
  }
}
const rd = computed(() => data[range.value])
const revSeries = computed(() => [
  { name: 'This period', data: rd.value.revenue.cur, color: C.p },
  { name: 'Previous period', data: rd.value.revenue.prev2, color: 'var(--mi-label3)', area: false }
])
const fmtK = (v: number) => `$${v.toFixed(1)}k`

const trafficView = ref<'chart' | 'table'>('chart')
const viewOptions = [{ value: 'chart', label: 'Chart' }, { value: 'table', label: 'Table' }]
const trafficSeries = computed(() => [
  { name: 'This period', data: rd.value.traffic.cur, color: C.p },
  { name: 'Previous', data: rd.value.traffic.prev, color: 'var(--mi-label3)', area: false }
])
const trafficLegend = [{ label: 'This period', color: C.p, shape: 'line' as const }, { label: 'Previous', color: 'var(--mi-label3)', shape: 'line' as const }]
const sum = (a: number[]) => a.reduce((s, n) => s + n, 0)
const trafficStats = computed(() => {
  const cur = sum(rd.value.traffic.cur)
  const prev = sum(rd.value.traffic.prev)
  return [
    { label: 'Sessions', value: `${cur.toFixed(1)}K`, delta: `${(((cur - prev) / prev) * 100).toFixed(1)}%` },
    { label: 'Avg. session', value: rd.value.avgSession },
    { label: 'Bounce rate', value: rd.value.bounce },
    { label: 'Peak', value: rd.value.traffic.peak }
  ]
})

const signups = [
  { label: 'W37', value: 118 }, { label: 'W38', value: 132 }, { label: 'W39', value: 126 }, { label: 'W40', value: 149 },
  { label: 'W41', value: 141 }, { label: 'W42', value: 168 }, { label: 'W43', value: 176 }, { label: 'W44', value: 164 }
].map((d, i, a) => ({ ...d, color: i === a.length - 1 ? C.p : 'color-mix(in oklab, var(--mi-p) 34%, var(--mi-card))' }))
const planMix = [
  { label: 'Enterprise', value: 74300, color: 'var(--mi-p)' },
  { label: 'Business', value: 61800, color: 'color-mix(in oklab, var(--mi-p) 62%, var(--mi-card))' },
  { label: 'Team', value: 32500, color: 'color-mix(in oklab, var(--mi-p) 44%, var(--mi-card))' },
  { label: 'Starter', value: 22400, color: 'var(--mi-s)' }
]
const rings = [
  { label: 'Activation', sub: '71% · goal 80%', value: 0.89 },
  { label: 'Retention', sub: '88% · goal 90%', value: 0.98 },
  { label: 'Expansion', sub: '34% · goal 50%', value: 0.68 }
]
const capacity = [
  { label: 'API requests', value: 82, caption: '8.2M of 10M', hint: '1.8M left', color: undefined },
  { label: 'Seats', value: 46, caption: '23 of 50', hint: '27 free', color: 'var(--mi-s)' },
  { label: 'Event storage', value: 91, caption: '455M of 500M', hint: 'Full in ~6 days', color: 'var(--mi-orange)' }
]
const activity = [
  { id: 'a1', who: 'Kenji Watanabe', text: 'upgraded Sora Works to Enterprise', time: '4 min', amount: '+$4,100', good: true },
  { id: 'a2', who: 'Payment failed', text: 'for Brisa, retry scheduled Nov 2', time: '22 min', amount: '$1,320', good: false, svg: glyph.card, color: 'var(--mi-orange)' },
  { id: 'a3', who: 'Isla Brennan', text: 'started a 14-day Team trial', time: '1 h' },
  { id: 'a4', who: 'Activation funnel', text: 'weekly report sent to 14 people', time: '2 h', svg: glyph.report, color: 'var(--mi-p)' },
  { id: 'a5', who: 'Maren Holloway', text: 'invited 3 teammates to Fieldnote', time: '3 h' },
  { id: 'a6', who: 'Event storage at 91%', text: 'of the 500M events in your plan', time: '5 h', svg: glyph.storage, color: 'var(--mi-red)' }
]

// ---------- customers table ----------
const initial: Customer[] = [
  { id: 'c01', customer: 'Maren Holloway', email: 'maren@fieldnote.io', plan: 'Business', status: 'Active', mrr: 2400, region: 'Europe', last: '2 min ago' },
  { id: 'c02', customer: 'Tomas Reyes', email: 'tomas@oakline.co', plan: 'Team', status: 'Active', mrr: 640, region: 'North America', last: '18 min ago' },
  { id: 'c03', customer: 'Priya Nandakumar', email: 'priya@lumenlabs.com', plan: 'Enterprise', status: 'Active', mrr: 7800, region: 'Asia Pacific', last: '1 h ago' },
  { id: 'c04', customer: 'Elliot Brandt', email: 'elliot@harborpost.de', plan: 'Starter', status: 'Trial', mrr: 0, region: 'Europe', last: '3 h ago' },
  { id: 'c05', customer: 'Ngozi Adeyemi', email: 'ngozi@kestrel.africa', plan: 'Team', status: 'Past due', mrr: 480, region: 'Africa', last: 'Yesterday' },
  { id: 'c06', customer: 'Joaquin Ferrer', email: 'joaquin@vela.studio', plan: 'Business', status: 'Active', mrr: 1950, region: 'Europe', last: 'Yesterday' },
  { id: 'c07', customer: 'Hannah Whitfield', email: 'hannah@cedarpath.org', plan: 'Starter', status: 'Churned', mrr: 0, region: 'North America', last: 'Oct 21' },
  { id: 'c08', customer: 'Kenji Watanabe', email: 'kenji@sora-works.jp', plan: 'Enterprise', status: 'Active', mrr: 9200, region: 'Asia Pacific', last: 'Oct 27' },
  { id: 'c09', customer: 'Isla Brennan', email: 'isla@tidewater.ie', plan: 'Team', status: 'Trial', mrr: 0, region: 'Europe', last: 'Oct 27' },
  { id: 'c10', customer: 'Mateus Carvalho', email: 'mateus@brisa.com.br', plan: 'Business', status: 'Past due', mrr: 1320, region: 'South America', last: 'Oct 25' },
  { id: 'c11', customer: 'Dana Okafor', email: 'dana@northgate.co', plan: 'Team', status: 'Active', mrr: 720, region: 'North America', last: 'Oct 24' },
  { id: 'c12', customer: 'Sofia Lindqvist', email: 'sofia@fjordly.se', plan: 'Starter', status: 'Active', mrr: 90, region: 'Europe', last: 'Oct 22' }
]
const customers = ref<Customer[]>([...initial])
const q = ref('')
const status = ref<string>('All')
const plan = ref<string | number | null>('all')
const statuses = ['All', 'Active', 'Trial', 'Past due', 'Churned']
const planOptions = [{ value: 'all', label: 'All plans' }, ...(['Starter', 'Team', 'Business', 'Enterprise'] as Plan[]).map(p => ({ value: p, label: p }))]
const tones: Record<Status, 'success' | 'primary' | 'warning' | 'neutral'> = { 'Active': 'success', 'Trial': 'primary', 'Past due': 'warning', 'Churned': 'neutral' }
const toneOf = (s: unknown) => tones[s as Status] ?? 'neutral'
const columns = [
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'mrr', label: 'MRR', sortable: true, numeric: true, align: 'end' as const },
  { key: 'region', label: 'Region', muted: true },
  { key: 'last', label: 'Last seen', muted: true },
  { key: 'actions', label: '', width: '52px' }
]
const counts = computed(() => {
  const m: Record<string, number> = { All: customers.value.length }
  for (const c of customers.value) m[c.status] = (m[c.status] ?? 0) + 1
  return m
})
const rows = computed(() => customers.value.filter(c =>
  (status.value === 'All' || c.status === status.value)
  && (plan.value === 'all' || c.plan === plan.value)
  && (!q.value.trim() || `${c.customer} ${c.email} ${c.plan}`.toLowerCase().includes(q.value.trim().toLowerCase()))))
const rowsMrr = computed(() => rows.value.reduce((s, c) => s + c.mrr, 0))
const pastDue = computed(() => counts.value['Past due'] ?? 0)
const selected = ref<string[]>([])
const sort = ref<{ key: string, dir: 'asc' | 'desc' } | null>({ key: 'mrr', dir: 'desc' })
const money = (n: number) => n ? `$${n.toLocaleString('en-US')}` : '—'
const menuItems = [
  { value: 'view', label: 'Open profile' },
  { value: 'copy', label: 'Copy email' },
  { value: 'invoice', label: 'Send invoice' },
  { separator: true },
  { value: 'delete', label: 'Delete customer', destructive: true }
]
const pending = ref<string[]>([])
const confirm = ref(false)
const dlgTitle = computed(() => pending.value.length === 1
  ? `Delete ${customers.value.find(c => c.id === pending.value[0])?.customer ?? 'customer'}?`
  : `Delete ${pending.value.length} customers?`)
function onRowAction(item: MenuPick, row: Record<string, unknown>) {
  const c = customers.value.find(x => x.id === row.id)
  if (!c) return
  if (item.value === 'copy') {
    navigator.clipboard?.writeText(c.email).catch(() => {})
    toast.success('Email copied', { description: c.email })
  }
  else if (item.value === 'view') toast.info(`Opening ${c.customer}`)
  else if (item.value === 'invoice') toast.success('Invoice sent', { description: `Queued for ${c.email}` })
  else if (item.value === 'delete') { pending.value = [c.id]; confirm.value = true }
}
function askBulk() { pending.value = [...selected.value]; confirm.value = true }
function onDialog(id: string) {
  if (id !== 'delete') return
  const gone = customers.value.filter(c => pending.value.includes(c.id))
  customers.value = customers.value.filter(c => !pending.value.includes(c.id))
  selected.value = selected.value.filter(i => !pending.value.includes(i))
  toast.success(gone.length === 1 ? 'Customer deleted' : `${gone.length} customers deleted`, {
    action: { label: 'Undo', onClick: () => { customers.value = initial.filter(c => customers.value.some(x => x.id === c.id) || gone.some(x => x.id === c.id)) } }
  })
}
function bulkInvoice() { toast.success(`${selected.value.length} invoices queued`, { description: 'Customers get them within a few minutes' }) }
function bulkExport() { toast.success('Export started', { description: `${selected.value.length} selected customers, CSV` }) }
function resetFilters() { q.value = ''; status.value = 'All'; plan.value = 'all' }
function exportCsv() { toast.success('Export started', { description: `${rows.value.length} customers, CSV` }) }
function addCustomer() { toast.info('Adding customers is disabled in the demo') }
function toTable() { document.getElementById('customers')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
function showPastDue() { status.value = 'Past due'; plan.value = 'all'; q.value = ''; toTable() }
</script>

<template>
  <div class="dash" :class="{ 'is-collapsed': collapsed }">
    <!-- Sidebar: full-height column, sticky contents -->
    <aside class="side" aria-label="Workspace" :inert="collapsed || undefined">
      <div class="side__in">
        <div class="side__head">
          <MiMenu :items="workspaceItems" placement="bottom-start" aria-label="Switch workspace" @select="onWorkspace">
            <template #trigger="{ props }">
              <button v-bind="props" type="button" class="ws">
                <span class="mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 9.5c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.6-1.6 5-.6" /><path d="M3 15c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.6-1.6 5-.6" opacity=".55" /></svg>
                </span>
                <span class="ws__txt"><strong>Northwind Labs</strong><small>Tideline · Pro plan</small></span>
                <MiIcon name="chevron-up-down" :size="15" class="ws__chev" />
              </button>
            </template>
          </MiMenu>
        </div>
        <MiSidebar :model-value="nav" :groups="groups" aria-label="Main" class="side__nav" @select="onNav" />
        <div class="usage">
          <div class="usage__row"><span class="usage__plan">Pro plan</span><span class="usage__renew">Renews Nov 1</span></div>
          <MiMeter :value="82" label="API requests" caption="8.2M of 10M" size="sm" />
          <MiButton variant="tinted" size="small" block @click="toast.info('Plan changes are disabled in the demo')">Upgrade to Business</MiButton>
        </div>
      </div>
    </aside>

    <div class="main">
      <div class="wash" aria-hidden="true" />
      <header class="top">
        <MiIconButton class="top__drawer" label="Open navigation" variant="plain" size="toolbar" @click="drawer = true">
          <MiIcon name="sidebar" :size="19" />
        </MiIconButton>
        <MiIconButton class="top__toggle" :label="collapsed ? 'Show sidebar' : 'Hide sidebar'" variant="plain" size="toolbar" :pressed="!collapsed" @click="collapsed = !collapsed">
          <MiIcon name="sidebar" :size="19" />
        </MiIconButton>
        <span class="top__brand">
          <span class="mark mark--sm" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M3 9.5c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.6-1.6 5-.6" /><path d="M3 15c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.6-1.6 5-.6" opacity=".55" /></svg>
          </span>
          <strong>Tideline</strong>
        </span>
        <span class="top__sep" aria-hidden="true" />
        <MiBreadcrumb class="top__crumbs" :items="crumbs" />
        <div class="top__end">
          <MiSearch v-model="q" class="top__search" size="compact" placeholder="Search customers…" hotkey="k" shortcut="⌘K" aria-label="Search customers" @search="toTable" />
          <MiPopover v-model="notifOpen" placement="bottom-end" :width="360" flush label="Notifications">
            <template #trigger="{ attrs }">
              <span class="bell">
                <MiIconButton v-bind="attrs" :label="unread ? `Notifications, ${unread} unread` : 'Notifications'" variant="plain" size="toolbar">
                  <MiIcon name="bell" :size="19" />
                </MiIconButton>
                <span v-if="unread" class="bell__dot" aria-hidden="true" />
              </span>
            </template>
            <div class="notes">
              <div class="notes__head">
                <strong>Notifications</strong>
                <MiButton variant="plain" size="small" :disabled="!unread" @click="markRead">Mark all read</MiButton>
              </div>
              <div class="notes__list">
                <MiNotification
                  v-for="n in notes" :key="n.id" :title="n.title" :message="n.message" :time="n.time" :icon="n.icon" :tone="n.tone"
                  interactive live="off" @click="notifOpen = false; toast.info(n.title)"
                />
              </div>
            </div>
          </MiPopover>
          <span class="top__div" aria-hidden="true" />
          <MiMenu :items="accountItems" placement="bottom-end" aria-label="Account menu" @select="onAccount">
            <template #trigger="{ props }">
              <button v-bind="props" type="button" class="me" aria-label="Account menu"><MiAvatar name="Alex Morgan" size="sm" tone="auto" decorative /></button>
            </template>
          </MiMenu>
        </div>
      </header>

      <main class="content">
        <NuxtLink to="/showcase" class="back"><MiIcon name="chevron-left" :size="14" />Back to showcase</NuxtLink>

        <section class="head rise" style="--i:0">
          <div class="head__txt">
            <p class="head__date">Friday, October 30</p>
            <h1>Welcome back, Alex</h1>
            <p class="head__lede">
              Revenue is pacing <b class="up">{{ rd.revenue.delta }} ahead</b> of the previous {{ rd.period }}.
              <button type="button" class="head__link" @click="showPastDue">{{ pastDue }} accounts are past due</button>
            </p>
          </div>
          <div class="head__ctl">
            <span class="rangepill"><MiIcon name="calendar" :size="15" /><span>{{ rd.label }}</span></span>
            <MiSegmented v-model="range" :options="rangeOptions" label="Date range" />
          </div>
        </section>

        <!-- Signature: hero KPI band -->
        <section class="card hero rise" style="--i:1" aria-label="Key metrics">
          <div class="hero__lead">
            <div class="hero__label">
              <span class="chip" style="--c: var(--mi-p)"><MiIcon :svg="glyph.revenue" :size="16" /></span>
              <span>Revenue</span>
              <span class="hero__muted">Gross volume · {{ rd.period }}</span>
            </div>
            <div class="hero__fig">
              <span :key="range" class="hero__value tick">{{ rd.revenue.value }}</span>
              <span class="delta is-good"><MiIcon name="arrow-up" :size="12" :weight="2.4" />{{ rd.revenue.delta }}</span>
            </div>
            <p class="hero__cmp">vs {{ rd.revenue.prev }} in the previous {{ rd.period }}</p>
            <MiLineChart
              class="hero__chart" :card="false" :toolbar="false" :end-labels="false" :categories="rd.revenue.cats" :series="revSeries"
              unit="k" :ticks="2" :max="rd.revenue.max" :height="164" :format-value="fmtK" aria-label="Cumulative revenue, this period vs previous period"
            />
          </div>
          <ul class="hero__tiles">
            <li v-for="t in rd.tiles" :key="t.label" class="tile" :style="{ '--c': t.color }">
              <div class="tile__top">
                <span class="chip"><MiIcon v-if="t.icon" :name="t.icon" :size="15" /><MiIcon v-else :svg="t.svg" :size="15" /></span>
                <span class="tile__label">{{ t.label }}</span>
              </div>
              <div :key="range" class="tile__value tick">{{ t.value }}</div>
              <div class="tile__foot">
                <span class="delta" :class="t.good ? 'is-good' : 'is-bad'">
                  <MiIcon :name="t.trend === 'up' ? 'arrow-up' : 'arrow-down'" :size="12" :weight="2.4" />{{ t.delta }}
                </span>
                <MiSparkline :values="t.spark" :stroke="t.color" :color="t.color" :width="72" :height="26" />
              </div>
            </li>
          </ul>
        </section>

        <!-- Primary chart + activity -->
        <section class="grid grid--a rise" style="--i:2">
          <article class="card traffic" aria-labelledby="traffic-h">
            <header class="ch">
              <div class="ch__t"><h2 id="traffic-h">Traffic</h2><p>{{ rd.traffic.sub }}</p></div>
              <div class="ch__a">
                <MiChartLegend class="traffic__legend" :items="trafficLegend" />
                <MiSegmented v-model="trafficView" :options="viewOptions" label="Traffic view" />
              </div>
            </header>
            <dl class="kstrip">
              <div v-for="s in trafficStats" :key="s.label" class="kstrip__item">
                <dt>{{ s.label }}</dt>
                <dd><span class="num">{{ s.value }}</span><span v-if="s.delta" class="kstrip__delta">+{{ s.delta }}</span></dd>
              </div>
            </dl>
            <div class="traffic__chart">
              <MiLineChart
                v-model:view="trafficView" :card="false" :toolbar="false" :categories="rd.traffic.cats" :series="trafficSeries"
                unit="K" :height="268" :end-labels="false" category-label="Period" aria-label="Sessions over time"
              />
            </div>
          </article>

          <article class="card feed" aria-labelledby="feed-h">
            <header class="ch">
              <div class="ch__t">
                <h2 id="feed-h">Activity</h2>
                <p class="ch__live"><span class="live" aria-hidden="true" />Live from your workspace</p>
              </div>
              <div class="ch__a"><MiTextLink href="#customers" :chevron="true">View all</MiTextLink></div>
            </header>
            <ol class="feed__list">
              <li v-for="e in activity" :key="e.id" class="ev">
                <MiAvatar v-if="!e.svg" :name="e.who" :size="30" tone="auto" decorative />
                <span v-else class="chip chip--round" :style="{ '--c': e.color }"><MiIcon :svg="e.svg" :size="15" /></span>
                <p class="ev__txt"><strong>{{ e.who }}</strong> {{ e.text }}</p>
                <span class="ev__meta">
                  <span v-if="e.amount" class="ev__amt" :class="e.good ? 'is-good' : 'is-warn'">{{ e.amount }}</span>
                  <time>{{ e.time }}</time>
                </span>
              </li>
            </ol>
          </article>
        </section>

        <!-- Secondary charts -->
        <section class="grid grid--b rise" style="--i:3">
          <article class="card" aria-labelledby="new-h">
            <header class="ch">
              <div class="ch__t"><h2 id="new-h">New customers</h2><p>Per week, last 8 weeks</p></div>
              <div class="ch__stat"><span class="num">164</span><small>this week</small></div>
            </header>
            <div class="card__body">
              <MiBarChart :card="false" :data="signups" :height="196" :max-bar-width="28" aria-label="New customers per week" />
            </div>
          </article>

          <article class="card" aria-labelledby="plan-h">
            <header class="ch">
              <div class="ch__t"><h2 id="plan-h">Revenue by plan</h2><p>Monthly recurring, October</p></div>
              <div class="ch__stat"><span class="num">$191k</span><small>MRR</small></div>
            </header>
            <div class="card__body card__body--stack">
              <MiStackedBar :segments="planMix" :legend-columns="1" :height="24" aria-label="Revenue by plan" />
            </div>
          </article>

          <article class="card" aria-labelledby="goals-h">
            <header class="ch">
              <div class="ch__t"><h2 id="goals-h">Q4 goals</h2><p>Day 30 of 92</p></div>
              <div class="ch__stat"><span class="num">2/3</span><small>on track</small></div>
            </header>
            <div class="card__body card__body--rings">
              <MiRings :card="false" :rings="rings" :size="132" :stroke-width="11" aria-label="Quarter goals progress" />
            </div>
          </article>
        </section>

        <!-- Capacity strip -->
        <section class="card cap rise" style="--i:4" aria-labelledby="cap-h">
          <div class="cap__intro">
            <h2 id="cap-h">Workspace capacity</h2>
            <p>Billing cycle resets Nov 1</p>
            <MiButton variant="gray" size="small" @click="toast.info('Plan changes are disabled in the demo')">Manage limits</MiButton>
          </div>
          <div v-for="m in capacity" :key="m.label" class="cap__m">
            <MiMeter :value="m.value" :label="m.label" :caption="m.caption" :hint="m.hint" :color="m.color" />
          </div>
        </section>

        <!-- Customers -->
        <section id="customers" class="card tbl rise" style="--i:5" aria-labelledby="cust-h">
          <header class="ch ch--tbl">
            <div class="ch__t">
              <h2 id="cust-h">Customers</h2>
              <p><span class="num">{{ rows.length }}</span> of {{ customers.length }} accounts · <span class="num">{{ money(rowsMrr) }}</span> MRR</p>
            </div>
            <div class="ch__a">
              <MiButton variant="gray" size="small" @click="exportCsv"><template #leading><MiIcon name="arrow-down" :size="14" /></template>Export</MiButton>
              <MiButton size="small" @click="addCustomer"><template #leading><MiIcon name="plus" :size="14" /></template>Add customer</MiButton>
            </div>
          </header>

          <div class="tbar">
            <div class="tbar__filters" :inert="selected.length ? true : undefined">
              <div class="chips" role="group" aria-label="Filter by status">
                <MiChip
                  v-for="s in statuses" :key="s" selectable size="small" :model-value="status === s" @update:model-value="status = s"
                >
                  {{ s }}<span class="chips__n">{{ counts[s] ?? 0 }}</span>
                </MiChip>
              </div>
              <div class="tbar__right">
                <MiSearch v-model="q" class="tbar__search" size="compact" placeholder="Search" aria-label="Search customers in table" />
                <MiSelect v-model="plan" :options="planOptions" size="sm" class="tbar__plan" aria-label="Plan" />
              </div>
            </div>
            <Transition name="bulk">
              <div v-if="selected.length" class="bulk" role="toolbar" aria-label="Bulk actions">
                <span class="bulk__n"><b class="num">{{ selected.length }}</b> selected</span>
                <span class="bulk__acts">
                  <MiButton variant="gray" size="small" @click="bulkInvoice">Send invoices</MiButton>
                  <MiButton variant="gray" size="small" class="bulk__opt" @click="bulkExport">Export</MiButton>
                  <MiButton variant="destructive" soft size="small" @click="askBulk"><template #leading><MiIcon name="trash" :size="14" /></template>Delete</MiButton>
                  <MiIconButton label="Clear selection" variant="plain" size="small" @click="selected = []"><MiIcon name="close" :size="16" /></MiIconButton>
                </span>
              </div>
            </Transition>
          </div>

          <div v-if="!rows.length" class="tbl__empty">
            <MiEmptyState
              icon="search" title="No customers found"
              :description="q ? `Nothing matches “${q}”. Check the spelling or clear your filters.` : 'No customers match these filters.'"
              primary-label="Clear filters" @primary="resetFilters"
            />
          </div>
          <div v-else>
            <MiTable
              v-model:selected="selected" v-model:sort="sort" class="tbl__table" :columns="columns" :rows="rows" selectable="multiple"
              caption="Customers" :zebra="false" density="relaxed" max-height="492px"
            >
              <template #cell-customer="{ row }">
                <span class="who">
                  <MiAvatar :name="String(row.customer)" :size="30" tone="auto" decorative />
                  <span class="who__txt"><strong>{{ row.customer }}</strong><small>{{ row.email }}</small></span>
                </span>
              </template>
              <template #cell-plan="{ row }"><span class="plan">{{ row.plan }}</span></template>
              <template #cell-status="{ row }"><MiBadge dot :tone="toneOf(row.status)">{{ row.status }}</MiBadge></template>
              <template #cell-mrr="{ row }"><span class="num" :class="{ 'is-zero': !row.mrr }">{{ money(Number(row.mrr)) }}</span></template>
              <template #cell-actions="{ row }">
                <MiMenu :items="menuItems" placement="bottom-end" :aria-label="`Actions for ${row.customer}`" @select="(i) => onRowAction(i, row)">
                  <template #trigger="{ props }">
                    <MiIconButton v-bind="props" :label="`Actions for ${row.customer}`" variant="plain" size="small"><MiIcon name="more" :size="18" /></MiIconButton>
                  </template>
                </MiMenu>
              </template>
            </MiTable>
          </div>
          <footer class="tbl__foot">
            <span>Synced from Stripe 4 minutes ago</span>
            <span class="num">{{ selected.length ? `${selected.length} of ${rows.length} selected` : `${rows.length} rows` }}</span>
          </footer>
        </section>
      </main>
    </div>

    <MiSheet v-model="drawer" title="Northwind Labs" :detents="['large']" cancel-label="Close">
      <div class="drawer">
        <MiSidebar :model-value="nav" :groups="groups" aria-label="Navigation" class="drawer__nav" @select="onNav" />
        <div class="usage">
          <div class="usage__row"><span class="usage__plan">Pro plan</span><span class="usage__renew">Renews Nov 1</span></div>
          <MiMeter :value="82" label="API requests" caption="8.2M of 10M" size="sm" />
        </div>
      </div>
    </MiSheet>

    <MiDialog
      v-model="confirm" :title="dlgTitle" message="This removes the account and its usage history. You can undo this for a few seconds."
      :actions="[{ id: 'cancel', label: 'Cancel', kind: 'cancel' }, { id: 'delete', label: 'Delete', kind: 'destructive' }]" @action="onDialog"
    />
    <MiToaster position="bottom-right" />
  </div>
</template>

<style scoped>
/* ---------- page tokens (derived from Mica tokens only) ---------- */
.dash{
  --top:68px;
  --d-canvas:var(--mi-page);
  --d-side:color-mix(in oklab,var(--mi-side) 70%,var(--mi-page));
  --d-card:var(--mi-card);
  --d-line:color-mix(in oklab,var(--mi-sep) 72%,transparent);
  --d-hi:transparent;
  --d-sh:0 1px 2px color-mix(in oklab,var(--mi-label) 5%,transparent),0 4px 16px -8px color-mix(in oklab,var(--mi-label) 8%,transparent);
  --d-r:14px;
  --d-gap:12px;
  position:relative;min-height:calc(100dvh - var(--top));display:grid;grid-template-columns:minmax(0,1fr);
  background:var(--d-canvas);color:var(--mi-label);font-family:var(--mi-font);overflow-x:clip
}
:root[data-theme=dark] .dash{
  --d-canvas:color-mix(in oklab,var(--mi-side) 22%,var(--mi-page));
  --d-side:color-mix(in oklab,var(--mi-side) 36%,var(--mi-page));
  --d-card:color-mix(in oklab,var(--mi-elev) 46%,var(--mi-page));
  --d-line:color-mix(in oklab,var(--mi-sep) 62%,transparent);
  --d-hi:color-mix(in oklab,var(--mi-label) 8%,transparent);
  --d-sh:0 1px 0 color-mix(in oklab,var(--mi-page) 60%,transparent),0 10px 30px -18px var(--mi-page);
  --mi-card:var(--d-card)
}
.num{font-variant-numeric:tabular-nums}

/* ---------- sidebar ---------- */
.side{display:none}
.side__in{display:flex;flex-direction:column;min-height:0}
.side__head{height:56px;display:flex;align-items:center;padding:0 10px;border-bottom:1px solid var(--d-line);flex:none}
.side__head>*{width:100%}
.ws{display:flex;align-items:center;gap:10px;width:100%;padding:6px;border:0;border-radius:10px;background:transparent;color:inherit;text-align:left;cursor:pointer;transition:transform var(--mi-dur-1) var(--mi-ease)}
.ws:hover{background:var(--mi-fill4)}
.ws:active{transform:scale(.985)}
.ws__txt{display:flex;flex-direction:column;min-width:0;flex:1;line-height:1.2}
.ws__txt strong{font-size:14px;font-weight:650;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ws__txt small{font-size:12px;color:var(--mi-label2)}
.ws__chev{color:var(--mi-label2);flex:none}
.mark{width:30px;height:30px;flex:none;border-radius:9px;display:grid;place-items:center;color:var(--mi-p-on);
  background:linear-gradient(145deg,color-mix(in oklab,var(--mi-p) 82%,var(--mi-s)),var(--mi-p));
  box-shadow:inset 0 1px 0 color-mix(in oklab,var(--mi-p-on) 28%,transparent),0 1px 2px color-mix(in oklab,var(--mi-p) 40%,transparent)}
.mark svg{fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
.mark--sm{width:26px;height:26px;border-radius:8px}
.side .side__nav{width:100%;background:transparent;box-shadow:none;border-radius:0;padding:12px 10px;flex:1;overflow-y:auto}
.usage{display:flex;flex-direction:column;gap:12px;margin:0 12px 12px;padding:14px;border-radius:12px;background:var(--d-card);border:1px solid var(--d-line);box-shadow:inset 0 1px 0 var(--d-hi)}
.usage__row{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.usage__plan{font-size:13px;font-weight:650}
.usage__renew{font-size:12px;color:var(--mi-label2)}

/* ---------- top bar ---------- */
.main{position:relative;min-width:0;display:flex;flex-direction:column}
.top{position:sticky;top:var(--top);z-index:30;height:56px;display:flex;align-items:center;gap:6px;padding:0 12px;min-width:0;
  background:color-mix(in oklab,var(--d-canvas) 82%,transparent);-webkit-backdrop-filter:saturate(170%) blur(14px);backdrop-filter:saturate(170%) blur(14px);
  border-bottom:1px solid var(--d-line)}
.top .top__toggle,.top .top__crumbs,.top .top__sep,.top .top__search{display:none}
.top__brand{display:inline-flex;align-items:center;gap:8px;font-size:15px;letter-spacing:-.01em;min-width:0}
.top__brand strong{font-weight:650}
.top__sep{width:1px;height:18px;background:var(--d-line);margin:0 6px}
.top__end{margin-left:auto;display:flex;align-items:center;gap:4px;min-width:0}
.top__div{width:1px;height:20px;background:var(--d-line);margin:0 6px}
.bell{position:relative;display:inline-flex}
.bell__dot{position:absolute;top:6px;right:6px;width:8px;height:8px;border-radius:50%;background:var(--mi-red);box-shadow:0 0 0 2px var(--d-canvas);pointer-events:none}
.me{border:0;background:none;padding:2px;border-radius:50%;cursor:pointer;display:flex;flex:none}
.notes{width:100%}
.notes__head{display:flex;align-items:center;justify-content:space-between;padding:10px 10px 6px 16px;border-bottom:1px solid var(--d-line)}
.notes__head strong{font-size:14px;font-weight:650}
.notes__list{display:flex;flex-direction:column;gap:4px;padding:8px}

/* ---------- content ---------- */
.content{position:relative;width:100%;max-width:1360px;margin:0 auto;padding:14px 16px 64px;display:flex;flex-direction:column;gap:var(--d-gap);min-width:0}
.content{z-index:1}
.wash{position:absolute;left:0;right:0;top:56px;height:460px;pointer-events:none;z-index:0;
  background:radial-gradient(70% 90% at 8% 0%,color-mix(in oklab,var(--mi-p) 14%,transparent),transparent 70%),radial-gradient(45% 70% at 92% 0%,color-mix(in oklab,var(--mi-s) 6%,transparent),transparent 72%);
  -webkit-mask-image:linear-gradient(to bottom,black 30%,transparent);mask-image:linear-gradient(to bottom,black 30%,transparent)}
.wash::after{content:"";position:absolute;inset:0;opacity:.5;
  background-image:linear-gradient(var(--d-line) 1px,transparent 1px),linear-gradient(90deg,var(--d-line) 1px,transparent 1px);background-size:56px 56px;background-position:-1px -1px;
  -webkit-mask-image:radial-gradient(60% 80% at 20% 0%,black,transparent 75%);mask-image:radial-gradient(60% 80% at 20% 0%,black,transparent 75%)}
.back{align-self:flex-start;display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:500;color:var(--mi-p-text,var(--mi-p));text-decoration:none;padding:4px 8px 4px 4px;margin-left:-4px;border-radius:8px}
.back:hover{background:color-mix(in oklab,var(--mi-p) 9%,transparent)}

.head{display:flex;flex-direction:column;gap:18px;padding:6px 0 14px}
.head__date{margin:0 0 6px;font-size:13px;font-weight:550;color:var(--mi-label2)}
.head h1{margin:0;font-size:clamp(28px,1.6vw + 20px,38px);line-height:1.08;font-weight:700;letter-spacing:-.032em;text-wrap:balance}
.head__lede{margin:10px 0 0;font-size:15px;line-height:1.5;color:var(--mi-label2);max-width:62ch;text-wrap:pretty}
.head__lede .up{color:var(--mi-green-t);font-weight:600}
.head__link{border:0;background:none;padding:0;font:inherit;color:var(--mi-label);font-weight:550;text-decoration:underline;text-decoration-color:color-mix(in oklab,var(--mi-orange) 70%,transparent);text-decoration-thickness:1.5px;text-underline-offset:3px;cursor:pointer;border-radius:4px}
.head__link:hover{color:var(--mi-orange-t)}
.head__ctl{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.rangepill{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 11px;border-radius:9px;border:1px solid var(--d-line);background:var(--d-card);box-shadow:inset 0 1px 0 var(--d-hi);font-size:13px;font-weight:500;color:var(--mi-label);font-variant-numeric:tabular-nums;white-space:nowrap}
.rangepill :deep(svg){color:var(--mi-label2)}

/* ---------- cards ---------- */
.card{position:relative;min-width:0;background:var(--d-card);border:1px solid var(--d-line);border-radius:var(--d-r);box-shadow:inset 0 1px 0 var(--d-hi),var(--d-sh)}
.ch{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 16px 0;flex-wrap:wrap}
.ch__t{min-width:0}
.ch__t h2{margin:0;font-size:15px;line-height:20px;font-weight:650;letter-spacing:-.012em}
.ch__t p{margin:2px 0 0;font-size:13px;line-height:18px;color:var(--mi-label2)}
.ch__t p.ch__live{display:flex;align-items:center;gap:7px}
.ch__a{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ch__stat{display:flex;flex-direction:column;align-items:flex-end;line-height:1.1}
.ch__stat .num{font-size:20px;font-weight:650;letter-spacing:-.025em}
.ch__stat small{font-size:12px;color:var(--mi-label2);margin-top:2px}
.card__body{padding:12px 16px 16px}
.card__body--stack{padding-top:20px}
.card__body--rings{display:flex;justify-content:center;padding-top:16px}
.card__body--rings>*{width:100%}
.chip{width:28px;height:28px;flex:none;border-radius:8px;display:grid;place-items:center;color:var(--c);
  background:color-mix(in oklab,var(--c) 13%,transparent);box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--c) 20%,transparent)}
.chip--round{width:30px;height:30px;border-radius:50%}
.delta{display:inline-flex;align-items:center;gap:2px;height:22px;padding:0 7px 0 5px;border-radius:999px;font-size:12px;font-weight:650;font-variant-numeric:tabular-nums;white-space:nowrap}
.delta.is-good{color:var(--mi-green-t);background:color-mix(in oklab,var(--mi-green) 14%,transparent)}
.delta.is-bad{color:var(--mi-red-t);background:color-mix(in oklab,var(--mi-red) 13%,transparent)}

/* ---------- hero band ---------- */
.hero{display:grid;grid-template-columns:minmax(0,1fr);overflow:hidden}
.hero__lead{position:relative;padding:18px 16px 6px;min-width:0;isolation:isolate}
.hero__lead::before{content:"";position:absolute;z-index:-1;left:-20%;top:-60%;width:90%;height:120%;pointer-events:none;
  background:radial-gradient(closest-side,color-mix(in oklab,var(--mi-p) 15%,transparent),transparent)}
.hero__label{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;flex-wrap:wrap}
.hero__muted{font-weight:450;color:var(--mi-label2);font-size:13px}
.hero__fig{display:flex;align-items:center;gap:12px;margin-top:16px;flex-wrap:wrap}
.hero__value{font-size:clamp(40px,2.6vw + 22px,60px);line-height:1;font-weight:680;letter-spacing:-.045em;font-variant-numeric:tabular-nums}
.hero__cmp{margin:8px 0 0;font-size:13px;color:var(--mi-label2);font-variant-numeric:tabular-nums}
.hero__chart{margin:10px -4px 0}
.hero__tiles{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid var(--d-line)}
.tile{display:flex;flex-direction:column;justify-content:space-between;gap:12px;padding:14px;min-width:0}
.tile:nth-child(odd){border-right:1px solid var(--d-line)}
.tile:nth-child(n+3){border-top:1px solid var(--d-line)}
.tile__top{display:flex;align-items:center;gap:8px;min-width:0}
.tile__label{font-size:13px;font-weight:550;color:var(--mi-label2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tile__value{font-size:clamp(22px,1vw + 16px,28px);line-height:1.05;font-weight:650;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.tile__foot{display:flex;align-items:center;justify-content:space-between;gap:6px;min-width:0}
.tile__foot>:last-child{flex:none}

/* ---------- traffic + feed ---------- */
.grid{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--d-gap)}
.traffic{display:flex;flex-direction:column}
.traffic__legend{display:none}
.kstrip{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin:14px 16px 0;border:1px solid var(--d-line);border-radius:10px;overflow:hidden}
.kstrip__item{padding:10px 12px;min-width:0}
.kstrip__item:nth-child(odd){border-right:1px solid var(--d-line)}
.kstrip__item:nth-child(n+3){border-top:1px solid var(--d-line)}
.kstrip dt{font-size:12px;color:var(--mi-label2);white-space:nowrap}
.kstrip dd{margin:3px 0 0;display:flex;align-items:baseline;gap:6px;font-size:16px;font-weight:650;letter-spacing:-.015em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kstrip__delta{font-size:12px;font-weight:600;color:var(--mi-green-t);font-variant-numeric:tabular-nums}
.traffic__chart{padding:8px 12px 12px;margin-top:auto}
.feed{display:flex;flex-direction:column}
.live{position:relative;width:7px;height:7px;border-radius:50%;background:var(--mi-green);flex:none}
.live::after{content:"";position:absolute;inset:0;border-radius:50%;background:var(--mi-green);animation:dash-ping 2.4s var(--mi-ease) infinite}
@keyframes dash-ping{0%{transform:scale(1);opacity:.55}70%,100%{transform:scale(2.8);opacity:0}}
.feed__list{list-style:none;margin:0;padding:8px 16px 10px;flex:1}
.ev{position:relative;display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:12px;align-items:start;padding:9px 0}
.ev:not(:last-child)::after{content:"";position:absolute;left:14.5px;top:45px;bottom:-5px;width:1px;background:var(--d-line)}
.ev__txt{margin:0;font-size:13.5px;line-height:19px;color:var(--mi-label2);padding-top:5px;min-width:0}
.ev__txt strong{color:var(--mi-label);font-weight:600}
.ev__meta{display:flex;flex-direction:column;align-items:flex-end;gap:2px;padding-top:5px;font-size:12px;color:var(--mi-label2);white-space:nowrap;font-variant-numeric:tabular-nums}
.ev__amt{font-weight:650}
.ev__amt.is-good{color:var(--mi-green-t)}
.ev__amt.is-warn{color:var(--mi-orange-t)}

/* ---------- capacity strip ---------- */
.cap{display:grid;grid-template-columns:minmax(0,1fr)}
.cap__intro{padding:16px;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.cap__intro h2{margin:0;font-size:15px;line-height:20px;font-weight:650;letter-spacing:-.012em}
.cap__intro p{margin:0 0 10px;font-size:13px;color:var(--mi-label2)}
.cap__m{padding:16px;border-top:1px solid var(--d-line);min-width:0}

/* ---------- customers table ---------- */
.tbl{scroll-margin-top:calc(var(--top) + 72px);overflow:hidden}
.ch--tbl{padding-bottom:14px}
.tbar{position:relative;padding:0 16px 14px}
.tbar__filters{display:flex;flex-direction:column;gap:10px}
.chips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 -16px;padding:2px 16px}
.chips::-webkit-scrollbar{display:none}
.chips>*{flex:none}
.chips__n{margin-left:6px;font-size:11px;font-weight:600;opacity:.6;font-variant-numeric:tabular-nums}
.tbar__right{display:flex;gap:8px;align-items:center;min-width:0}
.tbar__search{flex:1;min-width:0}
.tbar__plan{width:140px;flex:none}
.tbar__filters{transition:opacity var(--mi-dur-2) var(--mi-ease)}
.tbar__filters[inert]{opacity:0}
.bulk{position:absolute;z-index:2;inset:0 16px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 6px 0 14px;border-radius:12px;
  background:color-mix(in oklab,var(--mi-p) 10%,var(--d-card));box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--mi-p) 30%,transparent)}
.bulk__n{font-size:13px;color:var(--mi-label2);white-space:nowrap}
.bulk__n b{color:var(--mi-label);font-weight:650}
.bulk__acts{display:flex;align-items:center;gap:6px}
.bulk__opt{display:none}
.bulk-enter-active,.bulk-leave-active{transition:opacity var(--mi-dur-2) var(--mi-ease),transform var(--mi-dur-3) var(--mi-spring)}
.bulk-enter-from,.bulk-leave-to{opacity:0;transform:translate3d(0,6px,0) scale(.985)}
.tbl__table{border-top:1px solid var(--d-line);border-radius:0;box-shadow:none}
.tbl__empty{border-top:1px solid var(--d-line);padding:24px 16px}
.tbl__foot{display:flex;justify-content:space-between;gap:12px;padding:12px 16px;border-top:1px solid var(--d-line);font-size:12px;color:var(--mi-label2)}
.who{display:flex;align-items:center;gap:10px;min-width:0;white-space:nowrap}
.who__txt{display:flex;flex-direction:column;line-height:1.25}
.who__txt strong{font-weight:600;font-size:14px;color:var(--mi-label)}
.who__txt small{font-size:12px;color:var(--mi-label2)}
.plan{font-size:13px;color:var(--mi-label)}
.is-zero{color:var(--mi-label3)}

.drawer{display:flex;flex-direction:column;gap:12px;padding-bottom:16px}
.drawer .drawer__nav{width:100%;box-shadow:none;background:transparent;padding:4px 0}
.drawer .usage{margin:0}

/* entrance + value ticks: transform/opacity only, content visible without JS */
@keyframes dash-rise{from{opacity:0;transform:translate3d(0,10px,0)}}
@keyframes dash-tick{from{opacity:0;transform:translate3d(0,6px,0)}}
.rise{animation:dash-rise var(--mi-dur-4) var(--mi-ease) calc(var(--i,0) * 45ms) backwards}
.tick{display:inline-block;animation:dash-tick var(--mi-dur-3) var(--mi-ease) backwards}
@media (prefers-reduced-motion:reduce){.rise,.tick,.live::after{animation:none}}

/* ---------- breakpoints ---------- */
@media (min-width:640px){
  .content{padding:16px 24px 72px;--d-gap:16px}
  .top{padding:0 16px}
  .ch{padding:18px 20px 0}
  .card__body{padding:14px 20px 18px}
  .hero__lead{padding:22px 22px 8px}
  .tile{padding:16px 18px}
  .kstrip{margin:16px 20px 0;grid-template-columns:repeat(4,minmax(0,1fr))}
  .kstrip__item{border-top:0 !important;border-right:1px solid var(--d-line)}
  .kstrip__item:last-child{border-right:0}
  .traffic__legend{display:flex}
  .traffic__chart{padding:8px 16px 14px}
  .feed__list{padding:8px 20px 12px}
  .tbar{padding:0 20px 14px}
  .chips{margin:0;padding:2px 0}
  .bulk{inset:0 20px 14px}
  .bulk__opt{display:inline-flex}
  .tbl__foot{padding:12px 20px}
  .cap__intro,.cap__m{padding:18px 20px}
}
@media (min-width:768px){
  .top .top__search{display:flex}
  .top .top__search{width:240px}
  .head{flex-direction:row;align-items:flex-end;justify-content:space-between}
  .hero__tiles{grid-template-columns:repeat(4,minmax(0,1fr))}
  .tile{border-top:0 !important;border-right:1px solid var(--d-line)}
  .tile:last-child{border-right:0}
  .grid--b{grid-template-columns:repeat(2,minmax(0,1fr))}
  .grid--b>:last-child{grid-column:1 / -1}
  .cap{grid-template-columns:minmax(0,1.1fr) repeat(3,minmax(0,1fr))}
  .cap__m{border-top:0;border-left:1px solid var(--d-line);display:flex;align-items:center}
  .cap__m>*{width:100%}
  .tbar__filters{flex-direction:row;align-items:center;justify-content:space-between}
  .tbar__right{flex:none}
  .tbar__search{width:200px;flex:none}
  .tbar__plan{width:150px}
}
@media (min-width:900px){
  .top .top__crumbs,.top .top__sep{display:flex}
  .top__crumbs{white-space:nowrap;min-width:0}
}
@media (min-width:1024px){
  .dash{grid-template-columns:252px minmax(0,1fr)}
  .dash.is-collapsed{grid-template-columns:0 minmax(0,1fr)}
  .side{display:block;min-width:0;background:var(--d-side);border-right:1px solid var(--d-line)}
  .side__in{position:sticky;top:var(--top);height:calc(100dvh - var(--top));overflow:hidden}
  .is-collapsed .side{visibility:hidden;overflow:hidden;border:0}
  .top{padding:0 20px 0 12px}
  .top .top__drawer,.top .top__brand{display:none}
  .top .top__toggle{display:inline-flex}
  .top .top__sep{display:none}
  .top .top__search{width:280px}
  .tbar .tbar__search{display:none}
  .content{padding:18px 32px 88px}
}
@media (min-width:1200px){
  .hero{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr)}
  .hero__tiles{grid-template-columns:repeat(2,minmax(0,1fr));border-top:0;border-left:1px solid var(--d-line)}
  .tile{border-right:0}
  .tile:nth-child(odd){border-right:1px solid var(--d-line)}
  .tile:nth-child(n+3){border-top:1px solid var(--d-line) !important}
  .tile{padding:20px 22px}
  .grid--a{grid-template-columns:minmax(0,1.85fr) minmax(0,1fr)}
  .grid--b{grid-template-columns:repeat(3,minmax(0,1fr))}
  .grid--b>:last-child{grid-column:auto}
}
</style>
