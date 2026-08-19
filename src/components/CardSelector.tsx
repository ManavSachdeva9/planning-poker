import { FIBONACCI_SEQUENCE } from '../types'
import { useGame } from '../context/GameContext'

export function CardSelector() {
  const { gameState, myPlayerId, submitVote } = useGame()

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId)

  if (!myPlayer || myPlayer.isSpectator) return null
  if (gameState.isRevealed) return null

  const currentVote = (myPlayer.vote !== null && myPlayer.vote !== undefined && myPlayer.vote !== false)
    ? myPlayer.vote
    : null

  const handleCardClick = (value: number | string) => {
    if (currentVote === value) {
      submitVote(null)
    } else {
      submitVote(value)
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-slate-300 text-sm font-medium mb-3 text-center">
        Choose your estimate
      </h3>
      <div className="flex flex-wrap justify-center gap-2">
        {FIBONACCI_SEQUENCE.map((value) => {
          const isSelected = currentVote === value
          return (
            <button
              key={value}
              onClick={() => handleCardClick(value)}
              className={`
                w-14 h-20 rounded-lg font-bold text-lg transition-all duration-200
                border-2 flex items-center justify-center
                ${
                  isSelected
                    ? 'bg-blue-600 border-blue-400 text-white scale-110 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-700 border-slate-600 text-slate-200 hover:border-blue-400 hover:bg-slate-600 hover:scale-105'
                }
              `}
              aria-label={`Vote ${value} story points`}
              aria-pressed={isSelected}
            >
              {value}
            </button>
          )
        })}
      </div>
      {currentVote !== null && (
        <p className="text-center text-blue-400 text-sm mt-3">
          Your vote: <span className="font-bold">{currentVote}</span> (click again to change)
        </p>
      )}
    </div>
  )
}
