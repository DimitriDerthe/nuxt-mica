# MiCard

Surface card with optional media, title, description and header/footer slots. Use for content tiles; `href` or `to` makes it a link.

Group: Content. Source: app/components/Content/MiCard.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "filled" \| "elevated" \| "outlined" | "elevated" | `elevated`: soft shadow. `outlined`: hairline border. `filled`: tinted fill, no shadow. |
| padding | "lg" \| "none" \| "auto" | "auto" | Body padding. `auto` uses the compact media layout when a media slot or image exists. |
| align | "start" \| "center" | "start" | `center` centers the body text and footer content. |
| image | string |  | Cover image URL, rendered full-bleed on top. |
| imageAlt | string |  | Alt text for `image`. |
| mediaHeight | number | 168 | Height of the media area in px. |
| eyebrow | string |  | Small uppercase line above the title. |
| title | string |  | Heading of the card. |
| description | string |  | Supporting paragraph under the title. |
| headingLevel | 2 \| 3 \| 4 \| 5 \| 6 | 3 | Heading level for the title. |
| href | string |  | Renders the whole card as a link. |
| to | string |  | Router link target (NuxtLink). Takes precedence over `href`. |

## Slots

- media: Custom media area replacing the `image`; shown full-bleed on top.
- header: Extra content above the eyebrow and title, e.g. badges.
- default: Main body content below the text.
- footer: Footer pinned to the bottom of the card, e.g. actions.
