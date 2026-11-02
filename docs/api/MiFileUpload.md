# MiFileUpload

Drag-and-drop file zone with a file list, per-file removal and progress, type, size and count validation, and keyboard access.

Group: Inputs. Source: app/components/Inputs/MiFileUpload.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| accept | string |  | Accepted types, same syntax as the native `accept` attribute (`image/*,.pdf`). |
| multiple | boolean |  | Allow several files. When false a new file replaces the current one. |
| maxSize | number |  | Largest allowed file size in bytes. |
| maxFiles | number |  | Largest allowed number of files (multiple mode only). |
| disabled | boolean |  | Blocks interaction and dims the zone. |
| label | string | "Drop files here or browse" | Title of the zone, also its accessible name. |
| hint | string |  | Secondary line under the label, such as accepted formats. |
| progress | Record<string, number> |  | Upload progress per file name, from 0 to 1. Files without an entry show no bar. |
| removeLabel | string | "Remove" | Accessible name prefix of the per-file remove button. |
| modelValue | File[] | [] | Files currently held. |

## Emits

- update:modelValue [value: File[]]
- reject [rejections: MiFileRejection[]]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiFileRejection { file: File; reason: MiFileRejectReason }
type MiFileRejectReason = 'type' | 'size' | 'count'
```
