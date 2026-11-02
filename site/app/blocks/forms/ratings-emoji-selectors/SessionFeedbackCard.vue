<template>
  <section class="sfb" aria-labelledby="sfb-title" :style="{ '--sfb-mood': current?.color ?? 'var(--mi-p)' }">
    <div v-if="sent" class="sfb__card sfb__thanks" role="status" aria-live="polite">
      <svg class="sfb__big" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="18" class="sfb__face-bg" />
        <circle cx="14" cy="16.5" r="1.8" /><circle cx="26" cy="16.5" r="1.8" />
        <path :d="mouth(current?.value ?? 5)" />
      </svg>
      <MiText as="h2" variant="title3" weight="semibold">Thanks, that helps Aiko</MiText>
      <MiText variant="subheadline" tone="label2" align="center">
        You and 212 others rated this session. Average so far: {{ average }} / 5.
      </MiText>
      <MiButton variant="gray" @click="reset">Edit my feedback</MiButton>
    </div>

    <form v-else class="sfb__card" novalidate @submit.prevent="submit">
      <header class="sfb__head">
        <MiText variant="caption" tone="label2" weight="medium">Room B · Thursday 14:30 · Track: Mobile</MiText>
        <MiText id="sfb-title" as="h2" variant="title3" weight="semibold" balance>How was “Offline-first, for real” with Aiko Tanaka?</MiText>
      </header>

      <fieldset class="sfb__set">
        <legend class="sfb__sr">Overall feeling</legend>
        <div class="sfb__faces" :class="{ 'has-pick': mood !== null }">
          <label v-for="m in moods" :key="m.value" class="sfb__face" :class="{ 'is-on': mood === m.value }" :style="{ '--sfb-c': m.color }">
            <input v-model="mood" type="radio" name="sfb-mood" :value="m.value" class="sfb__radio">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="18" class="sfb__face-bg" />
              <circle cx="14" cy="16.5" r="1.8" /><circle cx="26" cy="16.5" r="1.8" />
              <path :d="mouth(m.value)" />
            </svg>
            <span class="sfb__face-l">{{ m.label }}</span>
          </label>
        </div>
        <MiText v-if="err('mood')" variant="footnote" tone="red" role="alert">{{ err('mood') }}</MiText>
      </fieldset>

      <!-- Follow-up chips adapt to the mood: what went wrong, or what stood out. -->
      <div v-if="mood !== null" class="sfb__set">
        <MiText as="h3" variant="subheadline" weight="semibold">{{ mood <= 2 ? 'What got in the way?' : mood === 3 ? 'What would have made it better?' : 'What stood out?' }}</MiText>
        <div class="sfb__chips">
          <MiChip v-for="t in tags" :key="t" :label="t" selectable :model-value="picked.includes(t)" tone="neutral" @update:model-value="toggle(t, $event)" />
        </div>
      </div>

      <div class="sfb__set">
        <MiText as="h3" variant="subheadline" weight="semibold">Rate the details</MiText>
        <div class="sfb__rates">
          <div v-for="r in aspects" :key="r.id" class="sfb__rate">
            <span :id="'sfb-' + r.id" class="sfb__rate-l">{{ r.label }}</span>
            <MiRating v-model="ratings[r.id]" half :label="r.label" clearable />
            <span class="sfb__rate-v" aria-hidden="true">{{ ratings[r.id] ? ratings[r.id].toFixed(1) : '—' }}</span>
          </div>
        </div>
        <MiText v-if="err('ratings')" variant="footnote" tone="red" role="alert">{{ err('ratings') }}</MiText>
      </div>

      <MiField label="Anything for Aiko?" hint="Optional. Speakers read every comment.">
        <MiTextarea v-model="comment" :rows="2" :maxlength="400" counter placeholder="The conflict-resolution demo was the part I'll reuse on Monday." />
      </MiField>

      <div class="sfb__foot">
        <label class="sfb__share">
          <MiSwitch v-model="share" size="compact" label="Share my name with the speaker" />
          <span aria-hidden="true">Share my name</span>
        </label>
        <MiButton type="submit">Send feedback</MiButton>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

const moods = [
  { value: 1, label: 'Wasted', color: 'var(--mi-red)' },
  { value: 2, label: 'Meh', color: 'var(--mi-orange)' },
  { value: 3, label: 'Okay', color: 'var(--mi-yellow)' },
  { value: 4, label: 'Good', color: 'var(--mi-teal)' },
  { value: 5, label: 'Loved it', color: 'var(--mi-green)' }
]
const aspects = [
  { id: 'content', label: 'Content' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'relevance', label: 'Relevance' }
] as const
type Aspect = typeof aspects[number]['id']

// Mouth curve from frown (1) to grin (5): the control point moves below the corners as the mood rises.
const mouth = (v: number) => {
  const y = 27 - (v - 1) * 0.5
  const c = y + (v - 3) * 3.4
  return `M13 ${y} Q20 ${c} 27 ${y}`
}

