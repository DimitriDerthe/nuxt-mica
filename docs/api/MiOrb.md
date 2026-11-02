# MiOrb

Dotted 3D thinking orb for AI and agent states (thinking, searching, working, listening, composing, connecting, idle); one shared canvas loop, paused offscreen, static under reduced motion.

Group: Ai. Source: app/components/Ai/MiOrb.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| state | "idle" \| "thinking" \| "searching" \| "working" \| "listening" \| "composing" \| "connecting" | "thinking" | What the agent is doing; switching state morphs the dots into the new shape. |
| size | number \| "sm" \| "lg" \| "md" | "md" | Preset: sm 20px (inline with text), md 32px, lg 64px (avatar). A number is an exact size in px. |
| tone | "primary" \| "secondary" \| "inherit" | "primary" | Ink colour: brand `primary` or `secondary`, or `inherit` to follow the text colour. |
| speed | number | 1 | Animation speed multiplier. |
| density | number | 1 | Dot density multiplier (1 is the tuned look). |
| paused | boolean | false | Freeze on the current frame. |
| label | string |  | Accessible name; defaults to the state name ("Thinking"). An empty string hides the orb from assistive tech. |
