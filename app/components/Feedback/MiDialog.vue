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
      class="mi mi-dlg-root"
      :class="{ 'is-inline': inline }"
      :style="inline ? undefined : { zIndex: MI_OVERLAY_Z.dialog }"
      @pointerdown="onScrimDown"
      @click="onScrimClick"
    >
      <Transition v-if="!inline" name="mi-dlg-fade" appear>
        <div v-if="open" class="mi-dlg-scrim" aria-hidden="true" />
      </Transition>
      <Transition name="mi-dlg" :appear="!inline" @after-leave="afterLeave">
        <div
          v-if="inline || open"
          ref="panel"
          v-bind="$attrs"
          class="mi-dlg"
          :class="[`mi-dlg--${variant}`]"
          :role="isAlert ? 'alertdialog' : 'dialog'"
          :aria-modal="inline ? undefined : 'true'"
          :aria-labelledby="title ? titleId : undefined"
          :aria-label="title ? undefined : label"
          :aria-describedby="message || $slots.default ? descId : undefined"
          tabindex="-1"
        >
          <div class="mi-dlg-body">
            <span v-if="!isAlert && (icon || $slots.icon)" class="mi-dlg-icon">
              <slot name="icon"><MiFbIcon v-if="icon" :name="icon" :size="28" :stroke="1.8" /></slot>
            </span>
            <div class="mi-dlg-text">
              <h3 v-if="title" :id="titleId" class="mi-dlg-title">{{ title }}</h3>
              <div v-if="message || $slots.default" :id="descId" class="mi-dlg-msg">
                <slot>{{ message }}</slot>
              </div>
            </div>
          </div>
          <div v-if="actions.length || $slots.actions" class="mi-dlg-actions" :class="{ 'is-stacked': stacked }">
            <slot name="actions" :close="() => close('action')">
              <button
                v-for="a in actions"
                :key="a.id"
                type="button"
                class="mi-dlg-btn"
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
.mi-dlg-root{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;font-family:var(--mi-font)}
.mi-dlg-root.is-inline{position:static;inset:auto;padding:0;width:100%;display:flex;justify-content:center}
.mi-dlg-scrim{position:absolute;inset:0;background:var(--mi-scrim)}
.mi-dlg{position:relative;max-height:calc(100dvh - 32px);overflow:auto;overscroll-behavior:contain;color:var(--mi-label);letter-spacing:-.01em;outline:none;box-shadow:var(--mi-sh3)}
.mi-dlg--alert{width:270px;max-width:100%;border-radius:16px;background:var(--mi-menu,var(--mi-mat));-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);text-align:center}
.mi-dlg--dialog{width:100%;max-width:360px;border-radius:20px;background:var(--mi-elev);padding:22px;display:flex;flex-direction:column;gap:16px}
.mi-dlg-body{display:flex;flex-direction:column}
.mi-dlg--alert .mi-dlg-body{padding:20px 16px 18px;gap:4px}
.mi-dlg--dialog .mi-dlg-body{gap:16px}
.mi-dlg-text{display:flex;flex-direction:column;gap:4px;min-width:0}
.mi-dlg--dialog .mi-dlg-text{gap:6px}
.mi-dlg-icon{width:52px;height:52px;border-radius:14px;background:var(--mi-p);color:var(--mi-p-on);display:flex;align-items:center;justify-content:center}
.mi-dlg-title{margin:0;font-size:17px;font-weight:600;line-height:22px}
.mi-dlg--dialog .mi-dlg-title{font-weight:700}
.mi-dlg-msg{font-size:13px;line-height:18px}
.mi-dlg--dialog .mi-dlg-msg{color:var(--mi-label2)}
.mi-dlg-btn{appearance:none;border:0;margin:0;font-family:inherit;color:var(--mi-label);background:transparent;-webkit-tap-highlight-color:transparent}
.mi-dlg-btn:disabled{opacity:.4;cursor:default}
.mi-dlg--alert .mi-dlg-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:.5px solid var(--mi-sep)}
.mi-dlg--alert .mi-dlg-actions.is-stacked{grid-template-columns:minmax(0,1fr)}
.mi-dlg--alert .mi-dlg-btn{height:44px;font-size:17px;color:var(--mi-p-text);position:relative}
.mi-dlg--alert .mi-dlg-actions:not(.is-stacked) .mi-dlg-btn+.mi-dlg-btn{border-left:.5px solid var(--mi-sep)}
.mi-dlg--alert .mi-dlg-actions.is-stacked .mi-dlg-btn+.mi-dlg-btn{border-top:.5px solid var(--mi-sep)}
.mi-dlg--alert .mi-dlg-btn.is-primary{font-weight:600}
.mi-dlg--alert .mi-dlg-btn.is-destructive{font-weight:600;color:var(--mi-red-t)}
.mi-dlg--alert .mi-dlg-btn:not(:disabled):active{background:var(--mi-fill3)}
.mi-dlg--alert .mi-dlg-btn:focus-visible{outline-offset:-3px}
.mi-dlg--dialog .mi-dlg-actions{display:flex;flex-direction:column;gap:8px}
.mi-dlg--dialog .mi-dlg-btn{height:36px;border-radius:10px;font-size:15px;font-weight:500;background:var(--mi-fill3);padding:0 14px}
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
