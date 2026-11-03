<template>
  <section class="pg mi:grid-cols-[minmax(0,_1fr)] mi:min-[1100px]:grid-cols-[minmax(0,_1fr)_300px]" :aria-label="t('explorer.preview')">
    <div class="pg__stage mi:relative mi:flex mi:items-center mi:justify-center mi:p-[clamp(20px,_4vw,_40px)] mi:box-border mi:rounded-[22px] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:overflow-auto mi:min-w-0 mi:[background:radial-gradient(circle_at_1px_1px,_var(--mi-fill3)_1px,_transparent_0)_0_0_/_18px_18px,_var(--mi-page)]" :class="['pg__stage--' + (meta.layout ?? 'center'), { 'pg__stage--empty': !example }]" :style="{ minHeight: (meta.height ?? 260) + 'px' }">
      <component :is="example" v-if="example" :p="values" />
      <MiEmptyState v-else-if="loaded" icon="document" :title="t('explorer.noExample')" :description="t('explorer.noExampleBody')" />
      <MiSpinner v-else />
    </div>

    <p v-if="parent" class="pg__part mi:m-0 mi:text-[13px] mi:text-label2">{{ t('explorer.partOf', { name: parent }) }}</p>
    <div v-if="controls.length" class="pg__ctl mi:grid mi:gap-0.5 mi:content-start mi:py-3.5 mi:px-4 mi:rounded-[22px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:min-w-0">
      <div class="pg__ctl-head mi:flex mi:items-center mi:justify-between mi:mb-1.5">
        <MiText variant="footnote" weight="semibold" as="h3">{{ t('explorer.props') }}</MiText>
        <MiButton size="mini" variant="plain" @click="reset">{{ t('explorer.reset') }}</MiButton>
      </div>
      <div v-for="c in controls" :key="c.name" class="pg__row mi:grid mi:grid-cols-[minmax(0,_104px)_minmax(0,_1fr)] mi:items-center mi:gap-2.5 mi:min-h-10 mi:border-t mi:border-t-sep">
        <label :for="uid + c.name" class="pg__label"><code class="mi:[.pg__label_&]:[font:12px/1.3_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:[.pg__label_&]:text-label2 mi:[.pg__label_&]:wrap-anywhere">{{ c.name }}</code></label>
        <div class="pg__input mi:flex mi:[justify-content:flex-end] mi:min-w-0">
          <MiSwitch v-if="c.kind === 'boolean'" :id="uid + c.name" v-model="values[c.name] as boolean" size="compact" :label="c.name" />
          <MiSegmented
            v-else-if="c.kind === 'enum' && c.options.length <= 3 && c.options.join('').length <= 22"
            :model-value="enumValue(c)" :options="c.options.map(o => ({ value: o, label: String(o) }))" :label="c.name"
            @update:model-value="v => setEnum(c, v)"
          />
          <MiSelect size="sm"
            v-else-if="c.kind === 'enum'" :id="uid + c.name" :model-value="enumValue(c)"
            :options="c.options.map(o => ({ value: o, label: String(o) }))" :aria-label="c.name"
            @update:model-value="v => setEnum(c, v)"
          />
          <MiInput size="sm"
            v-else-if="c.kind === 'number'" :id="uid + c.name" type="number" :model-value="values[c.name] === undefined ? '' : String(values[c.name])"
            :aria-label="c.name" @update:model-value="v => (values[c.name] = v === '' ? undefined : Number(v))"
          />
          <MiInput
            v-else size="sm" :id="uid + c.name" :model-value="values[c.name] === undefined ? '' : String(values[c.name])" :aria-label="c.name"
            @update:model-value="v => (values[c.name] = c.numeric && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : v)"
          />
        </div>
      </div>
    </div>

    <SiteCode class="pg__code mi:min-[1100px]:col-span-full" file="usage.vue" :text="snippet" :copy-label="t('start.copy')" :copied-label="t('start.copied')" />
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { controlFor, parseDefault, usageSnippet, type ApiProp, type Control } from '~/utils/explorer'

/** Metadata an example file exports from its plain `<script>` block. */
interface PlaygroundMeta {
  /** Initial prop values, including data props (items, series...) that have no control. */
  props?: Record<string, unknown>
  /** Props exposed as controls, in order. Defaults to every simple prop (enum, boolean, number, string). */
  controls?: string[]
  /** Text placed inside the tag of the generated usage snippet. */
  slot?: string
  layout?: 'center' | 'fill' | 'start'
  height?: number
}

const props = defineProps<{ name: string, api: ApiProp[], vmodel: boolean }>()
const { t } = useI18n()
const uid = useId()

const modules = import.meta.glob<{ default: Component, playground?: PlaygroundMeta }>('../examples/*.vue')
const example = shallowRef<Component | null>(null)
const meta = shallowRef<PlaygroundMeta>({})
const loaded = ref(false)
/** Parent whose example stands in for a sub-part such as MiTabsTrigger (longest registered prefix). */
const parent = ref('')
const values = reactive<Record<string, unknown>>({})

const controls = computed<Control[]>(() => {
  const all = props.api.map(controlFor).filter((c): c is Control => !!c)
  if (!meta.value.controls) return all
  return meta.value.controls.map(n => all.find(c => c.name === n)).filter((c): c is Control => !!c)
})

// Deep copy of the example's initial data that keeps functions (formatters, sortBy), unlike structuredClone.
const clone = (v: unknown): unknown => Array.isArray(v)
  ? v.map(clone)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clone(x)])) : v

// Enum controls hold strings and numbers; a `boolean | "auto"` prop maps its "true"/"false" options to booleans.
const enumValue = (c: Control) => {
  const v = values[c.name]
  return c.kind === 'enum' && c.bools && typeof v === 'boolean' ? String(v) : v as string | number
}
function setEnum(c: Control, v: string | number | null) {
  values[c.name] = c.kind === 'enum' && c.bools && (v === 'true' || v === 'false') ? v === 'true' : v
}

function reset() {
  for (const k of Object.keys(values)) delete values[k]
  for (const c of controls.value) values[c.name] = parseDefault(props.api.find(p => p.name === c.name)?.default)
  Object.assign(values, clone(meta.value.props ?? {}) as Record<string, unknown>)
}

async function load() {
  loaded.value = false
  example.value = null
  meta.value = {}
  parent.value = ''
  let loader = modules[`../examples/${props.name}.vue`]
  if (!loader) {
    const owner = Object.keys(modules).map(k => k.slice(12, -4)).filter(n => props.name.startsWith(n) && n !== props.name).sort((a, b) => b.length - a.length)[0]
    if (owner) { loader = modules[`../examples/${owner}.vue`]; parent.value = owner }
  }
  if (loader) {
    const mod = await loader()
    meta.value = parent.value ? { ...mod.playground, controls: [], props: mod.playground?.props } : mod.playground ?? {}
    example.value = markRaw(mod.default)
  }
  reset()
  loaded.value = true
}
watch(() => props.name, load)
await load()

const snippet = computed(() => {
  const shown = Object.fromEntries(controls.value.map(c => [c.name, values[c.name]]))
  for (const k of Object.keys(meta.value.props ?? {})) if (!(k in shown)) shown[k] = values[k]
  return usageSnippet(props.name, shown, props.api, props.vmodel, meta.value.slot)
})
</script>

<style scoped>
.pg { display: grid; gap: 14px; }
.pg__stage--fill { align-items: stretch; }
.pg__stage--fill > :deep(*) { flex: 1; min-width: 0; }
.pg__stage--start { align-items: flex-start; justify-content: flex-start; }
.pg__input > :deep(*) { max-width: 100%; }
</style>
