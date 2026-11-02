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
Scroll-snap carousel; each direct child of the default slot is a slide. Props: `loop` (false), `arrows` (true), `dots` (true), `orientation` (`horizontal` \| `vertical`), `align` (`start` \| `center`), `basis` (`100%`, e.g. `33.333%`), `label`. Event `select` (index). `v-model`: 0-based slide index. Exposes `prev`, `next`, `goTo`. Arrow keys, Home/End navigate; region has `aria-roledescription="carousel"`.

## MiScrollArea
Scroll region with overlay scrollbars (thumbs move via `transform`, draggable). Props: `orientation` (`vertical` \| `horizontal` \| `both`), `maxHeight`, `label`. Native scrolling and keyboard preserved (focusable region).

## MiResizable
Split panels. Props: `orientation` (`horizontal` \| `vertical`), `minSize` (10), `minSizes` (per panel), `maxSize` (90), `step` (5), `withHandle` (grip), `handleLabel`. `v-model`: `number[]` of percentages (length = panel count). Slots `panel-0`, `panel-1`, ... (scoped `{ size }`). Handles are `role="separator"`: drag, arrows, Home/End.

## MiItem
Generic row. Props: `variant` (`default` \| `outline` \| `muted`), `size` (`default` \| `sm` \| `xs`), `title`, `description`, `mediaVariant` (`default` \| `icon` \| `image`), `href`. Slots: `header`, `media`, `title`, `description`, `actions`, `footer`, `default`. Group items inside MiList. Use MiListItem for settings-style rows inside MiList.

## MiDataTable
MiTable plus filter, pagination and selection. Props: `columns`, `rows`, `rowKey`, `filterable` (true), `filterPlaceholder`, `filterKey` (single-column filter), `filterKeys`, `columnToggle` (Columns menu), `pageSize` (10), `selectable`, `emptyText`, `caption`. Models: `selected`, `sort`, `filter`, `page`, `hidden` (hidden column keys). Filter uses MiInput. Slots: `cell-<key>` (scoped `{ row, value, ... }`), `toolbar`, `empty`.

## MiTree

Tree view with the WAI-ARIA tree pattern (`tree`, `treeitem`, `group`, roving tabindex). Branches animate with `grid-template-rows`; children mount on first expansion. Rendered recursively through the internal `MiTreeNode`.

| Prop / model | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `MiTreeItem[]` | | `{ id, label, icon?, children?, disabled? }` |
| `v-model:selected` | `id \| id[] \| null` | | single id, or an array with `multiple` / `checkable` |
| `v-model:expanded` | `id[]` | `[]` | open branches |
| `multiple` | `boolean` | `false` | several selected nodes |
| `checkable` | `boolean` | `false` | checkboxes; parents show a mixed state; the model holds checked leaves |
| `ariaLabel` | `string` | `'Tree'` | |

Keyboard: Up/Down, Home/End, Right (expand, then first child), Left (collapse, then parent), Enter/Space (select or check), `*` (expand siblings), type-ahead by label. Disabled nodes are skipped.

`MiTreeNode` (internal): props `item`, `level`, `ctx`, `setSize`, `posInSet`.

## MiTimeline / MiTimelineItem

Semantic `<ol>` feed. Use the `items` shortcut or compose `MiTimelineItem` parts in the default slot.

| MiTimeline prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `MiTimelineEntry[]` | `[]` | `{ title, description?, time?, icon?, tone?, status? }` |
| `align` | `'start' \| 'alternate'` | `'start'` | `alternate` splits sides when the container is at least 640px wide |
| `ariaLabel` | `string` | `'Timeline'` | |

| MiTimelineItem prop / slot | Type | Default | Notes |
| --- | --- | --- | --- |
| `title`, `description` | `string` | | |
| `time` | `string \| Date` | | `<time>` element; a Date shows as `YYYY-MM-DD` |
| `datetime` | `string` | derived | machine-readable value |
| `icon` | icon name | | marker glyph, a dot when omitted |
| `tone` | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'` | marker color |
| `status` | `'done' \| 'current' \| 'upcoming'` | `'done'` | `current` gets `aria-current="step"` and a pulse (off under reduced motion) |
| slots | | | default (extra content), `title`, `time`, `marker` |

## MiSortable

Dependency-free drag-and-drop reordering. Pointer drag uses one rAF that writes `transform` through CSS variables, a dashed placeholder and optional auto-scroll; the order is committed on drop.

| Prop / model | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `object[]` | `[]` | ordered items |
| `itemKey` | `string` | `'id'` | key field (primitive items use themselves) |
| `handle` | `boolean` | `false` | dedicated drag handle; only it drags and takes focus (best for touch) |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | |
| `gap` | `number` | `8` | px |
| `autoScroll` | `boolean` | `true` | scroll the nearest scrollable ancestor near its edge |
| `disabled` | `boolean` | `false` | |
| `itemLabel` | `(item, index) => string` | `Item N` | spoken names |
| `ariaLabel` | `string` | `'Sortable list'` | |

Slots: default `{ item, index, dragging }`, `handle` `{ item, index, dragging }`. Event: `reorder` `{ from, to }`.
Keyboard (on the row, or the handle): Space grabs, Arrow keys (Left/Right when horizontal) move, Home/End jump, Space/Enter drops, Escape restores the original order. Every step is announced in an `aria-live` region.

## MiMarquee

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `speed` | `number` | `40` | px per second |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'left'` | per axis, `right`/`down` reverse |
| `pauseOnHover` | `boolean` | `true` | also on focus within |
| `gap` | `number` | `32` | px |
| `vertical` | `boolean` | `false` | needs a height (default 16rem) |
| `fade` | `boolean` | `true` | edge mask |
| `ariaLabel` | `string` | | makes the strip a labelled region |

The content is repeated to fill the track and cloned once for a seamless loop; clones are `aria-hidden`. Under `prefers-reduced-motion` it stops, hides the clone and scrolls manually.

## MiBlockquote

`<figure><blockquote><figcaption>`.

| Prop / slot | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'plain' \| 'bordered' \| 'card'` | `'plain'` | |
| `size` | `'md' \| 'lg'` | `'md'` | |
| `quote` | `string` | | alternative to the default slot |
| `cite` | `string` | | author |
| `role` | `string` | | caption second line |
| `source` | `string` | | URL for the `cite` attribute |
| slots | | | default, `cite`, `avatar` |
