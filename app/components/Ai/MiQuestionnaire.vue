<script setup lang="ts">
/** Multi-step questionnaire form with single, multiple, freeform and skippable questions; compose MiQuestionnaire* parts or pass a `questions` shortcut. v-model holds answers by question name. */
import { computed, provide, reactive, ref } from 'vue'
import { MI_QN_KEY, type MiAnswer } from '../../utils/miAi'
import MiQuestionnaireProgress from './MiQuestionnaireProgress.vue'
import MiQuestionnaireItem from './MiQuestionnaireItem.vue'
import MiQuestionnaireTitle from './MiQuestionnaireTitle.vue'
import MiQuestionnaireDescription from './MiQuestionnaireDescription.vue'
import MiQuestionnaireChoices from './MiQuestionnaireChoices.vue'
import MiQuestionnaireChoice from './MiQuestionnaireChoice.vue'
import MiQuestionnaireInput from './MiQuestionnaireInput.vue'
import MiQuestionnaireError from './MiQuestionnaireError.vue'
import MiQuestionnaireActions from './MiQuestionnaireActions.vue'
import MiQuestionnairePrevious from './MiQuestionnairePrevious.vue'
import MiQuestionnaireSkip from './MiQuestionnaireSkip.vue'
import MiQuestionnaireNext from './MiQuestionnaireNext.vue'
import MiQuestionnaireSubmit from './MiQuestionnaireSubmit.vue'

export interface MiQuestion {
  name: string
  title: string
  description?: string
  choices?: { value: string, label: string, description?: string }[]
  /** Allow several choices. */
  multiple?: boolean
  required?: boolean
  /** Adds a free-text input; its label is the aria-label. */
  input?: { label: string, placeholder?: string }
}

const props = withDefaults(defineProps<{
  /** Shortcut questions, rendered when no default slot is given. */
  questions?: MiQuestion[]
  /** Name of the question to show first; defaults to the first. */
  defaultItem?: string
  /** `letters` lets A, B, C... pick the matching choice. */
  shortcuts?: 'letters' | 'none'
}>(), { shortcuts: 'letters' })

const emit = defineEmits<{
  /** Fired with all answers when the last step is submitted. */
  submit: [answers: Record<string, MiAnswer>]
}>()

/** Answers keyed by question id; each value is the choice id(s) or free text entered. */

const model = defineModel<Record<string, MiAnswer>>({ default: () => ({}) })
const reg = ref<{ name: string, required: boolean }[]>([])
const current = ref(props.defaultItem ?? '')
const errors = ref<Record<string, string>>({})
const other = reactive<Record<string, string>>({})

const active = computed(() => current.value || reg.value[0]?.name || '')
const index = computed(() => Math.max(0, reg.value.findIndex(r => r.name === active.value)))
const count = computed(() => reg.value.length)
const isLast = computed(() => index.value >= count.value - 1)
const required = (n: string) => !!reg.value.find(r => r.name === n)?.required
const filled = (n: string) => {
  const v = model.value[n]
  return Array.isArray(v) ? v.length > 0 : !!v && v.trim() !== ''
}
function go(d: number) {
  const t = reg.value[index.value + d]
  if (t) current.value = t.name
}
function finish() { emit('submit', model.value) }
function next() {
  const n = active.value
  if (required(n) && !filled(n)) { errors.value = { ...errors.value, [n]: 'This question is required.' }; return }
  errors.value = { ...errors.value, [n]: '' }
  if (isLast.value) finish()
  else go(1)
}
function skip() {
  if (required(active.value)) return
  if (isLast.value) finish()
  else go(1)
}

provide(MI_QN_KEY, {
  active, index, count, answers: model, errors, other, required,
  register(name, req) {
    reg.value.push({ name, required: req })
    return () => { reg.value = reg.value.filter(r => r.name !== name) }
  },
  set(name, v) { model.value = { ...model.value, [name]: v }; errors.value = { ...errors.value, [name]: '' } },
  prev: () => go(-1),
  next,
  skip
})

function onKeydown(e: KeyboardEvent) {
  if (props.shortcuts !== 'letters' || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return
  const t = e.target as HTMLElement
  if (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && (t as HTMLInputElement).type === 'text')) return
  const i = e.key.toLowerCase().charCodeAt(0) - 97
  if (i < 0 || i > 25) return
  const el = (e.currentTarget as HTMLElement).querySelectorAll<HTMLInputElement>('fieldset:not([hidden]) input[data-mi-choice]')[i]
  if (el) { e.preventDefault(); el.click() }
}

