import { useEffect, useId, useRef } from 'react'
import { useHandSlotsStore, type HandMeepleKind } from './handSlotsStore'

interface HandMeepleViewProps {
  type: HandMeepleKind
  color: string
  /** True when the player has 0 of this meeple available. */
  dimmed?: boolean
}

/**
 * Rendered inside `MeepleIcon` where the 2D SVG used to live. Contributes
 * nothing visible by itself — just takes up a 24×24 slot in the DOM and
 * registers that slot so the shared overlay canvas (which has real access
 * to Three.js) can position a 3D meeple at the same screen coordinates.
 */
export function HandMeepleView({ type, color, dimmed = false }: HandMeepleViewProps) {
  const id = useId()
  const ref = useRef<HTMLDivElement | null>(null)
  const register = useHandSlotsStore((s) => s.register)
  const unregister = useHandSlotsStore((s) => s.unregister)
  const update = useHandSlotsStore((s) => s.update)

  useEffect(() => {
    register({ id, ref, type, color, dimmed })
    return () => unregister(id)
    // register/unregister refs are stable; id is stable per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    update(id, { type, color, dimmed })
  }, [id, type, color, dimmed, update])

  return <div ref={ref} style={{ position: 'absolute', inset: 0 }} />
}
