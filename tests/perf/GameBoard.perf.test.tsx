import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { GameBoard } from '../../src/components/game/GameBoard.tsx'
import { useGameStore } from '../../src/store/gameStore.ts'
import { useUIStore } from '../../src/store/uiStore.ts'
import { initGame } from '../../src/core/engine/GameEngine.ts'
import React from 'react'

// Mock the child components to track renders
vi.mock('../../src/components/game/TileCell.tsx', () => {
  const React = require('react')
  const TileCellMock = vi.fn(() => <div data-testid="tile-cell" />)
  const MemoTileCell = React.memo(TileCellMock)
  // @ts-ignore
  MemoTileCell.mock = TileCellMock
  return {
    TileCell: MemoTileCell
  }
})

vi.mock('../../src/components/game/PlaceholderCell.tsx', () => {
  const React = require('react')
  const PlaceholderCellMock = vi.fn(() => <div data-testid="placeholder-cell" />)
  const MemoPlaceholderCell = React.memo(PlaceholderCellMock)
  // @ts-ignore
  MemoPlaceholderCell.mock = PlaceholderCellMock
  return {
    PlaceholderCell: MemoPlaceholderCell
  }
})

import { TileCell } from '../../src/components/game/TileCell.tsx'
import { PlaceholderCell } from '../../src/components/game/PlaceholderCell.tsx'

describe('GameBoard Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGameStore.setState({
      gameState: null,
      validPlacements: [],
      placeableSegments: []
    })
    useUIStore.setState({
      hoveredCoord: null,
      boardScale: 1,
      boardOffset: { x: 0, y: 0 }
    })
  })

  it('renders only affected cells on hover', () => {
    const gameState = initGame({ playerNames: ['Player 1', 'Player 2'] })

    // Setup 3x3 grid of tiles around (0,0)
    const tiles: any = {}
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (x === 0 && y === 0) continue
        tiles[`${x},${y}`] = {
          coordinate: { x, y },
          definitionId: 'D',
          rotation: 0,
          meeples: {}
        }
      }
    }

    const board = {
      tiles: {
        ...gameState.board.tiles,
        ...tiles
      },
      minX: -1,
      maxX: 1,
      minY: -1,
      maxY: 1
    }

    useGameStore.setState({
      gameState: {
        ...gameState,
        board
      },
      validPlacements: []
    })

    render(<GameBoard />)

    const tileCellMock = (TileCell as any).mock
    const placeholderCellMock = (PlaceholderCell as any).mock

    tileCellMock.mockClear()
    placeholderCellMock.mockClear()

    // Act: Hover over a placeholder cell at (2, 0)
    // (2, 0) is outside the filled 3x3 grid, so it's a PlaceholderCell.
    act(() => {
      useUIStore.getState().setHoveredCoord({ x: 2, y: 0 })
    })

    const tileRenderCount = tileCellMock.mock.calls.length
    const placeholderRenderCount = placeholderCellMock.mock.calls.length
    const totalRenders = tileRenderCount + placeholderRenderCount

    console.log(`[Optimized] TileCell renders: ${tileRenderCount}`)
    console.log(`[Optimized] PlaceholderCell renders: ${placeholderRenderCount}`)
    console.log(`[Optimized] Total renders on hover: ${totalRenders}`)

    // Expectations:
    // TileCells: 0 renders (none are hovered, none change).
    // PlaceholderCells: 1 render (at 2,0, changes from unhovered to hovered).
    // If there was a previous hovered cell, it would be +1. Ideally 1 or 2.
    // Baseline was ~81.

    expect(tileRenderCount).toBe(0)
    expect(placeholderRenderCount).toBeLessThan(5) // Allow small margin, but definitely not 72
  })
})
