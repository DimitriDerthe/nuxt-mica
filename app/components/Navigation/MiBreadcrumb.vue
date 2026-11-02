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
  <nav v-if="variant === 'breadcrumb'" class="mi-bc" :aria-label="ariaLabel">
    <ol class="mi-bc__list">
      <li v-for="(it, i) in items" :key="i" class="mi-bc__item">
        <span v-if="isLast(i)" class="mi-bc__current" aria-current="page">{{ it.label }}</span>
        <template v-else>
          <a class="mi-bc__link" :href="miSafeHref(it.href) ?? '#'" @click="go($event, it, i)">{{ it.label }}</a>
          <MiNavGlyph name="chevron-right" :size="12" :stroke="2.6" class="mi-bc__sep" />
        </template>
      </li>
    </ol>
  </nav>
  <nav v-else class="mi-path" :aria-label="ariaLabel">
    <ol class="mi-path__list">
      <li v-for="(it, i) in items" :key="i" class="mi-path__item">
        <span v-if="isLast(i)" class="mi-path__current" aria-current="page">{{ it.label }}</span>
        <a v-else class="mi-path__link" :href="miSafeHref(it.href) ?? '#'" @click="go($event, it, i)">
          <MiNavGlyph v-if="it.icon !== false" name="folder" :size="14" :stroke="2" class="mi-path__ic" />{{ it.label }}
        </a>
        <span v-if="!isLast(i)" class="mi-path__sep" aria-hidden="true">›</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.mi-bc,.mi-path{font-family:var(--mi-font)}
.mi-bc__list{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:4px;font-size:14px}
.mi-bc__item{display:inline-flex;align-items:center;gap:4px}
.mi-bc__link{color:var(--mi-p-text);text-decoration:none;border-radius:4px}
.mi-bc__link:hover{text-decoration:underline;text-underline-offset:3px}
.mi-bc__sep{color:var(--mi-label3)}
.mi-bc__current{font-weight:600;color:var(--mi-label)}
.mi-path__list{list-style:none;margin:0;padding:4px 8px;display:flex;flex-wrap:wrap;align-items:center;gap:2px;border-radius:8px;background:var(--mi-fill4);font-size:13px;color:var(--mi-label2)}
.mi-path__item{display:inline-flex;align-items:center;gap:2px}
.mi-path__link{display:inline-flex;align-items:center;gap:4px;color:inherit;text-decoration:none;border-radius:4px}
.mi-path__link:hover{color:var(--mi-label)}
.mi-path__ic{color:var(--mi-blue)}
.mi-path__current{color:var(--mi-label);font-weight:500}
.mi-bc a:focus-visible,.mi-path a:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
</style>
