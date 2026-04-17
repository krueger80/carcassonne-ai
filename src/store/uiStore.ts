import { create } from 'zustand'
import type { MeepleType } from '../core/types/player.ts'
import type { TerritoryOverlayMode } from '../core/types/game.ts'

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
  territoryOverlay: TerritoryOverlayMode
  isManualInteraction: boolean
  toastMessage: string | null
  tileButtonPos: { x: number; y: number } | null
  cameraAction: { type: 'NONE' | 'ZOOM_IN' | 'ZOOM_OUT' | 'RESET', timestamp: number }
  cycleTerritoryOverlay: () => void
  setIsManualInteraction: (isManual: boolean) => void

  setBoardScale: (scale: number) => void
  panBoard: (dx: number, dy: number) => void
  setHoveredCoord: (coord: { x: number; y: number } | null) => void
  addScorePopup: (popup: ScorePopup) => void
  dismissScorePopup: (id: string) => void
  addFlyingElement: (element: FlyingElement) => void
  removeFlyingElement: (id: string) => void
  toggleDevGallery: () => void
  resetView: () => void
  cameraZoomIn: () => void
  cameraZoomOut: () => void
  cameraReset: () => void
  setSelectedMeepleType: (type: MeepleType) => void
  showToast: (message: string, durationMs?: number) => void
  dismissToast: () => void
}

let toastTimerHandle: ReturnType<typeof setTimeout> | null = null

export const useUIStore = create<UIStore>((set) => ({
  boardScale: 1,
  boardOffset: { x: 0, y: 0 },
  hoveredCoord: null,
  activeScorePopups: [],
  flyingElements: [],
  showDevGallery: false,
  selectedMeepleType: 'NORMAL' as MeepleType,
  territoryOverlay: 'off' as TerritoryOverlayMode,
  isManualInteraction: false,
  toastMessage: null,
  tileButtonPos: null,
  cameraAction: { type: 'NONE', timestamp: 0 },
  cycleTerritoryOverlay: () => set((s) => {
    const next: TerritoryOverlayMode =
      s.territoryOverlay === 'off' ? 'incomplete'
        : s.territoryOverlay === 'incomplete' ? 'all'
          : 'off'
    return { territoryOverlay: next }
  }),

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

  cameraZoomIn: () => set({ cameraAction: { type: 'ZOOM_IN', timestamp: Date.now() } }),
  cameraZoomOut: () => set({ cameraAction: { type: 'ZOOM_OUT', timestamp: Date.now() } }),
  cameraReset: () => set({ cameraAction: { type: 'RESET', timestamp: Date.now() } }),

  setSelectedMeepleType: (type) => set({ selectedMeepleType: type }),

  setIsManualInteraction: (isManual) => set({ isManualInteraction: isManual }),

  showToast: (message, durationMs = 3000) => {
    if (toastTimerHandle) clearTimeout(toastTimerHandle)
    toastTimerHandle = setTimeout(() => { toastTimerHandle = null; set({ toastMessage: null }) }, durationMs)
    set({ toastMessage: message })
  },

  dismissToast: () => {
    if (toastTimerHandle) { clearTimeout(toastTimerHandle); toastTimerHandle = null }
    set({ toastMessage: null })
  },
}))
