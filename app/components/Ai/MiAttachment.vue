<script setup lang="ts">
/** File or image attachment card with media, title, description, upload state and actions; compose parts or use the name/fileSize shortcut props. */
import { computed } from 'vue'
import MiIcon from '../Base/MiIcon.vue'
import MiAttachmentMedia from './MiAttachmentMedia.vue'
import MiAttachmentContent from './MiAttachmentContent.vue'
import MiAttachmentTitle from './MiAttachmentTitle.vue'
import MiAttachmentDescription from './MiAttachmentDescription.vue'
import MiAttachmentActions from './MiAttachmentActions.vue'
import MiAttachmentAction from './MiAttachmentAction.vue'

export type MiAttachmentState = 'idle' | 'uploading' | 'processing' | 'error' | 'done'

const props = withDefaults(defineProps<{
  /** Upload state; uploading and processing show a shimmer. */
  state?: MiAttachmentState
  /** Card size. */
  size?: 'sm' | 'default' | 'lg'
  /** Stack media above content when vertical. */
  orientation?: 'horizontal' | 'vertical'
  /** Shortcut: file name (used when no default slot is given). */
  name?: string
  /** Shortcut: size in bytes. */
  fileSize?: number
  /** Shortcut: MIME type; image types get an image icon. */
  type?: string
  /** Shortcut: thumbnail URL for images. */
  preview?: string
  /** Shortcut: upload progress 0-100, shows the uploading state below 100. */
  progress?: number
  /** Shortcut: error text; switches to the error state. */
  error?: string
  /** Shortcut: show the remove button. */
  removable?: boolean
}>(), { state: undefined, size: 'default', orientation: 'horizontal', removable: true })

const emit = defineEmits<{
  /** Fired when the shortcut remove button is pressed. */
  remove: []
}>()

const isImage = computed(() => !!props.type && props.type.startsWith('image/'))
const st = computed<MiAttachmentState>(() => props.state ?? (props.error ? 'error' : props.progress !== undefined && props.progress < 100 ? 'uploading' : 'idle'))
const desc = computed(() => {
  if (props.error) return props.error
  if (st.value === 'uploading' && props.progress !== undefined) return `Uploading · ${Math.round(props.progress)}%`
  const b = props.fileSize
  if (b === undefined) return ''
  return b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`
})

defineSlots<{
  /** Custom card content; replaces the built-in media, title, description and remove button built from the shortcut props. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-att" :class="[`is-${st}`, `is-${size}`, `is-${orientation}`]" :data-state="st" role="group" :aria-label="name" :aria-busy="st === 'uploading' || st === 'processing' ? true : undefined">
    <slot>
      <MiAttachmentMedia :variant="preview && isImage ? 'image' : 'icon'">
        <img v-if="preview && isImage" :src="preview" alt="">
        <MiIcon v-else-if="st === 'uploading' || st === 'processing'" name="spinner" :size="18" spin />
        <MiIcon v-else :name="isImage ? 'image' : 'document'" :size="18" />
      </MiAttachmentMedia>
      <MiAttachmentContent>
        <MiAttachmentTitle>{{ name }}</MiAttachmentTitle>
        <MiAttachmentDescription>{{ desc }}</MiAttachmentDescription>
      </MiAttachmentContent>
      <MiAttachmentActions v-if="removable">
        <MiAttachmentAction :aria-label="`Remove ${name}`" @click="emit('remove')"><MiIcon name="close" :size="14" /></MiAttachmentAction>
      </MiAttachmentActions>
    </slot>
  </div>
</template>

<style scoped>
.mi-att { position: relative; display: flex; align-items: center; gap: 10px; max-width: 320px; padding: 8px 10px; border-radius: 12px; overflow: hidden; background: var(--mi-card); box-shadow: var(--mi-sh2); font-family: var(--mi-font); color: var(--mi-label); }
.mi-att.is-vertical { flex-direction: column; align-items: stretch; width: 160px; flex: none; scroll-snap-align: start; }
.mi-att.is-sm { padding: 6px 8px; font-size: 13px; }
.mi-att.is-lg { padding: 12px 14px; }
.mi-att.is-error { color: var(--mi-s-text); }
.mi-att.is-uploading::after, .mi-att.is-processing::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, transparent, var(--mi-p-tint), transparent); transform: translateX(-100%); animation: mi-att-shimmer 1.6s linear infinite; }
@keyframes mi-att-shimmer { to { transform: translateX(100%); } }
.mi-att :deep(.mi-att__media) { flex: none; width: 36px; height: 36px; border-radius: 8px; display: grid; place-items: center; overflow: hidden; background: var(--mi-p-tint); color: var(--mi-p-text); }
.mi-att.is-vertical :deep(.mi-att__media.is-image) { width: 100%; height: auto; aspect-ratio: 4 / 3; }
.mi-att :deep(.mi-att__media img) { width: 100%; height: 100%; object-fit: cover; }
.mi-att :deep(.mi-att__text) { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 2px; }
.mi-att :deep(.mi-att__name) { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mi-att :deep(.mi-att__meta) { font-size: 12px; opacity: .65; }
.mi-att :deep(.mi-att__actions) { position: relative; z-index: 2; display: flex; gap: 2px; }
.mi-att.is-vertical :deep(.mi-att__actions) { position: absolute; top: 6px; right: 6px; }
.mi-att :deep(.mi-att__act) { width: 24px; height: 24px; display: grid; place-items: center; border: 0; border-radius: 50%; background: transparent; color: inherit; cursor: pointer; opacity: .75; }
.mi-att :deep(.mi-att__act:hover) { opacity: 1; background: var(--mi-p-tint); }
.mi-att :deep(.mi-att__act:focus-visible), .mi-att :deep(.mi-att__trigger:focus-visible) { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.mi-att :deep(.mi-att__trigger) { position: absolute; inset: 0; z-index: 1; border: 0; background: transparent; cursor: pointer; }
</style>
