<script setup lang="ts">
/** Window-style toolbar with sidebar toggle, history, title, view switcher, search, share and primary action. */
import { ref } from 'vue'
import MiNavGlyph from './MiNavGlyph.vue'
import { miNavRoving, type MiNavIconName } from '../../utils/miNav'

export interface MiToolbarView { id: string, label: string, icon: MiNavIconName }

const props = withDefaults(defineProps<{
  /** Window title shown in the middle of the bar. */
  title?: string
  /** Smaller line under the title, for example an item count. */
  subtitle?: string
  /** Show the sidebar toggle button. */
  sidebarToggle?: boolean
  /** Show back / forward buttons. */
  history?: boolean
  /** Enables the Back button. Only applies when history is true. */
  canGoBack?: boolean
  /** Enables the Forward button. Only applies when history is true. */
  canGoForward?: boolean
  /** View switcher (segmented radio group). */
  views?: MiToolbarView[]
  /** Shows a search field in the bar; its text is the `search` model. */
  searchable?: boolean
  /** Hint text of the search field. */
  searchPlaceholder?: string
  /** Show the share button (emits share). Ignored when the default slot is used. */
  share?: boolean
  /** Label of the primary action. Omit to hide it. */
  primaryLabel?: string
  /** Initials in the trailing avatar. Omit to hide it. */
  avatar?: string
  /** Accessible name of the toolbar. */
  ariaLabel?: string
}>(), {
  sidebarToggle: true, history: true, canGoBack: true, canGoForward: false, searchPlaceholder: 'Search',
  share: true, ariaLabel: 'Window toolbar'
})

const emit = defineEmits<{ 'toggle-sidebar': [], 'back': [], 'forward': [], 'share': [], 'primary': [], 'search': [value: string] }>()
/** Value of the selected view in the view switcher. */
const view = defineModel<string>('view')
/** Text of the search field (only with `searchable`). */
const search = defineModel<string>('search', { default: '' })
const seg = ref<HTMLElement | null>(null)

function setView(id: string) { if (id !== view.value) view.value = id }
function onSegKey(e: KeyboardEvent) {
  if (!miNavRoving(e, seg.value, '[role=radio]', 'horizontal')) return
  const id = (document.activeElement as HTMLElement | null)?.dataset.id
  if (id) setView(id)
}
const viewIndex = () => Math.max(props.views?.findIndex(v => v.id === view.value) ?? 0, 0)
defineSlots<{
  /** Replaces the sidebar toggle and history buttons. */
  leading?(): unknown
  /** Replaces the title and subtitle. */
  title?(): unknown
  /** Replaces the share button; place extra trailing actions here. */
  default?(): unknown
}>()
</script>

