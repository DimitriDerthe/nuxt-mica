# Lists and content

Components live in `app/components/Content/`. Playground: `/content`. All brand colors come from `--mi-p*` / `--mi-s*`; only `transform` and `opacity` are animated (the accordion track uses one WAAPI grid-rows animation per toggle).

## MiList
Groups rows on a card surface (or bare with `:grouped="false"`). Adds inset separators between `MiListItem`s.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `header` | string | | Uppercase caption above. Slot `header` overrides |
| `footer` | string | | Helper text below. Slot `footer` overrides |
| `grouped` | boolean | `true` | Card surface, radius 14 |
| `label` | string | | `aria-label` of the list |

Slots: `default`, `header`, `footer`.

## MiListItem
| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `row` \| `rich` \| `profile` | `row` | Settings row, multi-line mail row, large account row |
| `title`, `subtitle`, `description` | string | | `description` is clamped to 2 lines (`rich`) |
| `value` | string | | Trailing value (`row`) or timestamp on the title line (`rich`) |
| `chevron` | boolean | `false` | Disclosure chevron |
| `tile` | `primary`, `secondary`, `red`, `orange`, `yellow`, `green`, `mint`, `teal`, `blue`, `indigo`, `purple`, `pink` | | Colored 30px icon tile around the `leading` slot |
| `dot` | boolean | | `rich` only: `true` primary unread dot, `false` reserves the gutter |
| `href` / `to` / `button` | string / string / boolean | | Renders `a` / `NuxtLink` / `button`; otherwise a static `div` |
| `disabled`, `destructive` | boolean | | |
| `align` | `start` \| `center` | `start` | `center` for action rows ("Sign out") |

Slots: `leading`, `default` (replaces the text block), `title`, `subtitle`, `trailing`. Event: `click`. Root has `role="listitem"`.

## MiSwipeRow
Swipe-to-reveal actions. Pointer events, one rAF writing `--mi-sw-x`, axis lock, rubber band, velocity based snap. Keyboard: Left arrow reveals, Right arrow or Escape hides; actions are inert while closed.

| Prop | Type | Default |
|---|---|---|
| `actions` | `{ id, label, tone?: 'primary'\|'secondary'\|'danger'\|'neutral', icon?: string (24px svg path) }[]` | required |
| `actionWidth` | number | `75` |
| `disabled`, `keepOpen` | boolean | `false` |
| `v-model:open` | boolean | `false` |

Slots: `default` (row content), `action` (scoped `{ action }`). Event: `action(id)`.

## MiCard
| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `elevated` \| `outlined` \| `filled` | `elevated` | |
| `padding` | `none` \| `auto` \| `lg` | `auto` | `auto` picks the compact media layout when media exists |
| `align` | `start` \| `center` | `start` | |
| `image`, `imageAlt`, `mediaHeight` | string, string, number | `168` | Cover image |
| `eyebrow`, `title`, `description` | string | | `title` renders `h{headingLevel}` |
| `headingLevel` | 2-6 | `3` | |
| `href` / `to` | string | | Whole card becomes a link with a transform hover |

Slots: `media`, `header`, `default`, `footer` (pinned to the bottom).

## MiAvatar
| Prop | Type | Default | Notes |
|---|---|---|---|
| `name`, `initials`, `src`, `alt` | string | | Initials derived from `name`; image falls back to initials on error |
| `size` | `xs`(24) `sm`(32) `md`(44) `lg`(64) `xl`(80) or number | `md` | |
| `shape` | `circle` \| `square` | `circle` | Square uses a 28% radius |
| `tone` | `primary`, `secondary`, `primary-soft`, `secondary-soft`, `neutral`, `auto`, or any system color | `primary` | `auto` hashes the name |
| `decorative` | boolean | `false` | Hide from assistive tech |

Slot `default`: custom fallback (defaults to a person glyph).

## MiAvatarGroup
Props: `items: { name, src?, tone?, initials? }[]`, `max` (3), `size` (36), `shape`, `label`. Renders `role="img"` with a generated label ("Alex, Sam, Jordan and 3 others") and a `+N` overflow avatar.

