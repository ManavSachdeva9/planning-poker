export interface Player {
  id: string
  name: string
  vote: number | null | false
  isSpectator: boolean
  isAdmin: boolean
}

export interface GameState {
  roomId: string
  players: Player[]
  isRevealed: boolean
  isVotingActive: boolean
}

export type MessageType =
  | 'join'
  | 'player-joined'
  | 'vote'
  | 'reveal'
  | 'reset'
  | 'state-sync'
  | 'player-left'
  | 'new-game'

export interface PeerMessage {
  type: MessageType
  payload: unknown
}

export interface JoinPayload {
  name: string
  isSpectator: boolean
}

export interface VotePayload {
  playerId: string
  vote: number | null
}

export interface StateSyncPayload {
  gameState: GameState
}

export interface PlayerJoinedPayload {
  player: Player
}

export interface PlayerLeftPayload {
  playerId: string
}

export const FIBONACCI_SEQUENCE = [0, 1, 2, 3, 5, 8, 13, 21]
