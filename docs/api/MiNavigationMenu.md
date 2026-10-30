# MiNavigationMenu

Top navigation bar whose entries are plain links or triggers for flyout panels of titled links, opened on hover or click and shown in a shared viewport; v-model is the open item id.

Group: Navigation. Source: app/components/Navigation/MiNavigationMenu.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | { id: string; label: string; href?: string; links?: MiNavigationLink[] }[] |  | Entries: with `links` they open a flyout, otherwise they are plain links to `href`. |
| ariaLabel | string | "Main" | Accessible name of the navigation. |
| viewport | boolean | true | Show every flyout in one shared panel under the bar (true) or anchored under its own trigger (false). |
| hover | boolean | true | Open flyouts on pointer hover as well as on click. |
| closeDelay | number | 150 | Close delay in ms after the pointer leaves. |
| modelValue | string |  | Value of the open menu item, empty when all are closed. |

## Emits

- update:modelValue [value: string | undefined]
- navigate [link: MiNavigationLink]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiNavigationLink { title: string; description?: string; href: string }
```
