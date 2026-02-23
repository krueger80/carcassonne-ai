import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlayerCard } from '../../../src/components/ui/PlayerCard'
import { createPlayer } from '../../../src/core/types/player'
import React from 'react'

// Mock the button component to prevent issues with framer-motion in test environment if needed
// but usually testing-library works fine with it.
// If not, we might need to mock framer-motion.

describe('PlayerCard', () => {
    const player = createPlayer('p1', 'Player 1', '#ff0000')

    it('renders meeple icons as accessible buttons when interactive', () => {
        const selectMeepleMock = vi.fn()

        const turnState: any = {
            phase: 'PLACE_MEEPLE',
            interactionState: 'WAITING_FOR_MEEPLE_SELECTION',
            statusText: 'Place a meeple',
            instructionText: 'Select a meeple to place',
            actions: {
                selectMeeple: selectMeepleMock,
            },
            validMeepleTypes: ['NORMAL'],
        }

        render(
            <PlayerCard
                player={player}
                isCurrentTurn={true}
                hasTradersBuilders={false}
                hasInnsCathedrals={false}
                turnState={turnState}
            />
        )

        // It should find a button for the normal meeple
        // Initially this test will fail because it's a div, not a button
        // After refactor, it should pass
        const meepleButton = screen.getByRole('button', { name: /Meeple meeple, 7 remaining/i })
        expect(meepleButton).toBeInTheDocument()
        expect(meepleButton).not.toBeDisabled()

        // Simulate click
        meepleButton.click()
        expect(selectMeepleMock).toHaveBeenCalledWith('NORMAL')
    })

    it('renders meeple icons as non-interactive elements when not current turn', () => {
        render(
            <PlayerCard
                player={player}
                isCurrentTurn={false}
                hasTradersBuilders={false}
                hasInnsCathedrals={false}
            />
        )

        // Should not find a button
        const meepleButton = screen.queryByRole('button', { name: /Meeple meeple/i })
        expect(meepleButton).not.toBeInTheDocument()

        // Should find the image/div representation
        // We can look for the title attribute which is currently used
        const meepleIcon = screen.getByTitle('Meeple')
        expect(meepleIcon).toBeInTheDocument()
    })
})
