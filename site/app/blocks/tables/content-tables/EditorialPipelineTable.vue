<template>
  <section class="edp" aria-labelledby="edp-title">
    <header class="edp__head">
      <div>
        <MiText id="edp-title" variant="title3" as="h2" weight="semibold">Halden Journal</MiText>
        <MiText variant="footnote" tone="label2">{{ readyCount }} drafts ready to schedule · next slot Thu, Nov 5</MiText>
      </div>
      <MiButton size="small">
        <template #leading><MiIcon name="plus" :size="14" /></template>
        New article
      </MiButton>
    </header>

    <div class="edp__toolbar">
      <MiSegmented v-model="status" label="Status" :options="statusOptions" />
      <MiSearch v-model="query" size="compact" placeholder="Title or author" aria-label="Search articles" class="edp__search" />
    </div>

    <div class="edp__table">
      <MiDataTable :columns="columns" :rows="rows" :filterable="false" :page-size="6" caption="Articles" empty-text="No article matches.">
        <template #cell-title="{ row }">
          <span class="edp__title">
            <span class="edp__headline">{{ a(row).title }}</span>
            <span class="edp__section"><i :style="{ background: sections[a(row).section] }" aria-hidden="true" />{{ a(row).section }} · {{ a(row).words.toLocaleString('en-US') }} words</span>
          </span>
        </template>
        <template #cell-author="{ row }">
          <span class="edp__author"><MiAvatar :name="a(row).author" size="xs" tone="auto" decorative />{{ a(row).author.split(' ')[0] }}</span>
        </template>
        <template #cell-status="{ row }"><MiBadge :tone="statusTone[a(row).status]" :label="statusName[a(row).status]" /></template>
        <template #cell-checks="{ row }">
          <!-- Readiness: four checks an editor ticks off in place; when all pass, the draft can be scheduled. -->
          <span class="edp__checks" role="group" :aria-label="a(row).title + ' readiness'">
            <button
              v-for="k in checkKeys" :key="k" type="button" class="edp__check" :class="{ 'is-on': a(row).checks[k] }"
              :aria-pressed="a(row).checks[k]" :aria-label="checkName[k]" :title="checkName[k]" :disabled="a(row).status === 'published'"
              @click="flip(a(row).id, k)"
            >{{ checkName[k][0] }}</button>
          </span>
        </template>
        <template #cell-when="{ row }">
          <span class="edp__when">
            <span>{{ a(row).when }}</span>
            <span v-if="a(row).views" class="edp__views">{{ a(row).views }} views</span>
            <MiButton v-else-if="isReady(a(row))" size="mini" variant="tinted" @click="schedule(a(row).id)">Schedule</MiButton>
          </span>
        </template>
      </MiDataTable>
    </div>

    <ul class="edp__cards">
      <li v-for="art in rows" :key="art.id" class="edp__card">
        <div class="edp__card-top">
          <MiBadge :tone="statusTone[art.status]" :label="statusName[art.status]" />
          <MiText as="span" variant="caption" tone="label2">{{ art.when }}</MiText>
        </div>
        <MiText as="h3" variant="subheadline" weight="semibold">{{ art.title }}</MiText>
        <div class="edp__card-foot">
          <span class="edp__author"><MiAvatar :name="art.author" size="xs" tone="auto" decorative />{{ art.author }}</span>
          <span class="edp__checks" role="group" :aria-label="art.title + ' readiness'">
            <button
              v-for="k in checkKeys" :key="k" type="button" class="edp__check" :class="{ 'is-on': art.checks[k] }"
              :aria-pressed="art.checks[k]" :aria-label="checkName[k]" :disabled="art.status === 'published'" @click="flip(art.id, k)"
            >{{ checkName[k][0] }}</button>
          </span>
        </div>
        <MiButton v-if="isReady(art)" size="small" variant="tinted" block @click="schedule(art.id)">Schedule for Thu, Nov 5</MiButton>
      </li>
      <li v-if="!rows.length" class="edp__none"><MiText variant="footnote" tone="label2">No article matches.</MiText></li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Status = 'draft' | 'review' | 'scheduled' | 'published'
type Check = 'copy' | 'images' | 'seo' | 'legal'
interface Article { id: string, title: string, section: string, author: string, status: Status, words: number, when: string, views?: string, checks: Record<Check, boolean> }

const statusName: Record<Status, string> = { draft: 'Draft', review: 'In review', scheduled: 'Scheduled', published: 'Published' }
const statusTone = { draft: 'neutral', review: 'warning', scheduled: 'primary', published: 'success' } as const
const checkKeys: Check[] = ['copy', 'images', 'seo', 'legal']
const checkName: Record<Check, string> = { copy: 'Copy edit', images: 'Images', seo: 'SEO', legal: 'Legal' }
const sections: Record<string, string> = { Guides: 'var(--mi-green)', Gear: 'var(--mi-blue)', Repair: 'var(--mi-orange)', Stories: 'var(--mi-purple)' }

