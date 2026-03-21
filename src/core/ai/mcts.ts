import { GameState } from '../types/game.ts'
import { Coordinate } from '../types/board.ts'
import { Rotation } from '../types/tile.ts'
import { MeepleType } from '../types/player.ts'
import { 
  getPotentialPlacementsForState, 
  getValidTileRotations, 
  placeTile, 
  getAvailableSegmentsForMeeple, 
  getValidMeepleTypes, 
  placeMeeple, 
  skipMeeple, 
  endTurn, 
  rotateTile,
  getFeature,
} from '../engine/GameEngine.ts'
import { nodeKey } from '../types/feature.ts'

export interface BotAction {
  tilePlacement?: {
    coordinate: Coordinate
    rotation: Rotation
  }
  meeplePlacement?: {
    segmentId: string
    meepleType: MeepleType
  } | null // null means skip
}

/**
 * Heuristic-based bot that evaluates moves by immediate score delta and long-term potential.
 */
export function computeBestMove(state: GameState, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): BotAction {
  if (state.turnPhase !== 'PLACE_TILE' || !state.currentTile) {
    return {}
  }

  const myMe = state.players[state.currentPlayerIndex]
  const myPlayerId = myMe.id
  const availableCount = Object.values(myMe.meeples.available).reduce((a, b) => a + b, 0)
  console.log(`🤖 AI Turn: ${myMe.id} (${myMe.color}) | Available Meeples: ${availableCount} (NORMAL:${myMe.meeples.available.NORMAL}, BIG:${myMe.meeples.available.BIG}) | Tiles Left: ${state.tileBag.length}`)

  // 1. Generate all valid tile placements
  const validCoords = getPotentialPlacementsForState(state)
  const allTileMoves: { coordinate: Coordinate, rotation: Rotation }[] = []
  for (const coord of validCoords) {
    const validRots = getValidTileRotations(state, coord)
    for (const rot of validRots) {
      allTileMoves.push({ coordinate: coord, rotation: rot })
    }
  }

  if (allTileMoves.length === 0) return {}

  let bestMove: BotAction = {}

  // 2. Evaluate each tile move (and subsequent meeple moves)
  // Silence engine logs during bulk simulation to improve performance and prevent 500 errors
  const originalLog = console.log
  console.log = () => {}
  
  const candidateMoves: { action: BotAction, stateAfterTurn: GameState, score: number, breakdown: Record<string, any> }[] = []

  try {
    for (const tileMove of allTileMoves) {
      let simTileState = state
      while (simTileState.currentTile && simTileState.currentTile.rotation !== tileMove.rotation) {
        simTileState = rotateTile(simTileState)
      }
    simTileState = placeTile(simTileState, tileMove.coordinate)

    // Sub-evaluation: Meeple placement
    const meepleOptions: (BotAction['meeplePlacement'])[] = [null] // skip is always an option
    const availableSegments = getAvailableSegmentsForMeeple(simTileState)
    const availableTypes = getValidMeepleTypes(simTileState)

    for (const seg of availableSegments) {
      for (const type of availableTypes) {
        meepleOptions.push({ segmentId: seg, meepleType: type })
      }
    }

    for (const meepleMove of meepleOptions) {
      let simFinalState = simTileState
      if (meepleMove) {
        simFinalState = placeMeeple(simFinalState, meepleMove.segmentId, meepleMove.meepleType)
      } else {
        simFinalState = skipMeeple(simFinalState)
      }

      // If placeMeeple failed (e.g. invalid BUILDER placement), the phase won't advance to SCORE.
      // We must drop this invalid move branch entirely!
      if (simFinalState.turnPhase === 'PLACE_MEEPLE') {
        continue
      }

      // Finalize turn to get score delta (this includes feature completions)
      simFinalState = endTurn(simFinalState)

      const breakdown: Record<string, any> = {}
      const utility = evaluateState(state, simFinalState, myPlayerId, difficulty, breakdown)

      candidateMoves.push({
        action: { tilePlacement: tileMove, meeplePlacement: meepleMove },
        stateAfterTurn: simFinalState,
        score: utility,
        breakdown
      })
    }
  }

  if (candidateMoves.length === 0) return {}

  // --- DEBUG: Trace city placement options ---
  const tileDef = state.staticTileMap[state.currentTile!.definitionId]
  const segTypes = tileDef?.segments.map(s => `${s.id}(${s.type})`) ?? []
  console.log(`🔍 Tile segments: [${segTypes.join(', ')}]`)
  
  const cityMoves = candidateMoves.filter(c => 
    c.action.meeplePlacement?.segmentId?.startsWith('city')
  )
  const roadMoves = candidateMoves.filter(c => 
    c.action.meeplePlacement?.segmentId?.startsWith('road')
  )
  const fieldMoves = candidateMoves.filter(c => 
    c.action.meeplePlacement?.segmentId?.startsWith('field')
  )
  const skipMoves = candidateMoves.filter(c => !c.action.meeplePlacement)
  const immediateMoves = candidateMoves.filter(c => c.breakdown.immediatePoints > 0)
  
  console.log(`🔍 Candidate counts: ${candidateMoves.length} total | city:${cityMoves.length} road:${roadMoves.length} field:${fieldMoves.length} skip:${skipMoves.length} | immediateScoring:${immediateMoves.length}`)
  
  if (cityMoves.length > 0) {
    const bestCity = cityMoves.sort((a, b) => b.score - a.score)[0]
    console.log('🔍 Best CITY move:', {
      coord: `(${bestCity.action.tilePlacement?.coordinate.x},${bestCity.action.tilePlacement?.coordinate.y})`,
      rot: bestCity.action.tilePlacement?.rotation,
      meeple: `${bestCity.action.meeplePlacement?.meepleType} on ${bestCity.action.meeplePlacement?.segmentId}`,
      score: bestCity.score.toFixed(2),
      breakdown: bestCity.breakdown
    })
  } else {
    const reason = availableCount === 0 ? "OUT OF MEEPLES" : "NO VALID CITY SEGMENTS"
    console.log(`🔍 ⚠️ NO city meeple options available at any position/rotation! (Reason: ${reason})`)
  }
  
  if (immediateMoves.length > 0) {
    const bestImm = immediateMoves.sort((a, b) => b.score - a.score)[0]
    console.log('🔍 Best IMMEDIATE scoring move:', {
      coord: `(${bestImm.action.tilePlacement?.coordinate.x},${bestImm.action.tilePlacement?.coordinate.y})`,
      rot: bestImm.action.tilePlacement?.rotation,
      meeple: bestImm.action.meeplePlacement ? `${bestImm.action.meeplePlacement.meepleType} on ${bestImm.action.meeplePlacement.segmentId}` : 'SKIP',
      score: bestImm.score.toFixed(2),
      immediatePoints: bestImm.breakdown.immediatePoints,
    })
  }
  // --- END DEBUG ---

  // 3. For Hard Mode: Do a shallow Minimax (2-ply lookahead)
  // Evaluate ALL candidates to prevent unevaluated SKIP moves from bypassing minimax.
  if (difficulty === 'hard') {
      for (const candidate of candidateMoves) {
         let branchUtility = candidate.score
         const oppState = candidate.stateAfterTurn

          // If the game is over, we don't need to look ahead
         if (oppState.phase === 'END' || oppState.tileBag.length === 0) {
             candidate.score += 1000 // Huge bonus if this move wins/ends well
         } else {
             // After endTurn(), currentPlayerIndex is already advanced to the next player.
             // So oppState.currentPlayerIndex IS the opponent (or us again if builder bonus).
             const nextPlayerId = oppState.players[oppState.currentPlayerIndex]?.id
             
             // ❗ CRITICAL FIX: Even if we get a builder bonus turn, we must check 
             // if any opponent gained points from our first tile placement.
             const opponents = oppState.players.filter(p => p.id !== myPlayerId)
             for (const opp of opponents) {
                 const oppId = opp.id
                 const oppScoreBefore = state.players.find(p => p.id === oppId)?.score || 0
                 const oppScoreAfter = oppState.players.find(p => p.id === oppId)?.score || 0
                 
                 const oppImmediateGainRaw = oppScoreAfter - oppScoreBefore
                 
                 // If they gained real points, apply a massive penalty
                 if (oppImmediateGainRaw > 0) {
                     const immediatePenalty = oppImmediateGainRaw * 10 * 4 // Increased to 4x (40x heuristic pts)
                     branchUtility -= immediatePenalty
                     candidate.breakdown[`penalty_opp_${oppId}_immediate`] = -immediatePenalty
                     console.log(`❗ AI Move (${candidate.action.tilePlacement?.coordinate.x},${candidate.action.tilePlacement?.coordinate.y}) completed opponent ${oppId} feature (+${oppImmediateGainRaw} pts) → applying penalty -${immediatePenalty}`)
                 }
                 
                 // Additionally check heuristic delta (potential improvement)
                 const oppBreakdownBefore: Record<string, any> = {}
                 const hScoreBefore = evaluateState(state, state, oppId, difficulty, oppBreakdownBefore)
                 const oppBreakdownAfter: Record<string, any> = {}
                 const hScoreAfter = evaluateState(state, oppState, oppId, difficulty, oppBreakdownAfter)
                 
                 const oppDelta = Math.max(0, hScoreAfter - hScoreBefore)
                 if (oppDelta > 0) {
                     const deltaPenalty = oppDelta * 1.5 
                     branchUtility -= deltaPenalty
                     candidate.breakdown[`penalty_opp_${oppId}_delta`] = -deltaPenalty
                 }
             }

             if (nextPlayerId === myPlayerId) {
                 // Builder bonus: we get another turn! Give a flat bonus.
                 branchUtility += 80
                 candidate.breakdown.minimaxBonus = 80
             }
         }

         candidate.score = branchUtility
      }

      // Sort after Minimax penalty
      candidateMoves.sort((a, b) => b.score - a.score)
  } else {
      // Easy and Medium stay greedy. Randomize equal top scores slightly to prevent repetitive play.
      candidateMoves.sort((a, b) => {
          if (Math.abs(b.score - a.score) < 0.01) return Math.random() - 0.5
          return b.score - a.score
      })
    }
  } finally {
    console.log = originalLog
  }

  bestMove = candidateMoves[0].action

  // --- DEBUG TRACES ---
  // We want to print everything needed to understand the AI's decision:
  // Board state, current tile, and the best few candidate moves!
  console.groupCollapsed(`🤖 AI Debug: Player ${state.players[state.currentPlayerIndex].id} - Difficulty: ${difficulty}`)
  console.log(`Tile to place:`, state.currentTile?.definitionId)

  // Concise board summary for reproducing states
  const boardSummary = Object.keys(state.board.tiles).map(k => {
    const t = state.board.tiles[k]
    return { pos: k, id: t.definitionId, rot: t.rotation }
  })
  console.log('Board State (concise):', JSON.stringify(boardSummary))

  // Instead of history, show last placed coords for context
  console.log('Last Placements by Player:', state.lastPlacedCoordByPlayer)

  // Top considered moves with breakdowns
  const topMovesReport = candidateMoves.slice(0, 5).map(c => {
    return {
      move: {
        x: c.action.tilePlacement?.coordinate.x,
        y: c.action.tilePlacement?.coordinate.y,
        rot: c.action.tilePlacement?.rotation,
        meeple: c.action.meeplePlacement ? `${c.action.meeplePlacement.meepleType} on [${c.action.meeplePlacement.segmentId}]` : 'SKIP'
      },
      score: c.score.toFixed(2),
      breakdown: c.breakdown
    }
  })
  
  console.log('Top Moves Evaluated (Best First):')
  console.table(topMovesReport.map(m => ({
    move: `(${m.move.x},${m.move.y}) r${m.move.rot} | Mee: ${m.move.meeple}`,
    score: m.score,
    breakdownKeys: Object.keys(m.breakdown).join(', ')
  })))
  console.log('Detailed Breakdowns:', JSON.stringify(topMovesReport, null, 2))

  console.log(`Chosen Move:`, JSON.stringify(bestMove))
  console.groupEnd()
  // --- END DEBUG TRACES ---

  return bestMove
}

