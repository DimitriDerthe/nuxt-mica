import { shallowRef } from 'vue'

export type MiToastTone = 'neutral' | 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface MiToastAction {
  label: string
  onClick?: () => void
}

export interface MiToastOptions {
  /** Reuse an id to replace an existing toast instead of stacking. */
  id?: string
  message: string
  description?: string
  tone?: MiToastTone
  /** `solid` is the inverted pill, `material` the blurred one. */
  variant?: 'solid' | 'material'
  action?: MiToastAction
  /** Auto-dismiss delay in ms. `0` keeps it until dismissed. Defaults to 4000 (0 for `loading`). */
  duration?: number
  dismissible?: boolean
  onDismiss?: () => void
}

export interface MiToastItem extends MiToastOptions {
  id: string
  tone: MiToastTone
  variant: 'solid' | 'material'
  duration: number
}

interface Timer {
  handle: ReturnType<typeof setTimeout> | null
  remaining: number
  startedAt: number
}

const state = shallowRef<MiToastItem[]>([])
const timers = new Map<string, Timer>()
let seq = 0
let paused = false

const isClient = () => typeof window !== 'undefined'

function arm(id: string, ms: number) {
  disarm(id)
  if (ms <= 0) return
  const t: Timer = { handle: null, remaining: ms, startedAt: Date.now() }
  timers.set(id, t)
  if (!paused) t.handle = setTimeout(() => dismiss(id), ms)
}
function disarm(id: string) {
  const t = timers.get(id)
  if (t?.handle) clearTimeout(t.handle)
  timers.delete(id)
}

function dismiss(id: string) {
  const item = state.value.find(t => t.id === id)
  if (!item) return
  disarm(id)
  state.value = state.value.filter(t => t.id !== id)
  item.onDismiss?.()
}

function show(input: string | MiToastOptions): string {
  const o: MiToastOptions = typeof input === 'string' ? { message: input } : input
  const id = o.id ?? `mi-toast-${++seq}`
  if (!isClient()) return id
  const tone = o.tone ?? 'neutral'
  const item: MiToastItem = {
    ...o,
    id,
    tone,
    variant: o.variant ?? 'solid',
    duration: o.duration ?? (tone === 'loading' ? 0 : 4000)
  }
  const exists = state.value.some(t => t.id === id)
  state.value = exists ? state.value.map(t => (t.id === id ? item : t)) : [...state.value, item]
  arm(id, item.duration)
  return id
}

function update(id: string, patch: Partial<MiToastOptions>) {
  const cur = state.value.find(t => t.id === id)
  if (!cur) return
  const tone = patch.tone ?? cur.tone
  const next: MiToastItem = {
    ...cur,
    ...patch,
    id,
    tone,
    variant: patch.variant ?? cur.variant,
    duration: patch.duration ?? (patch.tone && patch.tone !== 'loading' && cur.tone === 'loading' ? 4000 : cur.duration)
  }
  state.value = state.value.map(t => (t.id === id ? next : t))
  arm(id, next.duration)
}

function clear() {
  for (const id of [...timers.keys()]) disarm(id)
  const all = state.value
  state.value = []
  all.forEach(t => t.onDismiss?.())
}

/** Pause every running auto-dismiss timer (hover / focus). */
function pause() {
  if (paused) return
  paused = true
  const now = Date.now()
  for (const t of timers.values()) {
    if (!t.handle) continue
    clearTimeout(t.handle)
    t.handle = null
    t.remaining = Math.max(0, t.remaining - (now - t.startedAt))
  }
}
function resume() {
  if (!paused) return
  paused = false
  const now = Date.now()
  for (const [id, t] of timers) {
    t.startedAt = now
    t.handle = setTimeout(() => dismiss(id), Math.max(t.remaining, 1200))
  }
}

function promise<T>(p: Promise<T>, msgs: { loading: string, success: string | ((v: T) => string), error: string | ((e: unknown) => string) }): Promise<T> {
  const id = show({ message: msgs.loading, tone: 'loading' })
  p.then(
    v => update(id, { message: typeof msgs.success === 'function' ? msgs.success(v) : msgs.success, tone: 'success', duration: 4000 }),
    e => update(id, { message: typeof msgs.error === 'function' ? msgs.error(e) : msgs.error, tone: 'error', duration: 5000 })
  )
  return p
}

type Shorthand = (message: string, opts?: Omit<MiToastOptions, 'message' | 'tone'>) => string

/** Global toast queue. Render `<MiToaster />` once (e.g. in app.vue) to display it. */
export function useMiToast() {
  const make = (tone: MiToastTone): Shorthand => (message, opts) => show({ ...opts, message, tone })
  return {
    toasts: state,
    show,
    success: make('success'),
    error: make('error'),
    warning: make('warning'),
    info: make('info'),
    loading: make('loading'),
    update,
    dismiss,
    clear,
    pause,
    resume,
    promise
  }
}
