<script setup lang="ts">
/** Label/value definition list for key facts (order, profile, specs). Pass `items`; a value can be a link via `href`. */
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
  <dl class="mi-dl" :style="{ '--mi-dl-w': labelWidth }">
    <div v-for="it in items" :key="it.key" class="mi-dl__row">
      <dt class="mi-dl__t"><slot :name="`label-${it.key}`" :item="it">{{ it.label }}</slot></dt>
      <dd class="mi-dl__d">
        <slot :name="`value-${it.key}`" :item="it">
          <slot name="value" :item="it">
            <a v-if="it.href" class="mi-dl__a" :href="it.href">{{ it.value }}</a>
            <template v-else>{{ it.value }}</template>
          </slot>
        </slot>
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.mi-dl{margin:0;container-type:inline-size;font-family:var(--mi-font);font-size:15px;color:var(--mi-label)}
.mi-dl__row{display:grid;grid-template-columns:var(--mi-dl-w) minmax(0,1fr);align-items:center}
.mi-dl__row + .mi-dl__row{border-top:.5px solid var(--mi-sep)}
.mi-dl__t{padding:10px 0;color:var(--mi-label2)}
.mi-dl__d{margin:0;padding:10px 0;font-weight:500;min-width:0;overflow-wrap:anywhere}
.mi-dl__d:has(> :where(span,button,div)){padding:8px 0}
.mi-dl__a{color:var(--mi-p-text);text-decoration:none;font-weight:400}
.mi-dl__a:hover{opacity:.8}
@container (max-width:320px){
  .mi-dl__row{grid-template-columns:minmax(0,1fr)}
  .mi-dl__t{padding-bottom:0}
}
</style>
