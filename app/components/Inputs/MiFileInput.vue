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
  <div class="mi-fi" :class="{ 'is-disabled': disabled, 'is-invalid': error }">
    <div class="mi-fi__box">
      <label class="mi-fi__btn" :for="id">{{ buttonLabel }}</label>
      <span class="mi-fi__text" :class="{ 'is-empty': !files.length }" aria-live="polite">{{ text }}</span>
      <button v-if="files.length && !disabled" type="button" class="mi-fi__clear" :aria-label="clearLabel" @click="clear">
        <MiIcon name="close" :size="14" :weight="2.4" />
      </button>
      <input :id="id" ref="input" class="mi-fi__input" type="file" :accept="accept" :multiple="multiple" :disabled="disabled" :aria-label="label" :aria-invalid="error ? true : undefined" :aria-describedby="error ? `${id}-err` : undefined" @change="onChange">
    </div>
    <p v-if="error" :id="`${id}-err`" class="mi-fi__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.mi-fi { display: grid; gap: 6px; font-family: var(--mi-font); color: var(--mi-label); }
.mi-fi.is-disabled { opacity: .45; }
.mi-fi__box {
  position: relative; display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 4px 6px 4px 4px;
  border-radius: 10px; background: var(--mi-field); box-shadow: inset 0 0 0 1px var(--mi-field-b);
}
.is-invalid .mi-fi__box { box-shadow: inset 0 0 0 1.5px var(--mi-red); }
.mi-fi__box:has(.mi-fi__input:focus-visible) { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 1px; }
.mi-fi__btn {
  flex: none; padding: 7px 14px; border-radius: 7px; background: var(--mi-fill3);
  font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap;
}
.is-disabled .mi-fi__btn { cursor: not-allowed; }
.mi-fi__text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
.mi-fi__text.is-empty { color: var(--mi-label2); }
.mi-fi__clear {
  position: relative; z-index: 1; display: inline-flex; align-items: center; justify-content: center; flex: none;
  width: 30px; height: 30px; padding: 0; border: 0; border-radius: 99px; background: transparent; color: var(--mi-label2); cursor: pointer;
}
.mi-fi__clear:hover { background: var(--mi-fill3); color: var(--mi-label); }
.mi-fi__clear:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 1px; }
/* The native input stays focusable and clickable behind the visible label; only the label is the real target. */
.mi-fi__input { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; }
.mi-fi__error { margin: 0; font-size: 13px; color: var(--mi-red-t); }
</style>
