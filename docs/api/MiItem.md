# MiItem

Generic content row with media, title, description and actions slots; outline or muted variants. For settings-style rows prefer MiListItem.

Group: Content. Source: app/components/Content/MiItem.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "default" \| "muted" \| "outline" | "default" | Visual style: transparent, bordered or softly filled. |
| size | "default" \| "sm" \| "xs" | "default" | Row density. |
| title | string |  | Main line of the row. |
| description | string |  | Secondary text under the title. |
| mediaVariant | "default" \| "icon" \| "image" | "default" | Media style: bare, rounded icon tile or image. |
| href | string |  | Renders an anchor, making the whole row a link. |

## Slots

- header: Content above the row, e.g. a banner or badge.
- media: Leading visual such as an icon, avatar or image, styled by `mediaVariant`.
- title: Custom title replacing the `title` text.
- description: Custom description replacing the `description` text.
- default: Extra content under the description.
- actions: Trailing controls such as buttons.
- footer: Content below the row.
