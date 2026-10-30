# MiTagInput

Tag entry field that commits typed text with delimiter keys into a string[] v-model; supports max, duplicate and validate rules.

Group: Inputs. Source: app/components/Inputs/MiTagInput.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| placeholder | string | "Add tag, press Return" | Hint text shown while the field is empty. |
| delimiters | string[] | ["Enter", ","] | Keys that commit the current text as a tag. |
| max | number |  | Maximum number of tags. Extra tags are rejected. |
| allowDuplicates | boolean | false | When false, a tag matching an existing one (case-insensitive) is rejected. |
| validate | (tag: string): boolean |  | Return false to reject a tag. |
| invalid | boolean |  | Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. |
| success | boolean |  | Draws the success border and focus ring. |
| disabled | boolean |  | Overrides the surrounding MiField or MiFormRow disabled state when set. |
| removeLabel | string | "Remove" | Accessible name of each tag's remove button. |
| modelValue | string[] | [] | Committed tags, in entry order. |

## Emits

- remove [tag: string]
- update:modelValue [value: string[]]
- add [tag: string]
- reject [tag: string]

## Exposed (template ref)

- focus: () => void | undefined
