# MiPasswordStrength

Password strength meter for a given string: four-segment bar, a Weak to Strong label and an optional requirements checklist; pairs with MiInput.

Group: Inputs. Source: app/components/Inputs/MiPasswordStrength.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| value | string | "" | The password to evaluate. |
| requirements | MiPasswordRequirement[] | [] | Requirements to list below the bar: any of `length`, `upper`, `lower`, `number`, `symbol`. Empty hides the checklist. |
| minLength | number | 8 | Minimum length used by the `length` requirement and the scoring. |
| labels | [string, string, string, string] | ["Weak", "Fair", "Good", "Strong"] | Labels for scores 1 to 4 (Weak, Fair, Good, Strong). |
| emptyLabel | string | "Enter a password" | Text shown while the value is empty. |
| label | string | "Password strength" | Accessible name of the meter. |
| requirementLabels | Partial<Record<MiPasswordRequirement, string>> |  | Display names of the requirements, keyed by requirement. |

## Emits

- score [score: 0 | 1 | 2 | 3 | 4]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiPasswordRequirement = 'length' | 'upper' | 'lower' | 'number' | 'symbol'
```