const mood = ref<number | null>(null)
const current = computed(() => moods.find(m => m.value === mood.value))
const picked = ref<string[]>([])
const ratings = reactive<Record<Aspect, number>>({ content: 0, delivery: 0, relevance: 0 })
const comment = ref('')
const share = ref(true)

const tags = computed(() => {
  if (mood.value === null) return []
  if (mood.value <= 2) return ['Too basic', 'Too fast', 'Audio issues', 'Ran over time', 'Not what the abstract said']
  if (mood.value === 3) return ['More code', 'Fewer slides', 'Longer Q&A', 'Real-world numbers']
  return ['Live demo', 'Clear slides', 'Honest trade-offs', 'Great Q&A', 'Code I can reuse']
})
watch(tags, (t) => { picked.value = picked.value.filter(p => t.includes(p)) })
function toggle(tag: string, on: boolean) {
  picked.value = on ? [...picked.value, tag] : picked.value.filter(p => p !== tag)
}

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (mood.value === null) e.mood = 'Pick a face for your overall feeling.'
  const missing = aspects.filter(a => !ratings[a.id]).map(a => a.label.toLowerCase())
  if (missing.length) e.ratings = `Rate ${missing.join(' and ')} too.`
  return e
})
const submitted = ref(false)
const err = (k: string) => (submitted.value ? errors.value[k] : undefined)

const sent = ref(false)
const average = computed(() => ((4.4 * 212 + (ratings.content + ratings.delivery + ratings.relevance) / 3) / 213).toFixed(1))

function submit() {
  submitted.value = true
  if (Object.keys(errors.value).length) return
  sent.value = true
}
function reset() {
  sent.value = false
  submitted.value = false
}
</script>

<style scoped>
.sfb { container: sfb / inline-size; display: grid; justify-items: center; font-family: var(--mi-font); color: var(--mi-label); }
.sfb__card {
  position: relative; display: grid; gap: 22px; width: 100%; max-width: 620px; padding: 24px 20px; overflow: hidden; isolation: isolate;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2);
}
/* A soft wash in the mood color: static gradient, faded in with opacity. */
.sfb__card::before {
  content: ""; position: absolute; inset: 0 0 auto; height: 160px; z-index: -1;
  background: linear-gradient(180deg, color-mix(in srgb, var(--sfb-mood) 16%, transparent), transparent);
}
.sfb__head { display: grid; gap: 6px; }
.sfb__set { display: grid; gap: 12px; min-width: 0; margin: 0; padding: 0; border: 0; }

.sfb__faces { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; }
.sfb__face { position: relative; display: grid; justify-items: center; gap: 6px; padding: 8px 0; border-radius: 16px; cursor: pointer; }
.sfb__face svg { width: min(52px, 100%); aspect-ratio: 1; fill: none; stroke: var(--mi-label2); stroke-width: 2; stroke-linecap: round; transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-3) var(--mi-ease); }
.sfb__face svg circle:not(.sfb__face-bg) { fill: var(--mi-label2); stroke: none; }
.sfb__face-bg { fill: var(--mi-fill3); stroke: none; }
.sfb__face:hover svg { transform: translateY(-2px); }
.has-pick .sfb__face:not(.is-on) svg { opacity: .45; }
.sfb__face.is-on svg { transform: scale(1.18); stroke: var(--mi-label); }
.sfb__face.is-on svg circle:not(.sfb__face-bg) { fill: var(--mi-label); }
.sfb__face.is-on .sfb__face-bg { fill: color-mix(in srgb, var(--sfb-c) 55%, var(--mi-card)); }
.sfb__face-l { font-size: 12px; font-weight: 500; color: var(--mi-label2); text-align: center; }
.sfb__face.is-on .sfb__face-l { color: var(--mi-label); font-weight: 600; }
.sfb__face:has(.sfb__radio:focus-visible) { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.sfb__radio { position: absolute; opacity: 0; pointer-events: none; }

.sfb__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.sfb__rates { display: grid; gap: 4px; }
.sfb__rate { display: grid; grid-template-columns: minmax(80px, 1fr) auto 32px; align-items: center; gap: 12px; padding: 6px 0; }
.sfb__rate + .sfb__rate { border-top: 1px solid var(--mi-sep); }
.sfb__rate-l { font-size: 14px; }
.sfb__rate-v { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--mi-label2); text-align: end; }
.sfb__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.sfb__share { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--mi-label2); cursor: pointer; }

.sfb__thanks { justify-items: center; gap: 12px; padding: 40px 24px; text-align: center; }
.sfb__big { width: 72px; height: 72px; fill: none; stroke: var(--mi-label); stroke-width: 2; stroke-linecap: round; animation: sfb-pop var(--mi-dur-4) var(--mi-spring); }
.sfb__big circle:not(.sfb__face-bg) { fill: var(--mi-label); stroke: none; }
.sfb__big .sfb__face-bg { fill: color-mix(in srgb, var(--sfb-mood) 55%, var(--mi-card)); }
.sfb__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@keyframes sfb-pop { from { transform: scale(.6); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .sfb__big { animation: none; } }
</style>
