# MiSidebar

Vertical sidebar with grouped, optionally collapsible sections, icon/colour/badge rows; v-model is the selected item id.

Group: Navigation. Source: app/components/Navigation/MiSidebar.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| groups* | { id?: string; label?: string; items: MiSidebarItem[]; collapsible?: boolean }[] |  | Sections of rows. A group's id keys its collapsed state and defaults to its index. |
| footerLabel | string |  | Label of the pinned footer action. Omit to hide it. |
| ariaLabel | string | "Sidebar" | Accessible name of the sidebar navigation. |
| modelValue | string |  | Id of the selected item. |
| collapsed | boolean | false | Hidden state: the sidebar slides out with a transform, it never reflows its content. |

## Slots

- footer: Replaces the pinned footer action.

## Emits

- update:modelValue [value: string | undefined]
- select [item: MiSidebarItem]
- footer []
- update:collapsed [value: boolean]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiSidebarItem { id: string; label: string; icon?: MiNavIconName; /** Renders a coloured dot instead of an icon (tags). */ color?: MiSidebarColor; badge?: number | string; href?: string; disabled?: boolean }
type MiNavIconName = 'home' | 'inbox' | 'folder' | 'calendar' | 'document' | 'search' | 'photo' | 'person' | 'back' | 'forward' | 'chevron-right' | 'sidebar' | 'grid' | 'list' | 'share' | 'plus' | 'check' | 'settings' | 'people' | 'billing'
type MiSidebarColor = 'red' | 'orange' | 'yellow' | 'green' | 'mint' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink'
```
