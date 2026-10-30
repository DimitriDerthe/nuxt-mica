# MiColorPicker

Hex color field plus preset swatches that edit the primary or secondary brand color and apply it to the theme live.

Group: Base. Source: app/components/Base/MiColorPicker.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| target | "primary" \| "secondary" | "primary" | Which brand color this picker edits. |
| label | string |  | Visible title of the field; defaults to Primary or Secondary from the target. |
| presets | string[] |  | Preset swatches (hex). Defaults to the kit presets for the target. |

## Emits

- change [hex: string]
