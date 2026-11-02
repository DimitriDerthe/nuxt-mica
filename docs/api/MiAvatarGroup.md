# MiAvatarGroup

Overlapping row of MiAvatar for team or member lists, collapsing the rest into "+N". Use with `items` and a `max` cap.

Group: Content. Source: app/components/Content/MiAvatarGroup.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | { name: string; src?: string; tone?: MiAvatarTone; initials?: string }[] |  | Members to display, in order; the first `max` are shown. |
| max | number | 3 | Maximum avatars shown before collapsing the rest into "+N". |
| size | number \| "sm" \| "lg" \| "md" \| "xs" \| "xl" | 36 | Preset (xs to xl, see MiAvatar) or px. Default 36px. |
| shape | "circle" \| "square" | "circle" | Circle or rounded square outline of every avatar. |
| label | string |  | Override the generated accessible label. |

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiAvatarTone = 'primary' | 'secondary' | 'primary-soft' | 'secondary-soft' | 'neutral' | 'auto' | 'red' | 'orange' | 'green' | 'mint' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink'
```
