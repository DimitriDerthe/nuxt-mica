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
  <nav class="mi-tl" :aria-label="ariaLabel">
    <slot name="leading">
      <button v-if="sidebarToggle" type="button" class="mi-tl__btn mi-tl__btn--wide" aria-label="Toggle sidebar" @click="emit('toggle-sidebar')">
        <MiNavGlyph name="sidebar" :size="20" :stroke="1.8" />
      </button>
      <span v-if="history" class="mi-tl__hist">
        <button type="button" class="mi-tl__btn mi-tl__btn--ink" aria-label="Back" :disabled="!canGoBack" @click="emit('back')">
          <MiNavGlyph name="back" :size="18" :stroke="2.2" />
        </button>
        <button type="button" class="mi-tl__btn mi-tl__btn--ink" aria-label="Forward" :disabled="!canGoForward" @click="emit('forward')">
          <MiNavGlyph name="forward" :size="18" :stroke="2.2" />
        </button>
      </span>
    </slot>
    <slot name="title">
      <span v-if="title" class="mi-tl__title">
        <span class="mi-tl__name">{{ title }}</span>
        <span v-if="subtitle" class="mi-tl__sub">{{ subtitle }}</span>
      </span>
    </slot>
    <span class="mi-tl__flex" />
    <span
      v-if="views?.length" ref="seg" class="mi-tl__seg" role="radiogroup" aria-label="View"
      :style="{ '--i': viewIndex(), '--n': views.length }" @keydown="onSegKey"
    >
      <span class="mi-tl__thumb" aria-hidden="true" />
      <button
        v-for="v in views" :key="v.id" type="button" role="radio" class="mi-tl__radio" :data-id="v.id"
        :aria-checked="view === v.id" :aria-label="v.label" :tabindex="view === v.id ? 0 : -1" @click="setView(v.id)"
      ><MiNavGlyph :name="v.icon" :size="15" :stroke="v.icon === 'list' ? 2.2 : 2" /></button>
    </span>
    <label v-if="searchable" class="mi-tl__search">
      <MiNavGlyph name="search" :size="15" :stroke="2.2" />
      <input
        v-model="search" type="search" class="mi-tl__input" :placeholder="searchPlaceholder" aria-label="Search"
        @keydown.enter="emit('search', search)"
      >
    </label>
    <slot>
      <button v-if="share" type="button" class="mi-tl__btn mi-tl__btn--wide" aria-label="Share" @click="emit('share')">
        <MiNavGlyph name="share" :size="19" :stroke="1.8" />
      </button>
      <button v-if="primaryLabel" type="button" class="mi-tl__primary" @click="emit('primary')">
        <MiNavGlyph name="plus" :size="16" :stroke="2.4" />{{ primaryLabel }}
      </button>
      <span v-if="avatar" class="mi-tl__avatar" aria-hidden="true">{{ avatar }}</span>
    </slot>
  </nav>
</template>

<style scoped>
.mi-tl{font-family:var(--mi-font);height:56px;display:flex;align-items:center;gap:10px;padding:0 12px;background:var(--mi-mat);-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);border-bottom:.5px solid var(--mi-sep);color:var(--mi-label);min-width:0}
.mi-tl__btn{position:relative;width:32px;height:32px;flex:none;border:0;border-radius:8px;background:transparent;color:var(--mi-label2);display:flex;align-items:center;justify-content:center;isolation:isolate;transition:transform var(--mi-dur-1) var(--mi-ease)}
.mi-tl__btn--wide{width:36px}
.mi-tl__btn--ink{color:var(--mi-label)}
.mi-tl__btn::before{content:"";position:absolute;inset:0;border-radius:inherit;background:var(--mi-fill4);opacity:0;z-index:-1;transition:opacity var(--mi-dur-2) var(--mi-ease)}
.mi-tl__btn:hover:not(:disabled)::before{opacity:1}
.mi-tl__btn:active:not(:disabled){transform:scale(.92)}
.mi-tl__btn:disabled{color:var(--mi-label3)}
.mi-tl__hist{display:inline-flex}
.mi-tl__title{display:flex;flex-direction:column;line-height:1.15;min-width:0}
.mi-tl__name{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mi-tl__sub{font-size:12px;color:var(--mi-label2);white-space:nowrap}
.mi-tl__flex{flex:1}
.mi-tl__seg{position:relative;display:inline-flex;gap:2px;padding:2px;border-radius:8px;background:var(--mi-fill3)}
.mi-tl__thumb{position:absolute;left:2px;top:2px;width:32px;height:26px;border-radius:6px;background:var(--mi-seg);box-shadow:0 1px 3px rgba(0,0,0,.12);transform:translate3d(calc(var(--i) * 34px),0,0);transition:transform var(--mi-dur-3) var(--mi-spring);pointer-events:none}
.mi-tl__radio{position:relative;width:32px;height:26px;border:0;border-radius:6px;background:transparent;color:var(--mi-label2);display:flex;align-items:center;justify-content:center;transition:opacity var(--mi-dur-2) var(--mi-ease)}
.mi-tl__radio[aria-checked=true]{color:var(--mi-label)}
.mi-tl__search{height:32px;width:220px;flex:0 1 220px;min-width:0;display:flex;align-items:center;gap:6px;padding:0 10px;border-radius:8px;background:var(--mi-fill3);color:var(--mi-label2)}
.mi-tl__input{flex:1;min-width:0;border:0;background:transparent;font:inherit;font-size:13px;color:var(--mi-label);outline:none}
.mi-tl__input::placeholder{color:var(--mi-label2)}
.mi-tl__search:focus-within{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
.mi-tl__primary{height:32px;padding:0 12px 0 8px;border:0;border-radius:8px;background:var(--mi-p);color:var(--mi-p-on);font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;transition:transform var(--mi-dur-1) var(--mi-ease)}
.mi-tl__primary:active{transform:scale(.95)}
.mi-tl__avatar{width:30px;height:30px;flex:none;border-radius:50%;background:var(--mi-s);color:var(--mi-s-on);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center}
.mi-tl :focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
.mi-tl__input:focus-visible{outline:none}
@media (max-width:640px){.mi-tl{gap:6px;padding:0 8px}.mi-tl__search,.mi-tl__hist,.mi-tl__seg{display:none}.mi-tl__primary{padding:0 10px 0 6px}.mi-tl__title{flex:0 1 auto}}
</style>
