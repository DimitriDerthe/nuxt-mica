# MiText

Text with the system-style type scale (largeTitle to caption2), semantic tag, tone and optional line clamp; use it for all copy.

Group: Base. Source: app/components/Base/MiText.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "body" \| "largeTitle" \| "title1" \| "title2" \| "title3" \| "headline" \| "callout" \| "subheadline" \| "footnote" \| "caption" \| "caption2" | "body" | Type scale step that sets size, line height, default weight and default element. |
| as | string |  | Element to render. Defaults to a heading for titles and `p` otherwise. |
| tone | "label" \| "primary" \| "secondary" \| "inherit" \| "label2" \| "label3" \| "red" \| "orange" \| "green" | "inherit" | `primary`/`secondary` are the BRAND colors; for muted body text use `label2` (or `label3` for hints). |
| weight | "bold" \| "regular" \| "medium" \| "semibold" |  | Overrides the variant's default font weight. |
| align | "start" \| "center" \| "end" |  | Horizontal text alignment, flipping with the reading direction. |
| lines | number |  | Clamp to this many lines with an ellipsis (1 = single-line truncation). |
| tabular | boolean |  | Tabular (fixed-width) numerals, for aligned figures and counters. |
| balance | boolean |  | Balance line lengths when wrapping (text-wrap: balance), for short headings. |

## Slots

- default: Text content.
