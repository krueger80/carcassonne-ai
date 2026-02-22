import { create } from 'zustand'
import type { MeepleType } from '../core/types/player.ts'

interface ScorePopup {
  id: string
  text: string
  x: number
  y: number
  color: string
}

export interface FlyingElement {
  id: string
  type: 'MEEPLE' | 'POINTS'
  startBoardCoord: { x: number; y: number } // board coords (x,y)
  startBoardNode?: { x: number; y: number } // segment centroid in 0-100 units on tile
  targetPlayerId: string
  color: string
  amount?: number
  meepleType?: MeepleType
}

interface UIStore {
  boardScale: number
  boardOffset: { x: number; y: number }
  hoveredCoord: { x: number; y: number } | null
  activeScorePopups: ScorePopup[]
  flyingElements: FlyingElement[]
  showDevGallery: boolean
  selectedMeepleType: MeepleType

  setBoardScale: (scale: number) => void
  panBoard: (dx: number, dy: number) => void
  setHoveredCoord: (coord: { x: number; y: number } | null) => void
  addScorePopup: (popup: ScorePopup) => void
  dismissScorePopup: (id: string) => void
  addFlyingElement: (element: FlyingElement) => void
  removeFlyingElement: (id: string) => void
  toggleDevGallery: () => void
  resetView: () => void
  setSelectedMeepleType: (type: MeepleType) => void
}

export const useUIStore = create<UIStore>((set) => ({
  boardScale: 1,
  boardOffset: { x: 0, y: 0 },
  hoveredCoord: null,
  activeScorePopups: [],
  flyingElements: [],
  showDevGallery: false,
  selectedMeepleType: 'NORMAL' as MeepleType,

  setBoardScale: (scale) => set({ boardScale: Math.max(0.3, Math.min(3, scale)) }),

  panBoard: (dx, dy) => set((s) => ({
    boardOffset: { x: s.boardOffset.x + dx, y: s.boardOffset.y + dy },
  })),

  setHoveredCoord: (coord) => set({ hoveredCoord: coord }),

  addScorePopup: (popup) => set((s) => ({
    activeScorePopups: [...s.activeScorePopups, popup],
  })),

  dismissScorePopup: (id) => set((s) => ({
    activeScorePopups: s.activeScorePopups.filter(p => p.id !== id),
  })),

  addFlyingElement: (element) => set((s) => ({
    flyingElements: [...s.flyingElements, element],
  })),

  removeFlyingElement: (id) => set((s) => ({
    flyingElements: s.flyingElements.filter(e => e.id !== id),
  })),

  toggleDevGallery: () => set((s) => ({ showDevGallery: !s.showDevGallery })),

  resetView: () => set({ boardScale: 1, boardOffset: { x: 0, y: 0 } }),

  setSelectedMeepleType: (type) => set({ selectedMeepleType: type }),
}))
