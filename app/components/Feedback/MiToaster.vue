<script lang="ts">
export type MiToasterPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
</script>

<script setup lang="ts">
/** Region that renders the toasts queued by useMiToast; mount it once in the app layout, pinned to one of six positions. */
import { computed, onMounted, ref } from 'vue'
import MiToast from './MiToast.vue'
import { useMiToast } from '../../composables/useMiToast'
import { MI_OVERLAY_Z } from '../../utils/miOverlay'

const props = withDefaults(defineProps<{
  /** Edge and alignment. `top-*` stacks the newest toast first. */
  position?: MiToasterPosition
  /** Maximum toasts shown at once; the newest win. */
  limit?: number
  /** Distance from the viewport edge, in px. */
  offset?: number
  /** Accessible name of the notification region. */
  label?: string
}>(), {
  position: 'bottom-center',
  limit: 3,
  offset: 20,
  label: 'Notifications'
})

const { toasts, dismiss, pause, resume } = useMiToast()
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const isTop = computed(() => props.position.startsWith('top'))
const align = computed(() => props.position.endsWith('left') ? 'flex-start' : props.position.endsWith('right') ? 'flex-end' : 'center')
const list = computed(() => {
  const newest = toasts.value.slice(-props.limit)
  return isTop.value ? [...newest].reverse() : newest
})
const hostStyle = computed(() => ({
  [isTop.value ? 'top' : 'bottom']: `max(${props.offset}px,env(safe-area-inset-${isTop.value ? 'top' : 'bottom'}))`,
  zIndex: MI_OVERLAY_Z.toast,
  '--mi-ta': align.value
}))

function act(id: string, onClick?: () => void) {
  onClick?.()
  dismiss(id)
}
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <section
      class="mi mi-toaster mi:fixed mi:left-0 mi:right-0 mi:py-0 mi:px-4 mi:pointer-events-none mi:font-mi mi:[outline:none]"
      :class="{ 'is-top': isTop }"
      :style="hostStyle"
      role="region"
      :aria-label="label"
      aria-live="polite"
      tabindex="-1"
      @pointerenter="pause"
      @pointerleave="resume"
      @focusin="pause"
      @focusout="resume"
    >
      <TransitionGroup name="mi-toaster" tag="ul" class="mi-toaster-list mi:[list-style:none] mi:m-0 mi:p-0 mi:flex mi:flex-col mi:gap-2.5 mi:relative">
        <li v-for="t in list" :key="t.id" class="mi-toaster-item mi:flex mi:[justify-content:var(--mi-ta)] mi:pointer-events-none">
          <MiToast class="mi:[.mi-toaster-item>&]:pointer-events-auto"
            :message="t.message"
            :description="t.description"
            :tone="t.tone"
            :variant="t.variant"
            :action-label="t.action?.label"
            :dismissible="t.dismissible"
            @action="act(t.id, t.action?.onClick)"
            @dismiss="dismiss(t.id)"
          />
        </li>
      </TransitionGroup>
    </section>
  </Teleport>
</template>

<style scoped>
.mi-toaster-move{transition:transform var(--mi-dur-3) var(--mi-spring)}
.mi-toaster-enter-active{transition:transform var(--mi-dur-4) var(--mi-spring),opacity var(--mi-dur-2) var(--mi-ease);will-change:transform,opacity}
.mi-toaster-leave-active{transition:transform var(--mi-dur-2) var(--mi-ease),opacity var(--mi-dur-2) var(--mi-ease);position:absolute;left:0;right:0;will-change:transform,opacity}
.mi-toaster-enter-from{opacity:0;transform:translate3d(0,24px,0) scale(.94)}
.mi-toaster-leave-to{opacity:0;transform:translate3d(0,8px,0) scale(.96)}
.is-top .mi-toaster-enter-from{transform:translate3d(0,-24px,0) scale(.94)}
.is-top .mi-toaster-leave-to{transform:translate3d(0,-8px,0) scale(.96)}
</style>
