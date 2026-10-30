# MiLocalNav

Sticky in-page section tabs with v-model selection, arrow-key navigation and an optional call-to-action pill.

Group: Navigation. Source: app/components/Navigation/MiLocalNav.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| title | string |  | Product or page name shown at the start of the bar. Replaced by the `title` slot when given. |
| items* | { id: string; label: string; disabled?: boolean }[] |  | Sections to switch between; the selected id is the v-model. |
| actionLabel | string |  | Label of the call-to-action pill. Omit to hide it. |
| sticky | boolean | true | Pins the bar to the top of its scroll container (12px offset). False renders it static. |
| ariaLabel | string | "Sections" | Accessible name of the section navigation. |
| modelValue | string |  | Value of the selected section tab. |

## Slots

- title: Replaces the title text at the start of the bar.
- action: Replaces the call-to-action pill.

## Emits

- update:modelValue [value: string | undefined]
- action []
