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
  <ol ref="root" class="mi-st" :class="`is-${orientation}`" :style="{ '--mi-st-n': steps.length }" :aria-label="ariaLabel" @keydown="onKey">
    <li v-for="(s, i) in steps" :key="i" class="mi-st__item" :class="`is-${state(i)}`">
      <span class="mi-st__rail">
        <component
          :is="clickable ? 'button' : 'span'" class="mi-st__dot" v-bind="clickable ? { type: 'button', 'aria-label': `Go to step ${i + 1}` } : {}"
          :aria-current="i === model ? 'step' : undefined" @click="pick(i)"
        >
          <span class="mi-st__fill" />
          <span class="mi-st__mark" aria-hidden="true">
            <MiNavGlyph v-if="state(i) === 'done'" name="check" :size="14" :stroke="3" />
            <template v-else>{{ i + 1 }}</template>
          </span>
        </component>
        <span v-if="i < steps.length - 1" class="mi-st__line"><span class="mi-st__line-fill" /></span>
      </span>
      <span class="mi-st__text">
        <span v-if="orientation === 'horizontal'" class="mi-st__count" aria-hidden="true">Step {{ i + 1 }} of {{ steps.length }}</span>
        <span class="mi-st__label">{{ s.label }}</span>
        <span v-if="s.description" class="mi-st__sub">{{ s.description }}</span>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.mi-st{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;font-family:var(--mi-font)}
.mi-st__item{display:flex;gap:14px}
.mi-st__rail{display:flex;flex-direction:column;align-items:center}
.mi-st__dot{position:relative;width:28px;height:28px;flex:none;border:0;padding:0;border-radius:50%;background:transparent;color:var(--mi-label2);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1.5px var(--mi-ctl,var(--mi-label3));isolation:isolate;transition:transform var(--mi-dur-1) var(--mi-ease)}
span.mi-st__dot{cursor:default}
.mi-st__dot:active{transform:scale(.92)}
.mi-st__fill{position:absolute;inset:0;border-radius:50%;z-index:-1;opacity:0;transform:scale(.6);background:var(--mi-p);transition:opacity var(--mi-dur-2) var(--mi-ease),transform var(--mi-dur-3) var(--mi-spring)}
.mi-st__mark{display:flex;align-items:center;justify-content:center}
.is-current .mi-st__dot{color:var(--mi-p-text);box-shadow:inset 0 0 0 2px var(--mi-p)}
.is-current .mi-st__fill{opacity:1;transform:scale(1);background:var(--mi-p-tint)}
.is-done .mi-st__dot{color:var(--mi-p-on);box-shadow:none}
.is-done .mi-st__fill{opacity:1;transform:scale(1)}
.mi-st__line{position:relative;width:2px;flex:1;min-height:22px;background:var(--mi-sep2);overflow:hidden;border-radius:1px}
.mi-st__line-fill{position:absolute;inset:0;background:var(--mi-p);transform:scaleY(0);transform-origin:top;transition:transform var(--mi-dur-3) var(--mi-ease)}
.is-done .mi-st__line-fill{transform:scaleY(1)}
.mi-st__text{display:flex;flex-direction:column;padding:3px 0 18px}
.mi-st__label{font-size:15px;font-weight:600;color:var(--mi-label)}
.is-todo .mi-st__label{color:var(--mi-label2)}
.mi-st__sub{font-size:13px;color:var(--mi-label2)}
.mi-st__count{display:none}
.mi-st__item:last-child .mi-st__text{padding-bottom:3px}
/* Horizontal steps size to their container: descriptions drop under 560px; under 380px one caption under the bar names the current step. */
.is-horizontal{position:relative;flex-direction:row;gap:0;container-type:inline-size}
.is-horizontal .mi-st__item{flex:1;flex-direction:column;gap:10px;min-width:0}
.is-horizontal .mi-st__item:last-child{flex:0 1 auto;max-width:calc(100% / var(--mi-st-n))}
.is-horizontal .mi-st__label,.is-horizontal .mi-st__sub{overflow-wrap:break-word;padding-right:8px}
.is-horizontal .mi-st__rail{flex-direction:row;align-items:center}
.is-horizontal .mi-st__line{width:auto;height:2px;min-height:0;flex:1;margin:0 8px}
.is-horizontal .mi-st__line-fill{transform:scaleX(0);transform-origin:left}
.is-horizontal .is-done .mi-st__line-fill,.is-horizontal .mi-st__item.is-done .mi-st__line-fill{transform:scaleX(1)}
.is-horizontal .mi-st__text{padding:0;min-width:0}
@container (max-width:560px){
  .is-horizontal .mi-st__sub{display:none}
  .is-horizontal .mi-st__label{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
}
@container (max-width:380px){
  .is-horizontal .mi-st__item{padding-bottom:30px}
  .is-horizontal .mi-st__item:not(.is-current) .mi-st__text{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
  .is-horizontal .mi-st__item.is-current .mi-st__text{position:absolute;left:0;right:0;bottom:0;flex-direction:row;align-items:baseline;gap:8px}
  .is-horizontal .mi-st__count{display:block;flex:none;font-size:13px;color:var(--mi-label2)}
}
.mi-st__dot:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
</style>
