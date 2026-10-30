# MiToaster

Region that renders the toasts queued by useMiToast; mount it once in the app layout, pinned to one of six positions.

Group: Feedback. Source: app/components/Feedback/MiToaster.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| position | "top-right" \| "top-left" \| "bottom-right" \| "bottom-left" \| "bottom-center" \| "top-center" | "bottom-center" | Edge and alignment. `top-*` stacks the newest toast first. |
| limit | number | 3 | Maximum toasts shown at once; the newest win. |
| offset | number | 20 | Distance from the viewport edge, in px. |
| label | string | "Notifications" | Accessible name of the notification region. |
