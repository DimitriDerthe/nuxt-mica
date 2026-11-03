<script setup lang="ts">
/** Password strength meter for a given string: four-segment bar, a Weak to Strong label and an optional requirements checklist; pairs with MiInput. */
import { computed, watch } from 'vue'
import MiIcon from '../Base/MiIcon.vue'
import { miPasswordScore, type MiPasswordRequirement } from '../../utils/miPassword'

const props = withDefaults(defineProps<{
  /** The password to evaluate. */
  value?: string
  /** Requirements to list below the bar: any of `length`, `upper`, `lower`, `number`, `symbol`. Empty hides the checklist. */
  requirements?: MiPasswordRequirement[]
  /** Minimum length used by the `length` requirement and the scoring. */
  minLength?: number
  /** Labels for scores 1 to 4 (Weak, Fair, Good, Strong). */
  labels?: [string, string, string, string]
  /** Text shown while the value is empty. */
  emptyLabel?: string
  /** Accessible name of the meter. */
  label?: string
  /** Display names of the requirements, keyed by requirement. */
  requirementLabels?: Partial<Record<MiPasswordRequirement, string>>
}>(), {
  value: '',
  requirements: () => [],
  minLength: 8,
  labels: () => ['Weak', 'Fair', 'Good', 'Strong'],
  emptyLabel: 'Enter a password',
  label: 'Password strength'
})

const emit = defineEmits<{
  /** Fires whenever the score (0 to 4) changes. */
  score: [score: 0 | 1 | 2 | 3 | 4]
}>()

const result = computed(() => miPasswordScore(props.value, { minLength: props.minLength }))
const score = computed(() => result.value.score)
const text = computed(() => (score.value === 0 ? props.emptyLabel : props.labels[score.value - 1]))

const defaults = computed<Record<MiPasswordRequirement, string>>(() => ({
  length: `At least ${props.minLength} characters`,
  upper: 'An uppercase letter',
  lower: 'A lowercase letter',
  number: 'A number',
  symbol: 'A symbol',
  ...props.requirementLabels
}))
const items = computed(() => props.requirements.map(k => ({ key: k, text: defaults.value[k], met: result.value.checks[k] })))

watch(score, s => emit('score', s), { immediate: true })
</script>

<template>
  <div class="mi-pws mi:grid mi:content-start mi:gap-2 mi:font-mi mi:text-label mi:[--mi-pws-c:var(--mi-label3)] mi:[&[data-score='1']]:[--mi-pws-c:var(--mi-red)] mi:[&[data-score='2']]:[--mi-pws-c:var(--mi-orange)] mi:[&[data-score='3']]:[--mi-pws-c:var(--mi-yellow)] mi:[&[data-score='4']]:[--mi-pws-c:var(--mi-green)]" :data-score="score">
    <div class="mi-pws__bar mi:grid mi:grid-cols-[repeat(4,_1fr)] mi:gap-1" role="img" :aria-label="`${label}: ${text}`">
      <span v-for="i in 4" :key="i" class="mi-pws__seg mi:relative mi:h-1.5 mi:rounded-[99px] mi:[background:var(--mi-fill3)] mi:overflow-hidden mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:[background:var(--mi-pws-c)] mi:after:transform-[scale3d(0,_1,_1)] mi:after:origin-[left_center] mi:after:[transition:transform_var(--mi-dur-3)_var(--mi-ease)] mi:[&.is-on]:after:transform-[scale3d(1,_1,_1)]" :class="{ 'is-on': i <= score }" />
    </div>
    <p class="mi-pws__status mi:flex mi:justify-between mi:gap-3 mi:m-0 mi:text-[13px]" role="status" aria-live="polite">
      <span class="mi-pws__label mi:text-label2">{{ label }}</span>
      <strong class="mi-pws__value mi:font-semibold">{{ text }}</strong>
    </p>
    <ul v-if="items.length" class="mi-pws__list mi:grid mi:gap-1.5 mi:mt-0.5 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none] mi:text-[13px] mi:text-label2" :aria-label="`${label} requirements`">
      <li v-for="it in items" :key="it.key" class="mi-pws__item mi:flex mi:items-center mi:gap-2 mi:[&.is-met]:text-label" :class="{ 'is-met': it.met }">
        <span class="mi-pws__mark mi:inline-flex mi:items-center mi:justify-center mi:flex-[none] mi:w-4 mi:h-4 mi:rounded-[99px] mi:shadow-[inset_0_0_0_1.5px_var(--mi-label3)] mi:text-p-on mi:[.is-met_&]:[background:var(--mi-green)] mi:[.is-met_&]:shadow-none" aria-hidden="true"><MiIcon v-if="it.met" name="check" :size="12" :weight="2.8" /></span>
        <span>{{ it.text }}</span>
        <span class="mi-pws__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ it.met ? '(met)' : '(not met)' }}</span>
      </li>
    </ul>
  </div>
</template>
