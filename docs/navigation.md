# Navigation

All components live in `app/components/Navigation/`. Motion uses `transform`/`opacity` only; theming comes from `--mi-*` tokens (brand: `--mi-p*`, `--mi-s*`).
Optional tokens (with fallbacks): `--mi-side` (sidebar surface, falls back to `--mi-page`), `--mi-ctl` (idle step ring, falls back to `--mi-label3`).

## MiToolbar
Window toolbar with material background.
| Prop | Type | Default |
|---|---|---|
| `title`, `subtitle` | string | |
| `sidebarToggle`, `history`, `share` | boolean | `true` |
| `canGoBack` / `canGoForward` | boolean | `true` / `false` |
| `views` | `{id,label,icon}[]` | segmented view switcher |
| `searchable`, `searchPlaceholder` | boolean, string | `Search` |
| `primaryLabel`, `avatar` | string | hidden when omitted |
| `v-model:view`, `v-model:search` | string | |

Events: `toggle-sidebar`, `back`, `forward`, `share`, `primary`, `search`. Slots: `leading`, `title`, default (trailing).

## MiSidebar
| Prop | Type | Notes |
|---|---|---|
| `groups` | `{id?,label?,collapsible?,items[]}[]` | item: `{id,label,icon?,color?,badge?,href?,disabled?}`; `color` renders a tag dot |
| `v-model` | string | active item id |
| `v-model:collapsed` | boolean | slides out with a transform (content is `inert`); the parent decides how to reflow |
| `footerLabel` | string | pinned action |

Events: `select`, `footer`. Slot: `footer`. Arrow keys move between rows.

## MiNavBar
Large title that collapses while scrolling. The 54px row is sticky; the large title scrolls away naturally and fades via one rAF-throttled CSS variable.
Props: `title`, `backLabel`, `actionLabel`, `large` (true), `target` (element or selector; default nearest scrollable ancestor, else window). `v-model:collapsed`. Events `back`, `action`. Slots `leading`, `trailing`, `title`. Place it as a direct child of the scroll container.

## MiTabBar
Props: `items` (`{id,label,icon?,badge?}[]`), `variant` (`bar` | `capsule`), `ariaLabel`. `v-model` = active id. Left/Right/Home/End move focus.

## MiSteps
Props: `steps` (`{label,description?}[]`), `orientation` (`vertical` | `horizontal`), `clickable` (true). `v-model` = current index.

## MiLocalNav
Props: `title`, `items` (`{id,label,disabled?}[]`), `actionLabel`, `sticky` (true). `v-model` = active id. Event `action`. Slots `title`, `action`.

## MiBreadcrumb
Props: `items` (`{label,href?,icon?}[]`), `variant` (`breadcrumb` | `path`). Event `navigate(item, index)`. Last item is `aria-current="page"`.

## MiPagination
Props: `total`, `siblings` (1), `summary` (true). `v-model` = page (1-based). Collapses to ellipses beyond 7 pages.

## MiPageControl
Props: `count`, `itemLabel` ("Slide"), `ariaLabel`. `v-model` = zero-based index. Arrow keys, Home/End.

## MiTabs
Compound: `<MiTabs v-model="tab"><MiTabsList><MiTabsTrigger value="a">A</MiTabsTrigger></MiTabsList><MiTabsContent value="a">...</MiTabsContent></MiTabs>`. Shortcut: `items` (`{value,label,disabled?}[]`) renders the list itself and panels become slots named after each value. Props: `orientation` (`horizontal` | `vertical`), `ariaLabel`. `v-model` = selected value. MiTabsTrigger props `value`, `disabled`; MiTabsContent prop `value`; MiTabsList prop `ariaLabel`. Arrows/Home/End move and select.

## MiMenubar
Props: `menus` (`{id,label,items: MiMenuItem[],disabled?}[]`), `ariaLabel`. Event `select(menuId, item)`. Built on MiMenu; once a menu is open, hovering another trigger switches to it. Left/Right/Home/End move between triggers.

## MiNavigationMenu
Props: `items` (`{id,label,href?,links?: {title,description?,href}[]}[]`), `ariaLabel`, `viewport` (true: one shared panel under the bar; false: anchored under each trigger), `hover` (true), `closeDelay` (150 ms). `v-model` = open item id. Event `navigate(link)`. ArrowDown enters a flyout, Escape closes.

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
