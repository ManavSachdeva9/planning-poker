import { useGame } from '../context/GameContext'

export function ResultsDisplay() {
  const { gameState } = useGame()

  if (!gameState.isRevealed) return null

  const votingPlayers = gameState.players.filter(
    (p) => !p.isSpectator && p.vote !== null && p.vote !== undefined && p.vote !== false
  )

  if (votingPlayers.length === 0) return null

  // Count ALL votes (numeric + coffee)
  const voteCounts = new Map<string, number>()
  votingPlayers.forEach((p) => {
    const voteKey = String(p.vote)
    voteCounts.set(voteKey, (voteCounts.get(voteKey) || 0) + 1)
  })

  // Find the highest voted option (most common)
  let maxCount = 0
  let finalEstimate: string | null = null
  voteCounts.forEach((count, vote) => {
    if (count > maxCount) {
      maxCount = count
      finalEstimate = vote
    } else if (count === maxCount && finalEstimate !== null) {
      // On tie, prefer the higher numeric value
      const currentNum = Number(finalEstimate)
      const newNum = Number(vote)
      if (!isNaN(newNum) && !isNaN(currentNum) && newNum > currentNum) {
        finalEstimate = vote
      }
    }
  })

  // Check for tie or no clear winner (only when more than 1 voter)
  // noConsensus: all votes are different (every option has exactly 1 vote)
  const noConsensus = votingPlayers.length > 1 && maxCount === 1

  // isTie: two or more options share the highest vote count (but not all unique)
  const isTie = !noConsensus && votingPlayers.length > 1 &&
    Array.from(voteCounts.values()).filter((count) => count === maxCount).length > 1

  const needsRevote = isTie || noConsensus

  // Check if coffee won
  const coffeeWon = !needsRevote && finalEstimate === '☕'

  // Calculate average (only numeric votes)
  const numericVoters = votingPlayers.filter((p) => typeof p.vote === 'number')
  const sum = numericVoters.reduce((acc, p) => acc + (typeof p.vote === 'number' ? p.vote : 0), 0)
  const average = numericVoters.length > 0 ? (sum / numericVoters.length).toFixed(1) : '—'

  // Sort votes for distribution display (numbers first sorted, then coffee at end)
  const sortedVotes = Array.from(voteCounts.entries()).sort((a, b) => {
    const aNum = Number(a[0])
    const bNum = Number(b[0])
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
    if (!isNaN(aNum)) return -1
    if (!isNaN(bNum)) return 1
    return 0
  })

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
        ) : coffeeWon ? (
          <div className="inline-block bg-amber-700 text-white px-6 py-3 rounded-xl">
            <span className="text-sm block text-amber-200">Team Decision</span>
            <span className="text-3xl font-bold">☕ Coffee Break!</span>
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
          <span className="text-slate-400 text-xs block">Average (numeric)</span>
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
                className={`h-full rounded-full flex items-center justify-end pr-2 ${
                  vote === '☕' ? 'bg-amber-600' : 'bg-blue-500'
                }`}
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
