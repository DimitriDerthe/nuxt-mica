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
        class="mi-ai__t"
        data-mi-acc-trigger
        :aria-expanded="open"
        :aria-controls="`${id}-panel`"
        :disabled="disabled"
        @click="toggle"
      >
        <span class="mi-ai__title"><slot name="title">{{ title }}</slot></span>
        <svg class="mi-ai__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </component>
    <div
      :id="`${id}-panel`"
      ref="panel"
      class="mi-ai__p"
      role="region"
      :aria-labelledby="`${id}-trigger`"
      :inert="!open"
    >
      <div class="mi-ai__clip">
        <div class="mi-ai__body"><slot /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mi-ai + .mi-ai{border-top:.5px solid var(--mi-sep)}
.mi-ai__h{margin:0;font:inherit}
.mi-ai__t{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;min-height:56px;padding:0;border:0;background:transparent;color:var(--mi-label);font-family:var(--mi-font);font-size:17px;font-weight:600;text-align:left;cursor:pointer}
.mi-ai__t:disabled{cursor:default;opacity:.5}
.mi-ai__chev{flex:none;color:var(--mi-p-text);transition:transform var(--mi-dur-2) var(--mi-ease)}
.mi-ai--open .mi-ai__chev{transform:rotate(90deg)}
.mi-ai__p{display:grid;grid-template-rows:0fr;visibility:hidden;transition:visibility 0s linear var(--mi-dur-3)}
.mi-ai--open > .mi-ai__p{grid-template-rows:1fr;visibility:visible;transition-delay:0s}
.mi-ai__clip{min-height:0;overflow:hidden}
.mi-ai__body{margin-top:-4px;padding:0 32px 18px 0;font-family:var(--mi-font);font-size:15px;line-height:22px;color:var(--mi-label2);opacity:0;transform:translate3d(0,-6px,0);transition:opacity var(--mi-dur-2) linear,transform var(--mi-dur-3) var(--mi-ease)}
.mi-ai--open .mi-ai__body{opacity:1;transform:none}
</style>
