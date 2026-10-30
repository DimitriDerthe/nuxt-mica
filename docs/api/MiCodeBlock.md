# MiCodeBlock

Code, terminal output and diff display with optional header, line numbers and copy button; compose MiCodeBlock* parts or pass `code`.

Group: Ai. Source: app/components/Ai/MiCodeBlock.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| code | string | "" | Shortcut: source text, rendered when no default slot is given. |
| filename | string |  | Shortcut: header title. |
| language | string |  | Shortcut: header title when there is no filename. |
| lineNumbers | boolean | true | Shortcut: show line numbers. |
| copyable | boolean | true | Shortcut: show the copy button. |
| size | "default" \| "sm" | "default" | Compact size for tool output. |
| variant | "default" \| "destructive" | "default" | Destructive tints the block for errors. |

## Slots

- default: Custom block layout; replaces the built-in header and content built from the shortcut props.
- highlighted `{ code: string }`: Pre-highlighted code markup (for example from a syntax highlighter) shown instead of the plain text.
