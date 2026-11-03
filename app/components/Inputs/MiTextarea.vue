<script setup lang="ts">
/** Multi-line text field that can auto-grow up to maxRows, with an optional character counter; v-model is a string. */
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch } from 'vue'
import MiFieldBox from './MiFieldBox.vue'
import { MI_FIELD } from '../../utils/miInputs'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Field padding and type size: `sm` is compact, `md` the standard size. */
  size?: 'sm' | 'md'
  /** Minimum number of visible rows. */
  rows?: number
  /** Grow with the content up to `maxRows`. */
  autoGrow?: boolean
  /** Row cap for autoGrow; the field scrolls beyond it. */
  maxRows?: number
  /** Maximum number of characters; typing stops there and the counter uses it as its limit. */
  maxlength?: number
  /** Show a `n / max` counter under the field. */
  counter?: boolean
  /** Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. */
  invalid?: boolean
  /** Draws the success border and focus ring. */
  success?: boolean
  /** Overrides the surrounding MiField or MiFormRow disabled state when set. */
  disabled?: boolean
}>(), { size: 'md', rows: 3, autoGrow: true, maxRows: 10, invalid: undefined, success: undefined, disabled: undefined })

/** Text value of the field. */

const model = defineModel<string>({ default: '' })
const attrs = useAttrs()
const field = inject(MI_FIELD, null)
const auto = useId()
const el = ref<HTMLTextAreaElement | null>(null)
let raf = 0

const id = computed(() => (attrs.id as string | undefined) ?? field?.id ?? `mi-t-${auto}`)
const isInvalid = computed(() => props.invalid ?? field?.invalid.value ?? false)
const isSuccess = computed(() => props.success ?? field?.success.value ?? false)
const isDisabled = computed(() => props.disabled ?? field?.disabled.value ?? false)
const describedBy = computed(() => [attrs['aria-describedby'], field?.describedBy.value].filter(Boolean).join(' ') || undefined)
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const textAttrs = computed(() => { const { class: _c, style: _s, id: _i, 'aria-describedby': _d, ...rest } = attrs; return rest })
const length = computed(() => String(model.value ?? '').length)
const lineH = computed(() => (props.size === 'sm' ? 20 : 22))
const pad = computed(() => (props.size === 'sm' ? 8 : 12))

/** Measures once per content change (not per frame), batched in rAF. */
function fit() {
  if (!props.autoGrow) return
  if (raf) cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    raf = 0
    const t = el.value
    if (!t) return
    t.style.height = 'auto'
    const max = props.maxRows * lineH.value + pad.value * 2
    t.style.height = `${Math.min(t.scrollHeight, max)}px`
    t.style.overflowY = t.scrollHeight > max ? 'auto' : 'hidden'
  })
}

watch(model, () => { void nextTick(fit) })
onMounted(fit)
onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf) })
defineExpose({ focus: () => el.value?.focus(), textarea: el })
</script>

<template>
  <div class="mi-ta mi:flex-col" v-bind="rootAttrs">
    <MiFieldBox :size="size" :invalid="isInvalid" :success="isSuccess" :disabled="isDisabled">
      <textarea
        v-bind="textAttrs"
        :id="id"
        ref="el"
        class="mi-ta__field mi:resize-none mi:[outline:none] mi:[&.is-fixed]:resize-y"
        :class="{ 'is-sm': size === 'sm', 'is-fixed': !autoGrow }"
        :rows="rows"
        :maxlength="maxlength"
        :value="model"
        :disabled="isDisabled"
        :required="field?.required.value || undefined"
        :aria-invalid="isInvalid || undefined"
        :aria-describedby="describedBy"
        @input="model = ($event.target as HTMLTextAreaElement).value; fit()"
      />
    </MiFieldBox>
    <span v-if="counter && maxlength" class="mi-ta__count mi:[align-self:flex-end] mi:font-mi mi:text-[13px] mi:tabular-nums mi:text-label2 mi:[&.is-full]:text-orange-t" :class="{ 'is-full': length >= maxlength }">{{ length }} / {{ maxlength }}</span>
  </div>
</template>

<style scoped>
.mi-ta { display: flex; gap: 6px; min-width: 0; }
.mi-ta__field {
  display: block; width: 100%; margin: 0; padding: 12px 14px; border: 0; border-radius: inherit; background: transparent; color: inherit;
  font: inherit; letter-spacing: inherit; line-height: 22px; overflow-y: hidden;
}
.mi-ta__field.is-sm { padding: 8px 12px; line-height: 20px; }
.mi-ta__field.is-fixed { overflow-y: auto; }
.mi-ta__field::placeholder { color: var(--mi-label2); opacity: 1; }
.mi-ta__field:disabled { cursor: not-allowed; }
</style>
