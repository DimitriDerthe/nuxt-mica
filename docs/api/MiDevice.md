# MiDevice

Pure CSS device frame (phone, tablet, laptop or browser window) that scales with its container and shows the default slot as the screen.

Group: Base. Source: app/components/Base/MiDevice.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| device | "phone" \| "tablet" \| "laptop" \| "browser" | "phone" | Which device to draw. |
| orientation | "portrait" \| "landscape" | "portrait" | Portrait or landscape; applies to `phone` and `tablet` only. |
| url | string |  | Address shown in the toolbar of the `browser` device; its protocol is hidden. |
| tone | "light" \| "dark" \| "auto" | "auto" | Bezel color: `auto` is dark and lifts slightly in dark mode, or force `dark` or `light`. |
| maxWidth | number |  | Largest width in px; the device shrinks with its container. Defaults depend on the device. |
| label | string |  | Accessible name; when set the frame is exposed as a labelled group. |

## Slots

- default: Content of the screen; it fills the screen and is clipped to its rounded corners.
