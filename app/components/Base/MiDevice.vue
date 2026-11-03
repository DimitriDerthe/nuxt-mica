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
    class="mi-dev mi:[--_bezel:light-dark(#1d1d1f,_#3a3a3c)] mi:[--_edge:light-dark(rgb(255_255_255_/_.1),_rgb(255_255_255_/_.16))] mi:[--_metal:light-dark(#c7c7cc,_#636366)] mi:@container mi:w-full mi:max-w-(--mi-dev-max) mi:mx-auto mi:flex mi:flex-col mi:items-center mi:font-mi mi:text-label"
    :class="[`mi-dev--${device}`, `mi-dev--${tone}`, { 'is-landscape': landscape }]"
    :style="{ '--mi-dev-max': `${max}px` }"
    :role="label ? 'group' : undefined"
    :aria-label="label"
  >
    <div class="mi-dev__frame mi:relative mi:box-border mi:w-full mi:grid mi:[background:var(--\_bezel)] mi:shadow-[inset_0_0_0_.3cqw_var(--\_edge),_0_3cqw_8cqw_-3cqw_rgb(0_0_0_/_.35)] mi:[.mi-dev--phone_&]:[--_pad:3cqw] mi:[.mi-dev--phone_&]:p-(--_pad) mi:[.mi-dev--phone.is-landscape_&]:p-[1.4cqw] mi:[.mi-dev--tablet_&]:p-[4.2cqw] mi:[.mi-dev--tablet.is-landscape_&]:p-[3.2cqw] mi:[.mi-dev--laptop_&]:w-[86%] mi:[.mi-dev--laptop_&]:pt-[2.4cqw] mi:[.mi-dev--laptop_&]:px-[2.2cqw] mi:[.mi-dev--laptop_&]:pb-[2cqw] mi:[.mi-dev--browser_&]:grid-rows-[auto_minmax(0,_1fr)] mi:[.mi-dev--browser_&]:[background:var(--mi-card)] mi:[.mi-dev--browser_&]:shadow-[0_0_0_1px_var(--mi-sep2),_var(--mi-sh3)] mi:[.mi-dev--browser_&]:overflow-hidden">
      <template v-if="device === 'browser'">
        <div class="mi-dev__bar mi:flex mi:items-center mi:gap-3 mi:py-0 mi:px-[clamp(8px,_2cqw,_16px)] mi:h-[clamp(30px,_5.4cqw,_46px)] mi:[background:var(--mi-fill3)] mi:[border-bottom:.5px_solid_var(--mi-sep)]" aria-hidden="true">
          <span class="mi-dev__dots mi:inline-flex mi:gap-[clamp(4px,_.9cqw,_8px)] mi:flex-[none]"><i class="mi:[.mi-dev__dots_&]:w-[clamp(7px,_1.3cqw,_11px)] mi:[.mi-dev__dots_&]:h-[clamp(7px,_1.3cqw,_11px)] mi:[.mi-dev__dots_&]:rounded-[50%] mi:[.mi-dev__dots_&]:[background:var(--mi-label3)] mi:[.mi-dev__dots_&:nth-child(1)]:[background:var(--mi-red)] mi:[.mi-dev__dots_&:nth-child(2)]:[background:var(--mi-yellow)] mi:[.mi-dev__dots_&:nth-child(3)]:[background:var(--mi-green)]" /><i class="mi:[.mi-dev__dots_&]:w-[clamp(7px,_1.3cqw,_11px)] mi:[.mi-dev__dots_&]:h-[clamp(7px,_1.3cqw,_11px)] mi:[.mi-dev__dots_&]:rounded-[50%] mi:[.mi-dev__dots_&]:[background:var(--mi-label3)] mi:[.mi-dev__dots_&:nth-child(1)]:[background:var(--mi-red)] mi:[.mi-dev__dots_&:nth-child(2)]:[background:var(--mi-yellow)] mi:[.mi-dev__dots_&:nth-child(3)]:[background:var(--mi-green)]" /><i class="mi:[.mi-dev__dots_&]:w-[clamp(7px,_1.3cqw,_11px)] mi:[.mi-dev__dots_&]:h-[clamp(7px,_1.3cqw,_11px)] mi:[.mi-dev__dots_&]:rounded-[50%] mi:[.mi-dev__dots_&]:[background:var(--mi-label3)] mi:[.mi-dev__dots_&:nth-child(1)]:[background:var(--mi-red)] mi:[.mi-dev__dots_&:nth-child(2)]:[background:var(--mi-yellow)] mi:[.mi-dev__dots_&:nth-child(3)]:[background:var(--mi-green)]" /></span>
          <span class="mi-dev__url mi:flex-1 mi:min-w-0 mi:max-w-[62%] mi:mx-auto mi:py-0 mi:px-3 mi:h-[62%] mi:flex mi:items-center mi:justify-center mi:rounded-[99px] mi:[background:var(--mi-card)] mi:shadow-[inset_0_0_0_.5px_var(--mi-sep2)] mi:text-label2 mi:text-[clamp(10px,_1.55cqw,_13px)] mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ host || ' ' }}</span>
        </div>
      </template>
      <span v-else-if="device !== 'laptop'" class="mi-dev__notch mi:[.mi-dev--phone_&]:z-2 mi:[.mi-dev--tablet_&]:z-2 mi:[.mi-dev--tablet_&]:opacity-60" aria-hidden="true" />
      <span v-else class="mi-dev__cam mi:[.mi-dev--laptop_&]:z-2 mi:[.mi-dev--laptop_&]:opacity-60" aria-hidden="true" />
      <div class="mi-dev__screen mi:relative mi:min-h-0 mi:min-w-0 mi:overflow-hidden mi:[background:var(--mi-card)] mi:isolate"><slot /></div>
    </div>
    <div v-if="device === 'laptop'" class="mi-dev__base mi:relative mi:w-full mi:h-[2.6cqw] mi:rounded-[.4cqw_.4cqw_3cqw_3cqw] mi:[background:linear-gradient(var(--\_metal),_color-mix(in_srgb,_var(--\_metal)_78%,_#000))] mi:shadow-[0_2cqw_4cqw_-2cqw_rgb(0_0_0_/_.4)]" aria-hidden="true"><span /></div>
  </div>
