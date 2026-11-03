<script setup lang="ts">
/** Chat bubble: a framed message surface with variants, start/end alignment, optional link/button content and a reactions row. */
import { computed } from 'vue'
import { miSafeHref } from '../../utils/miSafe'

export type MiBubbleVariant = 'default' | 'secondary' | 'muted' | 'tinted' | 'outline' | 'ghost' | 'destructive'

const props = withDefaults(defineProps<{
  /** Visual style. `default` is the strong primary bubble (current user), `ghost` is unframed and full width. */
  variant?: MiBubbleVariant
  /** Side of the conversation the bubble sits on. */
  align?: 'start' | 'end'
  /** Render the content as `a` (with `href`) or `button` for a clickable bubble. */
  as?: 'div' | 'a' | 'button'
  /** Link target when `as="a"`. */
  href?: string
  /** Reactions row position (vertical). Only used when the `reactions` slot is set. */
  reactionsSide?: 'top' | 'bottom'
  /** Reactions row alignment. */
  reactionsAlign?: 'start' | 'end'
}>(), { variant: 'default', align: 'start', as: 'div', reactionsSide: 'bottom', reactionsAlign: 'end' })

// `as` is a union at type level only; anything else renders the default div.
const as = computed(() => (['div', 'a', 'button'].includes(props.as) ? props.as : 'div'))
const tag = computed(() => (props.href && as.value === 'div' ? 'a' : as.value))
const attrs = computed(() => (tag.value === 'a' ? { href: miSafeHref(props.href) } : tag.value === 'button' ? { type: 'button' } : {}))

defineSlots<{
  /** Message content shown inside the bubble. */
  default?(): unknown
  /** Reactions row (for example emoji chips) placed above or below the bubble. */
  reactions?(): unknown
}>()
</script>

<template>
  <div class="mi-bub mi:[--_bg:var(--mi-p)] mi:[--_fg:var(--mi-p-on)] mi:[--_bd:transparent] mi:relative mi:flex-col mi:font-mi" :class="[`mi-bub--${variant}`, `mi-bub--${align}`, { 'mi-bub--rx-top': reactionsSide === 'top', 'mi-bub--rx-end': reactionsAlign === 'end' }]">
    <component :is="tag" v-bind="attrs" class="mi-bub__c" :class="{ 'mi-bub__c--act': tag !== 'div' }"><slot /></component>
    <div v-if="$slots.reactions" class="mi-bub__rx mi:flex mi:gap-0.5 mi:[margin-block-start:-8px] mi:py-0.5 mi:px-1.5 mi:rounded-[999px] mi:[background:var(--mi-card)] mi:border mi:border-sep2 mi:text-[13px] mi:leading-[1.2] mi:z-1 mi:[.mi-bub--rx-top_&]:-order-1 mi:[.mi-bub--rx-top_&]:my-[0_-8px] mi:[.mi-bub:not(.mi-bub--rx-end)_&]:[align-self:flex-start] mi:[.mi-bub--rx-end_&]:[align-self:flex-end]"><slot name="reactions" /></div>
  </div>
</template>

<style scoped>
.mi-bub{display:flex;max-width:min(80%,34rem)}
.mi-bub--start{align-self:flex-start;align-items:flex-start}
.mi-bub--end{align-self:flex-end;align-items:flex-end}
.mi-bub__c{display:block;box-sizing:border-box;padding:8px 14px;border:1px solid var(--_bd);border-radius:18px;background:var(--_bg);color:var(--_fg);font:inherit;font-size:15px;line-height:1.4;text-align:start;text-decoration:none;overflow-wrap:anywhere;white-space:pre-wrap}
.mi-bub--start .mi-bub__c{border-end-start-radius:6px}
.mi-bub--end .mi-bub__c{border-end-end-radius:6px}
.mi-bub__c--act{cursor:pointer;transition:opacity var(--mi-dur-2) var(--mi-ease),transform var(--mi-dur-2) var(--mi-ease)}
.mi-bub__c--act:hover{opacity:.88}
.mi-bub__c--act:active{transform:scale(.98)}
.mi-bub__c--act:focus-visible{outline:2px solid var(--mi-p);outline-offset:2px}
.mi-bub--secondary{--_bg:var(--mi-fill2);--_fg:var(--mi-label)}
.mi-bub--muted{--_bg:var(--mi-fill4);--_fg:var(--mi-label2)}
.mi-bub--tinted{--_bg:var(--mi-p-tint);--_fg:var(--mi-p-text)}
.mi-bub--outline{--_bg:transparent;--_fg:var(--mi-label);--_bd:var(--mi-sep2)}
.mi-bub--ghost{--_bg:transparent;--_fg:var(--mi-label);max-width:100%;align-self:stretch}
.mi-bub--ghost .mi-bub__c{padding-inline:0;border-radius:0}
.mi-bub--destructive{--_bg:var(--mi-red);--_fg:#fff}
</style>
