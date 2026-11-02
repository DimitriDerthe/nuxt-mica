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
  <div class="mi-pws" :data-score="score">
    <div class="mi-pws__bar" role="img" :aria-label="`${label}: ${text}`">
      <span v-for="i in 4" :key="i" class="mi-pws__seg" :class="{ 'is-on': i <= score }" />
    </div>
    <p class="mi-pws__status" role="status" aria-live="polite">
      <span class="mi-pws__label">{{ label }}</span>
      <strong class="mi-pws__value">{{ text }}</strong>
    </p>
    <ul v-if="items.length" class="mi-pws__list" :aria-label="`${label} requirements`">
      <li v-for="it in items" :key="it.key" class="mi-pws__item" :class="{ 'is-met': it.met }">
        <span class="mi-pws__mark" aria-hidden="true"><MiIcon v-if="it.met" name="check" :size="12" :weight="2.8" /></span>
        <span>{{ it.text }}</span>
        <span class="mi-pws__sr">{{ it.met ? '(met)' : '(not met)' }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.mi-pws { display: grid; gap: 8px; font-family: var(--mi-font); color: var(--mi-label); --mi-pws-c: var(--mi-label3); }
.mi-pws[data-score='1'] { --mi-pws-c: var(--mi-red); }
.mi-pws[data-score='2'] { --mi-pws-c: var(--mi-orange); }
.mi-pws[data-score='3'] { --mi-pws-c: var(--mi-yellow); }
.mi-pws[data-score='4'] { --mi-pws-c: var(--mi-green); }

.mi-pws__bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.mi-pws__seg { position: relative; height: 6px; border-radius: 99px; background: var(--mi-fill3); overflow: hidden; }
.mi-pws__seg::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--mi-pws-c);
  transform: scale3d(0, 1, 1);
  transform-origin: left center;
  transition: transform var(--mi-dur-3) var(--mi-ease);
}
.mi-pws__seg.is-on::after { transform: scale3d(1, 1, 1); }

.mi-pws__status { display: flex; justify-content: space-between; gap: 12px; margin: 0; font-size: 13px; }
.mi-pws__label { color: var(--mi-label2); }
.mi-pws__value { font-weight: 600; }

.mi-pws__list { display: grid; gap: 6px; margin: 2px 0 0; padding: 0; list-style: none; font-size: 13px; color: var(--mi-label2); }
.mi-pws__item { display: flex; align-items: center; gap: 8px; }
.mi-pws__item.is-met { color: var(--mi-label); }
.mi-pws__mark {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  width: 16px; height: 16px; border-radius: 99px;
  box-shadow: inset 0 0 0 1.5px var(--mi-label3);
  color: var(--mi-p-on);
}
.is-met .mi-pws__mark { background: var(--mi-green); box-shadow: none; }
.mi-pws__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
