<template>
  <section class="rne" aria-labelledby="rne-title">
    <header class="rne__head">
      <div class="rne__crumbs">
        <MiText id="rne-title" as="h2" variant="headline">Release notes</MiText>
        <MiText variant="footnote" tone="label2">Tidewater · Changelog</MiText>
      </div>
      <div class="rne__status">
        <MiBadge :label="state.label" :tone="state.tone" dot />
        <MiText variant="caption" tone="label2" aria-live="polite">{{ saveText }}</MiText>
      </div>
    </header>

    <MiAlert v-if="published" tone="success" title="Published to the changelog" dismissible @dismiss="published = false">
      {{ title }} is live for {{ audience === 'public' ? 'customers' : 'the internal team' }}. Subscribers get it in tomorrow's digest.
    </MiAlert>

    <div class="rne__layout">
      <form class="rne__doc" novalidate @submit.prevent="publish">
        <label class="rne__sr" for="rne-doc-title">Title</label>
        <!-- The hidden mirror after the textarea sizes the grid cell, so long titles wrap and grow without measuring. -->
        <div class="rne__title-wrap" :data-value="(title || 'Untitled release') + ' '">
          <textarea
            id="rne-doc-title" v-model="title" class="rne__title" :class="{ 'is-invalid': err('title') }" placeholder="Untitled release" rows="1"
            :aria-invalid="!!err('title')" :aria-describedby="err('title') ? 'rne-title-err' : undefined" @keydown.enter.prevent
          />
        </div>
        <MiText v-if="err('title')" id="rne-title-err" variant="caption" tone="red">{{ err('title') }}</MiText>

        <MiEditor v-model="html" label="Release notes body" placeholder="What changed, and why it matters…" :min-height="260" :max-height="420" :invalid="!!err('body')" />
        <MiText v-if="err('body')" variant="caption" tone="red" role="alert">{{ err('body') }}</MiText>

        <div class="rne__foot">
          <MiText variant="caption" tone="label2" tabular>{{ words }} words · {{ minutes }} min read</MiText>
          <div class="rne__foot-actions">
            <MiSegmented v-model="audience" label="Audience" :options="audiences" />
            <MiButton type="submit" :loading="publishing">Publish</MiButton>
          </div>
        </div>
      </form>

      <aside class="rne__side" aria-label="Document overview">
        <div class="rne__card">
          <MiText as="h3" variant="footnote" weight="semibold" tone="label2" class="rne__cap">Outline</MiText>
          <ol v-if="outline.length" class="rne__outline">
            <li v-for="(h, i) in outline" :key="i" :class="'is-' + h.level">{{ h.text }}</li>
          </ol>
          <MiText v-else variant="footnote" tone="label3">Add headings to build an outline.</MiText>
        </div>
        <div class="rne__card">
          <div class="rne__score">
            <MiProgressRing :value="score" :max="checks.length" :size="44" :show-value="false" label="Publish readiness" />
            <div>
              <MiText as="h3" variant="subheadline" weight="semibold">{{ score === checks.length ? 'Ready to ship' : 'Almost there' }}</MiText>
              <MiText variant="caption" tone="label2">{{ score }} of {{ checks.length }} checks pass</MiText>
            </div>
          </div>
          <ul class="rne__checks">
            <li v-for="c in checks" :key="c.label" :class="{ 'is-ok': c.ok }">
              <MiIcon :name="c.ok ? 'check-circle-fill' : 'dash'" :size="16" />
              <span>{{ c.label }}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

type Val = string | number

const title = ref('Tidewater 4.12: offline sync and faster search')
const html = ref(
  '<h2>Highlights</h2><p>Field teams can now keep working with no signal. Edits made offline are queued on the device and merge when you reconnect, with conflicts shown side by side instead of silently overwritten.</p>'
  + '<h2>Improvements</h2><ul><li>Search returns results about 3x faster on workspaces with over 50,000 records.</li><li>CSV export keeps your column order.</li></ul>'
  + '<h3>Fixed</h3><p>Photos taken in portrait no longer rotate on upload.</p>'
)
const audiences = [{ value: 'public', label: 'Customers' }, { value: 'internal', label: 'Internal' }]
const audience = ref<Val | null>('public')

const text = computed(() => html.value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim())
const words = computed(() => (text.value ? text.value.split(/\s+/).length : 0))
const minutes = computed(() => Math.max(1, Math.round(words.value / 220)))
const outline = computed(() => [...html.value.matchAll(/<h([1-3])[^>]*>(.*?)<\/h\1>/g)]
  .map(m => ({ level: Number(m[1]), text: (m[2] ?? '').replace(/<[^>]+>/g, '').trim() }))
  .filter(h => h.text))

