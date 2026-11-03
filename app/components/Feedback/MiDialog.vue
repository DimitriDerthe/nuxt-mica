<script lang="ts">
export type MiDialogActionKind = 'default' | 'primary' | 'destructive' | 'cancel'

export interface MiDialogAction {
  id: string
  label: string
  kind?: MiDialogActionKind
  disabled?: boolean
}
</script>

<script setup lang="ts">
/** Modal for confirmations and blocking decisions: `alert` is a compact centred box, `dialog` a card with an icon tile. */
import { computed, ref, useId } from 'vue'
import MiFbIcon, { type MiFbIconName } from './MiFbIcon.vue'
import { MI_OVERLAY_Z, useMiOverlay, useMiPresence } from '../../utils/miOverlay'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** `alert`: compact centred alert. `dialog`: card with icon tile and stacked buttons. */
  variant?: 'alert' | 'dialog'
  /** Heading announced as the dialog name. */
  title?: string
  /** Body text under the title, shown when no default slot is given. */
  message?: string
  /** Buttons. Initial focus goes to `cancel` in `alert`, else `primary`, else the first enabled one. */
  actions?: MiDialogAction[]
  /** Icon tile shown in the `dialog` variant (or use the `icon` slot). */
  icon?: MiFbIconName
  /** Render in place without scrim, focus trap or teleport (for documentation and boards). */
  inline?: boolean
  /** Ignore Escape and scrim clicks. */
  persistent?: boolean
  /** Close automatically after any action. */
  closeOnAction?: boolean
  /** Accessible name when no title is given. */
  label?: string
}>(), {
  variant: 'alert',
  actions: () => [],
  closeOnAction: true
})

const emit = defineEmits<{
  action: [id: string]
  close: [reason: 'action' | 'escape' | 'backdrop']
}>()

/** Whether the dialog is open. */

const open = defineModel<boolean>({ default: false })
const uid = useId()
const titleId = `mi-dlg-t-${uid}`
const descId = `mi-dlg-d-${uid}`
const panel = ref<HTMLElement | null>(null)
const { rendered, afterLeave } = useMiPresence(open)

const isAlert = computed(() => props.variant === 'alert')
const stacked = computed(() => !isAlert.value || props.actions.length !== 2)
const initialId = computed(() => {
  const list = props.actions.filter(a => !a.disabled)
  const pick = isAlert.value
    ? list.find(a => a.kind === 'cancel') ?? list.find(a => a.kind === 'primary') ?? list[0]
    : list.find(a => a.kind === 'primary') ?? list[0]
  return pick?.id
})

function close(reason: 'action' | 'escape' | 'backdrop') {
  if (!props.inline) open.value = false
  emit('close', reason)
}
function dismiss(reason: 'escape' | 'backdrop') {
  if (!props.persistent) close(reason)
}
function run(a: MiDialogAction) {
  if (a.disabled) return
  emit('action', a.id)
  if (props.closeOnAction) close('action')
}

let downOnScrim = false
function onScrimDown(e: PointerEvent) { downOnScrim = e.target === e.currentTarget }
function onScrimClick(e: MouseEvent) {
  if (downOnScrim && e.target === e.currentTarget) dismiss('backdrop')
  downOnScrim = false
}

useMiOverlay({
  open: computed(() => open.value && !props.inline),
  panel,
  onEscape: () => dismiss('escape'),
  initialFocus: () => panel.value?.querySelector<HTMLElement>('[data-initial]')
})

defineSlots<{
  /** Custom artwork for the icon tile, replacing the `icon` glyph (dialog variant). */
  icon?(): unknown
  /** Body content; replaces the `message` prop. */
  default?(): unknown
  /** Replaces the built-in action buttons; call `close` to dismiss the dialog. */
  actions?(props: { close: () => void }): unknown
}>()
</script>

