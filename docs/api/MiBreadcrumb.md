# MiBreadcrumb

Breadcrumb trail or Finder-style path bar (variant "path"); the last item is the current page and is not a link.

Group: Navigation. Source: app/components/Navigation/MiBreadcrumb.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | { label: string; href?: string; icon?: boolean }[] |  | Trail from root to current page; the last item is shown as the current page. |
| variant | "breadcrumb" \| "path" | "breadcrumb" | `breadcrumb` is the linked trail, `path` the Finder style path control. |
| ariaLabel | string | "Breadcrumb" | Accessible name of the navigation landmark. |

## Emits

- navigate [item: MiBreadcrumbItem, index: number]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiBreadcrumbItem { label: string; href?: string; icon?: boolean }
```
