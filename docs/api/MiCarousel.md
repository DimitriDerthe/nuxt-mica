# MiCarousel

Scroll-snap carousel with prev/next buttons, dots, optional loop and a v-model slide index. Each direct child of the default slot is one slide.

Group: Content. Source: app/components/Content/MiCarousel.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| loop | boolean | false | Wrap around from the last slide to the first and back. |
| arrows | boolean | true | Show the previous/next buttons. |
| dots | boolean | true | Show the dot indicators. |
| orientation | "horizontal" \| "vertical" | "horizontal" | Scroll axis. |
| align | "start" \| "center" | "start" | Slide alignment inside the viewport (Embla `align`). |
| basis | string | "100%" | CSS flex-basis of each slide, e.g. `50%` or `33.333%` (shadcn `basis-*`). |
| label | string | "Carousel" | Accessible name of the carousel. |
| modelValue | number | 0 | Current slide index (0-based). |

## Slots

- default: The slides, one element per slide.

## Emits

- update:modelValue [value: number]
- select [index: number]

## Exposed (template ref)

- prev: () => void
- next: () => void
- goTo: (i: number, smooth?: boolean) => void
