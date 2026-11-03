<script setup lang="ts">
/** Label/value definition list for key facts (order, profile, specs). Pass `items`; a value can be a link via `href`. */
import { miSafeHref } from '../../utils/miSafe'
export interface MiDetailsItem {
  /** Unique key, also used for the `label-<key>` / `value-<key>` slots. */
  key: string
  label: string
  value?: string | number
  /** Renders the value as a link. */
  href?: string
}

defineSlots<{
  /** Custom label for the item with the matching key. */
  [name: `label-${string}`]: (props: { item: MiDetailsItem }) => unknown
  /** Custom value for the item with the matching key. */
  [name: `value-${string}`]: (props: { item: MiDetailsItem }) => unknown
  /** Custom value for every item without a specific `value-<key>` slot. */
  value?(props: { item: MiDetailsItem }): unknown
}>()

withDefaults(defineProps<{
  /** Label/value entries, in display order. */
  items: MiDetailsItem[]
  /** Width of the label column. */
  labelWidth?: string
}>(), { labelWidth: '140px' })
</script>

<template>
  <dl class="mi-dl mi:@container" :style="{ '--mi-dl-w': labelWidth }">
    <div v-for="it in items" :key="it.key" class="mi-dl__row mi:grid mi:grid-cols-[var(--mi-dl-w)_minmax(0,1fr)] mi:items-center mi:[.mi-dl__row+&]:[border-top:.5px_solid_var(--mi-sep)] mi:@max-[320px]:grid-cols-[minmax(0,1fr)]">
      <dt class="mi-dl__t mi:py-2.5 mi:px-0 mi:text-label2 mi:@max-[320px]:pb-0"><slot :name="`label-${it.key}`" :item="it">{{ it.label }}</slot></dt>
      <dd class="mi-dl__d mi:m-0 mi:py-2.5 mi:px-0 mi:font-medium mi:min-w-0 mi:wrap-anywhere mi:[&:has(>:where(span,button,div))]:py-2 mi:[&:has(>:where(span,button,div))]:px-0">
        <slot :name="`value-${it.key}`" :item="it">
          <slot name="value" :item="it">
            <a v-if="it.href" class="mi-dl__a mi:text-p-text mi:[text-decoration:none] mi:font-normal mi:hover:opacity-80" :href="miSafeHref(it.href)">{{ it.value }}</a>
            <template v-else>{{ it.value }}</template>
          </slot>
        </slot>
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.mi-dl{margin:0;font-family:var(--mi-font);font-size:15px;color:var(--mi-label)}
</style>
