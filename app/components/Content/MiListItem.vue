<script setup lang="ts">
/** Row for MiList or standalone: settings row, rich content row or profile row. Renders as div, link, NuxtLink or button by props. */
import { computed, resolveComponent, useSlots } from 'vue'
import { miSafeHref } from '../../utils/miSafe'

export type MiListTile = 'primary' | 'secondary' | 'red' | 'orange' | 'yellow' | 'green' | 'mint' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink'

defineSlots<{
  /** Leading visual such as an icon or avatar; sits in the colored tile when `tile` is set. */
  leading?(): unknown
  /** Replaces the whole text block (title, subtitle, description). */
  default?(): unknown
  /** Custom title replacing the `title` text. */
  title?(): unknown
  /** Custom subtitle replacing the `subtitle` text. */
  subtitle?(): unknown
  /** Trailing content such as a badge, switch or value. */
  trailing?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** `row`: settings-style row with inset separators. `rich`: multi-line content row. `profile`: large account row. */
  variant?: 'row' | 'rich' | 'profile'
  /** Main line of the row. */
  title?: string
  /** Secondary line under the title. */
  subtitle?: string
  /** Clamped (2 lines) excerpt under the subtitle, `rich` variant. */
  description?: string
  /** Trailing value text (row), or the timestamp on the title line (rich). */
  value?: string
  /** Show a disclosure chevron. */
  chevron?: boolean
  /** Colored rounded-square icon tile behind the `leading` slot content. */
  tile?: MiListTile
  /** `rich` variant unread gutter: true shows the primary dot, false reserves the space, undefined removes the gutter. */
  dot?: boolean
  /** Renders an anchor. */
  href?: string
  /** Renders a NuxtLink (requires Nuxt). */
  to?: string
  /** Renders a button. */
  button?: boolean
  /** Blocks interaction and dims the row. */
  disabled?: boolean
  /** Red styling for delete-like actions. */
  destructive?: boolean
  /** `center` centers the title block horizontally, for a standalone action row such as "Sign out" or "Delete account". Rows are always vertically centered. */
  align?: 'start' | 'center'
}>(), { variant: 'row', chevron: false, dot: undefined, align: 'start' })

const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
const slots = useSlots()

const tag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  if (props.button) return 'button'
  return 'div'
})
const interactive = computed(() => !!(props.to || props.href || props.button) && !props.disabled)
const bind = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.disabled ? undefined : miSafeHref(props.href), 'aria-disabled': props.disabled ? 'true' : undefined }
  if (props.button) return { type: 'button', disabled: props.disabled }
  return {}
})
const hasLeading = computed(() => !!slots.leading)
const hasText = computed(() => !!(props.title || props.subtitle || props.description || slots.title || slots.subtitle))

function onClick(e: MouseEvent) {
  if (props.disabled) { e.preventDefault(); return }
  emit('click', e)
}
</script>

<template>
  <div
    class="mi-li"
    :class="[`mi-li--${variant}`, { 'mi-li--int': interactive, 'mi-li--dis': disabled, 'mi-li--danger': destructive, 'mi-li--center': align === 'center' }]"
    role="listitem"
  >
    <component :is="tag" v-bind="bind" class="mi-li__main" @click="onClick">
      <span v-if="dot !== undefined && variant === 'rich'" class="mi-li__dotcol" aria-hidden="true"><span class="mi-li__dot" :class="{ 'mi-li__dot--on': dot }" /></span>
      <span v-if="hasLeading" class="mi-li__lead" :class="tile && `mi-li__tile mi-li__tile--${tile}`"><slot name="leading" /></span>
      <span class="mi-li__body">
        <slot>
          <template v-if="hasText">
            <span class="mi-li__text">
              <span class="mi-li__line">
                <span class="mi-li__title"><slot name="title">{{ title }}</slot></span>
                <span v-if="value && variant === 'rich'" class="mi-li__time">{{ value }}</span>
              </span>
              <span v-if="subtitle || slots.subtitle" class="mi-li__sub"><slot name="subtitle">{{ subtitle }}</slot></span>
              <span v-if="description" class="mi-li__desc">{{ description }}</span>
            </span>
          </template>
          <span v-else-if="title" class="mi-li__title mi-li__title--solo">{{ title }}</span>
        </slot>
        <span v-if="value && variant !== 'rich'" class="mi-li__value">{{ value }}</span>
        <slot name="trailing" />
        <svg v-if="chevron" class="mi-li__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </span>
    </component>
  </div>
