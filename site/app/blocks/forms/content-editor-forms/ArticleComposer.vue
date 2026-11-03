<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="ac-title">
    <header class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
      <div>
        <MiText id="ac-title" variant="title3" as="h2" weight="semibold">Write a field note</MiText>
        <MiText variant="footnote" tone="label2">Northwind Journal · autosaved {{ savedAgo }}</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
        <MiSegmented v-model="status" label="Status" :options="[{ value: 'draft', label: 'Draft' }, { value: 'review', label: 'In review' }]" />
        <MiButton :disabled="!ready" @click="publish">
          {{ published ? (status === 'review' ? 'Sent to editors' : 'Published') : (status === 'review' ? 'Request review' : 'Publish') }}
        </MiButton>
      </div>
    </header>

    <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[860px]:grid-cols-[minmax(0,_1fr)_300px] mi:@[860px]:items-start">
      <form class="mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0" novalidate @submit.prevent="publish">
        <label>
          <span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Title</span>
          <textarea v-model="title" rows="1" maxlength="90" placeholder="Give it a headline" class="mi:w-full mi:p-0 mi:[border:0] mi:resize-none mi:[field-sizing:content] mi:bg-transparent mi:text-label mi:[font:700_clamp(22px,_4.4cqi,_30px)/1.2_var(--mi-font)] mi:tracking-[-.03em] mi:placeholder:text-label3 mi:focus-visible:[outline:none] mi:focus-visible:shadow-[0_2px_0_var(--mi-p)]" />
        </label>
        <MiField label="Excerpt" :hint="excerpt.length + ' / 160 · shown in search results and the newsletter'">
          <MiTextarea v-model="excerpt" :rows="2" :maxlength="160" />
        </MiField>
        <MiEditor v-model="body" label="Article body" placeholder="Start with the moment that surprised you…" :min-height="220" :max-height="420" />
        <MiField label="Tags" hint="Up to 4">
          <MiTagInput v-model="tags" :max="4" placeholder="Add a tag" />
        </MiField>
      </form>

      <aside class="mi:grid mi:gap-3 mi:min-w-0 mi:[@container_(min-width:_560px)_and_(max-width:_859px)]:grid-cols-2" aria-label="Publishing checks">
        <!-- Search snippet: the article as it will look in a results page. -->
        <div class="mi:[@container_(min-width:_560px)_and_(max-width:_859px)]:first:col-[span_2] mi:grid mi:gap-2.5 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1 mi:min-w-0">
          <MiText variant="caption" weight="semibold" tone="label2" as="h3">Search preview</MiText>
          <div class="mi:grid mi:gap-[3px] mi:p-3 mi:rounded-md mi:bg-fill4 mi:wrap-anywhere">
            <span class="mi:text-[12px] mi:text-label2">journal.northwind.studio › notes › {{ slug || 'untitled' }}</span>
            <span class="mi:text-[16px] mi:leading-[1.3] mi:text-p-text mi:font-medium">{{ clip(title || 'Untitled field note', 60) }}</span>
            <span class="mi:text-[13px] mi:leading-[1.45] mi:text-label2">{{ clip(excerpt || plain.slice(0, 160) || 'Add an excerpt so readers know what they will get.', 156) }}</span>
          </div>
        </div>

        <div class="mi:[@container_(min-width:_560px)_and_(max-width:_859px)]:first:col-[span_2] mi:grid mi:gap-2.5 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1 mi:min-w-0">
          <div class="mi:grid mi:grid-cols-3">
            <div class="mi:not-first:pl-3 mi:not-first:border-l mi:not-first:border-l-sep mi:grid"><b class="mi:text-[20px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums">{{ words }}</b><span class="mi:text-[12px] mi:text-label2">words</span></div>
            <div class="mi:not-first:pl-3 mi:not-first:border-l mi:not-first:border-l-sep mi:grid"><b class="mi:text-[20px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums">{{ minutes }} min</b><span class="mi:text-[12px] mi:text-label2">read</span></div>
            <div class="mi:not-first:pl-3 mi:not-first:border-l mi:not-first:border-l-sep mi:grid"><b class="mi:text-[20px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums">{{ headings }}</b><span class="mi:text-[12px] mi:text-label2">sections</span></div>
          </div>
          <div class="mi:relative mi:h-1.5 mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden" role="meter" aria-label="Length towards the 600 word target" :aria-valuenow="words" aria-valuemin="0" aria-valuemax="600">
            <span class="mi:absolute mi:bg-p mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${Math.min(1, words / 600)})` }" />
            <i class="mi:absolute mi:bg-card mi:top-0 mi:bottom-0 mi:left-1/2 mi:w-0.5" aria-hidden="true" />
          </div>
          <MiText variant="caption2" tone="label3">Field notes land best between 300 and 600 words.</MiText>
        </div>

        <div class="mi:[@container_(min-width:_560px)_and_(max-width:_859px)]:first:col-[span_2] mi:grid mi:gap-2.5 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1 mi:min-w-0">
          <MiText variant="caption" weight="semibold" tone="label2" as="h3">Before publishing</MiText>
          <ul class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[13px]">
            <li class="mi:flex mi:[align-items:flex-start] mi:gap-2" v-for="c in checks" :key="c.label" :class="c.ok ? 'mi:text-label' : 'mi:text-label2'">
              <MiIcon class="mi:flex-[none]" :class="c.ok ? 'mi:text-green' : 'mi:text-orange'" :name="c.ok ? 'check-circle-fill' : 'exclamation-circle'" :size="18" />
              <span>{{ c.label }}</span>
            </li>
          </ul>
        </div>
        <p class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" aria-live="polite">{{ published ? 'Published.' : ready ? 'Ready to publish.' : `${checks.filter(c => !c.ok).length} checks left before publishing.` }}</p>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const title = ref('What a week of user interviews taught us about onboarding')
const excerpt = ref('')
const body = ref('<h2>The first ten minutes</h2><p>We sat with eleven new customers while they set up their first workspace. Nine of them stopped at the same screen: the one that asks them to invite their team before they have seen anything worth inviting anyone to.</p><p>The fix we shipped was not a redesign. We moved one step, and activation went up the next day.</p>')
const tags = ref<string[]>(['research', 'onboarding'])
const status = ref<string | number | null>('draft')
const published = ref(false)
const savedAgo = ref('just now')

const plain = computed(() => body.value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim())
const words = computed(() => (plain.value ? plain.value.split(' ').length : 0))
const minutes = computed(() => Math.max(1, Math.round(words.value / 220)))
const headings = computed(() => (body.value.match(/<h[23][\s>]/g) ?? []).length)
const slug = computed(() => title.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 6).join('-'))

const checks = computed(() => [
  { label: 'Headline between 30 and 70 characters', ok: title.value.trim().length >= 30 && title.value.trim().length <= 70 },
  { label: 'Excerpt written (80+ characters)', ok: excerpt.value.trim().length >= 80 },
  { label: 'At least 150 words', ok: words.value >= 150 },
  { label: 'At least one section heading', ok: headings.value > 0 },
  { label: 'One to four tags', ok: tags.value.length > 0 }
])
const ready = computed(() => checks.value.every(c => c.ok) && !published.value)

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)

watch([title, excerpt, body, tags], () => {
  published.value = false
  savedAgo.value = 'just now'
})
function publish() {
  if (!checks.value.every(c => c.ok)) return
  published.value = true
}
</script>