</template>

<style scoped>
.mi-dev--dark { --_bezel: light-dark(#111113, #1c1c1e); }
.mi-dev--light { --_bezel: light-dark(#e5e5ea, #d1d1d6); --_edge: rgb(0 0 0 / .08); --_metal: light-dark(#d1d1d6, #aeaeb2); }

/* phone */
.mi-dev--phone .mi-dev__frame { aspect-ratio: 9 / 19.5; border-radius: 15cqw; }
.mi-dev--phone .mi-dev__screen { border-radius: 12cqw; }
.mi-dev--phone .mi-dev__notch { position: absolute; top: 5.2cqw; left: 50%; width: 27cqw; height: 7.6cqw; border-radius: 99cqw; background: #000; transform: translate3d(-50%, 0, 0); }
.mi-dev--phone.is-landscape .mi-dev__frame { aspect-ratio: 19.5 / 9; border-radius: 7cqw; }
.mi-dev--phone.is-landscape .mi-dev__screen { border-radius: 5.6cqw; }
.mi-dev--phone.is-landscape .mi-dev__notch { top: 50%; left: 3cqw; width: 3.4cqw; height: 12.6cqw; transform: translate3d(0, -50%, 0); }

/* tablet */
.mi-dev--tablet .mi-dev__frame { aspect-ratio: 3 / 4; border-radius: 7cqw; }
.mi-dev--tablet .mi-dev__screen { border-radius: 3cqw; }
.mi-dev--tablet .mi-dev__notch { position: absolute; top: 1.7cqw; left: 50%; width: 1.5cqw; height: 1.5cqw; border-radius: 50%; background: #000; transform: translate3d(-50%, 0, 0); }
.mi-dev--tablet.is-landscape .mi-dev__frame { aspect-ratio: 4 / 3; border-radius: 5cqw; }
.mi-dev--tablet.is-landscape .mi-dev__screen { border-radius: 2cqw; }
.mi-dev--tablet.is-landscape .mi-dev__notch { top: 50%; left: 1.2cqw; width: 1.1cqw; height: 1.1cqw; transform: translate3d(0, -50%, 0); }

/* laptop */
.mi-dev--laptop .mi-dev__frame { aspect-ratio: 16 / 10; border-radius: 3cqw 3cqw .6cqw .6cqw; }
.mi-dev--laptop .mi-dev__screen { border-radius: .8cqw; }
.mi-dev--laptop .mi-dev__cam { position: absolute; top: .8cqw; left: 50%; width: .7cqw; height: .7cqw; border-radius: 50%; background: #000; transform: translate3d(-50%, 0, 0); }
.mi-dev__base span { position: absolute; top: 0; left: 50%; width: 14%; height: 1.1cqw; border-radius: 0 0 1.2cqw 1.2cqw; background: color-mix(in srgb, var(--_metal) 62%, #000); transform: translate3d(-50%, 0, 0); }

/* browser */
.mi-dev--browser .mi-dev__frame { aspect-ratio: 16 / 10; border-radius: 2cqw; }
.mi-dev--browser .mi-dev__screen { border-radius: 0; }
</style>
