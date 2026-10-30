# MiToolbar

Window-style toolbar with sidebar toggle, history, title, view switcher, search, share and primary action.

Group: Navigation. Source: app/components/Navigation/MiToolbar.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| title | string |  | Window title shown in the middle of the bar. |
| subtitle | string |  | Smaller line under the title, for example an item count. |
| sidebarToggle | boolean | true | Show the sidebar toggle button. |
| history | boolean | true | Show back / forward buttons. |
| canGoBack | boolean | true | Enables the Back button. Only applies when history is true. |
| canGoForward | boolean | false | Enables the Forward button. Only applies when history is true. |
| views | MiToolbarView[] |  | View switcher (segmented radio group). |
| searchable | boolean |  | Shows a search field in the bar; its text is the `search` model. |
| searchPlaceholder | string | "Search" | Hint text of the search field. |
| share | boolean | true | Show the share button (emits share). Ignored when the default slot is used. |
| primaryLabel | string |  | Label of the primary action. Omit to hide it. |
| avatar | string |  | Initials in the trailing avatar. Omit to hide it. |
| ariaLabel | string | "Window toolbar" | Accessible name of the toolbar. |
| view | string |  | Value of the selected view in the view switcher. |
| search | string | "" | Text of the search field (only with `searchable`). |

## Slots

- leading: Replaces the sidebar toggle and history buttons.
- title: Replaces the title and subtitle.
- default: Replaces the share button; place extra trailing actions here.

## Emits

- search [value: string]
- primary []
- share []
- update:view [value: string | undefined]
- back []
- forward []
- update:search [value: string]
- toggle-sidebar []

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiToolbarView { id: string; label: string; icon: MiNavIconName }
type MiNavIconName = 'home' | 'inbox' | 'folder' | 'calendar' | 'document' | 'search' | 'photo' | 'person' | 'back' | 'forward' | 'chevron-right' | 'sidebar' | 'grid' | 'list' | 'share' | 'plus' | 'check' | 'settings' | 'people' | 'billing'
```
