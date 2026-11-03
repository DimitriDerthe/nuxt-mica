<script setup lang="ts">
/** Code, terminal output and diff display with optional header, line numbers and copy button; compose MiCodeBlock* parts or pass `code`. */
import MiCodeBlockHeader from './MiCodeBlockHeader.vue'
import MiCodeBlockTitle from './MiCodeBlockTitle.vue'
import MiCodeBlockActions from './MiCodeBlockActions.vue'
import MiCodeBlockCopyButton from './MiCodeBlockCopyButton.vue'
import MiCodeBlockContent from './MiCodeBlockContent.vue'

withDefaults(defineProps<{
  /** Shortcut: source text, rendered when no default slot is given. */
  code?: string
  /** Shortcut: header title. */
  filename?: string
  /** Shortcut: header title when there is no filename. */
  language?: string
  /** Shortcut: show line numbers. */
  lineNumbers?: boolean
  /** Shortcut: show the copy button. */
  copyable?: boolean
  /** Compact size for tool output. */
  size?: 'default' | 'sm'
  /** Destructive tints the block for errors. */
  variant?: 'default' | 'destructive'
}>(), { code: '', lineNumbers: true, copyable: true, size: 'default', variant: 'default' })

defineSlots<{
  /** Custom block layout; replaces the built-in header and content built from the shortcut props. */
  default?(): unknown
  /** Pre-highlighted code markup (for example from a syntax highlighter) shown instead of the plain text. */
  highlighted?(props: { code: string }): unknown
}>()
</script>

<template>
  <figure class="mi-cb mi:[--mi-cb-tint:var(--mi-p-tint)] mi:[--mi-cb-fg:var(--mi-p-text)] mi:relative mi:overflow-hidden mi:[&.is-destructive]:[--mi-cb-tint:var(--mi-s-tint)] mi:[&.is-destructive]:[--mi-cb-fg:var(--mi-s-text)]" :class="[`is-${size}`, `is-${variant}`]">
    <slot>
      <MiCodeBlockHeader v-if="filename || language || copyable">
        <MiCodeBlockTitle>{{ filename || language }}</MiCodeBlockTitle>
        <MiCodeBlockActions><MiCodeBlockCopyButton v-if="copyable" :value="code" /></MiCodeBlockActions>
      </MiCodeBlockHeader>
      <MiCodeBlockContent :line-numbers="lineNumbers">
        <slot name="highlighted" :code="code">{{ code }}</slot>
      </MiCodeBlockContent>
    </slot>
  </figure>
</template>

<style scoped>
.mi-cb { margin: 0; border-radius: 12px; background: var(--mi-card); box-shadow: var(--mi-sh2); font-family: var(--mi-font); color: var(--mi-label); }
.mi-cb.is-sm { font-size: 12px; }
.mi-cb :deep(.mi-cb__head) { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px 6px 14px; background: var(--mi-cb-tint); font-size: 12px; }
.mi-cb :deep(.mi-cb__name) { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mi-cb :deep(.mi-cb__actions) { display: flex; align-items: center; gap: 2px; margin-left: auto; }
.mi-cb :deep(.mi-cb__copy), .mi-cb :deep(.mi-cb__btn) { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border: 0; border-radius: 6px; background: transparent; color: var(--mi-cb-fg); font: inherit; cursor: pointer; }
.mi-cb :deep(.mi-cb__copy:hover), .mi-cb :deep(.mi-cb__btn:hover) { background: var(--mi-p-tint2); }
.mi-cb :deep(.mi-cb__copy:focus-visible), .mi-cb :deep(.mi-cb__btn:focus-visible), .mi-cb :deep(.mi-cb__content:focus-visible) { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.mi-cb :deep(.mi-cb__content) { margin: 0; padding: 12px 0; overflow-x: auto; max-height: inherit; font: 13px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; counter-reset: mi-ln; direction: ltr; }
.mi-cb.is-sm :deep(.mi-cb__content) { font-size: 12px; padding: 8px 0; }
.mi-cb :deep(.mi-cb__content.is-wrap .mi-cb__line) { white-space: pre-wrap; overflow-wrap: anywhere; }
.mi-cb :deep(.mi-cb__line) { display: block; padding: 0 14px; white-space: pre; counter-increment: mi-ln; min-height: 1.6em; }
.mi-cb :deep(.mi-cb__content.has-ln .mi-cb__line::before) { content: counter(mi-ln); display: inline-block; width: 2.5ch; margin-right: 14px; text-align: right; opacity: .4; user-select: none; font-variant-numeric: tabular-nums; }
.mi-cb :deep(.mi-cb__line.is-highlighted) { background: var(--mi-p-tint); }
.mi-cb :deep(.mi-cb__line.is-added) { background: var(--mi-p-tint2); }
.mi-cb :deep(.mi-cb__line.is-removed) { background: var(--mi-s-tint); opacity: .85; }
.mi-cb :deep(.mi-cb__foot) { padding: 6px 14px; font-size: 12px; background: var(--mi-cb-tint); }
</style>
