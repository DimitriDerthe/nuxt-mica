# MiAttachment

File or image attachment card with media, title, description, upload state and actions; compose parts or use the name/fileSize shortcut props.

Group: Ai. Source: app/components/Ai/MiAttachment.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| state | "error" \| "idle" \| "uploading" \| "processing" \| "done" |  | Upload state; uploading and processing show a shimmer. |
| size | "default" \| "sm" \| "lg" | "default" | Card size. |
| orientation | "horizontal" \| "vertical" | "horizontal" | Stack media above content when vertical. |
| name | string |  | Shortcut: file name (used when no default slot is given). |
| fileSize | number |  | Shortcut: size in bytes. |
| type | string |  | Shortcut: MIME type; image types get an image icon. |
| preview | string |  | Shortcut: thumbnail URL for images. |
| progress | number |  | Shortcut: upload progress 0-100, shows the uploading state below 100. |
| error | string |  | Shortcut: error text; switches to the error state. |
| removable | boolean | true | Shortcut: show the remove button. |

## Slots

- default: Custom card content; replaces the built-in media, title, description and remove button built from the shortcut props.

## Emits

- remove []
