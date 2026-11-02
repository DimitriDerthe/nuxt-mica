# MiResizable

Resizable split panels with draggable, keyboard-operable handles; horizontal or vertical, with min/max sizes and a v-model of percentages.

Group: Content. Source: app/components/Content/MiResizable.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| orientation | "horizontal" \| "vertical" | "horizontal" | `horizontal` places panels side by side, `vertical` stacks them. |
| minSize | number | 10 | Minimum size of any panel, in percent. |
| maxSize | number | 90 | Maximum size of any panel, in percent. |
| withHandle | boolean | false | Show a visible grip on each handle. |
| minSizes | number[] | [] | Per-panel minimum sizes in percent, overriding `minSize`. |
| step | number | 5 | Keyboard step in percent. |
| handleLabel | string | "Resize panels" | Accessible name of each handle. |
| modelValue | number[] | [50, 50] | Panel sizes in percent; the length sets the panel count (slots `panel-0`, `panel-1`, ...). |

## Emits

- update:modelValue [value: number[]]
