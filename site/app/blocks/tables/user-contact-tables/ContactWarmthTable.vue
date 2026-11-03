<template>
  <section class="cwt" aria-labelledby="cwt-title">
    <header class="cwt__head">
      <div class="cwt__title">
        <MiText id="cwt-title" variant="title3" as="h2" weight="semibold">Key accounts</MiText>
        <MiText variant="footnote" tone="label2">{{ contacts.length }} contacts across {{ accounts.length }} accounts · Q4 renewals</MiText>
      </div>
      <!-- The scale every warmth strip is read against: warm on the day of a touch, cold after six weeks. -->
      <div class="cwt__scale" role="img" aria-label="Warmth scale: cold after 40 days without a touch, hot on the day of a touch">
        <span>40 d</span>
        <span class="cwt__ticks"><i v-for="n in TICKS" :key="n" class="is-on" :style="tick(n)" /></span>
        <span>Today</span>
      </div>
    </header>

    <div class="cwt__toolbar">
      <div class="cwt__search"><MiSearch v-model="query" size="compact" placeholder="Name, title or account" aria-label="Search contacts" /></div>
      <div class="cwt__tools">
        <MiChip v-model="coolingOnly" selectable size="small" tone="neutral" :label="`Needs a touch · ${coolingCount}`" />
        <MiSegmented v-model="sort" label="Sort contacts" :options="sorts" />
      </div>
    </div>

    <div class="cwt__scroll">
      <table class="cwt__table">
        <caption class="cwt__sr">Contacts grouped by account, with relationship warmth and open deal value</caption>
        <thead>
          <tr>
            <th scope="col" class="c-exp"><span class="cwt__sr">Details</span></th>
            <th scope="col">Contact</th>
            <th scope="col">Warmth</th>
            <th scope="col">Last touch</th>
            <th scope="col" class="is-num">Open value</th>
            <th scope="col" class="c-own">Owner</th>
          </tr>
        </thead>

        <tbody v-for="g in groups" :key="g.id">
          <tr class="cwt__group">
            <th scope="rowgroup" colspan="6">
              <div class="cwt__group-in">
                <button type="button" class="cwt__group-btn" :aria-expanded="!collapsed.includes(g.id)" @click="toggleGroup(g.id)">
                  <MiIcon name="chevron-right" :size="14" class="cwt__chev" />
                  <span class="cwt__mark" :data-tone="g.tone" aria-hidden="true">{{ g.mark }}</span>
                  <span class="cwt__group-name">
                    <span>{{ g.name }}</span>
                    <small>{{ g.city }} · {{ g.rows.length }} {{ g.rows.length === 1 ? 'contact' : 'contacts' }}</small>
                  </span>
                </button>
                <!-- Account heat signature: one dot per contact, so a cooling account shows before a deal slips. -->
                <span class="cwt__sig" role="img" :aria-label="`${g.warm} of ${g.rows.length} contacts touched in the last 10 days`">
                  <i v-for="c in g.rows" :key="c.id" :style="heat(c)" />
                </span>
                <span class="cwt__group-total">{{ money(g.value) }}</span>
              </div>
            </th>
          </tr>

          <template v-if="!collapsed.includes(g.id)">
            <template v-for="c in g.rows" :key="c.id">
              <tr class="cwt__row" :class="{ 'is-open': opened.includes(c.id) }">
                <td class="c-exp">
                  <button
                    type="button" class="cwt__exp" :aria-expanded="opened.includes(c.id)" :aria-controls="`cwt-d-${c.id}`"
                    :aria-label="`Recent interactions with ${c.name}`" @click="toggleRow(c.id)"
                  >
                    <MiIcon name="chevron-down" :size="14" />
                  </button>
                </td>
                <td class="c-who">
                  <span class="cwt__who">
                    <MiAvatar :name="c.name" size="sm" tone="auto" decorative />
                    <span class="cwt__who-text">
                      <span class="cwt__name">{{ c.name }}</span>
                      <span class="cwt__role">{{ c.title }}</span>
                    </span>
                  </span>
                </td>
                <td class="c-warm">
                  <span class="cwt__warm" :data-band="band(c)">
                    <span class="cwt__ticks" role="meter" :aria-label="`Warmth of ${c.name}`" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(warmth(c) * 100)" :aria-valuetext="`${band(c)}, ${ago(c.days).toLowerCase()}`">
                      <i v-for="n in TICKS" :key="n" :class="{ 'is-on': n <= lit(c) }" :style="tick(n)" />
                    </span>
                    <span class="cwt__band">{{ band(c) }}</span>
                  </span>
                </td>
                <td class="c-last">
                  <span class="cwt__last"><MiIcon :svg="glyph[c.touches[0]!.kind]" :size="14" />{{ ago(c.days) }}</span>
                </td>
                <td class="c-val is-num">{{ c.value ? money(c.value) : '—' }}</td>
                <td class="c-own"><MiAvatar :name="c.owner" size="xs" tone="neutral" /></td>
              </tr>
              <tr v-if="opened.includes(c.id)" :id="`cwt-d-${c.id}`" class="cwt__detail">
                <td colspan="6">
                  <div class="cwt__detail-in">
                    <MiText as="h3" variant="caption" weight="semibold" tone="label2" class="cwt__detail-h">Last 3 interactions</MiText>
                    <ol class="cwt__touches">
                      <li v-for="(t, i) in c.touches.slice(0, 3)" :key="i" class="cwt__touch">
                        <span class="cwt__touch-ico" :data-kind="t.kind"><MiIcon :svg="glyph[t.kind]" :size="14" /></span>
                        <span class="cwt__touch-text">
                          <MiText variant="footnote" weight="medium">{{ t.note }}</MiText>
                          <MiText variant="caption" tone="label2" tabular>{{ t.when }} · {{ kindName[t.kind] }} · {{ t.by }}</MiText>
                        </span>
                      </li>
                    </ol>
                    <div class="cwt__detail-act">
                      <MiButton size="small" variant="tinted" @click="logTouch(c)">
                        <template #leading><MiIcon name="plus" :size="14" /></template>
                        Log a call
                      </MiButton>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </template>
        </tbody>

        <tbody v-if="!groups.length">
          <tr><td colspan="6" class="cwt__none">No contact matches this search.</td></tr>
        </tbody>

        <tfoot>
          <tr>
            <th scope="row" colspan="4">{{ shown.length }} contacts · {{ shown.filter(c => c.days > 10).length }} need a touch</th>
            <td class="is-num">{{ money(shown.reduce((n, c) => n + c.value, 0)) }}</td>
            <td class="c-own" />
          </tr>
        </tfoot>
      </table>
    </div>
    <p class="cwt__sr" role="status" aria-live="polite">{{ announce }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Kind = 'call' | 'email' | 'meeting' | 'note'
interface Touch { kind: Kind, when: string, note: string, by: string }
interface Contact { id: string, account: string, name: string, title: string, days: number, value: number, owner: string, touches: Touch[] }
interface Account { id: string, name: string, city: string, mark: string, tone: 'p' | 's' | 'n' }

const accounts: Account[] = [
  { id: 'hal', name: 'Halvorsen Freight', city: 'Oslo', mark: 'HF', tone: 'p' },
  { id: 'kes', name: 'Kestrel Robotics', city: 'Munich', mark: 'KR', tone: 's' },
  { id: 'bri', name: 'Brightwater Health', city: 'Boston', mark: 'BH', tone: 'n' },
  { id: 'qui', name: 'Quinta Hotels', city: 'Lisbon', mark: 'QH', tone: 'p' },
  { id: 'mar', name: 'Marlow & Finch', city: 'London', mark: 'MF', tone: 'n' }
]

// `days` since the last touch drives warmth; touches are newest first. Sample data, swap for your CRM.
const contacts = reactive<Contact[]>([
  { id: 'c1', account: 'hal', name: 'Ingrid Halvorsen', title: 'Chief Operating Officer', days: 1, value: 84_000, owner: 'Priya Raman', touches: [
    { kind: 'meeting', when: 'Nov 1', note: 'Signed off the fleet rollout plan for January', by: 'Priya' },
    { kind: 'email', when: 'Oct 27', note: 'Sent the revised 3-year pricing', by: 'Priya' },
    { kind: 'call', when: 'Oct 20', note: 'Asked for SSO and audit log access', by: 'Jonas' }] },
  { id: 'c2', account: 'hal', name: 'Marius Dahl', title: 'Head of Operations', days: 6, value: 22_000, owner: 'Priya Raman', touches: [
    { kind: 'call', when: 'Oct 27', note: 'Wants depot managers trained before go-live', by: 'Priya' },
    { kind: 'email', when: 'Oct 14', note: 'Shared the onboarding checklist', by: 'Camille' },
    { kind: 'meeting', when: 'Oct 2', note: 'Site visit at the Alnabru terminal', by: 'Priya' }] },
  { id: 'c3', account: 'hal', name: 'Sofie Berg', title: 'Procurement Lead', days: 19, value: 0, owner: 'Jonas Weber', touches: [
    { kind: 'email', when: 'Oct 14', note: 'Requested the security questionnaire', by: 'Jonas' },
    { kind: 'note', when: 'Oct 9', note: 'Prefers invoices quarterly, in NOK', by: 'Jonas' },
    { kind: 'call', when: 'Sep 30', note: 'Intro call, vendor onboarding steps', by: 'Jonas' }] },
  { id: 'c4', account: 'kes', name: 'Mei Chen', title: 'CTO', days: 0, value: 120_000, owner: 'Camille Durand', touches: [
    { kind: 'call', when: 'Today', note: 'Agreed on a pilot with two robot lines', by: 'Camille' },
    { kind: 'meeting', when: 'Oct 24', note: 'Architecture review with their platform team', by: 'Camille' },
    { kind: 'email', when: 'Oct 18', note: 'Sent the API rate-limit proposal', by: 'Jonas' }] },
  { id: 'c5', account: 'kes', name: 'Felix Brandt', title: 'Engineering Manager', days: 9, value: 18_000, owner: 'Camille Durand', touches: [
    { kind: 'email', when: 'Oct 24', note: 'Follow-up on webhook retries', by: 'Camille' },
    { kind: 'call', when: 'Oct 11', note: 'Walked through the staging setup', by: 'Jonas' },
    { kind: 'note', when: 'Oct 3', note: 'Champion, but no budget authority', by: 'Camille' }] },
  { id: 'c6', account: 'kes', name: 'Olu Adeyemi', title: 'Finance Director', days: 44, value: 0, owner: 'Camille Durand', touches: [
    { kind: 'email', when: 'Sep 19', note: 'Sent the annual prepay discount', by: 'Camille' },
    { kind: 'meeting', when: 'Sep 5', note: 'Budget cycle closes mid-December', by: 'Camille' },
    { kind: 'call', when: 'Aug 22', note: 'Intro from Mei Chen', by: 'Camille' }] },
  { id: 'c7', account: 'bri', name: 'Dana Whitfield', title: 'VP Clinical Operations', days: 3, value: 64_000, owner: 'Jonas Weber', touches: [
    { kind: 'meeting', when: 'Oct 30', note: 'Demo for the night-shift coordinators', by: 'Jonas' },
    { kind: 'email', when: 'Oct 21', note: 'Shared the HIPAA addendum', by: 'Jonas' },
    { kind: 'call', when: 'Oct 8', note: 'Scoped three pilot wards', by: 'Priya' }] },
  { id: 'c8', account: 'bri', name: 'Rahul Iyer', title: 'Director of IT', days: 27, value: 0, owner: 'Jonas Weber', touches: [
    { kind: 'email', when: 'Oct 6', note: 'Asked about on-prem SAML and SCIM', by: 'Jonas' },
    { kind: 'call', when: 'Sep 24', note: 'Security review kickoff', by: 'Jonas' },
    { kind: 'note', when: 'Sep 12', note: 'Blocks anything without SOC 2 Type II', by: 'Priya' }] },
  { id: 'c9', account: 'qui', name: 'Beatriz Lopes', title: 'Revenue Director', days: 13, value: 36_000, owner: 'Priya Raman', touches: [
    { kind: 'call', when: 'Oct 20', note: 'Wants rate parity reports per property', by: 'Priya' },
    { kind: 'email', when: 'Oct 9', note: 'Sent case study from a Porto group', by: 'Priya' },
    { kind: 'meeting', when: 'Sep 26', note: 'Workshop at the Chiado hotel', by: 'Camille' }] },
  { id: 'c10', account: 'qui', name: 'Tiago Nunes', title: 'General Manager, Porto', days: 35, value: 9_500, owner: 'Priya Raman', touches: [
    { kind: 'email', when: 'Sep 28', note: 'Asked to delay until after high season', by: 'Priya' },
    { kind: 'call', when: 'Sep 15', note: 'Front-desk tablet requirements', by: 'Priya' },
    { kind: 'note', when: 'Sep 2', note: 'Reports to Beatriz from January', by: 'Priya' }] },
  { id: 'c11', account: 'mar', name: 'Eleanor Marlow', title: 'Managing Partner', days: 52, value: 48_000, owner: 'Jonas Weber', touches: [
    { kind: 'meeting', when: 'Sep 11', note: 'Partner lunch, interested in matter tracking', by: 'Jonas' },
    { kind: 'email', when: 'Aug 29', note: 'Sent the legal workspace template', by: 'Jonas' },
    { kind: 'call', when: 'Aug 14', note: 'Referral from Quinta Hotels counsel', by: 'Priya' }] }
])

const glyph: Record<Kind, string> = {
  call: '<path d="M6.5 3.5h3l1.6 4.2-2 1.3a11 11 0 0 0 5.9 5.9l1.3-2 4.2 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
  email: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 7.5 8.5 6 8.5-6"/>',
  meeting: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  note: '<path d="M14.5 4.5 19.5 9.5 9 20H4v-5z"/><path d="m12.5 6.5 5 5"/>'
}
const kindName: Record<Kind, string> = { call: 'Call', email: 'Email', meeting: 'Meeting', note: 'Note' }

const COLD_AFTER = 40
const warmth = (c: Contact) => Math.max(0, 1 - c.days / COLD_AFTER)
// Each strip carries its own warmth; CSS mixes the hue from it, so no color is computed in script.
const heat = (c: Contact) => ({ '--w': warmth(c).toFixed(3), '--wp': `${Math.round(warmth(c) * 100)}%` })
// Ten ticks from cold to hot; a contact lights as many as its warmth, each tick keeps its place on the scale.
const TICKS = 10
const lit = (c: Contact) => Math.ceil(warmth(c) * TICKS)
const tick = (n: number) => ({ '--t': `${Math.round(((n - 1) / (TICKS - 1)) * 100)}%` })
const band = (c: Contact) => (c.days <= 3 ? 'Hot' : c.days <= 10 ? 'Warm' : c.days <= 21 ? 'Cooling' : 'Cold')
const ago = (d: number) => (d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`)
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const money = (n: number) => fmt.format(n)

const sorts = [{ value: 'cold', label: 'Coldest first' }, { value: 'value', label: 'Value' }]
const sort = ref<string | number | null>('cold')
const query = ref('')
const coolingOnly = ref(false)
const collapsed = ref<string[]>(['mar'])
const opened = ref<string[]>(['c6'])
const announce = ref('')

const coolingCount = computed(() => contacts.filter(c => c.days > 10).length)
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return contacts.filter((c) => {
    const acc = accounts.find(a => a.id === c.account)!
    return (!coolingOnly.value || c.days > 10) && (!q || `${c.name} ${c.title} ${acc.name}`.toLowerCase().includes(q))
  })
})

const groups = computed(() => {
  const by = sort.value === 'value' ? (a: Contact, b: Contact) => b.value - a.value : (a: Contact, b: Contact) => b.days - a.days
  return accounts
    .map((a) => {
      const rows = shown.value.filter(c => c.account === a.id).sort(by)
      return { ...a, rows, value: rows.reduce((n, c) => n + c.value, 0), warm: rows.filter(c => c.days <= 10).length, coldest: Math.max(0, ...rows.map(c => c.days)) }
    })
    .filter(g => g.rows.length)
    .sort((x, y) => (sort.value === 'value' ? y.value - x.value : y.coldest - x.coldest))
})

const flip = (list: string[], id: string) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id])
const toggleGroup = (id: string) => { collapsed.value = flip(collapsed.value, id) }
const toggleRow = (id: string) => { opened.value = flip(opened.value, id) }

function logTouch(c: Contact) {
  c.days = 0
  c.touches.unshift({ kind: 'call', when: 'Today', note: 'Logged from the accounts table', by: 'You' })
  announce.value = `Logged a call with ${c.name}. Warmth is back to hot.`
}
</script>

<style scoped>
.cwt { --cwt-t3: color-mix(in srgb, var(--mi-label2) 78%, transparent); --cwt-shade: color-mix(in srgb, var(--mi-label) 3.5%, var(--mi-card)); container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.cwt__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.cwt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px 24px; }
.cwt__title { display: grid; gap: 2px; min-width: 0; }
/* Warmth runs from cold blue to warm orange everywhere in the block. */
.cwt__scale { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 500; letter-spacing: .02em; color: var(--cwt-t3); font-variant-numeric: tabular-nums; }

.cwt__toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 12px; }
.cwt__search { flex: 1 1 220px; max-width: 320px; min-width: 0; }
.cwt__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

/* Narrow first: each contact is a two-line card inside its account; from 680px it becomes a real table grid. */
.cwt__scroll { max-height: 470px; overflow: auto; overscroll-behavior: contain; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); border: 1px solid var(--mi-sep); }
.cwt__table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
.cwt__table thead { display: none; }
.cwt__table tbody, .cwt__table tfoot { display: block; }
.cwt__table tr { display: block; }
.cwt__table .is-num { font-variant-numeric: tabular-nums; text-align: end; }

.cwt__group th { display: block; padding: 0; font-weight: inherit; text-align: start; }
.cwt__group-in {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px 10px 6px;
  background: var(--cwt-shade); border-top: 1px solid var(--mi-sep);
}
tbody:first-of-type .cwt__group-in { border-top: 0; }
.cwt__group-btn {
  display: flex; flex: 1 1 auto; align-items: center; gap: 10px; min-width: 0; padding: 4px 6px; border: 0; border-radius: var(--mi-radius-m);
  background: none; color: inherit; font: inherit; text-align: start; cursor: pointer;
}
.cwt__group-btn:hover { background: var(--mi-fill3); }
.cwt__group-btn:focus-visible, .cwt__exp:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.cwt__chev { flex: none; color: var(--cwt-t3); transform: rotate(90deg); transition: transform var(--mi-dur-2) var(--mi-ease); }
.cwt__group-btn[aria-expanded="false"] .cwt__chev { transform: none; }
.cwt__mark {
  display: grid; place-items: center; flex: none; width: 30px; height: 30px; border-radius: 8px;
  font-size: 11px; font-weight: 700; letter-spacing: .04em; background: var(--mi-p-tint); color: var(--mi-p-text);
}
.cwt__mark[data-tone="s"] { background: var(--mi-s-tint); color: var(--mi-s-text); }
.cwt__mark[data-tone="n"] { background: var(--mi-fill2); color: var(--mi-label); }
.cwt__group-name { display: grid; min-width: 0; font-weight: 600; font-size: 14px; }
.cwt__group-name span, .cwt__group-name small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cwt__group-name small { font-size: 12px; font-weight: 400; color: var(--mi-label2); }
.cwt__sig { display: none; gap: 3px; }
.cwt__sig i { width: 8px; height: 8px; border-radius: 50%; background: color-mix(in srgb, var(--mi-orange) var(--wp), var(--mi-blue)); opacity: calc(.45 + var(--w) * .55); }
.cwt__group-total { flex: none; font-weight: 600; font-size: 14px; font-variant-numeric: tabular-nums; }

.cwt__table .cwt__row {
  display: grid; grid-template-columns: 36px minmax(0, 1fr) auto; grid-template-areas: "exp who val" ". warm last";
  align-items: center; gap: 6px 10px; padding: 10px 14px 12px 6px; border-top: 1px solid var(--mi-sep);
  transition: background-color var(--mi-dur-1) var(--mi-ease);
}
.cwt__row:hover { background: color-mix(in srgb, var(--mi-fill4) 55%, transparent); }
.cwt__row.is-open { background: color-mix(in srgb, var(--mi-p-tint) 45%, transparent); }
.cwt__row td { display: block; padding: 0; }
.cwt__row .c-exp { grid-area: exp; }
.cwt__row .c-who { grid-area: who; min-width: 0; }
.cwt__row .c-warm { grid-area: warm; }
.cwt__row .c-last { grid-area: last; justify-self: end; }
.cwt__row .c-val { grid-area: val; font-weight: 600; }
.cwt__row .c-own { display: none; }

.cwt__exp {
  display: grid; place-items: center; width: 28px; height: 28px; margin-inline: auto; border: 0; border-radius: 50%;
  background: none; color: var(--cwt-t3); cursor: pointer;
}
.cwt__exp:hover { background: var(--mi-fill3); color: var(--mi-label); }
.cwt__exp :deep(svg) { transform: rotate(-90deg); transition: transform var(--mi-dur-2) var(--mi-ease); }
.cwt__exp[aria-expanded="true"] { color: var(--mi-p-text); }
.cwt__exp[aria-expanded="true"] :deep(svg) { transform: none; }

.cwt__who { display: flex; align-items: center; gap: 10px; min-width: 0; }
.cwt__who-text { display: grid; min-width: 0; }
.cwt__name { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cwt__role { font-size: 12px; color: var(--mi-label2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Warmth ticks: lit from the cold end, each tick tinted by its own place between blue and orange. */
.cwt__warm { display: inline-flex; align-items: center; gap: 10px; }
.cwt__ticks { display: inline-flex; align-items: center; gap: 2px; }
.cwt__ticks i { width: 4px; height: 12px; border-radius: 1.5px; background: var(--mi-fill3); }
.cwt__ticks i.is-on { background: color-mix(in srgb, var(--mi-orange) var(--t), var(--mi-blue)); }
.cwt__scale .cwt__ticks i { width: 3px; height: 9px; }
.cwt__band { min-width: 52px; font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.cwt__warm[data-band="Hot"] .cwt__band, .cwt__warm[data-band="Warm"] .cwt__band { color: var(--mi-orange-t); }
.cwt__warm[data-band="Cold"] .cwt__band { color: var(--mi-blue); }
.cwt__last { display: inline-flex; align-items: center; gap: 6px; color: var(--mi-label2); white-space: nowrap; font-variant-numeric: tabular-nums; }
.cwt__last :deep(svg) { color: var(--cwt-t3); }

.cwt__detail { border-top: 1px dashed var(--mi-sep); background: color-mix(in srgb, var(--mi-p-tint) 22%, transparent); }
.cwt__detail td { display: block; padding: 0; }
.cwt__detail-in { display: grid; gap: 10px; padding: 12px 16px 16px 48px; }
.cwt__detail-h { text-transform: uppercase; letter-spacing: .06em; }
.cwt__touches { position: relative; display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.cwt__touch { display: grid; grid-template-columns: 28px minmax(0, 1fr); align-items: start; gap: 10px; }
.cwt__touch-text { display: grid; gap: 1px; min-width: 0; }
.cwt__touch-ico { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--mi-card); color: var(--mi-label2); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.cwt__touch-ico[data-kind="meeting"] { color: var(--mi-p-text); }
.cwt__touch-ico[data-kind="call"] { color: var(--mi-green-t); }
.cwt__detail-act { display: flex; }

.cwt__none { display: block; padding: 32px 16px; text-align: center; color: var(--mi-label2); }

.cwt__table tfoot tr { display: flex; justify-content: space-between; gap: 12px; padding: 12px 14px; border-top: 1px solid var(--mi-sep); background: var(--cwt-shade); font-size: 12px; }
.cwt__table tfoot th { font-weight: 500; color: var(--mi-label2); text-align: start; }
.cwt__table tfoot td { font-weight: 700; font-size: 13px; }
.cwt__table tfoot .c-own { display: none; }

@container (min-width: 680px) {
  .cwt__sig { display: inline-flex; }
  .cwt__table { display: table; }
  .cwt__table thead { display: table-header-group; }
  .cwt__table tbody { display: table-row-group; }
  .cwt__table tfoot { display: table-footer-group; }
  .cwt__table tr, .cwt__table tfoot tr { display: table-row; }
  .cwt__table th, .cwt__table td { display: table-cell; }
  .cwt__table thead th {
    position: sticky; top: 0; z-index: 2; padding: 10px 12px; border-bottom: 1px solid var(--mi-sep);
    background: var(--mi-card); font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--cwt-t3); text-align: start; white-space: nowrap;
  }
  .cwt__table thead th.is-num { text-align: end; }
  .cwt__table thead .c-exp { width: 44px; }
  .cwt__group th { padding: 0; }
  .cwt__group-in { padding-inline: 8px 16px; }
  .cwt__table .cwt__row { display: table-row; }
  .cwt__row td { display: table-cell; padding: 10px 12px; vertical-align: middle; border-top: 1px solid var(--mi-sep); }
  .cwt__row .c-exp { padding-inline: 8px 0; }
  .cwt__row .c-own { display: table-cell; width: 64px; }
  .cwt__row .c-val { width: 120px; }
  .cwt__row .c-last { width: 140px; }
  .cwt__row .c-warm { width: 170px; }
  .cwt__detail td { display: table-cell; padding: 0; }
  .cwt__detail-in { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "h act" "list list"; padding: 14px 20px 18px 66px; }
  .cwt__detail-h { grid-area: h; align-self: center; }
  .cwt__detail-act { grid-area: act; }
  .cwt__touches { grid-area: list; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .cwt__table tfoot th, .cwt__table tfoot td { position: sticky; bottom: 0; padding: 12px; border-top: 1px solid var(--mi-sep); background: var(--cwt-shade); }
  .cwt__table tfoot th { padding-left: 20px; }
  .cwt__table tfoot .c-own { display: table-cell; }
}
</style>
