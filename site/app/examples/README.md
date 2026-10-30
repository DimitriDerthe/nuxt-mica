# Live examples for the component explorer

One file per public component, named exactly like it: `MiButton.vue`. The explorer page
`/components/<slug>` lazy-loads it and renders it in the preview stage.

Contract

```vue
<script lang="ts">
// Optional metadata, read by site/app/components/ComponentPlayground.vue.
export const playground = {
  props: { variant: 'filled' },          // initial values; may include data props (items, series...)
  controls: ['variant', 'size'],         // props shown as controls, in order (default: every simple prop)
  slot: 'Continue',                      // text placed inside the tag of the usage snippet
  layout: 'center',                      // 'center' (default) | 'fill' (stretch to the stage width) | 'start'
  height: 260                            // minimum stage height in px
}
</script>

<script setup lang="ts">
// `p` holds the current control values (and the data props above). Spread it on the component.
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiButton v-bind="p">Continue</MiButton>
</template>
```

Rules
- Show the component the way a real product would use it: realistic English copy and data, no lorem ipsum.
- Keep v-model state local (`ref`) and spread `p` for everything else. Controls only exist for enum, boolean,
  number and string props; pass arrays/objects through `playground.props` or local constants.
- Overlays (dialogs, sheets, popovers, toasts) get a trigger button in the stage.
- Only tokens (`--mi-*`) for colors, transform/opacity for any motion, no new dependencies.
