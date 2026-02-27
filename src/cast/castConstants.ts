/** Custom Cast namespace for game state messages */
export const CAST_NAMESPACE = 'urn:x-cast:com.carcassonne.game'

/** Message types sent over the Cast namespace */
export interface CastMessage {
  type: 'STATE_UPDATE'
  json: string // JSON-serialized GameState
}
