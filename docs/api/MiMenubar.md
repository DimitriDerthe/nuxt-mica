# MiMenubar

Horizontal application menu bar (File, Edit, View...) whose entries open MiMenu dropdowns; once one is open, hovering another trigger switches to it; Left/Right/Home/End move between menus.

Group: Navigation. Source: app/components/Navigation/MiMenubar.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| menus* | { id: string; label: string; items: MiMenuItem[]; disabled?: boolean }[] |  | Top-level menus, each with its dropdown items. |
| ariaLabel | string | "Menu bar" | Accessible name of the bar. |

## Emits

- select [menuId: string, item: MiMenuItem]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiMenuItem { /** Unique value. Required for actionable items. */ value?: string | number; label?: string; /** Keyboard shortcut hint, display only. */ shortcut?: string; disabled?: boolean; destructive?: boolean; /** Renders the item as a checkbox-like item. */ checked?: boolean; /** Renders a divider. */ separator?: boolean; /** Renders a non-interactive group heading. */ heading?: string }
```
