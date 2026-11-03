<script setup lang="ts">
/** Step progress indicator, vertical or horizontal; v-model is the zero-based current step (earlier steps show as done). */
import { ref } from 'vue'
import MiNavGlyph from './MiNavGlyph.vue'
import { miNavRoving } from '../../utils/miNav'

export interface MiStep { label: string, description?: string }

const props = withDefaults(defineProps<{
  /** Steps in order, each with a label and optional description. */
  steps: MiStep[]
  /** `horizontal` takes its container's full width and condenses its labels when that width is small. */
  orientation?: 'vertical' | 'horizontal'
  /** When false the markers are not interactive. */
  clickable?: boolean
  /** Accessible name of the progress list. */
  ariaLabel?: string
}>(), { orientation: 'vertical', clickable: true, ariaLabel: 'Progress' })

/** Zero-based index of the current step; earlier steps show as done. */

const model = defineModel<number>({ default: 0 })
const root = ref<HTMLElement | null>(null)

const state = (i: number) => (i < model.value ? 'done' : i === model.value ? 'current' : 'todo')
function pick(i: number) { if (props.clickable && i !== model.value) model.value = i }
function onKey(e: KeyboardEvent) {
  miNavRoving(e, root.value, 'button.mi-st__dot', props.orientation === 'vertical' ? 'vertical' : 'horizontal')
}
</script>

