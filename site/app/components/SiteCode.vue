<template>
  <div class="code">
    <div class="code__bar mi:flex mi:items-center mi:justify-between mi:h-9 mi:pt-0 mi:pr-1 mi:pb-0 mi:pl-3.5 mi:border-b mi:border-b-sep">
      <span class="code__file mi:[font:500_12px/1_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-label3">{{ file }}</span>
      <MiIconButton size="small" variant="plain" :label="copyLabel" class="code__copy" @click="copy">
        <MiIcon :name="done ? 'check' : 'copy'" :size="15" />
      </MiIconButton>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- static, escaped snippets authored in this site -->
    <pre class="code__pre mi:m-0 mi:pt-3.5 mi:px-4 mi:pb-4 mi:overflow-x-auto mi:[font:13px/1.65_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-label"><code v-html="html" /></pre>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ file: string, text: string, copyLabel: string, copiedLabel: string, plain?: boolean, prompt?: boolean }>()

// Tiny highlighter for the snippets on this page: escape first, then tint strings, keywords and Mi tags.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const html = computed(() => {
  const e = esc((props.prompt ? '$ ' : '') + props.text)
  if (props.plain) return e
  return e
    .replace(/(&#39;(?:(?!&#39;)[^\n])*&#39;|&quot;(?:(?!&quot;)[^\n])*&quot;)/g, '<span class="s">$1</span>')
    .replace(/\b(export|default|const|import|from)\b/g, '<span class="k">$1</span>')
    .replace(/(&lt;\/?)(Mi\w+)/g, '$1<span class="k">$2</span>')
    .replace(/^(\$)/gm, '<span class="c">$1</span>')
})
const toast = useMiToast()
const done = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
    done.value = true
    toast.success(props.copiedLabel)
    clearTimeout(timer)
    timer = setTimeout(() => { done.value = false }, 1600)
  } catch { /* clipboard denied: nothing to do */ }
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.code { border-radius: 14px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); overflow: hidden; min-width: 0; }
.code__pre :deep(.k) { color: var(--mi-p-text); }
.code__pre :deep(.s) { color: var(--mi-s-text); }
.code__pre :deep(.c) { color: var(--mi-label3); }
</style>