const checks = computed(() => [
  { label: 'Title names the version', ok: /\d+\.\d+/.test(title.value) },
  { label: 'At least 60 words', ok: words.value >= 60 },
  { label: 'Sections with headings', ok: outline.value.length >= 2 },
  { label: 'Lists what was fixed', ok: /fix/i.test(text.value) },
  { label: 'No “TODO” left in the text', ok: !/todo/i.test(text.value + title.value) }
])
const score = computed(() => checks.value.filter(c => c.ok).length)

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (!title.value.trim()) e.title = 'Give the release a title.'
  if (words.value < 60) e.body = `Write at least 60 words so readers get the why (${60 - words.value} to go).`
  else if (/todo/i.test(text.value)) e.body = 'Remove the TODO before publishing.'
  return e
})
const submitted = ref(false)
const err = (k: string) => (submitted.value ? errors.value[k] : undefined)

const status = ref<'draft' | 'published' | 'edited'>('draft')

// Autosave: a short debounce that flips the status line, nothing hits the network.
const saving = ref(false)
const savedAt = ref<Date | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
// A title is one paragraph: pasted line breaks become spaces.
watch(title, (v) => { if (/\n/.test(v)) title.value = v.replace(/\s*\n\s*/g, ' ') })

watch([title, html], () => {
  saving.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { saving.value = false; savedAt.value = new Date() }, 900)
  if (status.value === 'published') status.value = 'edited'
})
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
const saveText = computed(() => saving.value
  ? 'Saving…'
  : savedAt.value ? 'Saved at ' + savedAt.value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'All changes saved')

const state = computed(() => ({
  draft: { label: 'Draft', tone: 'neutral' as const },
  published: { label: 'Published', tone: 'success' as const },
  edited: { label: 'Edited since publish', tone: 'warning' as const }
})[status.value])

const publishing = ref(false)
const published = ref(false)
function publish() {
  submitted.value = true
  if (Object.keys(errors.value).length) return
  publishing.value = true
  setTimeout(() => {
    publishing.value = false
    status.value = 'published'
    published.value = true
    submitted.value = false
  }, 700)
}
</script>

<style scoped>
.rne { container: rne / inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.rne__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; }
.rne__crumbs { display: grid; gap: 2px; }
.rne__status { display: flex; align-items: center; gap: 10px; }

.rne__layout { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container rne (min-width: 840px) { .rne__layout { grid-template-columns: minmax(0, 1fr) 260px; } }

.rne__doc { display: grid; gap: 12px; padding: 22px 20px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.rne__title-wrap { display: grid; min-width: 0; }
.rne__title, .rne__title-wrap::after {
  grid-area: 1 / 1; width: 100%; margin: 0; padding: 4px 0 8px; border: 0; border-bottom: 1px solid var(--mi-sep); border-radius: 0;
  font: inherit; font-size: clamp(22px, 4.2cqi, 30px); font-weight: 700; letter-spacing: -.03em; line-height: 1.2;
  white-space: pre-wrap; overflow-wrap: anywhere;
}
.rne__title-wrap::after { content: attr(data-value); visibility: hidden; border-bottom-color: transparent; }
.rne__title { display: block; height: 100%; overflow: hidden; resize: none; outline: none; background: transparent; color: var(--mi-label); }
.rne__title::placeholder { color: var(--mi-label3); }
.rne__title:focus-visible { border-bottom-color: var(--mi-p); }
.rne__title.is-invalid { border-bottom-color: var(--mi-red); }
.rne__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding-top: 6px; }
.rne__foot-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }

.rne__side { display: grid; gap: 12px; }
@container rne (min-width: 560px) and (max-width: 839px) { .rne__side { grid-template-columns: 1fr 1fr; align-items: start; } }
.rne__card { display: grid; gap: 10px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.rne__cap { text-transform: uppercase; letter-spacing: .06em; font-size: 11px; }
.rne__outline { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; font-size: 13.5px; }
.rne__outline li { padding-left: 10px; border-left: 2px solid var(--mi-p); line-height: 1.35; }
.rne__outline li.is-3 { margin-left: 14px; border-left-color: var(--mi-sep); color: var(--mi-label2); }
.rne__score { display: flex; align-items: center; gap: 12px; }
.rne__checks { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; font-size: 13px; color: var(--mi-label2); }
.rne__checks li { display: flex; align-items: center; gap: 8px; }
.rne__checks li.is-ok { color: var(--mi-label); }
.rne__checks li.is-ok :deep(svg) { color: var(--mi-green); }
.rne__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
