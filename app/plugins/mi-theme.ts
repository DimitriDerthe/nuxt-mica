export default defineNuxtPlugin((nuxtApp) => {
  const { mode, primary, secondary, resolved, apply } = useMiTheme()

  const css = computed(() => {
    const p = miHex(primary.value, '#0071E3')
    const s = miHex(secondary.value, '#BF4800')
    return `:root,.mi-light{${miBrandCss('p', p, false)}${miBrandCss('s', s, false)}}`
      + `:root[data-theme=dark],.mi-dark{${miBrandCss('p', p, true)}${miBrandCss('s', s, true)}}`
  })

  // Blocking script: resolve "system" before first paint to avoid a flash.
  const boot = `(function(){try{var m=document.cookie.match(/(?:^|; )mi-mode=([^;]+)/);m=m?decodeURIComponent(m[1]):'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()`

  useHead({
    htmlAttrs: { 'data-theme': computed(() => resolved.value) },
    style: [{ key: 'mi-brand', innerHTML: css }],
    script: [{ key: 'mi-boot', innerHTML: boot, tagPosition: 'head' }]
  })

  if (import.meta.client) {
    nuxtApp.hook('app:mounted', apply)
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (mode.value === 'system') apply() })
    watch(mode, apply)
  }
})
