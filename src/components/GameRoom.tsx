import { useGame } from '../context/GameContext'
import { CardSelector } from './CardSelector'
import { PlayerList } from './PlayerList'
import { AdminControls } from './AdminControls'
import { ResultsDisplay } from './ResultsDisplay'
import { InviteLink } from './InviteLink'

export function GameRoom() {
  const { gameState, isConnected, error, myPlayerId } = useGame()

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId)

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700 text-center">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
              <span className="text-2xl">🔌</span>
            </div>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Connecting...</h2>
          <p className="text-slate-400">Setting up peer-to-peer connection</p>
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white whitespace-nowrap">🃏 Boeing Planning Poker</h1>
              <p className="text-slate-400 text-sm mt-1">
                {gameState.isRevealed
                  ? 'Cards revealed — review the results below'
                  : gameState.isVotingActive
                  ? 'Voting in progress — select your estimate'
                  : 'Waiting for admin to start voting'}
              </p>
              {gameState.jiraTicketId && (
                <div className="mt-2">
                  <a
                    href={gameState.jiraUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-900/40 border border-blue-700 rounded-md text-blue-300 text-sm hover:bg-blue-900/60 transition-colors"
                  >
                    🎫 <span className="font-mono font-semibold">{gameState.jiraTicketId}</span>
                  </a>
                </div>
              )}
            </div>
            {myPlayer && (
              <div className="text-right">
                <p className="text-white font-medium">{myPlayer.name}</p>
                <p className="text-xs text-slate-400">
                  {myPlayer.isAdmin ? '👑 Admin' : myPlayer.isSpectator ? '👁️ Spectator' : '🎯 Voter'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Invite Link (Admin only) */}
        {myPlayer?.isAdmin && <InviteLink />}

        {/* Card Selector */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
          {gameState.isRevealed ? (
            <ResultsDisplay />
          ) : (
            <CardSelector />
          )}
        </div>

        {/* Admin Controls */}
        {myPlayer?.isAdmin && (
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
            <AdminControls />
          </div>
        )}

        {/* Player List */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
          <PlayerList />
        </div>
      </div>
    </div>
  )
}
