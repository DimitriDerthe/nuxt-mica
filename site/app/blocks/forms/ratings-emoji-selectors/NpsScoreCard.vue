<template>
  <section class="mi:@container/nps mi:font-mi mi:text-label" aria-labelledby="nps-title">
    <form v-if="!sent" class="mi:gap-4.5 mi:relative mi:grid mi:max-w-155 mi:mx-auto mi:p-5.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:overflow-hidden mi:isolate mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:-z-1 mi:before:[background:linear-gradient(180deg,_var(--nps-tone),_transparent_55%)] mi:before:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" :class="group ? TONE[group] : 'mi:before:opacity-0'" novalidate @submit.prevent="sent = true">
      <header class="mi:grid mi:gap-1.5">
        <MiText variant="caption" tone="label2" weight="medium">Quick question · 2 of 2</MiText>
        <MiText id="nps-title" as="h2" variant="title3" weight="semibold" balance>How likely are you to recommend Tidepool to a colleague?</MiText>
      </header>

      <!-- 0 to 10 as real radios; the band under the scale names the three NPS groups. -->
      <fieldset class="mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
        <legend class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Score from 0, not likely, to 10, extremely likely</legend>
        <div class="mi:grid mi:grid-cols-6 mi:gap-1.5 mi:@[520px]/nps:grid-cols-11">
          <label v-for="n in 11" :key="n" class="mi:relative mi:grid mi:place-items-center mi:h-10.5 mi:group mi:rounded-md mi:font-semibold mi:tabular-nums mi:cursor-pointer mi:after:content-[''] mi:after:absolute mi:after:[inset:auto_6px_4px] mi:after:h-[3px] mi:after:rounded-[2px] mi:after:opacity-70 mi:has-[input:focus-visible]:[outline:2px_solid_var(--mi-p)] mi:has-[input:focus-visible]:outline-offset-[2px]" :class="[BAND[groupOf(n - 1)], score === n - 1 ? 'mi:text-p-on mi:bg-p mi:after:bg-p-on' : 'mi:bg-fill4 mi:after:bg-(--nps-band)']">
            <input v-model="score" class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" type="radio" name="nps-score" :value="n - 1">
            <span class="mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:group-hover:transform-[scale(1.12)] mi:motion-reduce:[transition:none]">{{ n - 1 }}</span>
          </label>
        </div>
        <div class="mi:flex mi:justify-between mi:mt-2 mi:text-[12px] mi:text-label3" aria-hidden="true"><span>Not likely</span><span>Extremely likely</span></div>
      </fieldset>

      <div v-if="group" class="mi:grid mi:gap-2.5 mi:[--mi-in-y:-4px] mi:animate-[in_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:animate-none">
        <MiText as="h3" variant="headline" weight="semibold">{{ copy[group].question }}</MiText>
        <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" :aria-label="copy[group].question">
          <MiChip
            v-for="r in copy[group].reasons" :key="r" :label="r" size="small" selectable tone="neutral"
            :model-value="reasons.includes(r)" @update:model-value="toggle(r)"
          />
        </div>
        <MiTextarea v-model="note" :rows="2" :max-rows="5" :maxlength="400" aria-label="Anything else" placeholder="Anything else? (optional)" />
        <MiCheckbox v-if="group === 'detractor'" v-model="callback" label="A product manager can email me about this" />
      </div>

      <footer class="mi:flex mi:justify-flex-end mi:gap-2">
        <MiButton variant="plain" size="small" @click="sent = true">Not now</MiButton>
        <MiButton type="submit" :disabled="score === null">Send feedback</MiButton>
      </footer>
    </form>

    <div v-else class="mi:gap-2 mi:justify-items-center mi:text-center mi:relative mi:grid mi:max-w-155 mi:mx-auto mi:p-5.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:overflow-hidden mi:isolate mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:-z-1 mi:before:opacity-0 mi:before:[background:linear-gradient(180deg,_var(--nps-tone),_transparent_55%)] mi:before:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" role="status">
      <MiIcon name="check-circle-fill" :size="30" class="mi:text-green" />
      <MiText as="h2" variant="title3" weight="semibold">{{ score === null ? 'No problem.' : copy[group ?? 'passive'].thanks }}</MiText>
      <MiText variant="footnote" tone="label2">We ask at most once a quarter.</MiText>
      <MiButton variant="plain" size="small" @click="reset">Change my answer</MiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Group = 'detractor' | 'passive' | 'promoter'
const TONE: Record<Group, string> = {
  detractor: 'mi:[--nps-tone:color-mix(in_srgb,_var(--mi-red)_10%,_transparent)] mi:before:opacity-100',
  passive: 'mi:[--nps-tone:color-mix(in_srgb,_var(--mi-orange)_10%,_transparent)] mi:before:opacity-100',
  promoter: 'mi:[--nps-tone:color-mix(in_srgb,_var(--mi-green)_12%,_transparent)] mi:before:opacity-100'
}
const BAND: Record<Group, string> = {
  detractor: 'mi:[--nps-band:var(--mi-red)]',
  passive: 'mi:[--nps-band:var(--mi-orange)]',
  promoter: 'mi:[--nps-band:var(--mi-green)]'
}
interface Copy { question: string, reasons: string[], thanks: string }

const copy: Record<Group, Copy> = {
  detractor: { question: 'What let you down most?', reasons: ['Sync is unreliable', 'Too expensive', 'Missing integrations', 'Slow support'], thanks: 'Thank you for being honest. We read every reply.' },
  passive: { question: 'What would make it a 10?', reasons: ['Faster search', 'Better mobile app', 'Offline mode', 'Clearer pricing'], thanks: 'Thanks. Your ideas go straight to the roadmap review.' },
  promoter: { question: 'What do you love about it?', reasons: ['Saves me hours', 'Clean design', 'Great integrations', 'Helpful support'], thanks: 'Thank you! That made the team’s day.' }
}

const score = ref<number | null>(null)
const reasons = ref<string[]>([])
const note = ref('')
const callback = ref(false)
const sent = ref(false)

const groupOf = (n: number): Group => n <= 6 ? 'detractor' : n <= 8 ? 'passive' : 'promoter'
const group = computed<Group | null>(() => score.value === null ? null : groupOf(score.value))

function toggle(r: string) {
  reasons.value = reasons.value.includes(r) ? reasons.value.filter(x => x !== r) : [...reasons.value, r]
}
function reset() { sent.value = false; reasons.value = [] }
</script>
