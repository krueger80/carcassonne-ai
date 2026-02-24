import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerCard } from '../../src/components/ui/PlayerCard'
import { MeepleType } from '../../src/core/types/player'

// Mock dependencies
vi.mock('../../src/components/svg/MeepleSVG', () => ({
  MeepleSVG: () => <div data-testid="meeple-svg" />
}))
vi.mock('../../src/components/svg/TileSVG', () => ({
  TileSVG: () => <div data-testid="tile-svg" />
}))
vi.mock('../../src/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  )
}))

// Mock images
vi.mock('/images/TradersAndBuilders_Shared/Good_Cloth.png', () => 'cloth.png')
vi.mock('/images/TradersAndBuilders_Shared/Good_Grain.png', () => 'grain.png')
vi.mock('/images/TradersAndBuilders_Shared/Good_Wine.png', () => 'wine.png')


describe('PlayerCard', () => {
  const mockPlayer = {
    id: 'p1',
    name: 'Test Player',
    color: '#ff0000',
    score: 10,
    meeples: {
      available: {
        NORMAL: 5,
        BIG: 1,
        FARMER: 0,
        BUILDER: 0,
        PIG: 0
      },
      onBoard: []
    },
    traderTokens: { CLOTH: 0, WHEAT: 0, WINE: 0 }
  }

  const mockTurnState = {
    phase: 'PLACE_MEEPLE',
    interactionState: 'MEEPLE_SELECTED_TENTATIVELY',
    statusText: 'Your Turn',
    instructionText: 'Place a meeple',
    actions: {
      selectMeeple: vi.fn(),
      confirmMeeple: vi.fn(),
      cancelMeeple: vi.fn()
    },
    selectedMeepleType: 'NORMAL' as MeepleType,
    validMeepleTypes: ['NORMAL', 'BIG'] as MeepleType[]
  }

  it('renders meeple icons as accessible buttons', () => {
    render(
      <PlayerCard
        player={mockPlayer}
        isCurrentTurn={true}
        hasTradersBuilders={false}
        hasInnsCathedrals={true}
        turnState={mockTurnState}
      />
    )

    // Should find a button for NORMAL meeple
    // currently this will fail because it's a div
    const normalMeepleButton = screen.getByRole('button', { name: /Meeple, quantity: 5/i })
    expect(normalMeepleButton).toBeInTheDocument()

    // Check aria-pressed (since it's selected)
    expect(normalMeepleButton).toHaveAttribute('aria-pressed', 'true')

    // Click should trigger selectMeeple
    fireEvent.click(normalMeepleButton)
    expect(mockTurnState.actions.selectMeeple).toHaveBeenCalledWith('NORMAL')
  })

  it('renders disabled meeple icons correctly', () => {
     const disabledTurnState = {
        ...mockTurnState,
        validMeepleTypes: ['BIG'] as MeepleType[] // NORMAL is not valid
     }

     render(
      <PlayerCard
        player={mockPlayer}
        isCurrentTurn={true}
        hasTradersBuilders={false}
        hasInnsCathedrals={true}
        turnState={disabledTurnState}
      />
    )

    const normalMeepleButton = screen.getByRole('button', { name: /Meeple, quantity: 5/i })
    expect(normalMeepleButton).toBeDisabled()
  })
})
