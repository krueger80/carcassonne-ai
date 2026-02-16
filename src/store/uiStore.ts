import { create } from 'zustand'

interface ScorePopup {
  id: string
  text: string
  x: number
  y: number
  color: string
}

interface UIStore {
  boardScale: number
  boardOffset: { x: number; y: number }
  hoveredCoord: { x: number; y: number } | null
  activeScorePopups: ScorePopup[]
  showDevGallery: boolean

  setBoardScale: (scale: number) => void
  panBoard: (dx: number, dy: number) => void
  setHoveredCoord: (coord: { x: number; y: number } | null) => void
  addScorePopup: (popup: ScorePopup) => void
  dismissScorePopup: (id: string) => void
  toggleDevGallery: () => void
  resetView: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  boardScale: 1,
  boardOffset: { x: 0, y: 0 },
  hoveredCoord: null,
  activeScorePopups: [],
  showDevGallery: false,

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

  toggleDevGallery: () => set((s) => ({ showDevGallery: !s.showDevGallery })),

  resetView: () => set({ boardScale: 1, boardOffset: { x: 0, y: 0 } }),
}))
