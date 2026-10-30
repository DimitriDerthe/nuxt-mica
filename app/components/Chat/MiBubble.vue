<script setup lang="ts">
/** Chat bubble: a framed message surface with variants, start/end alignment, optional link/button content and a reactions row. */
import { computed } from 'vue'

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

const tag = computed(() => (props.href && props.as === 'div' ? 'a' : props.as))
const attrs = computed(() => (tag.value === 'a' ? { href: props.href } : tag.value === 'button' ? { type: 'button' } : {}))

defineSlots<{
  /** Message content shown inside the bubble. */
  default?(): unknown
  /** Reactions row (for example emoji chips) placed above or below the bubble. */
  reactions?(): unknown
}>()
</script>

<template>
  <div class="mi-bub" :class="[`mi-bub--${variant}`, `mi-bub--${align}`, { 'mi-bub--rx-top': reactionsSide === 'top', 'mi-bub--rx-end': reactionsAlign === 'end' }]">
    <component :is="tag" v-bind="attrs" class="mi-bub__c" :class="{ 'mi-bub__c--act': tag !== 'div' }"><slot /></component>
    <div v-if="$slots.reactions" class="mi-bub__rx"><slot name="reactions" /></div>
  </div>
</template>

<style scoped>
.mi-bub{--_bg:var(--mi-p);--_fg:var(--mi-p-on);--_bd:transparent;position:relative;display:flex;flex-direction:column;max-width:min(80%,34rem);font-family:var(--mi-font)}
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
.mi-bub__rx{display:flex;gap:2px;margin-block-start:-8px;padding:2px 6px;border-radius:999px;background:var(--mi-card);border:1px solid var(--mi-sep2);font-size:13px;line-height:1.2;z-index:1}
.mi-bub--rx-top .mi-bub__rx{order:-1;margin-block:0 -8px}
.mi-bub:not(.mi-bub--rx-end) .mi-bub__rx{align-self:flex-start}
.mi-bub--rx-end .mi-bub__rx{align-self:flex-end}
</style>
