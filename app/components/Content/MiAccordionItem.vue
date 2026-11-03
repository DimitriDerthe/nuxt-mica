<script setup lang="ts">
/** One panel of MiAccordion with its trigger and content. Use inside an accordion; standalone, it toggles on its own. */
import { computed, inject, onMounted, ref, useId, watch } from 'vue'
import { miAccordionKey } from '../../utils/miAccordion'

defineSlots<{
  /** Custom trigger content, replacing the `title` text. */
  title?(): unknown
  /** Panel content shown when the item is open. */
  default?(): unknown
}>()

const props = defineProps<{
  /** Unique value within the accordion. Generated when omitted. */
  value?: string
  /** Text of the trigger button. */
  title?: string
  /** Blocks toggling and removes the panel from arrow-key navigation. */
  disabled?: boolean
}>()

const ctx = inject(miAccordionKey, null)
const uid = useId()
const id = computed(() => props.value ?? uid)
const standalone = ref(false)
const open = computed(() => (ctx ? ctx.isOpen(id.value) : standalone.value))
const level = computed(() => `h${ctx?.headingLevel.value ?? 3}`)
const panel = ref<HTMLElement>()
let ready = false
onMounted(() => { ready = true })

function toggle() {
  if (props.disabled) return
  if (ctx) ctx.toggle(id.value)
  else standalone.value = !standalone.value
}

/* Grid-rows expand/collapse: the track animates once per toggle via WAAPI (no per-frame JS);
   content fades/slides with transform and opacity in CSS. */
watch(open, (v) => {
  const el = panel.value
  if (!ready || !el || typeof el.animate !== 'function') return
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return
  el.animate(
    { gridTemplateRows: v ? ['0fr', '1fr'] : ['1fr', '0fr'] },
    { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }
  )
})
</script>

<template>
  <div class="mi-ai" :class="{ 'mi-ai--open': open, 'mi-ai--dis': disabled }">
    <component :is="level" class="mi-ai__h">
      <button
        :id="`${id}-trigger`"
        type="button"
        class="mi-ai__t mi:flex mi:items-center mi:justify-between mi:gap-4 mi:w-full mi:min-h-14 mi:p-0 mi:[border:0] mi:bg-transparent mi:text-label mi:font-mi mi:text-[17px] mi:font-semibold mi:text-left mi:cursor-pointer mi:disabled:cursor-default mi:disabled:opacity-50"
        data-mi-acc-trigger
        :aria-expanded="open"
        :aria-controls="`${id}-panel`"
        :disabled="disabled"
        @click="toggle"
      >
        <span class="mi-ai__title"><slot name="title">{{ title }}</slot></span>
        <svg class="mi-ai__chev mi:flex-[none] mi:text-p-text mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[.mi-ai--open_&]:transform-[rotate(90deg)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </component>
    <div
      :id="`${id}-panel`"
      ref="panel"
      class="mi-ai__p mi:grid mi:grid-rows-[0fr] mi:invisible mi:[transition:visibility_0s_linear_var(--mi-dur-3)] mi:[.mi-ai--open>&]:grid-rows-[1fr] mi:[.mi-ai--open>&]:visible mi:[.mi-ai--open>&]:delay-[0s]"
      role="region"
      :aria-labelledby="`${id}-trigger`"
      :inert="!open"
    >
      <div class="mi-ai__clip mi:min-h-0 mi:overflow-hidden">
        <div class="mi-ai__body mi:-mt-1 mi:pt-0 mi:pr-8 mi:pb-4.5 mi:pl-0 mi:font-mi mi:text-[15px] mi:leading-[22px] mi:text-label2 mi:opacity-0 mi:transform-[translate3d(0,-6px,0)] mi:[transition:opacity_var(--mi-dur-2)_linear,transform_var(--mi-dur-3)_var(--mi-ease)] mi:[.mi-ai--open_&]:opacity-100 mi:[.mi-ai--open_&]:transform-none"><slot /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mi-ai + .mi-ai{border-top:.5px solid var(--mi-sep)}
.mi-ai__h{margin:0;font:inherit}
</style>
