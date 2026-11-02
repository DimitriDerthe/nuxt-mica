# MiScrollspy

"On this page" outline: anchor links for page sections that highlight the one in view (scrollspy), with a sliding indicator and smooth scrolling on click; v-model:active is the active section id.

Group: Navigation. Source: app/components/Navigation/MiScrollspy.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | { id: string; label: string; level?: number }[] |  | Sections to link to: the element `id`, the link text and an optional nesting level (1 = top level, 2 = indented...). |
| offset | number | 80 | Height in px of a fixed header to keep clear when scrolling and when deciding which section is active. |
| rootMargin | string |  | Custom IntersectionObserver rootMargin, overriding the one derived from `offset`. |
| ariaLabel | string | "On this page" | Accessible name of the navigation. |
| active | string |  | Id of the active section. Follows the scroll position and is set immediately when a link is clicked. |

## Emits

- update:active [value: string | undefined]
