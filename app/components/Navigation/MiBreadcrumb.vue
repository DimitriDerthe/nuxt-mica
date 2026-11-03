<script setup lang="ts">
/** Breadcrumb trail or Finder-style path bar (variant "path"); the last item is the current page and is not a link. */
import MiNavGlyph from './MiNavGlyph.vue'
import { miSafeHref } from '../../utils/miSafe'

export interface MiBreadcrumbItem { label: string, href?: string, icon?: boolean }

const props = withDefaults(defineProps<{
  /** Trail from root to current page; the last item is shown as the current page. */
  items: MiBreadcrumbItem[]
  /** `breadcrumb` is the linked trail, `path` the Finder style path control. */
  variant?: 'breadcrumb' | 'path'
  /** Accessible name of the navigation landmark. */
  ariaLabel?: string
}>(), { variant: 'breadcrumb', ariaLabel: 'Breadcrumb' })

const emit = defineEmits<{ navigate: [item: MiBreadcrumbItem, index: number] }>()

function go(e: Event, item: MiBreadcrumbItem, i: number) {
  if (!item.href || item.href === '#') e.preventDefault()
  emit('navigate', item, i)
}
const isLast = (i: number) => i === props.items.length - 1
</script>

<template>
  <nav v-if="variant === 'breadcrumb'" class="mi-bc mi:font-mi" :aria-label="ariaLabel">
    <ol class="mi-bc__list mi:[list-style:none] mi:m-0 mi:p-0 mi:flex mi:flex-wrap mi:items-center mi:gap-1 mi:text-[14px]">
      <li v-for="(it, i) in items" :key="i" class="mi-bc__item mi:inline-flex mi:items-center mi:gap-1">
        <span v-if="isLast(i)" class="mi-bc__current mi:font-semibold mi:text-label" aria-current="page">{{ it.label }}</span>
        <template v-else>
          <a class="mi-bc__link mi:text-p-text mi:[text-decoration:none] mi:rounded-[4px] mi:hover:[text-decoration:underline] mi:hover:underline-offset-[3px]" :href="miSafeHref(it.href) ?? '#'" @click="go($event, it, i)">{{ it.label }}</a>
          <MiNavGlyph name="chevron-right" :size="12" :stroke="2.6" class="mi-bc__sep mi:text-label3" />
        </template>
      </li>
    </ol>
  </nav>
  <nav v-else class="mi-path mi:font-mi" :aria-label="ariaLabel">
    <ol class="mi-path__list mi:[list-style:none] mi:m-0 mi:py-1 mi:px-2 mi:flex mi:flex-wrap mi:items-center mi:gap-0.5 mi:rounded-[8px] mi:bg-fill4 mi:text-[13px] mi:text-label2">
      <li v-for="(it, i) in items" :key="i" class="mi-path__item mi:inline-flex mi:items-center mi:gap-0.5">
        <span v-if="isLast(i)" class="mi-path__current mi:text-label mi:font-medium" aria-current="page">{{ it.label }}</span>
        <a v-else class="mi-path__link mi:inline-flex mi:items-center mi:gap-1 mi:text-inherit mi:[text-decoration:none] mi:rounded-[4px] mi:hover:text-label" :href="miSafeHref(it.href) ?? '#'" @click="go($event, it, i)">
          <MiNavGlyph v-if="it.icon !== false" name="folder" :size="14" :stroke="2" class="mi-path__ic mi:text-blue" />{{ it.label }}
        </a>
        <span v-if="!isLast(i)" class="mi-path__sep" aria-hidden="true">›</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.mi-bc a:focus-visible,.mi-path a:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
</style>
