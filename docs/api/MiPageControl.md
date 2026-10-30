# MiPageControl

Dot pager for carousels and onboarding: one tab per item, v-model is the zero-based active index.

Group: Navigation. Source: app/components/Navigation/MiPageControl.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| count* | number |  | Number of dots, one per slide or page. |
| ariaLabel | string | "Slides" | Accessible name of the dot tablist. |
| itemLabel | string | "Slide" | Label prefix of each dot, e.g. "Slide" gives "Slide 2". |
| modelValue | number | 0 | Zero-based index of the active page. |

## Emits

- update:modelValue [value: number]
