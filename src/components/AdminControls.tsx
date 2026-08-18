import { useState } from 'react'
import { useGame } from '../context/GameContext'

export function AdminControls() {
  const { gameState, myPlayerId, revealCards, resetVoting, startNewGame } = useGame()
  const [showNewGameInput, setShowNewGameInput] = useState(false)
  const [newJiraUrl, setNewJiraUrl] = useState('')

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId)
  if (!myPlayer?.isAdmin) return null

  const votingPlayers = gameState.players.filter((p) => !p.isSpectator)
  const votedCount = votingPlayers.filter((p) => typeof p.vote === 'number').length
  const allVoted = votingPlayers.length > 0 && votedCount === votingPlayers.length

  const handleNewGame = () => {
    startNewGame(newJiraUrl.trim())
    setNewJiraUrl('')
    setShowNewGameInput(false)
  }

  return (
    <div className="w-full space-y-3">
      <h3 className="text-slate-300 text-sm font-medium">Admin Controls</h3>

      {!gameState.isRevealed && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>
            {votedCount}/{votingPlayers.length} voted
          </span>
          {allVoted && (
            <span className="text-green-400 font-medium">— All votes in!</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!gameState.isRevealed && (
          <button
            onClick={revealCards}
            disabled={votedCount === 0}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
              votedCount === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            🎴 Reveal Cards
          </button>
        )}

        {gameState.isRevealed && (
          <button
            onClick={resetVoting}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            🔄 Vote Again
          </button>
        )}

        <button
          onClick={() => setShowNewGameInput(true)}
          className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          🆕 New Game
        </button>
      </div>

      {showNewGameInput && (
        <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600 space-y-3">
          <label htmlFor="newJiraUrl" className="block text-sm font-medium text-slate-300">
            Jira Ticket URL for next story <span className="text-slate-500">(optional)</span>
          </label>
          <input
            id="newJiraUrl"
            type="url"
            value={newJiraUrl}
            onChange={(e) => setNewJiraUrl(e.target.value)}
            placeholder="https://jira-ext.digitalaviationservices.com/browse/DABM-12345"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleNewGame}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors duration-200"
            >
              Start New Game
            </button>
            <button
              onClick={() => { setShowNewGameInput(false); setNewJiraUrl('') }}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-300 font-medium rounded-lg text-sm transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
