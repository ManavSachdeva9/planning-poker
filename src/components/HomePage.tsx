import { useState } from 'react'
import { useGame } from '../context/GameContext'

const ADMIN_SECRET = 'BoeingPokerAdmin'

interface HomePageProps {
  onRoomCreated: () => void
}

export function HomePage({ onRoomCreated }: HomePageProps) {
  const [adminName, setAdminName] = useState('')
  const [isSpectator, setIsSpectator] = useState(false)
  const [secretCode, setSecretCode] = useState('')
  const [secretError, setSecretError] = useState('')
  const { createRoom } = useGame()

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminName.trim()) return

    if (secretCode !== ADMIN_SECRET) {
      setSecretError('Invalid secret code. Access denied.')
      return
    }
    setSecretError('')

    createRoom(adminName.trim(), isSpectator)
    onRoomCreated()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 whitespace-nowrap">🃏 Boeing Planning Poker</h1>
          <p className="text-slate-400">Estimate stories together with your team</p>
        </div>

        {secretError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {secretError}
          </div>
        )}

        <form onSubmit={handleCreateRoom} className="space-y-6">
          <div>
            <label htmlFor="adminName" className="block text-sm font-medium text-slate-300 mb-2">
              Your Name
            </label>
            <input
              id="adminName"
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="secretCode" className="block text-sm font-medium text-slate-300 mb-2">
              Admin Secret Code
            </label>
            <input
              id="secretCode"
              type="password"
              value={secretCode}
              onChange={(e) => { setSecretCode(e.target.value); setSecretError('') }}
              placeholder="Enter admin secret code"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="spectator"
              type="checkbox"
              checked={isSpectator}
              onChange={(e) => setIsSpectator(e.target.checked)}
              className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="spectator" className="text-sm text-slate-300">
              Join as Spectator (won't vote)
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Start New Game
          </button>
        </form>
      </div>
    </div>
  )
}
