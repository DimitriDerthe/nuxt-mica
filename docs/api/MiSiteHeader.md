# MiSiteHeader

Marketing site header: logo, primary links (with dropdowns), actions and a mobile burger that opens an inline panel; collapses under 820px of its own width, optionally sticky.

Group: Navigation. Source: app/components/Navigation/MiSiteHeader.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| links | MiSiteLink[] | [] | Primary navigation entries. |
| sticky | boolean |  | Keep the header fixed at the top of the viewport while scrolling, on a translucent blurred surface. |
| ariaLabel | string | "Main" | Accessible name of the main navigation. |
| open | boolean | false | Whether the mobile panel is open. |

## Slots

- logo: Brand area on the left, usually a logo wrapped in a link.
- actions: Call-to-action buttons on the right; also repeated at the bottom of the mobile panel.
- link `{ link: MiSiteLink; class: string }`: Custom link renderer, e.g. to output NuxtLink. Receives the link and its CSS class.

## Emits

- update:open [value: boolean]
- navigate [link: MiSiteLink]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiSiteLink { label: string; /** Destination URL. */ href?: string; /** Route path; rendered as a plain anchor unless you provide the `link` slot. */ to?: string; /** Marks the current page. */ active?: boolean; /** Sub-links, shown as a dropdown on desktop and as a nested list in the mobile panel. */ children?: MiSiteLink[] }
```
