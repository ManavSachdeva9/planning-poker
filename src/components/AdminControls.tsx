import { useGame } from '../context/GameContext'

export function AdminControls() {
  const { gameState, myPlayerId, revealCards, resetVoting, startNewGame } = useGame()

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId)
  if (!myPlayer?.isAdmin) return null

  const votingPlayers = gameState.players.filter((p) => !p.isSpectator)
  const votedCount = votingPlayers.filter((p) => p.vote !== null).length
  const allVoted = votingPlayers.length > 0 && votedCount === votingPlayers.length

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
          onClick={startNewGame}
          className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          🆕 New Game
        </button>
      </div>
    </div>
  )
}
