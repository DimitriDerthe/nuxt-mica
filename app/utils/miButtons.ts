export type MiButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain' | 'bordered' | 'destructive'
export type MiButtonSize = 'mini' | 'small' | 'regular' | 'large' | 'capsule' | 'xlarge'
export type MiBrand = 'primary' | 'secondary'
/** Forces a visual state; meant for documentation boards and visual tests. */
export type MiButtonState = 'rest' | 'hover' | 'focus'

export type MiIconButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain'
export type MiIconButtonSize = 'large' | 'regular' | 'small' | 'toolbar'
export type MiIconButtonShape = 'circle' | 'rounded'

export type MiButtonGroupVariant = 'attached' | 'segmented' | 'split'

export interface MiSegmentOption {
  value: string | number
  /** Visible text. Omit for icon-only options and provide `ariaLabel`. */
  label?: string
  ariaLabel?: string
  disabled?: boolean
}
