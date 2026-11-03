<script setup lang="ts">
/** Compact field-style file input: a choose button next to the file name, with the same type, size and count validation as MiFileUpload. */
import { computed, ref, useId } from 'vue'
import MiIcon from '../Base/MiIcon.vue'
import { miValidateFiles, miRejectMessage, miFormatBytes, type MiFileRejection } from './MiFileUpload.vue'

const props = withDefaults(defineProps<{
  /** Accepted types, same syntax as the native `accept` attribute (`image/*,.pdf`). */
  accept?: string
  /** Allow several files; the model is then a File array instead of a single File. */
  multiple?: boolean
  /** Largest allowed file size in bytes. */
  maxSize?: number
  /** Largest allowed number of files (multiple mode only). */
  maxFiles?: number
  /** Blocks interaction and dims the field. */
  disabled?: boolean
  /** Accessible name of the field. */
  label?: string
  /** Text of the choose button. */
  buttonLabel?: string
  /** Text shown while no file is chosen. */
  placeholder?: string
  /** Accessible name of the clear button. */
  clearLabel?: string
}>(), {
  label: 'File',
  buttonLabel: 'Choose file',
  placeholder: 'No file chosen',
  clearLabel: 'Clear'
})

/** Chosen file (single mode) or files (`multiple`); null or an empty array when nothing is chosen. */

const model = defineModel<File[] | File | null>({ default: null })
const emit = defineEmits<{
  /** Fires with the files that failed validation; each has a reason of type, size or count. */
  reject: [rejections: MiFileRejection[]]
}>()

const id = useId()
const input = ref<HTMLInputElement | null>(null)
const error = ref('')

const files = computed<File[]>(() => (Array.isArray(model.value) ? model.value : model.value ? [model.value] : []))
const text = computed(() => {
  if (!files.value.length) return props.placeholder
  if (files.value.length === 1) return `${files.value[0]!.name} (${miFormatBytes(files.value[0]!.size)})`
  return `${files.value.length} files: ${files.value.map(f => f.name).join(', ')}`
})
const rules = computed(() => ({ accept: props.accept, multiple: props.multiple, maxSize: props.maxSize, maxFiles: props.maxFiles }))

function onChange(e: Event) {
  const el = e.target as HTMLInputElement
  const { accepted, rejected } = miValidateFiles(Array.from(el.files ?? []), files.value, rules.value)
  error.value = rejected.map(r => miRejectMessage(r, rules.value)).join('. ')
  if (rejected.length) emit('reject', rejected)
  if (accepted.length) model.value = props.multiple ? [...files.value, ...accepted] : accepted[0]!
  el.value = ''
}

function clear() {
  error.value = ''
  model.value = props.multiple ? [] : null
  input.value?.focus()
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div class="mi-fi mi:content-start mi:gap-1.5 mi:font-mi mi:text-label mi:[&.is-disabled]:opacity-45" :class="{ 'is-disabled': disabled, 'is-invalid': error }">
    <div class="mi-fi__box mi:relative mi:flex mi:items-center mi:gap-2.5 mi:min-h-11 mi:pt-1 mi:pr-1.5 mi:pb-1 mi:pl-1 mi:rounded-[10px] mi:bg-field mi:shadow-[inset_0_0_0_1px_var(--mi-field-b)] mi:[.is-invalid_&]:shadow-[inset_0_0_0_1.5px_var(--mi-red)] mi:[&:has(.mi-fi__input:focus-visible)]:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:[&:has(.mi-fi__input:focus-visible)]:outline-offset-[1px]">
      <label class="mi-fi__btn mi:flex-[none] mi:py-[7px] mi:px-3.5 mi:rounded-[7px] mi:bg-fill3 mi:text-[14px] mi:font-semibold mi:cursor-pointer mi:whitespace-nowrap mi:[.is-disabled_&]:cursor-not-allowed" :for="id">{{ buttonLabel }}</label>
      <span class="mi-fi__text mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[14px] mi:[&.is-empty]:text-label2" :class="{ 'is-empty': !files.length }" aria-live="polite">{{ text }}</span>
      <button v-if="files.length && !disabled" type="button" class="mi-fi__clear mi:relative mi:z-1 mi:inline-flex mi:items-center mi:justify-center mi:flex-[none] mi:w-7.5 mi:h-7.5 mi:p-0 mi:[border:0] mi:rounded-[99px] mi:bg-transparent mi:text-label2 mi:cursor-pointer mi:hover:bg-fill3 mi:hover:text-label mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[1px]" :aria-label="clearLabel" @click="clear">
        <MiIcon name="close" :size="14" :weight="2.4" />
      </button>
      <input :id="id" ref="input" class="mi-fi__input mi:absolute mi:w-px mi:h-px mi:opacity-0 mi:overflow-hidden" type="file" :accept="accept" :multiple="multiple" :disabled="disabled" :aria-label="label" :aria-invalid="error ? true : undefined" :aria-describedby="error ? `${id}-err` : undefined" @change="onChange">
    </div>
    <p v-if="error" :id="`${id}-err`" class="mi-fi__error mi:m-0 mi:text-[13px] mi:text-red-t" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.mi-fi { display: grid; }
</style>
