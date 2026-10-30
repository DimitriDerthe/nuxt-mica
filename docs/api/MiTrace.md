# MiTrace

Trace container for reasoning, tool calls and sources; compose MiTraceLine rows or pass a `steps` shortcut.

Group: Ai. Source: app/components/Ai/MiTrace.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| steps | MiTraceStep[] |  | Shortcut steps, rendered when no default slot is given. |
| label | string |  | Accessible name of the list. |

## Slots

- default: Custom trace content built from MiTraceLine and MiTraceCollapsible rows; replaces the rows generated from `steps`.

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiTraceStep { id?: string; title: string; /** Secondary text such as a count or tool name. */ description?: string; status?: 'done' | 'running' | 'error' | 'pending'; /** Duration in milliseconds. */ duration?: number; /** Collapsible detail text. */ detail?: string; /** Start expanded. */ open?: boolean }
```
