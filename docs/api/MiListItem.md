# MiListItem

Row for MiList or standalone: settings row, rich content row or profile row. Renders as div, link, NuxtLink or button by props.

Group: Content. Source: app/components/Content/MiListItem.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "row" \| "rich" \| "profile" | "row" | `row`: settings-style row with inset separators. `rich`: multi-line content row. `profile`: large account row. |
| title | string |  | Main line of the row. |
| subtitle | string |  | Secondary line under the title. |
| description | string |  | Clamped (2 lines) excerpt under the subtitle, `rich` variant. |
| value | string |  | Trailing value text (row), or the timestamp on the title line (rich). |
| chevron | boolean | false | Show a disclosure chevron. |
| tile | "primary" \| "secondary" \| "red" \| "orange" \| "green" \| "mint" \| "teal" \| "blue" \| "indigo" \| "purple" \| "pink" \| "yellow" |  | Colored rounded-square icon tile behind the `leading` slot content. |
| dot | boolean |  | `rich` variant unread gutter: true shows the primary dot, false reserves the space, undefined removes the gutter. |
| href | string |  | Renders an anchor. |
| to | string |  | Renders a NuxtLink (requires Nuxt). |
| button | boolean |  | Renders a button. |
| disabled | boolean |  | Blocks interaction and dims the row. |
| destructive | boolean |  | Red styling for delete-like actions. |
| align | "start" \| "center" | "start" | `center` centers the title block horizontally, for a standalone action row such as "Sign out" or "Delete account". Rows are always vertically centered. |

## Slots

- leading: Leading visual such as an icon or avatar; sits in the colored tile when `tile` is set.
- default: Replaces the whole text block (title, subtitle, description).
- title: Custom title replacing the `title` text.
- subtitle: Custom subtitle replacing the `subtitle` text.
- trailing: Trailing content such as a badge, switch or value.

## Emits

- click [ev: MouseEvent]
