# MiSurface

Container surface (card, elevated or translucent material) with radius, padding and shadow presets; use it to group content.

Group: Base. Source: app/components/Base/MiSurface.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "card" \| "material" \| "elevated" | "card" | Look of the surface: flat `card`, shadowed `elevated` or translucent blurred `material`. |
| material | "regular" \| "ultra-thin" \| "thin" \| "thick" | "regular" | Translucency of the `material` variant. |
| radius | "sm" \| "lg" \| "md" \| "xs" \| "xl" \| "capsule" | "lg" | Corner rounding from `xs` to `xl`, or fully rounded `capsule`. |
| padding | "sm" \| "lg" \| "md" \| "none" | "none" | Inner spacing: none, sm (12px), md (18px) or lg (24px). |
| elevation | 0 \| 1 \| 2 \| 3 |  | Shadow depth 0-3 (`--mi-sh1..3`). Defaults to 1 for cards, 2 for elevated, 0 for materials. |
| as | string | "div" | Tag or component to render instead of the default div (e.g. 'section', 'li'). |

## Slots

- default: Content grouped on the surface.
