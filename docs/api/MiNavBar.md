# MiNavBar

iOS-style sticky header with a back link, a trailing action and an optional large title that collapses into the bar on scroll.

Group: Navigation. Source: app/components/Navigation/MiNavBar.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| title* | string |  | Page title shown centered in the bar and, when `large`, as the big heading below. |
| backLabel | string |  | Text of the back link (emits back). Ignored when the leading slot is provided. |
| actionLabel | string |  | Trailing button label (emits action). Ignored when the trailing slot is used. |
| large | boolean | true | Show the large title that collapses into the bar while scrolling. |
| target | null \| string \| HTMLElement |  | Scroll container: element or CSS selector. Defaults to the nearest scrollable ancestor, then the window. |
| collapsed | boolean | false | True once the large title has fully collapsed. |

## Slots

- leading: Replaces the back link.
- trailing: Replaces the trailing action button.
- title: Replaces the large title content.

## Emits

- action []
- update:collapsed [value: boolean]
- back []
