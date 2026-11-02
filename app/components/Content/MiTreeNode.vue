<script setup lang="ts">
/** Internal recursive row of MiTree: one treeitem with its toggle, optional checkbox, icon and label, plus its animated child group. */
import { computed, onMounted, ref, watch } from 'vue'
import MiIcon from '../Base/MiIcon.vue'
import type { MiTreeContext, MiTreeItem } from './MiTree.vue'

const props = defineProps<{
  /** The item this row renders. */
  item: MiTreeItem
  /** One-based depth of the row. */
  level: number
  /** Shared state and handlers provided by the owning MiTree. */
  ctx: MiTreeContext
  /** Number of siblings, for `aria-setsize`. */
  setSize: number
  /** One-based position among siblings, for `aria-posinset`. */
  posInSet: number
}>()

const kids = computed(() => props.item.children ?? [])
const branch = computed(() => kids.value.length > 0)
const open = computed(() => branch.value && props.ctx.expanded.has(props.item.id))
const selected = computed(() => props.ctx.selected.has(props.item.id))
const check = computed(() => props.ctx.checks.get(props.item.id) ?? 'none')
const panel = ref<HTMLElement>()
const rendered = ref(open.value)
let ready = false
onMounted(() => { ready = true })

/* Children mount on first expansion and stay mounted so collapsing can animate. */
watch(open, (v) => {
  if (v) rendered.value = true
  const el = panel.value
  if (!ready || !el || typeof el.animate !== 'function') return
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return
  el.animate({ gridTemplateRows: v ? ['0fr', '1fr'] : ['1fr', '0fr'] }, { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' })
})

function onRow() {
  if (props.item.disabled) return
  props.ctx.focus(props.item.id)
  props.ctx.activate(props.item)
}
function onChevron() {
  if (props.item.disabled) return
  props.ctx.focus(props.item.id)
  props.ctx.toggle(props.item.id)
}
</script>

<template>
  <li
    class="mi-tn"
    role="treeitem"
    :data-mi-id="String(item.id)"
    :aria-level="level"
    :aria-setsize="setSize"
    :aria-posinset="posInSet"
    :aria-expanded="branch ? open : undefined"
    :aria-selected="ctx.checkable ? undefined : selected"
    :aria-checked="ctx.checkable ? (check === 'mixed' ? 'mixed' : check === 'checked') : undefined"
    :aria-disabled="item.disabled || undefined"
    :tabindex="ctx.focusId === item.id ? 0 : -1"
    :class="{ 'is-open': open, 'is-selected': selected && !ctx.checkable, 'is-disabled': item.disabled }"
  >
    <div class="mi-tn__row" :style="{ '--mi-tn-l': level - 1 }" @click="onRow" @dblclick="onChevron">
      <span class="mi-tn__tg" :class="{ 'is-leaf': !branch }" aria-hidden="true" @click.stop="onChevron" @dblclick.stop>
        <MiIcon v-if="branch" name="chevron-right" :size="14" :weight="2.4" class="mi-tn__chev" />
      </span>
      <span v-if="ctx.checkable" class="mi-tn__box" :class="`is-${check}`" aria-hidden="true">
        <MiIcon v-if="check === 'checked'" name="check" :size="12" :weight="3.2" />
        <MiIcon v-else-if="check === 'mixed'" name="dash" :size="12" :weight="3.2" />
      </span>
      <MiIcon v-if="item.icon" :name="item.icon" :size="18" class="mi-tn__ico" />
      <span class="mi-tn__label">{{ item.label }}</span>
    </div>
    <div v-if="branch && rendered" ref="panel" class="mi-tn__panel">
      <ul class="mi-tn__group" role="group" :style="{ '--mi-tn-l': level }">
        <MiTreeNode
          v-for="(c, i) in kids" :key="c.id" :item="c" :level="level + 1" :ctx="ctx"
          :set-size="kids.length" :pos-in-set="i + 1"
        />
      </ul>
    </div>
  </li>
</template>

<style scoped>
.mi-tn{list-style:none;margin:0;padding:0;outline:none;font-family:var(--mi-font)}
.mi-tn__row{position:relative;display:flex;align-items:center;gap:6px;min-height:36px;padding:0 10px 0 calc(6px + var(--mi-tn-l) * 18px);border-radius:var(--mi-radius-s,10px);color:var(--mi-label);font-size:15px;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
.mi-tn__row:hover{background:var(--mi-fill3)}
.mi-tn__tg{flex:none;display:flex;align-items:center;justify-content:center;width:22px;height:28px;color:var(--mi-label3)}
.mi-tn__tg.is-leaf{pointer-events:none}
.mi-tn__chev{transition:transform var(--mi-dur-2) var(--mi-ease)}
.is-open > .mi-tn__row .mi-tn__chev{transform:rotate(90deg)}
.mi-tn__ico{flex:none;color:var(--mi-label2)}
.mi-tn__label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mi-tn__box{flex:none;display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:6px;box-shadow:inset 0 0 0 1.5px var(--mi-ctl,var(--mi-label3));color:var(--mi-p-on);background:transparent}
.mi-tn__box.is-checked,.mi-tn__box.is-mixed{background:var(--mi-p);box-shadow:none}
.is-selected > .mi-tn__row{background:var(--mi-p-tint);color:var(--mi-p-text);font-weight:600}
.is-selected > .mi-tn__row .mi-tn__ico{color:var(--mi-p-text)}
.is-selected > .mi-tn__row::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:2px;background:var(--mi-p)}
.is-disabled > .mi-tn__row{opacity:.4;cursor:default}
.is-disabled > .mi-tn__row:hover{background:transparent}
.mi-tn:focus-visible > .mi-tn__row{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:-2px}
.mi-tn__panel{display:grid;grid-template-rows:0fr;visibility:hidden;transition:visibility 0s linear var(--mi-dur-3)}
.is-open > .mi-tn__panel{grid-template-rows:1fr;visibility:visible;transition-delay:0s}
.mi-tn__group{position:relative;list-style:none;margin:0;padding:0;min-height:0;overflow:hidden}
.mi-tn__group::before{content:'';position:absolute;left:calc(16px + var(--mi-tn-l) * 18px - 18px + 6px);top:0;bottom:6px;width:1px;background:var(--mi-sep2)}
</style>
