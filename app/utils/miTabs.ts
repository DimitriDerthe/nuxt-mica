import type { InjectionKey, Ref } from 'vue'

export interface MiTabsContext {
  model: Ref<string | undefined>
  uid: string
  orientation: Ref<'horizontal' | 'vertical'>
}
export const miTabsKey: InjectionKey<MiTabsContext> = Symbol('mi-tabs')
