<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="edp-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="edp-title" variant="title3" as="h2" weight="semibold">Halden Journal</MiText>
        <MiText variant="footnote" tone="label2">{{ readyCount }} drafts ready to schedule · next slot Thu, Nov 5</MiText>
      </div>
      <MiButton size="small">
        <template #leading><MiIcon name="plus" :size="14" /></template>
        New article
      </MiButton>
    </header>

    <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
      <MiSegmented v-model="status" label="Status" :options="statusOptions" />
      <MiSearch v-model="query" size="compact" placeholder="Title or author" aria-label="Search articles" class="mi:flex-[0_1_240px]! mi:min-w-0!" />
    </div>

    <div class="mi:hidden mi:min-w-0 mi:overflow-x-auto mi:@[760px]:block">
      <MiDataTable :columns="columns" :rows="rows" :filterable="false" :page-size="6" caption="Articles" empty-text="No article matches.">
        <template #cell-title="{ row }">
          <span class="mi:grid mi:gap-0.5 mi:py-1 mi:px-0 mi:min-w-0">
            <span class="mi:font-semibold mi:leading-[1.3]">{{ a(row).title }}</span>
            <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[12px] mi:text-label2"><i class="mi:w-1.5 mi:h-1.5 mi:rounded-[2px]" :style="{ background: sections[a(row).section] }" aria-hidden="true" />{{ a(row).section }} · {{ a(row).words.toLocaleString('en-US') }} words</span>
          </span>
        </template>
        <template #cell-author="{ row }">
          <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[13px] mi:whitespace-nowrap"><MiAvatar :name="a(row).author" size="xs" tone="auto" decorative />{{ a(row).author.split(' ')[0] }}</span>
        </template>
        <template #cell-status="{ row }"><MiBadge :tone="statusTone[a(row).status]" :label="statusName[a(row).status]" /></template>
        <template #cell-checks="{ row }">
          <!-- Readiness: four checks an editor ticks off in place; when all pass, the draft can be scheduled. -->
          <span class="mi:inline-flex mi:gap-1" role="group" :aria-label="a(row).title + ' readiness'">
            <button
              v-for="k in checkKeys" :key="k" type="button" class="mi:[font:inherit] mi:text-[10.5px] mi:font-bold mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:p-0 mi:[border:0] mi:rounded-[6px] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.9)] mi:disabled:cursor-default mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="a(row).checks[k] ? 'mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_18%,_transparent)] mi:shadow-none' : 'mi:text-label3 mi:bg-fill2 mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]'"
              :aria-pressed="a(row).checks[k]" :aria-label="checkName[k]" :title="checkName[k]" :disabled="a(row).status === 'published'"
              @click="flip(a(row).id, k)"
            >{{ checkName[k][0] }}</button>
          </span>
        </template>
        <template #cell-when="{ row }">
          <span class="mi:grid mi:justify-items-end mi:gap-0.5 mi:text-[13px] mi:whitespace-nowrap">
            <span>{{ a(row).when }}</span>
            <span v-if="a(row).views" class="mi:text-[11.5px] mi:text-label2 mi:tabular-nums">{{ a(row).views }} views</span>
            <MiButton v-else-if="isReady(a(row))" size="mini" variant="tinted" @click="schedule(a(row).id)">Schedule</MiButton>
          </span>
        </template>
      </MiDataTable>
    </div>

    <ul class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[760px]:hidden">
      <li v-for="art in rows" :key="art.id" class="mi:grid mi:gap-2 mi:py-3 mi:px-3.5 mi:rounded-lg mi:bg-card mi:shadow-1">
        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1.5 mi:gap-x-2.5">
          <MiBadge :tone="statusTone[art.status]" :label="statusName[art.status]" />
          <MiText as="span" variant="caption" tone="label2">{{ art.when }}</MiText>
        </div>
        <MiText as="h3" variant="subheadline" weight="semibold">{{ art.title }}</MiText>
        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1.5 mi:gap-x-2.5">
          <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[13px] mi:whitespace-nowrap"><MiAvatar :name="art.author" size="xs" tone="auto" decorative />{{ art.author }}</span>
          <span class="mi:inline-flex mi:gap-1" role="group" :aria-label="art.title + ' readiness'">
            <button
              v-for="k in checkKeys" :key="k" type="button" class="mi:[font:inherit] mi:text-[10.5px] mi:font-bold mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:p-0 mi:[border:0] mi:rounded-[6px] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.9)] mi:disabled:cursor-default mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="art.checks[k] ? 'mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_18%,_transparent)] mi:shadow-none' : 'mi:text-label3 mi:bg-fill2 mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]'"
              :aria-pressed="art.checks[k]" :aria-label="checkName[k]" :disabled="art.status === 'published'" @click="flip(art.id, k)"
            >{{ checkName[k][0] }}</button>
          </span>
        </div>
        <MiButton v-if="isReady(art)" size="small" variant="tinted" block @click="schedule(art.id)">Schedule for Thu, Nov 5</MiButton>
      </li>
      <li v-if="!rows.length" class="mi:p-5 mi:text-center"><MiText variant="footnote" tone="label2">No article matches.</MiText></li>
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
