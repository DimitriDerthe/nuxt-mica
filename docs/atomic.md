# Utility classes (`mi:`)

Mica ships its own atomic CSS engine (`modules/mi-atomic`), Tailwind-like and prefixed with `mi:` so it never collides with Tailwind or another utility framework in the consuming app. No dependency, no runtime: at build time the module scans the `app/` directory of every layer and of the project, keeps the `mi:` classes it finds and writes their CSS, and nothing else, to `.nuxt/mi-atomic.css`. In dev, an edit regenerates the sheet and hot-reloads it.

```vue
<section class="mi:@container mi:grid mi:content-start mi:gap-4.5">
  <div class="mi:grid mi:grid-cols-1 mi:@[560px]:grid-cols-2 mi:gap-3">
    <article class="mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:hover:bg-p/10">…</article>
  </div>
</section>
```

## Syntax

`mi:<variant>:…:<utility>`, with `!` at the end for `!important` (`mi:flex!`).

- **Spacing scale**: `n` × 4px, resolved to a literal (`mi:gap-4.5` → `gap:18px`, `mi:p-px` → `1px`). Negative with a leading dash: `mi:-mt-2`.
- **Arbitrary values**: `mi:gap-[18px]`, `mi:w-[calc(100%_-_2px)]` (`_` is a space, `\_` an underscore). Type hints when a value is ambiguous: `mi:text-[length:var(--x)]`, `mi:bg-[image:var(--g)]`.
- **Variable shorthand**: `mi:bg-(--mi-fill3)` → `var(--mi-fill3)`.
- **Arbitrary properties**: `mi:[font-variant-numeric:tabular-nums]`, `mi:[--_i:1]`.

The class must appear whole in the source (`'mi:bg-card'`, not `'mi:bg-' + tone`): the scanner reads source text, it does not run code.

## Theme (Mica tokens)

| Utility | Values |
| --- | --- |
| Colors `bg-`, `text-`, `border-*-`, `outline-`, `decoration-`, `fill-`, `stroke-`, `accent-`, `caret-` | `page card elev seg label label2 label3 sep sep2 fill fill2 fill3 fill4 field field-b off scrim mat mat-b side ctl red red-t orange orange-t yellow green green-t mint teal blue indigo purple pink`, brand `p p-on p-hover p-tint p-tint2 p-text` and `s…`, plus `current transparent inherit white black`. Opacity: `mi:bg-p/20` → `color-mix(in srgb, var(--mi-p) 20%, transparent)` |
| `rounded-*` | `none sm md lg xl full` (`sm`…`xl` are `var(--mi-radius-s|m|l|xl)`), bare `rounded` is 4px |
| `shadow-*` | `1 2 3 none` (`var(--mi-sh*)`) |
| `ease-*` | `mi mi-in-out spring linear in out in-out` |
| `font-sans`, `font-mi` | `var(--mi-font)` |

## Utilities

Layout: `block inline-block inline flex inline-flex grid inline-grid contents hidden flow-root …`, `static fixed absolute relative sticky`, `inset[-x|-y]-* top-* right-* bottom-* left-* start-* end-*`, `z-*`, `order-*`, `isolate`, `overflow[-x|-y]-*`, `overscroll-*`, `visible invisible`, `box-border box-content`, `aspect-*`, `object-*`, `float-*`, `clear-*`, `columns-*`, `align-*`.

Flex and grid (`*-start`/`*-end` give the box alignment keywords `start`/`end`, `*-flex-start`/`*-flex-end` the flexbox ones): `flex-row|col[-reverse]`, `flex-wrap|nowrap`, `flex-1|auto|initial|none|[…]`, `grow`, `shrink`, `basis-*`, `grid-cols-*`, `grid-rows-*`, `col-span-*`, `col-start-*`, `col-end-*`, `row-*`, `auto-cols-*`, `auto-rows-*`, `grid-flow-*`, `gap[-x|-y]-*`, `justify-*`, `justify-items-*`, `justify-self-*`, `content-*`, `items-*`, `self-*`, `place-content|items|self-*`.

Box: `p|px|py|pt|pr|pb|pl|ps|pe-*`, same for `m*` (with `auto`), `scroll-p*`, `scroll-m*`, `w|h|min-w|min-h|max-w|max-h|size-*` (scale, fractions `1/2`, `full auto min max fit screen svh dvh lvh`).

