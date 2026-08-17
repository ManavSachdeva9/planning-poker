import { useGame } from '../context/GameContext'

export function PlayerList() {
  const { gameState, myPlayerId } = useGame()

  return (
    <div className="w-full">
      <h3 className="text-slate-300 text-sm font-medium mb-3">
        Players ({gameState.players.filter((p) => !p.isSpectator).length} voters,{' '}
        {gameState.players.filter((p) => p.isSpectator).length} spectators)
      </h3>
      <div className="space-y-2">
        {gameState.players.map((player) => {
          const isMe = player.id === myPlayerId
          const hasVoted = player.vote !== null
          const showVote = gameState.isRevealed && !player.isSpectator

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                isMe
                  ? 'bg-blue-900/30 border-blue-700'
                  : 'bg-slate-700/50 border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    player.isAdmin
                      ? 'bg-amber-600 text-white'
                      : player.isSpectator
                      ? 'bg-slate-600 text-slate-300'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-white font-medium">
                    {player.name}
                    {isMe && <span className="text-slate-400 text-xs ml-1">(you)</span>}
                  </span>
                  <div className="flex gap-1">
                    {player.isAdmin && (
                      <span className="text-xs text-amber-400">Admin</span>
                    )}
                    {player.isSpectator && (
                      <span className="text-xs text-slate-400">Spectator</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                {player.isSpectator ? (
                  <span className="text-slate-500 text-sm">👁️</span>
                ) : showVote ? (
                  <span className="w-10 h-14 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {player.vote ?? '—'}
                  </span>
                ) : hasVoted ? (
                  <span className="w-10 h-14 bg-green-700 rounded-md flex items-center justify-center text-white text-lg">
                    ✓
                  </span>
                ) : (
                  <span className="w-10 h-14 bg-slate-600 rounded-md flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-500">
                    ?
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
