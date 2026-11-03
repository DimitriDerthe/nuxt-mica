<script setup lang="ts">
/** Vertical sidebar with grouped, optionally collapsible sections, icon/colour/badge rows; v-model is the selected item id. */
import { reactive, ref } from 'vue'
import MiNavGlyph from './MiNavGlyph.vue'
import { miNavRoving, type MiNavIconName } from '../../utils/miNav'
import { miSafeHref } from '../../utils/miSafe'

export type MiSidebarColor = 'red' | 'orange' | 'yellow' | 'green' | 'mint' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink'
export interface MiSidebarItem {
  id: string
  label: string
  icon?: MiNavIconName
  /** Renders a coloured dot instead of an icon (tags). */
  color?: MiSidebarColor
  badge?: number | string
  href?: string
  disabled?: boolean
}
export interface MiSidebarGroup { id?: string, label?: string, items: MiSidebarItem[], collapsible?: boolean }

const props = withDefaults(defineProps<{
  /** Sections of rows. A group's id keys its collapsed state and defaults to its index. */
  groups: MiSidebarGroup[]
  /** Label of the pinned footer action. Omit to hide it. */
  footerLabel?: string
  /** Accessible name of the sidebar navigation. */
  ariaLabel?: string
}>(), { ariaLabel: 'Sidebar' })

const emit = defineEmits<{ footer: [], select: [item: MiSidebarItem] }>()
/** Id of the selected item. */
const model = defineModel<string>()
/** Hidden state: the sidebar slides out with a transform, it never reflows its content. */
const collapsed = defineModel<boolean>('collapsed', { default: false })
const root = ref<HTMLElement | null>(null)
const closed = reactive<Record<string, boolean>>({})

const gid = (g: MiSidebarGroup, i: number) => g.id ?? `g${i}`
function pick(it: MiSidebarItem, e?: Event) {
  if (it.disabled) { e?.preventDefault(); return }
  if (!it.href || it.href === '#') e?.preventDefault()
  model.value = it.id
  emit('select', it)
}
function onKey(e: KeyboardEvent) { miNavRoving(e, root.value, '.mi-sb__row:not([aria-disabled=true])', 'vertical') }
defineSlots<{
  /** Replaces the pinned footer action. */
  footer?(): unknown
}>()
</script>

