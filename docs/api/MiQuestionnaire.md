# MiQuestionnaire

Multi-step questionnaire form with single, multiple, freeform and skippable questions; compose MiQuestionnaire* parts or pass a `questions` shortcut. v-model holds answers by question name.

Group: Ai. Source: app/components/Ai/MiQuestionnaire.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| questions | MiQuestion[] |  | Shortcut questions, rendered when no default slot is given. |
| defaultItem | string |  | Name of the question to show first; defaults to the first. |
| shortcuts | "letters" \| "none" | "letters" | `letters` lets A, B, C... pick the matching choice. |
| modelValue | Record<string, MiAnswer> | {} | Answers keyed by question id; each value is the choice id(s) or free text entered. |

## Slots

- default: Custom questionnaire layout built from MiQuestionnaire* parts; replaces the layout generated from `questions`.

## Emits

- update:modelValue [value: Record<string, MiAnswer>]
- submit [answers: Record<string, MiAnswer>]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiQuestion { name: string; title: string; description?: string; choices?: { value: string, label: string, description?: string }[]; /** Allow several choices. */ multiple?: boolean; required?: boolean; /** Adds a free-text input; its label is the aria-label. */ input?: { label: string, placeholder?: string } }
type MiAnswer = string | string[]
```
