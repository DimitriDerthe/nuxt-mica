export type MiMode = 'light' | 'dark' | 'system'

const MAX_AGE = 60 * 60 * 24 * 365

/**
 * Theme state shared app-wide (SSR-safe, cookie-backed).
 * Brand CSS variables for both appearances are emitted once in <head>;
 * switching mode only flips `data-theme` on <html>, so no style recalculation storm.
 */
export function useMiTheme() {
  const cfg = useRuntimeConfig().public.mi as { primary: string, secondary: string, mode: MiMode }
  const mode = useCookie<MiMode>('mi-mode', { default: () => cfg.mode, maxAge: MAX_AGE, sameSite: 'lax' })
  const primary = useCookie<string>('mi-primary', { default: () => cfg.primary, maxAge: MAX_AGE, sameSite: 'lax' })
  const secondary = useCookie<string>('mi-secondary', { default: () => cfg.secondary, maxAge: MAX_AGE, sameSite: 'lax' })

  const resolved = useState<'light' | 'dark'>('mi-resolved', () => (mode.value === 'dark' ? 'dark' : 'light'))

  function apply() {
    if (!import.meta.client) return
    const dark = mode.value === 'dark' || (mode.value === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
    resolved.value = dark ? 'dark' : 'light'
    document.documentElement.dataset.theme = resolved.value
  }

  return {
    mode,
    primary,
    secondary,
    resolved,
    isDark: computed(() => resolved.value === 'dark'),
    setMode(m: MiMode) { mode.value = m; apply() },
    setPrimary(hex: string) { primary.value = miHex(hex, cfg.primary) },
    setSecondary(hex: string) { secondary.value = miHex(hex, cfg.secondary) },
    apply
  }
}
