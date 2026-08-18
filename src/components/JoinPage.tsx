import { useState } from 'react'
import { useGame } from '../context/GameContext'

interface JoinPageProps {
  roomId: string
  onJoined: () => void
}

export function JoinPage({ roomId, onJoined }: JoinPageProps) {
  const [playerName, setPlayerName] = useState('')
  const { joinRoom, error } = useGame()

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim()) return
    joinRoom(roomId, playerName.trim(), false)
    onJoined()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-[30px] font-bold text-white mb-2 whitespace-nowrap">🃏 Boeing Planning Poker</h1>
          <p className="text-slate-400">Join the estimation session</p>
          <div className="mt-4 px-4 py-2 bg-slate-700 rounded-lg inline-block">
            <span className="text-slate-400 text-sm">Room Code: </span>
            <span className="text-white font-mono font-bold text-lg">{roomId}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-slate-300 mb-2">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  )
}
