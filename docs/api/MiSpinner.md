# MiSpinner

Small loading indicator: `ticks` for the 8-step activity spinner or `arc` for a rotating arc, in a preset or pixel size.

Group: Feedback. Source: app/components/Feedback/MiSpinner.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "arc" \| "ticks" | "ticks" | `ticks` is the 8-step activity indicator, `arc` a continuous rotating arc. |
| size | number \| "sm" \| "lg" \| "md" | "md" | Preset: sm 16px, md 20px, lg 32px. A number is an exact size in px. |
| tone | "primary" \| "secondary" \| "inherit" | "inherit" | `inherit` follows the text colour. |
| label | string | "Loading" | Accessible name. An empty string hides the spinner from assistive tech. |