## MiDetails
Props: `items: { key, label, value?, href? }[]`, `labelWidth` (`140px`). Slots: `label-<key>`, `value-<key>`, `value` (all scoped `{ item }`). Stacks below 320px container width.

## MiTable
| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `{ key, label, align?, sortable?, sortBy?, width?, muted?, numeric? }[]` | required | |
| `rows` | records | required | |
| `rowKey` | string | `id` | |
| `selectable` | `false` \| `single` \| `multiple` | `false` | `multiple` adds a select-all checkbox column |
| `zebra`, `stickyHeader` | boolean | `true` | Sticky header needs `maxHeight` |
| `maxHeight`, `caption`, `emptyText` | string | | |
| `density` | `compact` \| `regular` \| `relaxed` | `regular` | 28 / 34 / 44px rows |
| `manualSort` | boolean | `false` | Emit only, sort server-side |
| `virtualize` | boolean | auto from 50 rows | `content-visibility: auto` on cell content |
| `v-model:selected` | string[] | `[]` | Row ids |
| `v-model:sort` | `{ key, dir: 'asc'\|'desc' }` \| null | `null` | |

Slots: `cell-<key>`, `cell` (scoped `{ row, column, value, selected, index }`), `empty`. Event: `row-click`.
Keyboard (selectable): roving tabindex, Up/Down/Home/End move, Space/Enter toggle, Ctrl/Cmd+A selects all (multiple). Table uses `role="grid"` when selectable.

## MiAccordion + MiAccordionItem
`MiAccordion`: `v-model` (string or string[]), `type` (`single` \| `multiple`), `collapsible` (true), `items` (`{ value, title, content, disabled? }[]`), `variant` (`card` \| `plain`), `headingLevel` (3). Up/Down/Home/End move between triggers.
`MiAccordionItem`: `value`, `title`, `disabled`; slots `title`, `default`. Works standalone too. Panels are labelled regions and `inert` while closed.

## MiCarousel
Scroll-snap carousel; each direct child of the default slot is a slide. Props: `loop` (false), `arrows` (true), `dots` (true), `orientation` (`horizontal` \| `vertical`), `align` (`start` \| `center`), `basis` (`100%`, shadcn `basis-*`, e.g. `33.333%`), `label`. Event `select` (index). `v-model`: 0-based slide index. Exposes `prev`, `next`, `goTo`. Arrow keys, Home/End navigate; region has `aria-roledescription="carousel"`.

## MiScrollArea
Scroll region with overlay scrollbars (thumbs move via `transform`, draggable). Props: `orientation` (`vertical` \| `horizontal` \| `both`), `maxHeight`, `label`. Native scrolling and keyboard preserved (focusable region).

## MiResizable
Split panels. Props: `orientation` (`horizontal` \| `vertical`), `minSize` (10), `minSizes` (per panel), `maxSize` (90), `step` (5), `withHandle` (grip), `handleLabel`. `v-model`: `number[]` of percentages (length = panel count). Slots `panel-0`, `panel-1`, ... (scoped `{ size }`). Handles are `role="separator"`: drag, arrows, Home/End.

## MiItem
Generic row. Props: `variant` (`default` \| `outline` \| `muted`), `size` (`default` \| `sm` \| `xs`), `title`, `description`, `mediaVariant` (`default` \| `icon` \| `image`), `href`. Slots: `header`, `media`, `title`, `description`, `actions`, `footer`, `default`. Group items inside MiList. Use MiListItem for settings-style rows inside MiList.

## MiDataTable
MiTable plus filter, pagination and selection. Props: `columns`, `rows`, `rowKey`, `filterable` (true), `filterPlaceholder`, `filterKey` (single-column filter), `filterKeys`, `columnToggle` (Columns menu), `pageSize` (10), `selectable`, `emptyText`, `caption`. Models: `selected`, `sort`, `filter`, `page`, `hidden` (hidden column keys). Filter uses MiInput. Slots: `cell-<key>` (scoped `{ row, value, ... }`), `toolbar`, `empty`.
