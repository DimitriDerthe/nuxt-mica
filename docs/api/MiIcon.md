# MiIcon

Inline SVG icon from the built-in set or raw SVG markup; decorative (aria-hidden) unless label is set; spin for loaders.

Group: Base. Source: app/components/Base/MiIcon.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| name | "search" \| "image" \| "copy" \| "widgets" \| "home" \| "folder" \| "folder-compact" \| "folder-plus" \| "tray" \| "calendar" \| "people" \| "settings" \| "billing" \| "grid" \| "list-bullet" \| "list-dots" \| "bell" \| "plus" \| "minus" \| "dash" \| "star" \| "bookmark" \| "share" \| "sliders" \| "chevron-right" \| "chevron-left" \| "chevron-down" \| "chevron-up" \| "chevron-up-down" \| "trash" \| "heart" \| "close" \| "more" \| "sidebar" \| "columns" \| "align-left" \| "align-center" \| "align-right" \| "spinner-arc" \| "arc" \| "spinner" \| "arrow-up" \| "arrow-down" \| "arrow-left" \| "arrow-right" \| "moon" \| "sun" \| "desktop" \| "eye" \| "globe" \| "archive" \| "check" \| "person" \| "person-fill" \| "document" \| "wifi" \| "bluetooth" \| "lock" \| "speaker" \| "speaker-wave" \| "pencil" \| "chat" \| "info-circle" \| "check-circle" \| "exclamation-circle" \| "warning" \| "check-circle-fill" \| "x-circle-fill" |  | Name from the built-in set. |
| svg | string |  | Raw inner SVG markup (24x24 grid), injected with v-html and never sanitized: pass only trusted static markup, never user or CMS content (XSS risk). Takes precedence over `name`. |
| size | string \| number | 20 | Width and height: a number in px or a CSS length string (e.g. '1.25em'). |
| weight | string \| number | 1.9 | Stroke width on the 24x24 grid. |
| label | string |  | Accessible name. When omitted the icon is decorative and hidden from assistive tech. |
| filled | boolean |  | Fill the shape with the current color while keeping the outline (SF "fill" variants). |
| spin | boolean |  | Rotate continuously (activity indicators). Transform-only animation. |
