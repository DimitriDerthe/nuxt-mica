# MiEditor

Lightweight rich-text editor with a formatting toolbar and shortcuts; v-model is a sanitized HTML string limited to basic text formatting, lists, headings, quotes, code and links.

Group: Inputs. Source: app/components/Inputs/MiEditor.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| label | string | "Rich text editor" | Accessible name of the editing area. |
| placeholder | string |  | Hint shown while the editor is empty. |
| readonly | boolean |  | Shows the content without allowing edits; the area stays focusable and selectable. |
| disabled | boolean |  | Blocks interaction and dims the editor. |
| minHeight | string \| number | 160 | Minimum height of the editing area, in px or any CSS length. |
| maxHeight | string \| number |  | Maximum height before the area scrolls, in px or any CSS length. |
| toolbar | boolean | true | Shows the formatting toolbar. |
| pasteMode | "text" \| "html" | "html" | How pasted content is inserted: as sanitized HTML (keeps basic formatting) or as plain text. |
| invalid | boolean |  | Marks the editing area as invalid (`aria-invalid`) and tints its border. |
| linkLabel | string | "Link address" | Prompt label of the link address field. |
| modelValue | string | "" | The content as sanitized HTML. |

## Emits

- update:modelValue [value: string]
- focus [event: FocusEvent]
- blur [event: FocusEvent]
