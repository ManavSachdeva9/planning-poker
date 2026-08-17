import { useCallback, useEffect, useRef, useState } from 'react'
import Peer, { DataConnection } from 'peerjs'
import {
  GameState,
  JoinPayload,
  PeerMessage,
  Player,
  StateSyncPayload,
  VotePayload,
} from '../types'

const PEER_PREFIX = 'planning-poker-'

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function usePeerConnection() {
  const [peer, setPeer] = useState<Peer | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    roomId: '',
    players: [],
    isRevealed: false,
    isVotingActive: false,
  })
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myPlayerId, setMyPlayerId] = useState<string>('')

  const connectionsRef = useRef<Map<string, DataConnection>>(new Map())
  const gameStateRef = useRef<GameState>(gameState)
  const isAdminRef = useRef(false)

  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  const broadcastToAll = useCallback((message: PeerMessage) => {
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(message)
      }
    })
  }, [])

  const syncStateToAll = useCallback(() => {
    const message: PeerMessage = {
      type: 'state-sync',
      payload: { gameState: gameStateRef.current } as StateSyncPayload,
    }
    broadcastToAll(message)
  }, [broadcastToAll])

  // Admin: handle incoming data from a player
  const handleAdminData = useCallback(
    (data: PeerMessage, connectionId: string) => {
      switch (data.type) {
        case 'join': {
          const joinPayload = data.payload as JoinPayload
          const newPlayer: Player = {
            id: connectionId,
            name: joinPayload.name,
            vote: null,
            isSpectator: joinPayload.isSpectator,
            isAdmin: false,
          }
          setGameState((prev) => {
            const updated = {
              ...prev,
              players: [...prev.players, newPlayer],
            }
            gameStateRef.current = updated
            // Sync after state update
            setTimeout(() => syncStateToAll(), 50)
            return updated
          })
          break
        }
        case 'vote': {
          const votePayload = data.payload as VotePayload
          setGameState((prev) => {
            const updated = {
              ...prev,
              players: prev.players.map((p) =>
                p.id === votePayload.playerId
                  ? { ...p, vote: votePayload.vote }
                  : p
              ),
            }
            gameStateRef.current = updated
            setTimeout(() => syncStateToAll(), 50)
            return updated
          })
          break
        }
      }
    },
    [syncStateToAll]
  )

  // Admin: create a new room
  const createRoom = useCallback(
    (adminName: string, isSpectator: boolean) => {
      const roomId = generateRoomId()
      const peerId = PEER_PREFIX + roomId

      const newPeer = new Peer(peerId)

      newPeer.on('open', (id) => {
        const adminPlayer: Player = {
          id,
          name: adminName,
          vote: null,
          isSpectator,
          isAdmin: true,
        }
        isAdminRef.current = true
        setMyPlayerId(id)
        setGameState({
          roomId,
          players: [adminPlayer],
          isRevealed: false,
          isVotingActive: true,
        })
        setIsConnected(true)
        setError(null)
      })

      newPeer.on('connection', (conn) => {
        conn.on('open', () => {
          connectionsRef.current.set(conn.peer, conn)
        })

        conn.on('data', (data) => {
          handleAdminData(data as PeerMessage, conn.peer)
        })

        conn.on('close', () => {
          connectionsRef.current.delete(conn.peer)
          setGameState((prev) => {
            const updated = {
              ...prev,
              players: prev.players.filter((p) => p.id !== conn.peer),
            }
            gameStateRef.current = updated
            setTimeout(() => syncStateToAll(), 50)
            return updated
          })
        })
      })

      newPeer.on('error', (err) => {
        setError(`Connection error: ${err.message}`)
      })

      setPeer(newPeer)
    },
    [handleAdminData, syncStateToAll]
  )

  // Player: join an existing room
  const joinRoom = useCallback(
    (roomId: string, playerName: string, isSpectator: boolean) => {
      const hostPeerId = PEER_PREFIX + roomId.toUpperCase()
      const newPeer = new Peer()

      newPeer.on('open', (id) => {
        setMyPlayerId(id)
        const conn = newPeer.connect(hostPeerId, { reliable: true })

        conn.on('open', () => {
          connectionsRef.current.set(hostPeerId, conn)
          // Send join message
          const joinMessage: PeerMessage = {
            type: 'join',
            payload: { name: playerName, isSpectator } as JoinPayload,
          }
          conn.send(joinMessage)
          setIsConnected(true)
          setError(null)
        })

        conn.on('data', (data) => {
          const message = data as PeerMessage
          if (message.type === 'state-sync') {
            const syncPayload = message.payload as StateSyncPayload
            setGameState(syncPayload.gameState)
          }
        })

        conn.on('close', () => {
          setIsConnected(false)
          setError('Disconnected from the room')
        })
      })

      newPeer.on('error', (err) => {
        if (err.type === 'peer-unavailable') {
          setError('Room not found. Please check the room code.')
        } else {
          setError(`Connection error: ${err.message}`)
        }
      })

      setPeer(newPeer)
    },
    []
  )

  // Submit a vote (works for both admin and player)
  const submitVote = useCallback(
    (vote: number | null) => {
      if (isAdminRef.current) {
        // Admin updates local state directly
        setGameState((prev) => {
          const updated = {
            ...prev,
            players: prev.players.map((p) =>
              p.id === myPlayerId ? { ...p, vote } : p
            ),
          }
          gameStateRef.current = updated
          setTimeout(() => syncStateToAll(), 50)
          return updated
        })
      } else {
        // Player sends vote to admin
        const message: PeerMessage = {
          type: 'vote',
          payload: { playerId: myPlayerId, vote } as VotePayload,
        }
        connectionsRef.current.forEach((conn) => {
          if (conn.open) conn.send(message)
        })
      }
    },
    [myPlayerId, syncStateToAll]
  )

  // Admin: reveal all cards
  const revealCards = useCallback(() => {
    if (!isAdminRef.current) return
    setGameState((prev) => {
      const updated = { ...prev, isRevealed: true }
      gameStateRef.current = updated
      setTimeout(() => syncStateToAll(), 50)
      return updated
    })
  }, [syncStateToAll])

  // Admin: reset voting (vote again)
  const resetVoting = useCallback(() => {
    if (!isAdminRef.current) return
    setGameState((prev) => {
      const updated = {
        ...prev,
        isRevealed: false,
        isVotingActive: true,
        players: prev.players.map((p) => ({ ...p, vote: null })),
      }
      gameStateRef.current = updated
      setTimeout(() => syncStateToAll(), 50)
      return updated
    })
  }, [syncStateToAll])

  // Admin: start a new game (clears all players except admin)
  const startNewGame = useCallback(() => {
    if (!isAdminRef.current) return
    setGameState((prev) => {
      const updated = {
        ...prev,
        isRevealed: false,
        isVotingActive: true,
        players: prev.players.map((p) => ({ ...p, vote: null })),
      }
      gameStateRef.current = updated
      setTimeout(() => syncStateToAll(), 50)
      return updated
    })
  }, [syncStateToAll])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      connectionsRef.current.forEach((conn) => conn.close())
      peer?.destroy()
    }
  }, [peer])

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
