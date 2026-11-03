<script setup lang="ts">
/** Infinite scrolling strip for logos or short text: the content is repeated into a seamless track moved with a transform-only CSS animation, with edge fade, pause on hover and reduced-motion support. */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

defineSlots<{
  /** The items to scroll (logos, badges, short text). Rendered more than once to fill the track; repeats are hidden from assistive tech. */
  default?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Scrolling speed in px per second. */
  speed?: number
  /** Travel direction. `left`/`up` and `right`/`down` are equivalent per axis. */
  direction?: 'left' | 'right' | 'up' | 'down'
  /** Pause the animation while hovered or while something inside has keyboard focus. */
  pauseOnHover?: boolean
  /** Space between items in px. */
  gap?: number
  /** Scroll vertically instead of horizontally. Give the component a height (default 16rem). */
  vertical?: boolean
  /** Fade the strip out at both ends. */
  fade?: boolean
  /** Accessible name of the region. */
  ariaLabel?: string
}>(), { speed: 40, direction: 'left', pauseOnHover: true, gap: 32, fade: true })

const root = ref<HTMLElement | null>(null)
const copies = ref(1)
const size = ref(0)
let ro: ResizeObserver | undefined

const reverse = computed(() => props.direction === 'right' || props.direction === 'down')
const duration = computed(() => (size.value > 0 && props.speed > 0 ? (size.value * copies.value) / props.speed : 30))

function measure() {
  const r = root.value
  const u = r?.querySelector<HTMLElement>('.mi-mq__unit')
  if (!r || !u) return
  const one = (props.vertical ? u.offsetHeight : u.offsetWidth) + props.gap
  const box = props.vertical ? r.clientHeight : r.clientWidth
  if (one <= props.gap) return
  size.value = one
  copies.value = Math.max(1, Math.ceil(box / one))
}
onMounted(() => {
  measure()
  if (typeof ResizeObserver === 'undefined') return
  ro = new ResizeObserver(measure)
  if (root.value) ro.observe(root.value)
  const u = root.value?.querySelector('.mi-mq__unit')
  if (u) ro.observe(u)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="mi-mq mi:relative mi:overflow-hidden mi:font-mi mi:text-label2 mi:min-w-0 mi:[&.is-vertical]:h-[16rem] mi:motion-reduce:overflow-auto"
    :class="{ 'is-vertical': vertical, 'is-fade': fade, 'is-pause': pauseOnHover, 'is-reverse': reverse }"
    :role="ariaLabel ? 'region' : undefined"
    :aria-label="ariaLabel"
    :style="{ '--mi-mq-gap': `${gap}px`, '--mi-mq-d': `${duration}s` }"
  >
    <div class="mi-mq__track mi:flex mi:w-max mi:[.is-vertical_&]:flex-col mi:[.is-vertical_&]:w-auto mi:[.is-pause:hover_&]:[animation-play-state:paused] mi:[.is-pause:focus-within_&]:[animation-play-state:paused]">
      <div class="mi-mq__group mi:flex mi:flex-[none] mi:items-center mi:[.is-vertical_&]:flex-col">
        <div v-for="n in copies" :key="n" class="mi-mq__unit mi:flex mi:flex-[none] mi:items-center mi:gap-(--mi-mq-gap) mi:pr-(--mi-mq-gap) mi:[.is-vertical_&]:flex-col mi:[.is-vertical_&]:pt-0 mi:[.is-vertical_&]:px-0 mi:[.is-vertical_&]:pb-(--mi-mq-gap)" :aria-hidden="n > 1 ? 'true' : undefined"><slot /></div>
      </div>
      <div class="mi-mq__group mi-mq__clone mi:flex mi:flex-[none] mi:items-center mi:[.is-vertical_&]:flex-col mi:motion-reduce:hidden" aria-hidden="true">
        <div v-for="n in copies" :key="n" class="mi-mq__unit mi:flex mi:flex-[none] mi:items-center mi:gap-(--mi-mq-gap) mi:pr-(--mi-mq-gap) mi:[.is-vertical_&]:flex-col mi:[.is-vertical_&]:pt-0 mi:[.is-vertical_&]:px-0 mi:[.is-vertical_&]:pb-(--mi-mq-gap)"><slot /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mi-mq.is-fade{-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
.mi-mq.is-fade.is-vertical{-webkit-mask-image:linear-gradient(180deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(180deg,transparent,#000 12%,#000 88%,transparent)}
.mi-mq__track{animation:mi-mq-x var(--mi-mq-d) linear infinite}
.is-vertical .mi-mq__track{animation-name:mi-mq-y}
.is-reverse .mi-mq__track{animation-direction:reverse}
@keyframes mi-mq-x{to{transform:translate3d(-50%,0,0)}}
@keyframes mi-mq-y{to{transform:translate3d(0,-50%,0)}}
@media (prefers-reduced-motion:reduce){
  .mi-mq__track{animation:none}
}
</style>