<template>
  <nav
    ref="root" class="mi-sb mi:[--mi-sb-expand:grid-template-rows_var(--mi-dur-3)_var(--mi-ease)] mi:font-mi mi:max-w-full mi:flex-col mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease),opacity_var(--mi-dur-2)_var(--mi-ease),visibility_0s_linear_0s] mi:[contain:layout_style] mi:[&.is-collapsed]:opacity-0 mi:[&.is-collapsed]:invisible mi:[&.is-collapsed]:pointer-events-none mi:[&.is-collapsed]:[transition:transform_var(--mi-dur-3)_var(--mi-ease),opacity_var(--mi-dur-2)_var(--mi-ease),visibility_0s_linear_var(--mi-dur-3)]" :class="{ 'is-collapsed': collapsed }" :aria-label="ariaLabel"
    :inert="collapsed || undefined" :aria-hidden="collapsed || undefined" @keydown="onKey"
  >
    <div v-for="(g, gi) in groups" :key="gid(g, gi)" class="mi-sb__group mi:[.mi-sb__group+&]:pt-2.5" :class="{ 'is-closed': closed[gid(g, gi)] }">
      <component
        :is="g.collapsible ? 'button' : 'span'" v-if="g.label" class="mi-sb__head"
        v-bind="g.collapsible ? { type: 'button', 'aria-expanded': !closed[gid(g, gi)] } : {}"
        @click="g.collapsible && (closed[gid(g, gi)] = !closed[gid(g, gi)])"
      >
        {{ g.label }}
        <MiNavGlyph v-if="g.collapsible" name="chevron-right" :size="12" :stroke="2.6" class="mi-sb__caret mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:transform-[rotate(90deg)] mi:[.is-closed_&]:transform-[rotate(0)]" />
      </component>
      <div class="mi-sb__body mi:grid mi:grid-rows-[1fr] mi:[transition:var(--mi-sb-expand)] mi:[.is-closed_&]:grid-rows-[0fr]">
        <ul class="mi-sb__list mi:[list-style:none] mi:m-0 mi:p-0 mi:min-h-0 mi:overflow-hidden mi:flex mi:flex-col mi:gap-0.5 mi:[.is-closed_&]:invisible">
          <li v-for="it in g.items" :key="it.id">
            <component
              :is="it.href ? 'a' : 'button'" class="mi-sb__row" :class="{ 'is-on': model === it.id, 'is-tag': !!it.color }"
              v-bind="it.href ? { href: miSafeHref(it.href) } : { type: 'button' }" :aria-current="model === it.id ? 'page' : undefined"
              :aria-disabled="it.disabled || undefined" @click="pick(it, $event)"
            >
              <span v-if="it.color" class="mi-sb__dot mi:w-2.5 mi:h-2.5 mi:rounded-[50%] mi:flex-[none]" :style="{ background: `var(--mi-${it.color})` }" aria-hidden="true" />
              <span v-else-if="it.icon" class="mi-sb__ic mi:w-5 mi:h-5 mi:flex mi:items-center mi:justify-center mi:text-label2 mi:[.is-on_&]:text-p-text"><MiNavGlyph :name="it.icon" :size="18" /></span>
              <span class="mi-sb__label mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ it.label }}</span>
              <span v-if="it.badge !== undefined && it.badge !== ''" class="mi-sb__badge mi:min-w-5 mi:h-5 mi:py-0 mi:px-1.5 mi:rounded-[999px] mi:[background:var(--mi-fill2)] mi:text-label mi:text-[12px] mi:font-semibold mi:inline-flex mi:items-center mi:justify-center">{{ it.badge }}</span>
            </component>
          </li>
        </ul>
      </div>
    </div>
    <span class="mi-sb__flex mi:flex-1 mi:min-h-6" />
    <slot name="footer">
      <button v-if="footerLabel" type="button" class="mi-sb__row mi-sb__foot" @click="emit('footer')">
        <span class="mi-sb__ic mi:w-5 mi:h-5 mi:flex mi:items-center mi:justify-center mi:text-label2 mi:[.is-on_&]:text-p-text"><MiNavGlyph name="plus" :size="18" :stroke="2" /></span>{{ footerLabel }}
      </button>
    </slot>
  </nav>
</template>

<style scoped>
.mi-sb{width:300px;border-radius:16px;background:var(--mi-side,var(--mi-page));box-shadow:var(--mi-sh1);padding:14px 10px;display:flex;gap:2px;color:var(--mi-label)}
.mi-sb.is-collapsed{transform:translate3d(calc(-100% - 24px),0,0)}
.mi-sb__head{display:flex;align-items:center;gap:6px;padding:6px 10px;border:0;background:transparent;font-size:12px;font-weight:600;color:var(--mi-label2);text-align:left}
button.mi-sb__head{width:100%;border-radius:8px}
.mi-sb__row{position:relative;width:100%;height:36px;display:flex;align-items:center;gap:10px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--mi-label);font-size:14px;font-weight:500;text-align:left;text-decoration:none;isolation:isolate;transition:transform var(--mi-dur-1) var(--mi-ease)}
.mi-sb__row.is-tag{height:34px;gap:12px;padding:0 12px;font-weight:400}
.mi-sb__row::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;background:var(--mi-fill4);opacity:0;transition:opacity var(--mi-dur-2) var(--mi-ease)}
.mi-sb__row:hover::before{opacity:1}
.mi-sb__row:active{transform:scale(.985)}
.mi-sb__row.is-on{color:var(--mi-p-text);font-weight:600}
.mi-sb__row.is-on::before{background:var(--mi-p-tint);opacity:1}
.mi-sb__row[aria-disabled=true]{opacity:.4;pointer-events:none}
.mi-sb__foot{color:var(--mi-label2);font-weight:400}
.mi-sb :focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:-1px}
</style>
