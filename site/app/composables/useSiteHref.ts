/** Locale-aware path as a plain `href`: unlike NuxtLink's `to`, a raw anchor must carry the app base itself (GitHub Pages sub-path). */
export function useSiteHref() {
  const localePath = useLocalePath()
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  return (path: string) => base + localePath(path)
}
