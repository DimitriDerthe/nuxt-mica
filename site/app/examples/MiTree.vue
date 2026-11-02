<script lang="ts">
export const playground = {
  props: {
    items: [
      { id: 'src', label: 'src', icon: 'folder', children: [
        { id: 'components', label: 'components', icon: 'folder', children: [
          { id: 'button', label: 'Button.vue', icon: 'document' },
          { id: 'card', label: 'Card.vue', icon: 'document' },
          { id: 'legacy', label: 'Legacy.vue', icon: 'document', disabled: true }
        ] },
        { id: 'utils', label: 'utils', icon: 'folder', children: [{ id: 'format', label: 'format.ts', icon: 'document' }] },
        { id: 'app', label: 'App.vue', icon: 'document' }
      ] },
      { id: 'public', label: 'public', icon: 'folder', children: [{ id: 'logo', label: 'logo.svg', icon: 'image' }] },
      { id: 'readme', label: 'README.md', icon: 'document' }
    ]
  },
  controls: ['multiple', 'checkable']
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const selected = ref<string | string[] | null>('button')
const expanded = ref<string[]>(['src', 'components'])
watch(() => [props.p.multiple, props.p.checkable], () => { selected.value = props.p.multiple || props.p.checkable ? [] : null })
</script>

<template>
  <MiTree v-model:selected="selected" v-model:expanded="expanded" v-bind="p" class="ex-tree" aria-label="Project files" />
</template>

<style scoped>
.ex-tree { width: min(100%, 340px); border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
</style>
