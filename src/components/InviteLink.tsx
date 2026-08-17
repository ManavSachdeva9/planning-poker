import { useState } from 'react'
import { useGame } from '../context/GameContext'

export function InviteLink() {
  const { gameState } = useGame()
  const [copied, setCopied] = useState(false)

  const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${gameState.roomId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for non-HTTPS environments
      const textArea = document.createElement('textarea')
      textArea.value = inviteUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="w-full bg-slate-700/50 rounded-xl border border-slate-600 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-300 text-sm font-medium">Invite Players</h3>
        <span className="text-slate-400 text-xs font-mono">Room: {gameState.roomId}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inviteUrl}
          readOnly
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 text-sm font-mono focus:outline-none"
          aria-label="Invite link"
        />
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
    </div>
  )
}
