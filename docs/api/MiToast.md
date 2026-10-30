# MiToast

Single transient message pill with tone, optional description and action; rendered by MiToaster, show one via useMiToast.

Group: Feedback. Source: app/components/Feedback/MiToast.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| message* | string |  | Main text of the toast. |
| description | string |  | Smaller second line under the message. |
| tone | "error" \| "warning" \| "loading" \| "neutral" \| "success" \| "info" | "neutral" | Icon and colour. `loading` shows a spinner, `error` is announced as an alert. |
| variant | "material" \| "solid" | "solid" | `solid` is the inverted pill, `material` the blurred one. |
| actionLabel | string |  | Text of the action button, which emits `action`; omitted when empty. |
| dismissible | boolean |  | Adds a close button that emits `dismiss`. |
| dismissLabel | string | "Dismiss" | Accessible name of the close button. |

## Slots

- icon: Replaces the tone icon or spinner.
- action: Replaces the action button, e.g. for a custom control.

## Emits

- action []
- dismiss []
