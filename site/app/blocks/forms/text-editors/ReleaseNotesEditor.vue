<template>
  <section class="mi:@container/rne mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="rne-title">
    <header class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-4">
      <div class="mi:grid mi:gap-0.5">
        <MiText id="rne-title" as="h2" variant="headline">Release notes</MiText>
        <MiText variant="footnote" tone="label2">Tidewater · Changelog</MiText>
      </div>
      <div class="mi:flex mi:items-center mi:gap-2.5">
        <MiBadge :label="state.label" :tone="state.tone" dot />
        <MiText variant="caption" tone="label2" aria-live="polite">{{ saveText }}</MiText>
      </div>
    </header>

    <MiAlert v-if="published" tone="success" title="Published to the changelog" dismissible @dismiss="published = false">
      {{ title }} is live for {{ audience === 'public' ? 'customers' : 'the internal team' }}. Subscribers get it in tomorrow's digest.
    </MiAlert>

    <div class="mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[840px]/rne:grid-cols-[minmax(0,_1fr)_260px]">
      <form class="mi:grid mi:gap-3 mi:pt-5.5 mi:px-5 mi:pb-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0" novalidate @submit.prevent="publish">
        <label class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" for="rne-doc-title">Title</label>
        <!-- The hidden mirror after the textarea sizes the grid cell, so long titles wrap and grow without measuring. -->
        <div class="mi:grid mi:min-w-0 mi:after:[grid-area:1_/_1] mi:after:w-full mi:after:m-0 mi:after:pt-1 mi:after:px-0 mi:after:pb-2 mi:after:rounded-none mi:after:tracking-[-.03em] mi:after:whitespace-pre-wrap mi:after:wrap-anywhere mi:after:content-[attr(data-value)] mi:after:invisible mi:after:[border:0] mi:after:border-b mi:after:border-b-transparent mi:after:[font:inherit] mi:after:text-[clamp(22px,_4.2cqi,_30px)] mi:after:font-bold mi:after:leading-[1.2]" :data-value="(title || 'Untitled release') + ' '">
          <textarea
            id="rne-doc-title" v-model="title" class="mi:[grid-area:1_/_1] mi:w-full mi:m-0 mi:pt-1 mi:px-0 mi:pb-2 mi:rounded-none mi:tracking-[-.03em] mi:whitespace-pre-wrap mi:wrap-anywhere mi:block mi:h-full mi:overflow-hidden mi:resize-none mi:[outline:none] mi:bg-transparent mi:text-label mi:placeholder:text-label3 mi:[border:0] mi:border-b mi:[font:inherit] mi:text-[clamp(22px,_4.2cqi,_30px)] mi:font-bold mi:leading-[1.2]" :class="submitted && errors.title ? 'mi:border-b-red mi:focus-visible:border-b-red' : 'mi:border-b-sep mi:focus-visible:border-b-p'" placeholder="Untitled release" rows="1"
            :aria-invalid="!!err('title')" :aria-describedby="err('title') ? 'rne-title-err' : undefined" @keydown.enter.prevent
          />
        </div>
        <MiText v-if="err('title')" id="rne-title-err" variant="caption" tone="red">{{ err('title') }}</MiText>

        <MiEditor v-model="html" label="Release notes body" placeholder="What changed, and why it matters…" :min-height="260" :max-height="420" :invalid="!!err('body')" />
        <MiText v-if="err('body')" variant="caption" tone="red" role="alert">{{ err('body') }}</MiText>

        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5 mi:pt-1.5">
          <MiText variant="caption" tone="label2" tabular>{{ words }} words · {{ minutes }} min read</MiText>
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
            <MiSegmented v-model="audience" label="Audience" :options="audiences" />
            <MiButton type="submit" :loading="publishing">Publish</MiButton>
          </div>
        </div>
      </form>

      <aside class="mi:grid mi:gap-3 mi:[@container_rne_(min-width:_560px)_and_(max-width:_839px)]:grid-cols-[1fr_1fr] mi:[@container_rne_(min-width:_560px)_and_(max-width:_839px)]:items-start" aria-label="Document overview">
        <div class="mi:grid mi:gap-2.5 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1">
          <MiText as="h3" variant="footnote" weight="semibold" tone="label2" class="mi:uppercase! mi:tracking-[.06em]! mi:text-[11px]!">Outline</MiText>
          <ol v-if="outline.length" class="mi:grid mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[13.5px]">
            <li class="mi:pl-2.5 mi:border-l-2 mi:leading-[1.35]" v-for="(h, i) in outline" :key="i" :class="h.level === 3 ? 'mi:ml-3.5 mi:border-l-sep mi:text-label2' : 'mi:border-l-p'">{{ h.text }}</li>
          </ol>
          <MiText v-else variant="footnote" tone="label3">Add headings to build an outline.</MiText>
        </div>
        <div class="mi:grid mi:gap-2.5 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1">
          <div class="mi:flex mi:items-center mi:gap-3">
            <MiProgressRing :value="score" :max="checks.length" :size="44" :show-value="false" label="Publish readiness" />
            <div>
              <MiText as="h3" variant="subheadline" weight="semibold">{{ score === checks.length ? 'Ready to ship' : 'Almost there' }}</MiText>
              <MiText variant="caption" tone="label2">{{ score }} of {{ checks.length }} checks pass</MiText>
            </div>
          </div>
          <ul class="mi:grid mi:gap-[7px] mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[13px] mi:text-label2">
            <li class="mi:flex mi:items-center mi:gap-2" v-for="c in checks" :key="c.label" :class="c.ok ? 'mi:text-label' : ''">
              <MiIcon :class="c.ok ? 'mi:text-green' : ''" :name="c.ok ? 'check-circle-fill' : 'dash'" :size="16" />
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
