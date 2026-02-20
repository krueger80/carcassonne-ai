import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { PlayerCard } from '../../src/components/ui/PlayerCard';

// Mock Player creation manually since we might not need the full type or it might change
const createTestPlayer = (id: string, name: string, color: string) => ({
    id,
    name,
    color,
    score: 0,
    meeples: {
        available: {
            NORMAL: 7,
            BIG: 1,
            FARMER: 0,
            BUILDER: 1,
            PIG: 1,
        },
        onBoard: [],
    },
    traderTokens: { CLOTH: 0, WHEAT: 0, WINE: 0 },
});

describe('PlayerCard', () => {
    it('renders interactive MeepleIcon as a button with a11y attributes', () => {
        const player = createTestPlayer('p1', 'Test Player', '#ff0000');

        const turnState = {
            phase: 'PLACE_MEEPLE',
            interactionState: 'MEEPLE_SELECTION',
            statusText: 'Your Turn',
            instructionText: 'Place a meeple',
            actions: {
                selectMeeple: vi.fn(),
            },
            selectedMeepleType: 'NORMAL' as const,
            validMeepleTypes: ['NORMAL' as const],
        };

        render(
            <PlayerCard
                player={player as any}
                isCurrentTurn={true}
                hasTradersBuilders={true}
                turnState={turnState as any}
            />
        );

        // Find the "Nrm" label text which is inside the MeepleIcon
        const label = screen.getByText('Nrm');

        // It should be inside a button now
        const button = label.closest('button');
        expect(button).not.toBeNull();

        // It should have correct ARIA attributes
        expect(button).toHaveAttribute('type', 'button');
        expect(button).toHaveAttribute('aria-label', 'Select Nrm Meeple');
        // selectedMeepleType is NORMAL, so it should be pressed
        expect(button).toHaveAttribute('aria-pressed', 'true');

        // Clicking it should fire the mock
        fireEvent.click(button!);
        expect(turnState.actions.selectMeeple).toHaveBeenCalledWith('NORMAL');
    });

    it('renders non-selected interactive MeepleIcon with aria-pressed false', () => {
        const player = createTestPlayer('p1', 'Test Player', '#ff0000');

        const turnState = {
            phase: 'PLACE_MEEPLE',
            interactionState: 'MEEPLE_SELECTION',
            statusText: 'Your Turn',
            instructionText: 'Place a meeple',
            actions: {
                selectMeeple: vi.fn(),
            },
            selectedMeepleType: 'NORMAL' as const,
            validMeepleTypes: ['NORMAL' as const, 'BIG' as const],
        };

        render(
            <PlayerCard
                player={player as any}
                isCurrentTurn={true}
                hasTradersBuilders={true}
                turnState={turnState as any}
            />
        );

        // Find BIG meeple
        const label = screen.getByText('Big');
        const button = label.closest('button');

        expect(button).not.toBeNull();
        expect(button).toHaveAttribute('aria-label', 'Select Big Meeple');
        expect(button).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(button!);
        expect(turnState.actions.selectMeeple).toHaveBeenCalledWith('BIG');
    });

    it('renders non-interactive MeepleIcon as div', () => {
        const player = createTestPlayer('p1', 'Test Player', '#ff0000');

        // Not current turn
        render(
            <PlayerCard
                player={player as any}
                isCurrentTurn={false}
                hasTradersBuilders={true}
            />
        );

        const label = screen.getByText('Nrm');
        const button = label.closest('button');
        expect(button).toBeNull(); // Should remain a div

        const div = label.closest('div');
        expect(div).not.toBeNull();
    });
});
