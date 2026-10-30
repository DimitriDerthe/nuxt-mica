<template>
  <div class="code">
    <div class="code__bar">
      <span class="code__file">{{ file }}</span>
      <MiIconButton size="small" variant="plain" :label="copyLabel" class="code__copy" @click="copy">
        <MiIcon :name="done ? 'check' : 'copy'" :size="15" />
      </MiIconButton>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- static, escaped snippets authored in this site -->
    <pre class="code__pre"><code v-html="html" /></pre>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ file: string, text: string, copyLabel: string, copiedLabel: string, plain?: boolean, prompt?: boolean }>()

// Tiny highlighter for the snippets on this page: escape first, then tint strings, keywords and Mi tags.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const html = computed(() => {
  const e = esc((props.prompt ? '$ ' : '') + props.text)
  if (props.plain) return e
  return e
    .replace(/('[^'\n]*'|"[^"\n]*")/g, '<span class="s">$1</span>')
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
.code__bar { display: flex; align-items: center; justify-content: space-between; height: 36px; padding: 0 4px 0 14px; border-bottom: 1px solid var(--mi-sep); }
.code__file { font: 500 12px/1 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label3); }
.code__pre { margin: 0; padding: 14px 16px 16px; overflow-x: auto; font: 13px/1.65 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label); }
.code__pre :deep(.k) { color: var(--mi-p-text); }
.code__pre :deep(.s) { color: var(--mi-s-text); }
.code__pre :deep(.c) { color: var(--mi-label3); }
</style>