Typography: `text-xs…9xl` (with `/n` line height), `text-[13px]`, `text-<color>`, `text-left|center|right|justify|start|end`, `font-thin…black`, `font-[600]`, `leading-*`, `tracking-*`, `italic`, `underline`, `line-through`, `no-underline`, `uppercase lowercase capitalize normal-case`, `truncate`, `text-ellipsis|clip`, `whitespace-*`, `text-wrap|nowrap|balance|pretty`, `break-*`, `hyphens-*`, `tabular-nums` and the other numeric variants, `line-clamp-*`, `indent-*`, `list-*`, `decoration-*`, `underline-offset-*`, `content-[…]`.

Backgrounds and borders: `bg-<color>`, `bg-[url()|gradient]`, `bg-none`, `bg-cover|contain|auto`, `bg-<position>`, `bg-repeat…`, `bg-clip-*`, `bg-origin-*`, `border[-x|-y|-t|-r|-b|-l|-s|-e][-n|-<color>]` (bare `border` is 1px solid), `border-solid|dashed|dotted|double|hidden|none`, `border-collapse|separate`, `rounded[-t|-r|-b|-l|-s|-e|-tl|-tr|-br|-bl|-ss|-se|-ee|-es]-*`, `outline[-n|-<color>]`, `outline-offset-*`, `outline-none|hidden`.

Effects: `shadow-*`, `opacity-*`, `mix-blend-*`, `blur-*`, `brightness-*`, `contrast-*`, `grayscale`, `hue-rotate-*`, `invert`, `saturate-*`, `sepia`, `drop-shadow-[…]` and the same with `backdrop-` (they compose), `filter-[…]`, `filter-none`.

Transforms and motion: `translate[-x|-y]-*`, `scale[-x|-y]-*`, `rotate-*` (individual CSS properties, they compose), `transform-[…]`, `origin-*`, `backface-*`, `perspective-*`, `transition[-colors|-opacity|-shadow|-transform|-none|-[…]]` (Mica easing and `--mi-dur-2` by default), `duration-*`, `ease-*`, `delay-*`, `animate-<motion>|none|[…]`. Animate only `transform` and `opacity`.

### Motion

No component or block writes `@keyframes`: `animate-<name>` plays one of the shared shapes below, tuned per element with CSS variables (`mi:[--mi-in-y:8px] mi:animate-in`). `animate-[<name>_.3s_ease-out_both]` keeps the shape and sets the rest of the shorthand. `in`, `out` and `grow` leave the other end of the animation implicit, so they start from or end at the element's own `translate-*`, `scale-*` and `opacity-*`.

| Shape | Default shorthand | Keyframes and variables |
| --- | --- | --- |
| `in` | `var(--mi-dur-2) var(--mi-ease) both` | from `opacity: --mi-in-o (0)`, `rotate(--mi-in-r) translate(--mi-in-x, --mi-in-y) scale(--mi-in-sx, --mi-in-sy)` (`--mi-in-s` sets both axes) |
| `out` | `var(--mi-dur-2) var(--mi-ease) both` | to the same, with `--mi-out-*` |
| `grow` | `var(--mi-dur-3) var(--mi-ease) both` | from `scale(--mi-grow-x (0), --mi-grow-y (1))` to `scale(--mi-grow-x-to (1), --mi-grow-y-to (1))` |
| `shake` | `var(--mi-dur-3) var(--mi-ease)` | ±`--mi-shake` (6px) on the x axis |
| `blink` | `1s var(--mi-ease-in-out) infinite` | 50% `opacity: --mi-blink (0)` |
| `pulse` | `2s cubic-bezier(.4,0,.6,1) infinite` | 50% `opacity: --mi-pulse (.5)` |
| `beat` | `1s var(--mi-ease-in-out) infinite` | 50% `scale(--mi-beat (1.06))`, `opacity: --mi-beat-o (1)` |
| `float` | `2s var(--mi-ease-in-out) infinite` | 50% `translate(--mi-float-x (0), --mi-float (-8px))` |
| `spin` | `1s linear infinite` | to `rotate(360deg)` |

Honor `motion-reduce:animate-none`. Vue transitions take utilities too: `<Transition enter-active-class="mi:transition-[opacity,transform]" enter-from-class="mi:opacity-0 mi:translate-y-2">`.

Interactivity and misc: `cursor-*`, `pointer-events-*`, `select-*`, `resize[-x|-y|-none]`, `touch-*`, `scroll-smooth|auto`, `snap-*`, `appearance-*`, `will-change-*`, `table-auto|fixed`, `sr-only`, `not-sr-only`, `@container` (inline-size), `@container/<name>`, `@container-size`, `@container-normal`.