defineSlots<{
  /** Custom questionnaire layout built from MiQuestionnaire* parts; replaces the layout generated from `questions`. */
  default?(): unknown
}>()
</script>

<template>
  <form class="mi-qn mi:flex mi:flex-col mi:gap-4 mi:p-4 mi:rounded-[16px] mi:bg-card mi:shadow-2 mi:font-mi mi:text-label mi:max-w-120" @submit.prevent="next" @keydown="onKeydown">
    <slot>
      <MiQuestionnaireProgress />
      <MiQuestionnaireItem v-for="q in questions" :key="q.name" :name="q.name" :multiple="q.multiple" :required="q.required">
        <MiQuestionnaireTitle>{{ q.title }}</MiQuestionnaireTitle>
        <MiQuestionnaireDescription v-if="q.description">{{ q.description }}</MiQuestionnaireDescription>
        <MiQuestionnaireChoices>
          <MiQuestionnaireChoice v-for="c in q.choices" :key="c.value" :value="c.value">
            <span class="mi-qn__lbl">{{ c.label }}</span>
            <span v-if="c.description" class="mi-qn__sub">{{ c.description }}</span>
          </MiQuestionnaireChoice>
          <MiQuestionnaireInput v-if="q.input" :aria-label="q.input.label" :placeholder="q.input.placeholder" />
        </MiQuestionnaireChoices>
        <MiQuestionnaireError />
      </MiQuestionnaireItem>
      <MiQuestionnaireActions>
        <MiQuestionnairePrevious />
        <MiQuestionnaireSkip />
        <MiQuestionnaireNext />
        <MiQuestionnaireSubmit />
      </MiQuestionnaireActions>
    </slot>
  </form>
</template>

<style scoped>
.mi-qn :deep(.mi-qn__prog) { display: flex; flex-direction: column; gap: 6px; font-size: 12px; opacity: .8; }
.mi-qn :deep(.mi-qn__bar) { height: 4px; border-radius: 2px; overflow: hidden; background: var(--mi-p-tint2); }
.mi-qn :deep(.mi-qn__fill) { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-ease); }
.mi-qn :deep(.mi-qn__set) { border: 0; margin: 0; padding: 0; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.mi-qn :deep(.mi-qn__set[hidden]) { display: none; }
.mi-qn :deep(.mi-qn__q) { padding: 0; font-size: 16px; font-weight: 600; }
.mi-qn :deep(.mi-qn__d) { margin: 0; font-size: 13px; opacity: .65; }
.mi-qn :deep(.mi-qn__opts) { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.mi-qn :deep(.mi-qn__opt) { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 10px; background: var(--mi-p-tint); cursor: pointer; }
.mi-qn :deep(.mi-qn__opt input) { accent-color: var(--mi-p); width: 16px; height: 16px; margin-top: 2px; }
.mi-qn :deep(.mi-qn__opt:focus-within) { outline: 2px solid var(--mi-p); }
.mi-qn :deep(.mi-qn__body) { display: flex; flex-direction: column; gap: 2px; }
.mi-qn :deep(.mi-qn__lbl) { font-weight: 500; }
.mi-qn :deep(.mi-qn__sub) { font-size: 12px; opacity: .65; }
.mi-qn :deep(.mi-qn__text) { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 0; border-radius: 10px; background: var(--mi-p-tint); color: inherit; font: inherit; }
.mi-qn :deep(.mi-qn__text:focus-visible) { outline: 2px solid var(--mi-p); }
.mi-qn :deep(.mi-qn__err) { margin: 0; font-size: 12px; color: var(--mi-s-text); }
.mi-qn :deep(.mi-qn__nav) { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.mi-qn :deep(.mi-qn__btn) { padding: 8px 14px; border: 0; border-radius: 10px; background: var(--mi-p-tint); color: var(--mi-p-text); font: inherit; font-weight: 600; cursor: pointer; }
.mi-qn :deep(.mi-qn__btn.is-primary) { background: var(--mi-p); color: var(--mi-p-on); }
.mi-qn :deep(.mi-qn__btn:disabled) { opacity: .4; cursor: not-allowed; }
.mi-qn :deep(.mi-qn__btn:focus-visible) { outline: 2px solid var(--mi-p); outline-offset: 2px; }
</style>
