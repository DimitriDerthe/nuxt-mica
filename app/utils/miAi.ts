import type { ComputedRef, InjectionKey, Ref } from 'vue'

export interface MiTraceCtx { open: ComputedRef<boolean>, id: string, toggle: () => void }
export const MI_TRACE_KEY: InjectionKey<MiTraceCtx> = Symbol('mi-trace')

export type MiAnswer = string | string[]
export interface MiQnCtx {
  active: ComputedRef<string>
  index: ComputedRef<number>
  count: ComputedRef<number>
  answers: Ref<Record<string, MiAnswer>>
  errors: Ref<Record<string, string>>
  other: Record<string, string>
  required: (name: string) => boolean
  register: (name: string, required: boolean) => () => void
  set: (name: string, v: MiAnswer) => void
  prev: () => void
  next: () => void
  skip: () => void
}
export const MI_QN_KEY: InjectionKey<MiQnCtx> = Symbol('mi-questionnaire')
export interface MiQnItemCtx { name: string, multiple: boolean }
export const MI_QN_ITEM_KEY: InjectionKey<MiQnItemCtx> = Symbol('mi-questionnaire-item')
