# Preline gap: content and navigation

Components added after a gap analysis against Preline. They follow `docs/CONVENTIONS.md` (tokens `--mi-*`, transform/opacity-only motion, SSR safe). Playground: `/preline-content`.

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

## MiSiteHeader

Marketing header. Container-query based: under 820px of its own width the links and actions collapse into a burger that opens an inline disclosure panel (focus moves to the first link, Escape closes and returns focus to the burger).

| Prop / model | Type | Default | Notes |
| --- | --- | --- | --- |
| `links` | `MiSiteLink[]` | `[]` | `{ label, href?, to?, active?, children? }`; children become a `MiMenu` dropdown (desktop) or a nested list (mobile) |
| `v-model:open` | `boolean` | `false` | mobile panel |
| `sticky` | `boolean` | `false` | fixed on top, translucent blurred surface |
| `ariaLabel` | `string` | `'Main'` | |

Slots: `logo`, `actions` (also repeated in the mobile panel), `link` `{ link, class }` to render NuxtLink. `to` renders as a plain anchor unless the `link` slot is used. Event: `navigate`.

## MiScrollspy and useMiScrollspy

`useMiScrollspy(ids, { rootMargin?, offset?, root? })` returns `{ active, refresh }`. It uses an IntersectionObserver, runs on the client only (`active` is `null` during SSR) and must be called inside `setup`. Default observation band: `-offset px 0px -60% 0px`.

| MiScrollspy prop / model | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `{ id, label, level? }[]` | | `id` is the section element id |
| `v-model:active` | `string` | | follows scrolling; set on click |
| `offset` | `number` | `80` | fixed header height, px |
| `rootMargin` | `string` | | overrides the derived margin |
| `ariaLabel` | `string` | `'On this page'` | |

Clicking scrolls smoothly (instantly under reduced motion) and locks scroll-driven updates for a moment so the active link does not flicker. The indicator moves with `transform`.
