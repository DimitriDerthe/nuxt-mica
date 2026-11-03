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
    class="mi-li mi:font-mi"
    :class="[`mi-li--${variant}`, { 'mi-li--int': interactive, 'mi-li--dis mi:opacity-50': disabled, 'mi-li--danger': destructive, 'mi-li--center': align === 'center' }]"
    role="listitem"
  >
    <component :is="tag" v-bind="bind" class="mi-li__main" @click="onClick">
      <span v-if="dot !== undefined && variant === 'rich'" class="mi-li__dotcol mi:w-2.5 mi:flex-[none] mi:pt-[7px]" aria-hidden="true"><span class="mi-li__dot mi:block mi:w-2.5 mi:h-2.5 mi:rounded-[50%]" :class="{ 'mi-li__dot--on': dot }" /></span>
      <span v-if="hasLeading" class="mi-li__lead mi:flex mi:flex-[none] mi:items-center mi:justify-center" :class="tile && `mi-li__tile mi-li__tile--${tile}`"><slot name="leading" /></span>
      <span class="mi-li__body mi:flex mi:flex-1 mi:items-center mi:gap-2.5 mi:min-w-0 mi:[.mi-li--row_&]:min-h-12 mi:[.mi-li--center_&]:justify-center mi:[.mi-li--rich_&]:items-center">
        <slot>
          <template v-if="hasText">
            <span class="mi-li__text mi:flex mi:flex-1 mi:flex-col mi:gap-0.5 mi:min-w-0 mi:[.mi-li--row_&]:gap-px mi:[.mi-li--center_&]:flex-[none] mi:[.mi-li--center_&]:items-center">
              <span class="mi-li__line mi:flex mi:justify-between mi:gap-2 mi:min-w-0">
                <span class="mi-li__title mi:min-w-0"><slot name="title">{{ title }}</slot></span>
                <span v-if="value && variant === 'rich'" class="mi-li__time mi:[.mi-li--rich_&]:text-[15px] mi:[.mi-li--rich_&]:text-label2 mi:[.mi-li--rich_&]:whitespace-nowrap">{{ value }}</span>
              </span>
              <span v-if="subtitle || slots.subtitle" class="mi-li__sub"><slot name="subtitle">{{ subtitle }}</slot></span>
              <span v-if="description" class="mi-li__desc mi:[.mi-li--rich_&]:text-[15px] mi:[.mi-li--rich_&]:leading-5 mi:[.mi-li--rich_&]:text-label2 mi:[.mi-li--rich_&]:[display:-webkit-box] mi:[.mi-li--rich_&]:[-webkit-line-clamp:2] mi:[.mi-li--rich_&]:[-webkit-box-orient:vertical] mi:[.mi-li--rich_&]:overflow-hidden">{{ description }}</span>
            </span>
          </template>
          <span v-else-if="title" class="mi-li__title mi-li__title--solo mi:min-w-0 mi:flex-1 mi:[.mi-li--center_&]:flex-[none]">{{ title }}</span>
        </slot>
        <span v-if="value && variant !== 'rich'" class="mi-li__value mi:text-label2">{{ value }}</span>
        <slot name="trailing" />
        <svg v-if="chevron" class="mi-li__chev mi:flex-[none] mi:text-label3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </span>
    </component>
  </div>
</template>

<style scoped>
.mi-li{position:relative;color:var(--mi-label);min-width:0}
.mi-li__main{position:relative;display:flex;align-items:center;width:100%;margin:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;text-decoration:none;-webkit-tap-highlight-color:transparent;isolation:isolate}
.mi-li__main::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--mi-fill4);opacity:0;transition:opacity var(--mi-dur-1) linear;pointer-events:none}
.mi-li--int .mi-li__main{cursor:pointer}
.mi-li--int .mi-li__main:hover::before{opacity:1}
.mi-li--int .mi-li__main:active::before{opacity:1}
.mi-li--int .mi-li__main:focus-visible{outline-offset:-3px}
.mi-li--dis .mi-li__main{cursor:default;pointer-events:none}
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

/* row */
.mi-li--row .mi-li__main{gap:14px;padding-left:16px;font-size:17px}
.mi-li--row .mi-li__body{padding-right:16px}
.mi-li--row .mi-li__sub{font-size:13px;color:var(--mi-label2)}
.mi-li--center .mi-li__main{padding-left:0}
.mi-li--center .mi-li__body{padding-right:0}
.mi-li--danger .mi-li__main{color:var(--mi-red-t)}

/* rich */
.mi-li--rich .mi-li__main{align-items:flex-start;gap:10px;padding:12px 16px}
.mi-li--rich .mi-li__main:has(.mi-li__dotcol){padding-left:10px}
.mi-li--rich .mi-li__title{font-size:17px;font-weight:600}
.mi-li--rich .mi-li__sub{font-size:15px}
.mi-li__dot{background:transparent}
.mi-li__dot--on{background:var(--mi-p)}

/* profile */
.mi-li--profile .mi-li__main{align-items:center;gap:14px;padding:12px 16px}
.mi-li--profile .mi-li__title{font-size:20px;font-weight:600}
.mi-li--profile .mi-li__sub{font-size:13px;color:var(--mi-label2)}
.mi-li--profile .mi-li__title--solo{font-size:20px;font-weight:600}
</style>
