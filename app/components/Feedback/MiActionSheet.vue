<script lang="ts">
export interface MiActionSheetAction {
  id: string
  label: string
  kind?: 'default' | 'destructive'
  disabled?: boolean
}
</script>

<script setup lang="ts">
/** Bottom list of actions to choose from, modal by default; use `inline` to render it in place (docs, boards). */
import { computed, ref, useId } from 'vue'
import { MI_OVERLAY_Z, useMiOverlay, useMiPresence } from '../../utils/miOverlay'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Optional caption above the actions. */
  title?: string
  /** Rows as menu items; `id` is emitted on `action`, `disabled` rows are skipped by arrow keys. */
  actions?: MiActionSheetAction[]
  /** Text of the cancel row that closes the sheet without choosing an action. */
  cancelLabel?: string
  /** Render in place without scrim, focus trap or teleport. */
  inline?: boolean
  /** Ignore Escape and scrim clicks. */
  persistent?: boolean
  /** Accessible name when there is no title. */
  label?: string
}>(), {
  actions: () => [],
  cancelLabel: 'Cancel'
})

const emit = defineEmits<{
  action: [id: string]
  cancel: [reason: 'cancel' | 'escape' | 'backdrop']
}>()

/** Whether the sheet is open. */

const open = defineModel<boolean>({ default: false })
const titleId = `mi-as-t-${useId()}`
const panel = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const { rendered, afterLeave } = useMiPresence(open)

const firstEnabled = computed(() => props.actions.find(a => !a.disabled)?.id)

function close() {
  if (!props.inline) open.value = false
}
function cancel(reason: 'cancel' | 'escape' | 'backdrop') {
  if (reason !== 'cancel' && props.persistent) return
  close()
  emit('cancel', reason)
}
function run(a: MiActionSheetAction) {
  if (a.disabled) return
  emit('action', a.id)
  close()
}

function onMenuKey(e: KeyboardEvent) {
  const items = menu.value ? Array.from(menu.value.querySelectorAll<HTMLElement>('[role=menuitem]:not(:disabled)')) : []
  if (!items.length) return
  const i = items.indexOf(document.activeElement as HTMLElement)
  let next = -1
  if (e.key === 'ArrowDown') next = i < 0 ? 0 : (i + 1) % items.length
  else if (e.key === 'ArrowUp') next = i < 0 ? items.length - 1 : (i - 1 + items.length) % items.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = items.length - 1
  if (next >= 0) {
    e.preventDefault()
    items[next]!.focus({ preventScroll: true })
  }
}

let downOnScrim = false
function onRootDown(e: PointerEvent) { downOnScrim = e.target === e.currentTarget }
function onRootClick(e: MouseEvent) {
  if (downOnScrim && e.target === e.currentTarget) cancel('backdrop')
  downOnScrim = false
}

useMiOverlay({
  open: computed(() => open.value && !props.inline),
  panel,
  onEscape: () => cancel('escape'),
  initialFocus: () => panel.value?.querySelector<HTMLElement>('[data-initial]')
})
</script>

<template>
  <Teleport to="body" :disabled="inline">
    <div
      v-if="inline || rendered"
      class="mi mi-as-root"
      :class="{ 'is-inline': inline }"
      :style="inline ? undefined : { zIndex: MI_OVERLAY_Z.dialog }"
      @pointerdown="onRootDown"
      @click="onRootClick"
    >
      <Transition v-if="!inline" name="mi-as-fade" appear>
        <div v-if="open" class="mi-as-scrim" aria-hidden="true" />
      </Transition>
      <Transition name="mi-as" :appear="!inline" @after-leave="afterLeave">
        <div
          v-if="inline || open"
          ref="panel"
          v-bind="$attrs"
          class="mi-as"
          role="dialog"
          :aria-modal="inline ? undefined : 'true'"
          :aria-labelledby="title ? titleId : undefined"
          :aria-label="title ? undefined : (label ?? 'Actions')"
          tabindex="-1"
        >
          <div class="mi-as-group">
            <p v-if="title" :id="titleId" class="mi-as-title">{{ title }}</p>
            <div ref="menu" role="menu" :aria-labelledby="title ? titleId : undefined" :aria-label="title ? undefined : (label ?? 'Actions')" @keydown="onMenuKey">
              <button
                v-for="a in actions"
                :key="a.id"
                type="button"
                role="menuitem"
                class="mi-as-item"
                :class="{ 'is-destructive': a.kind === 'destructive' }"
                :disabled="a.disabled"
                :data-initial="a.id === firstEnabled ? '' : undefined"
                @click="run(a)"
              >{{ a.label }}</button>
            </div>
          </div>
          <button type="button" class="mi-as-cancel" @click="cancel('cancel')">{{ cancelLabel }}</button>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.mi-as-root{position:fixed;inset:0;display:flex;align-items:flex-end;justify-content:center;padding:8px 8px max(8px,env(safe-area-inset-bottom));font-family:var(--mi-font)}
.mi-as-root.is-inline{position:static;inset:auto;padding:0;display:flex;justify-content:center}
.mi-as-scrim{position:absolute;inset:0;background:var(--mi-scrim)}
.mi-as{position:relative;width:100%;max-width:320px;display:flex;flex-direction:column;gap:8px;max-height:calc(100dvh - 16px);outline:none;color:var(--mi-label);letter-spacing:-.01em}
.mi-as-group{border-radius:14px;background:var(--mi-menu,var(--mi-mat));-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);box-shadow:var(--mi-sh2);overflow:auto;overscroll-behavior:contain;text-align:center;min-height:0}
.mi-as-title{margin:0;padding:14px 16px;font-size:13px;line-height:18px;color:var(--mi-label2);border-bottom:.5px solid var(--mi-sep)}
.mi-as-item,.mi-as-cancel{appearance:none;display:block;width:100%;height:56px;margin:0;padding:0 16px;border:0;font-family:inherit;font-size:20px;background:transparent;color:var(--mi-p-text);-webkit-tap-highlight-color:transparent}
.mi-as-item+.mi-as-item{border-top:.5px solid var(--mi-sep)}
.mi-as-item.is-destructive{color:var(--mi-red-t)}
.mi-as-item:disabled{opacity:.4;cursor:default}
.mi-as-item:not(:disabled):active{background:var(--mi-fill3)}
.mi-as-item:focus-visible{outline-offset:-3px}
.mi-as-cancel{flex:none;border-radius:14px;background:var(--mi-elev);box-shadow:var(--mi-sh2);font-weight:600}
.mi-as-cancel:active{background:var(--mi-fill3)}

.mi-as-fade-enter-active,.mi-as-fade-leave-active{transition:opacity var(--mi-dur-3) var(--mi-ease);will-change:opacity}
.mi-as-fade-enter-from,.mi-as-fade-leave-to{opacity:0}
.mi-as-enter-active{transition:transform var(--mi-dur-4) var(--mi-spring),opacity var(--mi-dur-2) var(--mi-ease);will-change:transform,opacity}
.mi-as-leave-active{transition:transform var(--mi-dur-3) var(--mi-ease-in-out),opacity var(--mi-dur-3) var(--mi-ease);will-change:transform,opacity}
.mi-as-enter-from,.mi-as-leave-to{opacity:0;transform:translate3d(0,24px,0)}
</style>
