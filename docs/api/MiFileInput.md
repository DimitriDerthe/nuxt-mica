# MiFileInput

Compact field-style file input: a choose button next to the file name, with the same type, size and count validation as MiFileUpload.

Group: Inputs. Source: app/components/Inputs/MiFileInput.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| accept | string |  | Accepted types, same syntax as the native `accept` attribute (`image/*,.pdf`). |
| multiple | boolean |  | Allow several files; the model is then a File array instead of a single File. |
| maxSize | number |  | Largest allowed file size in bytes. |
| maxFiles | number |  | Largest allowed number of files (multiple mode only). |
| disabled | boolean |  | Blocks interaction and dims the field. |
| label | string | "File" | Accessible name of the field. |
| buttonLabel | string | "Choose file" | Text of the choose button. |
| placeholder | string | "No file chosen" | Text shown while no file is chosen. |
| clearLabel | string | "Clear" | Accessible name of the clear button. |
| modelValue | null \| File \| File[] | null | Chosen file (single mode) or files (`multiple`); null or an empty array when nothing is chosen. |

## Emits

- update:modelValue [value: File | File[] | null]
- reject [rejections: MiFileRejection[]]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiFileRejection { file: File; reason: MiFileRejectReason }
type MiFileRejectReason = 'type' | 'size' | 'count'
```

## Exposed (template ref)

- focus: () => void | undefined