<template>
  <Teleport to="body" :disabled="inline">
    <div
      v-if="inline || rendered"
      class="mi mi-dlg-root mi:font-mi"
      :class="{ 'is-inline': inline }"
      :style="inline ? undefined : { zIndex: MI_OVERLAY_Z.dialog }"
      @pointerdown="onScrimDown"
      @click="onScrimClick"
    >
      <Transition v-if="!inline" name="mi-dlg-fade" appear>
        <div v-if="open" class="mi-dlg-scrim mi:absolute mi:inset-0 mi:[background:var(--mi-scrim)]" aria-hidden="true" />
      </Transition>
      <Transition name="mi-dlg" :appear="!inline" @after-leave="afterLeave">
        <div
          v-if="inline || open"
          ref="panel"
          v-bind="$attrs"
          class="mi-dlg mi:max-h-[calc(100dvh_-_32px)] mi:overscroll-contain mi:tracking-[-.01em] mi:[outline:none] mi:shadow-3"
          :class="[`mi-dlg--${variant}`]"
          :role="isAlert ? 'alertdialog' : 'dialog'"
          :aria-modal="inline ? undefined : 'true'"
          :aria-labelledby="title ? titleId : undefined"
          :aria-label="title ? undefined : label"
          :aria-describedby="message || $slots.default ? descId : undefined"
          tabindex="-1"
        >
          <div class="mi-dlg-body mi:flex mi:flex-col mi:[.mi-dlg--alert_&]:pt-5 mi:[.mi-dlg--alert_&]:px-4 mi:[.mi-dlg--alert_&]:pb-4.5 mi:[.mi-dlg--alert_&]:gap-1 mi:[.mi-dlg--dialog_&]:gap-4">
            <span v-if="!isAlert && (icon || $slots.icon)" class="mi-dlg-icon mi:w-13 mi:h-13 mi:rounded-[14px] mi:[background:var(--mi-p)] mi:text-p-on mi:flex mi:items-center mi:justify-center">
              <slot name="icon"><MiFbIcon v-if="icon" :name="icon" :size="28" :stroke="1.8" /></slot>
            </span>
            <div class="mi-dlg-text mi:flex mi:flex-col mi:gap-1 mi:min-w-0 mi:[.mi-dlg--dialog_&]:gap-1.5">
              <h3 v-if="title" :id="titleId" class="mi-dlg-title mi:m-0 mi:text-[17px] mi:font-semibold mi:leading-[22px] mi:[.mi-dlg--dialog_&]:font-bold">{{ title }}</h3>
              <div v-if="message || $slots.default" :id="descId" class="mi-dlg-msg mi:text-[13px] mi:leading-[18px] mi:[.mi-dlg--dialog_&]:text-label2">
                <slot>{{ message }}</slot>
              </div>
            </div>
          </div>
          <div v-if="actions.length || $slots.actions" class="mi-dlg-actions mi:[.mi-dlg--alert_&]:grid mi:[.mi-dlg--alert_&]:grid-cols-2 mi:[.mi-dlg--alert_&]:[border-top:.5px_solid_var(--mi-sep)] mi:[.mi-dlg--alert_&.is-stacked]:grid-cols-[minmax(0,1fr)] mi:[.mi-dlg--dialog_&]:flex mi:[.mi-dlg--dialog_&]:flex-col mi:[.mi-dlg--dialog_&]:gap-2" :class="{ 'is-stacked': stacked }">
            <slot name="actions" :close="() => close('action')">
              <button
                v-for="a in actions"
                :key="a.id"
                type="button"
                class="mi-dlg-btn mi:appearance-none mi:[border:0] mi:m-0 mi:font-[inherit] mi:text-label mi:[background:transparent] mi:[-webkit-tap-highlight-color:transparent] mi:disabled:opacity-40 mi:disabled:cursor-default mi:[.mi-dlg--alert_&]:h-11 mi:[.mi-dlg--alert_&]:text-[17px] mi:[.mi-dlg--alert_&]:text-p-text mi:[.mi-dlg--alert_&]:relative mi:[.mi-dlg--alert_.mi-dlg-actions:not(.is-stacked)_.mi-dlg-btn+&]:[border-left:.5px_solid_var(--mi-sep)] mi:[.mi-dlg--alert_.mi-dlg-actions.is-stacked_.mi-dlg-btn+&]:[border-top:.5px_solid_var(--mi-sep)] mi:[.mi-dlg--alert_&.is-destructive]:text-red-t mi:[.mi-dlg--alert_&:focus-visible]:outline-offset-[-3px] mi:[.mi-dlg--dialog_&]:h-9 mi:[.mi-dlg--dialog_&]:rounded-[10px] mi:[.mi-dlg--dialog_&]:text-[15px] mi:[.mi-dlg--dialog_&]:font-medium mi:[.mi-dlg--dialog_&]:[background:var(--mi-fill3)] mi:[.mi-dlg--dialog_&]:py-0 mi:[.mi-dlg--dialog_&]:px-3.5"
                :class="`is-${a.kind ?? 'default'}`"
                :disabled="a.disabled"
                :data-initial="a.id === initialId ? '' : undefined"
                @click="run(a)"
              >{{ a.label }}</button>
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.mi-dlg-root{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:16px}
.mi-dlg-root.is-inline{position:static;inset:auto;padding:0;width:100%;display:flex;justify-content:center}
.mi-dlg{position:relative;overflow:auto;color:var(--mi-label)}
.mi-dlg--alert{width:270px;max-width:100%;border-radius:16px;background:var(--mi-menu,var(--mi-mat));-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);text-align:center}
.mi-dlg--dialog{width:100%;max-width:360px;border-radius:20px;background:var(--mi-elev);padding:22px;display:flex;flex-direction:column;gap:16px}
.mi-dlg--alert .mi-dlg-btn.is-primary{font-weight:600}
.mi-dlg--alert .mi-dlg-btn.is-destructive{font-weight:600}
.mi-dlg--alert .mi-dlg-btn:not(:disabled):active{background:var(--mi-fill3)}
.mi-dlg--dialog .mi-dlg-btn.is-primary{background:var(--mi-p);color:var(--mi-p-on);font-weight:600}
.mi-dlg--dialog .mi-dlg-btn.is-primary:not(:disabled):hover{background:var(--mi-p-hover)}
.mi-dlg--dialog .mi-dlg-btn.is-cancel{background:transparent;color:var(--mi-p-text)}
.mi-dlg--dialog .mi-dlg-btn.is-destructive{background:var(--mi-red-t);color:#fff;font-weight:600}
.mi-dlg--dialog .mi-dlg-btn.is-default:not(:disabled):active,.mi-dlg--dialog .mi-dlg-btn.is-cancel:not(:disabled):active{background:var(--mi-fill2)}

.mi-dlg-fade-enter-active,.mi-dlg-fade-leave-active{transition:opacity var(--mi-dur-2) var(--mi-ease);will-change:opacity}
.mi-dlg-fade-enter-from,.mi-dlg-fade-leave-to{opacity:0}
.mi-dlg-enter-active{transition:transform var(--mi-dur-3) var(--mi-spring),opacity var(--mi-dur-2) var(--mi-ease);will-change:transform,opacity}
.mi-dlg-leave-active{transition:transform var(--mi-dur-2) var(--mi-ease),opacity var(--mi-dur-2) var(--mi-ease);will-change:transform,opacity}
.mi-dlg-enter-from{opacity:0;transform:scale(1.08)}
.mi-dlg-leave-to{opacity:0;transform:scale(.96)}
</style>
