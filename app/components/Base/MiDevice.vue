<script setup lang="ts">
/** Pure CSS device frame (phone, tablet, laptop or browser window) that scales with its container and shows the default slot as the screen. */
import { computed } from 'vue'

export type MiDeviceKind = 'phone' | 'tablet' | 'laptop' | 'browser'

const props = withDefaults(defineProps<{
  /** Which device to draw. */
  device?: MiDeviceKind
  /** Portrait or landscape; applies to `phone` and `tablet` only. */
  orientation?: 'portrait' | 'landscape'
  /** Address shown in the toolbar of the `browser` device; its protocol is hidden. */
  url?: string
  /** Bezel color: `auto` is dark and lifts slightly in dark mode, or force `dark` or `light`. */
  tone?: 'auto' | 'dark' | 'light'
  /** Largest width in px; the device shrinks with its container. Defaults depend on the device. */
  maxWidth?: number
  /** Accessible name; when set the frame is exposed as a labelled group. */
  label?: string
}>(), { device: 'phone', orientation: 'portrait', tone: 'auto' })

const landscape = computed(() => (props.device === 'phone' || props.device === 'tablet') && props.orientation === 'landscape')
const max = computed(() => {
  if (props.maxWidth) return props.maxWidth
  const land = landscape.value
  return ({ phone: land ? 640 : 300, tablet: land ? 760 : 520, laptop: 900, browser: 980 } as const)[props.device]
})
const host = computed(() => (props.url ?? '').replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/\/$/, ''))

const _slots = defineSlots<{
  /** Content of the screen; it fills the screen and is clipped to its rounded corners. */
  default?(): unknown
}>()
</script>

<template>
  <div
    class="mi-dev"
    :class="[`mi-dev--${device}`, `mi-dev--${tone}`, { 'is-landscape': landscape }]"
    :style="{ '--mi-dev-max': `${max}px` }"
    :role="label ? 'group' : undefined"
    :aria-label="label"
  >
    <div class="mi-dev__frame">
      <template v-if="device === 'browser'">
        <div class="mi-dev__bar" aria-hidden="true">
          <span class="mi-dev__dots"><i /><i /><i /></span>
          <span class="mi-dev__url">{{ host || ' ' }}</span>
        </div>
      </template>
      <span v-else-if="device !== 'laptop'" class="mi-dev__notch" aria-hidden="true" />
      <span v-else class="mi-dev__cam" aria-hidden="true" />
      <div class="mi-dev__screen"><slot /></div>
    </div>
    <div v-if="device === 'laptop'" class="mi-dev__base" aria-hidden="true"><span /></div>
  </div>
</template>

