import { createContext, useContext, ReactNode } from 'react'
import { useFirebaseConnection } from '../hooks/useFirebaseConnection'
import { GameState } from '../types'

interface GameContextType {
  gameState: GameState
  isConnected: boolean
  error: string | null
  myPlayerId: string
  isAdmin: boolean
  createRoom: (adminName: string, isSpectator: boolean, jiraUrl?: string) => void
  joinRoom: (roomId: string, playerName: string, isSpectator: boolean) => void
  submitVote: (vote: number | null) => void
  revealCards: () => void
  resetVoting: () => void
  startNewGame: () => void
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const firebaseConnection = useFirebaseConnection()

  return (
    <GameContext.Provider value={firebaseConnection}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextType {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