<template>
  <nav class="mi-tl mi:font-mi mi:h-14 mi:flex mi:items-center mi:gap-2.5 mi:py-0 mi:px-3 mi:bg-mat mi:[border-bottom:.5px_solid_var(--mi-sep)] mi:text-label mi:min-w-0 mi:max-[640px]:gap-1.5 mi:max-[640px]:py-0 mi:max-[640px]:px-2" :aria-label="ariaLabel">
    <slot name="leading">
      <button v-if="sidebarToggle" type="button" class="mi-tl__btn mi-tl__btn--wide mi:relative mi:w-8 mi:h-8 mi:flex-[none] mi:[border:0] mi:rounded-[8px] mi:bg-transparent mi:flex mi:items-center mi:justify-center mi:isolate mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:w-9 mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill4 mi:before:opacity-0 mi:before:-z-1 mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&:hover:not(:disabled)]:before:opacity-100 mi:[&:active:not(:disabled)]:transform-[scale(.92)]" aria-label="Toggle sidebar" @click="emit('toggle-sidebar')">
        <MiNavGlyph name="sidebar" :size="20" :stroke="1.8" />
      </button>
      <span v-if="history" class="mi-tl__hist mi:inline-flex mi:max-[640px]:hidden">
        <button type="button" class="mi-tl__btn mi-tl__btn--ink mi:relative mi:w-8 mi:h-8 mi:flex-[none] mi:[border:0] mi:rounded-[8px] mi:bg-transparent mi:flex mi:items-center mi:justify-center mi:isolate mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill4 mi:before:opacity-0 mi:before:-z-1 mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&:hover:not(:disabled)]:before:opacity-100 mi:[&:active:not(:disabled)]:transform-[scale(.92)]" aria-label="Back" :disabled="!canGoBack" @click="emit('back')">
          <MiNavGlyph name="back" :size="18" :stroke="2.2" />
        </button>
        <button type="button" class="mi-tl__btn mi-tl__btn--ink mi:relative mi:w-8 mi:h-8 mi:flex-[none] mi:[border:0] mi:rounded-[8px] mi:bg-transparent mi:flex mi:items-center mi:justify-center mi:isolate mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill4 mi:before:opacity-0 mi:before:-z-1 mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&:hover:not(:disabled)]:before:opacity-100 mi:[&:active:not(:disabled)]:transform-[scale(.92)]" aria-label="Forward" :disabled="!canGoForward" @click="emit('forward')">
          <MiNavGlyph name="forward" :size="18" :stroke="2.2" />
        </button>
      </span>
    </slot>
    <slot name="title">
      <span v-if="title" class="mi-tl__title mi:flex mi:flex-col mi:leading-[1.15] mi:min-w-0 mi:max-[640px]:flex-[0_1_auto]">
        <span class="mi-tl__name mi:text-[15px] mi:font-bold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ title }}</span>
        <span v-if="subtitle" class="mi-tl__sub mi:text-[12px] mi:text-label2 mi:whitespace-nowrap">{{ subtitle }}</span>
      </span>
    </slot>
    <span class="mi-tl__flex mi:flex-1" />
    <span
      v-if="views?.length" ref="seg" class="mi-tl__seg mi:relative mi:inline-flex mi:gap-0.5 mi:p-0.5 mi:rounded-[8px] mi:bg-fill3 mi:max-[640px]:hidden" role="radiogroup" aria-label="View"
      :style="{ '--i': viewIndex(), '--n': views.length }" @keydown="onSegKey"
    >
      <span class="mi-tl__thumb mi:absolute mi:left-0.5 mi:top-0.5 mi:w-8 mi:h-6.5 mi:rounded-[6px] mi:bg-seg mi:shadow-[0_1px_3px_rgba(0,0,0,.12)] mi:transform-[translate3d(calc(var(--i)_*_34px),0,0)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:pointer-events-none" aria-hidden="true" />
      <button
        v-for="v in views" :key="v.id" type="button" role="radio" class="mi-tl__radio mi:relative mi:w-8 mi:h-6.5 mi:[border:0] mi:rounded-[6px] mi:bg-transparent mi:text-label2 mi:flex mi:items-center mi:justify-center mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&[aria-checked=true]]:text-label" :data-id="v.id"
        :aria-checked="view === v.id" :aria-label="v.label" :tabindex="view === v.id ? 0 : -1" @click="setView(v.id)"
      ><MiNavGlyph :name="v.icon" :size="15" :stroke="v.icon === 'list' ? 2.2 : 2" /></button>
    </span>
    <label v-if="searchable" class="mi-tl__search mi:h-8 mi:w-55 mi:flex-[0_1_220px] mi:min-w-0 mi:flex mi:items-center mi:gap-1.5 mi:py-0 mi:px-2.5 mi:rounded-[8px] mi:bg-fill3 mi:text-label2 mi:focus-within:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-within:outline-offset-[2px] mi:max-[640px]:hidden">
      <MiNavGlyph name="search" :size="15" :stroke="2.2" />
      <input
        v-model="search" type="search" class="mi-tl__input mi:flex-1 mi:min-w-0 mi:[border:0] mi:bg-transparent mi:text-label mi:[outline:none] mi:placeholder:text-label2" :placeholder="searchPlaceholder" aria-label="Search"
        @keydown.enter="emit('search', search)"
      >
    </label>
    <slot>
      <button v-if="share" type="button" class="mi-tl__btn mi-tl__btn--wide mi:relative mi:w-8 mi:h-8 mi:flex-[none] mi:[border:0] mi:rounded-[8px] mi:bg-transparent mi:flex mi:items-center mi:justify-center mi:isolate mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:w-9 mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill4 mi:before:opacity-0 mi:before:-z-1 mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&:hover:not(:disabled)]:before:opacity-100 mi:[&:active:not(:disabled)]:transform-[scale(.92)]" aria-label="Share" @click="emit('share')">
        <MiNavGlyph name="share" :size="19" :stroke="1.8" />
      </button>
      <button v-if="primaryLabel" type="button" class="mi-tl__primary mi:h-8 mi:pt-0 mi:pr-3 mi:pb-0 mi:pl-2 mi:[border:0] mi:rounded-[8px] mi:bg-p mi:text-p-on mi:text-[13px] mi:font-semibold mi:inline-flex mi:items-center mi:gap-1 mi:whitespace-nowrap mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.95)] mi:max-[640px]:pt-0 mi:max-[640px]:pr-2.5 mi:max-[640px]:pb-0 mi:max-[640px]:pl-1.5" @click="emit('primary')">
        <MiNavGlyph name="plus" :size="16" :stroke="2.4" />{{ primaryLabel }}
      </button>
      <span v-if="avatar" class="mi-tl__avatar mi:w-7.5 mi:h-7.5 mi:flex-[none] mi:rounded-[50%] mi:bg-s mi:text-s-on mi:text-[12px] mi:font-bold mi:flex mi:items-center mi:justify-center" aria-hidden="true">{{ avatar }}</span>
    </slot>
  </nav>
</template>

<style scoped>
.mi-tl{-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%)}
.mi-tl__btn{color:var(--mi-label2)}
.mi-tl__btn--ink{color:var(--mi-label)}
.mi-tl__btn:disabled{color:var(--mi-label3)}
.mi-tl__input{font:inherit;font-size:13px}
.mi-tl :focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
.mi-tl__input:focus-visible{outline:none}
</style>
