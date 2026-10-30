# MiAvatar

User avatar: image, or initials from `name` on a tone background. Use for people; `tone="auto"` picks a stable color from the name.

Group: Content. Source: app/components/Content/MiAvatar.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| name | string |  | Full name, used for initials and the accessible label. |
| initials | string |  | Explicit initials, overrides the ones derived from `name`. |
| src | string |  | Image URL; falls back to initials if it fails to load. |
| alt | string |  | Image alt text. Defaults to `name`. |
| size | number \| "sm" \| "lg" \| "xs" \| "md" \| "xl" | "md" | Preset xs 24px, sm 32px, md 44px, lg 64px, xl 80px, or a number of px. |
| shape | "circle" \| "square" | "circle" | Circle or rounded square outline. |
| tone | MiAvatarTone | "primary" | Background color. `auto` picks a stable color from `name`. |
| decorative | boolean | false | Hide from assistive tech when the name is rendered next to the avatar. |

## Slots

- default: Fallback shown when there is no image and no initials; defaults to a person silhouette.

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiAvatarTone = 'primary' | 'secondary' | 'primary-soft' | 'secondary-soft' | 'neutral' | 'auto' | 'red' | 'orange' | 'green' | 'mint' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink'
```
