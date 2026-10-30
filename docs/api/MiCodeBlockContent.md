# MiCodeBlockContent

Scrollable code body; give it a string (split into lines) or MiCodeBlockLine children.

Group: Ai. Source: app/components/Ai/MiCodeBlockContent.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| wrap | boolean |  | Wrap long lines instead of scrolling. |
| lineNumbers | boolean |  | Show line numbers (copy-safe, via CSS counters). |

## Slots

- default: Code as plain text, split into lines, or MiCodeBlockLine elements for per-line emphasis.
