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
    class="mi-tn mi:[list-style:none] mi:m-0 mi:p-0 mi:[outline:none] mi:font-mi"
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
    <div class="mi-tn__row mi:relative mi:flex mi:items-center mi:gap-1.5 mi:min-h-9 mi:pt-0 mi:pr-2.5 mi:pb-0 mi:pl-[calc(6px_+_var(--mi-tn-l)_*_18px)] mi:rounded-[var(--mi-radius-s,10px)] mi:text-label mi:text-[15px] mi:cursor-pointer mi:select-none mi:[-webkit-tap-highlight-color:transparent] mi:[.is-selected>&]:text-p-text mi:[.is-selected>&]:font-semibold mi:[.is-selected>&]:before:content-[''] mi:[.is-selected>&]:before:absolute mi:[.is-selected>&]:before:left-0 mi:[.is-selected>&]:before:top-2 mi:[.is-selected>&]:before:bottom-2 mi:[.is-selected>&]:before:w-[3px] mi:[.is-selected>&]:before:rounded-[2px] mi:[.is-selected>&]:before:bg-p mi:[.is-disabled>&]:opacity-40 mi:[.is-disabled>&]:cursor-default mi:[.mi-tn:focus-visible>&]:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:[.mi-tn:focus-visible>&]:outline-offset-[-2px]" :style="{ '--mi-tn-l': level - 1 }" @click="onRow" @dblclick="onChevron">
      <span class="mi-tn__tg mi:flex-[none] mi:flex mi:items-center mi:justify-center mi:w-5.5 mi:h-7 mi:text-label3 mi:[&.is-leaf]:pointer-events-none" :class="{ 'is-leaf': !branch }" aria-hidden="true" @click.stop="onChevron" @dblclick.stop>
        <MiIcon v-if="branch" name="chevron-right" :size="14" :weight="2.4" class="mi-tn__chev mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" />
      </span>
      <span v-if="ctx.checkable" class="mi-tn__box mi:flex-[none] mi:flex mi:items-center mi:justify-center mi:w-4.5 mi:h-4.5 mi:rounded-[6px] mi:shadow-[inset_0_0_0_1.5px_var(--mi-ctl,var(--mi-label3))] mi:text-p-on mi:bg-transparent" :class="`is-${check}`" aria-hidden="true">
        <MiIcon v-if="check === 'checked'" name="check" :size="12" :weight="3.2" />
        <MiIcon v-else-if="check === 'mixed'" name="dash" :size="12" :weight="3.2" />
      </span>
      <MiIcon v-if="item.icon" :name="item.icon" :size="18" class="mi-tn__ico mi:text-label2 mi:[.is-selected>.mi-tn__row_&]:text-p-text" />
      <span class="mi-tn__label mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ item.label }}</span>
    </div>
    <div v-if="branch && rendered" ref="panel" class="mi-tn__panel mi:grid mi:grid-rows-[0fr] mi:invisible mi:[transition:visibility_0s_linear_var(--mi-dur-3)] mi:[.is-open>&]:grid-rows-[1fr] mi:[.is-open>&]:visible mi:[.is-open>&]:delay-[0s]">
      <ul class="mi-tn__group mi:relative mi:[list-style:none] mi:m-0 mi:p-0 mi:min-h-0 mi:overflow-hidden mi:before:content-[''] mi:before:absolute mi:before:left-[calc(16px_+_var(--mi-tn-l)_*_18px_-_18px_+_6px)] mi:before:top-0 mi:before:bottom-1.5 mi:before:w-px mi:before:bg-sep2" role="group" :style="{ '--mi-tn-l': level }">
        <MiTreeNode
          v-for="(c, i) in kids" :key="c.id" :item="c" :level="level + 1" :ctx="ctx"
          :set-size="kids.length" :pos-in-set="i + 1"
        />
      </ul>
    </div>
  </li>
</template>

<style scoped>
.mi-tn__row:hover{background:var(--mi-fill3)}
.is-open > .mi-tn__row .mi-tn__chev{transform:rotate(90deg)}
.mi-tn__ico{flex:none}
.mi-tn__box.is-checked,.mi-tn__box.is-mixed{background:var(--mi-p);box-shadow:none}
.is-selected > .mi-tn__row{background:var(--mi-p-tint)}
.is-disabled > .mi-tn__row:hover{background:transparent}
</style>
