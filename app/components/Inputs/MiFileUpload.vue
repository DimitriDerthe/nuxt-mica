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
  <div class="mi-fu" :class="{ 'is-disabled': disabled }">
    <div
      class="mi-fu__zone"
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
      <span class="mi-fu__glow" aria-hidden="true" />
      <span class="mi-fu__icon" aria-hidden="true"><MiIcon name="arrow-up" :size="22" :weight="2" /></span>
      <span class="mi-fu__label">{{ label }}</span>
      <span :id="`${id}-hint`" class="mi-fu__hint">{{ hint }}<template v-if="full"> · Maximum of {{ maxFiles }} files reached</template></span>
      <input ref="input" class="mi-fu__input" type="file" tabindex="-1" aria-hidden="true" :accept="accept" :multiple="multiple" :disabled="disabled" @change="onChange" @click.stop>
    </div>

    <ul v-if="errors.length" :id="`${id}-err`" class="mi-fu__errors" role="alert">
      <li v-for="(m, i) in errors" :key="i">{{ m }}</li>
    </ul>

    <ul v-if="model.length" class="mi-fu__list" :aria-label="`${label} files`">
      <li v-for="(f, i) in model" :key="`${f.name}-${f.size}-${f.lastModified}`" class="mi-fu__file">
        <span class="mi-fu__ficon" aria-hidden="true"><MiIcon name="document" :size="18" /></span>
        <span class="mi-fu__meta">
          <span class="mi-fu__name">{{ f.name }}</span>
          <span class="mi-fu__size">{{ miFormatBytes(f.size) }}<template v-if="pct(f) !== null"> · {{ pct(f) }} %</template></span>
          <span v-if="pct(f) !== null" class="mi-fu__track" role="progressbar" :aria-label="`Upload progress of ${f.name}`" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="pct(f)!">
            <span class="mi-fu__fill" :style="{ transform: `translate3d(${pct(f)! - 100}%,0,0)` }" />
          </span>
        </span>
        <button type="button" class="mi-fu__rm" :aria-label="`${removeLabel} ${f.name}`" :disabled="disabled" @click="remove(i)">
          <MiIcon name="close" :size="14" :weight="2.4" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.mi-fu { display: grid; gap: 10px; font-family: var(--mi-font); color: var(--mi-label); }
.mi-fu.is-disabled { opacity: .45; }

.mi-fu__zone {
  position: relative;
  isolation: isolate;
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: 26px 20px;
  border: 1.5px dashed var(--mi-field-b);
  border-radius: 16px;
  background: var(--mi-field);
  text-align: center;
  cursor: pointer;
  touch-action: manipulation;
}
.is-disabled .mi-fu__zone { cursor: not-allowed; }
.mi-fu__zone.is-drag { border-color: var(--mi-p); border-style: solid; }
.mi-fu__zone.is-invalid { border-color: var(--mi-red); }
.mi-fu__zone:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 2px; }

.mi-fu__glow {
  position: absolute; inset: 0; z-index: -1; border-radius: inherit;
  background: var(--mi-p-tint); opacity: 0;
  transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.mi-fu__zone:hover .mi-fu__glow { opacity: .5; }
.mi-fu__zone.is-drag .mi-fu__glow { opacity: 1; }

.mi-fu__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; margin-bottom: 6px; border-radius: 14px;
  background: var(--mi-fill3); color: var(--mi-p-text, var(--mi-p));
  transition: transform var(--mi-dur-3) var(--mi-spring);
}
.mi-fu__zone.is-drag .mi-fu__icon { transform: translate3d(0, -4px, 0) scale(1.08); }
.mi-fu__label { font-size: 15px; font-weight: 600; }
.mi-fu__hint { font-size: 13px; color: var(--mi-label2); }
.mi-fu__input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

.mi-fu__errors { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; font-size: 13px; color: var(--mi-red-t); }

.mi-fu__list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.mi-fu__file {
  display: flex; align-items: center; gap: 12px; padding: 10px 10px 10px 12px;
  border-radius: 12px; background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.mi-fu__ficon {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  width: 34px; height: 34px; border-radius: 10px; background: var(--mi-p-tint); color: var(--mi-p-text, var(--mi-p));
}
.mi-fu__meta { display: grid; gap: 2px; flex: 1; min-width: 0; }
.mi-fu__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 500; }
.mi-fu__size { font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.mi-fu__track { display: block; height: 4px; margin-top: 4px; border-radius: 99px; background: var(--mi-fill3); overflow: hidden; }
.mi-fu__fill {
  display: block; width: 100%; height: 100%; border-radius: inherit; background: var(--mi-p);
  transition: transform var(--mi-dur-3) var(--mi-ease);
}
.mi-fu__rm {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  width: 32px; height: 32px; padding: 0; border: 0; border-radius: 99px;
  background: transparent; color: var(--mi-label2); cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.mi-fu__rm:hover:not(:disabled) { background: var(--mi-fill3); color: var(--mi-label); }
.mi-fu__rm:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 1px; }
</style>
