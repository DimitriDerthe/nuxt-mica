import { onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

export interface MiScrollspyOptions {
  /** IntersectionObserver `rootMargin`. Defaults to a band at the top of the viewport below `offset`: `-offset px 0px -60% 0px`. */
  rootMargin?: string
  /** Height in px of a fixed header to keep clear at the top of the viewport. Ignored when `rootMargin` is set. */
  offset?: number
  /** Scrolling element used as the observation root; the viewport by default. */
  root?: Element | null
}

/** Tracks which of the elements with the given ids is currently at the top of the viewport. Client only: `active` stays `null` during SSR. Call inside `setup`. */
export function useMiScrollspy(ids: MaybeRefOrGetter<string[]>, options: MiScrollspyOptions = {}): { active: Ref<string | null>, refresh: () => void } {
  const active = ref<string | null>(null)
  const visible = new Set<string>()
  let io: IntersectionObserver | undefined

  function pick() {
    const first = toValue(ids).find(id => visible.has(id))
    if (first !== undefined) active.value = first
  }
  function stop() {
    io?.disconnect()
    io = undefined
    visible.clear()
  }
  function refresh() {
    stop()
    if (typeof IntersectionObserver === 'undefined' || typeof document === 'undefined') return
    const list = toValue(ids)
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).id
        if (e.isIntersecting) visible.add(id)
        else visible.delete(id)
      }
      pick()
    }, { root: options.root ?? null, rootMargin: options.rootMargin ?? `-${options.offset ?? 0}px 0px -60% 0px`, threshold: [0, 1] })
    for (const id of list) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
  }

  onMounted(refresh)
  watch(() => toValue(ids).join('\n'), () => { if (io) refresh() })
  onBeforeUnmount(stop)
  return { active, refresh }
}
