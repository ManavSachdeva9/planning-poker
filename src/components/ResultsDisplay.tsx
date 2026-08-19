import { useGame } from '../context/GameContext'

export function ResultsDisplay() {
  const { gameState } = useGame()

  if (!gameState.isRevealed) return null

  const votingPlayers = gameState.players.filter(
    (p) => !p.isSpectator && p.vote !== null && p.vote !== undefined && p.vote !== false
  )

  if (votingPlayers.length === 0) return null

  // Count votes
  const voteCounts = new Map<number, number>()
  votingPlayers.forEach((p) => {
    if (typeof p.vote === 'number') {
      voteCounts.set(p.vote, (voteCounts.get(p.vote) || 0) + 1)
    }
  })

  // Find the highest voted number (most common)
  let maxCount = 0
  let finalEstimate: number | null = null
  voteCounts.forEach((count, vote) => {
    if (count > maxCount || (count === maxCount && finalEstimate !== null && vote > finalEstimate)) {
      maxCount = count
      finalEstimate = vote
    }
  })

  // Check for tie or no clear winner (only when more than 1 voter)
  const isTie = votingPlayers.length > 1 &&
    Array.from(voteCounts.values()).filter((count) => count === maxCount).length > 1

  // Check if no number got majority (all votes are different — no number has more than 1 vote)
  const noConsensus = votingPlayers.length > 1 && maxCount === 1

  const needsRevote = isTie || noConsensus

  // Calculate average
  const sum = votingPlayers.reduce((acc, p) => acc + (typeof p.vote === 'number' ? p.vote : 0), 0)
  const average = (sum / votingPlayers.length).toFixed(1)

  // Sort votes for distribution display
  const sortedVotes = Array.from(voteCounts.entries()).sort((a, b) => a[0] - b[0])

  return (
    <div className="w-full bg-slate-700/50 rounded-xl border border-slate-600 p-5">
      <h3 className="text-white font-semibold mb-4 text-center text-lg">
        📊 Results
      </h3>

      {/* Final Estimate */}
      <div className="text-center mb-5">
        {needsRevote ? (
          <div className="inline-block bg-amber-600 text-white px-6 py-3 rounded-xl">
            <span className="text-sm block text-amber-200">No Consensus</span>
            <span className="text-xl font-bold">{isTie ? 'Tie — Vote Again' : 'No clear winner — Vote Again'}</span>
          </div>
        ) : (
          <div className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl">
            <span className="text-sm block text-green-200">Final Estimate (Highest Voted)</span>
            <span className="text-3xl font-bold">{finalEstimate}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <span className="text-slate-400 text-xs block">Average</span>
          <span className="text-white font-bold text-lg">{average}</span>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <span className="text-slate-400 text-xs block">Total Voters</span>
          <span className="text-white font-bold text-lg">{votingPlayers.length}</span>
        </div>
      </div>

      {/* Vote Distribution */}
      <div className="space-y-2">
        <span className="text-slate-400 text-xs">Vote Distribution</span>
        {sortedVotes.map(([vote, count]) => (
          <div key={vote} className="flex items-center gap-2">
            <span className="w-8 text-right text-white font-mono font-bold">{vote}</span>
            <div className="flex-1 bg-slate-800 rounded-full h-6 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                style={{
                  width: `${(count / votingPlayers.length) * 100}%`,
                  minWidth: '2rem',
                }}
              >
                <span className="text-white text-xs font-medium">{count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
