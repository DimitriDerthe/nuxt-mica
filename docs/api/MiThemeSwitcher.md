# MiThemeSwitcher

Segmented control to switch the app appearance (light, dark or system) via useMiTheme; icon-only variant for tight toolbars.

Group: Base. Source: app/components/Base/MiThemeSwitcher.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| label | string | "Appearance" | Accessible name of the group. |
| iconOnly | boolean | false | Hide the text labels and keep icons only (labels stay available to assistive tech). |
| labels | Partial<Record<MiMode, string>> |  | Override the visible option texts per mode (e.g. translated labels). |

## Emits

- change [mode: MiMode]
