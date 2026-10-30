import { inject, type InjectionKey, type Ref } from 'vue'

export interface MiScrollToOptions {
  /** Where the row lands in the viewport. */
  align?: 'start' | 'center' | 'end'
  behavior?: ScrollBehavior
  /** Extra px between the row and the viewport edge. */
  scrollMargin?: number
}

export interface MiMessageScrollerContext {
  scrollToMessage: (id: string, opts?: MiScrollToOptions) => boolean
  scrollToEnd: (behavior?: ScrollBehavior) => void
  scrollToStart: (behavior?: ScrollBehavior) => void
  /** Whether the viewport can still scroll toward each edge. */
  scrollable: Ref<{ start: boolean, end: boolean }>
  /** Id of the last anchor row at or above the top of the viewport. */
  currentAnchorId: Ref<string | null>
  visibleMessageIds: Ref<string[]>
  observe: (el: Element) => () => void
}

export const MI_MESSAGE_SCROLLER_KEY: InjectionKey<MiMessageScrollerContext> = Symbol('MiMessageScroller')

/** Controls the nearest `MiMessageScroller`: jump to a message by id, scroll to an edge, read visibility and scrollability. */
export function useMiMessageScroller(): MiMessageScrollerContext {
  const ctx = inject(MI_MESSAGE_SCROLLER_KEY, null)
  if (!ctx) throw new Error('useMiMessageScroller must be used inside <MiMessageScroller>')
  return ctx
}
