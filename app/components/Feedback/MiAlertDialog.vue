<script setup lang="ts">
/** Modal that interrupts for an explicit confirm or cancel decision; Escape and outside clicks never dismiss it. */
import { computed, nextTick, onMounted, onUpdated, useId } from 'vue'
import MiDialog, { type MiDialogAction } from './MiDialog.vue'
import type { MiFbIconName } from './MiFbIcon.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Heading announced as the dialog name. */
  title?: string
  /** Explanatory text (or use the default slot). */
  description?: string
  /** Label of the confirming button. */
  confirmLabel?: string
  /** Label of the cancelling button. Initial focus lands here. */
  cancelLabel?: string
  /** Style the confirm button as destructive. */
  destructive?: boolean
  /** `sm` is a compact centred box; `default` a card with a media tile and stacked buttons. */
  size?: 'default' | 'sm'
  /** Media icon shown above the title in the `default` size (or use the `media` slot). */
  media?: MiFbIconName
  /** Hide the cancel button (acknowledge-only alert). */
  hideCancel?: boolean
  /** Disable the confirm button, e.g. while a request runs. */
  confirmDisabled?: boolean
  /** Keep the dialog open after confirm so the caller can close it when work completes. */
  keepOpenOnConfirm?: boolean
  /** Render in place without scrim, focus trap or teleport (documentation and boards). */
  inline?: boolean
  /** Accessible name when there is no title. */
  label?: string
}>(), {
  size: 'default',
  confirmLabel: 'Continue',
  cancelLabel: 'Cancel'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

/** Whether the dialog is open. */

const open = defineModel<boolean>({ default: false })

const uid = `mi-ad-${useId()}`
const variant = computed(() => (props.size === 'sm' ? 'alert' : 'dialog'))
/* MiDialog's card variant uses role=dialog; an alert dialog must announce as alertdialog. */
function fixRole() {
  if (typeof document !== 'undefined') document.getElementById(uid)?.setAttribute('role', 'alertdialog')
}
onMounted(() => nextTick(fixRole))
onUpdated(fixRole)

const actions = computed<MiDialogAction[]>(() => [
  ...(props.hideCancel ? [] : [{ id: 'cancel', label: props.cancelLabel, kind: 'cancel' as const }]),
  { id: 'confirm', label: props.confirmLabel, kind: props.destructive ? 'destructive' as const : 'primary' as const, disabled: props.confirmDisabled }
])

function onAction(id: string) {
  if (id === 'confirm') {
    emit('confirm')
    if (props.keepOpenOnConfirm) open.value = true
  } else {
    emit('cancel')
  }
}

defineSlots<{
  /** Element that opens the dialog; call `open` from its click handler. */
  trigger?(props: { open: () => void }): unknown
  /** Custom artwork for the media tile, replacing the `media` icon. */
  media?(): unknown
  /** Description content; replaces the `description` prop. */
  default?(): unknown
}>()
</script>

<template>
  <slot name="trigger" :open="() => (open = true)" />
  <MiDialog
    v-bind="$attrs"
    :id="uid"
    v-model="open"
    :variant="variant"
    :icon="media"
    persistent
    :title="title"
    :message="description"
    :label="label"
    :actions="actions"
    :inline="inline"
    @action="onAction"
  >
    <template v-if="$slots.media" #icon><slot name="media" /></template>
    <slot />
  </MiDialog>
</template>