</template>

<style scoped>
.mi-li{position:relative;font-family:var(--mi-font);color:var(--mi-label);min-width:0}
.mi-li__main{position:relative;display:flex;align-items:center;width:100%;margin:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;text-decoration:none;-webkit-tap-highlight-color:transparent;isolation:isolate}
.mi-li__main::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--mi-fill4);opacity:0;transition:opacity var(--mi-dur-1) linear;pointer-events:none}
.mi-li--int .mi-li__main{cursor:pointer}
.mi-li--int .mi-li__main:hover::before{opacity:1}
.mi-li--int .mi-li__main:active::before{opacity:1}
.mi-li--int .mi-li__main:focus-visible{outline-offset:-3px}
.mi-li--dis{opacity:.5}
.mi-li--dis .mi-li__main{cursor:default;pointer-events:none}
.mi-li__lead{display:flex;flex:none;align-items:center;justify-content:center}
.mi-li__tile{width:30px;height:30px;border-radius:8px;color:#fff;background:var(--mi-fill)}
.mi-li__tile :deep(svg){width:18px;height:18px}
.mi-li__tile--primary{background:var(--mi-p);color:var(--mi-p-on)}
.mi-li__tile--secondary{background:var(--mi-s);color:var(--mi-s-on)}
.mi-li__tile--red{background:var(--mi-red)}
.mi-li__tile--orange{background:var(--mi-orange)}
.mi-li__tile--yellow{background:var(--mi-yellow);color:#000}
.mi-li__tile--green{background:var(--mi-green)}
.mi-li__tile--mint{background:var(--mi-mint)}
.mi-li__tile--teal{background:var(--mi-teal)}
.mi-li__tile--blue{background:var(--mi-blue)}
.mi-li__tile--indigo{background:var(--mi-indigo)}
.mi-li__tile--purple{background:var(--mi-purple)}
.mi-li__tile--pink{background:var(--mi-pink)}
.mi-li__body{display:flex;flex:1;align-items:center;gap:10px;min-width:0}
.mi-li__text{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.mi-li__line{display:flex;justify-content:space-between;gap:8px;min-width:0}
.mi-li__title{min-width:0}
.mi-li__title--solo{flex:1}
.mi-li__chev{flex:none;color:var(--mi-label3)}
.mi-li__value{color:var(--mi-label2)}

/* row */
.mi-li--row .mi-li__main{gap:14px;padding-left:16px;font-size:17px}
.mi-li--row .mi-li__body{min-height:48px;padding-right:16px}
.mi-li--row .mi-li__text{gap:1px}
.mi-li--row .mi-li__sub{font-size:13px;color:var(--mi-label2)}
.mi-li--center .mi-li__body{justify-content:center}
.mi-li--center .mi-li__main{padding-left:0}
.mi-li--center .mi-li__body{padding-right:0}
.mi-li--center .mi-li__text{flex:none;align-items:center}
.mi-li--center .mi-li__title--solo{flex:none}
.mi-li--danger .mi-li__main{color:var(--mi-red-t)}

/* rich */
.mi-li--rich .mi-li__main{align-items:flex-start;gap:10px;padding:12px 16px}
.mi-li--rich .mi-li__main:has(.mi-li__dotcol){padding-left:10px}
.mi-li--rich .mi-li__body{align-items:center}
.mi-li--rich .mi-li__title{font-size:17px;font-weight:600}
.mi-li--rich .mi-li__time{font-size:15px;color:var(--mi-label2);white-space:nowrap}
.mi-li--rich .mi-li__sub{font-size:15px}
.mi-li--rich .mi-li__desc{font-size:15px;line-height:20px;color:var(--mi-label2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mi-li__dotcol{width:10px;flex:none;padding-top:7px}
.mi-li__dot{display:block;width:10px;height:10px;border-radius:50%;background:transparent}
.mi-li__dot--on{background:var(--mi-p)}

/* profile */
.mi-li--profile .mi-li__main{align-items:center;gap:14px;padding:12px 16px}
.mi-li--profile .mi-li__title{font-size:20px;font-weight:600}
.mi-li--profile .mi-li__sub{font-size:13px;color:var(--mi-label2)}
.mi-li--profile .mi-li__title--solo{font-size:20px;font-weight:600}
</style>