<template>
  <ol ref="root" class="mi-st mi:[list-style:none] mi:flex-col mi:font-mi" :class="`is-${orientation}`" :style="{ '--mi-st-n': steps.length }" :aria-label="ariaLabel" @keydown="onKey">
    <li v-for="(s, i) in steps" :key="i" class="mi-st__item mi:flex mi:gap-3.5 mi:[.is-horizontal_&]:flex-1 mi:[.is-horizontal_&]:min-w-0 mi:[.is-horizontal_&:last-child]:flex-[0_1_auto] mi:[.is-horizontal_&:last-child]:max-w-[calc(100%_/_var(--mi-st-n))] mi:@max-[380px]:[.is-horizontal_&]:pb-7.5" :class="`is-${state(i)}`">
      <span class="mi-st__rail mi:flex mi:flex-col mi:items-center mi:[.is-horizontal_&]:flex-row mi:[.is-horizontal_&]:items-center">
        <component
          :is="clickable ? 'button' : 'span'" class="mi-st__dot" v-bind="clickable ? { type: 'button', 'aria-label': `Go to step ${i + 1}` } : {}"
          :aria-current="i === model ? 'step' : undefined" @click="pick(i)"
        >
          <span class="mi-st__fill mi:absolute mi:inset-0 mi:rounded-[50%] mi:-z-1 mi:opacity-0 mi:transform-[scale(.6)] mi:bg-p mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),transform_var(--mi-dur-3)_var(--mi-spring)] mi:[.is-current_&]:opacity-100 mi:[.is-current_&]:transform-[scale(1)] mi:[.is-current_&]:bg-p-tint mi:[.is-done_&]:opacity-100 mi:[.is-done_&]:transform-[scale(1)]" />
          <span class="mi-st__mark mi:flex mi:items-center mi:justify-center" aria-hidden="true">
            <MiNavGlyph v-if="state(i) === 'done'" name="check" :size="14" :stroke="3" />
            <template v-else>{{ i + 1 }}</template>
          </span>
        </component>
        <span v-if="i < steps.length - 1" class="mi-st__line mi:relative mi:w-0.5 mi:flex-1 mi:min-h-5.5 mi:bg-sep2 mi:overflow-hidden mi:rounded-[1px] mi:[.is-horizontal_&]:w-auto mi:[.is-horizontal_&]:h-0.5 mi:[.is-horizontal_&]:min-h-0 mi:[.is-horizontal_&]:flex-1 mi:[.is-horizontal_&]:my-0 mi:[.is-horizontal_&]:mx-2"><span class="mi-st__line-fill mi:absolute mi:inset-0 mi:bg-p mi:transform-[scaleY(0)] mi:origin-top mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)] mi:[.is-done_&]:transform-[scaleY(1)] mi:[.is-horizontal_&]:transform-[scaleX(0)] mi:[.is-horizontal_&]:origin-left mi:[.is-horizontal_.is-done_&]:transform-[scaleX(1)] mi:[.is-horizontal_.mi-st__item.is-done_&]:transform-[scaleX(1)]" /></span>
      </span>
      <span class="mi-st__text mi:flex mi:flex-col mi:pt-[3px] mi:px-0 mi:pb-4.5 mi:[.mi-st__item:last-child_&]:pb-[3px] mi:[.is-horizontal_&]:p-0 mi:[.is-horizontal_&]:min-w-0 mi:@max-[380px]:[.is-horizontal_.mi-st__item:not(.is-current)_&]:w-px mi:@max-[380px]:[.is-horizontal_.mi-st__item:not(.is-current)_&]:h-px mi:@max-[380px]:[.is-horizontal_.mi-st__item:not(.is-current)_&]:overflow-hidden mi:@max-[380px]:[.is-horizontal_.mi-st__item:not(.is-current)_&]:[clip-path:inset(50%)] mi:@max-[380px]:[.is-horizontal_.mi-st__item.is-current_&]:left-0 mi:@max-[380px]:[.is-horizontal_.mi-st__item.is-current_&]:right-0 mi:@max-[380px]:[.is-horizontal_.mi-st__item.is-current_&]:bottom-0 mi:@max-[380px]:[.is-horizontal_.mi-st__item.is-current_&]:flex-row mi:@max-[380px]:[.is-horizontal_.mi-st__item.is-current_&]:items-baseline mi:@max-[380px]:[.is-horizontal_.mi-st__item.is-current_&]:gap-2">
        <span v-if="orientation === 'horizontal'" class="mi-st__count mi:hidden mi:@max-[380px]:[.is-horizontal_&]:block mi:@max-[380px]:[.is-horizontal_&]:flex-[none] mi:@max-[380px]:[.is-horizontal_&]:text-[13px] mi:@max-[380px]:[.is-horizontal_&]:text-label2" aria-hidden="true">Step {{ i + 1 }} of {{ steps.length }}</span>
        <span class="mi-st__label mi:text-[15px] mi:font-semibold mi:text-label mi:[.is-todo_&]:text-label2 mi:[.is-horizontal_&]:break-words mi:[.is-horizontal_&]:pr-2 mi:@max-[560px]:[.is-horizontal_&]:text-[13px] mi:@max-[560px]:[.is-horizontal_&]:whitespace-nowrap mi:@max-[560px]:[.is-horizontal_&]:overflow-hidden mi:@max-[560px]:[.is-horizontal_&]:text-ellipsis">{{ s.label }}</span>
        <span v-if="s.description" class="mi-st__sub mi:text-[13px] mi:text-label2 mi:[.is-horizontal_&]:break-words mi:[.is-horizontal_&]:pr-2 mi:@max-[560px]:[.is-horizontal_&]:hidden">{{ s.description }}</span>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.mi-st{margin:0;padding:0;display:flex}
.mi-st__dot{position:relative;width:28px;height:28px;flex:none;border:0;padding:0;border-radius:50%;background:transparent;color:var(--mi-label2);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1.5px var(--mi-ctl,var(--mi-label3));isolation:isolate;transition:transform var(--mi-dur-1) var(--mi-ease)}
span.mi-st__dot{cursor:default}
.mi-st__dot:active{transform:scale(.92)}
.is-current .mi-st__dot{color:var(--mi-p-text);box-shadow:inset 0 0 0 2px var(--mi-p)}
.is-done .mi-st__dot{color:var(--mi-p-on);box-shadow:none}
/* Horizontal steps size to their container: descriptions drop under 560px; under 380px one caption under the bar names the current step. */
.is-horizontal{position:relative;flex-direction:row;gap:0;container-type:inline-size}
.is-horizontal .mi-st__item{flex-direction:column;gap:10px}
@container (max-width:380px){
  .is-horizontal .mi-st__item:not(.is-current) .mi-st__text{position:absolute}
  .is-horizontal .mi-st__item.is-current .mi-st__text{position:absolute}
}
.mi-st__dot:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
</style>