## Variants

- **States**: `hover focus focus-visible focus-within active disabled enabled checked indeterminate default required valid invalid in-range out-of-range placeholder-shown autofill read-only open visited target`, `first last only odd even first-of-type last-of-type only-of-type empty`. `hover:` is a plain `:hover`, not wrapped in `@media (hover:hover)`.
- **Pseudo-elements**: `before after placeholder selection marker file backdrop first-line first-letter`. They do not add `content`; write `mi:before:content-['']`.
- **Attributes**: `aria-<busy|checked|disabled|expanded|hidden|pressed|readonly|required|selected|current|invalid>` (`="true"`), `aria-[sort=ascending]`, `data-<name>`, `data-[state=open]`.
- **Relations**: `not-<state>`, `not-[.x]`, `has-[…]`, `group-<state>` / `group-[…]` / `group-aria-*` with `mi:group` on the ancestor (`group-hover/name` with `mi:group/name`), `peer-<state>` with `mi:peer` on a previous sibling, `*` (children), `**` (descendants), `[&_span]` / `[.is-on_&]` (any selector, `&` is the element), `dark`, `ltr`, `rtl`.
- **Container queries**: `@3xs…@7xl` (256px…1280px), `@[560px]`, `@max-[560px]`, `@min-[…]`, named `@[560px]/sidebar`. The element must sit inside a size container (`mi:@container`); a container never queries itself.
- **Media queries**: `sm md lg xl 2xl` (640, 768, 1024, 1280, 1536px), `max-md`, `min-[900px]`, `max-[900px]`, `motion-safe motion-reduce contrast-more contrast-less forced-colors print portrait landscape pointer-fine pointer-coarse can-hover`, `supports-[display:grid]`, `[@media(…)]`.

Variants apply left to right: `mi:[&_span]:hover:underline` styles a hovered span, `mi:hover:[&_span]:underline` styles the spans of a hovered element.

## Cascade

The order of the generated sheet is fixed, not taken from the source: rules without at-rules first, then media queries, then container queries (each sorted by width, `min` ascending, `max` descending); within a group, plain rules before variants; then shorthands before longhands (`mi:p-4 mi:pt-2` keeps the 8px top padding). Utilities are single-class selectors, unlayered, loaded after `mi.css` (whose base rules use `:where()`, so a utility beats them): a scoped style (`.x[data-v]`) still wins over them.

## Production build

Dev serves one readable sheet of `mi:` classes. A production build (`nuxt build`/`nuxt generate`) goes further, with the same rendering:

- **Short names** (`mangle`): every class becomes `_0`, `_1`, … in markup, scripts and CSS, the most used getting the shortest. `?raw` imports keep the readable source.
- **Composition** (`compose`): the static `mi:` classes of each template element merge into one class, written into the component's own stylesheet (inside its `<style scoped>` block as `:global()` rules, so no scope attribute and no extra sheet). The rules keep the engine's order, and block/inline pairs fold back into shorthands (`padding: 16px 18px`). An element then has one class to match, as with a hand-written rule, and a page loads only the rules of the components it renders. Classes set from `:class` or from script stay atomic; those that could compete on one element stay in the global sheet, in its fixed order.
- **Strip** (`strip`, opt-in per directory): composed elements drop the plain class names nothing selects any more. Meant for app code; the layer's own `mi-*` class names stay.

```ts
export default defineNuxtConfig({
  miAtomic: { prefix: 'mi', scan: ['content'], mangle: true, compose: true, strip: ['app/pages'] }
})
```

`mangle` and `compose` default to on in production and off in dev; `strip` defaults to none.

## Performance

- Only the classes present in the sources are generated: the sheet is tree-shaken by construction. No runtime code.
- Values are literals where possible (`18px`, not `calc(var(--spacing) * 4.5)`); helper `@property` and `@keyframes` blocks are emitted only when a class needs them.
- Every rule is one class selector, rules with the same declarations are merged, and each at-rule block is opened once.

## Migrating scoped CSS

`node scripts/atomic-convert.mjs <file|dir>` moves `<style scoped>` declarations to `mi:` classes without changing what any element computes: it models every cascade a declaration takes part in (specificity, source order, the fixed order of the utility sheet, classes passed to and by components) and leaves in the scoped block whatever could change outcome, plus keyframes, `v-bind()` and `:deep()`. `node scripts/iso-check.mjs` checks the result on a static build: computed style and box of every element, at several widths, in both themes.
