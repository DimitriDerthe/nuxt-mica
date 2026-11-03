<template>
  <section class="mi:@container/sfb mi:grid mi:content-start mi:justify-items-center mi:font-mi mi:text-label" aria-labelledby="sfb-title" :style="{ '--sfb-mood': current?.color ?? 'var(--mi-p)' }">
    <div v-if="sent" class="mi:gap-3 mi:py-10 mi:px-6 mi:relative mi:grid mi:w-full mi:max-w-155 mi:overflow-hidden mi:isolate mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-0 mi:before:bottom-auto mi:before:left-0 mi:before:h-40 mi:before:-z-1 mi:before:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--sfb-mood)_16%,_transparent),_transparent)] mi:justify-items-center mi:text-center" role="status" aria-live="polite">
      <svg class="mi:[--mi-in-s:.6] mi:animate-[in_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:animate-none mi:w-18 mi:h-18 mi:fill-[color:none] mi:stroke-label mi:[stroke-width:2] mi:[stroke-linecap:round]" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="18" class="mi:stroke-[color:none] mi:fill-[color:color-mix(in_srgb,_var(--sfb-mood)_55%,_var(--mi-card))]" />
        <circle class="mi:fill-label mi:stroke-[color:none]" cx="14" cy="16.5" r="1.8" /><circle class="mi:fill-label mi:stroke-[color:none]" cx="26" cy="16.5" r="1.8" />
        <path :d="mouth(current?.value ?? 5)" />
      </svg>
      <MiText as="h2" variant="title3" weight="semibold">Thanks, that helps Aiko</MiText>
      <MiText variant="subheadline" tone="label2" align="center">
        You and 212 others rated this session. Average so far: {{ average }} / 5.
      </MiText>
      <MiButton variant="gray" @click="reset">Edit my feedback</MiButton>
    </div>

    <form v-else class="mi:gap-5.5 mi:py-6 mi:px-5 mi:relative mi:grid mi:w-full mi:max-w-155 mi:overflow-hidden mi:isolate mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-0 mi:before:bottom-auto mi:before:left-0 mi:before:h-40 mi:before:-z-1 mi:before:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--sfb-mood)_16%,_transparent),_transparent)]" novalidate @submit.prevent="submit">
      <header class="mi:grid mi:gap-1.5">
        <MiText variant="caption" tone="label2" weight="medium">Room B · Thursday 14:30 · Track: Mobile</MiText>
        <MiText id="sfb-title" as="h2" variant="title3" weight="semibold" balance>How was “Offline-first, for real” with Aiko Tanaka?</MiText>
      </header>

      <fieldset class="mi:grid mi:gap-3 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
        <legend class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Overall feeling</legend>
        <div class="mi:grid mi:grid-cols-5 mi:gap-1">
          <label v-for="m in moods" :key="m.value" class="mi:group mi:relative mi:grid mi:justify-items-center mi:gap-1.5 mi:py-2 mi:px-0 mi:rounded-[16px] mi:cursor-pointer mi:has-[input:focus-visible]:[outline:2px_solid_var(--mi-p)] mi:has-[input:focus-visible]:outline-offset-[2px]" :style="{ '--sfb-c': m.color }">
            <input v-model="mood" type="radio" name="sfb-mood" :value="m.value" class="mi:absolute mi:opacity-0 mi:pointer-events-none">
            <svg class="mi:w-[min(52px,_100%)] mi:aspect-[1] mi:fill-[color:none] mi:[stroke-width:2] mi:[stroke-linecap:round] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-3)_var(--mi-ease)]" :class="mood === m.value ? 'mi:transform-[scale(1.18)] mi:stroke-label' : [mood !== null ? 'mi:opacity-45' : '', 'mi:stroke-label2 mi:group-hover:transform-[translateY(-2px)]']" viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="18" class="mi:stroke-[color:none]" :class="mood === m.value ? 'mi:fill-[color:color-mix(in_srgb,_var(--sfb-c)_55%,_var(--mi-card))]' : 'mi:fill-fill3'" />
              <circle class="mi:stroke-[color:none]" :class="mood === m.value ? 'mi:fill-label' : 'mi:fill-label2'" cx="14" cy="16.5" r="1.8" /><circle class="mi:stroke-[color:none]" :class="mood === m.value ? 'mi:fill-label' : 'mi:fill-label2'" cx="26" cy="16.5" r="1.8" />
              <path :d="mouth(m.value)" />
            </svg>
            <span class="mi:text-[12px] mi:text-center" :class="mood === m.value ? 'mi:font-semibold mi:text-label' : 'mi:font-medium mi:text-label2'">{{ m.label }}</span>
          </label>
        </div>
        <MiText v-if="err('mood')" variant="footnote" tone="red" role="alert">{{ err('mood') }}</MiText>
      </fieldset>

      <!-- Follow-up chips adapt to the mood: what went wrong, or what stood out. -->
      <div v-if="mood !== null" class="mi:grid mi:gap-3 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
        <MiText as="h3" variant="subheadline" weight="semibold">{{ mood <= 2 ? 'What got in the way?' : mood === 3 ? 'What would have made it better?' : 'What stood out?' }}</MiText>
        <div class="mi:flex mi:flex-wrap mi:gap-2">
          <MiChip v-for="t in tags" :key="t" :label="t" selectable :model-value="picked.includes(t)" tone="neutral" @update:model-value="toggle(t, $event)" />
        </div>
      </div>

      <div class="mi:grid mi:gap-3 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
        <MiText as="h3" variant="subheadline" weight="semibold">Rate the details</MiText>
        <div class="mi:grid mi:gap-1">
          <div v-for="r in aspects" :key="r.id" class="mi:grid mi:grid-cols-[minmax(80px,_1fr)_auto_32px] mi:items-center mi:gap-3 mi:py-1.5 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep">
            <span :id="'sfb-' + r.id" class="mi:text-[14px]">{{ r.label }}</span>
            <MiRating v-model="ratings[r.id]" half :label="r.label" clearable />
            <span class="mi:text-[13px] mi:font-semibold mi:tabular-nums mi:text-label2 mi:text-end" aria-hidden="true">{{ ratings[r.id] ? ratings[r.id].toFixed(1) : '—' }}</span>
          </div>
        </div>
        <MiText v-if="err('ratings')" variant="footnote" tone="red" role="alert">{{ err('ratings') }}</MiText>
      </div>

      <MiField label="Anything for Aiko?" hint="Optional. Speakers read every comment.">
        <MiTextarea v-model="comment" :rows="2" :maxlength="400" counter placeholder="The conflict-resolution demo was the part I'll reuse on Monday." />
      </MiField>

      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
        <label class="mi:inline-flex mi:items-center mi:gap-2 mi:text-[13px] mi:text-label2 mi:cursor-pointer">
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