/**
 * Heuristic utility function to score a resulting state.
 */
export function evaluateState(oldState: GameState, newState: GameState, myPlayerId: string, difficulty: string, outBreakdown: Record<string, any> = {}): number {
  const oldMe = oldState.players.find(p => p.id === myPlayerId)!
  const newMe = newState.players.find(p => p.id === myPlayerId)!

  let score = 0
  outBreakdown.featurePoints = 0
  outBreakdown.featureList = []

  // 1. Immediate points gained (high value)
  const immediatePoints = (newMe.score - oldMe.score) * 10
  score += immediatePoints
  outBreakdown.immediatePoints = immediatePoints

  // 2. Potential points: size of features we have meeples on
  const ufOld = oldState.featureUnionFind
  const ufNew = newState.featureUnionFind
  
  const allMeeplesNew = Object.values(newState.boardMeeples)
  const myMeeplesNew = allMeeplesNew.filter(m => m.playerId === myPlayerId)
  const oppMeeplesNew = allMeeplesNew.filter(m => m.playerId !== myPlayerId && m.playerId !== 'neutral') // ignore neutral/fairy if present

  // Track scored union-find IDs so we don't double or triple count points if multiple meeples share a feature
  const scoredUfIds = new Set<string>()

  for (const m of myMeeplesNew) {
    const feature = getFeature(ufNew, nodeKey(m.coordinate, m.segmentId))
    if (!feature) {
      // Cloisters and Gardens are not in the union-find. Discover their stats manually.
      const tile = newState.board.tiles[`${m.coordinate.x},${m.coordinate.y}`]
      const def = newState.staticTileMap[tile.definitionId]
      const seg = def?.segments.find(s => s.id === m.segmentId)
      
      if (seg && (seg.type === 'CLOISTER' || seg.type === 'GARDEN')) {
        let surroundingCount = 0
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (newState.board.tiles[`${m.coordinate.x + dx},${m.coordinate.y + dy}`]) surroundingCount++
          }
        }
        let clScore = surroundingCount * 2
        if (difficulty === 'hard' && newState.tileBag.length < 10) {
           const missing = 9 - surroundingCount
           if (missing > 3) clScore -= (10 - newState.tileBag.length) * 2
        }
        
        // Scale to match 10x heuristic multiplier
        const clPoints = (clScore * 8)
        score += clPoints
        outBreakdown.featurePoints += clPoints
        outBreakdown.featureList.push({ type: seg.type, points: clPoints, surrounding: surroundingCount })
      }
      continue
    }

    if (scoredUfIds.has(feature.id)) continue
    scoredUfIds.add(feature.id)

    let featScore = 0
    let meepleRecoveryBonus = 0

    if (difficulty === 'hard') {
      // Hard mode: Value features at their expected scoring potential
      if (feature.type === 'CITY') {
         // Cities score (tileCount + pennants) * 2 when complete.
         // Value at expected completion score rather than raw tile count.
         featScore = (feature.tileCount + feature.pennantCount) * 2
      } else if (feature.type === 'ROAD') {
         featScore = feature.tileCount * 1.5
      } else if (feature.type === 'FIELD') {
         // Evaluate by adjacent completed cities instead of just tile count
         const cityRoots = new Set(feature.touchingCityIds.map(cid => getFeature(ufNew, cid)?.id).filter(Boolean))
         let completedCityCount = 0
         let incompleteCityCount = 0
         
         for (const rootId of cityRoots) {
           const cFeat = getFeature(ufNew, rootId!)
           if (cFeat) {
             if (cFeat.isComplete) completedCityCount++
             else incompleteCityCount++
           }
         }
         
         
         
         featScore = (completedCityCount * 3) + (incompleteCityCount * 1) + (feature.tileCount * 0.5)
      } else {
         featScore = feature.tileCount
      }

      // Scale to match the 10x heuristic multiplier of immediate points.
      // We use 8x so potential points are valued slightly less than guaranteed immediate points.
      featScore *= 8

      // Hard mode: Completion Urgency — scale bonuses by feature value
      // Cities are worth 2pts/tile when complete, roads only 1pt/tile.
      // Urgency should reflect the EXPECTED SCORING VALUE, not just proximity to completion.
      if (feature.type === 'CITY') {
        // Cities are the most valuable features. High urgency!
        if (feature.openEdgeCount === 1) {
          featScore += 50  // Almost done! Will score (tiles+pennants)*2
          meepleRecoveryBonus = 25
        } else if (feature.openEdgeCount === 2) {
          featScore += 30  // Close to completion, very attractive
          meepleRecoveryBonus = 15
        } else if (feature.openEdgeCount === 3) {
          featScore += 15  // Reachable, still good
          meepleRecoveryBonus = 8
        } else if (feature.openEdgeCount <= 5) {
          featScore += 5
          meepleRecoveryBonus = 3
        }
      } else if (feature.type === 'ROAD') {
        // Roads are less valuable (1pt/tile). Much lower urgency.
        if (feature.openEdgeCount === 1) {
          featScore += 15  // Almost done but only worth ~1-3 pts
          meepleRecoveryBonus = 10
        } else if (feature.openEdgeCount === 2) {
          featScore += 5
          meepleRecoveryBonus = 3
        }
      }

      // Late game meeple penalty: don't start new big projects if bag is almost empty
      const remainingTiles = newState.tileBag.length
      if (remainingTiles < 10 && feature.openEdgeCount > 2) {
        featScore -= (10 - remainingTiles) * 20
        meepleRecoveryBonus = 0
      }

      // Feature contention (sharing or stealing)
      const meeplesOnFeat = allMeeplesNew.filter(am => {
        const f2 = getFeature(ufNew, nodeKey(am.coordinate, am.segmentId))
        return f2 && f2.id === feature.id
      })

      const myStrength = meeplesOnFeat.filter(am => am.playerId === myPlayerId)
        .reduce((sum, am) => sum + (am.meepleType === 'BIG' ? 2 : 1), 0)
      const oppStrength = meeplesOnFeat.filter(am => am.playerId !== myPlayerId)
        .reduce((sum, am) => sum + (am.meepleType === 'BIG' ? 2 : 1), 0)

      if (oppStrength > 0) {
        if (myStrength > oppStrength) {
          // We stole it! Massive bonus.
          featScore += 150
        } else if (myStrength === oppStrength) {
          // We are sharing it. Still good.
          featScore += 80
        } else {
          // We are losing it. It's essentially dead weight for points...
          featScore = 0
          // ...BUT we still want our meeple back! We keep the meepleRecoveryBonus 
          // to encourage completing "lost" features just to get the meeple back.
          outBreakdown.isContested = true
        }
      }
    } else {
      // Easy/Medium Base potential
      const multiplier = feature.type === 'CITY' ? 2 : feature.type === 'FIELD' ? 3 : 1
      featScore = (feature.tileCount * multiplier) * 6
      if (feature.openEdgeCount === 1) featScore += 30
    }

    const myMeeplesOnFeat = difficulty === 'hard' 
      ? allMeeplesNew.filter(am => {
          if (am.playerId !== myPlayerId) return false
          const f2 = getFeature(ufNew, nodeKey(am.coordinate, am.segmentId))
          return f2 && f2.id === feature.id
        })
      : []

    score += featScore + meepleRecoveryBonus
    outBreakdown.featurePoints += featScore + meepleRecoveryBonus
    outBreakdown.featureList.push({ 
      id: feature.id, 
      type: feature.type, 
      points: featScore + meepleRecoveryBonus, 
      tiles: feature.tileCount, 
      openEdges: feature.openEdgeCount,
      meeples: myMeeplesOnFeat.map(m => `${m.meepleType === 'BIG' ? 'BIG' : 'Mee'}@(${m.coordinate.x},${m.coordinate.y})`)
    })
  }

  // 3. Meeple preservation — diminishing returns model
  const availableCount = Object.values(newMe.meeples.available).reduce((a, b) => a + b, 0)
  
  if (difficulty === 'hard') {
     // Diminishing returns: each additional idle meeple is less valuable than the last.
     // Having 2-3 meeples available is great (flexibility), 4+ is hoarding.
     // The first 2 have high value (safety net), 3rd-4th moderate, 5th+ minimal.
     const remainingTiles = newState.tileBag.length
     const baseCost = 8 + ((remainingTiles / 72) * 12) // 8-20 per meeple base
     
     let meeplePoints = 0
     for (let i = 0; i < availableCount; i++) {
       if (i < 2) meeplePoints += baseCost * 1.5      // First 2: high value (safety net)
       else if (i < 4) meeplePoints += baseCost * 0.8  // 3rd-4th: moderate
       else meeplePoints += baseCost * 0.3              // 5th+: diminishing
     }
     
     score += meeplePoints
     outBreakdown.meeplePreservation = meeplePoints
     
     // Penalty for having zero features: if you have no meeples deployed, you're scoring nothing!
     // BUT: if we just scored immediate points (completed a feature and got meeple back),
     // having 0 deployed is fine — we just cashed in! Don't penalize successful completion.
     const deployedCount = myMeeplesNew.length
     if (deployedCount === 0 && immediatePoints === 0) {
       score -= 20 // Incentive to place meeple (but not so harsh it prevents completing)
       outBreakdown.noFeaturePenalty = -20
     } else if (deployedCount === 1 && immediatePoints === 0) {
       score -= 5
       outBreakdown.noFeaturePenalty = -5
     }
  } else {
     const meeplePoints = availableCount * 2
     score += meeplePoints
     outBreakdown.meeplePreservation = meeplePoints
  }

  // 4. Opponent Sabotage (Hard mode only)
  outBreakdown.sabotagePoints = 0
  if (difficulty === 'hard') {
    // Only apply sabotage tracking if we were the player that just moved!
    // Otherwise oppThreatScore includes self-sabotage points resulting in evaluating our own features!
    const playerWhoMovedId = oldState.players[oldState.currentPlayerIndex]?.id
    if (playerWhoMovedId === myPlayerId) {
      for (const om of oppMeeplesNew) {
        const oppFeatureNew = getFeature(ufNew, nodeKey(om.coordinate, om.segmentId))
        const oppFeatureOld = getFeature(ufOld, nodeKey(om.coordinate, om.segmentId))
        
        if (oppFeatureNew && oppFeatureOld) {
           // If we added to their feature but didn't help complete it (open edges increased or stayed high)
           if (oppFeatureNew.tileCount > oppFeatureOld.tileCount && oppFeatureNew.openEdgeCount >= oppFeatureOld.openEdgeCount) {
               score += 5 // minor annoy bonus
               outBreakdown.sabotagePoints += 5
           }
        }
      }
    }
  }

  // Randomness
  let randomPoints = 0
  if (difficulty === 'easy') {
    randomPoints = (Math.random() - 0.5) * 50
  } else if (difficulty === 'medium') {
    randomPoints = (Math.random() - 0.5) * 5
  } else if (difficulty === 'hard') {
    randomPoints = (Math.random() - 0.5) * 1 // Teeny tie-breaker
  }
  score += randomPoints
  outBreakdown.randomness = randomPoints

  outBreakdown.totalScore = score
  return score
}

