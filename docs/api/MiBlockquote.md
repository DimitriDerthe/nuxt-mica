# MiBlockquote

Quotation as a semantic figure with blockquote and figcaption, with an optional author, role, avatar and source link; plain, bordered or card look.

Group: Base. Source: app/components/Base/MiBlockquote.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "plain" \| "bordered" \| "card" | "plain" | Look: `plain` has just the text, `bordered` adds a brand rule on the leading edge, `card` puts it on an elevated surface with a large quote mark. |
| quote | string |  | Quoted text, as a shortcut for the default slot. |
| cite | string |  | Author of the quote, shown in the caption. |
| role | string |  | Secondary caption line, e.g. job title or publication. |
| source | string |  | URL of the source, set as the `cite` attribute of the blockquote. |
| size | "lg" \| "md" | "md" | Text size. |

## Slots

- default: The quoted text (when `quote` is not used).
- cite: Replaces the author block in the caption.
- avatar: Avatar or logo shown beside the author.
