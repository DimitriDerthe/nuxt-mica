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
      class="mi mi-as-root mi:fixed mi:inset-0 mi:flex mi:[align-items:flex-end] mi:justify-center mi:pt-2 mi:px-2 mi:pb-[max(8px,env(safe-area-inset-bottom))] mi:font-mi mi:[&.is-inline]:static mi:[&.is-inline]:inset-auto mi:[&.is-inline]:p-0 mi:[&.is-inline]:flex mi:[&.is-inline]:justify-center"
      :class="{ 'is-inline': inline }"
      :style="inline ? undefined : { zIndex: MI_OVERLAY_Z.dialog }"
      @pointerdown="onRootDown"
      @click="onRootClick"
    >
      <Transition v-if="!inline" name="mi-as-fade" appear>
        <div v-if="open" class="mi-as-scrim mi:absolute mi:inset-0 mi:[background:var(--mi-scrim)]" aria-hidden="true" />
      </Transition>
      <Transition name="mi-as" :appear="!inline" @after-leave="afterLeave">
        <div
          v-if="inline || open"
          ref="panel"
          v-bind="$attrs"
          class="mi-as mi:relative mi:w-full mi:max-w-80 mi:flex mi:flex-col mi:gap-2 mi:max-h-[calc(100dvh_-_16px)] mi:[outline:none] mi:text-label mi:tracking-[-.01em]"
          role="dialog"
          :aria-modal="inline ? undefined : 'true'"
          :aria-labelledby="title ? titleId : undefined"
          :aria-label="title ? undefined : (label ?? 'Actions')"
          tabindex="-1"
        >
          <div class="mi-as-group mi:rounded-[14px] mi:[background:var(--mi-menu,var(--mi-mat))] mi:shadow-2 mi:overflow-auto mi:overscroll-contain mi:text-center mi:min-h-0">
            <p v-if="title" :id="titleId" class="mi-as-title mi:m-0 mi:py-3.5 mi:px-4 mi:text-[13px] mi:leading-[18px] mi:text-label2 mi:[border-bottom:.5px_solid_var(--mi-sep)]">{{ title }}</p>
            <div ref="menu" role="menu" :aria-labelledby="title ? titleId : undefined" :aria-label="title ? undefined : (label ?? 'Actions')" @keydown="onMenuKey">
              <button
                v-for="a in actions"
                :key="a.id"
                type="button"
                role="menuitem"
                class="mi-as-item mi:appearance-none mi:block mi:w-full mi:h-14 mi:m-0 mi:py-0 mi:px-4 mi:[border:0] mi:font-[inherit] mi:text-[20px] mi:[background:transparent] mi:text-p-text mi:[-webkit-tap-highlight-color:transparent] mi:[.mi-as-item+&]:[border-top:.5px_solid_var(--mi-sep)] mi:[&.is-destructive]:text-red-t mi:disabled:opacity-40 mi:disabled:cursor-default mi:[&:not(:disabled):active]:[background:var(--mi-fill3)] mi:focus-visible:outline-offset-[-3px]"
                :class="{ 'is-destructive': a.kind === 'destructive' }"
                :disabled="a.disabled"
                :data-initial="a.id === firstEnabled ? '' : undefined"
                @click="run(a)"
              >{{ a.label }}</button>
            </div>
          </div>
          <button type="button" class="mi-as-cancel mi:appearance-none mi:block mi:w-full mi:h-14 mi:m-0 mi:py-0 mi:px-4 mi:[border:0] mi:font-[inherit] mi:text-[20px] mi:[background:transparent] mi:text-p-text mi:[-webkit-tap-highlight-color:transparent] mi:flex-[none] mi:rounded-[14px] mi:[background:var(--mi-elev)] mi:shadow-2 mi:font-semibold mi:active:[background:var(--mi-fill3)]" @click="cancel('cancel')">{{ cancelLabel }}</button>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.mi-as-group{-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%)}

.mi-as-fade-enter-active,.mi-as-fade-leave-active{transition:opacity var(--mi-dur-3) var(--mi-ease);will-change:opacity}
.mi-as-fade-enter-from,.mi-as-fade-leave-to{opacity:0}
.mi-as-enter-active{transition:transform var(--mi-dur-4) var(--mi-spring),opacity var(--mi-dur-2) var(--mi-ease);will-change:transform,opacity}
.mi-as-leave-active{transition:transform var(--mi-dur-3) var(--mi-ease-in-out),opacity var(--mi-dur-3) var(--mi-ease);will-change:transform,opacity}
.mi-as-enter-from,.mi-as-leave-to{opacity:0;transform:translate3d(0,24px,0)}
</style>
