# MiCopyButton

Button that copies a string to the clipboard, swaps its icon and label to a confirmation, and announces it to screen readers.

Group: Buttons. Source: app/components/Buttons/MiCopyButton.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| value | string |  | Text to copy. Ignored when `getValue` is set. |
| getValue | (): string \| Promise<string> |  | Function returning the text at click time (sync or async); wins over `value`. |
| label | string | "Copy" | Button text and accessible name before copying. Empty hides the text (icon only, the name stays). |
| copiedLabel | string | "Copied" | Text and accessible name shown right after copying; announced politely. |
| timeout | number | 1800 | How long the confirmation stays, in ms. |
| variant | "tinted" \| "outline" \| "ghost" | "tinted" | Visual style: subtle tinted, outlined, or icon-only quiet. |
| iconOnly | boolean |  | Hides the visible text and shows only the icon. |
| disabled | boolean |  | Blocks interaction and dims the button. |

## Slots

- icon: Replaces the idle icon.

## Emits

- error [error: unknown]
- copy [value: string]