const all = (v: boolean) => ({ copy: v, images: v, seo: v, legal: v })
const articles = reactive<Article[]>([
  { id: 'a1', title: 'Packing for a wet week in Lofoten', section: 'Guides', author: 'Saoirse Byrne', status: 'published', words: 1840, when: 'Oct 28', views: '12.4k', checks: all(true) },
  { id: 'a2', title: 'Down or synthetic: what 400 returns taught us', section: 'Gear', author: 'Tomás Ruiz', status: 'scheduled', words: 2310, when: 'Nov 5, 08:00', checks: all(true) },
  { id: 'a3', title: 'The case for repairing your tent pole', section: 'Repair', author: 'Noor Haddad', status: 'review', words: 1120, when: 'Edited 2 h ago', checks: { copy: true, images: true, seo: false, legal: true } },
  { id: 'a4', title: 'Behind the Fjell 2P: three prototypes', section: 'Stories', author: 'Inès Moreau', status: 'review', words: 1530, when: 'Edited yesterday', checks: { copy: true, images: false, seo: true, legal: false } },
  { id: 'a5', title: 'Hut to hut across the Tatras', section: 'Stories', author: 'Marta Kowalska', status: 'draft', words: 2050, when: 'Edited Oct 30', checks: all(true) },
  { id: 'a6', title: 'Winter layering for city commutes', section: 'Guides', author: 'Ana Paula Souza', status: 'draft', words: 640, when: 'Edited Oct 29', checks: all(false) },
  { id: 'a7', title: 'How we test waterproof zips', section: 'Gear', author: 'Yuki Tanaka', status: 'scheduled', words: 1410, when: 'Nov 12, 08:00', checks: all(true) },
  { id: 'a8', title: 'Ten-minute stove fixes', section: 'Repair', author: 'Kofi Mensah', status: 'published', words: 980, when: 'Oct 14', views: '8.1k', checks: all(true) },
  { id: 'a9', title: 'A first map of the Kungsleden', section: 'Guides', author: 'Lena Vogel', status: 'published', words: 2760, when: 'Sep 30', views: '21.9k', checks: all(true) }
])
const a = (row: Record<string, unknown>) => row as unknown as Article

const status = ref<string | number | null>('all')
const query = ref('')
const count = (s: Status) => articles.filter(x => x.status === s).length
const statusOptions = computed(() => [
  { value: 'all', label: 'All' },
  { value: 'draft', label: `Drafts ${count('draft') + count('review')}` },
  { value: 'scheduled', label: `Scheduled ${count('scheduled')}` },
  { value: 'published', label: `Live ${count('published')}` }
])

const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  return articles.filter(x => (status.value === 'all' || x.status === status.value || (status.value === 'draft' && x.status === 'review'))
    && (!q || x.title.toLowerCase().includes(q) || x.author.toLowerCase().includes(q)))
})

const isReady = (x: Article) => (x.status === 'draft' || x.status === 'review') && checkKeys.every(k => x.checks[k])
const readyCount = computed(() => articles.filter(isReady).length)
const flip = (id: string, k: Check) => { const x = articles.find(y => y.id === id); if (x && x.status !== 'published') x.checks[k] = !x.checks[k] }
const schedule = (id: string) => { const x = articles.find(y => y.id === id); if (x) { x.status = 'scheduled'; x.when = 'Nov 5, 08:00' } }

const columns = [
  { key: 'title', label: 'Article', sortable: true },
  { key: 'author', label: 'Author', sortable: true, width: '110px' },
  { key: 'status', label: 'Status', sortable: true, width: '110px', sortBy: (r: Record<string, unknown>) => ['draft', 'review', 'scheduled', 'published'].indexOf(a(r).status) },
  { key: 'checks', label: 'Ready', width: '130px', sortable: true, sortBy: (r: Record<string, unknown>) => checkKeys.filter(k => a(r).checks[k]).length },
  { key: 'when', label: 'Date', align: 'end' as const, width: '130px' }
]
</script>

<style scoped>
.edp { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.edp__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.edp__toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.edp__search { flex: 0 1 240px; min-width: 0; }

.edp__table { display: none; min-width: 0; overflow-x: auto; }
.edp__cards { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 760px) { .edp__table { display: block; } .edp__cards { display: none; } }

.edp__title { display: grid; gap: 2px; padding: 4px 0; min-width: 0; }
.edp__headline { font-weight: 600; line-height: 1.3; }
.edp__section { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--mi-label2); }
.edp__section i { width: 6px; height: 6px; border-radius: 2px; }
.edp__author { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; white-space: nowrap; }
.edp__when { display: grid; justify-items: end; gap: 2px; font-size: 13px; white-space: nowrap; }
.edp__views { font-size: 11.5px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }

.edp__checks { display: inline-flex; gap: 4px; }
.edp__check {
  display: grid; place-items: center; width: 22px; height: 22px; padding: 0; border: 0; border-radius: 6px; font: inherit; font-size: 10.5px; font-weight: 700;
  color: var(--mi-label3); background: var(--mi-fill2); box-shadow: inset 0 0 0 1px var(--mi-sep); cursor: pointer; transition: transform var(--mi-dur-1) var(--mi-ease);
}
.edp__check:active { transform: scale(.9); }
.edp__check.is-on { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 18%, transparent); box-shadow: none; }
.edp__check:disabled { cursor: default; }
.edp__check:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }

.edp__card { display: grid; gap: 8px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.edp__card-top, .edp__card-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 10px; }
.edp__none { padding: 20px; text-align: center; }
</style>
