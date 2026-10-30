# MiScrollArea

Scrollable region with slim overlay scrollbars styled by tokens; the thumbs move with transform only.

Group: Content. Source: app/components/Content/MiScrollArea.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| orientation | "horizontal" \| "vertical" \| "both" | "vertical" | Which scrollbars to offer. |
| maxHeight | string |  | CSS max-height of the viewport, e.g. `240px`. |
| label | string | "Scrollable area" | Accessible name of the scroll region. |

## Slots

- default: Scrollable content.

## Exposed (template ref)

- update: () => void
- el: HTMLElement | undefined
