<template>
  <section class="cix" aria-labelledby="cix-title">
    <header class="cix__head">
      <div>
        <MiText id="cix-title" variant="title3" as="h2" weight="semibold">Contacts</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ visibleCount }} of {{ contacts.length }} people · {{ starredCount }} starred</MiText>
      </div>
      <MiSearch v-model="query" size="compact" placeholder="Name, company or role" aria-label="Filter contacts" class="cix__search" />
    </header>

    <div class="cix__frame">
      <!-- Scroll area: letter headings stick while their group scrolls past. -->
      <div class="cix__scroll" tabindex="0" aria-label="Contact list">
        <section v-for="g in groups" :id="'cix-group-' + g.key" :key="g.key" class="cix__group" :aria-labelledby="'cix-h-' + g.key">
          <MiText :id="'cix-h-' + g.key" variant="caption" as="h3" weight="semibold" class="cix__letter">{{ g.title }}</MiText>
          <ul class="cix__rows">
            <li v-for="c in g.items" :key="c.id" class="cix__row">
              <MiAvatar :name="c.name" size="sm" tone="auto" decorative />
              <div class="cix__text">
                <span class="cix__name">{{ c.name }}</span>
                <MiText variant="caption" tone="label2" :lines="1">{{ c.role }} · {{ c.company }}</MiText>
              </div>
              <MiIconButton
                :label="(c.starred ? 'Unstar ' : 'Star ') + c.name" variant="plain" size="small"
                :pressed="c.starred" class="cix__star" @click="c.starred = !c.starred"
              ><MiIcon name="star" :size="16" /></MiIconButton>
            </li>
          </ul>
        </section>
        <MiText v-if="!groups.length" variant="footnote" tone="label2" class="cix__empty">No one matches “{{ query }}”.</MiText>
      </div>

      <!-- A to Z rail: letters without anyone stay visible but disabled. -->
      <nav class="cix__rail" aria-label="Jump to letter">
        <button
          v-for="l in LETTERS" :key="l" type="button" class="cix__jump"
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
.cix { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.cix__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.cix__search { flex: 1 1 220px; max-width: 320px; }
.cix__frame { display: grid; grid-template-columns: minmax(0, 1fr) auto; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.cix__scroll { max-height: 460px; overflow-y: auto; overscroll-behavior: contain; scroll-padding-top: 0; }
.cix__scroll:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.cix__letter { position: sticky; top: 0; z-index: 1; padding: 6px 16px; background: var(--mi-elev); color: var(--mi-label2); border-bottom: 1px solid var(--mi-sep); text-transform: uppercase; letter-spacing: .06em; }
.cix__rows { display: grid; margin: 0; padding: 0; list-style: none; }
.cix__row { display: flex; align-items: center; gap: 12px; padding: 10px 8px 10px 16px; }
.cix__row + .cix__row { border-top: 1px solid var(--mi-sep); }
.cix__text { display: grid; flex: 1; min-width: 0; }
.cix__name { font-size: 15px; font-weight: 500; }
.cix__star[aria-pressed="true"] { color: var(--mi-orange); }
.cix__empty { padding: 28px; text-align: center; }
.cix__rail { display: grid; align-content: center; gap: 0; padding: 6px 4px; border-left: 1px solid var(--mi-sep); }
.cix__jump { width: 24px; padding: 1px 0; border: 0; border-radius: 6px; background: none; color: var(--mi-p-text); font: inherit; font-size: 10px; font-weight: 700; line-height: 1.5; cursor: pointer; }
.cix__jump:disabled { color: var(--mi-label3); opacity: .5; cursor: default; }
.cix__jump:not(:disabled):hover { background: var(--mi-p-tint); }
.cix__jump:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -1px; }

@container (min-width: 720px) {
  .cix__rows { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cix__row + .cix__row { border-top: 0; }
  .cix__row { border-bottom: 1px solid var(--mi-sep); }
  .cix__jump { font-size: 11px; }
}
</style>
