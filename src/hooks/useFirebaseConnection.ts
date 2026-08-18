import { useCallback, useEffect, useRef, useState } from 'react'
import { ref, set, onValue, update, remove, onDisconnect } from 'firebase/database'
import { db } from '../firebase'
import { GameState, Player } from '../types'

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function generatePlayerId(): string {
  return 'player-' + Math.random().toString(36).substring(2, 10)
}

export function useFirebaseConnection() {
  const [gameState, setGameState] = useState<GameState>({
    roomId: '',
    players: [],
    isRevealed: false,
    isVotingActive: false,
  })
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myPlayerId, setMyPlayerId] = useState<string>('')

  const isAdminRef = useRef(false)
  const roomIdRef = useRef('')
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Listen to room state changes
  const listenToRoom = useCallback((roomId: string) => {
    const roomRef = ref(db, `rooms/${roomId}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const players: Player[] = data.players ? Object.values(data.players) : []
        setGameState({
          roomId,
          players,
          isRevealed: data.isRevealed || false,
          isVotingActive: data.isVotingActive || false,
        })
        setIsConnected(true)
        setError(null)
      } else {
        if (!isAdminRef.current) {
          setError('Room not found or has been closed.')
          setIsConnected(false)
        }
      }
    }, (err) => {
      setError(`Connection error: ${err.message}`)
      setIsConnected(false)
    })

    unsubscribeRef.current = unsubscribe
  }, [])

  // Admin: create a new room
  const createRoom = useCallback(
    (adminName: string, isSpectator: boolean) => {
      const roomId = generateRoomId()
      const playerId = generatePlayerId()

      isAdminRef.current = true
      roomIdRef.current = roomId
      setMyPlayerId(playerId)

      const adminPlayer: Player = {
        id: playerId,
        name: adminName,
        vote: null,
        isSpectator,
        isAdmin: true,
      }

      const roomData = {
        isRevealed: false,
        isVotingActive: true,
        createdAt: Date.now(),
        players: {
          [playerId]: adminPlayer,
        },
      }

      const roomRef = ref(db, `rooms/${roomId}`)
      set(roomRef, roomData).then(() => {
        // Set up cleanup when admin disconnects
        const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`)
        onDisconnect(playerRef).remove()

        listenToRoom(roomId)
      }).catch((err) => {
        setError(`Failed to create room: ${err.message}`)
      })
    },
    [listenToRoom]
  )

  // Player: join an existing room
  const joinRoom = useCallback(
    (roomId: string, playerName: string, isSpectator: boolean) => {
      const playerId = generatePlayerId()
      const upperRoomId = roomId.toUpperCase()

      roomIdRef.current = upperRoomId
      setMyPlayerId(playerId)

      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        vote: null,
        isSpectator,
        isAdmin: false,
      }

      // Check if room exists first
      const roomRef = ref(db, `rooms/${upperRoomId}`)
      onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) {
          setError('Room not found. Please check the room code.')
        }
      }, { onlyOnce: true })

      // Add player to room
      const playerRef = ref(db, `rooms/${upperRoomId}/players/${playerId}`)
      set(playerRef, newPlayer).then(() => {
        // Remove player on disconnect
        onDisconnect(playerRef).remove()
        listenToRoom(upperRoomId)
      }).catch((err) => {
        setError(`Failed to join room: ${err.message}`)
      })
    },
    [listenToRoom]
  )

  // Submit a vote
  const submitVote = useCallback(
    (vote: number | null) => {
      if (!roomIdRef.current || !myPlayerId) return
      const playerRef = ref(db, `rooms/${roomIdRef.current}/players/${myPlayerId}/vote`)
      set(playerRef, vote)
    },
    [myPlayerId]
  )

  // Admin: reveal all cards
  const revealCards = useCallback(() => {
    if (!isAdminRef.current || !roomIdRef.current) return
    const roomRef = ref(db, `rooms/${roomIdRef.current}`)
    update(roomRef, { isRevealed: true })
  }, [])

  // Admin: reset voting (vote again)
  const resetVoting = useCallback(() => {
    if (!isAdminRef.current || !roomIdRef.current) return

    const roomRef = ref(db, `rooms/${roomIdRef.current}`)
    update(roomRef, { isRevealed: false, isVotingActive: true })

    // Reset all player votes
    const playersRef = ref(db, `rooms/${roomIdRef.current}/players`)
    onValue(playersRef, (snapshot) => {
      const players = snapshot.val()
      if (players) {
        const updates: Record<string, null> = {}
        Object.keys(players).forEach((pid) => {
          updates[`${pid}/vote`] = null
        })
        update(playersRef, updates)
      }
    }, { onlyOnce: true })
  }, [])

  // Admin: start a new game
  const startNewGame = useCallback(() => {
    if (!isAdminRef.current || !roomIdRef.current) return

    const roomRef = ref(db, `rooms/${roomIdRef.current}`)
    update(roomRef, { isRevealed: false, isVotingActive: true })

    // Reset all player votes
    const playersRef = ref(db, `rooms/${roomIdRef.current}/players`)
    onValue(playersRef, (snapshot) => {
      const players = snapshot.val()
      if (players) {
        const updates: Record<string, null> = {}
        Object.keys(players).forEach((pid) => {
          updates[`${pid}/vote`] = null
        })
        update(playersRef, updates)
      }
    }, { onlyOnce: true })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      // Remove player from room on unmount
      if (roomIdRef.current && myPlayerId) {
        const playerRef = ref(db, `rooms/${roomIdRef.current}/players/${myPlayerId}`)
        remove(playerRef)
      }
    }
  }, [myPlayerId])

  return {
    gameState,
    isConnected,
    error,
    myPlayerId,
    isAdmin: isAdminRef.current,
    createRoom,
    joinRoom,
    submitVote,
    revealCards,
    resetVoting,
    startNewGame,
  }
}
