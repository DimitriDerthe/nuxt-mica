<template>
  <section class="cix mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="cix-title">
    <header class="cix__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="cix-title" variant="title3" as="h2" weight="semibold">Contacts</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ visibleCount }} of {{ contacts.length }} people · {{ starredCount }} starred</MiText>
      </div>
      <MiSearch v-model="query" size="compact" placeholder="Name, company or role" aria-label="Filter contacts" class="cix__search" />
    </header>

    <div class="cix__frame mi:grid mi:grid-cols-[minmax(0,_1fr)_auto] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-hidden">
      <!-- Scroll area: letter headings stick while their group scrolls past. -->
      <div class="cix__scroll mi:max-h-115 mi:overflow-y-auto mi:overscroll-contain mi:[scroll-padding-top:0] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" tabindex="0" aria-label="Contact list">
        <section v-for="g in groups" :id="'cix-group-' + g.key" :key="g.key" class="cix__group" :aria-labelledby="'cix-h-' + g.key">
          <MiText :id="'cix-h-' + g.key" variant="caption" as="h3" weight="semibold" class="cix__letter mi:sticky mi:top-0 mi:z-1 mi:py-1.5 mi:px-4 mi:[background:var(--mi-elev)] mi:border-b mi:border-b-sep">{{ g.title }}</MiText>
          <ul class="cix__rows mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:@[720px]:grid-cols-2">
            <li v-for="c in g.items" :key="c.id" class="cix__row mi:flex mi:items-center mi:gap-3 mi:pt-2.5 mi:pr-2 mi:pb-2.5 mi:pl-4 mi:[.cix__row+&]:border-t mi:[.cix__row+&]:border-t-sep mi:@[720px]:[.cix__row+&]:[border-top:0] mi:@[720px]:border-b mi:@[720px]:border-b-sep">
              <MiAvatar :name="c.name" size="sm" tone="auto" decorative />
              <div class="cix__text mi:grid mi:flex-1 mi:min-w-0">
                <span class="cix__name mi:text-[15px] mi:font-medium">{{ c.name }}</span>
                <MiText variant="caption" tone="label2" :lines="1">{{ c.role }} · {{ c.company }}</MiText>
              </div>
              <MiIconButton
                :label="(c.starred ? 'Unstar ' : 'Star ') + c.name" variant="plain" size="small"
                :pressed="c.starred" class="cix__star" @click="c.starred = !c.starred"
              ><MiIcon name="star" :size="16" /></MiIconButton>
            </li>
          </ul>
        </section>
        <MiText v-if="!groups.length" variant="footnote" tone="label2" class="cix__empty mi:p-7 mi:text-center">No one matches “{{ query }}”.</MiText>
      </div>

      <!-- A to Z rail: letters without anyone stay visible but disabled. -->
      <nav class="cix__rail mi:grid mi:content-center mi:gap-0 mi:py-1.5 mi:px-1 mi:border-l mi:border-l-sep" aria-label="Jump to letter">
        <button
          v-for="l in LETTERS" :key="l" type="button" class="cix__jump mi:w-6 mi:py-px mi:px-0 mi:[border:0] mi:rounded-[6px] mi:[background:none] mi:text-p-text mi:cursor-pointer mi:disabled:text-label3 mi:disabled:opacity-50 mi:disabled:cursor-default mi:[&:not(:disabled):hover]:[background:var(--mi-p-tint)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-1px]"
          :disabled="!present.has(l)" :aria-label="'Jump to ' + l" @click="jump(l)"
        >{{ l }}</button>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Contact { id: number, name: string, role: string, company: string, starred: boolean }
interface Group { key: string, title: string, items: Contact[] }

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

let nextId = 0
const p = (name: string, role: string, company: string, starred = false): Contact => ({ id: ++nextId, name, role, company, starred })
const contacts = ref<Contact[]>([
  p('Amara Nwosu', 'Head of Partnerships', 'Fieldnote', true), p('Arjun Mehta', 'Staff Engineer', 'Tessellate'),
  p('Beatriz Lima', 'Product Designer', 'Halcyon Health'), p('Caleb Brooks', 'Account Executive', 'Ferrous', true),
  p('Chiara Conti', 'Legal Counsel', 'Orbitale'), p('Dmitri Volkov', 'CTO', 'Quarry Labs'),
  p('Elena Petrova', 'Recruiter', 'Fieldnote'), p('Farah Siddiqui', 'Finance Lead', 'Halcyon Health'),
  p('Gustav Lund', 'Founder', 'Nordvik', true), p('Hiroshi Tanaka', 'Data Scientist', 'Tessellate'),
  p('Imani Clarke', 'Customer Success', 'Ferrous'), p('Jonas Weber', 'Engineering Manager', 'Orbitale'),
  p('Lucía Herrera', 'Marketing Director', 'Quarry Labs'), p('Malik Johnson', 'Sales Engineer', 'Nordvik'),
  p('Mei Chen', 'VP Product', 'Halcyon Health', true), p('Olu Adeyemi', 'Security Lead', 'Tessellate'),
  p('Rafael Duarte', 'Solutions Architect', 'Ferrous'), p('Sofia Rossi', 'Operations', 'Orbitale'),
  p('Tomasz Nowak', 'iOS Engineer', 'Fieldnote'), p('Yara Haddad', 'Research Lead', 'Quarry Labs')
])

const query = ref('')

const matches = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? contacts.value.filter(c => `${c.name} ${c.role} ${c.company}`.toLowerCase().includes(q)) : contacts.value
})
// Starred people get their own group on top, and stay in their letter too.
const groups = computed<Group[]>(() => {
  const byLetter = new Map<string, Contact[]>()
  for (const c of matches.value) {
    const l = c.name[0]!.toUpperCase()
    byLetter.set(l, [...(byLetter.get(l) ?? []), c])
  }
  const starred = matches.value.filter(c => c.starred)
  const letters = [...byLetter.keys()].sort().map(l => ({ key: l, title: l, items: byLetter.get(l)! }))
  return starred.length ? [{ key: 'starred', title: 'Starred', items: starred }, ...letters] : letters
})
const present = computed(() => new Set(groups.value.map(g => g.key)))
const visibleCount = computed(() => matches.value.length)
const starredCount = computed(() => contacts.value.filter(c => c.starred).length)

function jump(letter: string) {
  document.getElementById('cix-group-' + letter)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}
</script>

<style scoped>
.cix__search { flex: 1 1 220px; max-width: 320px; }
.cix__letter { color: var(--mi-label2); text-transform: uppercase; letter-spacing: .06em; }
.cix__star[aria-pressed="true"] { color: var(--mi-orange); }
.cix__jump { font: inherit; font-size: 10px; font-weight: 700; line-height: 1.5; }

@container (min-width: 720px) {
  .cix__jump { font-size: 11px; }
}
</style>