<style scoped>
.mi-dev {
  --_bezel: light-dark(#1d1d1f, #3a3a3c);
  --_edge: light-dark(rgb(255 255 255 / .1), rgb(255 255 255 / .16));
  --_metal: light-dark(#c7c7cc, #636366);
  container-type: inline-size;
  width: 100%; max-width: var(--mi-dev-max); margin-inline: auto;
  display: flex; flex-direction: column; align-items: center;
  font-family: var(--mi-font); color: var(--mi-label);
}
.mi-dev--dark { --_bezel: light-dark(#111113, #1c1c1e); }
.mi-dev--light { --_bezel: light-dark(#e5e5ea, #d1d1d6); --_edge: rgb(0 0 0 / .08); --_metal: light-dark(#d1d1d6, #aeaeb2); }
.mi-dev__frame {
  position: relative; box-sizing: border-box; width: 100%; display: grid;
  background: var(--_bezel);
  box-shadow: inset 0 0 0 .3cqw var(--_edge), 0 3cqw 8cqw -3cqw rgb(0 0 0 / .35);
}
.mi-dev__screen { position: relative; min-height: 0; min-width: 0; overflow: hidden; background: var(--mi-card); isolation: isolate; }

/* phone */
.mi-dev--phone .mi-dev__frame { --_pad: 3cqw; aspect-ratio: 9 / 19.5; padding: var(--_pad); border-radius: 15cqw; }
.mi-dev--phone .mi-dev__screen { border-radius: 12cqw; }
.mi-dev--phone .mi-dev__notch { position: absolute; z-index: 2; top: 5.2cqw; left: 50%; width: 27cqw; height: 7.6cqw; border-radius: 99cqw; background: #000; transform: translate3d(-50%, 0, 0); }
.mi-dev--phone.is-landscape .mi-dev__frame { aspect-ratio: 19.5 / 9; padding: 1.4cqw; border-radius: 7cqw; }
.mi-dev--phone.is-landscape .mi-dev__screen { border-radius: 5.6cqw; }
.mi-dev--phone.is-landscape .mi-dev__notch { top: 50%; left: 3cqw; width: 3.4cqw; height: 12.6cqw; transform: translate3d(0, -50%, 0); }

/* tablet */
.mi-dev--tablet .mi-dev__frame { aspect-ratio: 3 / 4; padding: 4.2cqw; border-radius: 7cqw; }
.mi-dev--tablet .mi-dev__screen { border-radius: 3cqw; }
.mi-dev--tablet .mi-dev__notch { position: absolute; z-index: 2; top: 1.7cqw; left: 50%; width: 1.5cqw; height: 1.5cqw; border-radius: 50%; background: #000; opacity: .6; transform: translate3d(-50%, 0, 0); }
.mi-dev--tablet.is-landscape .mi-dev__frame { aspect-ratio: 4 / 3; padding: 3.2cqw; border-radius: 5cqw; }
.mi-dev--tablet.is-landscape .mi-dev__screen { border-radius: 2cqw; }
.mi-dev--tablet.is-landscape .mi-dev__notch { top: 50%; left: 1.2cqw; width: 1.1cqw; height: 1.1cqw; transform: translate3d(0, -50%, 0); }

/* laptop */
.mi-dev--laptop .mi-dev__frame { width: 86%; aspect-ratio: 16 / 10; padding: 2.4cqw 2.2cqw 2cqw; border-radius: 3cqw 3cqw .6cqw .6cqw; }
.mi-dev--laptop .mi-dev__screen { border-radius: .8cqw; }
.mi-dev--laptop .mi-dev__cam { position: absolute; z-index: 2; top: .8cqw; left: 50%; width: .7cqw; height: .7cqw; border-radius: 50%; background: #000; opacity: .6; transform: translate3d(-50%, 0, 0); }
.mi-dev__base { position: relative; width: 100%; height: 2.6cqw; border-radius: .4cqw .4cqw 3cqw 3cqw; background: linear-gradient(var(--_metal), color-mix(in srgb, var(--_metal) 78%, #000)); box-shadow: 0 2cqw 4cqw -2cqw rgb(0 0 0 / .4); }
.mi-dev__base span { position: absolute; top: 0; left: 50%; width: 14%; height: 1.1cqw; border-radius: 0 0 1.2cqw 1.2cqw; background: color-mix(in srgb, var(--_metal) 62%, #000); transform: translate3d(-50%, 0, 0); }

/* browser */
.mi-dev--browser .mi-dev__frame { aspect-ratio: 16 / 10; grid-template-rows: auto minmax(0, 1fr); border-radius: 2cqw; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep2), var(--mi-sh3); overflow: hidden; }
.mi-dev--browser .mi-dev__screen { border-radius: 0; }
.mi-dev__bar { display: flex; align-items: center; gap: 12px; padding: 0 clamp(8px, 2cqw, 16px); height: clamp(30px, 5.4cqw, 46px); background: var(--mi-fill3); border-bottom: .5px solid var(--mi-sep); }
.mi-dev__dots { display: inline-flex; gap: clamp(4px, .9cqw, 8px); flex: none; }
.mi-dev__dots i { width: clamp(7px, 1.3cqw, 11px); height: clamp(7px, 1.3cqw, 11px); border-radius: 50%; background: var(--mi-label3); }
.mi-dev__dots i:nth-child(1) { background: var(--mi-red); }
.mi-dev__dots i:nth-child(2) { background: var(--mi-yellow); }
.mi-dev__dots i:nth-child(3) { background: var(--mi-green); }
.mi-dev__url { flex: 1; min-width: 0; max-width: 62%; margin-inline: auto; padding: 0 12px; height: 62%; display: flex; align-items: center; justify-content: center; border-radius: 99px; background: var(--mi-card); box-shadow: inset 0 0 0 .5px var(--mi-sep2); color: var(--mi-label2); font-size: clamp(10px, 1.55cqw, 13px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
