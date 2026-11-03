<script lang="ts">
export type MiFileRejectReason = 'type' | 'size' | 'count'

export interface MiFileRejection {
  file: File
  reason: MiFileRejectReason
}

export interface MiFileRules {
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
}

/** True when a file matches an `accept` string such as `image/*,.pdf,application/zip`. An empty string accepts everything. */
export function miFileMatches(file: File, accept?: string): boolean {
  const tokens = (accept ?? '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
  if (!tokens.length) return true
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return tokens.some((t) => {
    if (t.startsWith('.')) return name.endsWith(t)
    if (t.endsWith('/*')) return type.startsWith(t.slice(0, -1))
    return type === t
  })
}

const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified

/** Splits incoming files into accepted and rejected ones against the rules, given the files already held. */
export function miValidateFiles(incoming: File[], current: File[], rules: MiFileRules) {
  const accepted: File[] = []
  const rejected: MiFileRejection[] = []
  const base = rules.multiple ? current : []
  const room = rules.multiple ? (rules.maxFiles ?? Infinity) - base.length : 1
  for (const file of incoming) {
    if (!miFileMatches(file, rules.accept)) rejected.push({ file, reason: 'type' })
    else if (rules.maxSize != null && file.size > rules.maxSize) rejected.push({ file, reason: 'size' })
    else if (base.some(f => sameFile(f, file)) || accepted.some(f => sameFile(f, file))) continue
    else if (accepted.length >= room) rejected.push({ file, reason: 'count' })
    else accepted.push(file)
  }
  return { accepted, rejected }
}

export function miFormatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let v = n / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v >= 10 ? Math.round(v) : Math.round(v * 10) / 10} ${units[i]}`
}

export function miRejectMessage(r: MiFileRejection, rules: MiFileRules): string {
  if (r.reason === 'type') return `${r.file.name}: file type not allowed`
  if (r.reason === 'size') return `${r.file.name} is larger than ${miFormatBytes(rules.maxSize ?? 0)}`
  return rules.multiple ? `${r.file.name}: too many files (max ${rules.maxFiles})` : `${r.file.name}: only one file allowed`
}
</script>

<script setup lang="ts">
/** Drag-and-drop file zone with a file list, per-file removal and progress, type, size and count validation, and keyboard access. */
import { computed, ref, useId } from 'vue'
import MiIcon from '../Base/MiIcon.vue'

const props = withDefaults(defineProps<{
  /** Accepted types, same syntax as the native `accept` attribute (`image/*,.pdf`). */
  accept?: string
  /** Allow several files. When false a new file replaces the current one. */
  multiple?: boolean
  /** Largest allowed file size in bytes. */
  maxSize?: number
  /** Largest allowed number of files (multiple mode only). */
  maxFiles?: number
  /** Blocks interaction and dims the zone. */
  disabled?: boolean
  /** Title of the zone, also its accessible name. */
  label?: string
  /** Secondary line under the label, such as accepted formats. */
  hint?: string
  /** Upload progress per file name, from 0 to 1. Files without an entry show no bar. */
  progress?: Record<string, number>
  /** Accessible name prefix of the per-file remove button. */
  removeLabel?: string
}>(), {
  label: 'Drop files here or browse',
  removeLabel: 'Remove'
})

/** Files currently held. */

const model = defineModel<File[]>({ default: () => [] })
const emit = defineEmits<{
  /** Fires with the files that failed validation; each has a reason of type, size or count. */
  reject: [rejections: MiFileRejection[]]
}>()

const id = useId()
const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const errors = ref<string[]>([])
let depth = 0

const rules = computed<MiFileRules>(() => ({ accept: props.accept, multiple: props.multiple, maxSize: props.maxSize, maxFiles: props.maxFiles }))
const full = computed(() => props.multiple && props.maxFiles != null && model.value.length >= props.maxFiles)

function add(list: ArrayLike<File> | null | undefined) {
  if (props.disabled || !list?.length) return
  const { accepted, rejected } = miValidateFiles(Array.from(list), model.value, rules.value)
  errors.value = rejected.map(r => miRejectMessage(r, rules.value))
  if (rejected.length) emit('reject', rejected)
  if (accepted.length) model.value = props.multiple ? [...model.value, ...accepted] : [accepted[0]!]
}

function open() {
  if (!props.disabled) input.value?.click()
}

function onChange(e: Event) {
  const el = e.target as HTMLInputElement
  add(el.files)
  el.value = ''
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() }
}

function onEnter(e: DragEvent) {
  if (props.disabled) return
  e.preventDefault()
  depth++
  dragging.value = true
}
function onOver(e: DragEvent) {
  if (props.disabled) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}
function onLeave() {
  depth = Math.max(0, depth - 1)
  if (!depth) dragging.value = false
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  depth = 0
  dragging.value = false
  add(e.dataTransfer?.files)
}

function remove(i: number) {
  errors.value = []
  model.value = model.value.filter((_, k) => k !== i)
}

const pct = (f: File) => {
  const v = props.progress?.[f.name]
  return v == null ? null : Math.round(Math.min(1, Math.max(0, v)) * 100)
}
</script>

