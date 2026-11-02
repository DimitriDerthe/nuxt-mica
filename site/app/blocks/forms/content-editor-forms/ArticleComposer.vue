<template>
  <section class="ac" aria-labelledby="ac-title">
    <header class="ac__head">
      <div>
        <MiText id="ac-title" variant="title3" as="h2" weight="semibold">Write a field note</MiText>
        <MiText variant="footnote" tone="label2">Northwind Journal · autosaved {{ savedAgo }}</MiText>
      </div>
      <div class="ac__head-actions">
        <MiSegmented v-model="status" label="Status" :options="[{ value: 'draft', label: 'Draft' }, { value: 'review', label: 'In review' }]" />
        <MiButton :disabled="!ready" @click="publish">
          {{ published ? (status === 'review' ? 'Sent to editors' : 'Published') : (status === 'review' ? 'Request review' : 'Publish') }}
        </MiButton>
      </div>
    </header>

    <div class="ac__grid">
      <form class="ac__main" novalidate @submit.prevent="publish">
        <label class="ac__title-field">
          <span class="ac__sr">Title</span>
          <textarea v-model="title" rows="1" maxlength="90" placeholder="Give it a headline" class="ac__title-input" />
        </label>
        <MiField label="Excerpt" :hint="excerpt.length + ' / 160 · shown in search results and the newsletter'">
          <MiTextarea v-model="excerpt" :rows="2" :maxlength="160" />
        </MiField>
        <MiEditor v-model="body" label="Article body" placeholder="Start with the moment that surprised you…" :min-height="220" :max-height="420" />
        <MiField label="Tags" hint="Up to 4">
          <MiTagInput v-model="tags" :max="4" placeholder="Add a tag" />
        </MiField>
      </form>

      <aside class="ac__rail" aria-label="Publishing checks">
        <!-- Search snippet: the article as it will look in a results page. -->
        <div class="ac__card">
          <MiText variant="caption" weight="semibold" tone="label2" as="h3">Search preview</MiText>
          <div class="ac__serp">
            <span class="ac__url">journal.northwind.studio › notes › {{ slug || 'untitled' }}</span>
            <span class="ac__serp-title">{{ clip(title || 'Untitled field note', 60) }}</span>
            <span class="ac__serp-desc">{{ clip(excerpt || plain.slice(0, 160) || 'Add an excerpt so readers know what they will get.', 156) }}</span>
          </div>
        </div>

        <div class="ac__card">
          <div class="ac__stats">
            <div><b>{{ words }}</b><span>words</span></div>
            <div><b>{{ minutes }} min</b><span>read</span></div>
            <div><b>{{ headings }}</b><span>sections</span></div>
          </div>
          <div class="ac__len" role="meter" aria-label="Length towards the 600 word target" :aria-valuenow="words" aria-valuemin="0" aria-valuemax="600">
            <span :style="{ transform: `scaleX(${Math.min(1, words / 600)})` }" />
            <i aria-hidden="true" />
          </div>
          <MiText variant="caption2" tone="label3">Field notes land best between 300 and 600 words.</MiText>
        </div>

        <div class="ac__card">
          <MiText variant="caption" weight="semibold" tone="label2" as="h3">Before publishing</MiText>
          <ul class="ac__checks">
            <li v-for="c in checks" :key="c.label" :class="{ 'is-ok': c.ok }">
              <MiIcon :name="c.ok ? 'check-circle-fill' : 'exclamation-circle'" :size="18" />
              <span>{{ c.label }}</span>
            </li>
          </ul>
        </div>
        <p class="ac__sr" aria-live="polite">{{ published ? 'Published.' : ready ? 'Ready to publish.' : `${checks.filter(c => !c.ok).length} checks left before publishing.` }}</p>
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

<style scoped>
.ac { container-type: inline-size; display: grid; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.ac__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.ac__head-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.ac__grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 860px) { .ac__grid { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; } }

.ac__main { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.ac__title-input {
  width: 100%; padding: 0; border: 0; resize: none; field-sizing: content; background: transparent; color: var(--mi-label);
  font: 700 clamp(22px, 4.4cqi, 30px)/1.2 var(--mi-font); letter-spacing: -.03em;
}
.ac__title-input::placeholder { color: var(--mi-label3); }
.ac__title-input:focus-visible { outline: none; box-shadow: 0 2px 0 var(--mi-p); }
.ac__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.ac__rail { display: grid; gap: 12px; min-width: 0; }
@container (min-width: 560px) and (max-width: 859px) { .ac__rail { grid-template-columns: repeat(2, minmax(0, 1fr)); } .ac__rail > .ac__card:first-child { grid-column: span 2; } }
.ac__card { display: grid; gap: 10px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.ac__serp { display: grid; gap: 3px; padding: 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); overflow-wrap: anywhere; }
.ac__url { font-size: 12px; color: var(--mi-label2); }
.ac__serp-title { font-size: 16px; line-height: 1.3; color: var(--mi-p-text); font-weight: 500; }
.ac__serp-desc { font-size: 13px; line-height: 1.45; color: var(--mi-label2); }

.ac__stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ac__stats div { display: grid; }
.ac__stats div + div { padding-left: 12px; border-left: 1px solid var(--mi-sep); }
.ac__stats b { font-size: 20px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.ac__stats span { font-size: 12px; color: var(--mi-label2); }
.ac__len { position: relative; height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.ac__len span { position: absolute; inset: 0; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
/* Marker at 300 words, the start of the sweet spot. */
.ac__len i { position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; background: var(--mi-card); }

.ac__checks { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; font-size: 13px; }
.ac__checks li { display: flex; align-items: flex-start; gap: 8px; color: var(--mi-label2); }
.ac__checks li :deep(svg) { flex: none; color: var(--mi-orange); }
.ac__checks li.is-ok { color: var(--mi-label); }
.ac__checks li.is-ok :deep(svg) { color: var(--mi-green); }
</style>
