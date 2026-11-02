<script setup lang="ts">
/** Status text with a light sweeping across it, for "Thinking…" style labels next to MiOrb; the sweep moves with transforms only. */
withDefaults(defineProps<{
  /** Text to show; the default slot overrides it. */
  text?: string
  /** Seconds per sweep. */
  duration?: number
  /** Stop the sweep and show plain text, e.g. once the work is done. */
  paused?: boolean
  /** Element to render. */
  as?: string
}>(), { text: '', duration: 2.2, paused: false, as: 'span' })

defineSlots<{
  /** Label content; plain inline text reads best. */
  default?(): unknown
}>()
</script>

<template>
  <component :is="as" class="mi-shim" :class="{ 'is-paused': paused }" :style="{ '--mi-shim-dur': duration + 's' }">
    <span class="mi-shim__base"><slot>{{ text }}</slot></span>
    <!-- Highlight copy: the window slides right while the ink slides left by the same amount, so the
         bright text stays aligned with the base text and only the masked band appears to move. -->
    <span v-if="!paused" class="mi-shim__win" aria-hidden="true">
      <span class="mi-shim__ink"><slot>{{ text }}</slot></span>
    </span>
  </component>
</template>

<style scoped>
.mi-shim { position: relative; display: inline-block; max-width: 100%; overflow: hidden; vertical-align: bottom; color: var(--mi-label2); font-family: var(--mi-font); white-space: nowrap; }
.mi-shim.is-paused { color: var(--mi-label); }
.mi-shim__base { display: block; overflow: hidden; text-overflow: ellipsis; }
.mi-shim__win {
  position: absolute; inset: 0; pointer-events: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 30%, black 50%, transparent 70%);
  mask-image: linear-gradient(90deg, transparent 30%, black 50%, transparent 70%);
  animation: mi-shim-win var(--mi-shim-dur) var(--mi-ease-in-out) infinite;
}
.mi-shim__ink { display: block; overflow: hidden; text-overflow: ellipsis; color: var(--mi-label); animation: mi-shim-ink var(--mi-shim-dur) var(--mi-ease-in-out) infinite; }
@keyframes mi-shim-win { from { transform: translate3d(-100%, 0, 0); } to { transform: translate3d(100%, 0, 0); } }
@keyframes mi-shim-ink { from { transform: translate3d(100%, 0, 0); } to { transform: translate3d(-100%, 0, 0); } }
@media (prefers-reduced-motion: reduce) { .mi-shim__win { display: none; } }
</style>
