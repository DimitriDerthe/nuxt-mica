import type { InjectionKey, Ref } from 'vue'

export interface MiAccordionContext {
  isOpen: (value: string) => boolean
  toggle: (value: string) => void
  headingLevel: Ref<number>
}

export const miAccordionKey: InjectionKey<MiAccordionContext> = Symbol('mi-accordion')
