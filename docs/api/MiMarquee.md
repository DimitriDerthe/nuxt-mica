# MiMarquee

Infinite scrolling strip for logos or short text: the content is repeated into a seamless track moved with a transform-only CSS animation, with edge fade, pause on hover and reduced-motion support.

Group: Content. Source: app/components/Content/MiMarquee.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| speed | number | 40 | Scrolling speed in px per second. |
| direction | "left" \| "right" \| "up" \| "down" | "left" | Travel direction. `left`/`up` and `right`/`down` are equivalent per axis. |
| pauseOnHover | boolean | true | Pause the animation while hovered or while something inside has keyboard focus. |
| gap | number | 32 | Space between items in px. |
| vertical | boolean |  | Scroll vertically instead of horizontally. Give the component a height (default 16rem). |
| fade | boolean | true | Fade the strip out at both ends. |
| ariaLabel | string |  | Accessible name of the region. |

## Slots

- default: The items to scroll (logos, badges, short text). Rendered more than once to fill the track; repeats are hidden from assistive tech.