<template>
  <div class="mi-fu mi:content-start mi:font-mi mi:[&.is-disabled]:opacity-45" :class="{ 'is-disabled': disabled }">
    <div
      class="mi-fu__zone mi:relative mi:isolate mi:grid mi:justify-items-center mi:gap-1 mi:py-6.5 mi:px-5 mi:[border:1.5px_dashed_var(--mi-field-b)] mi:rounded-[16px] mi:bg-field mi:text-center mi:cursor-pointer mi:touch-manipulation mi:[.is-disabled_&]:cursor-not-allowed mi:[&.is-drag]:border-p mi:[&.is-drag]:[border-style:solid] mi:[&.is-invalid]:border-red mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[2px]"
      :class="{ 'is-drag': dragging, 'is-invalid': errors.length }"
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-label="label"
      :aria-disabled="disabled || undefined"
      :aria-describedby="`${id}-hint${errors.length ? ` ${id}-err` : ''}`"
      @click="open"
      @keydown="onKey"
      @dragenter="onEnter"
      @dragover="onOver"
      @dragleave="onLeave"
      @drop="onDrop"
    >
      <span class="mi-fu__glow mi:absolute mi:inset-0 mi:-z-1 mi:rounded-[inherit] mi:bg-p-tint mi:opacity-0 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" aria-hidden="true" />
      <span class="mi-fu__icon mi:inline-flex mi:items-center mi:justify-center mi:w-11 mi:h-11 mi:mb-1.5 mi:rounded-[14px] mi:bg-fill3 mi:text-[color:var(--mi-p-text,_var(--mi-p))] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[.mi-fu__zone.is-drag_&]:transform-[translate3d(0,_-4px,_0)_scale(1.08)]" aria-hidden="true"><MiIcon name="arrow-up" :size="22" :weight="2" /></span>
      <span class="mi-fu__label mi:text-[15px] mi:font-semibold">{{ label }}</span>
      <span :id="`${id}-hint`" class="mi-fu__hint mi:text-[13px] mi:text-label2">{{ hint }}<template v-if="full"> · Maximum of {{ maxFiles }} files reached</template></span>
      <input ref="input" class="mi-fu__input mi:absolute mi:w-px mi:h-px mi:opacity-0 mi:pointer-events-none" type="file" tabindex="-1" aria-hidden="true" :accept="accept" :multiple="multiple" :disabled="disabled" @change="onChange" @click.stop>
    </div>

    <ul v-if="errors.length" :id="`${id}-err`" class="mi-fu__errors mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[13px] mi:text-red-t" role="alert">
      <li v-for="(m, i) in errors" :key="i">{{ m }}</li>
    </ul>

    <ul v-if="model.length" class="mi-fu__list mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]" :aria-label="`${label} files`">
      <li v-for="(f, i) in model" :key="`${f.name}-${f.size}-${f.lastModified}`" class="mi-fu__file mi:flex mi:items-center mi:gap-3 mi:pt-2.5 mi:pr-2.5 mi:pb-2.5 mi:pl-3 mi:rounded-[12px] mi:bg-card mi:shadow-1">
        <span class="mi-fu__ficon mi:inline-flex mi:items-center mi:justify-center mi:flex-[none] mi:w-8.5 mi:h-8.5 mi:rounded-[10px] mi:bg-p-tint mi:text-[color:var(--mi-p-text,_var(--mi-p))]" aria-hidden="true"><MiIcon name="document" :size="18" /></span>
        <span class="mi-fu__meta mi:grid mi:gap-0.5 mi:flex-1 mi:min-w-0">
          <span class="mi-fu__name mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[14px] mi:font-medium">{{ f.name }}</span>
          <span class="mi-fu__size mi:text-[12px] mi:text-label2 mi:tabular-nums">{{ miFormatBytes(f.size) }}<template v-if="pct(f) !== null"> · {{ pct(f) }} %</template></span>
          <span v-if="pct(f) !== null" class="mi-fu__track mi:block mi:h-1 mi:mt-1 mi:rounded-[99px] mi:bg-fill3 mi:overflow-hidden" role="progressbar" :aria-label="`Upload progress of ${f.name}`" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="pct(f)!">
            <span class="mi-fu__fill mi:block mi:w-full mi:h-full mi:rounded-[inherit] mi:bg-p mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)]" :style="{ transform: `translate3d(${pct(f)! - 100}%,0,0)` }" />
          </span>
        </span>
        <button type="button" class="mi-fu__rm mi:inline-flex mi:items-center mi:justify-center mi:flex-[none] mi:w-8 mi:h-8 mi:p-0 mi:[border:0] mi:rounded-[99px] mi:bg-transparent mi:text-label2 mi:cursor-pointer mi:[-webkit-tap-highlight-color:transparent] mi:[&:hover:not(:disabled)]:bg-fill3 mi:[&:hover:not(:disabled)]:text-label mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[1px]" :aria-label="`${removeLabel} ${f.name}`" :disabled="disabled" @click="remove(i)">
          <MiIcon name="close" :size="14" :weight="2.4" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.mi-fu { display: grid; gap: 10px; color: var(--mi-label); }
.mi-fu__zone:hover .mi-fu__glow { opacity: .5; }
.mi-fu__zone.is-drag .mi-fu__glow { opacity: 1; }
</style>
