import { create } from 'zustand'
import type { MutableRefObject } from 'react'

export type HandMeepleKind = 'NORMAL' | 'BIG' | 'BUILDER' | 'PIG' | 'ABBOT'

export interface HandSlot {
  id: string
  ref: MutableRefObject<HTMLElement | null>
  type: HandMeepleKind
  color: string
  /** True when the player has 0 of this meeple available. */
  dimmed: boolean
}

interface HandSlotsState {
  slots: HandSlot[]
  register: (slot: HandSlot) => void
  unregister: (id: string) => void
  update: (id: string, patch: Partial<Pick<HandSlot, 'color' | 'dimmed' | 'type'>>) => void
}

export const useHandSlotsStore = create<HandSlotsState>((set) => ({
  slots: [],
  register: (slot) =>
    set((s) => ({
      slots: s.slots.some((e) => e.id === slot.id)
        ? s.slots.map((e) => (e.id === slot.id ? slot : e))
        : [...s.slots, slot],
    })),
  unregister: (id) =>
    set((s) => ({ slots: s.slots.filter((e) => e.id !== id) })),
  update: (id, patch) =>
    set((s) => ({
      slots: s.slots.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
}))
