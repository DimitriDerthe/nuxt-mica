# MiTabBar

Tab switcher: a bottom tab bar with icons (variant "bar") or a floating pill (variant "capsule"); v-model is the selected item id.

Group: Navigation. Source: app/components/Navigation/MiTabBar.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | { id: string; label: string; icon?: MiNavIconName; badge?: string \| number }[] |  | Tabs to show; the selected id is the v-model. |
| variant | "capsule" \| "bar" | "bar" | `bar` is the bottom tab bar with icons, `capsule` the floating pill. |
| ariaLabel | string | "Tab bar" | Accessible name of the tab bar. |
| modelValue | string |  | Id of the selected tab. |

## Emits

- update:modelValue [value: string | undefined]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiNavIconName = 'home' | 'inbox' | 'folder' | 'calendar' | 'document' | 'search' | 'photo' | 'person' | 'back' | 'forward' | 'chevron-right' | 'sidebar' | 'grid' | 'list' | 'share' | 'plus' | 'check' | 'settings' | 'people' | 'billing'
```
